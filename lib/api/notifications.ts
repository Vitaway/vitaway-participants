// Notifications API Service

import { apiClient } from './client';
import type { Notification } from '@/types';

// ─── Get Notifications ──────────────────────────────────────────────
export async function getNotifications(params?: {
  filter?: 'read' | 'unread';
  type?: 'appointment' | 'goal' | 'program' | 'message' | 'system';
  perPage?: number;
  page?: number;
}): Promise<{ data: Notification[]; meta: any }> {
  try {
    const response = await apiClient.get<{ data: any[]; meta: any }>(
      '/api/org/employee/notifications',
      {
        filter: params?.filter,
        type: params?.type,
        per_page: params?.perPage,
        page: params?.page,
      }
    );

    return {
      data: Array.isArray(response.data) ? response.data.map((notification: any) => ({
      id: String(notification.id),
      employeeId: String(notification.employee_id),
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.action_url,
      isRead: notification.is_read || false,
      createdAt: notification.created_at,
      readAt: notification.read_at,
    })) : [],
      meta: response.meta || {},
    };
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error);
    // Return empty data on error instead of crashing
    return { data: [], meta: {} };
  }
}

// ─── Get Unread Count ───────────────────────────────────────────────
export async function getUnreadNotificationsCount(): Promise<number> {
  const response = await apiClient.get<{ count: number }>(
    '/api/org/employee/notifications/unread-count'
  );

  return response.count;
}

// ─── Mark All as Read ───────────────────────────────────────────────
export async function markAllNotificationsAsRead(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/api/org/employee/notifications/mark-read'
  );

  return response;
}

// ─── Mark Single as Read ────────────────────────────────────────────
export async function markNotificationAsRead(id: string): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    `/api/org/employee/notifications/${id}/mark-read`
  );

  return response;
}
