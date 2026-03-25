/* eslint-disable @typescript-eslint/no-explicit-any */
// Employee Dashboard Type Definitions

export type UserRole = 'EMPLOYEE';

// ─── Employee Profile ───────────────────────────────────────────────
export interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  role: UserRole;
  profilePicture?: string;
  dateOfBirth?: string;
  phone?: string;
  joinedAt: string;
  enrollmentStatus: 'active' | 'inactive' | 'suspended';
}

// ─── Consent & Privacy ──────────────────────────────────────────────
export type ConsentType = 'health_data' | 'vitals' | 'assessments' | 'appointments' | 'goals' | 'programs';

export interface ConsentSetting {
  id: string;
  employeeId: string;
  consentType: ConsentType;
  employerVisibility: boolean;
  dataSharingPreferences?: Record<string, any>;
  grantedAt: string;
  updatedAt: string;
}

export interface ConsentHistory {
  id: string;
  consentId: string;
  action: string;
  previousValue: any;
  newValue: any;
  changedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// ─── Health Data ────────────────────────────────────────────────────
export type VitalType = 'blood_pressure' | 'weight' | 'bmi' | 'glucose' | 'heart_rate' | 'temperature' | 'oxygen_saturation';

export interface VitalReading {
  id: string;
  employeeId: string;
  vitalType: VitalType;
  value: number | string;
  unit: string;
  recordedAt: string;
  recordedBy?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface HealthAssessment {
  id: string;
  employeeId: string;
  assessmentType: string;
  title: string;
  score?: number;
  maxScore?: number;
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: string;
  results?: Record<string, any>;
  recommendations?: string[];
  createdAt: string;
}

// ─── Goals & Progress ───────────────────────────────────────────────
export type GoalCategory = 'exercise' | 'nutrition' | 'weight_management' | 'stress_management' | 'sleep' | 'other';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  status: GoalStatus;
  assignedBy?: string;
  assignedByName?: string;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  progressValue: number;
  notes?: string;
  recordedAt: string;
  recordedBy: string;
}

// ─── Programs & Learning ────────────────────────────────────────────
export type ProgramStatus = 'not_started' | 'in_progress' | 'completed' | 'paused' | 'not_enrolled' | 'enrolled';
export type ContentType = 'video' | 'article' | 'quiz' | 'exercise' | 'document';
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  durationMinutes?: number;
  totalContent: number;
  createdAt: string;
  modules?: ProgramModule[];
  quizzes?: ProgramQuiz[];
}

export interface ProgramModule {
  id: string;
  programId: string;
  title: string;
  description?: string;
  content?: string;
  contentType?: ContentType;
  contentUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  requiresQuizPass?: boolean;
  quiz?: ProgramQuiz;
}

export interface ProgramQuiz {
  id: string;
  programId?: string;
  moduleId?: string;
  title: string;
  description?: string;
  quizType: 'module_quiz' | 'final_quiz';
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes?: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false';
  points: number;
  orderIndex: number;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  questionId: string;
  answerText: string;
  isCorrect?: boolean; // Only visible after submission
}

export interface ModuleProgress {
  id: string;
  moduleId?: string;
  quizId?: string;
  moduleStatus: ModuleStatus;
  moduleCompletionPercentage: number;
  moduleCompletedAt?: string;
  quizAttempts: number;
  quizScore?: number;
  quizPassed?: boolean;
  quizPassedAt?: string;
  lastAccessedAt?: string;
}

export interface QuizSubmissionResult {
  score: number;
  passed: boolean;
  passingScore: number;
  progress?: ModuleProgress;
  status?: string;
}

export interface ProgramEnrollment {
  id: string;
  programId: string;
  employeeId: string;
  program: Program;
  status: ProgramStatus;
  progressPercentage: number;
  enrolledAt: string;
  completedAt?: string;
  dueDate?: string;
  startedAt?: string;
  finalScore?: number;
}

export interface ProgramContent {
  id: string;
  programId: string;
  title: string;
  description?: string;
  contentType: ContentType;
  contentUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  completed?: boolean;
  completedAt?: string;
}

// ─── Appointments ───────────────────────────────────────────────────
export type AppointmentType = 'coaching' | 'mental_health' | 'nutrition' | 'general' | 'consultation';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show';
export type ProviderType = 'user' | 'organization_admin';

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  type: ProviderType;
}

export interface Appointment {
  id: string;
  employeeId: string;
  providerId: string;
  providerType?: string;
  partnerOrganizationId?: string;
  appointmentType: AppointmentType;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  telehealthLink?: string;
  cancellationReason?: string;
  providerDetails?: Provider;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentBooking {
  providerId: string;
  providerType: ProviderType;
  appointmentType: AppointmentType;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  notes?: string;
}

// ─── Notifications ──────────────────────────────────────────────────
export type NotificationType = 'appointment' | 'goal' | 'program' | 'message' | 'system' | 'meal_plan';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string;
  employeeId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

// ─── Dashboard Overview ─────────────────────────────────────────────
export interface DashboardOverview {
  activePrograms: {
    total: number;
    inProgress: number;
    completed: number;
    programs: ProgramEnrollment[];
  };
  latestVitals: {
    vitalType: VitalType;
    value: string | number;
    unit: string;
    recordedAt: string;
  }[];
  upcomingAppointments: Appointment[];
  unreadNotifications: number;
  pendingGoals: {
    total: number;
    active: number;
    goals: Goal[];
  };
  stats: {
    totalGoalsCompleted: number;
    currentStreak: number;
    programCompletionRate: number;
  };
}
