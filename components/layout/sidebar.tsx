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
    <div className="flex w-64 flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Vitaway</h1>
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
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-50'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Employee Portal v1.0
        </p>
      </div>
    </div>
  );
}
