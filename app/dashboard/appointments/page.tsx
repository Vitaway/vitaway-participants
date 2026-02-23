// Appointments Page - Employee View

'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  User,
  Plus,
  Filter,
  Building2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {Button } from '@/components/ui/button';
import { BookAppointmentModal } from '@/components/appointments/book-appointment-modal';
import { getAppointments } from '@/lib/api/appointments';
import type { Appointment, AppointmentStatus } from '@/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [filter, statusFilter]);

  async function loadAppointments() {
    setLoading(true);
    try {
      const params: any = {};
      
      if (filter !== 'all') {
        params.filter = filter;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const result = await getAppointments(params);
      setAppointments(result.data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: AppointmentStatus): 'success' | 'warning' | 'error' | 'default' => {
    const colors: Record<AppointmentStatus, 'success' | 'warning' | 'error' | 'default'> = {
      scheduled: 'default',
      confirmed: 'warning',
      completed: 'success',
      cancelled: 'error',
      rescheduled: 'warning',
      no_show: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: AppointmentStatus): string => {
    const labels: Record<AppointmentStatus, string> = {
      scheduled: 'Scheduled',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rescheduled: 'Rescheduled',
      no_show: 'No Show',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      coaching: 'Coaching',
      mental_health: 'Mental Health',
      nutrition: 'Nutrition',
      general: 'General',
      consultation: 'Consultation',
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isUpcoming = (appointment: Appointment): boolean => {
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    return appointmentDateTime > new Date();
  };

  // Calculate stats
  const upcomingCount = appointments.filter(a => isUpcoming(a) && a.status !== 'cancelled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500 dark:text-slate-400">Loading appointments...</p>
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Appointments</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Manage your health consultations and sessions
            </p>
          </div>
          <Button
            onClick={() => setShowBookModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3">
                <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Upcoming</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                  {upcomingCount}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                  {completedCount}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
                <Clock className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                  {appointments.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Filters:
              </span>
            </div>
            
            {/* Time Filter */}
            <div className="flex gap-2">
              {(['all', 'upcoming', 'past'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <div className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" />
                <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                  No appointments found
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Book an appointment to get started
                </p>
                <Button
                  onClick={() => setShowBookModal(true)}
                  className="mt-4 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Book Appointment
                </Button>
              </div>
            </Card>
          ) : (
            appointments.map((appointment) => {
              const upcoming = isUpcoming(appointment);

              return (
                <Card key={appointment.id}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3 text-primary-600 dark:text-primary-400">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">
                                  {getTypeLabel(appointment.appointmentType)}
                                </h3>
                                <Badge variant={getStatusColor(appointment.status)}>
                                  {getStatusLabel(appointment.status)}
                                </Badge>
                                {upcoming && (
                                  <Badge variant="default">
                                    Upcoming
                                  </Badge>
                                )}
                              </div>
                              
                              {appointment.providerDetails && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <User className="h-4 w-4" />
                                    <span>{appointment.providerDetails.name}</span>
                                    {appointment.providerDetails.type === 'organization_admin' && (
                                      <Badge variant="default" className="text-xs">
                                        <Building2 className="h-3 w-3 mr-1" />
                                        Partner
                                      </Badge>
                                    )}
                                  </div>
                                  {appointment.providerDetails.specialty && (
                                    <div className="text-xs text-slate-500 dark:text-slate-500 ml-6">
                                      {appointment.providerDetails.specialty}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(appointment.appointmentDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {formatTime(appointment.appointmentTime)} ({appointment.durationMinutes} min)
                                  </span>
                                </div>
                                {appointment.telehealthLink && (
                                  <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                                    <Video className="h-4 w-4" />
                                    <span>Telehealth session available</span>
                                  </div>
                                )}
                              </div>

                              {appointment.notes && (
                                <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                                  <p className="text-sm text-slate-700 dark:text-slate-300">
                                    <strong>Notes:</strong> {appointment.notes}
                                  </p>
                                </div>
                              )}

                              {appointment.cancellationReason && (
                                <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                                  <p className="text-sm text-red-700 dark:text-red-400">
                                    <strong>Cancellation reason:</strong> {appointment.cancellationReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {upcoming && (appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                      <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        {appointment.telehealthLink && (
                          <Button
                            onClick={() => window.open(appointment.telehealthLink, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <Video className="h-4 w-4" />
                            Join Session
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            // TODO: Implement cancel
                            console.log('Cancel appointment:', appointment.id);
                          }}
                          className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        onSuccess={() => {
          loadAppointments();
        }}
      />
    </DashboardLayout>
  );
}
