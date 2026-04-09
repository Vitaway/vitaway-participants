// Header Component

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, LogOut, Sun, Moon, CheckCheck } from 'lucide-react';
import { getProfile, getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api';
import { getInitials, getRelativeTime } from '@/lib/utils';
import { useTheme } from '@/lib/theme/theme-context';
import { useAuth } from '@/lib/auth/auth-context';
import { ROUTES } from '@/lib/constants';
import type { Employee, Notification } from '@/types';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [employeeData, notificationData] = await Promise.all([
          getProfile(),
          getNotifications(),
        ]);
        setEmployee(employeeData);
        setNotifications(notificationData.data); // Extract .data array
      } catch (error) {
        console.error('Failed to load header data:', error);
      }
    }
    loadData();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  async function handleMarkRead(id: string) {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#15365a] dark:border-slate-800 bg-[#1c4670] dark:bg-slate-950 px-6 shadow-sm">
      <div>
        <h2 className="text-sm text-white/60">Welcome back,</h2>
        <h1 className="text-xl font-semibold text-white">
          {employee ? `${employee.firstName} ${employee.lastName}` : 'Loading...'}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-50">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-50">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No notifications
                  </p>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`group border-b border-slate-100 dark:border-slate-700 px-4 py-3 transition-colors ${
                        !notification.isRead
                          ? 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-50 truncate">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {getRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkRead(notification.id)}
                            className="mt-0.5 flex-shrink-0 h-2 w-2 rounded-full bg-primary-500 hover:bg-primary-400 transition-colors"
                            title="Mark as read"
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-2">
                <Link
                  href={ROUTES.NOTIFICATIONS}
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Employee Info */}
        {employee && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white font-medium shadow-sm">
              {getInitials(employee.firstName, employee.lastName)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">
                {employee.firstName} {employee.lastName}
              </p>
              <p className="text-xs text-white/60">{employee.organizationName}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
