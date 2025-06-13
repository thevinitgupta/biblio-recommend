import Fastify from "fastify";
import dotenv from "dotenv";
import vectorRoutes from "./routes/vector";

dotenv.config();

const server = Fastify({
    logger : true
});

const serverInit = () =>  {
    const port = parseInt(process.env.SERVER_PORT || "5001") ;
    const host = process.env.SERVER_HOST || "localhost";
    return {
        port, host
    }
}

const {port : serverPort, host : serverHost} = serverInit();

server.register(vectorRoutes, {prefix : "/api/v1/vector"});

server.get("/api/v1/", (request, reply) => {
    console.log("Request Hostname : ",request.hostname)
    return JSON.stringify({
        code : 200,
        message : "Hello from Fastify"
    })
});

server.listen({
    port : serverPort,
    host : serverHost,
}, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening for requests at ${address}`)
  })
