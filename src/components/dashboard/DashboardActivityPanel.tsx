import { TrendingUp } from "lucide-react";

interface DashboardActivityPanelProps {
  activityPercentage?: number;
  trend?: number;
  dailyActivity?: Array<{
    day: string;
    percentage: number;
    color: 'blue' | 'red' | 'teal' | 'gray' | 'orange';
  }>;
}

const defaultDailyActivity = [
  { day: 'Mon', percentage: 92, color: 'blue' as const },
  { day: 'Tue', percentage: 41, color: 'red' as const },
  { day: 'Wed', percentage: 78, color: 'teal' as const },
  { day: 'Thu', percentage: 0, color: 'gray' as const },
  { day: 'Fri', percentage: 63, color: 'orange' as const },
];

const colorMap = {
  blue: 'bg-[#6366F1]',
  red: 'bg-[#E71D36]',
  teal: 'bg-[#2EC4B6]',
  gray: 'bg-gray-700 dark:bg-gray-600',
  orange: 'bg-[#FF9F1C]',
};

export function DashboardActivityPanel({
  activityPercentage = 83,
  trend = 19,
  dailyActivity = defaultDailyActivity
}: DashboardActivityPanelProps) {
  return (
    <div className="bg-white dark:bg-[#011627] rounded-2xl p-6 border border-gray-200 dark:border-[#2EC4B6]/20 shadow-sm dark:shadow-[#2EC4B6]/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC]">Activity</h3>
        <div className="flex items-center gap-1 text-green-500 dark:text-[#2EC4B6] text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          <span>+{trend}%</span>
        </div>
      </div>
      <div className="text-gray-900 dark:text-[#FDFFFC] mb-6">
        <span className="text-5xl font-bold">{activityPercentage}</span>
        <span className="text-2xl text-gray-400 dark:text-[#FDFFFC]/40 ml-2">%</span>
      </div>
      <div className="space-y-3">
        {dailyActivity.map((day) => (
          <div key={day.day} className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-[#FDFFFC]/50 w-12 font-medium">{day.day}</span>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-[#011627]/50 rounded-full overflow-hidden mx-3 border border-transparent dark:border-[#FDFFFC]/10">
              <div
                className={`h-full ${colorMap[day.color]} transition-all duration-500`}
                style={{ width: `${day.percentage}%` }}
              />
            </div>
            <span className="text-gray-900 dark:text-[#FDFFFC] w-10 text-right font-medium">{day.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
