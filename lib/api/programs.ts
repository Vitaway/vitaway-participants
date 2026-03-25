// Programs & Learning API Service

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './client';
import type {
  ProgramEnrollment,
  Program,
  ProgramModule,
  ProgramQuiz,
  ProgramStatus,
  ModuleProgress,
  QuizSubmissionResult,
} from '@/types';

const BASE = '/api/organization/employee/programs';

// ─── Helper: Map module from backend ─────────────────────────────────
function mapModule(m: any): ProgramModule {
  return {
    id: String(m.id),
    programId: String(m.program_id),
    title: m.title,
    description: m.description,
    content: m.content,
    contentType: m.content_type,
    contentUrl: m.content_url,
    durationMinutes: m.duration_minutes,
    orderIndex: m.order_index,
    requiresQuizPass: m.requires_quiz_pass,
    quiz: m.quiz ? mapQuiz(m.quiz) : undefined,
  };
}

function mapQuiz(q: any): ProgramQuiz {
  return {
    id: String(q.id),
    programId: q.program_id ? String(q.program_id) : undefined,
    moduleId: q.module_id ? String(q.module_id) : undefined,
    title: q.title,
    description: q.description,
    quizType: q.quiz_type,
    passingScore: q.passing_score,
    maxAttempts: q.max_attempts,
    timeLimitMinutes: q.time_limit_minutes,
    questions: q.questions?.map((question: any) => ({
      id: String(question.id),
      quizId: String(question.quiz_id),
      questionText: question.question_text,
      questionType: question.question_type,
      points: question.points,
      orderIndex: question.order_index,
      answers: question.answers?.map((a: any) => ({
        id: String(a.id),
        questionId: String(a.question_id),
        answerText: a.answer_text,
        isCorrect: a.is_correct,
      })) || [],
    })) || [],
  };
}

function mapProgress(p: any): ModuleProgress {
  return {
    id: String(p.id),
    moduleId: p.module_id ? String(p.module_id) : undefined,
    quizId: p.quiz_id ? String(p.quiz_id) : undefined,
    moduleStatus: p.module_status,
    moduleCompletionPercentage: p.module_completion_percentage || 0,
    moduleCompletedAt: p.module_completed_at,
    quizAttempts: p.quiz_attempts || 0,
    quizScore: p.quiz_score,
    quizPassed: p.quiz_passed,
    quizPassedAt: p.quiz_passed_at,
    lastAccessedAt: p.last_accessed_at,
  };
}

// ─── Get Enrolled Programs ──────────────────────────────────────────
export async function getEnrolledPrograms(params?: {
  status?: 'not_started' | 'in_progress' | 'completed' | 'paused';
  perPage?: number;
  page?: number;
}): Promise<{ data: ProgramEnrollment[]; meta: any }> {
  try {
    const response = await apiClient.get<{ data: any[]; meta: any }>(
      BASE,
      {
        status: params?.status,
        per_page: params?.perPage,
        page: params?.page,
      }
    );

    const programsRaw: any[] = (response as any).data?.data ?? (Array.isArray((response as any).data) ? (response as any).data : []);
    return {
      data: programsRaw.map((prog: any) => {
        const enr = prog.enrollment;
        return {
          id: enr ? String(enr.id) : `pending_${prog.id}`,
          programId: String(prog.id),
          employeeId: enr ? String(enr.organization_employee_id) : '',
          program: {
            id: String(prog.id),
            title: prog.title,
            description: prog.description,
            category: prog.category,
            imageUrl: prog.image_url || prog.thumbnail_url,
            durationMinutes: prog.duration_minutes || prog.estimated_duration_hours ? (prog.estimated_duration_hours || 0) * 60 : 0,
            totalContent: prog.total_modules || 0,
            createdAt: prog.created_at,
            modules: prog.modules?.map(mapModule),
            quizzes: prog.quizzes?.map(mapQuiz),
          },
          status: (enr?.status ?? 'not_enrolled') as ProgramStatus,
          progressPercentage: prog.progress_percentage || 0,
          enrolledAt: enr?.enrolled_at ?? '',
          completedAt: enr?.completed_at,
          dueDate: enr?.due_date,
          startedAt: enr?.started_at,
          finalScore: enr?.final_score,
        };
      }),
      meta: (response as any).data?.meta ?? (response as any).meta ?? {},
    };
  } catch (error: any) {
    console.error('Failed to fetch enrolled programs:', error);
    return { data: [], meta: {} };
  }
}

// ─── Get Program Details ────────────────────────────────────────────
export async function getProgram(programId: string): Promise<{
  program: Program;
  enrollment: ProgramEnrollment;
  progress: ModuleProgress[];
  completionPercentage: number;
}> {
  const response = await apiClient.get<{ data: any }>(
    `${BASE}/${programId}`
  );

  const d = response.data;
  return {
    program: {
      id: String(d.program.id),
      title: d.program.title,
      description: d.program.description,
      category: d.program.category,
      imageUrl: d.program.image_url,
      durationMinutes: d.program.duration_minutes,
      totalContent: d.program.total_content || 0,
      createdAt: d.program.created_at,
      modules: d.program.modules?.map(mapModule),
      quizzes: d.program.quizzes?.map(mapQuiz),
    },
    enrollment: d.enrollment ? {
      id: String(d.enrollment.id),
      programId: String(d.enrollment.program_id),
      employeeId: String(d.enrollment.organization_employee_id || d.enrollment.employee_id || ''),
      program: d.program,
      status: d.enrollment.status,
      progressPercentage: d.completion_percentage || 0,
      enrolledAt: d.enrollment.enrolled_at,
      completedAt: d.enrollment.completed_at,
      dueDate: d.enrollment.due_date,
      startedAt: d.enrollment.started_at,
      finalScore: d.enrollment.final_score,
    } : {
      id: '',
      programId: String(d.program?.id ?? ''),
      employeeId: '',
      program: d.program,
      status: 'not_enrolled' as ProgramStatus,
      progressPercentage: 0,
      enrolledAt: '',
    },
    progress: Array.isArray(d.progress) ? d.progress.map(mapProgress) : [],
    completionPercentage: d.completion_percentage || 0,
  };
}

// ─── Start Program ──────────────────────────────────────────────────
export async function startProgram(programId: string): Promise<ProgramEnrollment> {
  const response = await apiClient.post<{ data: any }>(
    `${BASE}/${programId}/start`
  );

  const e = response.data;
  return {
    id: String(e.id),
    programId: String(e.program_id),
    employeeId: String(e.employee_id),
    program: e.program,
    status: e.status,
    progressPercentage: e.progress_percentage || 0,
    enrolledAt: e.enrolled_at,
    completedAt: e.completed_at,
    dueDate: e.due_date,
    startedAt: e.started_at,
  };
}

// ─── Get Module ─────────────────────────────────────────────────────
export async function getModule(
  programId: string,
  moduleId: string,
): Promise<{ module: ProgramModule; progress: ModuleProgress }> {
  const response = await apiClient.get<{ data: any }>(
    `${BASE}/${programId}/modules/${moduleId}`
  );

  return {
    module: mapModule(response.data.module),
    progress: mapProgress(response.data.progress),
  };
}

// ─── Complete Module ────────────────────────────────────────────────
export async function completeModule(
  programId: string,
  moduleId: string,
): Promise<ModuleProgress> {
  const response = await apiClient.post<{ data: any }>(
    `${BASE}/${programId}/modules/${moduleId}/complete`
  );

  return mapProgress(response.data);
}

// ─── Get Module Quiz ────────────────────────────────────────────────
export async function getModuleQuiz(
  programId: string,
  moduleId: string,
): Promise<{ quiz: ProgramQuiz; progress: ModuleProgress }> {
  const response = await apiClient.get<{ data: any }>(
    `${BASE}/${programId}/modules/${moduleId}/quiz`
  );

  return {
    quiz: mapQuiz(response.data.quiz),
    progress: mapProgress(response.data.progress),
  };
}

// ─── Submit Module Quiz ─────────────────────────────────────────────
export async function submitModuleQuiz(
  programId: string,
  moduleId: string,
  data: { answers: Record<string, number>; timeSpentSeconds?: number },
): Promise<QuizSubmissionResult> {
  const response = await apiClient.post<{ data: any }>(
    `${BASE}/${programId}/modules/${moduleId}/quiz/submit`,
    {
      answers: data.answers,
      time_spent_seconds: data.timeSpentSeconds,
    }
  );

  const d = response.data;
  return {
    score: d.score,
    passed: d.passed,
    passingScore: d.passing_score,
    progress: d.progress ? mapProgress(d.progress) : undefined,
  };
}

// ─── Get Final Quiz ─────────────────────────────────────────────────
export async function getFinalQuiz(
  programId: string,
): Promise<{ quiz: ProgramQuiz }> {
  const response = await apiClient.get<{ data: any }>(
    `${BASE}/${programId}/final-quiz`
  );

  return {
    quiz: mapQuiz(response.data.quiz),
  };
}

// ─── Submit Final Quiz ──────────────────────────────────────────────
export async function submitFinalQuiz(
  programId: string,
  data: { answers: Record<string, number>; timeSpentSeconds?: number },
): Promise<QuizSubmissionResult> {
  const response = await apiClient.post<{ data: any }>(
    `${BASE}/${programId}/final-quiz/submit`,
    {
      answers: data.answers,
      time_spent_seconds: data.timeSpentSeconds,
    }
  );

  const d = response.data;
  return {
    score: d.score,
    passed: d.passed,
    passingScore: d.passing_score,
    status: d.status,
  };
}
