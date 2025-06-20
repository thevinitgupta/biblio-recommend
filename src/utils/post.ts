import { updateBlogVectorStatus } from "../services/blogPost";
import { upsertVector } from "../services/vectorServices";
import { PostData } from "../types/post";
import { getEmbedding } from "./embedding";
import { withTimeout } from "./withTimeout";

export const processPostForCron = async (pendingPost: PostData) => {
  try {
    if (!pendingPost?.content || pendingPost.content.length <= 20) {
      console.log("Skipping post with insufficient content:", pendingPost.slug);
      return;
    }
    console.log("Processing post:", pendingPost.slug);
    const embeddings = await withTimeout(
      getEmbedding(pendingPost.content),
      10_000,
      `Creating embedding during cron job for ${pendingPost.slug} took too long!`
    );
    if (!embeddings || embeddings.length === 0) {
      console.error(
        "Failed to generate embeddings for post:",
        pendingPost.slug
      );
      await updateBlogVectorStatus(
        pendingPost.slug,
        "pending",
        "Embedding creation for post failed after embedding creation",
        true
      );
      return;
    }
    const upsertStatus = await upsertVector(embeddings, pendingPost.slug);
    if (upsertStatus.status === "failed") {
      console.error("Failed upserting vector for post:", pendingPost.slug);
      await updateBlogVectorStatus(
        pendingPost.slug,
        pendingPost.retryCount >= 3 ? "dead" : upsertStatus.status,
        "Upserting for post failed after embedding creation",
        true
      );
    } else {
      await updateBlogVectorStatus(pendingPost.slug, "upserted", "success", false);
      console.log("Successfully upserted vector for post:", pendingPost.slug);
    }
  } catch (error) {
    console.error(
      "-------------------------------------------------------------------"
    );
    console.error(
      "Error during running cron job at:",
      new Date().toLocaleString()
    );
    console.error(error);
    console.error(
      "-------------------------------------------------------------------"
    );
  }
};
