import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UserPlus, Mail, MoreVertical, Crown, Shield, User } from "lucide-react";
import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar?: string;
  status: "active" | "invited";
  joinedAt: string;
}

export default function TeamPage() {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "You",
      email: "you@example.com",
      role: "owner",
      status: "active",
      joinedAt: "2024-01-01",
    },
  ]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4" />;
      case "admin":
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-[#FCA311] dark:bg-[#FF9F1C] minimal:bg-gray-900 text-white";
      case "admin":
        return "bg-[#2EC4B6] minimal:bg-gray-900 text-white";
      default:
        return "bg-gray-200 dark:bg-[#14213D] minimal:bg-gray-200 text-gray-700 dark:text-[#FDFFFC] minimal:text-gray-900";
    }
  };

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                Team
              </h1>
              <p className="text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mt-1">
                Manage your team members and their permissions
              </p>
            </div>
            <Button className="bg-[#FCA311] hover:bg-[#FCA311]/90 dark:bg-gradient-to-r dark:from-[#FF9F1C] dark:to-[#2EC4B6] minimal:bg-gray-900 minimal:hover:bg-gray-800 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] minimal:bg-white border-2 border-transparent dark:border-[#2EC4B6]/20 minimal:border-gray-200 hover:border-[#FCA311]/20 dark:hover:border-[#2EC4B6]/40 minimal:hover:border-gray-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                  Total Members
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                  {teamMembers.filter((m) => m.status === "active").length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FCA311]/10 dark:bg-[#FF9F1C]/10 minimal:bg-gray-100 flex items-center justify-center">
                <User className="w-6 h-6 text-[#FCA311] dark:text-[#FF9F1C] minimal:text-gray-900" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] minimal:bg-white border-2 border-transparent dark:border-[#2EC4B6]/20 minimal:border-gray-200 hover:border-[#FCA311]/20 dark:hover:border-[#2EC4B6]/40 minimal:hover:border-gray-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                  Pending Invites
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                  {teamMembers.filter((m) => m.status === "invited").length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#2EC4B6]/10 minimal:bg-gray-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#2EC4B6] minimal:text-gray-900" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] minimal:bg-white border-2 border-transparent dark:border-[#2EC4B6]/20 minimal:border-gray-200 hover:border-[#FCA311]/20 dark:hover:border-[#2EC4B6]/40 minimal:hover:border-gray-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                  Admins
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                  {
                    teamMembers.filter(
                      (m) => m.role === "admin" || m.role === "owner"
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FCA311]/10 dark:bg-[#FF9F1C]/10 minimal:bg-gray-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#FCA311] dark:text-[#FF9F1C] minimal:text-gray-900" />
              </div>
            </div>
          </Card>
        </div>

        {/* Team Members List */}
        <Card className="bg-white dark:bg-gradient-to-br dark:from-[#011627] dark:to-[#01121F] minimal:bg-white border-2 border-transparent dark:border-[#2EC4B6]/20 minimal:border-gray-200">
          <div className="p-6 border-b border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
              Team Members
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-[#2EC4B6]/20 minimal:divide-gray-200">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-[#2EC4B6]/5 minimal:hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FCA311] to-[#2EC4B6] minimal:bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Member Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                          {member.name}
                        </h3>
                        <Badge
                          className={`${getRoleBadgeColor(
                            member.role
                          )} flex items-center gap-1`}
                        >
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                        </Badge>
                        {member.status === "invited" && (
                          <Badge className="bg-yellow-100 dark:bg-yellow-900/20 minimal:bg-gray-100 text-yellow-700 dark:text-yellow-400 minimal:text-gray-900">
                            Invited
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
                        {member.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#FDFFFC]/40 minimal:text-gray-500 mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-600 hover:bg-gray-100 dark:hover:bg-[#2EC4B6]/10 minimal:hover:bg-gray-200"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {teamMembers.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#14213D] minimal:bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-gray-400 dark:text-[#FDFFFC]/40 minimal:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-2">
                No team members yet
              </h3>
              <p className="text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-4">
                Invite your first team member to get started
              </p>
              <Button className="bg-[#FCA311] hover:bg-[#FCA311]/90 dark:bg-gradient-to-r dark:from-[#FF9F1C] dark:to-[#2EC4B6] minimal:bg-gray-900 minimal:hover:bg-gray-800 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
