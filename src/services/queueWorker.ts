import getRedisConnectionData from "../connections/redis";
import { Worker } from "bullmq";


let postWorker: Worker | null = null;

const startPostWorker = () => {
    const redisConnectionData = getRedisConnectionData();
    
    const { BULL_POST_KEY } = process.env;

    postWorker = new Worker(
        BULL_POST_KEY!,
        async (job) => {
            console.log(`Processing job ${job.id} with data:`, job.data);
            
            console.log(`Job ${job.id} processed successfully.`);
        }, {
            connection: redisConnectionData,
            autorun: false,
            concurrency: 1,
        }
    )
    

    postWorker.on("completed", (job) => {
        console.log(`Job ${job.id} completed successfully.`);
    });

    postWorker.on("failed", (job, err) => {
        console.error(`Job ${job?.id} failed with error:`, err);
    });
    postWorker.on("error", (err) => {
        console.error("Worker encountered an error:", err);
    });
    
    return postWorker;
}

export const shutdownPostWorker = async () => {
    if (postWorker && (postWorker.isRunning() || postWorker.isPaused())) {
        await postWorker.close();
        console.log("Worker closed successfully.");
    }
    else {
        console.log("Worker not up")
    }
}

export default startPostWorker;