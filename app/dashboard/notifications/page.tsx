'use client';

import { useEffect, useState } from 'react';
import {
    Bell,
    CheckCheck,
    Calendar,
    Target,
    BookOpen,
    MessageSquare,
    Settings,
    UtensilsCrossed,
    Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '@/lib/api';
import { getRelativeTime } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types';

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
    appointment: <Calendar className="h-5 w-5 text-blue-500" />,
    goal: <Target className="h-5 w-5 text-green-500" />,
    program: <BookOpen className="h-5 w-5 text-purple-500" />,
    message: <MessageSquare className="h-5 w-5 text-primary-500" />,
    system: <Settings className="h-5 w-5 text-slate-500 dark:text-slate-400" />,
    meal_plan: <UtensilsCrossed className="h-5 w-5 text-orange-500" />,
};

const PRIORITY_VARIANTS: Record<string, 'error' | 'warning' | 'info'> = {
    high: 'error',
    normal: 'info',
    low: 'info',
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [markingAll, setMarkingAll] = useState(false);
    const [markingId, setMarkingId] = useState<string | null>(null);

    async function loadNotifications() {
        try {
            const result = await getNotifications({
                filter: filter === 'all' ? undefined : filter,
            });
            setNotifications(result.data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        loadNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    async function handleMarkRead(id: string) {
        if (markingId) return;
        try {
            setMarkingId(id);
            await markNotificationAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        } finally {
            setMarkingId(null);
        }
    }

    async function handleMarkAllRead() {
        try {
            setMarkingAll(true);
            await markAllNotificationsAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setMarkingAll(false);
        }
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                        <p className="text-slate-500 dark:text-slate-400">Loading notifications...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Notifications</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Stay up to date with your health activity
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleMarkAllRead}
                            disabled={markingAll}
                            className="flex items-center gap-2"
                        >
                            {markingAll ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCheck className="h-4 w-4" />
                            )}
                            Mark All as Read
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    {(['all', 'unread', 'read'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${filter === f
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
                                }`}
                        >
                            {f}
                            {f === 'unread' && unreadCount > 0 && (
                                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <Card>
                            <div className="flex flex-col items-center py-16">
                                <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                <p className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-50">
                                    No notifications
                                </p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {filter === 'unread'
                                        ? "You're all caught up!"
                                        : "You don't have any notifications yet."}
                                </p>
                            </div>
                        </Card>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`rounded-xl border p-4 transition-colors ${notification.isRead
                                    ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                    : 'border-primary-200 dark:border-primary-700/50 bg-primary-50 dark:bg-primary-900/20'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="mt-0.5 flex-shrink-0">
                                        {TYPE_ICONS[notification.type] ?? (
                                            <Bell className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-800 dark:text-slate-50">
                                                    {notification.title}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {notification.priority === 'high' && (
                                                    <Badge variant={PRIORITY_VARIANTS[notification.priority]}>
                                                        Urgent
                                                    </Badge>
                                                )}
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => handleMarkRead(notification.id)}
                                                        disabled={markingId === notification.id}
                                                        className="rounded-lg px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                                                    >
                                                        {markingId === notification.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            'Mark read'
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-2 flex items-center gap-3">
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                {getRelativeTime(notification.createdAt)}
                                            </span>
                                            <span className="text-xs capitalize text-slate-400 dark:text-slate-500">
                                                {notification.type}
                                            </span>
                                            {notification.isRead && notification.readAt && (
                                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                                    Read {getRelativeTime(notification.readAt)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
