import { Home, GitBranch, Users, FolderKanban, Plug, Settings, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/router";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: router.pathname === "/dashboard" },
    { icon: GitBranch, label: "Threads", href: "/threads", active: router.pathname.startsWith("/threads") },
    { icon: Users, label: "Team", href: "/team", active: router.pathname === "/team" },
    { icon: FolderKanban, label: "Projects", href: "/projects", active: router.pathname === "/projects" },
    { icon: Plug, label: "Integrations", href: "/integrations", active: router.pathname === "/integrations" },
    { icon: Settings, label: "Settings", href: "/settings", active: router.pathname === "/settings" },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-white dark:bg-[#01121F] border-r border-gray-200 dark:border-[#2EC4B6]/20 transition-all duration-300 flex flex-col`}
    >
      <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-[#2EC4B6]/20">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FCA311] to-[#FCA311]/70 dark:from-[#FF9F1C] dark:to-[#2EC4B6] flex items-center justify-center shadow-lg shadow-[#FCA311]/20 dark:shadow-[#FF9F1C]/20">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-[#FDFFFC]">Synapse</span>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FCA311] to-[#FCA311]/70 dark:from-[#FF9F1C] dark:to-[#2EC4B6] flex items-center justify-center mx-auto shadow-lg shadow-[#FCA311]/20 dark:shadow-[#FF9F1C]/20">
            <span className="text-white font-bold text-lg">S</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    item.active
                      ? "bg-[#FCA311] dark:bg-gradient-to-r dark:from-[#FF9F1C] dark:to-[#FF9F1C]/80 text-white shadow-lg shadow-[#FCA311]/20 dark:shadow-[#FF9F1C]/30"
                      : "text-gray-600 dark:text-[#FDFFFC]/60 hover:bg-gray-100 dark:hover:bg-[#2EC4B6]/10 dark:hover:text-[#2EC4B6]"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-[#2EC4B6]/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={`w-full text-gray-600 dark:text-[#FDFFFC]/60 hover:bg-gray-100 dark:hover:bg-[#2EC4B6]/10 dark:hover:text-[#2EC4B6] ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
