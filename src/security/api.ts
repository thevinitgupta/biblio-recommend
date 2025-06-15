import { FastifyReply, FastifyRequest } from "fastify";

const _validateToken = (token: string) => {
  const { API_ACCESS_TOKEN } = process.env;
  if (!API_ACCESS_TOKEN) {
    throw new Error("API access token is not set in environment variables.");
  }

  return token === API_ACCESS_TOKEN;
};

export const authenticateApi = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authToken = request.headers["x-auth-token"]?.toString() || "";
    if (!authToken || !_validateToken(authToken)) {
      return reply.code(401).send("Invalid Token");
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return reply.code(500).send("Internal Server Error");
  }
};
