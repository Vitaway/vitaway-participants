// Dashboard Home - Overview Page

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
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  getDashboardStats,
  getVitals,
  getGoals,
  getAppointments,
  getNotifications,
} from '@/lib/api';
import { formatDate, formatDateTime, getProgressPercentage } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { DashboardStats, VitalReading, Goal, Appointment, Notification } from '@/types';

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, vitalsData, goalsData, appointmentsData, notificationsData] =
          await Promise.all([
            getDashboardStats(),
            getVitals(),
            getGoals(),
            getAppointments(),
            getNotifications(),
          ]);

        setStats(statsData);
        setVitals(vitalsData);
        setGoals(goalsData);
        setAppointments(appointmentsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
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
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const latestWeight = vitals.find((v) => v.type === 'WEIGHT');
  const latestBMI = vitals.find((v) => v.type === 'BMI');
  const latestBP = vitals.find((v) => v.type === 'BLOOD_PRESSURE');
  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.scheduledAt) > new Date()
  );
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Track your health journey and stay on top of your goals
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.upcomingAppointments || 0}
                </p>
                <p className="text-xs text-gray-500">Appointments</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activeGoals || 0}
                </p>
                <p className="text-xs text-gray-500">Goals</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Program</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.programProgress || 0}%
                </p>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-100 p-3">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.currentStreak || 0}
                </p>
                <p className="text-xs text-gray-500">Days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Latest Vitals */}
          <Card title="Latest Vitals" className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Weight</p>
                  <Activity className="h-4 w-4 text-gray-400" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : 'N/A'}
                </p>
                {latestWeight && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(latestWeight.recordedAt)}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">BMI</p>
                  <Activity className="h-4 w-4 text-gray-400" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {latestBMI ? `${latestBMI.value}` : 'N/A'}
                </p>
                {latestBMI && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(latestBMI.recordedAt)}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                  <Activity className="h-4 w-4 text-gray-400" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {latestBP && typeof latestBP.value === 'object'
                    ? `${latestBP.value.systolic}/${latestBP.value.diastolic}`
                    : 'N/A'}
                </p>
                {latestBP && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(latestBP.recordedAt)}
                  </p>
                )}
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
                <p className="py-8 text-center text-sm text-gray-500">
                  No upcoming appointments
                </p>
              ) : (
                upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{appointment.title}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {appointment.provider.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDateTime(appointment.scheduledAt)}
                        </p>
                      </div>
                      <Badge variant="info">{appointment.duration}m</Badge>
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
                <p className="py-8 text-center text-sm text-gray-500">
                  No active goals
                </p>
              ) : (
                activeGoals.slice(0, 3).map((goal) => {
                  const progress = getProgressPercentage(goal.currentValue, goal.targetValue);
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{goal.title}</p>
                        <span className="text-sm text-gray-600">{progress}%</span>
                      </div>
                      <ProgressBar value={progress} className="mt-2" />
                      <p className="mt-1 text-xs text-gray-500">
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
              {notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  No notifications
                </p>
              ) : (
                notifications.slice(0, 4).map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg border p-3 ${
                      !notification.read
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
