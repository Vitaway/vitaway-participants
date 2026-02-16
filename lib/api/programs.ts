// Programs & Learning API Service

import { apiClient } from './client';
import type { ProgramEnrollment, ProgramContent } from '@/types';

// ─── Get Enrolled Programs ──────────────────────────────────────────
export async function getEnrolledPrograms(params?: {
  status?: 'not_started' | 'in_progress' | 'completed' | 'paused';
  perPage?: number;
  page?: number;
}): Promise<{ data: ProgramEnrollment[]; meta: any }> {
  try {
    const response = await apiClient.get<{ data: any[]; meta: any }>(
      '/api/org/employee/programs',
      {
        status: params?.status,
        per_page: params?.perPage,
        page: params?.page,
      }
    );

    return {
      data: Array.isArray(response.data) ? response.data.map((enrollment: any) => ({
      id: String(enrollment.id),
      programId: String(enrollment.program_id),
      employeeId: String(enrollment.employee_id),
      program: {
        id: String(enrollment.program.id),
        title: enrollment.program.title,
        description: enrollment.program.description,
        category: enrollment.program.category,
        imageUrl: enrollment.program.image_url,
        durationMinutes: enrollment.program.duration_minutes,
        totalContent: enrollment.program.total_content || 0,
        createdAt: enrollment.program.created_at,
      },
      status: enrollment.status,
      progressPercentage: enrollment.progress_percentage || 0,
      enrolledAt: enrollment.enrolled_at,
      completedAt: enrollment.completed_at,
      dueDate: enrollment.due_date,
    })) : [],
      meta: response.meta || {},
    };
  } catch (error: any) {
    console.error('Failed to fetch enrolled programs:', error);
    return { data: [], meta: {} };
  }
}

// ─── Get Program Content ────────────────────────────────────────────
export async function getProgramContent(
  programId: string
): Promise<ProgramContent[]> {
  try {
    const response = await apiClient.get<{ data: any[] }>(
      `/api/org/employee/programs/${programId}/content`
    );

    return Array.isArray(response.data) ? response.data.map((content: any) => ({
    id: String(content.id),
    programId: String(content.program_id),
    title: content.title,
    description: content.description,
    contentType: content.content_type,
    contentUrl: content.content_url,
    durationMinutes: content.duration_minutes,
    orderIndex: content.order_index,
    completed: content.completed || false,
    completedAt: content.completed_at,
  })) : [];
  } catch (error: any) {
    console.error('Failed to fetch program content:', error);
    return [];
  }
}

// ─── Mark Content as Complete ───────────────────────────────────────
export async function markContentComplete(
  programId: string,
  contentId: string
): Promise<{
  message: string;
  progressPercentage: number;
  programCompleted: boolean;
}> {
  const response = await apiClient.post<any>(
    `/api/org/employee/programs/${programId}/content/${contentId}/complete`
  );

  return {
    message: response.message,
    progressPercentage: response.progress_percentage || 0,
    programCompleted: response.program_completed || false,
  };
}
