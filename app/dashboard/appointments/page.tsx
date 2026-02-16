// Appointments Page

'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  RotateCcw,
  User,
  Plus,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAppointments } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import type { Appointment } from '@/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('UPCOMING');

  useEffect(() => {
    async function loadData() {
      try {
        const appointmentsData = await getAppointments();
        setAppointments(appointmentsData.data);
      } catch (error) {
        console.error('Failed to load appointments:', error);
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
          <p className="text-slate-500">Loading appointments...</p>
        </div>
      </DashboardLayout>
    );
  }

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.scheduledAt) > now
  );
  const pastAppointments = appointments.filter(
    (a) => new Date(a.scheduledAt) <= now
  );

  const filteredAppointments =
    filter === 'UPCOMING'
      ? upcomingAppointments
      : filter === 'PAST'
      ? pastAppointments
      : appointments;

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      SCHEDULED: 'default',
      COMPLETED: 'success',
      CANCELLED: 'error',
      RESCHEDULED: 'warning',
    };
    return colors[status] || 'default';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HEALTH_COACH':
        return <User className="h-5 w-5" />;
      case 'NUTRITIONIST':
        return <User className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Appointments</h1>
            <p className="mt-1 text-slate-600">
              Manage your health sessions and consultations
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary-100 p-3">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Upcoming</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50 dark:text-slate-50">
                  {upcomingAppointments.length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50 dark:text-slate-50">
                  {appointments.filter((a) => a.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-slate-100 p-3">
                <Clock className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Sessions</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50 dark:text-slate-50">{appointments.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['ALL', 'UPCOMING', 'PAST'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <p className="py-12 text-center text-slate-500">
                No {filter.toLowerCase()} appointments found
              </p>
            </Card>
          ) : (
            filteredAppointments
              .sort(
                (a, b) =>
                  new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
              )
              .map((appointment) => {
                const isUpcoming = new Date(appointment.scheduledAt) > now;

                return (
                  <Card key={appointment.id}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-primary-100 p-3 text-primary-600">
                            {getTypeIcon(appointment.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">
                                {appointment.title}
                              </h3>
                              <Badge variant={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <User className="h-4 w-4" />
                                <span>
                                  {appointment.provider.name}
                                  {appointment.provider.title &&
                                    ` - ${appointment.provider.title}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(appointment.scheduledAt)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatTime(appointment.scheduledAt)} (
                                  {appointment.duration} minutes)
                                </span>
                              </div>
                              {appointment.teleheathLink && (
                                <div className="flex items-center gap-2 text-sm text-primary-600">
                                  <Video className="h-4 w-4" />
                                  <span>Telehealth session</span>
                                </div>
                              )}
                            </div>
                            {appointment.notes && (
                              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                                <p className="text-sm text-slate-700">
                                  <strong>Notes:</strong> {appointment.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {isUpcoming && appointment.status === 'SCHEDULED' && (
                        <div className="flex gap-2 pt-2 border-t border-slate-200">
                          {appointment.teleheathLink && (
                            <Button className="flex-1 flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Join Session
                            </Button>
                          )}
                          {appointment.canReschedule && (
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Reschedule
                            </Button>
                          )}
                          {appointment.canCancel && (
                            <Button
                              variant="outline"
                              className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
