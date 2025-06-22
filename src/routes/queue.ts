import fastify, { FastifyPluginAsync } from "fastify";
import { addPostToQueue } from "../services/queueServices";
import { authenticateApi } from "../security/api";

const queueRoutes: FastifyPluginAsync = async (fastify) => {
    
    fastify.addHook("onRequest", authenticateApi)


    fastify.post("/add", (request, reply) => {
        const { id : blogId } = request.body as { id: string };
        
        if (!blogId) {
            return reply.status(400).send({
                message: "Blog id is required",
                error: "Job data must contain blog id."
            });
        }
        addPostToQueue(blogId)
            .then(() => {
                reply.send({
                    message: "Job added to queue successfully.",
                    error : null
                });
            })
            .catch((error) => {
                reply.status(500).send({
                    message: "Failed to add job to queue.",
                    error: error.message
                });
            });
    })
}

export default queueRoutes;