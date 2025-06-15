import fastify, { FastifyPluginAsync } from "fastify";
import { addPostToQueue } from "../services/queueServices";
import { authenticateApi } from "../security/api";

const queueRoutes: FastifyPluginAsync = async (fastify) => {
    
    fastify.addHook("onRequest", authenticateApi)


    fastify.post("/add", (request, reply) => {
        const { id : blogId } = request.body as { id: string };
        
        if (!blogId) {
            return reply.status(400).send({
                error: "Job data must contain blog id."
            });
        }
        addPostToQueue(blogId)
            .then(() => {
                reply.send({
                    message: "Job added to queue successfully."
                });
            })
            .catch((error) => {
                reply.status(500).send({
                    error: error.message
                });
            });
    })
}

export default queueRoutes;