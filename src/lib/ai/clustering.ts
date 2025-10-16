import { cosineSimilarity } from './embeddings';
import { logger } from '../logger';

/**
 * Enterprise-grade clustering algorithm for AI relationship detection
 * Uses DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
 * to group similar items based on their embedding vectors
 */

export interface ClusterItem {
  id: string;
  embedding: number[];
  title?: string | null;
  description?: string | null;
  integrationType?: string;
  metadata?: any;
}

export interface Cluster {
  id: string;
  items: ClusterItem[];
  centroid: number[];
  avgSimilarity: number;
  suggestedTitle: string;
}

export interface ClusteringOptions {
  epsilon?: number; // Maximum distance for items to be in same cluster (0.0-1.0)
  minPoints?: number; // Minimum items required to form a cluster
  maxClusters?: number; // Maximum number of clusters to return
}

/**
 * Find clusters of similar items using DBSCAN algorithm
 * Returns groups of items that are semantically related
 */
export function findClusters(
  items: ClusterItem[],
  options: ClusteringOptions = {}
): Cluster[] {
  const epsilon = options.epsilon ?? 0.15; // 0.15 = high similarity required
  const minPoints = options.minPoints ?? 2; // At least 2 items per cluster
  const maxClusters = options.maxClusters ?? 10;

  if (items.length < minPoints) {
    logger.info('Not enough items to form clusters', { itemCount: items.length });
    return [];
  }

  try {
    // Build distance matrix
    const distances = buildDistanceMatrix(items);

    // Apply DBSCAN
    const labels = dbscan(distances, epsilon, minPoints);

    // Group items by cluster label
    const clusterMap = new Map<number, ClusterItem[]>();
    labels.forEach((label, index) => {
      if (label >= 0) {
        // -1 = noise (not in any cluster)
        if (!clusterMap.has(label)) {
          clusterMap.set(label, []);
        }
        clusterMap.get(label)!.push(items[index]!);
      }
    });

    // Convert to Cluster objects
    const clusters: Cluster[] = [];
    let clusterIndex = 0;

    for (const [label, clusterItems] of clusterMap.entries()) {
      if (clusterItems.length >= minPoints && clusters.length < maxClusters) {
        const centroid = calculateCentroid(clusterItems);
        const avgSimilarity = calculateAvgSimilarity(clusterItems);
        const suggestedTitle = generateClusterTitle(clusterItems);

        clusters.push({
          id: `cluster-${Date.now()}-${clusterIndex}`,
          items: clusterItems,
          centroid,
          avgSimilarity,
          suggestedTitle,
        });

        clusterIndex++;
      }
    }

    logger.info('Clustering completed', {
      totalItems: items.length,
      clustersFound: clusters.length,
      noiseItems: labels.filter((l) => l === -1).length,
      epsilon,
      minPoints,
    });

    return clusters.sort((a, b) => b.avgSimilarity - a.avgSimilarity);
  } catch (error) {
    logger.error('Clustering failed', { error, itemCount: items.length });
    return [];
  }
}

/**
 * Build distance matrix for all item pairs
 * Uses cosine distance (1 - similarity)
 */
function buildDistanceMatrix(items: ClusterItem[]): number[][] {
  const n = items.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const similarity = cosineSimilarity(items[i]!.embedding, items[j]!.embedding);
      const distance = 1 - similarity; // Convert similarity to distance

      matrix[i]![j] = distance;
      matrix[j]![i] = distance; // Symmetric matrix
    }
  }

  return matrix;
}

/**
 * DBSCAN (Density-Based Spatial Clustering) algorithm
 * Returns array of cluster labels for each item (-1 = noise)
 */
function dbscan(distances: number[][], epsilon: number, minPoints: number): number[] {
  const n = distances.length;
  const labels = Array(n).fill(-1); // -1 = unvisited
  let clusterID = 0;

  for (let i = 0; i < n; i++) {
    if (labels[i] !== -1) continue; // Already visited

    // Find neighbors within epsilon distance
    const neighbors = regionQuery(distances, i, epsilon);

    if (neighbors.length < minPoints) {
      labels[i] = -1; // Mark as noise
    } else {
      // Start new cluster
      expandCluster(distances, labels, i, neighbors, clusterID, epsilon, minPoints);
      clusterID++;
    }
  }

  return labels;
}

/**
 * Find all points within epsilon distance of point
 */
function regionQuery(distances: number[][], point: number, epsilon: number): number[] {
  const neighbors: number[] = [];
  const n = distances.length;

  for (let i = 0; i < n; i++) {
    if (distances[point]![i]! <= epsilon) {
      neighbors.push(i);
    }
  }

  return neighbors;
}

/**
 * Expand cluster by adding all density-reachable points
 */
function expandCluster(
  distances: number[][],
  labels: number[],
  point: number,
  neighbors: number[],
  clusterID: number,
  epsilon: number,
  minPoints: number
): void {
  labels[point] = clusterID;

  let i = 0;
  while (i < neighbors.length) {
    const neighborPoint = neighbors[i]!;

    if (labels[neighborPoint] === -1) {
      // Unvisited point
      labels[neighborPoint] = clusterID;

      const neighborNeighbors = regionQuery(distances, neighborPoint, epsilon);
      if (neighborNeighbors.length >= minPoints) {
        // Add new neighbors to queue
        for (const nn of neighborNeighbors) {
          if (!neighbors.includes(nn)) {
            neighbors.push(nn);
          }
        }
      }
    }

    i++;
  }
}

/**
 * Calculate centroid (average embedding) of cluster
 */
function calculateCentroid(items: ClusterItem[]): number[] {
  if (items.length === 0) return [];

  const dimension = items[0]!.embedding.length;
  const centroid = Array(dimension).fill(0);

  for (const item of items) {
    for (let i = 0; i < dimension; i++) {
      centroid[i] += item.embedding[i]!;
    }
  }

  return centroid.map((val) => val / items.length);
}

/**
 * Calculate average pairwise similarity within cluster
 */
function calculateAvgSimilarity(items: ClusterItem[]): number {
  if (items.length < 2) return 1.0;

  let totalSimilarity = 0;
  let pairCount = 0;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      totalSimilarity += cosineSimilarity(items[i]!.embedding, items[j]!.embedding);
      pairCount++;
    }
  }

  return pairCount > 0 ? totalSimilarity / pairCount : 1.0;
}

/**
 * Generate suggested title for cluster based on item content
 * Uses most common words and integration types
 */
function generateClusterTitle(items: ClusterItem[]): string {
  // Extract all words from titles and descriptions
  const words = new Map<string, number>();
  const integrationTypes = new Map<string, number>();

  for (const item of items) {
    // Count integration types
    if (item.integrationType) {
      integrationTypes.set(
        item.integrationType,
        (integrationTypes.get(item.integrationType) || 0) + 1
      );
    }

    // Extract meaningful words (skip common words)
    const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    const tokens = text
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !commonWords.has(word));

    for (const word of tokens) {
      words.set(word, (words.get(word) || 0) + 1);
    }
  }

  // Get top 3 most common words
  const topWords = Array.from(words.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  // Get most common integration type
  const topIntegration = Array.from(integrationTypes.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  // Generate title
  if (topWords.length === 0) {
    return topIntegration
      ? `Related ${topIntegration} items`
      : `Related items (${items.length})`;
  }

  const wordsStr = topWords.join(', ');
  return `${capitalize(topWords[0]!)} discussion (${items.length} items)`;
}

/**
 * Common words to skip when generating titles
 */
const commonWords = new Set([
  'the',
  'and',
  'for',
  'with',
  'this',
  'that',
  'from',
  'have',
  'need',
  'want',
  'should',
  'would',
  'could',
  'about',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'issue',
  'item',
  'task',
  'feature',
  'update',
  'change',
  'design',
  'implement',
  'create',
]);

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Find optimal epsilon value for clustering using silhouette analysis
 * Used for auto-tuning clustering parameters
 */
export function findOptimalEpsilon(
  items: ClusterItem[],
  epsilonRange: { min: number; max: number; step: number } = {
    min: 0.1,
    max: 0.3,
    step: 0.05,
  }
): number {
  const distances = buildDistanceMatrix(items);
  let bestEpsilon = epsilonRange.min;
  let bestScore = -1;

  for (let eps = epsilonRange.min; eps <= epsilonRange.max; eps += epsilonRange.step) {
    const labels = dbscan(distances, eps, 2);
    const score = calculateSilhouetteScore(distances, labels);

    if (score > bestScore) {
      bestScore = score;
      bestEpsilon = eps;
    }
  }

  logger.info('Optimal epsilon found', { epsilon: bestEpsilon, score: bestScore });
  return bestEpsilon;
}

/**
 * Calculate silhouette score for clustering quality
 * Score ranges from -1 (bad) to 1 (good)
 */
function calculateSilhouetteScore(distances: number[][], labels: number[]): number {
  const n = distances.length;
  const clusterIDs = Array.from(new Set(labels)).filter((l) => l >= 0);

  if (clusterIDs.length === 0) return -1;

  let totalScore = 0;
  let validPoints = 0;

  for (let i = 0; i < n; i++) {
    if (labels[i]! < 0) continue; // Skip noise points

    const a = calculateIntraClusterDistance(distances, labels, i);
    const b = calculateNearestClusterDistance(distances, labels, i);

    const score = (b - a) / Math.max(a, b);
    totalScore += score;
    validPoints++;
  }

  return validPoints > 0 ? totalScore / validPoints : -1;
}

function calculateIntraClusterDistance(
  distances: number[][],
  labels: number[],
  point: number
): number {
  const cluster = labels[point]!;
  const clusterPoints = labels
    .map((label, idx) => (label === cluster && idx !== point ? idx : -1))
    .filter((idx) => idx >= 0);

  if (clusterPoints.length === 0) return 0;

  const sum = clusterPoints.reduce((acc, idx) => acc + distances[point]![idx]!, 0);
  return sum / clusterPoints.length;
}

function calculateNearestClusterDistance(
  distances: number[][],
  labels: number[],
  point: number
): number {
  const currentCluster = labels[point]!;
  const otherClusters = Array.from(new Set(labels)).filter(
    (l) => l >= 0 && l !== currentCluster
  );

  if (otherClusters.length === 0) return 0;

  const clusterDistances = otherClusters.map((cluster) => {
    const clusterPoints = labels
      .map((label, idx) => (label === cluster ? idx : -1))
      .filter((idx) => idx >= 0);

    const sum = clusterPoints.reduce((acc, idx) => acc + distances[point]![idx]!, 0);
    return sum / clusterPoints.length;
  });

  return Math.min(...clusterDistances);
}
