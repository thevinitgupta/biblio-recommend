import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbedding } from "../utils/embedding";

const createPineconeInstance = () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
  return { index };
};

export async function upsertVector(content: string, id: string) {
  try {
    const { index } = createPineconeInstance();

    const embeddings = await getEmbedding(content);
    await index.upsert([
      {
        id,
        values: embeddings,
      },
    ]);
    return {
      status: "upserted",
      id,
    };
  } catch (error) {
    console.log("Error while upserting :", error);
    return {
      status: "upsert failed",
      id: null,
    };
  }
}

export async function findSimilarVectors(content: string) {
  try {
    const { index } = createPineconeInstance();
    const embedding = await getEmbedding(content);
    const queryResult = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: false,
    });
    // return post ids
    return queryResult.matches?.map((match) => match.id);
  } catch (error) {
    console.log("Error while searching :", error);
    return {
      status: "search failed",
      id: null,
    };
  }
}
