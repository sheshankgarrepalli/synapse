import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
  color?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, subtitle, color = "#FCA311" }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-[#011627] border border-gray-200 dark:border-[#2EC4B6]/20 p-6 rounded-2xl hover:shadow-lg dark:shadow-[#2EC4B6]/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: color }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm ${
            trend.positive ? 'bg-green-500/10 dark:bg-[#2EC4B6]/15 text-green-500 dark:text-[#2EC4B6]' : 'bg-red-500/10 dark:bg-[#E71D36]/15 text-red-500 dark:text-[#E71D36]'
          }`}>
            {trend.positive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span className="font-medium">{trend.value}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-500 dark:text-[#FDFFFC]/50 text-sm mb-1">{title}</p>
        <p className="text-gray-900 dark:text-[#FDFFFC] text-3xl font-bold mb-1">{value}</p>
        {subtitle && (
          <p className="text-gray-400 dark:text-[#FDFFFC]/40 text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
