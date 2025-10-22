import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ActivityChartData {
  name: string;
  threads: number;
  synced: number;
}

interface DashboardActivityChartProps {
  data?: ActivityChartData[];
}

const defaultData = [
  { name: "Mon", threads: 12, synced: 10 },
  { name: "Tue", threads: 19, synced: 15 },
  { name: "Wed", threads: 15, synced: 14 },
  { name: "Thu", threads: 25, synced: 20 },
  { name: "Fri", threads: 22, synced: 21 },
  { name: "Sat", threads: 18, synced: 18 },
  { name: "Sun", threads: 14, synced: 12 },
];

export function DashboardActivityChart({ data = defaultData }: DashboardActivityChartProps) {
  return (
    <div className="bg-white dark:bg-[#011627] border border-gray-200 dark:border-[#2EC4B6]/20 p-6 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] mb-1">Thread Activity</h3>
          <p className="text-sm text-gray-500 dark:text-[#FDFFFC]/50">Last 7 days</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FCA311] dark:bg-[#FF9F1C]" />
            <span className="text-gray-600 dark:text-[#FDFFFC]/60">Total Threads</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10B981] dark:bg-[#2EC4B6]" />
            <span className="text-gray-600 dark:text-[#FDFFFC]/60">Synced</span>
          </div>
        </div>
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorThreads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FCA311" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FCA311" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorThreadsDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9F1C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF9F1C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSynced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSyncedDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2EC4B6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="threads"
              stroke="#FCA311"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorThreads)"
              className="dark:hidden"
            />
            <Area
              type="monotone"
              dataKey="threads"
              stroke="#FF9F1C"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorThreadsDark)"
              className="hidden dark:block"
            />
            <Area
              type="monotone"
              dataKey="synced"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSynced)"
              className="dark:hidden"
            />
            <Area
              type="monotone"
              dataKey="synced"
              stroke="#2EC4B6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSyncedDark)"
              className="hidden dark:block"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
