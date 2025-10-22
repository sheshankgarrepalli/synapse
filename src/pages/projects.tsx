import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  FolderKanban,
  GitBranch,
  Clock,
  Users,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  threadCount: number;
  memberCount: number;
  lastActivity: string;
  progress: number;
  color: string;
}

export default function ProjectsPage() {
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Product Launch 2024",
      description: "Q1 product launch and go-to-market strategy",
      status: "active",
      threadCount: 24,
      memberCount: 8,
      lastActivity: "2 hours ago",
      progress: 65,
      color: "from-[#FCA311] to-[#FF9F1C]",
    },
    {
      id: "2",
      name: "Customer Feedback Analysis",
      description: "Analyzing customer feedback and feature requests",
      status: "active",
      threadCount: 12,
      memberCount: 4,
      lastActivity: "5 hours ago",
      progress: 40,
      color: "from-[#2EC4B6] to-[#00B4A8]",
    },
    {
      id: "3",
      name: "Q4 Planning",
      description: "Strategic planning for Q4 2024",
      status: "paused",
      threadCount: 8,
      memberCount: 6,
      lastActivity: "2 days ago",
      progress: 25,
      color: "from-[#14213D] to-[#011627]",
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Paused
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    paused: projects.filter((p) => p.status === "paused").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC]">
                Projects
              </h1>
              <p className="text-gray-600 dark:text-[#FDFFFC]/60 mt-1">
                Organize your work into projects and track progress
              </p>
            </div>
            <Button className="bg-[#FCA311] hover:bg-[#FCA311]/90 dark:bg-gradient-to-r dark:from-[#FF9F1C] dark:to-[#2EC4B6] text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] border-2 border-transparent dark:border-[#2EC4B6]/20 hover:border-[#FCA311]/20 dark:hover:border-[#2EC4B6]/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60 mb-1">
                  Total Projects
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC]">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FCA311]/10 dark:bg-[#FF9F1C]/10 flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-[#FCA311] dark:text-[#FF9F1C]" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] border-2 border-transparent dark:border-[#2EC4B6]/20 hover:border-[#FCA311]/20 dark:hover:border-[#2EC4B6]/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60 mb-1">
                  Active
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] border-2 border-transparent dark:border-[#2EC4B6]/20 hover:border-[#FCA311]/20 dark:hover:border-[#2EC4B6]/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60 mb-1">
                  Paused
                </p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.paused}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] border-2 border-transparent dark:border-[#2EC4B6]/20 hover:border-[#FCA311]/20 dark:hover:border-[#2EC4B6]/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60 mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] border-2 border-transparent dark:border-[#2EC4B6]/20 hover:border-[#FCA311]/20 dark:hover:border-[#2EC4B6]/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
            >
              {/* Project Header */}
              <div className="p-6 border-b border-gray-200 dark:border-[#2EC4B6]/20">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center shadow-lg`}
                  >
                    <FolderKanban className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(project.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 dark:text-[#FDFFFC]/60 hover:bg-gray-100 dark:hover:bg-[#2EC4B6]/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#FDFFFC] mb-2">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60">
                  {project.description}
                </p>
              </div>

              {/* Project Stats */}
              <div className="p-6 space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-[#FDFFFC]/60">
                      Progress
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-[#FDFFFC]">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-[#14213D] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${project.color} transition-all duration-300`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-[#FDFFFC]/60 mb-1">
                      <GitBranch className="w-4 h-4" />
                      <span className="text-xs">Threads</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-[#FDFFFC]">
                      {project.threadCount}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-[#FDFFFC]/60 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Members</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-[#FDFFFC]">
                      {project.memberCount}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-[#FDFFFC]/60 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Updated</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-[#FDFFFC]">
                      {project.lastActivity}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* New Project Card */}
          <Card className="bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] border-2 border-dashed border-gray-300 dark:border-[#2EC4B6]/20 hover:border-[#FCA311] dark:hover:border-[#2EC4B6] hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div className="p-6 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#14213D] group-hover:bg-[#FCA311]/10 dark:group-hover:bg-[#FF9F1C]/10 flex items-center justify-center mb-4 transition-colors duration-300">
                <Plus className="w-8 h-8 text-gray-400 dark:text-[#FDFFFC]/40 group-hover:text-[#FCA311] dark:group-hover:text-[#FF9F1C] transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] mb-2">
                Create New Project
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60">
                Start organizing your threads into projects
              </p>
            </div>
          </Card>
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <Card className="bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] border-2 border-transparent dark:border-[#2EC4B6]/20">
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#14213D] flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="w-8 h-8 text-gray-400 dark:text-[#FDFFFC]/40" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 dark:text-[#FDFFFC]/60 mb-4">
                Create your first project to start organizing your work
              </p>
              <Button className="bg-[#FCA311] hover:bg-[#FCA311]/90 dark:bg-gradient-to-r dark:from-[#FF9F1C] dark:to-[#2EC4B6] text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
