/**
 * Settings Page
 * Organization and user settings management
 */

import { useState } from 'react';
import Head from 'next/head';
import { api } from '@/utils/api';
import { Layout } from '@/components/Layout';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'organization' | 'personal'>('organization');

  return (
    <Layout>
      <Head>
        <title>Settings - Synapse</title>
      </Head>

      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-2 text-gray-400">
            Manage your organization and personal preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('organization')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'organization'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
              }`}
            >
              Organization
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'personal'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
              }`}
            >
              Personal
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'organization' && <OrganizationSettings />}
          {activeTab === 'personal' && <PersonalSettings />}
        </div>
      </div>
    </Layout>
  );
}

function OrganizationSettings() {
  const { data: settings, isLoading } = api.settings.getOrganizationSettings.useQuery();
  const updateSettings = api.settings.updateOrganizationSettings.useMutation();
  const utils = api.useUtils();

  const [savingMessage, setSavingMessage] = useState<string | null>(null);

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({ [key]: value } as any);
      await utils.settings.getOrganizationSettings.invalidate();
      setSavingMessage('Saved!');
      setTimeout(() => setSavingMessage(null), 2000);
    } catch (error) {
      console.error('Failed to update settings', error);
    }
  };

  const handleSelectChange = async (key: string, value: string) => {
    try {
      await updateSettings.mutateAsync({ [key]: value } as any);
      await utils.settings.getOrganizationSettings.invalidate();
      setSavingMessage('Saved!');
      setTimeout(() => setSavingMessage(null), 2000);
    } catch (error) {
      console.error('Failed to update settings', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center text-gray-400">Failed to load settings</div>;
  }

  return (
    <div className="space-y-8">
      {/* Save indicator */}
      {savingMessage && (
        <div className="fixed right-6 top-6 z-50 rounded-lg bg-green-500 px-4 py-2 text-white shadow-lg">
          {savingMessage}
        </div>
      )}

      {/* Organization Info */}
      <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
        <h2 className="text-xl font-semibold text-white">Organization</h2>
        <div className="mt-4 space-y-2">
          <div className="text-sm text-gray-400">
            <span className="font-medium text-white">Name:</span> {settings.organizationName}
          </div>
          <div className="text-sm text-gray-400">
            <span className="font-medium text-white">Slug:</span> {settings.organizationSlug}
          </div>
        </div>
      </div>

      {/* Design-Code Drift Detection */}
      <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">🎨 Design-Code Drift Detection</h2>
            <p className="mt-2 text-sm text-gray-400">
              Automatically detect when Figma designs drift from GitHub code implementation
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.driftDetectionEnabled}
              onChange={(e) => handleToggle('driftDetectionEnabled', e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
          </label>
        </div>

        {/* Sub-settings for drift detection */}
        {settings.driftDetectionEnabled && (
          <div className="mt-6 space-y-4 border-t border-gray-700 pt-4">
            {/* Severity Threshold */}
            <div>
              <label className="block text-sm font-medium text-white">
                Alert Severity Threshold
              </label>
              <p className="mt-1 text-xs text-gray-400">
                Only alert for drift above this severity level
              </p>
              <select
                value={settings.driftDetectionSeverityThreshold}
                onChange={(e) => handleSelectChange('driftDetectionSeverityThreshold', e.target.value)}
                className="mt-2 block w-full rounded-md border border-gray-600 bg-[#0D1117] px-3 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low - Alert for all changes</option>
                <option value="medium">Medium - Alert for medium+ changes</option>
                <option value="high">High - Alert for high+ changes only</option>
                <option value="critical">Critical - Alert for critical changes only</option>
              </select>
            </div>

            {/* Auto-create Issues */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Auto-create GitHub Issues</div>
                <p className="text-xs text-gray-400">
                  Automatically create GitHub issues when drift is detected
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.driftDetectionAutoCreateIssues}
                  onChange={(e) => handleToggle('driftDetectionAutoCreateIssues', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
              </label>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Drift Notifications</div>
                <p className="text-xs text-gray-400">
                  Notify team members when design-code drift is detected
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.driftDetectionNotifications}
                  onChange={(e) => handleToggle('driftDetectionNotifications', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Auto-Threading */}
      <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">🧵 Auto-Threading</h2>
            <p className="mt-2 text-sm text-gray-400">
              Automatically create threads when related work is detected across tools
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.autoThreadingEnabled}
              onChange={(e) => handleToggle('autoThreadingEnabled', e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
          </label>
        </div>

        {settings.autoThreadingEnabled && (
          <div className="mt-6 border-t border-gray-700 pt-4">
            <label className="block text-sm font-medium text-white">
              Minimum Confidence Score
            </label>
            <p className="mt-1 text-xs text-gray-400">
              Only auto-create threads when confidence is above this threshold (0.0 - 1.0)
            </p>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={settings.autoThreadingMinConfidence}
              onChange={(e) =>
                handleSelectChange('autoThreadingMinConfidence', e.target.value)
              }
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-600"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>0.5 (Lower threshold)</span>
              <span className="font-semibold text-primary">
                {settings.autoThreadingMinConfidence.toFixed(2)}
              </span>
              <span>1.0 (Higher threshold)</span>
            </div>
          </div>
        )}
      </div>

      {/* Intelligence Feed */}
      <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">🤖 Intelligence Feed</h2>
            <p className="mt-2 text-sm text-gray-400">
              AI-powered insights and proactive suggestions
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.intelligenceFeedEnabled}
              onChange={(e) => handleToggle('intelligenceFeedEnabled', e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
        <h2 className="text-xl font-semibold text-white">🔔 Notifications</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Email Notifications</div>
              <p className="text-xs text-gray-400">Receive updates via email</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.emailNotificationsEnabled}
                onChange={(e) => handleToggle('emailNotificationsEnabled', e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Slack Notifications</div>
              <p className="text-xs text-gray-400">Send updates to Slack channels</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.slackNotificationsEnabled}
                onChange={(e) => handleToggle('slackNotificationsEnabled', e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalSettings() {
  const { data: preferences, isLoading } = api.settings.getUserPreferences.useQuery();
  const updatePreferences = api.settings.updateUserPreferences.useMutation();
  const utils = api.useUtils();

  const [savingMessage, setSavingMessage] = useState<string | null>(null);

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updatePreferences.mutateAsync({ [key]: value } as any);
      await utils.settings.getUserPreferences.invalidate();
      setSavingMessage('Saved!');
      setTimeout(() => setSavingMessage(null), 2000);
    } catch (error) {
      console.error('Failed to update preferences', error);
    }
  };

  const handleSelectChange = async (key: string, value: string) => {
    try {
      await updatePreferences.mutateAsync({ [key]: value } as any);
      await utils.settings.getUserPreferences.invalidate();
      setSavingMessage('Saved!');
      setTimeout(() => setSavingMessage(null), 2000);
    } catch (error) {
      console.error('Failed to update preferences', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!preferences) {
    return <div className="text-center text-gray-400">Failed to load preferences</div>;
  }

  return (
    <div className="space-y-8">
      {/* Save indicator */}
      {savingMessage && (
        <div className="fixed right-6 top-6 z-50 rounded-lg bg-green-500 px-4 py-2 text-white shadow-lg">
          {savingMessage}
        </div>
      )}

      {/* Notifications */}
      <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
        <h2 className="text-xl font-semibold text-white">🔔 Notification Preferences</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Email Notifications</div>
              <p className="text-xs text-gray-400">Receive all notifications via email</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handleToggle('emailNotifications', e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">@Mention Notifications</div>
              <p className="text-xs text-gray-400">When someone mentions you</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={preferences.mentionNotifications}
                onChange={(e) => handleToggle('mentionNotifications', e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Thread Activity</div>
              <p className="text-xs text-gray-400">When threads you're part of are updated</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={preferences.threadActivityNotifications}
                onChange={(e) => handleToggle('threadActivityNotifications', e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Design-Code Drift Alerts</div>
              <p className="text-xs text-gray-400">When drift is detected in your work</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={preferences.driftAlertNotifications}
                onChange={(e) => handleToggle('driftAlertNotifications', e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
            </label>
          </div>
        </div>
      </div>

      {/* UI Preferences */}
      <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
        <h2 className="text-xl font-semibold text-white">🎨 UI Preferences</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white">Default View</label>
            <select
              value={preferences.defaultView}
              onChange={(e) => handleSelectChange('defaultView', e.target.value)}
              className="mt-2 block w-full rounded-md border border-gray-600 bg-[#0D1117] px-3 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="intelligence">Intelligence Feed</option>
              <option value="threads">Threads</option>
              <option value="activity">Activity Feed</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Compact Mode</div>
              <p className="text-xs text-gray-400">Use compact layout to see more content</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={preferences.compactMode}
                onChange={(e) => handleToggle('compactMode', e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Theme</label>
            <select
              value={preferences.theme}
              onChange={(e) => handleSelectChange('theme', e.target.value)}
              className="mt-2 block w-full rounded-md border border-gray-600 bg-[#0D1117] px-3 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
