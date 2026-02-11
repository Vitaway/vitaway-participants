// Sidebar Navigation Component

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Activity,
  Target,
  BookOpen,
  Calendar,
  MessageSquare,
  User,
  Shield,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: ROUTES.HOME, icon: Home },
  { name: 'Health Overview', href: ROUTES.HEALTH, icon: Activity },
  { name: 'Goals & Progress', href: ROUTES.GOALS, icon: Target },
  { name: 'Programs', href: ROUTES.PROGRAMS, icon: BookOpen },
  { name: 'Appointments', href: ROUTES.APPOINTMENTS, icon: Calendar },
  { name: 'Messages', href: ROUTES.MESSAGES, icon: MessageSquare },
  { name: 'Profile', href: ROUTES.PROFILE, icon: User },
  { name: 'Privacy & Consent', href: ROUTES.CONSENT, icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Vitaway</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Employee Portal v1.0
        </p>
      </div>
    </div>
  );
}
