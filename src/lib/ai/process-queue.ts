/**
 * Queue Processor - Shows Claude Code what to analyze
 * Run: npx tsx src/lib/ai/process-queue.ts
 */

import { getPendingRequests, getPendingCount } from './claude-code-analysis';
import fs from 'fs';
import path from 'path';

const PROMPTS_DIR = path.join(process.cwd(), '.claude-analysis', 'prompts');

export function showAnalysisQueue() {
  const pending = getPendingRequests();
  const count = getPendingCount();

  console.log('\n🔍 Claude Code Analysis Queue\n');
  console.log('='.repeat(60));

  if (count === 0) {
    console.log('\n✅ Queue is empty - no analysis needed!\n');
    return;
  }

  console.log(`\n📊 ${count} analysis request(s) pending\n`);

  pending.forEach((request, idx) => {
    console.log(`${idx + 1}. [${request.type}] - ${request.id}`);
    console.log(`   Organization: ${request.organizationId}`);
    console.log(`   Created: ${new Date(request.timestamp).toLocaleString()}`);
    console.log(`   Status: ${request.status}`);

    if (request.type === 'relationship_detection' && request.data.newItem) {
      console.log(`   New Item: [${request.data.newItem.type}] ${request.data.newItem.title}`);
      console.log(`   Compare Against: ${request.data.existingItems?.length || 0} items`);
    }

    console.log();
  });

  console.log('='.repeat(60));
  console.log('\n📝 To process these, tell Claude Code:\n');
  console.log('   "Process the analysis queue"\n');
  console.log('Claude Code will:');
  console.log('1. Read the prompts from .claude-analysis/prompts/');
  console.log('2. Analyze relationships intelligently');
  console.log('3. Save results to .claude-analysis/results/');
  console.log('4. Update the database automatically\n');
}

export function getNextPrompt(): { id: string; prompt: string } | null {
  const pending = getPendingRequests();
  if (pending.length === 0) return null;

  const next = pending[0];
  const promptFile = path.join(PROMPTS_DIR, `${next.id}.md`);

  if (!fs.existsSync(promptFile)) {
    return null;
  }

  const prompt = fs.readFileSync(promptFile, 'utf8');

  return {
    id: next.id,
    prompt,
  };
}

// CLI mode
if (require.main === module) {
  showAnalysisQueue();

  const next = getNextPrompt();
  if (next) {
    console.log('\n📄 Next Prompt to Process:\n');
    console.log('='.repeat(60));
    console.log(next.prompt);
    console.log('='.repeat(60));
  }
}
