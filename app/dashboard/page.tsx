
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    Calendar,
    Target,
    MessageSquare,
    Award,
    Activity,
    ArrowRight,
    Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    getDashboardOverview,
} from '@/lib/api';
import { formatDate, getProgressPercentage } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { DashboardOverview } from '@/types';


function isBloodPressureValue(value: unknown): value is { systolic: number; diastolic: number } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'systolic' in value &&
        'diastolic' in value
    );
}

export default function DashboardHome() {
    const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                const data = await getDashboardOverview();
                console.log(data)
                setDashboard(data);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                setError(error instanceof Error ? error.message : 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                        <p className="text-slate-500 dark:text-slate-400">Loading your dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !dashboard) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">Failed to load dashboard</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{error || 'Unknown error'}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="mt-4"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    console.log(dashboard.latestVitals)

    const latestWeight = dashboard.latestVitals.weight;
    const latestWeightUnity = dashboard.latestVitals.weight_unity;
    const latestBMI = dashboard.latestVitals.bmi;
    const latestBP = dashboard.latestVitals.blood_pressure;
    const systolicBP = dashboard.latestVitals.systolic_bp;
    const diastolicBP = dashboard.latestVitals.diastolic_bp;

    const upcomingAppointments = dashboard.upcomingAppointments;
    const activeGoals = dashboard.pendingGoals.goals.filter((g) => g.status === 'active');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Dashboard</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                        Track your health journey and stay on top of your goals
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3">
                                <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Upcoming</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                                    {dashboard.upcomingAppointments.length}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Appointments</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                                    {dashboard.pendingGoals.active}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Goals</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Program</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                                    {Math.round(dashboard.stats.programCompletionRate)}%
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Complete</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
                                <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Streak</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                                    {dashboard.stats.currentStreak}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Days</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Latest Vitals */}
                    <Card title="Latest Vitals" className="lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Weight</p>
                                    <Activity className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </div>
                                <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-50">
                                    {latestWeight ? `${latestWeight} ${latestWeightUnity}` : 'N/A'}
                                </p>
                            </div>

                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">BMI</p>
                                    <Activity className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </div>
                                <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-50">
                                    {latestBMI ? `${latestBMI}` : 'N/A'}
                                </p>
                            </div>

                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Blood Pressure</p>
                                    <Activity className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </div>
                                <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-50">
                                    {systolicBP && diastolicBP ? `${systolicBP}/${diastolicBP} mmHg` : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link href={ROUTES.HEALTH}>
                                <Button variant="outline" className="w-full">
                                    View Full Health Overview
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Upcoming Appointments */}
                    <Card title="Upcoming Appointments">
                        <div className="space-y-3">
                            {upcomingAppointments.length === 0 ? (
                                <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                    No upcoming appointments
                                </p>
                            ) : (
                                upcomingAppointments.slice(0, 3).map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800 dark:text-slate-50">{appointment.appointmentType}</p>
                                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                    {appointment.providerDetails?.name || 'Provider TBD'}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                                                </p>
                                            </div>
                                            <Badge variant="info">{appointment.durationMinutes}m</Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-4">
                            <Link href={ROUTES.APPOINTMENTS}>
                                <Button variant="outline" className="w-full">
                                    Manage Appointments
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Goals and Notifications */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Goal Progress */}
                    <Card title="Goal Progress">
                        <div className="space-y-4">
                            {activeGoals.length === 0 ? (
                                <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                    No active goals
                                </p>
                            ) : (
                                activeGoals.slice(0, 3).map((goal) => {
                                    const progress = getProgressPercentage(goal.currentValue, goal.targetValue);
                                    return (
                                        <div key={goal.id}>
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-slate-800 dark:text-slate-50">{goal.title}</p>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{progress}%</span>
                                            </div>
                                            <ProgressBar value={progress} className="mt-2" />
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="mt-4">
                            <Link href={ROUTES.GOALS}>
                                <Button variant="outline" className="w-full">
                                    View All Goals
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Recent Notifications */}
                    <Card title="Recent Notifications">
                        <div className="space-y-3">
                            {dashboard.unreadNotifications === 0 ? (
                                <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                    No unread notifications
                                </p>
                            ) : (
                                <div className="rounded-lg border border-primary-200 dark:border-primary-700/50 bg-primary-50 dark:bg-primary-900/20 p-4">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="h-5 w-5 text-primary-600" />
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-50">
                                                You have {dashboard.unreadNotifications} unread notification{dashboard.unreadNotifications !== 1 ? 's' : ''}
                                            </p>
                                            <Link href="/dashboard/notifications">
                                                <Button variant="ghost" className="mt-1 p-0 text-sm">
                                                    View all notifications
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
