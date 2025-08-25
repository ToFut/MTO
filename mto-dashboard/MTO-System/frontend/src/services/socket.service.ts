import { io, Socket } from 'socket.io-client';
import { logger } from '../utils/logger';

interface SocketEventCallbacks {
  [event: string]: Set<Function>;
}

class SocketService {
  private socket: Socket | null = null;
  private eventCallbacks: SocketEventCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  /**
   * Connect to Socket.IO server
   */
  connect(token: string, url: string = 'http://localhost:5010') {
    if (this.socket?.connected || this.isConnecting) {
      logger.info('Socket already connected or connecting');
      return;
    }

    this.isConnecting = true;

    this.socket = io(url, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
    this.isConnecting = false;
  }

  /**
   * Setup core socket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      logger.info('Socket connected successfully');
      this.reconnectAttempts = 0;
      this.emit('socket:connected');
    });

    this.socket.on('disconnect', (reason) => {
      logger.warn('Socket disconnected:', reason);
      this.emit('socket:disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      logger.error('Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('socket:max_reconnect_failed');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      logger.info('Socket reconnected after', attemptNumber, 'attempts');
      this.emit('socket:reconnected', attemptNumber);
    });

    // Application-specific events
    this.setupApplicationEvents();
  }

  /**
   * Setup application-specific event listeners
   */
  private setupApplicationEvents() {
    if (!this.socket) return;

    // MTO events
    this.socket.on('mto:created', (data) => {
      this.emit('mto:created', data);
    });

    this.socket.on('mto:updated', (data) => {
      this.emit('mto:updated', data);
    });

    this.socket.on('mto:deleted', (data) => {
      this.emit('mto:deleted', data);
    });

    this.socket.on('mto:statusChanged', (data) => {
      this.emit('mto:statusChanged', data);
    });

    // Production events
    this.socket.on('production:stageChanged', (data) => {
      this.emit('production:stageChanged', data);
    });

    this.socket.on('production:completed', (data) => {
      this.emit('production:completed', data);
    });

    // Inventory events
    this.socket.on('inventory:updated', (data) => {
      this.emit('inventory:updated', data);
    });

    this.socket.on('inventory:lowStock', (data) => {
      this.emit('inventory:lowStock', data);
    });

    // Defect events
    this.socket.on('defect:reported', (data) => {
      this.emit('defect:reported', data);
    });

    this.socket.on('defect:resolved', (data) => {
      this.emit('defect:resolved', data);
    });

    // Chat events
    this.socket.on('chat:message', (data) => {
      this.emit('chat:message', data);
    });

    this.socket.on('chat:typing', (data) => {
      this.emit('chat:typing', data);
    });

    this.socket.on('chat:read', (data) => {
      this.emit('chat:read', data);
    });

    // Notification events
    this.socket.on('notification:new', (data) => {
      this.emit('notification:new', data);
    });

    // Shipment events
    this.socket.on('shipment:created', (data) => {
      this.emit('shipment:created', data);
    });

    this.socket.on('shipment:updated', (data) => {
      this.emit('shipment:updated', data);
    });

    this.socket.on('shipment:delivered', (data) => {
      this.emit('shipment:delivered', data);
    });
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventCallbacks = {};
      logger.info('Socket disconnected');
    }
  }

  /**
   * Join a room
   */
  joinRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('join:room', room);
      logger.info('Joined room:', room);
    }
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave:room', room);
      logger.info('Left room:', room);
    }
  }

  /**
   * Join chat room (for universal chat)
   */
  joinChatRoom(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:join', chatId);
      logger.info('Joined chat room:', chatId);
    }
  }

  /**
   * Leave chat room (for universal chat)
   */
  leaveChatRoom(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:leave', chatId);
      logger.info('Left chat room:', chatId);
    }
  }

  /**
   * Join MTO-specific room
   */
  joinMTORoom(mtoId: string) {
    this.joinRoom(`mto:${mtoId}`);
  }

  /**
   * Leave MTO-specific room
   */
  leaveMTORoom(mtoId: string) {
    this.leaveRoom(`mto:${mtoId}`);
  }

  /**
   * Join company-specific room
   */
  joinCompanyRoom(companyId: string) {
    this.joinRoom(`company:${companyId}`);
  }

  /**
   * Send a chat message
   */
  sendChatMessage(mtoId: string, message: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:send', {
        mtoId,
        message,
        userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(mtoId: string, userId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('chat:typing', {
        mtoId,
        userId,
        isTyping,
      });
    }
  }

  /**
   * Mark messages as read
   */
  markMessagesAsRead(mtoId: string, messageIds: string[], userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:markRead', {
        mtoId,
        messageIds,
        userId,
      });
    }
  }

  /**
   * Update MTO status
   */
  updateMTOStatus(mtoId: string, status: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mto:updateStatus', {
        mtoId,
        status,
        userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update production stage
   */
  updateProductionStage(mtoId: string, stage: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('production:updateStage', {
        mtoId,
        stage,
        userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Report a defect
   */
  reportDefect(mtoId: string, defectData: any, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('defect:report', {
        mtoId,
        ...defectData,
        reportedBy: userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function) {
    if (!this.eventCallbacks[event]) {
      this.eventCallbacks[event] = new Set();
    }
    this.eventCallbacks[event].add(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: Function) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].delete(callback);
      
      if (this.eventCallbacks[event].size === 0) {
        delete this.eventCallbacks[event];
      }
    }
  }

  /**
   * Emit an event to all registered callbacks
   */
  private emit(event: string, data?: any) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;