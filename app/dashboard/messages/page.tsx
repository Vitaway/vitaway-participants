'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Send, User, Paperclip } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getConversations, getConversationMessages } from '@/lib/api';
import { getRelativeTime } from '@/lib/utils';
import type { Conversation, Message } from '@/types';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const conversationsData = await getConversations();
        setConversations(conversationsData.data);
        if (conversationsData.data.length > 0) {
          setSelectedConversation(conversationsData.data[0]);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadMessages() {
      if (selectedConversation) {
        try {
          const messagesData = await getConversationMessages(selectedConversation.id);
          setMessages(messagesData.data);
        } catch (error) {
          console.error('Failed to load messages:', error);
        }
      }
    }

    loadMessages();
  }, [selectedConversation]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">Loading messages...</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    // In production, this would send the message to the API
    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: 'emp-001',
      senderName: 'You',
      senderType: 'EMPLOYEE',
      message: newMessage,
      sentAt: new Date().toISOString(),
      isRead: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Messages</h1>
            <p className="mt-1 text-slate-600">
              Communicate securely with your health team
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="error" className="px-3 py-1">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Messages Interface */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No conversations yet
                </p>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`cursor-pointer rounded-lg p-3 transition-colors ${selectedConversation?.id === conversation.id
                        ? 'bg-primary-50 border-2 border-primary-200'
                        : 'hover:bg-slate-50 border-2 border-transparent'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white font-medium">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-800 dark:text-slate-50 truncate">
                            {conversation.participantName}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="error" className="ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 capitalize">
                          {conversation.participantType.toLowerCase()}
                        </p>
                        {/* Removed conversation.lastMessage, as it does not exist on Conversation */}
                        {conversation.lastMessageAt && (
                          <p className="mt-1 text-xs text-slate-400">
                            {getRelativeTime(conversation.lastMessageAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Messages Panel */}
          <Card className="lg:col-span-2">
            {!selectedConversation ? (
              <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-500">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-150 flex-col">
                {/* Conversation Header */}
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {selectedConversation.participantName}
                      </h3>
                      <p className="text-sm text-slate-500 capitalize">
                        {selectedConversation.participantType.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-sm text-slate-500">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    messages.map((message) => {
                      const isEmployee = message.senderType === 'EMPLOYEE';

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isEmployee ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${isEmployee
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-100 text-slate-800 dark:text-slate-50'
                              }`}
                          >
                            {!isEmployee && (
                              <p className="text-xs font-medium mb-1 opacity-75">
                                {message.senderName}
                              </p>
                            )}
                            <p className="text-sm">{message.message}</p>
                            <p
                              className={`mt-1 text-xs ${isEmployee ? 'text-primary-100' : 'text-slate-500'
                                }`}
                            >
                              {getRelativeTime(message.sentAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-slate-200 pt-4"
                >
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>

        {/* Privacy Notice */}
        <Card>
          <div className="rounded-lg bg-primary-50 p-4">
            <p className="text-sm text-primary-900">
              <strong>Privacy Notice:</strong> All messages are encrypted and securely
              stored. Your conversations are logged for quality assurance and compliance
              purposes. Do not share sensitive personal information such as passwords or
              financial details.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
