import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, X, Users, MoreVertical, ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

interface ChatPanelProps {
  chatId: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ chatId, title, isOpen, onClose }) => {
  const { chatState, openChat, closeChat, sendMessage, navigateToChat } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen || !chatId) return;

    // Open the chat if it's not already the current one
    if (chatState.currentChat !== chatId) {
      openChat(chatId);
    }

    return () => {
      // Don't auto-close when component unmounts, let user close manually
    };
  }, [isOpen, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = newMessage;
    setNewMessage('');
    handleTypingStop();

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      // TODO: Implement typing indicator via socket
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 1000);
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      // TODO: Implement typing indicator via socket
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const getContextDescription = () => {
    if (title) return title;
    if (!chatState.navigation?.current) return 'Chat';
    
    const { current } = chatState.navigation;
    return current.description || `${current.type} Chat`;
  };

  const getBreadcrumb = () => {
    if (!chatState.navigation?.breadcrumb) return [];
    return chatState.navigation.breadcrumb;
  };

  const handleClose = () => {
    closeChat();
    onClose();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return date.toLocaleDateString();
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 truncate">{getContextDescription()}</h3>
              
              {/* Breadcrumb */}
              {getBreadcrumb().length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                  {getBreadcrumb().map((crumb, index) => (
                    <React.Fragment key={index}>
                      <span>{crumb}</span>
                      {index < getBreadcrumb().length - 1 && <span>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Navigation buttons */}
            {chatState.navigation?.canGoUp && (
              <button
                onClick={() => {/* TODO: Implement navigation */}}
                className="p-1 hover:bg-gray-200 rounded"
                title="Go to parent context"
              >
                <ArrowUp className="w-4 h-4 text-gray-400" />
              </button>
            )}
            
            {chatState.navigation?.canGoDown && (
              <button
                onClick={() => {/* TODO: Implement navigation */}}
                className="p-1 hover:bg-gray-200 rounded"
                title="Go to child contexts"
              >
                <ArrowDown className="w-4 h-4 text-gray-400" />
              </button>
            )}

            <button
              title={`${chatState.participants.length} participants`}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Users className="w-4 h-4 text-gray-400" />
            </button>
            
            <button className="p-1 hover:bg-gray-200 rounded">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            <button 
              onClick={handleClose}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatState.loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : chatState.error ? (
          <div className="text-center py-8 text-red-500">
            <p className="text-sm">Error: {chatState.error}</p>
          </div>
        ) : chatState.messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
          </div>
        ) : (
          chatState.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.message_type === 'system' ? 'justify-center' : 'flex-col'
              }`}
            >
              {message.message_type === 'system' ? (
                <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {message.message}
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {message.sender?.full_name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.created_at)}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-2xl">
              <div className="flex items-center gap-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs ml-2">typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTypingStart();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                minHeight: '40px',
                maxHeight: '120px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Related chats */}
      {chatState.relatedChats.length > 0 && (
        <div className="p-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Related:</div>
          <div className="flex flex-wrap gap-1">
            {chatState.relatedChats.slice(0, 3).map((relatedChatId) => (
              <button
                key={relatedChatId}
                onClick={() => navigateToChat(relatedChatId)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                {relatedChatId.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;