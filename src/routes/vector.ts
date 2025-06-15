import { FastifyPluginAsync } from "fastify";
import { CreateVector } from "../types/vector";
import { getEmbedding } from "../utils/embedding";
import { findSimilarVectors, upsertVector } from "../services/vectorServices";
import { authenticateApi } from "../security/api";

const vectorRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.addHook("onRequest", authenticateApi);

    fastify.post("/create", async (request,reply) => {
        const {blog, id = "abscs"} = request.body as CreateVector;
        
        const upsertStatus = await upsertVector(blog, id);
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