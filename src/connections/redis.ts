import { Queue, QueueOptions } from "bullmq";
import { RedisConnectionDataI } from "../types/redis";


const getRedisConnectionData = () : RedisConnectionDataI => {

    const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } = process.env;
    
    if (!REDIS_HOST || !REDIS_PORT) {
        throw new Error("Redis host and port must be defined in environment variables.");
    }

    if (!REDIS_PASSWORD) {
        throw new Error("Redis Password Not Defined")
    }

    return {
        host: REDIS_HOST,
        port: parseInt(REDIS_PORT, 10),
        password : REDIS_PASSWORD || ""
    };
}


export default getRedisConnectionData;