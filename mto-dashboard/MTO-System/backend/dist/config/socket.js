"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToCompany = exports.emitToUser = exports.emitToRoom = exports.configureSocket = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("./logger");
const configureSocket = (io) => {
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            logger_1.logger.info(`Socket authenticated for user: ${decoded.email}`);
            next();
        }
        catch (error) {
            logger_1.logger.error('Socket authentication failed:', error);
            next(new Error('Authentication failed'));
        }
    });
    io.on('connection', (socket) => {
        logger_1.logger.info(`Client connected: ${socket.id} (User: ${socket.user?.email})`);
        // Join user to their company room
        if (socket.user?.companyId) {
            socket.join(`company:${socket.user.companyId}`);
        }
        // Join user to their personal room
        if (socket.user?.id) {
            socket.join(`user:${socket.user.id}`);
        }
        // MTO Events
        socket.on('mto:join', (mtoId) => {
            socket.join(`mto:${mtoId}`);
            logger_1.logger.debug(`Socket ${socket.id} joined MTO room: ${mtoId}`);
        });
        socket.on('mto:leave', (mtoId) => {
            socket.leave(`mto:${mtoId}`);
            logger_1.logger.debug(`Socket ${socket.id} left MTO room: ${mtoId}`);
        });
        socket.on('mto:update', (data) => {
            socket.to(`mto:${data.mtoId}`).emit('mto:updated', data);
            logger_1.logger.debug(`MTO update broadcasted for: ${data.mtoId}`);
        });
        // PO Events
        socket.on('po:join', (poId) => {
            socket.join(`po:${poId}`);
            logger_1.logger.debug(`Socket ${socket.id} joined PO room: ${poId}`);
        });
        socket.on('po:leave', (poId) => {
            socket.leave(`po:${poId}`);
            logger_1.logger.debug(`Socket ${socket.id} left PO room: ${poId}`);
        });
        // Chat Events
        socket.on('chat:join', (roomId) => {
            socket.join(`chat:${roomId}`);
            logger_1.logger.debug(`Socket ${socket.id} joined chat room: ${roomId}`);
        });
        socket.on('chat:leave', (roomId) => {
            socket.leave(`chat:${roomId}`);
            logger_1.logger.debug(`Socket ${socket.id} left chat room: ${roomId}`);
        });
        socket.on('chat:message', (data) => {
            io.to(`chat:${data.roomId}`).emit('chat:newMessage', {
                ...data,
                timestamp: new Date().toISOString(),
                userId: socket.user?.id,
            });
            logger_1.logger.debug(`Chat message sent in room: ${data.roomId}`);
        });
        socket.on('chat:typing', (data) => {
            socket.to(`chat:${data.roomId}`).emit('chat:userTyping', {
                userId: socket.user?.id,
                userName: socket.user?.email,
                roomId: data.roomId,
            });
        });
        // Defect Events
        socket.on('defect:reported', (data) => {
            io.to(`company:${socket.user?.companyId}`).emit('defect:new', data);
            logger_1.logger.info(`Defect reported for MTO: ${data.mtoId}`);
        });
        // Inventory Events
        socket.on('inventory:shortage', (data) => {
            io.to(`company:${socket.user?.companyId}`).emit('inventory:alert', data);
            logger_1.logger.warn(`Inventory shortage alert: ${data.sku}`);
        });
        // Production Events
        socket.on('production:statusChange', (data) => {
            io.to(`mto:${data.mtoId}`).emit('production:updated', data);
            io.to(`company:${socket.user?.companyId}`).emit('production:statusChanged', data);
            logger_1.logger.info(`Production status changed for MTO: ${data.mtoId}`);
        });
        // Notification Events
        socket.on('notification:send', (data) => {
            if (data.userId) {
                io.to(`user:${data.userId}`).emit('notification:received', data);
            }
            else if (data.companyId) {
                io.to(`company:${data.companyId}`).emit('notification:received', data);
            }
            logger_1.logger.debug(`Notification sent: ${data.type}`);
        });
        // Disconnect
        socket.on('disconnect', () => {
            logger_1.logger.info(`Client disconnected: ${socket.id} (User: ${socket.user?.email})`);
        });
        // Error handling
        socket.on('error', (error) => {
            logger_1.logger.error(`Socket error for ${socket.id}:`, error);
        });
    });
    // Periodic heartbeat
    setInterval(() => {
        io.emit('heartbeat', { timestamp: new Date().toISOString() });
    }, 30000);
    logger_1.logger.info('✅ Socket.IO configured successfully');
};
exports.configureSocket = configureSocket;
// Helper function to emit events from outside socket context
const emitToRoom = (io, room, event, data) => {
    io.to(room).emit(event, data);
};
exports.emitToRoom = emitToRoom;
const emitToUser = (io, userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
};
exports.emitToUser = emitToUser;
const emitToCompany = (io, companyId, event, data) => {
    io.to(`company:${companyId}`).emit(event, data);
};
exports.emitToCompany = emitToCompany;
//# sourceMappingURL=socket.js.map