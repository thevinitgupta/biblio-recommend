import { FastifyInstance } from "fastify";
import { validateAdminCredentials } from "../security/admin";

export interface AuthConfig {
    username: string;
    password: string;
    realm?: string;
  }

export const registerBasicAuthPlugin = async (fastify : FastifyInstance, options : AuthConfig) => {
    await fastify.register(import("@fastify/basic-auth"), {
        validate: validateAdminCredentials,
        authenticate: {
            realm: options.realm || "Admin Area",
        },
    })
}