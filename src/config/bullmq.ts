import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";
import { getPostQueue } from "../services/queueServices";

export const setupBullBoard = () => {
    const serverAdapter = new FastifyAdapter();
    
    serverAdapter.setBasePath("/admin/queues");
    createBullBoard({
      queues: [new BullMQAdapter(getPostQueue())],
      serverAdapter,
    });
  
    return serverAdapter;
  };