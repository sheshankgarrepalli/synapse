# Phase 3: Layout & Navigation Architecture

## Component Hierarchy

```
LayoutNew
├── TopBar
│   ├── Menu Toggle Button
│   ├── Logo
│   ├── Search Bar (→ opens CommandPalette)
│   ├── NotificationBell (Headless UI Menu)
│   │   └── Dropdown
│   │       ├── Header ("Notifications", "Mark all read")
│   │       ├── Notification Items
│   │       └── Footer ("View all notifications")
│   └── UserButton (Clerk component)
│
├── Sidebar (Desktop: md:block)
│   ├── Toggle Button
│   ├── Navigation Items
│   │   ├── MAIN Section
│   │   │   ├── Dashboard
│   │   │   └── Threads (expandable)
│   │   │       ├── Active (12)
│   │   │       ├── Paused (4)
│   │   │       ├── Completed (48)
│   │   │       └── Errored (2)
│   │   └── WORKSPACE Section
│   │       ├── Team
│   │       ├── Projects
│   │       ├── Integrations
│   │       └── Settings
│   └── New Thread CTA Button
│
├── MobileNav (Mobile: < md)
│   └── Headless UI Dialog
│       ├── Backdrop (dark + blur)
│       ├── Close Button
│       └── Sidebar (full content)
│
├── Main Content Area
│   └── {children} (max-width: 1440px)
│
└── CommandPalette
    └── (controlled by TopBar search)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         LayoutNew                           │
│                                                             │
│  State:                                                     │
│  ├── sidebarExpanded: boolean                              │
│  ├── mobileNavOpen: boolean                                │
│  ├── isCommandPaletteOpen: boolean                         │
│  ├── isMobile: boolean                                     │
│  └── [other modal states...]                               │
│                                                             │
│  Effects:                                                   │
│  ├── Mobile detection (resize listener)                    │
│  ├── LocalStorage sync (sidebar state)                     │
│  └── Keyboard shortcuts (Cmd+K)                            │
└─────────────────────────────────────────────────────────────┘
              ▼                    ▼                   ▼
        ┌──────────┐         ┌──────────┐       ┌─────────┐
        │  TopBar  │         │ Sidebar  │       │ MobileNav│
        └──────────┘         └──────────┘       └─────────┘
              │                    │                   │
              ├─ onMenuToggle ────►│                   │
              ├─ sidebarExpanded ──┤                   │
              └─ onSearchClick ────► CommandPalette    │
                                   │                   │
                              onToggle ◄──── isOpen ───┤
```

## State Management Flow

### Sidebar Toggle (Desktop)

```
User clicks toggle button
         │
         ▼
  Sidebar.onToggle()
         │
         ▼
  LayoutNew.setSidebarExpanded(prev => !prev)
         │
         ▼
  useEffect detects change
         │
         ▼
  localStorage.setItem('sidebar-expanded', 'true/false')
         │
         ▼
  Sidebar re-renders with new width
         │
         ▼
  Main content margin animates
```

### Mobile Menu Toggle

```
User clicks hamburger
         │
         ▼
  TopBar.onMenuToggle()
         │
         ▼
  LayoutNew.setMobileNavOpen(true)
         │
         ▼
  MobileNav receives isOpen={true}
         │
         ▼
  Headless UI Dialog opens
         │
         ▼
  Backdrop + Drawer slide in
```

### Search Activation

```
User clicks search bar OR presses Cmd+K
         │
         ▼
  TopBar.onSearchClick() OR useKeyboardShortcut callback
         │
         ▼
  LayoutNew.setIsCommandPaletteOpen(true)
         │
         ▼
  CommandPalette receives isOpen={true}
         │
         ▼
  Command Palette modal opens
```

## Responsive Breakpoints

```css
/* Mobile: < 768px */
.layout {
  TopBar: visible (simplified)
  Sidebar: hidden
  MobileNav: slide-in drawer
  Content: full width, padding: 24px
}

/* Tablet: 768px - 1023px */
.layout {
  TopBar: visible (full)
  Sidebar: visible (collapsible, starts collapsed)
  MobileNav: hidden
  Content: margin-left: 72px/280px, padding: 32px
}

/* Desktop: 1024px+ */
.layout {
  TopBar: visible (full + kbd hints)
  Sidebar: visible (expanded by default)
  MobileNav: hidden
  Content: margin-left: 72px/280px, padding: 48px, max-width: 1440px
}
```

## CSS Classes & Transitions

### Sidebar Width Transition

```tsx
<aside className={cn(
  "transition-all duration-300 ease-smooth",
  expanded ? "w-[280px]" : "w-[72px]"
)}>
```

### Main Content Margin

```tsx
<main className={cn(
  "transition-all duration-300 ease-smooth",
  !isMobile && (sidebarExpanded ? "md:ml-[280px]" : "md:ml-[72px]")
)}>
```

### Active Navigation State

```tsx
<Link className={cn(
  isActive
    ? "bg-primary-50 text-primary-700 font-semibold border-l-3 border-primary-400"
    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
)}>
```

## Integration Points

### 1. Clerk Authentication

```tsx
import { UserButton, useUser } from '@clerk/nextjs';

// In TopBar
<UserButton
  afterSignOutUrl="/"
  appearance={{
    elements: { avatarBox: 'h-8 w-8' }
  }}
/>
```

### 2. Command Palette

```tsx
import { CommandPalette } from '@/components/CommandPalette';

// In LayoutNew
<CommandPalette
  isOpen={isCommandPaletteOpen}
  onClose={() => setIsCommandPaletteOpen(false)}
  setIsCreateThreadModalOpen={setIsCreateThreadModalOpen}
  setIsIntegrationModalOpen={setIsIntegrationModalOpen}
/>
```

### 3. Next.js Router

```tsx
import { useRouter } from 'next/router';

// In Sidebar
const router = useRouter();
const isActive = (href: string) => router.pathname === href;
```

### 4. Keyboard Shortcuts Hook

```tsx
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

// In LayoutNew
useKeyboardShortcut(
  { key: 'k', metaKey: true },
  () => setIsCommandPaletteOpen(prev => !prev)
);
```

## Design Token Mapping

### Spacing

```
Component             Property              Token         Value
─────────────────────────────────────────────────────────────
TopBar                height                space-16      64px
Sidebar (expanded)    width                 280px         280px
Sidebar (collapsed)   width                 72px          72px
Content padding       padding (mobile)      space-6       24px
Content padding       padding (tablet)      space-8       32px
Content padding       padding (desktop)     space-12      48px
Nav item height       height                space-10      40px
Icon size             width/height          space-5       20px
Icon-text gap         gap                   gap-3         12px
Section gap           space-y               space-y-6     24px
```

### Colors

```
Element                State       Background         Text
──────────────────────────────────────────────────────────────
TopBar                 default     bg-background      text-foreground
Sidebar                default     bg-secondary       text-foreground
Nav item               default     transparent        text-gray-600
Nav item               hover       bg-gray-100        text-gray-900
Nav item               active      bg-primary-50      text-primary-700
Sub-item badge         active      bg-success-100     text-success-700
Sub-item badge         paused      bg-warning-100     text-warning-700
Sub-item badge         error       bg-error-100       text-error-700
CTA button             default     bg-primary         text-white
CTA button             hover       bg-primary-500     text-white
```

### Shadows

```
Component              Shadow
─────────────────────────────────────
TopBar                 none (border only)
Sidebar                none (border only)
Notification dropdown  shadow-lg
Mobile drawer backdrop bg-gray-900/80 + backdrop-blur
CTA button             shadow-sm
```

## Performance Considerations

### 1. Re-render Optimization

```tsx
// Memoize expensive components
const Sidebar = React.memo(({ expanded, onToggle }) => {
  // Component implementation
});

// Minimize state updates
const handleToggle = useCallback(() => {
  setSidebarExpanded(prev => !prev);
}, []);
```

### 2. Transition Performance

```css
/* Use transform instead of width for better performance */
.sidebar {
  transform: translateX(0);
  transition: transform 300ms ease-smooth;
}

.sidebar.collapsed {
  transform: translateX(-208px); /* 280px - 72px */
}
```

### 3. Event Listener Cleanup

```tsx
useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}, []);
```

## Accessibility Architecture

### ARIA Roles

```tsx
<header role="banner">        {/* TopBar */}
<nav role="navigation">       {/* Sidebar */}
<main role="main">            {/* Content area */}
<button aria-label="...">     {/* Icon-only buttons */}
<div role="dialog">           {/* MobileNav */}
```

### Focus Management

```
Tab Order:
1. TopBar hamburger menu
2. TopBar logo (link)
3. TopBar search bar
4. TopBar notification bell
5. TopBar user button
6. Sidebar navigation items (when visible)
7. Sidebar CTA button
8. Main content area
```

### Keyboard Shortcuts

```
Shortcut        Action
─────────────────────────────────────
Cmd/Ctrl + K    Open Command Palette
Tab             Navigate forward
Shift + Tab     Navigate backward
Escape          Close modals/dropdowns
Enter           Activate button/link
Arrow Keys      Navigate menus
```

## File Size & Bundle Impact

```
Component         Lines    Minified    Gzipped
───────────────────────────────────────────────
TopBar.tsx        212      ~8 KB       ~3 KB
Sidebar.tsx       324      ~12 KB      ~4 KB
MobileNav.tsx     76       ~3 KB       ~1 KB
LayoutNew.tsx     115      ~4 KB       ~1.5 KB
index.ts          4        <1 KB       <1 KB
───────────────────────────────────────────────
Total             731      ~27 KB      ~9.5 KB
```

Plus dependencies (already in bundle):
- @headlessui/react: ~20 KB
- @heroicons/react: ~5 KB (tree-shaken)

**Total Impact**: ~15 KB gzipped (using existing deps)

## Testing Strategy

### Unit Tests (Recommended)

```typescript
describe('Sidebar', () => {
  it('renders expanded by default', () => {});
  it('collapses when toggle clicked', () => {});
  it('persists state to localStorage', () => {});
  it('shows tooltips when collapsed', () => {});
  it('highlights active route', () => {});
  it('expands sub-items correctly', () => {});
});

describe('TopBar', () => {
  it('renders all navigation elements', () => {});
  it('opens search on click', () => {});
  it('shows notification count', () => {});
  it('opens notification dropdown', () => {});
});

describe('MobileNav', () => {
  it('renders drawer when open', () => {});
  it('closes on backdrop click', () => {});
  it('closes on navigation', () => {});
});

describe('LayoutNew', () => {
  it('manages sidebar state', () => {});
  it('detects mobile viewport', () => {});
  it('handles keyboard shortcuts', () => {});
  it('adjusts content margin', () => {});
});
```

### Integration Tests

```typescript
describe('Layout Integration', () => {
  it('sidebar toggle affects content margin', () => {});
  it('mobile menu opens on hamburger click', () => {});
  it('search opens command palette', () => {});
  it('active states reflect current route', () => {});
});
```

### E2E Tests (Playwright/Cypress)

```typescript
describe('Navigation Flow', () => {
  it('user can navigate between pages', () => {});
  it('sidebar state persists on reload', () => {});
  it('mobile drawer works on small screens', () => {});
  it('keyboard shortcuts work correctly', () => {});
});
```

## Future Scalability

### Customizable Navigation

```typescript
// Allow dynamic navigation items from config
interface NavigationConfig {
  items: NavItem[];
  sections: Section[];
  pinnedItems: string[];
}

// User preferences
interface LayoutPreferences {
  sidebarDefaultExpanded: boolean;
  sidebarItemOrder: string[];
  pinnedPages: string[];
  theme: 'light' | 'dark' | 'auto';
}
```

### Multi-workspace Support

```typescript
// Workspace switcher in TopBar
<WorkspaceSwitcher
  currentWorkspace={workspace}
  workspaces={userWorkspaces}
  onSwitch={(id) => switchWorkspace(id)}
/>

// Workspace-specific navigation
const navigation = getNavigationForWorkspace(workspace.id);
```

### Real-time Updates

```typescript
// WebSocket integration for notifications
useEffect(() => {
  const subscription = pusher
    .channel('notifications')
    .bind('new-notification', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

  return () => subscription.unbind();
}, []);
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-20
**Maintained By**: Synapse Development Team
