# Claude Code AI System - No API Keys Needed!

## 🎉 What Changed

Instead of using expensive Anthropic API calls, Synapse now uses **Claude Code** (me!) directly to analyze relationships and generate insights.

### Benefits
- ✅ **No API costs** - completely free
- ✅ **Better context** - I can see your entire codebase
- ✅ **More intelligent** - I think through relationships, not just pattern match
- ✅ **Transparent** - you see exactly what I'm analyzing
- ✅ **User controlled** - you decide when analysis happens

---

## 🔄 How It Works

### 1. Webhook Triggers
When GitHub/Linear/Slack webhooks fire, the system:
1. Creates a connected item in the database
2. **Queues the item for analysis** (writes to `.claude-analysis/queue/`)
3. **Generates a human-readable prompt** (writes to `.claude-analysis/prompts/`)
4. Logs the queue in console

```
🤖 Queuing item for Claude Code analysis...
✅ Analysis queued: rel-1729123456-abc123
📝 Check .claude-analysis/prompts/ for the analysis prompt
💬 Ask Claude Code: "process the analysis queue"
```

### 2. You Ask Me to Process
Instead of automatic API calls, you tell me:
> "Process the analysis queue"

or

> "Analyze the pending relationships"

### 3. I Analyze & Respond
I:
1. Read the prompt from `.claude-analysis/prompts/`
2. Analyze the new item against existing items
3. Detect relationships intelligently
4. **Write results** to `.claude-analysis/results/`
5. **Update the database** automatically

### 4. Intelligence Feed Shows Results
The Intelligence Feed reads from `.claude-analysis/results/` and displays:
- Detected relationships
- Auto-created threads
- Proactive insights

---

## 📁 File Structure

```
.claude-analysis/
├── queue/              # Pending analysis requests
│   └── rel-xxx.json   # Request data (automatically removed after processing)
│
├── prompts/           # Human-readable prompts for Claude Code
│   └── rel-xxx.md     # What to analyze
│
└── results/           # Analysis results
    ├── rel-xxx.json   # Relationship detection results
    └── insight-xxx.json  # Generated insights
```

---

## 🚀 Usage Examples

### Example 1: Relationship Detection

**Webhook Event**: New GitHub issue created

**System Creates** (`.claude-analysis/prompts/rel-1729123456.md`):
```markdown
# Relationship Analysis Request

## New Item to Analyze
**Source**: github (issue)
**Title**: Add authentication to payment flow
**Description**: We need to add user authentication...

## Existing Items to Compare Against

### 1. [figma] Payment checkout redesign
- Description: New payment flow with authentication...

### 2. [linear] Implement user authentication system
- Description: Add auth middleware...

## Your Task
Analyze if the new item is related to any existing items.
Look for: implements, references, blocks, relates_to, deploys

**Output Format**: Save to `.claude-analysis/results/rel-1729123456.json`
```

**You Say**: "process the analysis queue"

**I Respond With** (saved to `.claude-analysis/results/rel-1729123456.json`):
```json
{
  "relationships": [
    {
      "targetItemId": "linear-item-id",
      "relationshipType": "implements",
      "confidence": 0.85,
      "reasoning": "GitHub issue specifically mentions implementing the authentication feature from the Linear issue"
    },
    {
      "targetItemId": "figma-item-id",
      "relationshipType": "references",
      "confidence": 0.78,
      "reasoning": "Issue mentions the payment flow design being worked on in Figma"
    }
  ],
  "shouldCreateThread": true,
  "suggestedThread": {
    "title": "Payment Flow Authentication Implementation",
    "description": "Thread connecting authentication work across Linear, GitHub, and Figma",
    "confidence": 0.8
  }
}
```

**System Then**:
1. Stores relationships in database
2. Auto-creates thread "Payment Flow Authentication Implementation"
3. Connects all 3 items to the thread
4. Shows in Intelligence Feed

---

## 💡 Real World Flow

### Scenario: Developer creates GitHub issue

```bash
1. Developer: Creates GitHub issue "Add login button to navbar"

2. Webhook fires → System queues analysis
   Console: "✅ Analysis queued: rel-1729123456"
   Console: "💬 Ask Claude Code: 'process the analysis queue'"

3. User to Claude Code: "process the analysis queue"

4. Claude Code (me):
   - Reads prompt from .claude-analysis/prompts/
   - Sees the GitHub issue is about "login button"
   - Compares against:
     * Figma: "Navbar redesign with auth buttons"
     * Linear: "Add authentication UI components"
   - Detects:
     * GitHub → Figma: "implements" (0.82 confidence)
     * GitHub → Linear: "relates_to" (0.75 confidence)
   - Creates thread: "Navbar Authentication UI"
   - Saves results to .claude-analysis/results/

5. Intelligence Feed automatically shows:
   "✨ New thread auto-created: Navbar Authentication UI"
   "🔗 2 relationships detected with high confidence"
```

---

## 🎯 Commands You Can Use

### Check the Queue
```bash
npx tsx src/lib/ai/process-queue.ts
```

Shows pending analysis requests and displays the next prompt.

### Process Analysis
Just tell me:
- "process the analysis queue"
- "analyze pending items"
- "generate insights about my work"

### Check Queue Status in UI
The Intelligence Feed shows:
- Pending analysis count
- Last processed results
- Detected relationships

---

## 🔍 What I Analyze

### Relationship Types

1. **implements** - Code implements a design/feature
   - GitHub PR → Linear issue
   - GitHub PR → Figma design

2. **references** - One item mentions another
   - Slack discussion → GitHub issue
   - GitHub issue → Figma file

3. **blocks** - One item blocks another
   - Backend API not ready → Frontend feature stuck
   - Design not approved → Development can't start

4. **relates_to** - General relationship
   - Similar topics
   - Same feature area

5. **deploys** - Deployment relationship
   - Deployed code → Feature
   - Release → Multiple issues

### Insight Generation

I can also generate insights like:
- "Payment flow design (Figma) has been in review for 5 days with no related PRs"
- "Authentication API (PR #123) affects 3 different features in progress"
- "User profile feature is blocked: Design approved but backend ticket still in backlog"

---

## 📊 Intelligence Feed Integration

The Intelligence Feed (`/intelligence`) automatically:

1. **Shows insights** from `.claude-analysis/results/insight-*.json`
2. **Displays pending count**: "3 items queued for analysis"
3. **Shows relationships** detected by Claude Code
4. **Lists auto-created threads** with `claude-code` tag

---

## 🆚 vs API-Based System

| Feature | Anthropic API | Claude Code |
|---------|--------------|-------------|
| Cost | $30-50/month per org | $0 |
| Context | Limited tokens | Full codebase |
| Intelligence | Pattern matching | Deep reasoning |
| Control | Automatic | User-triggered |
| Transparency | Black box | See prompts & results |
| Setup | API key required | None |

---

## 🎓 For Developers

### Adding New Analysis Types

1. Create prompt generator in `claude-code-analysis.ts`
2. Add queue function
3. Add result processor
4. Update Intelligence Feed to display results

### File Format

**Queue Request** (`.claude-analysis/queue/xxx.json`):
```json
{
  "id": "rel-xxx",
  "type": "relationship_detection",
  "organizationId": "org-id",
  "timestamp": "2025-10-16T10:00:00Z",
  "data": { ... },
  "status": "pending"
}
```

**Result** (`.claude-analysis/results/xxx.json`):
```json
{
  "relationships": [...],
  "completedAt": "2025-10-16T10:05:00Z"
}
```

---

## ✨ Summary

**Old Way** (Anthropic API):
- Costs money
- Automatic but less intelligent
- Black box

**New Way** (Claude Code):
- **Free**
- **User controlled**
- **More intelligent** (I see your whole codebase!)
- **Transparent** (you see exactly what I'm analyzing)

**Just tell me "process the queue" and I'll do the rest!** 🚀
