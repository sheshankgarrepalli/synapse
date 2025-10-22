import { Search, Bell, Moon, Sun, Minimize2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

interface TopBarProps {
  theme: 'light' | 'dark' | 'minimal';
  onToggleTheme: () => void;
}

export function TopBar({ theme, onToggleTheme }: TopBarProps) {
  const { user } = useUser();

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-5 h-5" />;
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    return <Minimize2 className="w-5 h-5" />;
  };

  const getThemeLabel = () => {
    if (theme === 'light') return 'Switch to Dark theme';
    if (theme === 'dark') return 'Switch to Minimal theme';
    return 'Switch to Light theme';
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 bg-white dark:bg-[#011627] minimal:bg-white flex items-center justify-between px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#FDFFFC]/40 minimal:text-gray-500" />
          <Input
            placeholder="Search threads, projects, or team members..."
            className="pl-10 bg-gray-50 dark:bg-[#011627] minimal:bg-gray-100 border-gray-200 dark:border-[#2EC4B6]/30 minimal:border-gray-300 text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 placeholder:text-gray-400 dark:placeholder:text-[#FDFFFC]/40 minimal:placeholder:text-gray-500 rounded-xl focus:border-[#FCA311] dark:focus:border-[#2EC4B6] minimal:focus:border-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-700 hover:bg-gray-100 dark:hover:bg-[#2EC4B6]/10 minimal:hover:bg-gray-200 dark:hover:text-[#2EC4B6] minimal:hover:text-gray-900 rounded-xl transition-colors"
          title={getThemeLabel()}
        >
          {getThemeIcon()}
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
