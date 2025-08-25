import React, { createContext, useContext, useState, useEffect } from 'react';
import universalChatService, { UniversalChatMessage, UniversalChatRoom } from '../services/universal-chat.service';

interface ChatState {
  currentChat: string | null;
  isOpen: boolean;
  messages: UniversalChatMessage[];
  participants: any[];
  loading: boolean;
  error: string | null;
  relatedChats: string[];
  navigation: any;
}

interface ChatContextType {
  chatState: ChatState;
  openChat: (chatId: string) => Promise<void>;
  closeChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  navigateToChat: (chatId: string) => Promise<void>;
  generateChatId: (type: string, level?: string, ids?: Record<string, any>) => string;
  buildMTOChatId: (context: {
    level: 'SP' | 'DY' | 'MO' | 'YR';
    mtoId?: string;
    internalId?: string;
    date?: string;
    month?: string;
    year?: string;
  }) => string;
  buildInventoryChatId: (sku: string) => string;
  buildDefectChatId: (defectId: string, mtoId?: string) => string;
  buildShippingChatId: (carton: string, tracking?: string) => string;
  buildPOChatId: (poNumber: string) => string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialState: ChatState = {
  currentChat: null,
  isOpen: false,
  messages: [],
  participants: [],
  loading: false,
  error: null,
  relatedChats: [],
  navigation: null,
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatState, setChatState] = useState<ChatState>(initialState);
  const [chatCleanup, setChatCleanup] = useState<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (chatCleanup) {
        chatCleanup();
      }
    };
  }, [chatCleanup]);

  const openChat = async (chatId: string): Promise<void> => {
    try {
      setChatState(prev => ({
        ...prev,
        loading: true,
        error: null,
        currentChat: chatId,
        isOpen: true,
      }));

      const chatData = await universalChatService.openChat(chatId);

      setChatState(prev => ({
        ...prev,
        loading: false,
        messages: chatData.messages || [],
        participants: chatData.participants || [],
        relatedChats: chatData.relatedChats || [],
        navigation: chatData.navigation,
      }));

      // Clean up previous subscription
      if (chatCleanup) {
        chatCleanup();
      }

      // Subscribe to real-time updates
      const cleanup = universalChatService.subscribeToChat(chatId, {
        onMessage: (message: UniversalChatMessage) => {
          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, message],
          }));
        },
        onTyping: (data: { userId: string; isTyping: boolean }) => {
          console.log('User typing:', data);
        },
        onParticipantChange: (data: { userId: string; action: 'joined' | 'left' }) => {
          console.log('Participant change:', data);
        },
      });

      setChatCleanup(() => cleanup);
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to open chat',
      }));
    }
  };

  const closeChat = (): void => {
    if (chatCleanup) {
      chatCleanup();
      setChatCleanup(null);
    }

    if (chatState.currentChat) {
      universalChatService.leaveChat(chatState.currentChat);
    }

    setChatState(initialState);
  };

  const sendMessage = async (message: string): Promise<void> => {
    if (!chatState.currentChat || !message.trim()) return;

    try {
      await universalChatService.sendMessage(chatState.currentChat, message.trim());
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        error: error.message || 'Failed to send message',
      }));
    }
  };

  const navigateToChat = async (chatId: string): Promise<void> => {
    if (chatId === chatState.currentChat) return;

    await openChat(chatId);
  };

  const generateChatId = (type: string, level?: string, ids?: Record<string, any>): string => {
    return universalChatService.generateChatId({ type, level, ids: ids || {} });
  };

  const buildMTOChatId = (context: {
    level: 'SP' | 'DY' | 'MO' | 'YR';
    mtoId?: string;
    internalId?: string;
    date?: string;
    month?: string;
    year?: string;
  }): string => {
    return universalChatService.buildMTOChatId(context);
  };

  const buildInventoryChatId = (sku: string): string => {
    return universalChatService.buildInventoryChatId(sku);
  };

  const buildDefectChatId = (defectId: string, mtoId?: string): string => {
    return universalChatService.buildDefectChatId(defectId, mtoId);
  };

  const buildShippingChatId = (carton: string, tracking?: string): string => {
    return universalChatService.buildShippingChatId(carton, tracking);
  };

  const buildPOChatId = (poNumber: string): string => {
    return universalChatService.buildPOChatId(poNumber);
  };

  const contextValue: ChatContextType = {
    chatState,
    openChat,
    closeChat,
    sendMessage,
    navigateToChat,
    generateChatId,
    buildMTOChatId,
    buildInventoryChatId,
    buildDefectChatId,
    buildShippingChatId,
    buildPOChatId,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;