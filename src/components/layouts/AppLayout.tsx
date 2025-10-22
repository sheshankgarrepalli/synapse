import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#011627]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
