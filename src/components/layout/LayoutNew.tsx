import { ReactNode, useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '@/components/CommandPalette';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function LayoutNew({ children }: LayoutProps) {
  // Sidebar state
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCreateThreadModalOpen, setIsCreateThreadModalOpen] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load sidebar state from localStorage
  useEffect(() => {
    if (!isMobile) {
      const saved = localStorage.getItem('sidebar-expanded');
      if (saved !== null) {
        setSidebarExpanded(saved === 'true');
      }
    }
  }, [isMobile]);

  // Save sidebar state to localStorage
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-expanded', String(sidebarExpanded));
    }
  }, [sidebarExpanded, isMobile]);

  // Command Palette keyboard shortcut (Cmd+K on Mac, Ctrl+K on Windows/Linux)
  useKeyboardShortcut(
    { key: 'k', metaKey: true },
    () => {
      setIsCommandPaletteOpen((prev) => !prev);
    }
  );

  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileNavOpen(true);
    } else {
      setSidebarExpanded((prev) => !prev);
    }
  };

  const handleSearchClick = () => {
    setIsCommandPaletteOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <TopBar
        onMenuToggle={handleMenuToggle}
        sidebarExpanded={sidebarExpanded}
        onSearchClick={handleSearchClick}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded((prev) => !prev)} />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <main
        className={cn(
          "transition-all duration-300 ease-smooth",
          "mt-16 min-h-[calc(100vh-4rem)]",
          "p-6 md:p-12",
          // Desktop margin based on sidebar state
          !isMobile && (sidebarExpanded ? "md:ml-[280px]" : "md:ml-[72px]")
        )}
      >
        <div className="mx-auto max-w-[1440px]">
          {children}
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setIsCreateThreadModalOpen={setIsCreateThreadModalOpen}
        setIsIntegrationModalOpen={setIsIntegrationModalOpen}
      />
    </div>
  );
}
