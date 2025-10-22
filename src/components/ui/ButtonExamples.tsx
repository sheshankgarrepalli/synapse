/**
 * ButtonExamples Component
 *
 * Visual showcase of all Button variants, sizes, and states
 * for testing and documentation purposes.
 *
 * Phase 2: Core Component Library - Buttons & Inputs
 */

import { Button } from './Button';
import { PlusIcon, ArrowRightIcon, TrashIcon, CheckIcon } from '@heroicons/react/20/solid';

export function ButtonExamples() {
  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-4xl font-heading font-bold mb-2">Button Components</h1>
        <p className="text-muted-foreground">
          Enterprise-grade button components with complete state coverage
        </p>
      </div>

      {/* Variants Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-1">Variants</h2>
          <p className="text-sm text-muted-foreground">
            All button variants with their default styling
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center p-6 bg-card border border-border rounded-xl">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="success">Success Button</Button>
        </div>
      </section>

      {/* Sizes Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-1">Sizes</h2>
          <p className="text-sm text-muted-foreground">
            Five size options from extra small to extra large
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-end p-6 bg-card border border-border rounded-xl">
          <Button variant="primary" size="xs">Extra Small</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium (Default)</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" size="xl">Extra Large</Button>
        </div>
      </section>

      {/* States Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-1">States</h2>
          <p className="text-sm text-muted-foreground">
            Interactive states including hover, focus, active, disabled, and loading
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default State */}
          <div className="p-6 bg-card border border-border rounded-xl space-y-3">
            <h3 className="text-lg font-semibold">Default</h3>
            <Button variant="primary">Hover Me</Button>
            <p className="text-xs text-muted-foreground">
              Hover to see lift effect and shadow enhancement
            </p>
          </div>

          {/* Loading State */}
          <div className="p-6 bg-card border border-border rounded-xl space-y-3">
            <h3 className="text-lg font-semibold">Loading</h3>
            <Button variant="primary" loading>
              Creating Thread
            </Button>
            <p className="text-xs text-muted-foreground">
              Shows spinner and disables interaction
            </p>
          </div>

          {/* Disabled State */}
          <div className="p-6 bg-card border border-border rounded-xl space-y-3">
            <h3 className="text-lg font-semibold">Disabled</h3>
            <Button variant="primary" disabled>
              Disabled Button
            </Button>
            <p className="text-xs text-muted-foreground">
              Reduced opacity, no pointer events
            </p>
          </div>

          {/* Focus State */}
          <div className="p-6 bg-card border border-border rounded-xl space-y-3">
            <h3 className="text-lg font-semibold">Focus</h3>
            <Button variant="primary">Tab to Focus</Button>
            <p className="text-xs text-muted-foreground">
              Use Tab key to see gold focus ring
            </p>
          </div>
        </div>
      </section>

      {/* With Icons Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-1">With Icons</h2>
          <p className="text-sm text-muted-foreground">
            Buttons can include left or right icons using Heroicons
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center p-6 bg-card border border-border rounded-xl">
          <Button variant="primary" leftIcon={<PlusIcon />}>
            Create Thread
          </Button>
          <Button variant="secondary" rightIcon={<ArrowRightIcon />}>
            View Details
          </Button>
          <Button variant="danger" leftIcon={<TrashIcon />}>
            Delete
          </Button>
          <Button variant="success" leftIcon={<CheckIcon />}>
            Approve
          </Button>
        </div>
      </section>

      {/* Full Width Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-1">Full Width</h2>
          <p className="text-sm text-muted-foreground">
            Buttons can span the full width of their container
          </p>
        </div>

        <div className="space-y-3 p-6 bg-card border border-border rounded-xl">
          <Button variant="primary" fullWidth>
            Full Width Primary Button
          </Button>
          <Button variant="secondary" fullWidth>
            Full Width Secondary Button
          </Button>
        </div>
      </section>

      {/* Loading States (All Variants) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-1">Loading States</h2>
          <p className="text-sm text-muted-foreground">
            All variants in loading state with animated spinner
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center p-6 bg-card border border-border rounded-xl">
          <Button variant="primary" loading>
            Processing
          </Button>
          <Button variant="secondary" loading>
            Loading
          </Button>
          <Button variant="ghost" loading>
            Please Wait
          </Button>
          <Button variant="danger" loading>
            Deleting
          </Button>
          <Button variant="success" loading>
            Saving
          </Button>
        </div>
      </section>

      {/* All Sizes with Icons */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-1">Sizes with Icons</h2>
          <p className="text-sm text-muted-foreground">
            Icon sizes automatically adjust to button size
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-end p-6 bg-card border border-border rounded-xl">
          <Button variant="primary" size="xs" leftIcon={<PlusIcon />}>
            Extra Small
          </Button>
          <Button variant="primary" size="sm" leftIcon={<PlusIcon />}>
            Small
          </Button>
          <Button variant="primary" size="md" leftIcon={<PlusIcon />}>
            Medium
          </Button>
          <Button variant="primary" size="lg" leftIcon={<PlusIcon />}>
            Large
          </Button>
          <Button variant="primary" size="xl" leftIcon={<PlusIcon />}>
            Extra Large
          </Button>
        </div>
      </section>

      {/* Real-World Examples */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-1">Real-World Examples</h2>
          <p className="text-sm text-muted-foreground">
            Common button combinations used in the Synapse interface
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Thread Dialog */}
          <div className="p-6 bg-card border border-border rounded-xl space-y-4">
            <h3 className="text-lg font-semibold">Create Thread Dialog</h3>
            <div className="space-y-3">
              <div className="h-20 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                Form Fields Here
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost">Cancel</Button>
                <Button variant="primary" leftIcon={<PlusIcon />}>
                  Create Thread
                </Button>
              </div>
            </div>
          </div>

          {/* Delete Confirmation */}
          <div className="p-6 bg-card border border-border rounded-xl space-y-4">
            <h3 className="text-lg font-semibold">Delete Confirmation</h3>
            <div className="space-y-3">
              <div className="h-20 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                Warning Message
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost">Cancel</Button>
                <Button variant="danger" leftIcon={<TrashIcon />}>
                  Delete Thread
                </Button>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="p-6 bg-card border border-border rounded-xl space-y-4">
            <h3 className="text-lg font-semibold">Action Panel</h3>
            <div className="space-y-3">
              <Button variant="primary" fullWidth leftIcon={<PlusIcon />}>
                New Thread
              </Button>
              <Button variant="secondary" fullWidth rightIcon={<ArrowRightIcon />}>
                View All Threads
              </Button>
              <Button variant="ghost" fullWidth>
                Settings
              </Button>
            </div>
          </div>

          {/* Multi-Action Card */}
          <div className="p-6 bg-card border border-border rounded-xl space-y-4">
            <h3 className="text-lg font-semibold">Thread Card Actions</h3>
            <div className="space-y-3">
              <div className="h-16 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                Thread Info
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" rightIcon={<ArrowRightIcon />}>
                  View
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
                <Button variant="ghost" size="sm">
                  Share
                </Button>
                <Button variant="danger" size="sm" leftIcon={<TrashIcon />}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Specifications */}
      <section className="space-y-4 p-6 bg-muted/50 border border-border rounded-xl">
        <h2 className="text-2xl font-heading font-semibold">Design Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Colors</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>Primary: bg-primary (#D4A574 gold)</li>
              <li>Hover: bg-primary-500 (#C89557)</li>
              <li>Active: bg-primary-600 (#B37D3D)</li>
              <li>Focus Ring: rgba(212,165,116,0.3)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Transitions</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>Duration: 200ms</li>
              <li>Easing: cubic-bezier(0.4, 0, 0.2, 1)</li>
              <li>Hover Lift: translateY(-0.5px)</li>
              <li>Shadow Enhancement on Hover</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Sizing</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>XS: 32px height, 8px×16px padding</li>
              <li>SM: 36px height, 8px×20px padding</li>
              <li>MD: 44px height, 12px×24px padding</li>
              <li>LG: 48px height, 14px×28px padding</li>
              <li>XL: 56px height, 16px×32px padding</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Accessibility</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>Visible focus indicators</li>
              <li>Proper ARIA attributes</li>
              <li>Keyboard navigation support</li>
              <li>44px minimum touch target</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
