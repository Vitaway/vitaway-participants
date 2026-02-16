// API Service Layer - Centralized Export
// All API functions for the Employee Dashboard

// ─── Export API Client ──────────────────────────────────────────────
export { apiClient } from './client';
export type { ApiResponse, ApiError } from './client';

// ─── Authentication Services ────────────────────────────────────────
export {
  login,
  logout,
  getCurrentUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  acceptInvite,
  validateInviteToken,
} from './auth';

// ─── Profile Services ───────────────────────────────────────────────
export {
  getProfile,
  updateProfile,
} from './profile';

// ─── Dashboard Services ─────────────────────────────────────────────
export {
  getDashboardOverview,
} from './dashboard';

// ─── Health Data Services ───────────────────────────────────────────
export {
  getVitals,
  getAssessments,
  getAssessment,
} from './health';

// ─── Goals Services ─────────────────────────────────────────────────
export {
  getGoals,
  getGoal,
  updateGoalProgress,
} from './goals';

// ─── Programs Services ──────────────────────────────────────────────
export {
  getEnrolledPrograms,
  getProgramContent,
  markContentComplete,
} from './programs';

// ─── Appointments Services ──────────────────────────────────────────
export {
  getAppointments,
  getAppointment,
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getTelehealthLink,
} from './appointments';

// ─── Messages Services ──────────────────────────────────────────────
export {
  getConversations,
  getConversationMessages,
  sendMessage,
} from './messages';

// ─── Notifications Services ─────────────────────────────────────────
export {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './notifications';

// ─── Consent Services ───────────────────────────────────────────────
export {
  getConsentSettings,
  updateConsentSetting,
  getConsentHistory,
  revokeConsent,
} from './consent';
export type { ConsentSetting, ConsentHistory } from './consent';