import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { createHmac } from 'crypto';

// Disable body parsing to get raw body for signature verification
export const config = {
  api: {
    bodyParser: true, // Next.js will parse the body as JSON
  },
};

/**
 * Verify GitHub webhook signature
 * GitHub signs webhooks with HMAC SHA-256
 */
function verifyGitHubSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature) return false;

  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const digest = `sha256=${hmac.digest('hex')}`;

  return signature === digest;
}

/**
 * GitHub Webhook Handler
 * Receives events from GitHub and triggers automations
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔔 GitHub webhook received:', {
    method: req.method,
    event: req.headers['x-github-event'],
    delivery: req.headers['x-github-delivery'],
  });

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const event = req.headers['x-github-event'] as string;
    const payload = JSON.stringify(req.body);

    console.log('📦 Webhook payload received:', {
      event,
      hasSignature: !!signature,
      payloadSize: payload.length,
    });

    // Verify webhook signature (if secret is configured)
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (webhookSecret && process.env.NODE_ENV !== 'development') {
      if (!verifyGitHubSignature(payload, signature, webhookSecret)) {
        console.error('❌ Invalid GitHub webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      console.log('✅ Webhook signature verified');
    } else {
      console.warn('⚠️ Skipping signature verification in development mode');
    }

    // Parse webhook payload
    const data = req.body;

    // Handle different GitHub events
    if (event === 'issues') {
      console.log('📝 Handling issues event:', data.action);
      await handleIssueEvent(data);
    } else if (event === 'pull_request') {
      console.log('🔀 Handling pull_request event:', data.action);
      await handlePullRequestEvent(data);
    } else if (event === 'push') {
      console.log('📌 Handling push event');
      await handlePushEvent(data);
    } else if (event === 'issue_comment') {
      console.log('💬 Handling issue_comment event:', data.action);
      await handleIssueCommentEvent(data);
    } else {
      console.log('ℹ️ Ignoring event type:', event);
    }

    console.log('✅ Webhook processed successfully');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ GitHub webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle GitHub issue events (opened, closed, reopened, etc.)
 */
async function handleIssueEvent(data: any) {
  const action = data.action; // opened, closed, reopened, edited, etc.
  const issue = data.issue;
  const repository = data.repository;

  console.log('🔍 Looking for automations for issue event:', {
    action,
    repository: repository.full_name,
    issue: `#${issue.number}`,
  });

  // Find automations that match this trigger
  const automations = await prisma.automation.findMany({
    where: {
      isActive: true,
      trigger: {
        path: ['type'],
        equals: 'github.issue',
      },
    },
    include: {
      organization: {
        include: {
          integrations: {
            where: {
              integrationType: 'github',
              status: 'active',
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  console.log(`📋 Found ${automations.length} active automations for github.issue`);

  // Execute matching automations
  for (const automation of automations) {
    // Check if trigger config matches
    const triggerConfig = automation.trigger as any;
    const triggerAction = triggerConfig.action || 'opened';

    console.log(`🔎 Checking automation "${automation.name}"`, {
      automationId: automation.id,
      triggerAction,
      actualAction: action,
      repoFilter: triggerConfig.repository,
      actualRepo: repository.full_name,
    });

    if (action !== triggerAction) {
      console.log(`⏭️ Skipping: action mismatch (expected ${triggerAction}, got ${action})`);
      continue;
    }

    // Check if repository matches (if specified)
    const repoFilter = triggerConfig.repository;
    if (repoFilter && repoFilter !== repository.full_name) {
      console.log(`⏭️ Skipping: repository mismatch (expected ${repoFilter}, got ${repository.full_name})`);
      continue;
    }

    console.log(`✅ Automation "${automation.name}" matches! Executing...`);

    // Execute automation actions
    await executeAutomationActions(automation, {
      eventType: 'github.issue',
      action,
      data: {
        issue,
        repository,
      },
    });

    // Update automation execution stats
    await prisma.automation.update({
      where: { id: automation.id },
      data: {
        executionCount: { increment: 1 },
        lastTriggeredAt: new Date(),
      },
    });

    console.log(`✅ Automation "${automation.name}" executed successfully`);
  }

  console.log(`✅ Finished processing issue event (${automations.length} automations checked)`);
}

/**
 * Handle GitHub pull request events
 */
async function handlePullRequestEvent(data: any) {
  const action = data.action;
  const pullRequest = data.pull_request;
  const repository = data.repository;

  const automations = await prisma.automation.findMany({
    where: {
      isActive: true,
      trigger: {
        path: ['type'],
        equals: 'github.pull_request',
      },
    },
    include: {
      organization: {
        include: {
          integrations: {
            where: {
              integrationType: 'github',
              status: 'active',
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  for (const automation of automations) {
    const triggerConfig = automation.trigger as any;
    const triggerAction = triggerConfig.action || 'opened';

    if (action !== triggerAction) continue;

    const repoFilter = triggerConfig.repository;
    if (repoFilter && repoFilter !== repository.full_name) continue;

    await executeAutomationActions(automation, {
      eventType: 'github.pull_request',
      action,
      data: {
        pullRequest,
        repository,
      },
    });

    await prisma.automation.update({
      where: { id: automation.id },
      data: {
        executionCount: { increment: 1 },
        lastTriggeredAt: new Date(),
      },
    });
  }
}

/**
 * Handle GitHub push events
 */
async function handlePushEvent(data: any) {
  const ref = data.ref;
  const commits = data.commits;
  const repository = data.repository;

  // Find automations for push events
  const automations = await prisma.automation.findMany({
    where: {
      isActive: true,
      trigger: {
        path: ['type'],
        equals: 'github.push',
      },
    },
    include: {
      organization: {
        include: {
          integrations: {
            where: {
              integrationType: 'github',
              status: 'active',
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  for (const automation of automations) {
    const triggerConfig = automation.trigger as any;
    const branchFilter = triggerConfig.branch;

    if (branchFilter && !ref.endsWith(branchFilter)) continue;

    const repoFilter = triggerConfig.repository;
    if (repoFilter && repoFilter !== repository.full_name) continue;

    await executeAutomationActions(automation, {
      eventType: 'github.push',
      action: 'push',
      data: {
        ref,
        commits,
        repository,
      },
    });

    await prisma.automation.update({
      where: { id: automation.id },
      data: {
        executionCount: { increment: 1 },
        lastTriggeredAt: new Date(),
      },
    });
  }
}

/**
 * Handle GitHub issue comment events
 */
async function handleIssueCommentEvent(data: any) {
  const action = data.action;
  const comment = data.comment;
  const issue = data.issue;
  const repository = data.repository;

  const automations = await prisma.automation.findMany({
    where: {
      isActive: true,
      trigger: {
        path: ['type'],
        equals: 'github.issue_comment',
      },
    },
    include: {
      organization: {
        include: {
          integrations: {
            where: {
              integrationType: 'github',
              status: 'active',
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  for (const automation of automations) {
    const triggerConfig = automation.trigger as any;
    const triggerAction = triggerConfig.action || 'created';

    if (action !== triggerAction) continue;

    const repoFilter = triggerConfig.repository;
    if (repoFilter && repoFilter !== repository.full_name) continue;

    await executeAutomationActions(automation, {
      eventType: 'github.issue_comment',
      action,
      data: {
        comment,
        issue,
        repository,
      },
    });

    await prisma.automation.update({
      where: { id: automation.id },
      data: {
        executionCount: { increment: 1 },
        lastTriggeredAt: new Date(),
      },
    });
  }
}

/**
 * Execute automation actions
 */
async function executeAutomationActions(automation: any, context: any) {
  const actions = automation.actions as any[];

  for (const action of actions) {
    try {
      if (action.type === 'create_thread') {
        await executeCreateThreadAction(automation, action, context);
      } else if (action.type === 'update_thread') {
        await executeUpdateThreadAction(automation, action, context);
      } else if (action.type === 'add_comment') {
        await executeAddCommentAction(automation, action, context);
      } else if (action.type === 'connect_item') {
        await executeConnectItemAction(automation, action, context);
      } else if (action.type === 'send_notification') {
        await executeSendNotificationAction(automation, action, context);
      }
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);

      // Log failed execution (activity feed disabled due to schema requirements)
      console.error('Automation failed:', {
        automationId: automation.id,
        automationName: automation.name,
        actionType: action.type,
        error: (error as Error).message,
      });
    }
  }
}

/**
 * Action: Create a new thread
 */
async function executeCreateThreadAction(automation: any, action: any, context: any) {
  const { data } = context;
  const config = action.config || {};

  let title: string;
  let description: string;
  let status = config.status || 'planning';

  // Build thread title and description from context
  if (context.eventType === 'github.issue') {
    const { issue, repository } = data;
    title = config.title || `${repository.full_name}#${issue.number}: ${issue.title}`;
    description = config.description || issue.body || '';
  } else if (context.eventType === 'github.pull_request') {
    const { pullRequest, repository } = data;
    title = config.title || `PR: ${repository.full_name}#${pullRequest.number}: ${pullRequest.title}`;
    description = config.description || pullRequest.body || '';
  } else {
    title = config.title || 'Automated Thread';
    description = config.description || '';
  }

  console.log('🧵 Creating thread:', { title, status, organizationId: automation.organizationId });

  // Create the thread
  const thread = await prisma.goldenThread.create({
    data: {
      organizationId: automation.organizationId,
      title,
      description,
      status,
      createdBy: automation.organization.integrations[0]?.connectedBy || automation.createdBy,
    },
  });

  console.log('✅ Thread created successfully:', { threadId: thread.id, title: thread.title });

  // Store thread ID in context for subsequent actions
  context.threadId = thread.id;

  // If GitHub issue/PR, automatically connect it
  if (context.eventType === 'github.issue') {
    await prisma.connectedItem.create({
      data: {
        organizationId: automation.organizationId,
        threadId: thread.id,
        integrationType: 'github',
        externalId: `${data.repository.full_name}/issues/${data.issue.number}`,
        externalUrl: data.issue.html_url,
        title: data.issue.title,
        description: data.issue.body,
        metadata: {
          repository: data.repository.full_name,
          number: data.issue.number,
          state: data.issue.state,
          labels: data.issue.labels,
        },
        createdBy: automation.organization.integrations[0]?.connectedBy || automation.createdBy,
      },
    });

    // Update thread (connectedItemsCount field removed)
    await prisma.goldenThread.update({
      where: { id: thread.id },
      data: { lastActivityAt: new Date() },
    });
  }

  // Log activity (activity feed disabled due to schema requirements)
  console.log('Thread created activity:', {
    automationId: automation.id,
    automationName: automation.name,
    threadId: thread.id,
    eventType: context.eventType,
  });
}

/**
 * Action: Update an existing thread
 */
async function executeUpdateThreadAction(automation: any, action: any, context: any) {
  const config = action.config || {};
  const threadId = context.threadId || config.threadId;

  if (!threadId) {
    throw new Error('No thread ID available for update action');
  }

  const updateData: any = {};

  if (config.status) updateData.status = config.status;
  if (config.description) updateData.description = config.description;

  await prisma.goldenThread.update({
    where: { id: threadId },
    data: {
      ...updateData,
      lastActivityAt: new Date(),
    },
  });

  // Log activity (activity feed disabled due to schema requirements)
  console.log('Thread updated activity:', {
    automationId: automation.id,
    automationName: automation.name,
    threadId,
    updates: updateData,
  });
}

/**
 * Action: Add a comment to a thread
 */
async function executeAddCommentAction(automation: any, action: any, context: any) {
  const config = action.config || {};
  const threadId = context.threadId || config.threadId;

  if (!threadId) {
    throw new Error('No thread ID available for comment action');
  }

  let content = config.content || '';

  // Build comment from context
  if (context.eventType === 'github.issue' && !content) {
    const { issue } = context.data;
    content = `New GitHub issue: ${issue.html_url}`;
  }

  await prisma.comment.create({
    data: {
      organizationId: automation.organizationId,
      threadId,
      content,
      createdBy: automation.organization.integrations[0]?.connectedBy || automation.createdBy,
    },
  });

  await prisma.goldenThread.update({
    where: { id: threadId },
    data: {
      lastActivityAt: new Date(),
    },
  });
}

/**
 * Action: Connect an item to a thread
 */
async function executeConnectItemAction(automation: any, action: any, context: any) {
  const config = action.config || {};
  const threadId = context.threadId || config.threadId;

  if (!threadId) {
    throw new Error('No thread ID available for connect item action');
  }

  const { data } = context;
  let externalId: string;
  let externalUrl: string;
  let title: string;
  let metadata: any = {};

  if (context.eventType === 'github.issue') {
    const { issue, repository } = data;
    externalId = `${repository.full_name}/issues/${issue.number}`;
    externalUrl = issue.html_url;
    title = issue.title;
    metadata = { repository: repository.full_name, number: issue.number };
  } else {
    throw new Error('Unsupported event type for connect item action');
  }

  await prisma.connectedItem.create({
    data: {
      organizationId: automation.organizationId,
      threadId,
      integrationType: 'github',
      externalId,
      externalUrl,
      title,
      metadata,
      createdBy: automation.organization.integrations[0]?.connectedBy || automation.createdBy,
    },
  });

  await prisma.goldenThread.update({
    where: { id: threadId },
    data: {
      lastActivityAt: new Date(),
    },
  });
}

/**
 * Action: Send a notification
 */
async function executeSendNotificationAction(automation: any, action: any, context: any) {
  // TODO: Implement notification system
  // This could send Slack messages, emails, etc.
  console.log('Send notification action - not yet implemented');
}
