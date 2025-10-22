'use client';

import { useState } from 'react';
import {
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  Toggle,
  FormField,
  FormRow,
  FormSection,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';

/**
 * Form Controls Demo Page
 * Showcases all Phase 2 form control components with interactive examples
 */
export default function FormControlsDemo() {
  // State for demos
  const [checkboxStates, setCheckboxStates] = useState({
    basic: false,
    withLabel: false,
    indeterminate: true,
    disabled: false,
    error: false,
  });

  const [radioValue, setRadioValue] = useState('option1');
  const [selectValue, setSelectValue] = useState('');
  const [toggleStates, setToggleStates] = useState({
    basic: false,
    withLabel: true,
    disabled: false,
  });

  const selectOptions = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'error', label: 'Error' },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Form Controls Library
          </h1>
          <p className="text-muted-foreground">
            Phase 2: Enterprise-grade form components with full accessibility support
          </p>
        </div>

        {/* Checkbox Component */}
        <FormSection
          title="Checkbox Component"
          description="Custom styled checkboxes with unchecked, checked, indeterminate, and disabled states"
        >
          <Card>
            <CardHeader>
              <CardTitle>Checkbox States</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Basic Checkbox */}
                <Checkbox
                  checked={checkboxStates.basic}
                  onChange={(e) =>
                    setCheckboxStates({ ...checkboxStates, basic: e.target.checked })
                  }
                  label="Basic checkbox"
                  helperText="Click to toggle checkbox state"
                />

                {/* Checkbox with Label */}
                <Checkbox
                  checked={checkboxStates.withLabel}
                  onChange={(e) =>
                    setCheckboxStates({ ...checkboxStates, withLabel: e.target.checked })
                  }
                  label="I agree to the terms and conditions"
                />

                {/* Indeterminate Checkbox */}
                <Checkbox
                  checked={checkboxStates.indeterminate}
                  indeterminate={checkboxStates.indeterminate}
                  onChange={(e) =>
                    setCheckboxStates({ ...checkboxStates, indeterminate: !checkboxStates.indeterminate })
                  }
                  label="Indeterminate state (partially selected)"
                  helperText="Click to toggle between indeterminate and checked"
                />

                {/* Disabled Checkbox */}
                <Checkbox
                  checked={checkboxStates.disabled}
                  disabled
                  label="Disabled checkbox"
                  helperText="This checkbox is disabled"
                />

                {/* Error Checkbox */}
                <Checkbox
                  checked={checkboxStates.error}
                  onChange={(e) =>
                    setCheckboxStates({ ...checkboxStates, error: e.target.checked })
                  }
                  label="Checkbox with error"
                  error="You must accept the terms to continue"
                />
              </div>
            </CardContent>
          </Card>
        </FormSection>

        {/* Radio Button Component */}
        <FormSection
          title="Radio Button Component"
          description="Custom styled radio buttons with group support and optional descriptions"
        >
          <Card>
            <CardHeader>
              <CardTitle>Radio Group Example</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                name="demo-radio"
                value={radioValue}
                onChange={setRadioValue}
                label="Choose a thread status"
                helperText="Select one option from the list"
              >
                <Radio
                  value="option1"
                  label="Active Threads"
                  description="Threads that are currently running"
                />
                <Radio
                  value="option2"
                  label="Paused Threads"
                  description="Threads that are temporarily paused"
                />
                <Radio
                  value="option3"
                  label="Completed Threads"
                  description="Threads that have finished successfully"
                />
                <Radio
                  value="option4"
                  label="Errored Threads"
                  description="Threads with errors that need attention"
                />
              </RadioGroup>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Selected value: <span className="font-mono text-primary">{radioValue}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Horizontal Radio Group */}
          <Card>
            <CardHeader>
              <CardTitle>Horizontal Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                name="horizontal-demo"
                value={radioValue}
                onChange={setRadioValue}
                orientation="horizontal"
                label="Quick selection"
              >
                <Radio value="option1" label="Active" />
                <Radio value="option2" label="Paused" />
                <Radio value="option3" label="Completed" />
              </RadioGroup>
            </CardContent>
          </Card>
        </FormSection>

        {/* Select Component */}
        <FormSection
          title="Select Component"
          description="Custom styled dropdown with enhanced states and accessibility"
        >
          <FormRow columns={2}>
            <Card>
              <CardHeader>
                <CardTitle>Basic Select</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  label="Thread Status"
                  value={selectValue}
                  onChange={setSelectValue}
                  options={selectOptions}
                  placeholder="Select a status..."
                  helperText="Choose the current status of your thread"
                />

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectValue || 'None'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select with Error</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  label="Priority Level"
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                  placeholder="Select priority..."
                  error="Priority is required"
                />
              </CardContent>
            </Card>
          </FormRow>

          <Card>
            <CardHeader>
              <CardTitle>Select with Disabled Options</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                label="Account Type"
                value=""
                onChange={() => {}}
                options={[
                  { value: 'free', label: 'Free' },
                  { value: 'pro', label: 'Pro' },
                  { value: 'enterprise', label: 'Enterprise', disabled: true },
                ]}
                placeholder="Select account type..."
                helperText="Enterprise plans coming soon"
              />
            </CardContent>
          </Card>
        </FormSection>

        {/* Toggle Switch Component */}
        <FormSection
          title="Toggle Switch Component"
          description="Animated toggle switches with smooth transitions and multiple sizes"
        >
          <Card>
            <CardHeader>
              <CardTitle>Toggle Switches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Small Toggle */}
                <Toggle
                  size="sm"
                  checked={toggleStates.basic}
                  onChange={(e) =>
                    setToggleStates({ ...toggleStates, basic: e.target.checked })
                  }
                  label="Small toggle"
                  description="Compact size for inline controls"
                />

                {/* Medium Toggle (default) */}
                <Toggle
                  checked={toggleStates.withLabel}
                  onChange={(e) =>
                    setToggleStates({ ...toggleStates, withLabel: e.target.checked })
                  }
                  label="Enable notifications"
                  description="Receive email notifications for thread updates"
                />

                {/* Large Toggle */}
                <Toggle
                  size="lg"
                  checked={toggleStates.basic}
                  onChange={(e) =>
                    setToggleStates({ ...toggleStates, basic: e.target.checked })
                  }
                  label="Large toggle"
                  description="Larger size for emphasis"
                />

                {/* Disabled Toggle */}
                <Toggle
                  checked={toggleStates.disabled}
                  disabled
                  label="Disabled toggle"
                  description="This toggle is disabled"
                />

                {/* Toggle with Error */}
                <Toggle
                  checked={false}
                  onChange={() => {}}
                  label="Terms and Conditions"
                  error="You must accept the terms to continue"
                />
              </div>
            </CardContent>
          </Card>
        </FormSection>

        {/* FormField Wrapper */}
        <FormSection
          title="FormField Wrapper Component"
          description="Reusable wrapper for consistent form field layouts with labels, helper text, and error messages"
        >
          <Card>
            <CardHeader>
              <CardTitle>Vertical Layout (Default)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  label="Project Name"
                  required
                  helperText="Enter a descriptive name for your project"
                >
                  <input
                    type="text"
                    className="w-full h-11 px-4 py-3 bg-background border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="My Awesome Project"
                  />
                </FormField>

                <FormField
                  label="Email Address"
                  labelOptional
                  helperText="We'll never share your email with anyone else"
                >
                  <input
                    type="email"
                    className="w-full h-11 px-4 py-3 bg-background border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="you@example.com"
                  />
                </FormField>

                <FormField
                  label="Password"
                  error="Password must be at least 8 characters"
                >
                  <input
                    type="password"
                    className="w-full h-11 px-4 py-3 bg-background border-2 border-error rounded-lg focus:border-error focus:ring-2 focus:ring-error/30 transition-all"
                    placeholder="••••••••"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horizontal Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  label="Full Name"
                  layout="horizontal"
                  helperText="Enter your first and last name"
                >
                  <input
                    type="text"
                    className="w-full h-11 px-4 py-3 bg-background border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="John Doe"
                  />
                </FormField>

                <FormField
                  label="Company"
                  layout="horizontal"
                  labelOptional
                >
                  <input
                    type="text"
                    className="w-full h-11 px-4 py-3 bg-background border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="Acme Inc."
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </FormSection>

        {/* Complete Form Example */}
        <FormSection
          title="Complete Form Example"
          description="All components working together in a real-world form"
        >
          <Card>
            <CardHeader>
              <CardTitle>Create New Thread</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <FormRow columns={2}>
                  <FormField label="Thread Name" required>
                    <input
                      type="text"
                      className="w-full h-11 px-4 py-3 bg-background border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                      placeholder="Feature Launch: New Dashboard"
                    />
                  </FormField>

                  <Select
                    label="Status"
                    value={selectValue}
                    onChange={setSelectValue}
                    options={selectOptions}
                    placeholder="Select status..."
                  />
                </FormRow>

                <FormField
                  label="Description"
                  helperText="Provide a brief description of this thread"
                >
                  <textarea
                    className="w-full min-h-24 px-4 py-3 bg-background border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all resize-vertical"
                    placeholder="Describe your thread..."
                  />
                </FormField>

                <RadioGroup
                  name="priority"
                  value="medium"
                  onChange={() => {}}
                  label="Priority"
                  orientation="horizontal"
                >
                  <Radio value="low" label="Low" />
                  <Radio value="medium" label="Medium" />
                  <Radio value="high" label="High" />
                </RadioGroup>

                <div className="space-y-3">
                  <Toggle
                    checked={true}
                    onChange={() => {}}
                    label="Enable notifications"
                    description="Get notified when there are updates"
                  />

                  <Checkbox
                    checked={true}
                    onChange={() => {}}
                    label="I agree to the terms and conditions"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary">
                    Create Thread
                  </Button>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </FormSection>
      </div>
    </div>
  );
}
