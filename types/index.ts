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
export type ProgramStatus = 'not_started' | 'in_progress' | 'completed' | 'paused';
export type ContentType = 'video' | 'article' | 'quiz' | 'exercise' | 'document';

export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  durationMinutes?: number;
  totalContent: number;
  createdAt: string;
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

// ─── Communication ──────────────────────────────────────────────────
export type ParticipantType = 'coach' | 'clinician' | 'support';

export interface Conversation {
  id: string;
  employeeId: string;
  participantId: string;
  participantType: ParticipantType;
  participantName?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  senderName?: string;
  message: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

// ─── Notifications ──────────────────────────────────────────────────
export type NotificationType = 'appointment' | 'goal' | 'program' | 'message' | 'system';
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
