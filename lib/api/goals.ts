// Goals & Progress API Service

import { apiClient } from './client';
import type { Goal, GoalProgress } from '@/types';

// ─── Get Goals ──────────────────────────────────────────────────────
export async function getGoals(params?: {
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  category?: string;
  perPage?: number;
  page?: number;
}): Promise<{ data: Goal[]; meta: any }> {
  try {
    const response = await apiClient.get<{ data: any[]; meta: any }>(
      '/api/org/employee/goals',
      {
        status: params?.status,
        category: params?.category,
        per_page: params?.perPage,
        page: params?.page,
      }
    );

    return {
      data: Array.isArray(response.data) ? response.data.map((goal: any) => ({
      id: String(goal.id),
      employeeId: String(goal.employee_id),
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetValue: goal.target_value,
      currentValue: goal.current_value,
      unit: goal.unit,
      startDate: goal.start_date,
      targetDate: goal.target_date,
      status: goal.status,
      assignedBy: goal.assigned_by ? String(goal.assigned_by) : undefined,
      assignedByName: goal.assigned_by_name,
      progressPercentage: goal.progress_percentage || 0,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
    })) : [],
      meta: response.meta || {},
    };
  } catch (error: any) {
    console.error('Failed to fetch goals:', error);
    return { data: [], meta: {} };
  }
}

// ─── Get Single Goal ────────────────────────────────────────────────
export async function getGoal(id: string): Promise<{
  goal: Goal;
  progressHistory: GoalProgress[];
}> {
  const response = await apiClient.get<{ data: any }>(
    `/api/org/employee/goals/${id}`
  );

  const data = response.data;
  return {
    goal: {
      id: String(data.id),
      employeeId: String(data.employee_id),
      title: data.title,
      description: data.description,
      category: data.category,
      targetValue: data.target_value,
      currentValue: data.current_value,
      unit: data.unit,
      startDate: data.start_date,
      targetDate: data.target_date,
      status: data.status,
      assignedBy: data.assigned_by ? String(data.assigned_by) : undefined,
      assignedByName: data.assigned_by_name,
      progressPercentage: data.progress_percentage || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    progressHistory: data.progress_history?.map((p: any) => ({
      id: String(p.id),
      goalId: String(p.goal_id),
      progressValue: p.progress_value,
      notes: p.notes,
      recordedAt: p.recorded_at,
      recordedBy: String(p.recorded_by),
    })) || [],
  };
}

// ─── Update Goal Progress ───────────────────────────────────────────
export async function updateGoalProgress(
  goalId: string,
  data: {
    progressValue: number;
    notes?: string;
  }
): Promise<GoalProgress> {
  const response = await apiClient.post<{ data: any }>(
    `/api/org/employee/goals/${goalId}/progress`,
    {
      progress_value: data.progressValue,
      notes: data.notes,
    }
  );

  const progress = response.data;
  return {
    id: String(progress.id),
    goalId: String(progress.goal_id),
    progressValue: progress.progress_value,
    notes: progress.notes,
    recordedAt: progress.recorded_at,
    recordedBy: String(progress.recorded_by),
  };
}
