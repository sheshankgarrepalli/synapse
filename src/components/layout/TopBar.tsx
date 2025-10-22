import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { UserButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';

interface TopBarProps {
  onMenuToggle: () => void;
  sidebarExpanded: boolean;
  onSearchClick: () => void;
}

export function TopBar({ onMenuToggle, sidebarExpanded, onSearchClick }: TopBarProps) {
  const { user } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-100">
      <div className="h-full px-6 flex items-center gap-6">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          {/* Menu Toggle - Visible on mobile or when sidebar can be toggled */}
          <button
            onClick={onMenuToggle}
            className={cn(
              "w-11 h-11 flex items-center justify-center rounded-md",
              "hover:bg-secondary transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "md:flex" // Always visible on desktop for collapsing
            )}
            aria-label="Toggle menu"
          >
            <Bars3Icon className="w-6 h-6 text-foreground" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-heading font-bold text-xl text-foreground hidden sm:block">
              Synapse
            </span>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-2xl">
          <button
            onClick={onSearchClick}
            className={cn(
              "w-full h-11 px-4 flex items-center gap-3",
              "bg-background border-2 border-input rounded-lg",
              "hover:border-gray-300 transition-colors duration-200",
              "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30",
              "group"
            )}
            aria-label="Open search"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-left text-muted-foreground text-sm">
              Search threads, actions...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted rounded border border-border">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Notifications Bell */}
          <NotificationBell />

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                  userButtonTrigger: 'focus:shadow-focus-primary',
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function NotificationBell() {
  const notifications = [
    {
      id: '1',
      icon: '🎨',
      title: 'Figma design updated',
      description: 'Homepage redesign has new changes',
      timestamp: '2 hours ago',
      unread: true,
    },
    {
      id: '2',
      icon: '✓',
      title: 'PR merged',
      description: 'Login bug fix successfully merged',
      timestamp: '1 day ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Menu as="div" className="relative">
      {/* Screen reader announcement for new notifications */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {unreadCount > 0 && `${unreadCount} new notification${unreadCount !== 1 ? 's' : ''}`}
      </div>

      <Menu.Button
        className={cn(
          "relative w-11 h-11 flex items-center justify-center rounded-md",
          "hover:bg-secondary transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <BellIcon className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-card border border-border shadow-lg focus:outline-none">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-card-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button className="text-xs text-primary hover:text-primary-600 font-medium">
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <button
                      className={cn(
                        "w-full px-4 py-3 flex gap-3 border-b border-border/50 last:border-0 transition-colors",
                        active && "bg-muted",
                        notification.unread && "bg-primary-50/30"
                      )}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-lg">
                        {notification.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-card-foreground">
                            {notification.title}
                          </p>
                          {notification.unread && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.timestamp}
                        </p>
                      </div>
                    </button>
                  )}
                </Menu.Item>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border">
            <button className="w-full text-sm text-primary hover:text-primary-600 font-medium text-center">
              View all notifications
            </button>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
