import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbedding } from "../utils/embedding";
import { UpsertResult } from "../types/vector";
import { SearchResponseDataI, SearchResponseI } from "../types/response";



const createPineconeInstance = () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
  return { index };
};

export async function upsertVector(embeddings: number[], id: string) : Promise<UpsertResult> {
  try {
    const { index } = createPineconeInstance();

    // const embeddings = await getEmbedding(content);
    await index.upsert([
      {
        id,
        values: embeddings,
      },
    ]);
    console.log("Upserted vector with ID:", id);
    return {
      status: "upserted",
      id,
    };
  } catch (error) {
    console.log("Error while upserting :", error);
    return {
      status: "failed",
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


// searching with ID instead of vector
export async function findSimilarVectorsById(id: string) : Promise<SearchResponseI> {
  try {
    const { index } = createPineconeInstance();
    const queryResult = await index.query({
      id,
      topK: 6,
      includeMetadata: false,
      includeValues : false,
    });
    const responseData : Array<SearchResponseDataI> = queryResult.matches?.sort((match) => match.score || 0).map((match) => {
      
        return {
          id: match.id,
          score: match.score || 0,
        }
      
    }).filter((match) => match.id != id);
    
    return {
      data: responseData,
      error: null,
    }
  } catch (error) {
    console.log(`Error while searching for ID=:${id} ==========> ${error}`);
    return {
      error: "search failed : "+error,
      data: [],
    };
  }
}
