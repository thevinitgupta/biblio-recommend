import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { AuthConfig, registerBasicAuthPlugin } from "../plugins/auth";
import { setupBullBoard } from "../config/bullmq";

interface AdminRouteOptions extends FastifyPluginOptions{
    auth : AuthConfig
}

export const adminRoutes = async (fastify: FastifyInstance, options: AdminRouteOptions) => {
    await registerBasicAuthPlugin(fastify, options.auth);

    const serverAdapter = setupBullBoard();
    fastify.addHook("preHandler", fastify.basicAuth)

    await fastify.register(serverAdapter.registerPlugin());


    //admin login status (Optional)
    fastify.get('/status', async (request, reply) => {
        return {
          status: 'authenticated',
          timestamp: new Date().toISOString(),
          user: 'admin'
        };
      });

}