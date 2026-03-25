// Meal Plans API Service
/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiClient } from './client';

export interface MealPlanItem {
  id: number;
  time_slot: string;
  meal_description: string;
}

export interface MealPlanDay {
  date: string;
  meals: MealPlanItem[];
}

export interface MealPlanSummary {
  id: number;
  title: string;
  notes: string | null;
  guidelines: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  items_count: number;
}

export interface MealPlanDetail extends Omit<MealPlanSummary, 'items_count'> {
  schedule: MealPlanDay[];
}

// ─── Get All Meal Plans ──────────────────────────────────────────────
export async function getMealPlans(): Promise<{ data: MealPlanSummary[]; total: number }> {
  try {
    const response = await apiClient.get<{ success: boolean; data: any[]; total: number }>(
      '/api/organization/employee/meal-plans'
    );
    return {
      data: (response as any).data ?? [],
      total: (response as any).total ?? 0,
    };
  } catch (error: any) {
    console.error('Failed to fetch meal plans:', error);
    return { data: [], total: 0 };
  }
}

// ─── Get Single Meal Plan ────────────────────────────────────────────
export async function getMealPlan(id: number): Promise<MealPlanDetail | null> {
  try {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/api/organization/employee/meal-plans/${id}`
    );
    return (response as any).data ?? null;
  } catch (error: any) {
    console.error('Failed to fetch meal plan:', error);
    return null;
  }
}

// ─── Download Meal Plan PDF ──────────────────────────────────────────
export async function downloadMealPlan(id: number, title?: string): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('vitaway_access_token')
      : null;

    const headers: HeadersInit = { Accept: 'application/pdf' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${baseUrl}/api/organization/employee/meal-plans/${id}/download`,
      { method: 'GET', headers, credentials: 'include' }
    );

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title
      ? `${title.replace(/[^a-zA-Z0-9_\- ]/g, '')}.pdf`
      : 'Meal_Plan.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error: any) {
    console.error('Failed to download meal plan:', error);
    return false;
  }
}
