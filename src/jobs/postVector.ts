import cron from "node-cron";
import { fetchPostsWithPendingVector, updateBlogVectorStatus } from "../services/blogPost";
import { getEmbedding } from "../utils/embedding";
import { upsertVector } from "../services/vectorServices";
import pLimit from "p-limit";
import { processPostForCron } from "../utils/post";
import { PostData } from "../types/post";
import { addPostToQueue } from "../services/queueServices";

const limit = pLimit(2);
export const vectorJob = cron.schedule("30 18 * * *", async () => {

    try {
        const pendingPosts = await fetchPostsWithPendingVector();
        const tasks = pendingPosts.map((pendingPost) => {
            limit(() => addPostToQueue(pendingPost.slug));
        })
        // const tasks = pendingPosts.map((pendingPost) =>
        //     limit(() => processPostForCron(pendingPost as PostData)));
        
        const results = await Promise.allSettled(tasks);
        results.forEach((res, idx) => {
            const slug = pendingPosts[idx].slug;
            if (res.status === "fulfilled") {
              console.log(`✅ Added to queue: ${slug}`);
            } else {
              console.error(`❌ Failed: ${slug}`, res.reason);
            }
          });
    } catch (error) {
        console.error("-------------------------------------------------------------------");
        console.error("Error during running cron job at:", new Date().toLocaleString())
        console.error(error);
        console.error("-------------------------------------------------------------------");
        
    }
})
