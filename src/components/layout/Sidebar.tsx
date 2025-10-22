import { Fragment, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  BoltIcon,
  ChartBarIcon,
  UserGroupIcon,
  FolderIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  PlusIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  subItems?: {
    name: string;
    href: string;
    count?: number;
    badgeColor?: 'success' | 'warning' | 'error' | 'gray';
  }[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: ChartBarIcon,
  },
  {
    name: 'Threads',
    href: '/threads',
    icon: BoltIcon,
    subItems: [
      { name: 'Active', href: '/threads?status=active', count: 12, badgeColor: 'success' },
      { name: 'Paused', href: '/threads?status=paused', count: 4, badgeColor: 'warning' },
      { name: 'Completed', href: '/threads?status=completed', count: 48, badgeColor: 'gray' },
      { name: 'Errored', href: '/threads?status=errored', count: 2, badgeColor: 'error' },
    ],
  },
  {
    name: 'Team',
    href: '/team',
    icon: UserGroupIcon,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderIcon,
  },
  {
    name: 'Integrations',
    href: '/integrations',
    icon: PuzzlePieceIcon,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
  },
];

const badgeColors = {
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  gray: 'bg-gray-200 text-gray-700',
};

export function Sidebar({ expanded, onToggle, isMobile = false }: SidebarProps) {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Threads']);

  const toggleSubItems = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return router.pathname === href || router.asPath === href;
  };

  const isParentActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) => isActive(subItem.href));
    }
    return false;
  };

  return (
    <aside
      className={cn(
        "fixed top-16 left-0 bottom-0 bg-secondary border-r border-border transition-all duration-300 ease-smooth z-50",
        expanded ? "w-[280px]" : "w-[72px]",
        isMobile && !expanded && "hidden"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="px-4 py-4 flex items-center justify-end border-b border-border">
          <button
            onClick={onToggle}
            className={cn(
              "w-11 h-11 flex items-center justify-center rounded-md",
              "hover:bg-muted transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeftIcon
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform duration-300",
                !expanded && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          {/* MAIN Section */}
          {expanded && (
            <div className="px-3 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Main
              </h3>
            </div>
          )}

          <div className="space-y-1 mb-6">
            {navigation.slice(0, 2).map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                expanded={expanded}
                isActive={isParentActive(item)}
                isSubItemExpanded={expandedItems.includes(item.name)}
                onToggleSubItems={() => toggleSubItems(item.name)}
                isCurrentPath={isActive}
              />
            ))}
          </div>

          {/* WORKSPACE Section */}
          {expanded && (
            <div className="px-3 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Workspace
              </h3>
            </div>
          )}

          <div className="space-y-1">
            {navigation.slice(2).map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                expanded={expanded}
                isActive={isParentActive(item)}
                isSubItemExpanded={expandedItems.includes(item.name)}
                onToggleSubItems={() => toggleSubItems(item.name)}
                isCurrentPath={isActive}
              />
            ))}
          </div>
        </nav>

        {/* Bottom Section - CTA Button */}
        <div className="p-4 border-t border-border">
          <Link
            href="/threads/new"
            className={cn(
              "flex items-center justify-center gap-2 w-full h-10 rounded-lg",
              "bg-primary hover:bg-primary-500 active:bg-primary-600",
              "text-white font-semibold text-sm",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              !expanded && "w-10"
            )}
          >
            <PlusIcon className="w-5 h-5" />
            {expanded && <span>New Thread</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  expanded: boolean;
  isActive: boolean;
  isSubItemExpanded: boolean;
  onToggleSubItems: () => void;
  isCurrentPath: (href: string) => boolean;
}

function NavItemComponent({
  item,
  expanded,
  isActive,
  isSubItemExpanded,
  onToggleSubItems,
  isCurrentPath,
}: NavItemComponentProps) {
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <div>
      {/* Main Nav Item */}
      {hasSubItems ? (
        <button
          onClick={onToggleSubItems}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isActive
              ? "bg-primary-50 text-primary-700 font-semibold border-l-3 border-primary-400"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            !expanded && "justify-center px-2"
          )}
          title={!expanded ? item.name : undefined}
        >
          <item.icon
            className={cn(
              "w-5 h-5 flex-shrink-0",
              isActive ? "text-primary-600" : "text-gray-500"
            )}
          />
          {expanded && (
            <>
              <span className="flex-1 text-left text-sm">{item.name}</span>
              <ChevronRightIcon
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isSubItemExpanded && "rotate-90"
                )}
              />
            </>
          )}
        </button>
      ) : (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isActive
              ? "bg-primary-50 text-primary-700 font-semibold border-l-3 border-primary-400"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            !expanded && "justify-center px-2"
          )}
          title={!expanded ? item.name : undefined}
        >
          <item.icon
            className={cn(
              "w-5 h-5 flex-shrink-0",
              isActive ? "text-primary-600" : "text-gray-500"
            )}
          />
          {expanded && <span className="flex-1 text-sm">{item.name}</span>}
          {expanded && item.badge && (
            <span className="px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      )}

      {/* Sub Items */}
      {hasSubItems && expanded && isSubItemExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.subItems!.map((subItem) => (
            <Link
              key={subItem.name}
              href={subItem.href}
              className={cn(
                "flex items-center justify-between gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                "text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isCurrentPath(subItem.href)
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-gray-400">↳</span>
                {subItem.name}
              </span>
              {subItem.count !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-semibold rounded-md",
                    badgeColors[subItem.badgeColor || 'gray']
                  )}
                >
                  {subItem.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
