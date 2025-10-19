import OpenAI from 'openai';
import { logger } from '../logger';

// Initialize OpenAI client only if API key is provided
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

/**
 * Generate embeddings for a given text using OpenAI's text-embedding-3-small model
 * Returns a 1536-dimensional vector
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    if (!openai) {
      logger.warn('OpenAI API key not configured, skipping embedding generation');
      return null;
    }

    if (!text || text.trim().length === 0) {
      logger.warn('Attempted to generate embedding for empty text');
      return null;
    }

    // Truncate text if too long (OpenAI has token limits)
    const maxLength = 8000; // ~8000 characters ≈ 2000 tokens
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: truncatedText,
      encoding_format: 'float',
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding) {
      logger.error('OpenAI returned empty embedding');
      return null;
    }

    return embedding;
  } catch (error) {
    logger.error('Failed to generate embedding:', error);
    return null;
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * More efficient than calling generateEmbedding multiple times
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<(number[] | null)[]> {
  try {
    if (!openai) {
      logger.warn('OpenAI API key not configured, skipping batch embedding generation');
      return texts.map(() => null);
    }

    if (!texts || texts.length === 0) {
      return [];
    }

    // Filter out empty strings
    const validTexts = texts.map(t => t?.trim()).filter(t => t && t.length > 0);

    if (validTexts.length === 0) {
      return texts.map(() => null);
    }

    // Truncate each text
    const maxLength = 8000;
    const truncatedTexts = validTexts.map(text =>
      text.length > maxLength ? text.substring(0, maxLength) : text
    );

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: truncatedTexts,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    logger.error('Failed to generate embeddings batch:', error);
    return texts.map(() => null);
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 * Returns a value between -1 and 1, where 1 means identical
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate cosine distance (used for pgvector <=> operator)
 * Distance = 1 - similarity
 * Smaller distance = more similar
 */
export function cosineDistance(a: number[], b: number[]): number {
  return 1 - cosineSimilarity(a, b);
}

/**
 * Prepare text for embedding by combining multiple fields
 * Useful for threads and items with title, description, metadata
 */
export function prepareTextForEmbedding(fields: {
  title?: string | null;
  description?: string | null;
  additionalContext?: string | null;
}): string {
  const parts = [
    fields.title,
    fields.description,
    fields.additionalContext,
  ].filter(Boolean);

  return parts.join(' | ');
}

/**
 * Convert embedding array to pgvector string format
 * Example: [0.1, 0.2, 0.3] => "[0.1,0.2,0.3]"
 */
export function embeddingToVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Parse pgvector string back to number array
 * Example: "[0.1,0.2,0.3]" => [0.1, 0.2, 0.3]
 */
export function vectorToEmbedding(vector: string): number[] {
  return vector.replace(/^\[|\]$/g, '').split(',').map(Number);
}
