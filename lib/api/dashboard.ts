// Dashboard API Service

import { apiClient } from './client';
import type { DashboardOverview } from '@/types';

// ─── Get Dashboard Overview ─────────────────────────────────────────
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response = await apiClient.get<{ data: any }>(
    '/api/org/employee/dashboard/overview'
  );

  const data = response.data || {};

  return {
    activePrograms: {
      total: data.active_programs?.total || 0,
      inProgress: data.active_programs?.in_progress || 0,
      completed: data.active_programs?.completed || 0,
      programs: data.active_programs?.programs?.map((p: any) => ({
        id: String(p.id),
        programId: String(p.program_id),
        employeeId: String(p.employee_id),
        program: {
          id: String(p.program?.id),
          title: p.program?.title,
          description: p.program?.description,
          category: p.program?.category,
          imageUrl: p.program?.image_url,
          durationMinutes: p.program?.duration_minutes,
          totalContent: p.program?.total_content || 0,
          createdAt: p.program?.created_at,
        },
        status: p.status,
        progressPercentage: p.progress_percentage || 0,
        enrolledAt: p.enrolled_at,
        completedAt: p.completed_at,
        dueDate: p.due_date,
      })) || [],
    },
    latestVitals: data.latest_vitals?.map((v: any) => ({
      vitalType: v.vital_type,
      value: v.value,
      unit: v.unit,
      recordedAt: v.recorded_at,
    })) || [],
    upcomingAppointments: Array.isArray(data.upcoming_appointments) 
      ? data.upcoming_appointments.map((a: any) => ({
      id: String(a.id),
      employeeId: String(a.employee_id),
      providerId: String(a.provider_id),
      appointmentType: a.appointment_type,
      appointmentDate: a.appointment_date,
      appointmentTime: a.appointment_time,
      durationMinutes: a.duration_minutes,
      status: a.status,
      notes: a.notes,
      telehealthLink: a.telehealth_link,
      provider: a.provider ? {
        id: String(a.provider.id),
        name: a.provider.name,
        email: a.provider.email,
        specialty: a.provider.specialty,
      } : undefined,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }))
      : [],
    unreadNotifications: data.unread_notifications || 0,
    pendingGoals: {
      total: data.pending_goals?.total || 0,
      active: data.pending_goals?.active || 0,
      goals: data.pending_goals?.goals?.map((g: any) => ({
        id: String(g.id),
        employeeId: String(g.employee_id),
        title: g.title,
        description: g.description,
        category: g.category,
        targetValue: g.target_value,
        currentValue: g.current_value,
        unit: g.unit,
        startDate: g.start_date,
        targetDate: g.target_date,
        status: g.status,
        assignedBy: g.assigned_by ? String(g.assigned_by) : undefined,
        assignedByName: g.assigned_by_name,
        progressPercentage: g.progress_percentage || 0,
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      })) || [],
    },
    stats: {
      totalGoalsCompleted: data.stats?.total_goals_completed || 0,
      currentStreak: data.stats?.current_streak || 0,
      programCompletionRate: data.stats?.program_completion_rate || 0,
    },
  };
}
