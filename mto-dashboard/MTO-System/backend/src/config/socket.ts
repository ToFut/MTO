import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './logger';

interface SocketUser {
  id: string;
  email: string;
  role: string;
  companyId: string;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

export const configureSocket = (io: SocketIOServer): void => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SocketUser;
      socket.user = decoded;
      
      logger.info(`Socket authenticated for user: ${decoded.email}`);
      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Client connected: ${socket.id} (User: ${socket.user?.email})`);

    // Join user to their company room
    if (socket.user?.companyId) {
      socket.join(`company:${socket.user.companyId}`);
    }

    // Join user to their personal room
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    // MTO Events
    socket.on('mto:join', (mtoId: string) => {
      socket.join(`mto:${mtoId}`);
      logger.debug(`Socket ${socket.id} joined MTO room: ${mtoId}`);
    });

    socket.on('mto:leave', (mtoId: string) => {
      socket.leave(`mto:${mtoId}`);
      logger.debug(`Socket ${socket.id} left MTO room: ${mtoId}`);
    });

    socket.on('mto:update', (data: any) => {
      socket.to(`mto:${data.mtoId}`).emit('mto:updated', data);
      logger.debug(`MTO update broadcasted for: ${data.mtoId}`);
    });

    // PO Events
    socket.on('po:join', (poId: string) => {
      socket.join(`po:${poId}`);
      logger.debug(`Socket ${socket.id} joined PO room: ${poId}`);
    });

    socket.on('po:leave', (poId: string) => {
      socket.leave(`po:${poId}`);
      logger.debug(`Socket ${socket.id} left PO room: ${poId}`);
    });

    // Universal Chat Events
    socket.on('chat:join', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      logger.debug(`Socket ${socket.id} joined chat room: ${chatId}`);
    });

    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      logger.debug(`Socket ${socket.id} left chat room: ${chatId}`);
    });

    // Legacy chat message (for backward compatibility)
    socket.on('chat:message', (data: any) => {
      io.to(`chat:${data.roomId}`).emit('chat:newMessage', {
        ...data,
        timestamp: new Date().toISOString(),
        userId: socket.user?.id,
      });
      logger.debug(`Chat message sent in room: ${data.roomId}`);
    });

    // Universal chat typing indicator
    socket.on('chat:typing', (data: any) => {
      const chatId = data.chatId || data.roomId; // Support both formats
      socket.to(`chat:${chatId}`).emit('chat:typing', {
        userId: socket.user?.id,
        userName: socket.user?.email,
        chatId: chatId,
        isTyping: data.isTyping || true,
      });
      logger.debug(`Typing indicator for chat: ${chatId}`);
    });

    // Chat participant events
    socket.on('chat:participant', (data: any) => {
      socket.to(`chat:${data.chatId}`).emit('chat:participant', {
        userId: socket.user?.id,
        userName: socket.user?.email,
        chatId: data.chatId,
        action: data.action, // 'joined' or 'left'
      });
    });

    // Defect Events
    socket.on('defect:reported', (data: any) => {
      io.to(`company:${socket.user?.companyId}`).emit('defect:new', data);
      logger.info(`Defect reported for MTO: ${data.mtoId}`);
    });

    // Inventory Events
    socket.on('inventory:shortage', (data: any) => {
      io.to(`company:${socket.user?.companyId}`).emit('inventory:alert', data);
      logger.warn(`Inventory shortage alert: ${data.sku}`);
    });

    // Production Events
    socket.on('production:statusChange', (data: any) => {
      io.to(`mto:${data.mtoId}`).emit('production:updated', data);
      io.to(`company:${socket.user?.companyId}`).emit('production:statusChanged', data);
      logger.info(`Production status changed for MTO: ${data.mtoId}`);
    });

    // Notification Events
    socket.on('notification:send', (data: any) => {
      if (data.userId) {
        io.to(`user:${data.userId}`).emit('notification:received', data);
      } else if (data.companyId) {
        io.to(`company:${data.companyId}`).emit('notification:received', data);
      }
      logger.debug(`Notification sent: ${data.type}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id} (User: ${socket.user?.email})`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Periodic heartbeat
  setInterval(() => {
    io.emit('heartbeat', { timestamp: new Date().toISOString() });
  }, 30000);

  logger.info('✅ Socket.IO configured successfully');
};

// Helper function to emit events from outside socket context
export const emitToRoom = (io: SocketIOServer, room: string, event: string, data: any): void => {
  io.to(room).emit(event, data);
};

export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any): void => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToCompany = (io: SocketIOServer, companyId: string, event: string, data: any): void => {
  io.to(`company:${companyId}`).emit(event, data);
};