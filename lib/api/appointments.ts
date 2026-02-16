// Appointments API Service

import { apiClient } from './client';
import type { Appointment, AppointmentBooking } from '@/types';

// ─── Get Appointments ───────────────────────────────────────────────
export async function getAppointments(params?: {
  status?: 'scheduled' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  filter?: 'upcoming' | 'past';
  perPage?: number;
  page?: number;
}): Promise<{ data: Appointment[]; meta: any }> {
  try {
    const response = await apiClient.get<{ data: any[]; meta: any }>(
      '/api/org/employee/appointments',
      {
        status: params?.status,
        filter: params?.filter,
        per_page: params?.perPage,
        page: params?.page,
      }
    );

    return {
      data: Array.isArray(response.data) ? response.data.map((appointment: any) => ({
      id: String(appointment.id),
      employeeId: String(appointment.employee_id),
      providerId: String(appointment.provider_id),
      appointmentType: appointment.appointment_type,
      appointmentDate: appointment.appointment_date,
      appointmentTime: appointment.appointment_time,
      durationMinutes: appointment.duration_minutes,
      status: appointment.status,
      notes: appointment.notes,
      telehealthLink: appointment.telehealth_link,
      cancellationReason: appointment.cancellation_reason,
      provider: appointment.provider ? {
        id: String(appointment.provider.id),
        name: appointment.provider.name,
        email: appointment.provider.email,
        specialty: appointment.provider.specialty,
      } : undefined,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at,
    })) : [],
      meta: response.meta || {},
    };
  } catch (error: any) {
    console.error('Failed to fetch appointments:', error);
    return { data: [], meta: {} };
  }
}

// ─── Get Single Appointment ─────────────────────────────────────────
export async function getAppointment(id: string): Promise<Appointment> {
  const response = await apiClient.get<{ data: any }>(
    `/api/org/employee/appointments/${id}`
  );

  const appointment = response.data;
  return {
    id: String(appointment.id),
    employeeId: String(appointment.employee_id),
    providerId: String(appointment.provider_id),
    appointmentType: appointment.appointment_type,
    appointmentDate: appointment.appointment_date,
    appointmentTime: appointment.appointment_time,
    durationMinutes: appointment.duration_minutes,
    status: appointment.status,
    notes: appointment.notes,
    telehealthLink: appointment.telehealth_link,
    cancellationReason: appointment.cancellation_reason,
    provider: appointment.provider ? {
      id: String(appointment.provider.id),
      name: appointment.provider.name,
      email: appointment.provider.email,
      specialty: appointment.provider.specialty,
    } : undefined,
    createdAt: appointment.created_at,
    updatedAt: appointment.updated_at,
  };
}

// ─── Book Appointment ───────────────────────────────────────────────
export async function bookAppointment(
  data: AppointmentBooking
): Promise<Appointment> {
  const response = await apiClient.post<{ data: any }>(
    '/api/org/employee/appointments',
    {
      provider_id: data.providerId,
      appointment_type: data.appointmentType,
      appointment_date: data.appointmentDate,
      appointment_time: data.appointmentTime,
      duration_minutes: data.durationMinutes,
      notes: data.notes,
    }
  );

  const appointment = response.data;
  return {
    id: String(appointment.id),
    employeeId: String(appointment.employee_id),
    providerId: String(appointment.provider_id),
    appointmentType: appointment.appointment_type,
    appointmentDate: appointment.appointment_date,
    appointmentTime: appointment.appointment_time,
    durationMinutes: appointment.duration_minutes,
    status: appointment.status,
    notes: appointment.notes,
    telehealthLink: appointment.telehealth_link,
    provider: appointment.provider,
    createdAt: appointment.created_at,
    updatedAt: appointment.updated_at,
  };
}

// ─── Reschedule Appointment ─────────────────────────────────────────
export async function rescheduleAppointment(
  id: string,
  data: {
    appointmentDate: string;
    appointmentTime: string;
    reason?: string;
  }
): Promise<Appointment> {
  const response = await apiClient.put<{ data: any }>(
    `/api/org/employee/appointments/${id}/reschedule`,
    {
      appointment_date: data.appointmentDate,
      appointment_time: data.appointmentTime,
      reason: data.reason,
    }
  );

  const appointment = response.data;
  return {
    id: String(appointment.id),
    employeeId: String(appointment.employee_id),
    providerId: String(appointment.provider_id),
    appointmentType: appointment.appointment_type,
    appointmentDate: appointment.appointment_date,
    appointmentTime: appointment.appointment_time,
    durationMinutes: appointment.duration_minutes,
    status: appointment.status,
    notes: appointment.notes,
    telehealthLink: appointment.telehealth_link,
    createdAt: appointment.created_at,
    updatedAt: appointment.updated_at,
  };
}

// ─── Cancel Appointment ─────────────────────────────────────────────
export async function cancelAppointment(
  id: string,
  reason?: string
): Promise<{ message: string }> {
  const response = await apiClient.put<{ message: string }>(
    `/api/org/employee/appointments/${id}/cancel`,
    { reason }
  );

  return response;
}

// ─── Get Telehealth Link ────────────────────────────────────────────
export async function getTelehealthLink(id: string): Promise<{ link: string }> {
  const response = await apiClient.get<{ data: { link: string } }>(
    `/api/org/employee/appointments/${id}/telehealth`
  );

  return { link: response.data.link };
}
