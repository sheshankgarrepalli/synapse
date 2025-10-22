import { Search, Bell, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

interface TopBarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export function TopBar({ darkMode, onToggleTheme }: TopBarProps) {
  const { user } = useUser();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-[#2EC4B6]/20 bg-white dark:bg-[#011627] flex items-center justify-between px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#FDFFFC]/40" />
          <Input
            placeholder="Search threads, projects, or team members..."
            className="pl-10 bg-gray-50 dark:bg-[#011627] border-gray-200 dark:border-[#2EC4B6]/30 text-gray-900 dark:text-[#FDFFFC] placeholder:text-gray-400 dark:placeholder:text-[#FDFFFC]/40 rounded-xl focus:border-[#FCA311] dark:focus:border-[#2EC4B6]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-[#FDFFFC]/60 hover:bg-gray-100 dark:hover:bg-[#2EC4B6]/10 dark:hover:text-[#2EC4B6] rounded-xl transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          className="w-9 h-9 flex items-center justify-center relative text-gray-600 dark:text-[#FDFFFC]/60 hover:bg-gray-100 dark:hover:bg-[#2EC4B6]/10 dark:hover:text-[#2EC4B6] rounded-xl transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FCA311] dark:bg-[#FF9F1C] rounded-full ring-2 ring-white dark:ring-[#011627]"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-[#2EC4B6]/20 mx-2" />

        <div className="flex items-center gap-3">
          {user && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border-2 border-gray-200 dark:border-[#2EC4B6]/30"
                }
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
