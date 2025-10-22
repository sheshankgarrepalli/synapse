import { useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/utils/api';
import { formatBytes } from '@/lib/utils';
import { useUser, useOrganization } from '@clerk/nextjs';

export default function SettingsPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState<'general' | 'organization' | 'billing' | 'danger'>('general');

  const { data: orgData } = api.organizations.getCurrent.useQuery();

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'organization', label: 'Organization' },
    { id: 'billing', label: 'Billing' },
    { id: 'danger', label: 'Danger Zone' },
  ] as const;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] mb-2">Settings</h1>
          <p className="text-gray-500 dark:text-[#FDFFFC]/60">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-[#2EC4B6]/20">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 pb-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#FCA311] dark:border-[#FF9F1C] text-gray-900 dark:text-[#FDFFFC]'
                    : 'border-transparent text-gray-500 dark:text-[#FDFFFC]/60 hover:border-gray-300 dark:hover:border-[#2EC4B6]/50 hover:text-gray-700 dark:hover:text-[#FDFFFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && <GeneralSettings user={user} />}
        {activeTab === 'organization' && <OrganizationSettings orgData={orgData} />}
        {activeTab === 'billing' && <BillingSettings orgData={orgData} />}
        {activeTab === 'danger' && <DangerZone />}
      </div>
    </AppLayout>
  );
}

// General Settings
function GeneralSettings({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <div className="pt-4">
            <p className="text-sm text-gray-400">
              Profile settings are managed through Clerk. Click below to update your profile.
            </p>
            <Button className="mt-4" variant="outline" size="sm">
              Manage Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Email Notifications</h4>
              <p className="text-xs text-gray-400">Receive email updates about your threads</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-primary focus:ring-2 focus:ring-primary"
              defaultChecked
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Slack Notifications</h4>
              <p className="text-xs text-gray-400">Get notified in Slack for important updates</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-primary focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Organization Settings
function OrganizationSettings({ orgData }: { orgData: any }) {
  const [orgName, setOrgName] = useState(orgData?.name || '');
  const [orgSlug, setOrgSlug] = useState(orgData?.slug || '');

  const utils = api.useUtils();
  const updateOrg = api.organizations.update.useMutation({
    onSuccess: () => {
      utils.organizations.getCurrent.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrg.mutate({
      name: orgName,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Manage your organization settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Organization Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Enter organization name"
            />
            <Input
              label="Organization Slug"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              placeholder="your-org-slug"
              helperText="This will be used in URLs"
            />
            <Button type="submit" loading={updateOrg.isLoading}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>Monitor your storage consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Used</span>
                <span className="font-medium text-white">
                  {formatBytes(orgData?.storageUsedBytes || 0)} / {formatBytes((orgData?.storageLimitGb || 25) * 1024 * 1024 * 1024)}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${Math.min(
                      ((orgData?.storageUsedBytes || 0) / ((orgData?.storageLimitGb || 25) * 1024 * 1024 * 1024)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
              <div>
                <p className="text-gray-400">Connected Items</p>
                <p className="mt-1 text-lg font-semibold text-white">{orgData?.itemCount || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Active Threads</p>
                <p className="mt-1 text-lg font-semibold text-white">{orgData?.threadCount || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Integrations</p>
                <p className="mt-1 text-lg font-semibold text-white">{orgData?.integrationCount || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage who has access to your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-800 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <span className="text-sm font-medium text-white">U</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">You</p>
                  <p className="text-xs text-gray-400">Owner</p>
                </div>
              </div>
              <Badge variant="primary" size="sm">Owner</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Invite Team Members
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Billing Settings
function BillingSettings({ orgData }: { orgData: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {orgData?.planTier === 'free' ? 'Free Plan' : orgData?.planTier?.toUpperCase() || 'Free Plan'}
                </h3>
                <p className="text-sm text-gray-400">
                  {orgData?.planTier === 'free' ? 'Perfect for getting started' : 'Advanced features enabled'}
                </p>
              </div>
              <Badge variant={orgData?.planTier === 'free' ? 'default' : 'success'} size="md">
                {orgData?.planTier || 'free'}
              </Badge>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <h4 className="mb-3 text-sm font-medium text-white">Plan Features</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{orgData?.storageLimitGb || 25} GB Storage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>8 Integrations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Unlimited Threads</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>AI Semantic Search</span>
                </div>
              </div>
            </div>

            {orgData?.planTier === 'free' && (
              <Button className="w-full">Upgrade to Pro</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-400">
            <p>No billing history available</p>
            {orgData?.planTier === 'free' && (
              <p className="mt-2 text-sm">Upgrade to a paid plan to see invoices here</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Danger Zone
function DangerZone() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-red-900">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Delete All Data</h4>
              <p className="text-xs text-gray-400">
                Permanently delete all threads, items, and integrations
              </p>
            </div>
            <Button variant="danger" size="sm">
              Delete All Data
            </Button>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Delete Organization</h4>
                <p className="text-xs text-gray-400">
                  This will permanently delete your organization and all associated data
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              >
                Delete Organization
              </Button>
            </div>
            {showDeleteConfirm && (
              <div className="mt-4 rounded-lg border border-red-900 bg-red-900/10 p-4">
                <p className="mb-3 text-sm text-red-400">
                  Type "DELETE" to confirm this action
                </p>
                <Input placeholder="DELETE" />
                <div className="mt-3 flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm">
                    Confirm Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
