import getRedisConnectionData from "../connections/redis";
import { Job, Worker } from "bullmq";
import { fetchBlogPostContent, updateBlogVectorStatus } from "./blogPost";
import { PostData } from "../types/post";
import { getEmbedding } from "../utils/embedding";
import { upsertVector } from "./vectorServices";
import { UpsertResult } from "../types/vector";
import { withTimeout } from "../utils/withTimeout";

let postWorker: Worker | null = null;

const processQueueItem = async (job: Job): Promise<any> => {
  const { postId } = job.data;

  try {
    const postData: PostData | null = await fetchBlogPostContent(postId);
    if (!postData) throw new Error(`Post with ID ${postId} not found.`);

    const { content } = postData;
    if (!content?.trim())
      throw new Error(`Content for post ${postId} is empty.`);

    const vectorEmbeddings = await withTimeout(getEmbedding(content),10_000,`Creating embeddings for ${postId} took too long!`);
    if (!vectorEmbeddings?.length)
      throw new Error(`Failed to generate embeddings for post ${postId}.`);

    const upserted: UpsertResult = await upsertVector(vectorEmbeddings, postId);
    if (upserted.status !== "upserted")
      throw new Error(`Vector upsert failed for post ${postId}.`);

    const updatedPost = await updateBlogVectorStatus(postId, "upserted", null);

    return {
      message: `Successfully processed post ${postId}`,
      status: upserted.status,
      postData,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    await job.log(`Error: ${errMsg}`);

    try {
      await updateBlogVectorStatus(postId, "failed", errMsg);
    } catch (dbError) {
      console.error(`Failed to update post status in DB for post ${postId}:`, dbError);
    }

    return {
      message: `Error processing post ${postId}`,
      status: "failed",
      postData: null,
    };
  }
};

const startPostWorker = (): Worker => {
  if (postWorker) return postWorker; // prevent multiple instantiations

  const redisConnectionData = getRedisConnectionData();
  const { BULL_POST_KEY } = process.env;

  if (!BULL_POST_KEY) throw new Error("Missing BULL_POST_KEY in environment");

  postWorker = new Worker(BULL_POST_KEY, processQueueItem, {
    connection: redisConnectionData,
    autorun: false,
    concurrency: 1,
    
  });

  postWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed.`);
  });

  postWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
  });

  postWorker.on("error", (err) => {
    console.error("🔥 Worker-level error:", err);
  });

  return postWorker;
};

export const shutdownPostWorker = async () => {
  if (postWorker && (postWorker.isRunning() || postWorker.isPaused())) {
    await postWorker.close();
    console.log("Worker closed successfully.");
  } else {
    console.log("Worker not up");
  }
};

export default startPostWorker;
