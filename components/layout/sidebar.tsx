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
  User,
  Shield,
  Bell,
  UtensilsCrossed,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: ROUTES.HOME, icon: Home },
  { name: 'Health Overview', href: ROUTES.HEALTH, icon: Activity },
  { name: 'Goals & Progress', href: ROUTES.GOALS, icon: Target },
  { name: 'Programs', href: ROUTES.PROGRAMS, icon: BookOpen },
  { name: 'Meal Plans', href: ROUTES.MEAL_PLANS, icon: UtensilsCrossed },
  { name: 'Appointments', href: ROUTES.APPOINTMENTS, icon: Calendar },
  { name: 'Notifications', href: ROUTES.NOTIFICATIONS, icon: Bell },
  { name: 'Profile', href: ROUTES.PROFILE, icon: User },
  { name: 'Privacy & Consent', href: ROUTES.CONSENT, icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col bg-[#1c4670] dark:bg-slate-950 border-r border-[#15365a] dark:border-slate-800 shadow-sm">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-[#15365a] dark:border-slate-800">
        <h1 className="text-2xl font-bold text-white">Vitaway</h1>
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
                  ? 'bg-white/20 text-white'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
