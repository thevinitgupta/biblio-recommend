import { Queue } from "bullmq";
import getRedisConnectionData from "../connections/redis";
import { CreateVector } from "../types/vector";

let postQueue: Queue<any, any, string, any, any, string> | null = null;


const getPostQueue = () => {
    if (postQueue != null) return postQueue;
    console.log("ENV : ",process.env)
    const { BULL_POST_KEY } = process.env;
    if (!BULL_POST_KEY) {
        throw new Error("BULL_POST_KEY must be defined in environment variables.");
    }
    const redisConnectionData = getRedisConnectionData();
    return new Queue(BULL_POST_KEY, {
        connection: redisConnectionData
    });
};


const addPostToQueue = async (blogId: string) => {
    if (!blogId) {
        throw new Error("Job data must contain blog id.");
    }

    if (!postQueue) {
        postQueue = getPostQueue();
    }
    
    await postQueue.add("createPostVector", blogId, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 200000
        }
    });
}


export { getPostQueue, addPostToQueue };