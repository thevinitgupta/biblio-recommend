import Fastify from "fastify";
import dotenv from "dotenv";
import vectorRoutes from "./routes/vector";

dotenv.config();

const server = Fastify({
    logger : true
});

server.register(vectorRoutes, {prefix : "/api/v1/vector"});

server.get("/api/v1/", (request, reply) => {
    console.log("Request Hostname : ",request.hostname)
    return JSON.stringify({
        code : 200,
        message : "Hello from Fastify"
    })
});

server.listen({
    port : 3001,
    host : "localhost",
}, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
