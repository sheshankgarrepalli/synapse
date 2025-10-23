/**
 * Create Drift Watch Page
 * Form to create a new drift watch between Figma and GitHub
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/Button';
import { api } from '@/utils/api';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function CreateDriftWatch() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    figmaFileId: '',
    figmaFileName: '',
    figmaComponentId: '',
    figmaComponentName: '',
    githubRepoId: '',
    githubRepoName: '',
    githubFilePath: '',
    githubBranch: 'main',
    checkFrequency: 'hourly' as 'hourly' | 'daily' | 'weekly',
    alertOnDrift: true,
    slackWebhookUrl: '',
  });
  const [error, setError] = useState<string | null>(null);

  const createWatchMutation = api.drift.createWatch.useMutation({
    onSuccess: () => {
      router.push('/drift');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (
      !formData.figmaFileId ||
      !formData.figmaFileName ||
      !formData.figmaComponentId ||
      !formData.figmaComponentName ||
      !formData.githubRepoId ||
      !formData.githubRepoName ||
      !formData.githubFilePath
    ) {
      setError('Please fill in all required fields');
      return;
    }

    createWatchMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/drift"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-600 hover:text-[#FCA311] dark:hover:text-[#FF9F1C] minimal:hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Drift Watches
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-2">
            Create Drift Watch
          </h1>
          <p className="text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
            Set up monitoring for design-code drift between a Figma component
            and a GitHub file
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Figma Section */}
          <div className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5 minimal:shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-6 h-6 text-[#FCA311] dark:text-[#FF9F1C]">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" />
                  <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" />
                  <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" />
                  <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" />
                  <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" />
                </svg>
              </div>
              Figma Component
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 mb-2">
                  File ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="figmaFileId"
                  value={formData.figmaFileId}
                  onChange={handleChange}
                  placeholder="e.g., abc123xyz"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#01121F] minimal:bg-white border border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-lg text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 placeholder-gray-400 dark:placeholder-[#FDFFFC]/40 minimal:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCA311] dark:focus:ring-[#FF9F1C] minimal:focus:ring-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 mb-2">
                  File Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="figmaFileName"
                  value={formData.figmaFileName}
                  onChange={handleChange}
                  placeholder="e.g., Design System"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#01121F] minimal:bg-white border border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-lg text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 placeholder-gray-400 dark:placeholder-[#FDFFFC]/40 minimal:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCA311] dark:focus:ring-[#FF9F1C] minimal:focus:ring-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 mb-2">
                  Component ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="figmaComponentId"
                  value={formData.figmaComponentId}
                  onChange={handleChange}
                  placeholder="e.g., 123:456"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#01121F] minimal:bg-white border border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-lg text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 placeholder-gray-400 dark:placeholder-[#FDFFFC]/40 minimal:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCA311] dark:focus:ring-[#FF9F1C] minimal:focus:ring-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 mb-2">
                  Component Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="figmaComponentName"
                  value={formData.figmaComponentName}
                  onChange={handleChange}
                  placeholder="e.g., Button/Primary"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#01121F] minimal:bg-white border border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-lg text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 placeholder-gray-400 dark:placeholder-[#FDFFFC]/40 minimal:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCA311] dark:focus:ring-[#FF9F1C] minimal:focus:ring-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* GitHub Section */}
          <div className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5 minimal:shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-6 h-6 text-gray-700 dark:text-[#FDFFFC]/80">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              GitHub File
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 mb-2">
                  Repository ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="githubRepoId"
                  value={formData.githubRepoId}
                  onChange={handleChange}
                  placeholder="e.g., repo_abc123"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#01121F] minimal:bg-white border border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-lg text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 placeholder-gray-400 dark:placeholder-[#FDFFFC]/40 minimal:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCA311] dark:focus:ring-[#FF9F1C] minimal:focus:ring-gray-900"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-[#FDFFFC]/60">
                  The unique ID from your GitHub repository integration
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 mb-2">
                  Repository Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="githubRepoName"
                  value={formData.githubRepoName}
                  onChange={handleChange}
                  placeholder="e.g., acme-corp/design-system"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#01121F] minimal:bg-white border border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-lg text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 placeholder-gray-400 dark:placeholder-[#FDFFFC]/40 minimal:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCA311] dark:focus:ring-[#FF9F1C] minimal:focus:ring-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 mb-2">
                  File Path <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="githubFilePath"
                  value={formData.githubFilePath}
                  onChange={handleChange}
                  placeholder="e.g., src/components/Button.tsx"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#01121F] minimal:bg-white border border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-lg text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 font-mono placeholder-gray-400 dark:placeholder-[#FDFFFC]/40 minimal:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCA311] dark:focus:ring-[#FF9F1C] minimal:focus:ring-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5 minimal:shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-6">
              Watch Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 mb-2">
                  Check Frequency
                </label>
                <select
                  name="checkFrequency"
                  value={formData.checkFrequency}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#01121F] minimal:bg-white border border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-lg text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCA311] dark:focus:ring-[#FF9F1C] minimal:focus:ring-gray-900"
                >
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="alertOnDrift"
                    checked={formData.alertOnDrift}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 dark:border-[#2EC4B6]/20 text-[#FCA311] dark:text-[#FF9F1C] focus:ring-[#FCA311] dark:focus:ring-[#FF9F1C]"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700">
                    Alert me when drift is detected
                  </span>
                </label>
              </div>

              {formData.alertOnDrift && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 mb-2">
                    Slack Webhook URL (optional)
                  </label>
                  <input
                    type="url"
                    name="slackWebhookUrl"
                    value={formData.slackWebhookUrl}
                    onChange={handleChange}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#01121F] minimal:bg-white border border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-lg text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 font-mono text-sm placeholder-gray-400 dark:placeholder-[#FDFFFC]/40 minimal:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCA311] dark:focus:ring-[#FF9F1C] minimal:focus:ring-gray-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/drift">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#2EC4B6]/10 minimal:hover:bg-gray-100"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createWatchMutation.isLoading}
              className="bg-[#FCA311] dark:bg-[#FF9F1C] minimal:bg-gray-900 hover:bg-[#FCA311]/90 dark:hover:bg-[#FF9F1C]/90 minimal:hover:bg-gray-800 text-white shadow-lg shadow-[#FCA311]/20 dark:shadow-[#FF9F1C]/20 minimal:shadow-none"
            >
              {createWatchMutation.isLoading ? 'Creating...' : 'Create Watch'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
