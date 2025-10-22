import { Badge } from "@/components/ui/Badge";
import { ImageWithFallback } from "./ImageWithFallback";
import { Clock } from "lucide-react";

interface DashboardThreadCardProps {
  id: string;
  title: string;
  status: "active" | "paused" | "error";
  tools: string[];
  description: string;
  activity: string;
  timestamp: string;
  updates?: number;
  assignees: Array<{
    name: string;
    avatar: string;
    color: string;
  }>;
  priority: "low" | "medium" | "high" | "urgent";
}

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-green-500/15 text-green-600 dark:bg-[#2EC4B6]/20 dark:text-[#2EC4B6] border-green-500/30 dark:border-[#2EC4B6]/40",
    dotColor: "bg-green-500 dark:bg-[#2EC4B6]"
  },
  paused: {
    label: "Paused",
    className: "bg-yellow-500/15 text-yellow-600 dark:bg-[#FF9F1C]/20 dark:text-[#FF9F1C] border-yellow-500/30 dark:border-[#FF9F1C]/40",
    dotColor: "bg-yellow-500 dark:bg-[#FF9F1C]"
  },
  error: {
    label: "Needs Attention",
    className: "bg-red-500/15 text-red-600 dark:bg-[#E71D36]/20 dark:text-[#E71D36] border-red-500/30 dark:border-[#E71D36]/40",
    dotColor: "bg-red-500 dark:bg-[#E71D36]"
  },
};

const priorityConfig = {
  low: { className: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30" },
  medium: { className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  high: { className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  urgent: { className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" },
};

const toolIcons: Record<string, string> = {
  figma: "https://cdn.worldvectorlogo.com/logos/figma-icon.svg",
  github: "https://cdn.worldvectorlogo.com/logos/github-icon-2.svg",
  linear: "https://asset.brandfetch.io/idZAyF9rlg/idm22YSj0l.svg",
  slack: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
};

export function DashboardThreadCard({
  title,
  status,
  tools,
  description,
  activity,
  timestamp,
  updates,
  assignees,
  priority
}: DashboardThreadCardProps) {
  const statusInfo = statusConfig[status];
  const priorityInfo = priorityConfig[priority];

  return (
    <div className="bg-white dark:bg-[#011627] border border-gray-200 dark:border-[#2EC4B6]/20 rounded-2xl overflow-hidden hover:shadow-xl dark:shadow-[#2EC4B6]/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
      {/* Header with colored accent */}
      <div className="h-1.5 bg-gradient-to-r from-[#FCA311] via-[#10B981] to-[#6366F1] dark:from-[#FF9F1C] dark:via-[#2EC4B6] dark:to-[#E71D36]" />

      <div className="p-6">
        {/* Top section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] group-hover:text-[#FCA311] dark:group-hover:text-[#2EC4B6] transition-colors">
                {title}
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-[#FDFFFC]/50 mb-3">
              {description}
            </p>
          </div>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="outline" className={`${statusInfo.className} flex items-center gap-1.5 text-xs`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
            {statusInfo.label}
          </Badge>
          <Badge variant="outline" className={`${priorityInfo.className} text-xs`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
          {updates && (
            <Badge variant="outline" className="bg-[#FCA311]/15 dark:bg-[#FF9F1C]/20 text-[#FCA311] dark:text-[#FF9F1C] border-[#FCA311]/30 dark:border-[#FF9F1C]/40 text-xs">
              {updates} updates
            </Badge>
          )}
        </div>

        {/* Activity */}
        <div className="bg-gray-50 dark:bg-[#011627]/50 border border-transparent dark:border-[#2EC4B6]/10 rounded-xl p-3 mb-4">
          <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60">
            {activity}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Tool Icons */}
            <div className="flex items-center -space-x-2">
              {tools.slice(0, 3).map((tool) => (
                <div
                  key={tool}
                  className="w-8 h-8 rounded-full bg-white dark:bg-[#011627] border-2 border-white dark:border-[#2EC4B6]/20 p-1.5 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <ImageWithFallback
                    src={toolIcons[tool.toLowerCase()]}
                    alt={tool}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Assignees */}
            <div className="flex items-center -space-x-2">
              {assignees.map((assignee, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-[#2EC4B6]/20 hover:scale-110 transition-transform flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: assignee.color }}
                >
                  {assignee.avatar}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#FDFFFC]/40">
            <Clock className="w-3.5 h-3.5" />
            <span>{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
