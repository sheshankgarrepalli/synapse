/**
 * Design-Code Drift Detection Page
 * Monitor and manage design-code drift alerts
 */

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { api } from '@/utils/api';
import { formatDistanceToNow } from 'date-fns';

type DriftStatus = 'detected' | 'acknowledged' | 'resolved' | 'ignored';
type DriftSeverity = 'low' | 'medium' | 'high' | 'critical';

export default function DriftPage() {
  const [selectedStatus, setSelectedStatus] = useState<DriftStatus | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<DriftSeverity | 'all'>('all');
  const [selectedDriftId, setSelectedDriftId] = useState<string | null>(null);

  // Fetch drift stats
  const { data: stats } = api.drift.getDriftStats.useQuery();

  // Fetch drift alerts
  const { data: driftsData, isLoading } = api.drift.getDriftAlerts.useQuery({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    severity: selectedSeverity === 'all' ? undefined : selectedSeverity,
    limit: 50,
    offset: 0,
  });

  // Fetch drift details when selected
  const { data: selectedDrift } = api.drift.getDriftById.useQuery(
    { id: selectedDriftId! },
    { enabled: !!selectedDriftId }
  );

  const updateStatusMutation = api.drift.updateDriftStatus.useMutation({
    onSuccess: () => {
      // Refetch data
      window.location.reload();
    },
  });

  const handleStatusChange = async (driftId: string, newStatus: DriftStatus) => {
    await updateStatusMutation.mutateAsync({
      id: driftId,
      status: newStatus,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected':
        return 'text-red-400 bg-red-500/10';
      case 'acknowledged':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'resolved':
        return 'text-green-400 bg-green-500/10';
      case 'ignored':
        return 'text-gray-400 bg-gray-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Design-Code Drift Detection</h1>
            <p className="mt-2 text-gray-400">
              Monitor when Figma designs drift from GitHub code implementation
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
              <div className="text-sm font-medium text-gray-400">Total Drifts</div>
              <div className="mt-2 text-3xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
              <div className="text-sm font-medium text-gray-400">Recent (7 days)</div>
              <div className="mt-2 text-3xl font-bold text-white">{stats.recentDrifts}</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
              <div className="text-sm font-medium text-gray-400">Critical</div>
              <div className="mt-2 text-3xl font-bold text-red-500">
                {stats.bySeverity.critical || 0}
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-[#1A1F28] p-6">
              <div className="text-sm font-medium text-gray-400">Unresolved</div>
              <div className="mt-2 text-3xl font-bold text-yellow-500">
                {(stats.byStatus.detected || 0) + (stats.byStatus.acknowledged || 0)}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="rounded-lg border border-gray-700 bg-[#1A1F28] px-4 py-2 text-white focus:border-primary focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="rounded-lg border border-gray-700 bg-[#1A1F28] px-4 py-2 text-white focus:border-primary focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Drift Alerts List */}
        <div className="rounded-lg border border-gray-700 bg-[#1A1F28]">
          <div className="border-b border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white">Drift Alerts</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading drift alerts...</div>
          ) : !driftsData || driftsData.drifts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl">🎨</div>
              <div className="mt-4 text-lg font-medium text-white">No drift alerts found</div>
              <div className="mt-2 text-sm text-gray-400">
                Your designs and code are in perfect sync!
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {driftsData.drifts.map((drift) => (
                <div
                  key={drift.id}
                  className="cursor-pointer p-6 transition-colors hover:bg-[#1E2530]"
                  onClick={() => setSelectedDriftId(drift.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getSeverityColor(
                            drift.severity
                          )}`}
                        >
                          {drift.severity}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                            drift.status
                          )}`}
                        >
                          {drift.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(drift.detectedAt), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Summary */}
                      <div className="mt-3">
                        <h3 className="text-lg font-medium text-white">{drift.summary}</h3>
                        {drift.impact && (
                          <p className="mt-1 text-sm text-gray-400">{drift.impact}</p>
                        )}
                      </div>

                      {/* Design & Code Links */}
                      <div className="mt-4 flex flex-wrap gap-4">
                        {drift.designSnapshot && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Design:</span>
                            <a
                              href={drift.designSnapshot.fileUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {drift.designSnapshot.fileName}
                              {drift.designSnapshot.nodeName && ` / ${drift.designSnapshot.nodeName}`}
                            </a>
                          </div>
                        )}

                        {drift.codeSnapshot && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Code:</span>
                            <span className="text-sm text-gray-300">
                              {drift.codeSnapshot.filePath}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Recommendation */}
                      {drift.recommendation && (
                        <div className="mt-3 rounded-lg bg-blue-500/10 p-3">
                          <div className="text-xs font-medium text-blue-400">RECOMMENDED ACTION</div>
                          <div className="mt-1 text-sm text-gray-300">{drift.recommendation}</div>
                        </div>
                      )}
                    </div>

                    {/* Thumbnail */}
                    {drift.designSnapshot?.thumbnailUrl && (
                      <div className="ml-4">
                        <img
                          src={drift.designSnapshot.thumbnailUrl}
                          alt="Design preview"
                          className="h-24 w-24 rounded-lg border border-gray-700 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(drift.id, 'acknowledged');
                      }}
                      className="rounded-lg bg-yellow-500/10 px-3 py-1 text-sm text-yellow-400 hover:bg-yellow-500/20"
                      disabled={drift.status === 'acknowledged'}
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(drift.id, 'resolved');
                      }}
                      className="rounded-lg bg-green-500/10 px-3 py-1 text-sm text-green-400 hover:bg-green-500/20"
                      disabled={drift.status === 'resolved'}
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(drift.id, 'ignored');
                      }}
                      className="rounded-lg bg-gray-500/10 px-3 py-1 text-sm text-gray-400 hover:bg-gray-500/20"
                      disabled={drift.status === 'ignored'}
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Detailed View Modal with Visual Comparison */}
        {selectedDrift && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedDriftId(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-lg border border-gray-700 bg-[#1A1F28] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Drift Alert Details</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      Detected {formatDistanceToNow(new Date(selectedDrift.detectedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDriftId(null)}
                    className="text-gray-400 hover:text-white text-2xl leading-none"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-4 flex gap-3">
                  <span
                    className={`rounded-full border px-4 py-2 text-sm font-semibold uppercase ${getSeverityColor(
                      selectedDrift.severity
                    )}`}
                  >
                    {selectedDrift.severity} Severity
                  </span>
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusColor(
                      selectedDrift.status
                    )}`}
                  >
                    {selectedDrift.status}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-400">Confidence:</span>
                    <span className="text-sm font-semibold text-primary">
                      {Math.round(selectedDrift.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary & Impact */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-700 bg-[#141821] p-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Summary</h3>
                    <p className="mt-2 text-white">{selectedDrift.summary}</p>
                  </div>
                  {selectedDrift.impact && (
                    <div className="rounded-lg border border-gray-700 bg-[#141821] p-4">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Impact</h3>
                      <p className="mt-2 text-white">{selectedDrift.impact}</p>
                    </div>
                  )}
                </div>

                {/* Visual Comparison - Side by Side */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Visual Comparison</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Design Snapshot */}
                    <div className="rounded-lg border-2 border-green-500/30 bg-[#141821] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🎨</span>
                          <div>
                            <h4 className="font-semibold text-white">Figma Design</h4>
                            <p className="text-xs text-gray-400">Source of Truth</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                          Expected
                        </span>
                      </div>
                      {selectedDrift.designSnapshot?.thumbnailUrl ? (
                        <div className="rounded-lg border border-gray-700 bg-gray-900 p-2">
                          <img
                            src={selectedDrift.designSnapshot.thumbnailUrl}
                            alt="Design preview"
                            className="w-full rounded object-contain"
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/50 p-8 text-center">
                          <span className="text-4xl">🎨</span>
                          <p className="mt-2 text-sm text-gray-500">Preview unavailable</p>
                        </div>
                      )}
                      {selectedDrift.designSnapshot && (
                        <div className="mt-3 space-y-1 text-xs text-gray-400">
                          <p>File: {selectedDrift.designSnapshot.fileName}</p>
                          {selectedDrift.designSnapshot.nodeName && (
                            <p>Node: {selectedDrift.designSnapshot.nodeName}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Code Snapshot */}
                    <div className="rounded-lg border-2 border-red-500/30 bg-[#141821] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">💻</span>
                          <div>
                            <h4 className="font-semibold text-white">Actual Code</h4>
                            <p className="text-xs text-gray-400">Implementation</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                          Drifted
                        </span>
                      </div>
                      <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 font-mono text-xs">
                        <div className="text-gray-500">// {selectedDrift.codeSnapshot?.filePath || 'Code file'}</div>
                        {selectedDrift.codeSnapshot?.codeContent ? (
                          <pre className="mt-2 text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {selectedDrift.codeSnapshot.codeContent}
                          </pre>
                        ) : (
                          <div className="mt-8 text-center">
                            <span className="text-4xl">💻</span>
                            <p className="mt-2 text-sm text-gray-500">Code preview unavailable</p>
                          </div>
                        )}
                      </div>
                      {selectedDrift.codeSnapshot && (
                        <div className="mt-3 space-y-1 text-xs text-gray-400">
                          <p>File: {selectedDrift.codeSnapshot.filePath}</p>
                          {selectedDrift.codeSnapshot.componentName && (
                            <p>Component: {selectedDrift.codeSnapshot.componentName}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property-by-Property Comparison */}
                {selectedDrift.changes && (selectedDrift.changes as any[]).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Property Differences</h3>
                    <div className="space-y-3">
                      {(selectedDrift.changes as any[]).map((change, idx) => (
                        <div key={idx} className="rounded-lg border border-gray-700 bg-[#141821] overflow-hidden">
                          <div className="flex items-center justify-between bg-gray-900/50 px-4 py-3 border-b border-gray-700">
                            <span className="font-mono text-sm font-medium text-white">{change.property}</span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getSeverityColor(
                                change.severity
                              )}`}
                            >
                              {change.severity}
                            </span>
                          </div>
                          <div className="p-4">
                            {change.description && (
                              <p className="text-sm text-gray-400 mb-4">{change.description}</p>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xs font-semibold text-green-400">DESIGN VALUE</span>
                                  <span className="text-xs text-gray-500">(expected)</span>
                                </div>
                                <code className="block font-mono text-sm text-green-300">
                                  {JSON.stringify(change.designValue, null, 2)}
                                </code>
                              </div>
                              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xs font-semibold text-red-400">CODE VALUE</span>
                                  <span className="text-xs text-gray-500">(actual)</span>
                                </div>
                                <code className="block font-mono text-sm text-red-300">
                                  {JSON.stringify(change.codeValue, null, 2)}
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                {selectedDrift.recommendation && (
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                          Recommended Action
                        </h3>
                        <p className="mt-2 text-white">{selectedDrift.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleStatusChange(selectedDrift.id, 'ignored')}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    disabled={selectedDrift.status === 'ignored'}
                  >
                    Ignore
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedDrift.id, 'acknowledged')}
                    className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                    disabled={selectedDrift.status === 'acknowledged'}
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedDrift.id, 'resolved')}
                    className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-2 text-sm text-green-400 hover:bg-green-500/20 transition-colors"
                    disabled={selectedDrift.status === 'resolved'}
                  >
                    Mark as Resolved
                  </button>
                  <button
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90 transition-colors"
                  >
                    Generate Fix
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
