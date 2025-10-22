import { AppLayout } from '@/components/layouts/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardThreadCard } from '@/components/dashboard/DashboardThreadCard';
import { DashboardActivityChart } from '@/components/dashboard/DashboardActivityChart';
import { DashboardActivityPanel } from '@/components/dashboard/DashboardActivityPanel';
import { Button } from '@/components/ui/Button';
import { GitBranch, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { api } from '@/utils/api';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useUser();

  // Fetch threads and analytics data
  const { data: threadsData, isLoading: threadsLoading } = api.threads.list.useQuery({
    limit: 20,
  });
  const { data: analytics } = api.analytics.getDashboard.useQuery();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    {
      title: 'Active Threads',
      value: analytics?.activeThreads || 24,
      icon: GitBranch,
      trend: { value: '+12%', positive: true },
      subtitle: 'Across 8 projects',
      color: '#FF9F1C'
    },
    {
      title: 'Completed Today',
      value: 18,
      icon: CheckCircle2,
      trend: { value: '+8%', positive: true },
      subtitle: '3 more than yesterday',
      color: '#2EC4B6',
    },
    {
      title: 'Errors Detected',
      value: 3,
      icon: AlertTriangle,
      trend: { value: '-25%', positive: true },
      subtitle: '2 resolved this week',
      color: '#E71D36',
    },
  ];

  const threads = [
    {
      id: '1',
      title: 'Design System Update - Button Component',
      status: 'active' as const,
      tools: ['Figma', 'GitHub', 'Linear'],
      description: 'Updating button variants to match new brand guidelines',
      activity: 'Figma design updated 2h ago, but code hasn\'t been synced',
      timestamp: '2h ago',
      updates: 3,
      assignees: [
        { name: 'Sarah Chen', avatar: 'SC', color: '#FCA311' },
        { name: 'Mike Ross', avatar: 'MR', color: '#10B981' },
      ],
      priority: 'high' as const,
    },
    {
      id: '2',
      title: 'Mobile App Authentication Flow',
      status: 'error' as const,
      tools: ['Figma', 'GitHub', 'Slack'],
      description: 'Implementing OAuth and social login options',
      activity: 'Merge conflict detected in PR #234, requires team review',
      timestamp: '4h ago',
      updates: 7,
      assignees: [
        { name: 'Alex Kim', avatar: 'AK', color: '#EF4444' },
      ],
      priority: 'urgent' as const,
    },
    {
      id: '3',
      title: 'Dashboard Analytics Implementation',
      status: 'active' as const,
      tools: ['Linear', 'GitHub'],
      description: 'Building real-time analytics dashboard for user metrics',
      activity: 'Task moved to In Progress, PR draft created',
      timestamp: '6h ago',
      assignees: [
        { name: 'Jordan Lee', avatar: 'JL', color: '#6366F1' },
        { name: 'Sam Wilson', avatar: 'SW', color: '#EC4899' },
      ],
      priority: 'medium' as const,
    },
    {
      id: '4',
      title: 'API Documentation Sync',
      status: 'paused' as const,
      tools: ['GitHub', 'Slack', 'Linear'],
      description: 'Syncing API docs with latest endpoint changes',
      activity: 'Waiting for design review before proceeding',
      timestamp: '1d ago',
      assignees: [
        { name: 'Taylor Park', avatar: 'TP', color: '#F59E0B' },
      ],
      priority: 'low' as const,
    },
  ];

  return (
    <AppLayout>
      <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-2">
                  {getGreeting()}, {user?.firstName || 'there'} 👋
                </h1>
                <p className="text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
                  Track and manage your Golden Threads across all integrations
                </p>
              </div>
              <Link href="/threads/new">
                <Button className="bg-[#FCA311] dark:bg-[#FF9F1C] minimal:bg-gray-900 hover:bg-[#FCA311]/90 dark:hover:bg-[#FF9F1C]/90 minimal:hover:bg-gray-800 text-white shadow-lg shadow-[#FCA311]/20 dark:shadow-[#FF9F1C]/20 minimal:shadow-none">
                  <Plus className="w-5 h-5 mr-2" />
                  New Thread
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat) => (
                <StatsCard key={stat.title} {...stat} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Activity Chart */}
              <div className="lg:col-span-2">
                <DashboardActivityChart />
              </div>

              {/* Quick Stats */}
              <DashboardActivityPanel />
            </div>

            {/* Recent Threads */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">Recent Threads</h2>
                <Link href="/threads">
                  <Button variant="ghost" className="text-[#FCA311] dark:text-[#FF9F1C] minimal:text-gray-900 hover:bg-[#FCA311]/10 dark:hover:bg-[#FF9F1C]/10 minimal:hover:bg-gray-200">
                    View all →
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {threads.map((thread) => (
                  <Link key={thread.id} href={`/threads/${thread.id}`}>
                    <DashboardThreadCard {...thread} />
                  </Link>
                ))}
              </div>
            </div>
      </div>
    </AppLayout>
  );
}
