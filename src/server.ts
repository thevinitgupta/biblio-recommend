import Fastify from "fastify";
import dotenv from "dotenv";
import vectorRoutes from "./routes/vector";
import { createBullBoard } from "@bull-board/api";
import { FastifyAdapter } from "@bull-board/fastify";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter"; 
import { getPostQueue } from "./services/queueServices";
import queueRoutes from "./routes/queue";
import startPostWorker, { shutdownPostWorker } from "./services/queueWorker";
import { adminRoutes } from "./routes/admin";
import { serverInit } from "./config/server";
import connectMongoDB from "./connections/mongodb";
import { vectorJob } from "./jobs/postVector";

dotenv.config();

const server = Fastify({
    logger : true
});


const { port: serverPort, host: serverHost, auth } = serverInit();


connectMongoDB();


server.register(adminRoutes, {
    prefix: "/admin/queues",
    auth : auth
});

server.register(vectorRoutes, { prefix: "/api/v1/vector" });
server.register(queueRoutes, { prefix: "/api/v1/queue" });

// server.get("/api/v1/", (request, reply) => {
//     console.log("Request Hostname : ",request.hostname)
//     return JSON.stringify({
//         code : 200,
//         message : "Hello from Fastify"
//     })
// }); 

server.get('/api/v1/health', async (req, reply) => {
    const secret = req.headers['x-health-secret'];
    if (secret !== process.env.HEALTH_SECRET) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    return { status: 'ok', time: new Date().toISOString() };
  });

server.listen({
    port : serverPort,
    host : serverHost,
}, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    else {
        const postWorker = startPostWorker();
        if (!postWorker) {
            console.error("Worker initialization failed.");
            return;
        }
        
        try {
            vectorJob.execute();
            postWorker.run();
        }
        catch (error) {
            console.error("Error starting worker:", error);
            process.exit(1);
        }
    }
    console.log(`Server listening for requests at ${address}`)
})
  

const shutdownServer = async () => {
    console.log("Shutting down server...");
    await shutdownPostWorker();
    console.log("Post worker shut down successfully.");
    await server.close();
    console.log("Shutdown complete.");
    process.exit(0);
}

process.on('SIGINT', shutdownServer);
process.on('SIGTERM', shutdownServer);
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    shutdownServer();
});
