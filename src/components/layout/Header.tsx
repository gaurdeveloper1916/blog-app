'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Header({ user, toggleSidebar, isSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/login');
        router.refresh();
      } else {
        throw new Error('Failed to logout');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center px-4 border-b bg-card">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="md:hidden mr-2"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      <div className="flex items-center flex-1">
        <Link href="/dashboard" className="font-semibold text-lg mr-6">
          Blog Admin
        </Link>
      </div>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="hidden md:inline-block">{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-sm font-medium">
              {user.email}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm">
              Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="ghost" onClick={() => router.push('/login')}>
          Login
        </Button>
      )}
    </header>
  );
}
