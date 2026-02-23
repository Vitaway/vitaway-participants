// Appointments API Service

import { apiClient } from './client';
import type { Appointment, AppointmentBooking, Provider } from '@/types';

// ─── Get Available Providers ────────────────────────────────────────
export async function getAvailableProviders(params?: {
  type?: 'user' | 'organization_admin';
  organizationId?: string;
}): Promise<Provider[]> {
  try {
    const queryParams: Record<string, any> = {};
    if (params?.type) queryParams.type = params.type;
    if (params?.organizationId && params.organizationId !== 'undefined') {
      queryParams.organization_id = params.organizationId;
    }

    console.log('Fetching providers with params:', queryParams);

    const response = await apiClient.get<{ data: any[] }>(
      '/organization/api/employee/appointments/available-providers',
      queryParams
    );

    return response.data.map((provider: any) => ({
      id: String(provider.id),
      name: provider.name,
      email: provider.email,
      phone: provider.phone,
      specialty: provider.specialty,
      type: provider.type,
    }));
  } catch (error: any) {
    console.error('Failed to fetch available providers:', error);
    return [];
  }
}

// ─── Get Employee Appointments ──────────────────────────────────────
export async function getAppointments(params?: {
  status?: 'scheduled' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  type?: string;
  filter?: 'upcoming' | 'past';
  perPage?: number;
  page?: number;
}): Promise<{ data: Appointment[]; meta: any }> {
  try {
    const response = await apiClient.get<{ data: any; meta?: any }>(
      '/organization/api/employee/appointments',
      {
        status: params?.status,
        type: params?.type,
        filter: params?.filter,
        per_page: params?.perPage,
        page: params?.page,
      }
    );

    // Handle pagination response
    const appointmentData = response.data?.data || response.data || [];
    const appointments = Array.isArray(appointmentData) ? appointmentData : [];

    return {
      data: appointments.map((appointment: any) => ({
        id: String(appointment.id),
        employeeId: String(appointment.employee_id),
        providerId: String(appointment.provider_id),
        providerType: appointment.provider_type,
        partnerOrganizationId: appointment.partner_organization_id
          ? String(appointment.partner_organization_id)
          : undefined,
        appointmentType: appointment.appointment_type,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        durationMinutes: appointment.duration_minutes,
        status: appointment.status,
        notes: appointment.notes,
        telehealthLink: appointment.telehealth_link,
        cancellationReason: appointment.cancellation_reason,
        providerDetails: appointment.provider_details ? {
          id: String(appointment.provider_details.id),
          name: appointment.provider_details.name,
          email: appointment.provider_details.email,
          phone: appointment.provider_details.phone,
          specialty: appointment.provider_details.specialty,
          type: appointment.provider_details.type,
        } : undefined,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at,
      })),
      meta: response.data?.meta || response.meta || {},
    };
  } catch (error: any) {
    console.error('Failed to fetch appointments:', error);
    return { data: [], meta: {} };
  }
}

// ─── Get Single Appointment ─────────────────────────────────────────
export async function getAppointment(id: string): Promise<Appointment> {
  const response = await apiClient.get<{ data: any }>(
    `/organization/api/employee/appointments/${id}`
  );

  const appointment = response.data;
  return {
    id: String(appointment.id),
    employeeId: String(appointment.employee_id),
    providerId: String(appointment.provider_id),
    providerType: appointment.provider_type,
    partnerOrganizationId: appointment.partner_organization_id
      ? String(appointment.partner_organization_id)
      : undefined,
    appointmentType: appointment.appointment_type,
    appointmentDate: appointment.appointment_date,
    appointmentTime: appointment.appointment_time,
    durationMinutes: appointment.duration_minutes,
    status: appointment.status,
    notes: appointment.notes,
    telehealthLink: appointment.telehealth_link,
    cancellationReason: appointment.cancellation_reason,
    providerDetails: appointment.provider_details ? {
      id: String(appointment.provider_details.id),
      name: appointment.provider_details.name,
      email: appointment.provider_details.email,
      phone: appointment.provider_details.phone,
      specialty: appointment.provider_details.specialty,
      type: appointment.provider_details.type,
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
    '/organization/api/employee/appointments',
    {
      provider_id: data.providerId,
      provider_type: data.providerType,
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
    providerType: appointment.provider_type,
    partnerOrganizationId: appointment.partner_organization_id
      ? String(appointment.partner_organization_id)
      : undefined,
    appointmentType: appointment.appointment_type,
    appointmentDate: appointment.appointment_date,
    appointmentTime: appointment.appointment_time,
    durationMinutes: appointment.duration_minutes,
    status: appointment.status,
    notes: appointment.notes,
    telehealthLink: appointment.telehealth_link,
    providerDetails: appointment.provider_details ? {
      id: String(appointment.provider_details.id),
      name: appointment.provider_details.name,
      email: appointment.provider_details.email,
      phone: appointment.provider_details.phone,
      specialty: appointment.provider_details.specialty,
      type: appointment.provider_details.type,
    } : undefined,
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
    `/organization/api/employee/appointments/${id}/reschedule`,
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
    providerType: appointment.provider_type,
    appointmentType: appointment.appointment_type,
    appointmentDate: appointment.appointment_date,
    appointmentTime: appointment.appointment_time,
    durationMinutes: appointment.duration_minutes,
    status: appointment.status,
    notes: appointment.notes,
    telehealthLink: appointment.telehealth_link,
    providerDetails: appointment.provider_details,
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
    `/organization/api/employee/appointments/${id}/cancel`,
    { reason }
  );

  return response;
}

// ─── Get Telehealth Link ────────────────────────────────────────────
export async function getTelehealthLink(id: string): Promise<{ link: string }> {
  const response = await apiClient.get<{ data: { link: string } }>(
    `/organization/api/employee/appointments/${id}/telehealth`
  );

  return { link: response.data.link };
}
