import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'minimal'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    setMounted(true);

    // Load theme preference from localStorage
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'minimal' | null;
    const initialTheme = storedTheme || 'light'; // Default to light if not set

    setTheme(initialTheme);

    // Apply theme immediately
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('minimal');
    } else if (initialTheme === 'minimal') {
      document.documentElement.classList.add('minimal');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark', 'minimal');
    }
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (!mounted) return;

    // Apply theme classes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('minimal');
    } else if (theme === 'minimal') {
      document.documentElement.classList.add('minimal');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark', 'minimal');
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const cycleTheme = () => {
    setTheme((current) => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'minimal';
      return 'light';
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#011627] minimal:bg-white">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar theme={theme} onToggleTheme={cycleTheme} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
