import { apiClient } from '../config/api';
import socketService from './socket.service';

export interface ChatMessage {
  id: string;
  mto_id: string;
  user_id: string;
  user_name: string;
  message: string;
  timestamp: string;
  read_by: string[];
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
}

export interface ChatRoom {
  id: string;
  mto_id: string;
  participants: string[];
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

class ChatService {
  private BASE_PATH = '/api/chat';

  /**
   * Get chat history for an MTO
   */
  async getChatHistory(mtoId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/history/${mtoId}`, {
        params: { limit, offset }
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch chat history:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch chat history');
    }
  }

  /**
   * Send a chat message via HTTP and Socket.IO
   */
  async sendMessage(mtoId: string, message: string, userId: string): Promise<ChatMessage> {
    try {
      // Send via HTTP for persistence
      const response = await apiClient.post(`${this.BASE_PATH}/send`, {
        mto_id: mtoId,
        message,
        message_type: 'text'
      });

      const chatMessage = response.data.data;

      // Also emit via Socket.IO for real-time delivery
      socketService.sendChatMessage(mtoId, message, userId);

      return chatMessage;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(mtoId: string, userId: string, isTyping: boolean): void {
    socketService.sendTypingIndicator(mtoId, userId, isTyping);
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(mtoId: string, messageIds: string[]): Promise<void> {
    try {
      await apiClient.put(`${this.BASE_PATH}/read`, {
        mto_id: mtoId,
        message_ids: messageIds
      });

      // Also notify via Socket.IO
      socketService.markMessagesAsRead(mtoId, messageIds, 'current-user-id'); // TODO: Get actual user ID
    } catch (error: any) {
      console.error('Failed to mark messages as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark messages as read');
    }
  }

  /**
   * Get chat rooms for current user
   */
  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/rooms`);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch chat rooms:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch chat rooms');
    }
  }

  /**
   * Get unread message count for an MTO
   */
  async getUnreadCount(mtoId: string): Promise<number> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/unread/${mtoId}`);
      return response.data.data?.count || 0;
    } catch (error: any) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  }

  /**
   * Upload file/image for chat
   */
  async uploadFile(file: File, mtoId: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mto_id', mtoId);

      const response = await apiClient.post(`${this.BASE_PATH}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data?.file_url || '';
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  }

  /**
   * Send file/image message
   */
  async sendFileMessage(mtoId: string, fileUrl: string, messageType: 'image' | 'file', userId: string): Promise<ChatMessage> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/send`, {
        mto_id: mtoId,
        message: fileUrl,
        message_type: messageType,
        file_url: fileUrl
      });

      const chatMessage = response.data.data;

      // Emit via Socket.IO for real-time delivery
      socketService.sendChatMessage(mtoId, fileUrl, userId);

      return chatMessage;
    } catch (error: any) {
      console.error('Failed to send file message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send file message');
    }
  }

  /**
   * Subscribe to chat events
   */
  subscribeToMTOChat(mtoId: string, callbacks: {
    onMessage?: (message: ChatMessage) => void;
    onTyping?: (data: { userId: string; isTyping: boolean }) => void;
    onRead?: (data: { messageIds: string[]; userId: string }) => void;
  }) {
    // Join the MTO room for real-time updates
    socketService.joinMTORoom(mtoId);

    const unsubscribeFunctions: (() => void)[] = [];

    // Subscribe to new messages
    if (callbacks.onMessage) {
      const unsubMessage = socketService.on('chat:message', (data: any) => {
        if (data.mto_id === mtoId) {
          callbacks.onMessage!(data);
        }
      });
      unsubscribeFunctions.push(unsubMessage);
    }

    // Subscribe to typing indicators
    if (callbacks.onTyping) {
      const unsubTyping = socketService.on('chat:typing', (data: any) => {
        if (data.mtoId === mtoId) {
          callbacks.onTyping!({
            userId: data.userId,
            isTyping: data.isTyping
          });
        }
      });
      unsubscribeFunctions.push(unsubTyping);
    }

    // Subscribe to read receipts
    if (callbacks.onRead) {
      const unsubRead = socketService.on('chat:read', (data: any) => {
        if (data.mtoId === mtoId) {
          callbacks.onRead!({
            messageIds: data.messageIds,
            userId: data.userId
          });
        }
      });
      unsubscribeFunctions.push(unsubRead);
    }

    // Return cleanup function
    return () => {
      socketService.leaveMTORoom(mtoId);
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }

  /**
   * Subscribe to all chat notifications
   */
  subscribeToGlobalChat(callbacks: {
    onNewMessage?: (data: { mtoId: string; message: ChatMessage }) => void;
    onUnreadCountUpdate?: (data: { mtoId: string; count: number }) => void;
  }) {
    const unsubscribeFunctions: (() => void)[] = [];

    if (callbacks.onNewMessage) {
      const unsubMessage = socketService.on('chat:message', (data: any) => {
        callbacks.onNewMessage!({
          mtoId: data.mto_id,
          message: data
        });
      });
      unsubscribeFunctions.push(unsubMessage);
    }

    if (callbacks.onUnreadCountUpdate) {
      const unsubUnread = socketService.on('chat:unreadUpdate', (data: any) => {
        callbacks.onUnreadCountUpdate!({
          mtoId: data.mtoId,
          count: data.count
        });
      });
      unsubscribeFunctions.push(unsubUnread);
    }

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }
}

export const chatService = new ChatService();