import { FastifyPluginAsync } from "fastify";
import { CreateVector } from "../types/vector";
import { getEmbedding } from "../utils/embedding";
import { findSimilarVectors, findSimilarVectorsById, upsertVector } from "../services/vectorServices";
import { authenticateApi } from "../security/api";
import { fetchPostsWithPendingVector } from "../services/blogPost";

const vectorRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.addHook("onRequest", authenticateApi);

    // fastify.post("/create", async (request,reply) => {
    //     const {blog, id = "abscs"} = request.body as CreateVector;
    //     await fetchPostsWithPendingVector();
    //     const upsertStatus = {}; //await upsertVector(blog, id);
    //     return {
    //         error : null,
    //         message : "Created!",
    //         data : Date.now(),
    //         ...upsertStatus
    //     }
    // })

    fastify.get('/similar/:postId', async (request, reply) => {
        const { postId } = request.params as { postId: string };
        console.log("POST ID : ",postId)
        const results = await findSimilarVectorsById(postId);
        return reply.send(results);
      });
}

export default vectorRoutes;