// Header Component

'use client';

import { useState, useEffect } from 'react';
import { Bell, LogOut, Sun, Moon } from 'lucide-react';
import { getEmployee, getNotifications } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { useTheme } from '@/lib/theme/theme-context';
import type { Employee, Notification } from '@/types';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [employeeData, notificationData] = await Promise.all([
        getEmployee(),
        getNotifications(),
      ]);
      setEmployee(employeeData);
      setNotifications(notificationData);
    }
    loadData();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6">
      <div>
        <h2 className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</h2>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {employee ? `${employee.firstName} ${employee.lastName}` : 'Loading...'}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50">
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No notifications
                  </p>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b border-gray-100 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Employee Info */}
        {employee && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-medium">
              {getInitials(employee.firstName, employee.lastName)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{employee.organizationName}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
