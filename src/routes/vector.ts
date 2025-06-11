import { FastifyPluginAsync } from "fastify";
import { CreateVector } from "../types/vector";
import { getEmbedding } from "../utils/embedding";
import { findSimilarVectors, upsertVector } from "../services/vectorServices";

const vectorRoutes : FastifyPluginAsync = async (fastify) => {
    fastify.post("/create", async (request,reply) => {
        const {blog, id = "abscs"} = request.body as CreateVector;
        console.log("Original:",blog)
        // move to service
        console.log("Upserting Text : ");
        const upsertStatus = await upsertVector(blog, id);
        console.log("Upsert Status :",upsertStatus);
        return {
            error : null,
            message : "Created!",
            data : Date.now(),
            ...upsertStatus
        }
    })

    fastify.post('/similar', async (request, reply) => {
        const { content } = request.body as { content: string };
        const results = await findSimilarVectors(content);
        return reply.send(results);
      });
}

export default vectorRoutes;