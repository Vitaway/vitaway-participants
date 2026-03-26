// Health Data API Service
/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiClient } from './client';
import type { VitalReading, HealthAssessment, VitalType, PatientRecord } from '@/types';

// ─── Get Vitals ─────────────────────────────────────────────────────
export async function getVitals(params?: {
  type?: VitalType;
  fromDate?: string;
  toDate?: string;
  perPage?: number;
  page?: number;
}): Promise<{ data: VitalReading[]; meta: any }> {
  try {
    const response = await apiClient.get<{ data: any[]; meta: any }>(
      '/api/organization/employee/health/vitals',
      {
        type: params?.type,
        from_date: params?.fromDate,
        to_date: params?.toDate,
        per_page: params?.perPage,
        page: params?.page,
      }
    );

    const vitalsRaw: any[] = (response as any).data?.data ?? (Array.isArray((response as any).data) ? (response as any).data : []);
    return {
      data: vitalsRaw.map((vital: any) => ({
        id: String(vital.id),
        employeeId: String(vital.employee_id),
        vitalType: vital.vital_type,
        value: vital.value,
        unit: vital.unit,
        recordedAt: vital.recorded_at,
        recordedBy: vital.recorded_by,
        notes: vital.notes,
        metadata: vital.metadata,
      })),
      meta: (response as any).data?.meta ?? (response as any).meta ?? {},
    };
  } catch (error: any) {
    console.error('Failed to fetch vitals:', error);
    return { data: [], meta: {} };
  }
}

// ─── Get Assessments ────────────────────────────────────────────────
export async function getAssessments(params?: {
  type?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  fromDate?: string;
  toDate?: string;
  perPage?: number;
  page?: number;
}): Promise<{ data: HealthAssessment[]; meta: any }> {
  try {
    const response = await apiClient.get<{ data: any[]; meta: any }>(
      '/api/organization/employee/health/assessments',
      {
        type: params?.type,
        status: params?.status,
        from_date: params?.fromDate,
        to_date: params?.toDate,
        per_page: params?.perPage,
        page: params?.page,
      }
    );

    const assessmentsRaw: any[] = (response as any).data?.data ?? (Array.isArray((response as any).data) ? (response as any).data : []);
    return {
      data: assessmentsRaw.map((assessment: any) => ({
        id: String(assessment.id),
        employeeId: String(assessment.employee_id),
        assessmentType: assessment.assessment_type,
        title: assessment.title,
        score: assessment.score,
        maxScore: assessment.max_score,
        status: assessment.status,
        completedAt: assessment.completed_at,
        results: assessment.results,
        recommendations: assessment.recommendations,
        createdAt: assessment.created_at,
      })),
      meta: (response as any).data?.meta ?? (response as any).meta ?? {},
    };
  } catch (error: any) {
    console.error('Failed to fetch assessments:', error);
    return { data: [], meta: {} };
  }
}

// ─── Get Single Assessment ──────────────────────────────────────────
export async function getAssessment(id: string): Promise<HealthAssessment> {
  const response = await apiClient.get<{ data: any }>(
    `/api/organization/employee/health/assessments/${id}`
  );

  const assessment = response.data;
  return {
    id: String(assessment.id),
    employeeId: String(assessment.employee_id),
    assessmentType: assessment.assessment_type,
    title: assessment.title,
    score: assessment.score,
    maxScore: assessment.max_score,
    status: assessment.status,
    completedAt: assessment.completed_at,
    results: assessment.results,
    recommendations: assessment.recommendations,
    createdAt: assessment.created_at,
  };
}

// ─── Get Patient Record (EHR Data) ─────────────────────────────────
export async function getPatientRecord(): Promise<PatientRecord | null> {
  try {
    const response = await apiClient.get<{ success: boolean; data: PatientRecord }>(
      '/api/organization/employee/health/patient-record'
    );
    return (response as any).data ?? null;
  } catch (error: any) {
    console.error('Failed to fetch patient record:', error);
    return null;
  }
}
