// API Service Layer
// Real API implementation for employee dashboard

import { apiClient } from './client';
import type {
  Employee,
  ConsentPreferences,
  VitalReading,
  Goal,
  Program,
  ProgramModule,
  Appointment,
  Conversation,
  Message,
  Notification,
  DashboardStats,
  HealthAssessment,
} from '@/types';

// ─── Employee Profile ───────────────────────────────────────────────
export async function getEmployee(): Promise<Employee> {
  const response = await apiClient.get<any>('/api/organization/employee/profile');
  
  return {
    id: String(response.id),
    email: response.email,
    firstName: response.first_name || '',
    lastName: response.last_name || '',
    organizationId: String(response.organization_id),
    organizationName: response.organization?.name || '',
    role: 'EMPLOYEE',
    dateOfBirth: response.date_of_birth,
    phone: response.phone,
    joinedAt: response.created_at,
  };
}

export async function updateEmployee(data: Partial<Employee>): Promise<Employee> {
  const response = await apiClient.put<any>('/api/organization/employee/profile', {
    phone: data.phone,
    preferences: data,
  });
  
  return {
    id: String(response.id),
    email: response.email,
    firstName: response.first_name || '',
    lastName: response.last_name || '',
    organizationId: String(response.organization_id),
    organizationName: response.organization?.name || '',
    role: 'EMPLOYEE',
    dateOfBirth: response.date_of_birth,
    phone: response.phone,
    joinedAt: response.created_at,
  };
}

// ─── Dashboard Stats ────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<any>('/api/organization/employee/dashboard/overview');
  
  return {
    upcomingAppointments: response.upcoming_appointments?.length || 0,
    activeGoals: response.pending_goals_count || 0,
    programProgress: response.active_programs?.reduce((acc: number, prog: any) => 
      acc + (prog.completion_percentage || 0), 0) / (response.active_programs?.length || 1) || 0,
    unreadMessages: response.unread_notifications_count || 0,
    currentStreak: 0, // Not provided by backend
    completedModulesThisWeek: 0, // Calculate if needed
  };
}

// ─── Health Data - Vitals ───────────────────────────────────────────
export async function getVitals(filters?: {
  type?: string;
  from_date?: string;
  to_date?: string;
  per_page?: number;
}): Promise<VitalReading[]> {
  const response = await apiClient.get<{ data: any[] }>(
    '/api/organization/employee/health/vitals',
    filters
  );
  
  return response.data.map((vital: any) => ({
    id: String(vital.id),
    employeeId: String(vital.employee_id),
    type: vital.vital_type.toUpperCase().replace('_', ' '),
    value: vital.value,
    unit: vital.unit,
    recordedAt: vital.recorded_at,
  }));
}

// ─── Health Data - Assessments ──────────────────────────────────────
export async function getAssessments(filters?: {
  type?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  per_page?: number;
}): Promise<HealthAssessment[]> {
  const response = await apiClient.get<{ data: any[] }>(
    '/api/organization/employee/health/assessments',
    filters
  );
  
  return response.data.map((assessment: any) => ({
    id: String(assessment.id),
    employeeId: String(assessment.employee_id),
    type: assessment.assessment_type,
    status: assessment.status,
    score: assessment.score,
    results: assessment.results,
    completedAt: assessment.completed_at,
    createdAt: assessment.created_at,
  }));
}

export async function getAssessment(id: string): Promise<HealthAssessment> {
  const response = await apiClient.get<any>(
    `/api/organization/employee/health/assessments/${id}`
  );
  
  return {
    id: String(response.id),
    employeeId: String(response.employee_id),
    type: response.assessment_type,
    status: response.status,
    score: response.score,
    results: response.results,
    completedAt: response.completed_at,
    createdAt: response.created_at,
  };
}

// ─── Consent Preferences ────────────────────────────────────────────
export async function getConsentPreferences(): Promise<ConsentPreferences> {
  const response = await apiClient.get<any[]>(
    '/api/organization/employee/consent/settings'
  );
  
  // Transform array of consent settings to ConsentPreferences
  const healthConsent = response.find((c: any) => c.consent_type === 'health_data');
  const vitalsConsent = response.find((c: any) => c.consent_type === 'vitals');
  
  return {
    allowEmployerAccess: healthConsent?.employer_visibility ?? false,
    allowAggregatedData: true, // Not directly mapped
    allowIndividualData: vitalsConsent?.employer_visibility ?? false,
    lastUpdated: healthConsent?.updated_at || new Date().toISOString(),
    version: '1.0',
  };
}

export async function updateConsentPreferences(
  preferences: Partial<ConsentPreferences>
): Promise<ConsentPreferences> {
  // Update health_data consent
  if (preferences.allowEmployerAccess !== undefined) {
    await apiClient.put('/api/organization/employee/consent/settings', {
      consent_type: 'health_data',
      employer_visibility: preferences.allowEmployerAccess,
    });
  }
  
  // Update vitals consent  
  if (preferences.allowIndividualData !== undefined) {
    await apiClient.put('/api/organization/employee/consent/settings', {
      consent_type: 'vitals',
      employer_visibility: preferences.allowIndividualData,
    });
  }
  
  return getConsentPreferences();
}
// ─── Goals ──────────────────────────────────────────────────────────
export async function getGoals(): Promise<Goal[]> {
  const response = await apiClient.get<{ data: any[] }>(
    '/api/organization/employee/goals'
  );
  
  return response.data.map((goal: any) => ({
    id: String(goal.id),
    employeeId: String(goal.employee_id),
    title: goal.title,
    description: goal.description,
    category: goal.category?.toUpperCase() || 'OTHER',
    targetValue: goal.target_value,
    currentValue: goal.current_progress,
    unit: goal.unit,
    startDate: goal.start_date,
    endDate: goal.target_date,
    status: goal.status?.toUpperCase() || 'ACTIVE',
    assignedBy: goal.assigned_by || 'Health Coach',
  }));
}

export async function getGoal(id: string): Promise<Goal> {
  const response = await apiClient.get<any>(
    `/api/organization/employee/goals/${id}`
  );
  
  return {
    id: String(response.id),
    employeeId: String(response.employee_id),
    title: response.title,
    description: response.description,
    category: response.category?.toUpperCase() || 'OTHER',
    targetValue: response.target_value,
    currentValue: response.current_progress,
    unit: response.unit,
    startDate: response.start_date,
    endDate: response.target_date,
    status: response.status?.toUpperCase() || 'ACTIVE',
    assignedBy: response.assigned_by || 'Health Coach',
  };
}

export async function updateGoalProgress(
  goalId: string,
  progress: { value: number; notes?: string }
): Promise<void> {
  await apiClient.post(`/api/organization/employee/goals/${goalId}/progress`, {
    progress_value: progress.value,
    notes: progress.notes,
  });
}

// ─── Programs ───────────────────────────────────────────────────────
export async function getPrograms(): Promise<Program[]> {
  const response = await apiClient.get<{ data: any[] }>(
    '/api/organization/employee/programs'
  );
  
  return response.data.map((program: any) => ({
    id: String(program.id),
    title: program.program?.title || 'Untitled Program',
    description: program.program?.description || '',
    category: program.program?.category || 'General',
    totalModules: program.program?.total_content || 0,
    completedModules: program.completed_content_count || 0,
    assignedAt: program.enrolled_at,
    dueDate: program.target_completion_date,
    status: program.completion_percentage === 100 ? 'COMPLETED' : 'IN_PROGRESS',
  }));
}

export async function getProgramModules(programId: string): Promise<ProgramModule[]> {
  const response = await apiClient.get<{ data: any[] }>(
    `/api/organization/employee/programs/${programId}/content`
  );
  
  return response.data.map((content: any, index: number) => ({
    id: String(content.id),
    programId,
    title: content.title,
    description: content.description || '',
    type: content.content_type?.toUpperCase() || 'ARTICLE',
    contentUrl: content.content_url,
    duration: content.estimated_duration || 10,
    completed: content.is_completed || false,
    completedAt: content.completed_at,
    order: content.order || index + 1,
  }));
}

export async function markModuleComplete(
  programId: string,
  contentId: string
): Promise<void> {
  await apiClient.post(
    `/api/organization/employee/programs/${programId}/content/${contentId}/complete`
  );
}

// ─── Appointments ───────────────────────────────────────────────────
export async function getAppointments(filter?: 'upcoming' | 'past'): Promise<Appointment[]> {
  const response = await apiClient.get<{ data: any[] }>(
    '/api/organization/employee/appointments',
    filter ? { filter } : undefined
  );
  
  return response.data.map((appt: any) => ({
    id: String(appt.id),
    employeeId: String(appt.employee_id),
    title: appt.title || `${appt.appointment_type} Appointment`,
    type: appt.appointment_type?.toUpperCase().replace('_', ' ') || 'SUPPORT',
    scheduledAt: `${appt.appointment_date}T${appt.appointment_time}`,
    duration: appt.duration_minutes,
    status: appt.status?.toUpperCase() || 'SCHEDULED',
    provider: appt.provider ? {
      id: String(appt.provider.id),
      name: appt.provider.name || 'Provider',
      title: appt.provider.specialization || 'Healthcare Provider',
      avatar: appt.provider.avatar,
    } : undefined,
    notes: appt.notes,
    teleheathLink: appt.telehealth_link,
    canReschedule: appt.status !== 'completed' && appt.status !== 'cancelled',
    canCancel: appt.status !== 'completed' && appt.status !== 'cancelled',
  }));
}

export async function getAppointment(id: string): Promise<Appointment> {
  const appt = await apiClient.get<any>(
    `/api/organization/employee/appointments/${id}`
  );
  
  return {
    id: String(appt.id),
    employeeId: String(appt.employee_id),
    title: appt.title || `${appt.appointment_type} Appointment`,
    type: appt.appointment_type?.toUpperCase().replace('_', ' ') || 'SUPPORT',
    scheduledAt: `${appt.appointment_date}T${appt.appointment_time}`,
    duration: appt.duration_minutes,
    status: appt.status?.toUpperCase() || 'SCHEDULED',
    provider: appt.provider ? {
      id: String(appt.provider.id),
      name: appt.provider.name || 'Provider',
      title: appt.provider.specialization || 'Healthcare Provider',
      avatar: appt.provider.avatar,
    } : undefined,
    notes: appt.notes,
    teleheathLink: appt.telehealth_link,
    canReschedule: appt.status !== 'completed' && appt.status !== 'cancelled',
    canCancel: appt.status !== 'completed' && appt.status !== 'cancelled',
  };
}

export async function bookAppointment(data: {
  providerId: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
}): Promise<Appointment> {
  const response = await apiClient.post<any>(
    '/api/organization/employee/appointments',
    {
      provider_id: data.providerId,
      appointment_type: data.type.toLowerCase().replace(' ', '_'),
      appointment_date: data.date,
      appointment_time: data.time,
      duration_minutes: data.duration,
      notes: data.notes,
    }
  );
  
  return getAppointment(String(response.id));
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string
): Promise<void> {
  await apiClient.put(`/api/organization/employee/appointments/${id}/reschedule`, {
    appointment_date: date,
    appointment_time: time,
  });
}

export async function cancelAppointment(id: string, reason?: string): Promise<void> {
  await apiClient.put(`/api/organization/employee/appointments/${id}/cancel`, {
    cancellation_reason: reason,
  });
}

// ─── Messages ───────────────────────────────────────────────────────
export async function getConversations(): Promise<Conversation[]> {
  const response = await apiClient.get<{ data: any[] }>(
    '/api/organization/employee/messages/conversations'
  );
  
  return response.data.map((conv: any) => ({
    id: String(conv.id),
    employeeId: String(conv.employee_id),
    participantId: String(conv.participant_id),
    participantName: conv.participant_name,
    participantType: conv.participant_type?.toUpperCase() || 'SUPPORT',
    lastMessage: conv.last_message?.content || '',
    lastMessageAt: conv.last_message_at,
    unreadCount: conv.unread_count || 0,
  }));
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const response = await apiClient.get<{ data: any[] }>(
    `/api/organization/employee/messages/conversations/${conversationId}`
  );
  
  return response.data.map((msg: any) => ({
    id: String(msg.id),
    conversationId: String(msg.conversation_id),
    senderId: String(msg.sender_id),
    senderName: msg.sender_name || 'Unknown',
    senderType: msg.sender_type?.toUpperCase() || 'EMPLOYEE',
    content: msg.content,
    sentAt: msg.created_at,
    read: msg.is_read || false,
  }));
}

export async function sendMessage(data: {
  conversationId?: string;
  recipientId: string;
  recipientType: string;
  content: string;
}): Promise<Message> {
  const response = await apiClient.post<any>(
    '/api/organization/employee/messages',
    {
      conversation_id: data.conversationId,
      recipient_id: data.recipientId,
      recipient_type: data.recipientType.toLowerCase(),
      content: data.content,
    }
  );
  
  return {
    id: String(response.id),
    conversationId: String(response.conversation_id),
    senderId: String(response.sender_id),
    senderName: 'You',
    senderType: 'EMPLOYEE',
    content: response.content,
    sentAt: response.created_at,
    read: true,
  };
}

// ─── Notifications ──────────────────────────────────────────────────
export async function getNotifications(filter?: 'read' | 'unread'): Promise<Notification[]> {
  const response = await apiClient.get<{ data: any[] }>(
    '/api/organization/employee/notifications',
    filter ? { filter } : undefined
  );
  
  return response.data.map((notif: any) => ({
    id: String(notif.id),
    employeeId: String(notif.employee_id),
    type: notif.type?.toUpperCase() || 'SYSTEM',
    title: notif.title,
    message: notif.message,
    actionUrl: notif.action_url,
    read: notif.is_read || false,
    createdAt: notif.created_at,
  }));
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<{ unread_count: number }>(
    '/api/organization/employee/notifications/unread-count'
  );
  
  return response.unread_count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.post(`/api/organization/employee/notifications/${id}/mark-read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/api/organization/employee/notifications/mark-read'