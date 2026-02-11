// Employee Dashboard Type Definitions

export type UserRole = 'EMPLOYEE';

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
}

export interface ConsentPreferences {
  allowEmployerAccess: boolean;
  allowAggregatedData: boolean;
  allowIndividualData: boolean;
  lastUpdated: string;
  version: string;
}

export interface VitalReading {
  id: string;
  employeeId: string;
  type: 'BMI' | 'WEIGHT' | 'BLOOD_PRESSURE' | 'GLUCOSE';
  value: number | { systolic: number; diastolic: number };
  unit: string;
  recordedAt: string;
  notes?: string;
}

export interface HealthAssessment {
  id: string;
  employeeId: string;
  title: string;
  type: string;
  score?: number;
  completedAt: string;
  results: Record<string, any>;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  category: 'EXERCISE' | 'NUTRITION' | 'MEDICATION' | 'OTHER';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  assignedBy: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  totalModules: number;
  completedModules: number;
  assignedAt: string;
  dueDate?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ProgramModule {
  id: string;
  programId: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'ARTICLE' | 'TASK' | 'QUIZ';
  contentUrl?: string;
  duration?: number;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface Appointment {
  id: string;
  employeeId: string;
  title: string;
  type: 'HEALTH_COACH' | 'NUTRITIONIST' | 'DOCTOR' | 'SUPPORT';
  scheduledAt: string;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  provider: {
    id: string;
    name: string;
    title: string;
    avatar?: string;
  };
  teleheathLink?: string;
  notes?: string;
  canReschedule: boolean;
  canCancel: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'EMPLOYEE' | 'COACH' | 'NUTRITIONIST' | 'SUPPORT';
  content: string;
  sentAt: string;
  read: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

export interface Conversation {
  id: string;
  employeeId: string;
  participantId: string;
  participantName: string;
  participantType: 'COACH' | 'NUTRITIONIST' | 'SUPPORT';
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  employeeId: string;
  type: 'APPOINTMENT' | 'PROGRAM' | 'MESSAGE' | 'GOAL' | 'CONSENT' | 'SYSTEM';
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  upcomingAppointments: number;
  activeGoals: number;
  programProgress: number;
  unreadMessages: number;
  currentStreak: number;
  completedModulesThisWeek: number;
}
