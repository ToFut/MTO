import { apiClient } from '../utils/api-client';
import socketService from './socket.service';

export interface UniversalChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'file' | 'system' | 'notification';
  attachments?: any[];
  mentions?: string[];
  parent_message_id?: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface UniversalChatRoom {
  id: string;
  chat_id: string;
  chat_type: string;
  chat_level?: string;
  metadata: any;
  participant_count: number;
  message_count: number;
  last_activity: string;
  created_at: string;
}

export interface ChatContext {
  id: string;
  type: string;
  level?: string;
  description: string;
}

export interface NavigationInfo {
  current: ChatContext;
  breadcrumb: string[];
  canGoUp: boolean;
  canGoDown: boolean;
}

class UniversalChatService {
  private BASE_PATH = '/chat';

  /**
   * Generate smart chat ID based on context
   */
  generateChatId(params: {
    type: string;
    level?: string;
    ids: Record<string, any>;
  }): string {
    const parts = [params.type.toUpperCase()];

    if (params.level) {
      parts.push(params.level.toUpperCase());
    }

    // Build ID based on type
    switch (params.type.toUpperCase()) {
      case 'MTO':
        if (params.level === 'SP') {
          parts.push(params.ids.mtoId || params.ids.internalId);
        } else if (params.level === 'DY') {
          const date = params.ids.date.replace(/-/g, '_');
          parts.push(...date.split('_'));
        } else if (params.level === 'MO') {
          const month = params.ids.month.replace(/-/g, '_');
          parts.push(...month.split('_'));
        } else if (params.level === 'YR') {
          parts.push(params.ids.year);
        }
        break;

      case 'INV':
        parts.push(params.ids.sku);
        break;

      case 'DEF':
        parts.push(params.ids.defectId);
        if (params.ids.mtoId) {
          parts.push('MTO', params.ids.mtoId);
        }
        break;

      case 'SHIP':
        parts.push(params.ids.carton);
        if (params.ids.tracking) {
          parts.push(params.ids.tracking);
        }
        break;

      case 'PO':
        parts.push(params.ids.poNumber.replace(/[^A-Z0-9]/gi, ''));
        break;
    }

    return parts.join('_');
  }

  /**
   * Open or create chat with smart ID
   */
  async openChat(chatId: string): Promise<{
    room: UniversalChatRoom;
    messages: UniversalChatMessage[];
    participants: any[];
    relatedChats: string[];
    navigation: NavigationInfo;
  }> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/open`, {
        chatId
      });

      // Join socket room for real-time updates
      if (socketService.isConnected()) {
        socketService.joinChatRoom(chatId);
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Failed to open chat:', error);
      throw new Error(error.response?.data?.message || 'Failed to open chat');
    }
  }

  /**
   * Send message to chat
   */
  async sendMessage(chatId: string, message: string, type: string = 'text'): Promise<UniversalChatMessage> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/${chatId}/messages`, {
        message,
        type
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }

  /**
   * Get messages for chat
   */
  async getMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<UniversalChatMessage[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${chatId}/messages`, {
        params: { limit, offset }
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch messages');
    }
  }

  /**
   * Navigate between chat contexts
   */
  async navigateChat(chatId: string, direction: 'up' | 'down' | 'related'): Promise<{
    targets: string[];
    direction: string;
    current: string;
  }> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${chatId}/navigate/${direction}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to navigate chat:', error);
      throw new Error(error.response?.data?.message || 'Failed to navigate chat');
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, messageIds?: string[]): Promise<void> {
    try {
      await apiClient.put(`${this.BASE_PATH}/${chatId}/read`, {
        messageIds
      });
    } catch (error: any) {
      console.error('Failed to mark messages as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark messages as read');
    }
  }

  /**
   * Get participants for chat
   */
  async getParticipants(chatId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${chatId}/participants`);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch participants:', error);
      return [];
    }
  }

  /**
   * Generate chat ID via API (for development)
   */
  async generateChatIdAPI(type: string, level: string | undefined, ids: Record<string, any>): Promise<string> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/generate-id`, {
        type,
        level,
        ids
      });

      return response.data.data.chatId;
    } catch (error: any) {
      console.error('Failed to generate chat ID:', error);
      // Fallback to client-side generation
      return this.generateChatId({ type, level, ids });
    }
  }

  /**
   * Subscribe to chat events
   */
  subscribeToChat(chatId: string, callbacks: {
    onMessage?: (message: UniversalChatMessage) => void;
    onTyping?: (data: { userId: string; isTyping: boolean }) => void;
    onParticipantChange?: (data: { userId: string; action: 'joined' | 'left' }) => void;
  }) {
    // Join the chat room for real-time updates
    if (socketService.isConnected()) {
      socketService.joinChatRoom(chatId);
    }

    const unsubscribeFunctions: (() => void)[] = [];

    // Subscribe to new messages
    if (callbacks.onMessage) {
      const unsubMessage = socketService.on('message:new', (data: any) => {
        if (data.chat_id === chatId) {
          callbacks.onMessage!(data);
        }
      });
      unsubscribeFunctions.push(unsubMessage);
    }

    // Subscribe to typing indicators
    if (callbacks.onTyping) {
      const unsubTyping = socketService.on('chat:typing', (data: any) => {
        if (data.chatId === chatId) {
          callbacks.onTyping!({
            userId: data.userId,
            isTyping: data.isTyping
          });
        }
      });
      unsubscribeFunctions.push(unsubTyping);
    }

    // Subscribe to participant changes
    if (callbacks.onParticipantChange) {
      const unsubParticipant = socketService.on('chat:participant', (data: any) => {
        if (data.chatId === chatId) {
          callbacks.onParticipantChange!({
            userId: data.userId,
            action: data.action
          });
        }
      });
      unsubscribeFunctions.push(unsubParticipant);
    }

    // Return cleanup function
    return () => {
      if (socketService.isConnected()) {
        socketService.leaveChatRoom(chatId);
      }
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }

  /**
   * Leave chat
   */
  leaveChat(chatId: string) {
    if (socketService.isConnected()) {
      socketService.leaveChatRoom(chatId);
    }
  }

  /**
   * Helper: Build chat ID for MTO contexts
   */
  buildMTOChatId(context: {
    level: 'SP' | 'DY' | 'MO' | 'YR';
    mtoId?: string;
    internalId?: string;
    date?: string;
    month?: string;
    year?: string;
  }): string {
    return this.generateChatId({
      type: 'MTO',
      level: context.level,
      ids: context
    });
  }

  /**
   * Helper: Build chat ID for inventory
   */
  buildInventoryChatId(sku: string): string {
    return this.generateChatId({
      type: 'INV',
      ids: { sku }
    });
  }

  /**
   * Helper: Build chat ID for defects
   */
  buildDefectChatId(defectId: string, mtoId?: string): string {
    return this.generateChatId({
      type: 'DEF',
      ids: { defectId, mtoId }
    });
  }

  /**
   * Helper: Build chat ID for shipping
   */
  buildShippingChatId(carton: string, tracking?: string): string {
    return this.generateChatId({
      type: 'SHIP',
      ids: { carton, tracking }
    });
  }

  /**
   * Helper: Build chat ID for PO
   */
  buildPOChatId(poNumber: string): string {
    return this.generateChatId({
      type: 'PO',
      ids: { poNumber }
    });
  }
}

export const universalChatService = new UniversalChatService();
export default universalChatService;