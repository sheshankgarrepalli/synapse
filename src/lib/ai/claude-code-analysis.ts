/**
 * Claude Code-Based AI Analysis System
 * Instead of API calls, this writes analysis requests to files
 * User can then ask Claude Code to process the queue
 *
 * Benefits:
 * - No API costs
 * - Better context (Claude Code sees whole codebase)
 * - More intelligent analysis
 * - User controls when analysis happens
 */

import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const ANALYSIS_DIR = path.join(process.cwd(), '.claude-analysis');
const QUEUE_DIR = path.join(ANALYSIS_DIR, 'queue');
const RESULTS_DIR = path.join(ANALYSIS_DIR, 'results');
const PROMPTS_DIR = path.join(ANALYSIS_DIR, 'prompts');

// Ensure directories exist
function ensureDirs() {
  [ANALYSIS_DIR, QUEUE_DIR, RESULTS_DIR, PROMPTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

export interface AnalysisRequest {
  id: string;
  type: 'relationship_detection' | 'thread_suggestion' | 'insight_generation' | 'digest_generation';
  organizationId: string;
  timestamp: string;
  data: {
    newItem?: any;
    existingItems?: any[];
    threads?: any[];
    timeRange?: string;
  };
  status: 'pending' | 'processing' | 'completed';
}

export interface RelationshipResult {
  sourceItemId: string;
  targetItemId: string;
  relationshipType: 'implements' | 'references' | 'blocks' | 'relates_to' | 'deploys';
  confidence: number;
  reasoning: string;
}

export interface ThreadSuggestion {
  title: string;
  description: string;
  itemIds: string[];
  reasoning: string;
  confidence: number;
}

/**
 * Queue a new item for relationship analysis
 * Creates a file that Claude Code can later process
 */
export async function queueRelationshipAnalysis(
  itemId: string,
  organizationId: string
): Promise<string> {
  ensureDirs();

  try {
    // Get the new item
    const newItem = await prisma.connectedItem.findUnique({
      where: { id: itemId },
      include: { thread: true },
    });

    if (!newItem) {
      throw new Error('Item not found');
    }

    // Get recent items to compare against
    const existingItems = await prisma.connectedItem.findMany({
      where: {
        organizationId,
        id: { not: itemId },
        deletedAt: null,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    const requestId = `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const request: AnalysisRequest = {
      id: requestId,
      type: 'relationship_detection',
      organizationId,
      timestamp: new Date().toISOString(),
      data: {
        newItem: {
          id: newItem.id,
          type: newItem.integrationType,
          itemType: newItem.itemType,
          title: newItem.title,
          description: newItem.description,
          metadata: newItem.metadata,
          externalUrl: newItem.externalUrl,
        },
        existingItems: existingItems.map(item => ({
          id: item.id,
          type: item.integrationType,
          itemType: item.itemType,
          title: item.title,
          description: item.description,
          threadId: item.threadId,
        })),
      },
      status: 'pending',
    };

    // Write request to queue
    const queueFile = path.join(QUEUE_DIR, `${requestId}.json`);
    fs.writeFileSync(queueFile, JSON.stringify(request, null, 2));

    // Create human-readable prompt for Claude Code
    const promptFile = path.join(PROMPTS_DIR, `${requestId}.md`);
    const prompt = generateRelationshipPrompt(request);
    fs.writeFileSync(promptFile, prompt);

    logger.info('Queued relationship analysis', { requestId, itemId });

    return requestId;
  } catch (error) {
    logger.error('Error queuing analysis', { error, itemId });
    throw error;
  }
}

/**
 * Generate a human-readable prompt for Claude Code
 */
function generateRelationshipPrompt(request: AnalysisRequest): string {
  const { newItem, existingItems } = request.data;

  return `# Relationship Analysis Request

**Request ID**: ${request.id}
**Organization**: ${request.organizationId}
**Created**: ${request.timestamp}

---

## New Item to Analyze

**Source**: ${newItem.type}${newItem.itemType ? ` (${newItem.itemType})` : ''}
**Title**: ${newItem.title || 'Untitled'}
**URL**: ${newItem.externalUrl || 'N/A'}

**Description**:
${newItem.description || 'No description provided'}

**Metadata**:
\`\`\`json
${JSON.stringify(newItem.metadata, null, 2)}
\`\`\`

---

## Existing Items to Compare Against

${existingItems?.map((item: any, idx: number) => `
### ${idx + 1}. [${item.type}] ${item.title || 'Untitled'}
- **ID**: ${item.id}
- **Type**: ${item.itemType || 'N/A'}
- **Thread**: ${item.threadId ? 'Part of existing thread' : 'Not in thread'}
- **Description**: ${item.description?.substring(0, 200) || 'N/A'}
`).join('\n')}

---

## Your Task

Analyze if the **new item** is related to any of the **existing items**.

Look for these relationship types:
1. **implements** - The new item implements/completes another item (e.g., PR implements Linear issue)
2. **references** - The new item references another (e.g., design referenced in code)
3. **blocks** - The new item blocks another from progress
4. **relates_to** - General relationship
5. **deploys** - Code deployment related to feature

For each relationship found, provide:
- Target item ID
- Relationship type
- Confidence (0.0 - 1.0)
- Brief reasoning

**Output Format** (save to \`.claude-analysis/results/${request.id}.json\`):
\`\`\`json
{
  "relationships": [
    {
      "targetItemId": "item-id-here",
      "relationshipType": "implements",
      "confidence": 0.85,
      "reasoning": "The PR title mentions implementing the authentication feature from the Linear issue"
    }
  ],
  "shouldCreateThread": true,
  "suggestedThread": {
    "title": "Authentication Implementation",
    "description": "Thread connecting authentication work across Linear, GitHub, and Figma",
    "confidence": 0.8
  }
}
\`\`\`

Only include relationships with confidence > 0.5.
Set \`shouldCreateThread: true\` if 2+ high-confidence relationships found.
`;
}

/**
 * Queue insight generation request
 */
export async function queueInsightGeneration(organizationId: string): Promise<string> {
  ensureDirs();

  try {
    // Get recent activity
    const recentItems = await prisma.connectedItem.findMany({
      where: {
        organizationId,
        deletedAt: null,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        thread: { select: { id: true, title: true, status: true } },
      },
    });

    const activeThreads = await prisma.goldenThread.findMany({
      where: {
        organizationId,
        status: { in: ['planning', 'in_progress', 'review'] },
        deletedAt: null,
      },
      take: 20,
      include: {
        _count: { select: { connectedItems: true } },
      },
    });

    const requestId = `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const request: AnalysisRequest = {
      id: requestId,
      type: 'insight_generation',
      organizationId,
      timestamp: new Date().toISOString(),
      data: {
        existingItems: recentItems.map(item => ({
          id: item.id,
          type: item.integrationType,
          title: item.title,
          description: item.description,
          createdAt: item.createdAt,
          thread: item.thread,
        })),
        threads: activeThreads.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          itemCount: t._count.connectedItems,
          lastActivity: t.lastActivityAt,
        })),
      },
      status: 'pending',
    };

    const queueFile = path.join(QUEUE_DIR, `${requestId}.json`);
    fs.writeFileSync(queueFile, JSON.stringify(request, null, 2));

    const promptFile = path.join(PROMPTS_DIR, `${requestId}.md`);
    const prompt = generateInsightPrompt(request);
    fs.writeFileSync(promptFile, prompt);

    logger.info('Queued insight generation', { requestId });

    return requestId;
  } catch (error) {
    logger.error('Error queuing insights', { error });
    throw error;
  }
}

/**
 * Generate insight analysis prompt
 */
function generateInsightPrompt(request: AnalysisRequest): string {
  const { existingItems, threads } = request.data;

  return `# Insight Generation Request

**Request ID**: ${request.id}
**Organization**: ${request.organizationId}
**Created**: ${request.timestamp}

---

## Recent Work Items (Last 7 Days)

${existingItems?.map((item: any, idx: number) => `
${idx + 1}. **[${item.type}]** ${item.title}
   - Created: ${new Date(item.createdAt).toLocaleDateString()}
   - Thread: ${item.thread?.title || 'None'}
   - Description: ${item.description?.substring(0, 150) || 'N/A'}
`).join('\n')}

---

## Active Threads

${threads?.map((thread: any, idx: number) => `
${idx + 1}. **${thread.title}** [${thread.status}]
   - Connected items: ${thread.itemCount}
   - Last activity: ${new Date(thread.lastActivity).toLocaleDateString()}
`).join('\n')}

---

## Your Task

Generate 3-5 proactive insights about this team's work.

Look for:
- Work that's stalled (no activity for 5+ days)
- Missing connections (design with no code, tickets with no PRs)
- Blockers or dependencies
- Patterns in the work

**Output Format** (save to \`.claude-analysis/results/${request.id}.json\`):
\`\`\`json
{
  "insights": [
    "The payment flow design (Figma) has been in review for 5 days with no related GitHub PRs",
    "Authentication API changes (PR #123) affect 3 different features currently in progress",
    "User profile feature is blocked: Design approved but backend ticket still in backlog"
  ],
  "blockers": [
    {
      "threadId": "thread-id",
      "issue": "No code implementation found for approved design"
    }
  ],
  "recommendations": [
    "Consider creating a PR for the payment flow design",
    "Review dependencies for authentication API changes"
  ]
}
\`\`\`
`;
}

/**
 * Get pending analysis requests
 */
export function getPendingRequests(): AnalysisRequest[] {
  ensureDirs();

  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.json'));

  return files.map(file => {
    const content = fs.readFileSync(path.join(QUEUE_DIR, file), 'utf8');
    return JSON.parse(content);
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Get count of pending requests
 */
export function getPendingCount(): number {
  ensureDirs();
  return fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.json')).length;
}

/**
 * Mark request as completed and move to results
 */
export function completeRequest(requestId: string, results: any): void {
  ensureDirs();

  const queueFile = path.join(QUEUE_DIR, `${requestId}.json`);
  const resultsFile = path.join(RESULTS_DIR, `${requestId}.json`);

  // Save results
  fs.writeFileSync(resultsFile, JSON.stringify({
    ...results,
    completedAt: new Date().toISOString(),
  }, null, 2));

  // Remove from queue
  if (fs.existsSync(queueFile)) {
    fs.unlinkSync(queueFile);
  }
}

/**
 * Process a completed analysis and update database
 */
export async function processAnalysisResults(requestId: string): Promise<void> {
  const resultsFile = path.join(RESULTS_DIR, `${requestId}.json`);

  if (!fs.existsSync(resultsFile)) {
    throw new Error(`Results not found for ${requestId}`);
  }

  const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  const request = JSON.parse(fs.readFileSync(
    path.join(QUEUE_DIR, `${requestId}.json`).replace('/queue/', '/results/'),
    'utf8'
  ));

  if (request.type === 'relationship_detection') {
    await processRelationshipResults(results, request);
  } else if (request.type === 'insight_generation') {
    await processInsightResults(results, request);
  }
}

async function processRelationshipResults(results: any, request: AnalysisRequest): Promise<void> {
  const { relationships, shouldCreateThread, suggestedThread } = results;
  const { newItem } = request.data;

  // Store detected relationships in activity feed
  for (const rel of relationships || []) {
    if (rel.confidence > 0.6) {
      await prisma.activityFeed.create({
        data: {
          organizationId: request.organizationId,
          actorId: newItem.id, // Using item as actor for now
          actionType: 'relationship_detected',
          itemId: newItem.id,
          metadata: {
            targetItemId: rel.targetItemId,
            relationshipType: rel.relationshipType,
            confidence: rel.confidence,
            reasoning: rel.reasoning,
          },
        },
      });
    }
  }

  // Auto-create thread if suggested
  if (shouldCreateThread && suggestedThread && suggestedThread.confidence > 0.7) {
    const thread = await prisma.goldenThread.create({
      data: {
        organizationId: request.organizationId,
        title: suggestedThread.title,
        description: suggestedThread.description,
        status: 'in_progress',
        tags: ['auto-detected', 'claude-code'],
        createdBy: newItem.id, // Using item as creator for now
      },
    });

    // Connect items to thread
    const itemIds = [newItem.id, ...(relationships?.map((r: any) => r.targetItemId) || [])];
    await prisma.connectedItem.updateMany({
      where: { id: { in: itemIds } },
      data: { threadId: thread.id },
    });

    logger.info('Auto-created thread from Claude Code analysis', { threadId: thread.id });
  }
}

async function processInsightResults(results: any, request: AnalysisRequest): Promise<void> {
  // Insights are displayed in the Intelligence Feed directly from the results file
  // No need to store in DB, just keep in results directory
  logger.info('Processed insights from Claude Code', {
    insightCount: results.insights?.length || 0
  });
}
