import { FastifyReply, FastifyRequest } from "fastify";

export const validateAdminCredentials = async (
  username: string,
  password: string,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const dashboardUsername = process.env.ADMIN_ID || "admin";
    const dashboardPassword = process.env.ADMIN_PASSWORD || "password";
    
    if (username !== dashboardUsername || password !== dashboardPassword) {
        return reply.status(401).send({
            error: "Invalid credentials",
        });
    }
};
