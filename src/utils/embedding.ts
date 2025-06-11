import { pipeline, PipelineType, env, FeatureExtractionPipeline } from '@xenova/transformers';

// Optional: disable telemetry
env.allowRemoteModels = true; // Set to false to disable auto model downloading

let embedder: FeatureExtractionPipeline | null = null;

/**
 * Loads and caches the embedding model on first call.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!embedder) {
    console.log('Loading embedding model...');
    embedder = await pipeline('feature-extraction', 'Xenova/bge-small-en');
    console.log('Model loaded!');
  }

  const result = await embedder(text, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(result.data);
}