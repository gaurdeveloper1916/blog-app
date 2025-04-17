'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  User2,
  Settings,
  Tag,
  Users,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
  isOpen: boolean;
  userRole?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  requiredRole?: string;
}

export function Sidebar({ className, isOpen, userRole = 'editor' }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Blogs',
      href: '/dashboard/blogs',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Tags',
      href: '/dashboard/tags',
      icon: <Tag className="h-5 w-5" />,
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: <User2 className="h-5 w-5" />,
    },
    {
      title: 'Users',
      href: '/dashboard/users',
      icon: <Users className="h-5 w-5" />,
      requiredRole: 'admin',
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
      requiredRole: 'admin',
    },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(
    (item) => !item.requiredRole || userRole === item.requiredRole
  );

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card transition-transform md:translate-x-0 md:relative',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        className
      )}
    >
      <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="flex-1">{item.title}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
