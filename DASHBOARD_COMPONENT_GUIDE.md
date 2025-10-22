# Dashboard Components - Usage Guide

## Quick Start

```tsx
import {
  GreetingHeader,
  ThreadActivityChart,
  ActivityPanel,
  EnhancedThreadCard,
  StatusBadge,
} from '@/components/dashboard';
```

## Component Examples

### 1. GreetingHeader

Displays a personalized, time-based greeting.

```tsx
<GreetingHeader />
// Output: "Good afternoon, Jessica 👋"
//         "Track and manage your Golden Threads across all integrations"

// With custom subtitle
<GreetingHeader subtitle="Your custom subtitle here" />
```

**Props:**
- `subtitle?: string` - Custom subtitle text (default: "Track and manage your Golden Threads across all integrations")

---

### 2. ThreadActivityChart

Area chart showing thread activity over time.

```tsx
const chartData = [
  { day: 'Mon', totalThreads: 12, synced: 10 },
  { day: 'Tue', totalThreads: 19, synced: 15 },
  { day: 'Wed', totalThreads: 15, synced: 13 },
  { day: 'Thu', totalThreads: 18, synced: 14 },
  { day: 'Fri', totalThreads: 24, synced: 20 },
  { day: 'Sat', totalThreads: 22, synced: 19 },
  { day: 'Sun', totalThreads: 14, synced: 12 },
];

<ThreadActivityChart
  data={chartData}
  title="Thread Activity"
  subtitle="Last 7 days"
/>
```

**Props:**
- `data: Array<{ day: string; totalThreads: number; synced: number }>` - Chart data (required)
- `title?: string` - Chart title (default: "Thread Activity")
- `subtitle?: string` - Chart subtitle (default: "Last 7 days")

---

### 3. ActivityPanel

Daily activity breakdown with percentage bars.

```tsx
const dailyActivity = [
  { day: 'Mon', percentage: 92, color: 'blue' },
  { day: 'Tue', percentage: 41, color: 'red' },
  { day: 'Wed', percentage: 78, color: 'teal' },
  { day: 'Thu', percentage: 0, color: 'gray' },
  { day: 'Fri', percentage: 63, color: 'orange' },
];

<ActivityPanel
  activityPercentage={83}
  trend={19}
  dailyActivity={dailyActivity}
/>
```

**Props:**
- `activityPercentage: number` - Overall activity percentage (required)
- `trend?: number` - Trend indicator (positive or negative percentage)
- `dailyActivity: Array<{ day: string; percentage: number; color: string }>` - Daily breakdown (required)

**Color Options:** `'blue'` | `'red'` | `'teal'` | `'gray'` | `'orange'` | `'green'` | `'purple'`

---

### 4. EnhancedThreadCard

Enhanced thread card with rainbow gradient border.

```tsx
<EnhancedThreadCard
  title="Design System Update - Button Component"
  description="Updating button variants to match new brand guidelines"
  status="active"
  priority="high"
  updateCount={3}
  integrations={[
    <FigmaIcon key="figma" />,
    <GitHubIcon key="github" />,
    <LinearIcon key="linear" />
  ]}
  teamMembers={[
    { name: 'Jessica Smith', initials: 'JS', color: 'bg-orange-500' },
    { name: 'Mike Brown', initials: 'MB', color: 'bg-teal-500' },
  ]}
  timestamp="2h ago"
  message="Figma design updated 2h ago, but code hasn't been synced"
/>
```

**Props:**
- `title: string` - Thread title (required)
- `description: string` - Thread description (required)
- `status: 'active' | 'needs-attention' | 'paused'` - Status badge (required)
- `priority: 'urgent' | 'high' | 'medium' | 'low'` - Priority badge (required)
- `updateCount?: number` - Number of updates
- `integrations?: ReactNode[]` - Integration icons
- `teamMembers?: Array<{ name: string; initials: string; color: string }>` - Team avatars
- `timestamp?: string` - Time indicator (e.g., "2h ago")
- `message?: string` - Activity message

---

### 5. StatusBadge

Reusable status or priority badge.

```tsx
// Status badges
<StatusBadge variant="active" />
<StatusBadge variant="needs-attention" />
<StatusBadge variant="paused" />

// Priority badges
<StatusBadge variant="urgent" />
<StatusBadge variant="high" />
<StatusBadge variant="medium" />
<StatusBadge variant="low" />

// With custom size
<StatusBadge variant="active" size="md" />
```

**Props:**
- `variant: 'active' | 'needs-attention' | 'paused' | 'urgent' | 'high' | 'medium' | 'low'` - Badge type (required)
- `size?: 'sm' | 'md'` - Badge size (default: 'sm')

**Variant Colors:**
- `active` → Green
- `needs-attention` → Red
- `paused` → Orange
- `urgent` → Red
- `high` → Red
- `medium` → Orange
- `low` → Blue

---

### 6. StatsCard (Updated)

Enhanced stats card with icon and trend indicator.

```tsx
import { BoltIcon } from '@heroicons/react/24/solid';

<StatsCard
  label="Active Threads"
  value={24}
  change={12}
  icon={<BoltIcon className="w-6 h-6" />}
  iconColor="orange"
  description="Across 8 projects"
  interactive
/>
```

**Props:**
- `label: string` - Card label (required)
- `value: string | number` - Large number to display (required)
- `change?: number` - Trend percentage
- `icon?: ReactNode` - Icon to display
- `iconColor?: 'orange' | 'teal' | 'red' | 'blue' | 'green' | 'purple'` - Icon background color
- `description?: string` - Subtitle text
- `interactive?: boolean` - Enable hover effects
- `actionLabel?: string` - Action link text
- `onActionClick?: () => void` - Action handler

---

## Layout Example

Full dashboard layout using all components:

```tsx
export default function Dashboard() {
  return (
    <LayoutNew>
      {/* Greeting + Action Button */}
      <div className="flex justify-between items-start mb-8">
        <GreetingHeader />
        <Button variant="primary">New Thread</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard {...} />
        <StatsCard {...} />
        <StatsCard {...} />
      </div>

      {/* Chart + Activity Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ThreadActivityChart data={chartData} />
        </div>
        <div>
          <ActivityPanel {...} />
        </div>
      </div>

      {/* Thread Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EnhancedThreadCard {...} />
        <EnhancedThreadCard {...} />
        <EnhancedThreadCard {...} />
        <EnhancedThreadCard {...} />
      </div>
    </LayoutNew>
  );
}
```

---

## Theming

All components automatically adapt to light/dark mode using Tailwind's dark mode:

```tsx
// No special setup needed - components use theme-aware colors
// from CSS variables defined in globals.css

// Light mode: White backgrounds, black text
// Dark mode: Navy blue cards, white text

// Toggle theme using your existing theme provider
```

---

## Customization

### Custom Colors

To add custom colors to components, update the color classes in the component files:

```tsx
// In ActivityPanel.tsx
const colorClasses = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  myCustomColor: 'bg-purple-600', // Add custom color
  // ...
};
```

### Custom Icons

Create your own integration icons:

```tsx
const MyCustomIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="..." />
  </svg>
);

<EnhancedThreadCard
  integrations={[<MyCustomIcon key="custom" />]}
  {...}
/>
```

### Custom Team Member Colors

Use any Tailwind color class for team member avatars:

```tsx
teamMembers={[
  { name: 'Alice', initials: 'AA', color: 'bg-pink-500' },
  { name: 'Bob', initials: 'BB', color: 'bg-indigo-500' },
  { name: 'Charlie', initials: 'CC', color: 'bg-amber-500' },
]}
```

---

## Accessibility

All components include:
- Semantic HTML elements
- ARIA labels for icons and images
- Keyboard navigation support
- Focus indicators
- Screen reader friendly text

---

## Performance Tips

1. **Lazy Load Thread Cards**: Use React.lazy() for large lists
2. **Virtualize Lists**: Use react-window for 100+ threads
3. **Memoize Chart Data**: Use useMemo() to prevent re-renders
4. **Optimize Images**: Use Next.js Image component for avatars

---

## TypeScript Support

All components are fully typed. Import types as needed:

```tsx
import type {
  GreetingHeaderProps,
  ThreadActivityChartProps,
  ActivityPanelProps,
  EnhancedThreadCardProps,
  StatusBadgeProps,
} from '@/components/dashboard';
```

---

## Browser Support

Components work in all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## FAQs

**Q: Can I use these components outside the dashboard?**
A: Yes! All components are reusable and can be used anywhere in your app.

**Q: How do I change the chart colors?**
A: Edit the gradient definitions in `ThreadActivityChart.tsx` and update the stroke colors.

**Q: Can I add more status badges?**
A: Yes! Add new variants to the `StatusBadge` component's `variantClasses` object.

**Q: How do I connect real data?**
A: Replace the mock data in `dashboard.tsx` with API calls using tRPC or your preferred data fetching method.

**Q: Are the components responsive?**
A: Yes! All components use Tailwind's responsive utilities and adapt to different screen sizes.

---

For more information, see `DASHBOARD_REDESIGN_SUMMARY.md`
