// Application Constants

export const API_BASE_URL = 'http://127.0.0.1:8000';

export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
} as const;

export const VITAL_TYPES = {
  BMI: 'BMI',
  WEIGHT: 'WEIGHT',
  BLOOD_PRESSURE: 'BLOOD_PRESSURE',
  GLUCOSE: 'GLUCOSE',
} as const;

export const GOAL_CATEGORIES = {
  EXERCISE: 'EXERCISE',
  NUTRITION: 'NUTRITION',
  MEDICATION: 'MEDICATION',
  OTHER: 'OTHER',
} as const;

export const APPOINTMENT_TYPES = {
  COACHING: 'coaching',
  MENTAL_HEALTH: 'mental_health',
  NUTRITION: 'nutrition',
  GENERAL: 'general',
} as const;

export const MESSAGE_TYPES = {
  EMPLOYEE: 'EMPLOYEE',
  COACH: 'COACH',
  CLINICIAN: 'CLINICIAN',
  SUPPORT: 'SUPPORT',
} as const;

export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'APPOINTMENT',
  PROGRAM: 'PROGRAM',
  MESSAGE: 'MESSAGE',
  GOAL: 'GOAL',
  CONSENT: 'CONSENT',
  SYSTEM: 'SYSTEM',
} as const;

export const ROUTES = {
  HOME: '/dashboard',
  HEALTH: '/dashboard/health',
  GOALS: '/dashboard/goals',
  PROGRAMS: '/dashboard/programs',
  APPOINTMENTS: '/dashboard/appointments',
  MESSAGES: '/dashboard/messages',
  PROFILE: '/dashboard/profile',
  CONSENT: '/dashboard/consent',
  // Auth
  LOGIN: '/auth/login',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ACCEPT_INVITE: '/auth/invite',
} as const;

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/api/organization/employee/auth/login',
  AUTH_LOGOUT: '/api/organization/employee/auth/logout',
  AUTH_REFRESH: '/api/organization/employee/auth/refresh',
  
  // Profile
  PROFILE: '/api/organization/employee/profile',
  
  // Dashboard
  DASHBOARD_OVERVIEW: '/api/organization/employee/dashboard/overview',
  
  // Health
  VITALS: '/api/organization/employee/health/vitals',
  ASSESSMENTS: '/api/organization/employee/health/assessments',
  
  // Goals
  GOALS: '/api/organization/employee/goals',
  
  // Programs
  PROGRAMS: '/api/organization/employee/programs',
  
  // Appointments
  APPOINTMENTS: '/api/organization/employee/appointments',
  
  // Messages
  CONVERSATIONS: '/api/organization/employee/messages/conversations',
  MESSAGES: '/api/organization/employee/messages',
  
  // Notifications
  NOTIFICATIONS: '/api/organization/employee/notifications',
  
  // Consent
  CONSENT_SETTINGS: '/api/organization/employee/consent/settings',
  CONSENT_HISTORY: '/api/organization/employee/consent/history',
} as const;
