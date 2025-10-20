# Task 3.4: Component Guide - Post-Integration Upsell Flow

Quick reference guide for all components and their usage.

---

## Component Overview

### 1. IntegrationPrompt

**Purpose**: In-app prompt to connect more integrations
**Where**: Dashboard, thread pages, anywhere you want to prompt
**When**: After user has 1+ integrations and 1+ threads

```tsx
import { IntegrationPrompt } from '@/components/IntegrationPrompt';

<IntegrationPrompt
  userIntegrations={['linear']}
  onConnect={(integration) => {
    // Trigger OAuth for integration
    console.log('Connect:', integration);
  }}
  onDismiss={() => {
    // Store dismissal with timestamp
    localStorage.setItem('integration-prompt-dismissed', Date.now());
  }}
/>
```

**Compact Variant** (for sidebars):
```tsx
import { IntegrationPromptCompact } from '@/components/IntegrationPrompt';

<IntegrationPromptCompact
  userIntegrations={['linear']}
  onConnect={handleConnect}
  onDismiss={handleDismiss}
/>
```

---

### 2. IntegrationCelebration

**Purpose**: Celebrate after connecting new integration
**Where**: Modal after OAuth success
**When**: Immediately after successful integration connection

```tsx
import { IntegrationCelebration } from '@/components/IntegrationCelebration';

const [showCelebration, setShowCelebration] = useState(false);
const [newIntegration, setNewIntegration] = useState<IntegrationType | null>(null);

// After successful OAuth:
setNewIntegration('github');
setShowCelebration(true);

<IntegrationCelebration
  isOpen={showCelebration}
  onClose={() => setShowCelebration(false)}
  integration={newIntegration!}
  existingIntegrations={['linear']} // Don't include the new one
  onCreateThread={() => {
    // Navigate to thread creation
    router.push('/threads/new?integration=github');
  }}
/>
```

**Toast Variant** (less intrusive):
```tsx
import { IntegrationCelebrationToast } from '@/components/IntegrationCelebration';

<IntegrationCelebrationToast
  integration="github"
  onViewCapabilities={() => {
    // Show full modal or navigate to settings
    setShowCelebration(true);
  }}
  onDismiss={() => {
    // Hide toast
  }}
/>
```

---

### 3. ThreadCreationUpsell

**Purpose**: Suggest integration when creating thread that needs it
**Where**: Thread creation flow
**When**: User selects template that benefits from missing integration

```tsx
import { ThreadCreationUpsell } from '@/components/ThreadCreationUpsell';

const [showUpsell, setShowUpsell] = useState(false);
const [requiredIntegration, setRequiredIntegration] = useState<IntegrationType | null>(null);

// When user selects "Design Review" template but doesn't have Figma:
if (template === 'design-review' && !userIntegrations.includes('figma')) {
  setRequiredIntegration('figma');
  setShowUpsell(true);
}

<ThreadCreationUpsell
  isOpen={showUpsell}
  onClose={() => setShowUpsell(false)}
  requiredIntegration={requiredIntegration!}
  threadType="Design Review"
  onConnect={() => {
    // Trigger OAuth, then continue creating thread
    connectIntegration(requiredIntegration);
  }}
  onCreateWithout={() => {
    // User wants to continue without the integration
    setShowUpsell(false);
    continueCreatingThread();
  }}
/>
```

**Banner Variant** (inline, less intrusive):
```tsx
import { ThreadCreationUpsellBanner } from '@/components/ThreadCreationUpsell';

// Show above thread creation form:
{!userIntegrations.includes('figma') && threadType === 'design-review' && (
  <ThreadCreationUpsellBanner
    requiredIntegration="figma"
    threadType="Design Review"
    onConnect={handleConnect}
    onDismiss={() => setShowBanner(false)}
  />
)}
```

---

### 4. Enhanced MoreIntegrationsStep (Onboarding)

**Purpose**: Encourage connecting more integrations during onboarding
**Where**: Onboarding flow, after Aha Moment
**When**: After user connects first integration and sees value

```tsx
// Already integrated in /src/pages/onboarding.tsx

<MoreIntegrationsStep
  connectedIntegration="linear" // First integration they connected
  onNext={() => setCurrentStep('demo')}
  onSkip={() => setCurrentStep('demo')}
/>
```

**Features**:
- Shows value props for each additional integration
- "Why connect more?" benefit section
- Visual examples of what's unlocked
- Time expectations ("Takes 30 seconds")

---

### 5. Settings Integrations Page

**Purpose**: Complete integration hub with recommendations
**Where**: Settings → Integrations
**When**: Any time user wants to manage integrations

**Route**: `/settings/integrations`

**Features**:
- Connection status overview
- High impact recommendations
- All integrations grid
- Connect/disconnect management
- Coming soon section

No special usage - just navigate to the page!

---

## Helper Functions (from recommendations.ts)

### Get Recommended Integrations

```tsx
import { getRecommendedIntegrations } from '@/lib/integrations/recommendations';

const recommendations = getRecommendedIntegrations(['linear', 'github']);
// Returns sorted array by impact (high first)
```

### Get Next Integration

```tsx
import { getNextIntegration } from '@/lib/integrations/recommendations';

const nextRec = getNextIntegration(['linear']);
// Returns single best recommendation or null
```

### Should Show Prompt?

```tsx
import { shouldShowIntegrationPrompt } from '@/lib/integrations/recommendations';

const shouldShow = shouldShowIntegrationPrompt(
  userIntegrations, // ['linear']
  threadCount,      // 2
  lastDismissedAt   // Date or undefined
);
// Returns boolean
```

### Get New Capabilities

```tsx
import { getNewCapabilities } from '@/lib/integrations/recommendations';

const capabilities = getNewCapabilities(
  'github',           // Just connected
  ['linear', 'figma'] // Already had these
);
// Returns array of capability objects for celebration
```

### Integration Display Helpers

```tsx
import {
  getIntegrationName,
  getIntegrationIcon
} from '@/lib/integrations/recommendations';

const name = getIntegrationName('github'); // "GitHub"
const icon = getIntegrationIcon('github'); // "💻"
```

---

## Value Proposition Examples

Use these when customizing copy or adding new integrations:

### Linear + GitHub
```
Title: Auto-link PRs to Issues
Description: See which code changes are connected to which Linear issues—automatically.
Example: LIN-123 → PR #456 → Deploy ✓
```

### Linear + Figma
```
Title: Connect Designs to Tasks
Description: Know which designs are ready for dev and track design → dev → deploy.
Example: Figma "Onboarding" → LIN-123 → Deployed
```

### GitHub + Figma
```
Title: Track Design → Code
Description: Know when designs are implemented and catch design-code drift early.
Example: Figma "Onboarding v2" → PR #457 → Deployed
```

### Figma + GitHub
```
Title: Detect Design-Code Drift
Description: Get alerts when designs are updated but code hasn't changed.
Example: ⚠️ Design updated but code hasn't changed
```

### Any + Slack
```
Title: Get Notified of Changes
Description: Receive alerts in Slack when threads update or drift is detected.
Example: 💬 "⚠️ Design updated but code hasn't changed"
```

---

## Integration Template Mappings

When user creates thread, suggest integration based on template:

| Template Name | Suggest Integration | Reason |
|--------------|--------------------|---------|
| Design Review | Figma | Track design files |
| Design-Code Drift | Figma or GitHub | Detect drift |
| Code Review | GitHub | Track PRs |
| Feature Launch | GitHub or Linear | Track code & tasks |
| Bug Tracking | Linear or GitHub | Track issues & fixes |
| Sprint Planning | Linear | Track sprint items |
| Standups | Slack | Connect discussions |

```tsx
function getRequiredIntegration(template: string): IntegrationType | null {
  const mapping: Record<string, IntegrationType> = {
    'design-review': 'figma',
    'design-code-drift': 'figma',
    'code-review': 'github',
    'feature-launch': 'github',
    'bug-tracking': 'linear',
    'sprint-planning': 'linear',
    'standups': 'slack',
  };

  return mapping[template.toLowerCase()] || null;
}
```

---

## Common Patterns

### Pattern 1: Dashboard Integration Prompt

```tsx
// In dashboard.tsx
const [dismissed, setDismissed] = useState(false);
const userIntegrations = ['linear']; // From API
const threadCount = threadsData?.threads.length || 0;

const showPrompt = !dismissed && shouldShowIntegrationPrompt(
  userIntegrations,
  threadCount
);

return (
  <Layout>
    {/* ... analytics cards ... */}

    {showPrompt && (
      <IntegrationPrompt
        userIntegrations={userIntegrations}
        onConnect={(integration) => {
          // Start OAuth
          router.push(`/api/oauth/${integration}/start`);
        }}
        onDismiss={() => {
          setDismissed(true);
          localStorage.setItem('prompt-dismissed', Date.now().toString());
        }}
      />
    )}

    {/* ... rest of dashboard ... */}
  </Layout>
);
```

### Pattern 2: Post-OAuth Celebration

```tsx
// In OAuth callback page
useEffect(() => {
  if (oauthSuccess) {
    // Integration just connected
    const newIntegration = router.query.integration as IntegrationType;

    // Show celebration
    setJustConnected(newIntegration);
    setShowCelebration(true);
  }
}, [oauthSuccess]);

<IntegrationCelebration
  isOpen={showCelebration}
  onClose={() => {
    setShowCelebration(false);
    router.push('/dashboard');
  }}
  integration={justConnected!}
  existingIntegrations={userIntegrations.filter(i => i !== justConnected)}
  onCreateThread={() => {
    router.push(`/threads/new?integration=${justConnected}`);
  }}
/>
```

### Pattern 3: Thread Creation Flow

```tsx
// In thread creation modal/page
const handleTemplateSelect = (template: Template) => {
  const requiredIntegration = getRequiredIntegration(template.id);

  if (requiredIntegration && !userIntegrations.includes(requiredIntegration)) {
    // Show upsell modal
    setRequiredIntegration(requiredIntegration);
    setThreadType(template.name);
    setShowUpsell(true);
  } else {
    // Continue with thread creation
    continueCreating(template);
  }
};

<ThreadCreationUpsell
  isOpen={showUpsell}
  onClose={() => setShowUpsell(false)}
  requiredIntegration={requiredIntegration!}
  threadType={threadType}
  onConnect={() => {
    // Connect then continue
    connectAndContinue();
  }}
  onCreateWithout={() => {
    // Skip integration, create anyway
    continueCreating(selectedTemplate);
  }}
/>
```

---

## Styling Notes

All components use the app's design system:

- **Colors**: Primary purple, gradient backgrounds
- **Icons**: Heroicons outline variants
- **Spacing**: Tailwind spacing scale
- **Typography**: System font stack
- **Dark theme**: All components designed for dark backgrounds
- **Animations**: Subtle transitions and fades

**Key classes**:
- `bg-primary/10` - Light primary background
- `border-primary/30` - Subtle primary border
- `text-gray-400` - Secondary text
- `rounded-xl` - Large rounded corners
- `shadow-lg` - Elevated cards

---

## Testing Checklist

When testing these components:

- [ ] IntegrationPrompt appears on dashboard when conditions met
- [ ] IntegrationPrompt is dismissible and respects state
- [ ] Value propositions change based on connected integrations
- [ ] IntegrationCelebration shows after OAuth success
- [ ] Capabilities list is accurate for integration pair
- [ ] ThreadCreationUpsell appears for relevant templates
- [ ] Can create thread with or without suggested integration
- [ ] Settings integrations page shows all integrations
- [ ] Recommendations section highlights high-impact integrations
- [ ] All modals are keyboard accessible (Esc to close)
- [ ] All components work in mobile viewport
- [ ] Copy is specific and concrete (not vague)
- [ ] Time expectations are shown ("30 seconds")

---

## Quick Start

1. **Enable on dashboard**:
   - Already integrated in `/src/pages/dashboard.tsx`
   - Adjust `userIntegrations` mock to test different states

2. **Add to other pages**:
   ```tsx
   import { IntegrationPrompt } from '@/components/IntegrationPrompt';
   // Use anywhere you want to prompt for more integrations
   ```

3. **Connect to OAuth**:
   - Replace TODO comments with actual OAuth flow
   - Show celebration modal on success

4. **Track analytics**:
   - Log prompt impressions
   - Track connects vs dismissals
   - Measure time to 2nd integration

---

**Components ready to use!** All TypeScript types are properly defined and build is passing.
