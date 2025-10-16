import { prisma } from '../prisma';
import { generateEmbedding } from './embeddings';
import { logger } from '../logger';
import { Prisma } from '@prisma/client';

/**
 * Enterprise-grade semantic search service
 * Handles vector similarity search with fallback to keyword search
 */

export interface SemanticSearchOptions {
  type?: 'threads' | 'items' | 'both';
  limit?: number;
  threshold?: number; // Cosine distance threshold (0.0 = identical, 2.0 = opposite)
  organizationId: string;
  filters?: {
    integration?: string;
    dateRange?: {
      from?: Date;
      to?: Date;
    };
    threadId?: string;
    status?: string;
  };
}

export interface SemanticSearchResult {
  threads: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    similarity: number; // 0-1 scale (1 = most similar)
    creator?: {
      id: string;
      fullName: string | null;
      avatarUrl: string | null;
    };
    _count?: {
      connectedItems: number;
      comments: number;
    };
  }>;
  items: Array<{
    id: string;
    title: string | null;
    description: string | null;
    integrationType: string;
    externalUrl: string | null;
    createdAt: Date;
    similarity: number;
    thread?: {
      id: string;
      title: string;
    };
    creator?: {
      id: string;
      fullName: string | null;
      avatarUrl: string | null;
    };
  }>;
  metadata: {
    query: string;
    resultsCount: number;
    searchType: 'semantic' | 'keyword' | 'hybrid';
    executionTimeMs: number;
  };
}

/**
 * Perform semantic search across threads and/or items
 * Falls back to keyword search if embedding generation fails
 */
export async function semanticSearch(
  query: string,
  options: SemanticSearchOptions
): Promise<SemanticSearchResult> {
  const startTime = Date.now();
  const limit = options.limit ?? 20;
  const threshold = options.threshold ?? 0.5; // 0.5 = moderate similarity required
  const searchType = options.type ?? 'both';

  try {
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    if (!queryEmbedding) {
      logger.warn('Semantic search: embedding generation failed, falling back to keyword search');
      return await keywordSearch(query, options, startTime);
    }

    // Convert embedding to pgvector format
    const vectorString = `[${queryEmbedding.join(',')}]`;

    // Perform vector similarity search
    const [threads, items] = await Promise.all([
      searchType === 'items' ? Promise.resolve([]) : searchThreads(vectorString, options, limit, threshold),
      searchType === 'threads' ? Promise.resolve([]) : searchItems(vectorString, options, limit, threshold),
    ]);

    const executionTimeMs = Date.now() - startTime;

    logger.info('Semantic search completed', {
      query,
      resultsCount: threads.length + items.length,
      executionTimeMs,
    });

    return {
      threads,
      items,
      metadata: {
        query,
        resultsCount: threads.length + items.length,
        searchType: 'semantic',
        executionTimeMs,
      },
    };
  } catch (error) {
    logger.error('Semantic search failed, falling back to keyword search', { error, query });
    return await keywordSearch(query, options, startTime);
  }
}

/**
 * Search threads using vector similarity
 */
async function searchThreads(
  vectorString: string,
  options: SemanticSearchOptions,
  limit: number,
  threshold: number
) {
  try {
    // Build WHERE clause for filters
    const whereConditions: string[] = [
      `organization_id = '${options.organizationId}'`,
      'deleted_at IS NULL',
      'embedding IS NOT NULL',
      `embedding <=> '${vectorString}'::vector < ${threshold}`,
    ];

    if (options.filters?.status) {
      whereConditions.push(`status = '${options.filters.status}'`);
    }

    if (options.filters?.dateRange?.from) {
      whereConditions.push(`created_at >= '${options.filters.dateRange.from.toISOString()}'`);
    }

    if (options.filters?.dateRange?.to) {
      whereConditions.push(`created_at <= '${options.filters.dateRange.to.toISOString()}'`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Use raw SQL for vector similarity search (pgvector <=> operator)
    const results = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT
        gt.id,
        gt.title,
        gt.description,
        gt.status,
        gt.created_at as "createdAt",
        gt.created_by as "createdBy",
        1 - (gt.embedding <=> '${vectorString}'::vector) as similarity,
        (
          SELECT COUNT(*) FROM connected_items ci
          WHERE ci.thread_id = gt.id AND ci.deleted_at IS NULL
        ) as "connectedItemsCount",
        (
          SELECT COUNT(*) FROM comments c
          WHERE c.thread_id = gt.id AND c.is_deleted = false
        ) as "commentsCount"
      FROM golden_threads gt
      WHERE ${whereClause}
      ORDER BY gt.embedding <=> '${vectorString}'::vector
      LIMIT ${limit}
    `);

    // Fetch creator details separately for security (avoid SQL injection)
    const threadsWithCreators = await Promise.all(
      results.map(async (thread) => {
        const creator = await prisma.user.findUnique({
          where: { id: thread.createdBy },
          select: { id: true, fullName: true, avatarUrl: true },
        });

        return {
          id: thread.id,
          title: thread.title,
          description: thread.description,
          status: thread.status,
          createdAt: thread.createdAt,
          similarity: Number(thread.similarity),
          creator: creator || undefined,
          _count: {
            connectedItems: Number(thread.connectedItemsCount),
            comments: Number(thread.commentsCount),
          },
        };
      })
    );

    return threadsWithCreators;
  } catch (error) {
    logger.error('Thread vector search failed', { error });
    return [];
  }
}

/**
 * Search items using vector similarity
 */
async function searchItems(
  vectorString: string,
  options: SemanticSearchOptions,
  limit: number,
  threshold: number
) {
  try {
    const whereConditions: string[] = [
      `organization_id = '${options.organizationId}'`,
      'deleted_at IS NULL',
      'embedding IS NOT NULL',
      `embedding <=> '${vectorString}'::vector < ${threshold}`,
    ];

    if (options.filters?.integration) {
      whereConditions.push(`integration_type = '${options.filters.integration}'`);
    }

    if (options.filters?.threadId) {
      whereConditions.push(`thread_id = '${options.filters.threadId}'`);
    }

    const whereClause = whereConditions.join(' AND ');

    const results = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT
        ci.id,
        ci.title,
        ci.description,
        ci.integration_type as "integrationType",
        ci.external_url as "externalUrl",
        ci.created_at as "createdAt",
        ci.created_by as "createdBy",
        ci.thread_id as "threadId",
        1 - (ci.embedding <=> '${vectorString}'::vector) as similarity
      FROM connected_items ci
      WHERE ${whereClause}
      ORDER BY ci.embedding <=> '${vectorString}'::vector
      LIMIT ${limit}
    `);

    // Fetch related data
    const itemsWithDetails = await Promise.all(
      results.map(async (item) => {
        const [creator, thread] = await Promise.all([
          prisma.user.findUnique({
            where: { id: item.createdBy },
            select: { id: true, fullName: true, avatarUrl: true },
          }),
          item.threadId
            ? prisma.goldenThread.findUnique({
                where: { id: item.threadId },
                select: { id: true, title: true },
              })
            : Promise.resolve(null),
        ]);

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          integrationType: item.integrationType,
          externalUrl: item.externalUrl,
          createdAt: item.createdAt,
          similarity: Number(item.similarity),
          creator: creator || undefined,
          thread: thread || undefined,
        };
      })
    );

    return itemsWithDetails;
  } catch (error) {
    logger.error('Item vector search failed', { error });
    return [];
  }
}

/**
 * Fallback keyword search when semantic search fails
 */
async function keywordSearch(
  query: string,
  options: SemanticSearchOptions,
  startTime: number
): Promise<SemanticSearchResult> {
  const limit = options.limit ?? 20;
  const searchType = options.type ?? 'both';

  try {
    const [threads, items] = await Promise.all([
      searchType === 'items'
        ? Promise.resolve([])
        : prisma.goldenThread.findMany({
            where: {
              organizationId: options.organizationId,
              deletedAt: null,
              status: options.filters?.status,
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: Math.floor(limit / 2),
            orderBy: { lastActivityAt: 'desc' },
            include: {
              creator: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
              _count: {
                select: { connectedItems: true, comments: true },
              },
            },
          }),
      searchType === 'threads'
        ? Promise.resolve([])
        : prisma.connectedItem.findMany({
            where: {
              organizationId: options.organizationId,
              deletedAt: null,
              integrationType: options.filters?.integration,
              threadId: options.filters?.threadId,
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: Math.floor(limit / 2),
            orderBy: { createdAt: 'desc' },
            include: {
              creator: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
              thread: {
                select: { id: true, title: true },
              },
            },
          }),
    ]);

    const executionTimeMs = Date.now() - startTime;

    return {
      threads: threads.map((t) => ({ ...t, similarity: 0 })),
      items: items.map((i) => ({ ...i, similarity: 0 })),
      metadata: {
        query,
        resultsCount: threads.length + items.length,
        searchType: 'keyword',
        executionTimeMs,
      },
    };
  } catch (error) {
    logger.error('Keyword search failed', { error, query });
    return {
      threads: [],
      items: [],
      metadata: {
        query,
        resultsCount: 0,
        searchType: 'keyword',
        executionTimeMs: Date.now() - startTime,
      },
    };
  }
}

/**
 * Find items/threads related to a specific thread
 * Used for "Related Threads" and "You might also like" features
 */
export async function findRelatedContent(
  threadId: string,
  organizationId: string,
  options: {
    limit?: number;
    threshold?: number;
  } = {}
): Promise<{
  relatedThreads: Array<{
    id: string;
    title: string;
    status: string;
    similarity: number;
    _count: { connectedItems: number };
  }>;
  relatedItems: Array<{
    id: string;
    title: string | null;
    integrationType: string;
    similarity: number;
    thread?: { id: string; title: string };
  }>;
}> {
  const limit = options.limit ?? 10;
  const threshold = options.threshold ?? 0.3; // Higher threshold for "related" (more similar)

  try {
    // Get current thread's embedding (raw query since Prisma doesn't support vector type)
    const threadResult = await prisma.$queryRawUnsafe<Array<{ embedding: string }>>(`
      SELECT embedding::text as embedding
      FROM golden_threads
      WHERE id = '${threadId}'
    `);

    if (!threadResult?.[0]?.embedding) {
      logger.warn('Thread has no embedding, cannot find related content', { threadId });
      return { relatedThreads: [], relatedItems: [] };
    }

    const vectorString = threadResult[0].embedding;

    // Find similar threads (excluding current one)
    const relatedThreads = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT
        id,
        title,
        status,
        1 - (embedding <=> '${vectorString}'::vector) as similarity,
        (
          SELECT COUNT(*) FROM connected_items ci
          WHERE ci.thread_id = golden_threads.id AND ci.deleted_at IS NULL
        ) as "connectedItemsCount"
      FROM golden_threads
      WHERE id != '${threadId}'
        AND organization_id = '${organizationId}'
        AND deleted_at IS NULL
        AND embedding IS NOT NULL
        AND embedding <=> '${vectorString}'::vector < ${threshold}
      ORDER BY embedding <=> '${vectorString}'::vector
      LIMIT ${limit}
    `);

    // Find related items from other threads
    const relatedItems = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT
        ci.id,
        ci.title,
        ci.integration_type as "integrationType",
        ci.thread_id as "threadId",
        1 - (ci.embedding <=> '${vectorString}'::vector) as similarity
      FROM connected_items ci
      WHERE ci.thread_id != '${threadId}'
        AND ci.organization_id = '${organizationId}'
        AND ci.deleted_at IS NULL
        AND ci.embedding IS NOT NULL
        AND ci.embedding <=> '${vectorString}'::vector < ${threshold}
      ORDER BY ci.embedding <=> '${vectorString}'::vector
      LIMIT ${limit}
    `);

    // Enrich items with thread info
    const itemsWithThreads = await Promise.all(
      relatedItems.map(async (item) => {
        const thread = item.threadId
          ? await prisma.goldenThread.findUnique({
              where: { id: item.threadId },
              select: { id: true, title: true },
            })
          : null;

        return {
          id: item.id,
          title: item.title,
          integrationType: item.integrationType,
          similarity: Number(item.similarity),
          thread: thread || undefined,
        };
      })
    );

    return {
      relatedThreads: relatedThreads.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        similarity: Number(t.similarity),
        _count: { connectedItems: Number(t.connectedItemsCount) },
      })),
      relatedItems: itemsWithThreads,
    };
  } catch (error) {
    logger.error('Find related content failed', { error, threadId });
    return { relatedThreads: [], relatedItems: [] };
  }
}
