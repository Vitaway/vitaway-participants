// Messages & Communication API Service

import { apiClient } from './client';
import type { Conversation, Message, ParticipantType } from '@/types';

// ─── Get Conversations ──────────────────────────────────────────────
export async function getConversations(params?: {
  perPage?: number;
  page?: number;
}): Promise<{ data: Conversation[]; meta: any }> {
  try {
    const response = await apiClient.get<{ data: any[]; meta: any }>(
      '/employee/messages/conversations',
      {
        per_page: params?.perPage,
        page: params?.page,
      }
    );

    return {
      data: Array.isArray(response.data) ? response.data.map((conversation: any) => ({
      id: String(conversation.id),
      employeeId: String(conversation.employee_id),
      participantId: String(conversation.participant_id),
      participantType: conversation.participant_type,
      participantName: conversation.participant_name,
      lastMessageAt: conversation.last_message_at,
      unreadCount: conversation.unread_count || 0,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    })) : [],
      meta: response.meta || {},
    };
  } catch (error: any) {
    console.error('Failed to fetch conversations:', error);
    return { data: [], meta: {} };
  }
}

// ─── Get Conversation Messages ──────────────────────────────────────
export async function getConversationMessages(
  conversationId: string,
  params?: {
    perPage?: number;
    page?: number;
  }
): Promise<{ data: Message[]; meta: any }> {
  try {
    const response = await apiClient.get<{ data: any[]; meta: any }>(
      `/employee/messages/conversations/${conversationId}`,
      {
        per_page: params?.perPage,
        page: params?.page,
      }
    );

    return {
      data: Array.isArray(response.data) ? response.data.map((message: any) => ({
      id: String(message.id),
      conversationId: String(message.conversation_id),
      senderId: String(message.sender_id),
      senderType: message.sender_type,
      senderName: message.sender_name,
      message: message.message,
      isRead: message.is_read || false,
      sentAt: message.sent_at,
      readAt: message.read_at,
    })) : [],
      meta: response.meta || {},
    };
  } catch (error: any) {
    console.error('Failed to fetch messages:', error);
    return { data: [], meta: {} };
  }
}

// ─── Send Message ───────────────────────────────────────────────────
export async function sendMessage(data: {
  recipientId: string;
  recipientType: ParticipantType;
  message: string;
  conversationId?: string;
}): Promise<Message> {
  const response = await apiClient.post<{ data: any }>(
    '/employee/messages',
    {
      recipient_id: data.recipientId,
      recipient_type: data.recipientType,
      message: data.message,
      conversation_id: data.conversationId,
    }
  );

  const message = response.data;
  return {
    id: String(message.id),
    conversationId: String(message.conversation_id),
    senderId: String(message.sender_id),
    senderType: message.sender_type,
    senderName: message.sender_name,
    message: message.message,
    isRead: message.is_read || false,
    sentAt: message.sent_at,
    readAt: message.read_at,
  };
}
