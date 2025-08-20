"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("../services/chat.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const express_validator_1 = require("express-validator");
const socket_1 = require("../config/socket");
class ChatController {
    constructor() {
        // Get chat rooms
        this.getChatRooms = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                roomType: req.query.roomType,
                mtoId: req.query.mtoId,
                poId: req.query.poId,
                isActive: req.query.isActive === 'true',
                limit: parseInt(req.query.limit) || 50,
                offset: parseInt(req.query.offset) || 0,
            };
            const result = await this.chatService.getChatRooms(req.user?.id, req.user?.companyId, filters);
            res.json({
                success: true,
                data: result.data,
                total: result.total,
                limit: filters.limit,
                offset: filters.offset,
            });
        });
        // Get or create MTO chat room
        this.getMTOChatRoom = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { mtoId } = req.params;
            const room = await this.chatService.getOrCreateMTOChatRoom(mtoId);
            res.json({
                success: true,
                data: room,
            });
        });
        // Get chat messages
        this.getChatMessages = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { roomId } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const messages = await this.chatService.getChatMessages(roomId, limit, offset);
            res.json({
                success: true,
                data: messages,
            });
        });
        // Send chat message
        this.sendMessage = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { roomId } = req.params;
            const { message, attachments, replyTo } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            if (!message) {
                res.status(400).json({
                    success: false,
                    error: 'Message content is required',
                });
                return;
            }
            const chatMessage = await this.chatService.sendMessage({
                room_id: roomId,
                user_id: req.user?.id,
                message,
                attachments,
                reply_to: replyTo,
            });
            // Emit message to room via Socket.IO
            const io = req.app.get('io');
            if (io) {
                (0, socket_1.emitToRoom)(io, `chat:${roomId}`, 'chat:newMessage', chatMessage);
            }
            logger_1.logger.info(`Chat message sent in room ${roomId} by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: chatMessage,
            });
        });
        // Edit message
        this.editMessage = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { messageId } = req.params;
            const { message } = req.body;
            if (!message) {
                res.status(400).json({
                    success: false,
                    error: 'Message content is required',
                });
                return;
            }
            const updatedMessage = await this.chatService.editMessage(messageId, message, req.user?.id);
            // Emit update to room
            const io = req.app.get('io');
            if (io && updatedMessage) {
                (0, socket_1.emitToRoom)(io, `chat:${updatedMessage.room_id}`, 'chat:messageEdited', updatedMessage);
            }
            res.json({
                success: true,
                data: updatedMessage,
            });
        });
        // Delete message
        this.deleteMessage = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { messageId } = req.params;
            const deletedMessage = await this.chatService.deleteMessage(messageId, req.user?.id, req.user?.role === 'admin');
            // Emit deletion to room
            const io = req.app.get('io');
            if (io && deletedMessage) {
                (0, socket_1.emitToRoom)(io, `chat:${deletedMessage.room_id}`, 'chat:messageDeleted', {
                    messageId,
                });
            }
            logger_1.logger.info(`Chat message ${messageId} deleted by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Message deleted successfully',
            });
        });
        // Mark messages as read
        this.markAsRead = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { roomId } = req.params;
            const { messageIds } = req.body;
            await this.chatService.markMessagesAsRead(roomId, messageIds || [], req.user?.id);
            res.json({
                success: true,
                message: 'Messages marked as read',
            });
        });
        // Upload chat attachment
        this.uploadAttachment = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: 'File is required',
                });
                return;
            }
            const attachment = await this.chatService.uploadAttachment(req.file, req.user?.id);
            res.json({
                success: true,
                data: attachment,
            });
        });
        // Get room participants
        this.getRoomParticipants = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { roomId } = req.params;
            const participants = await this.chatService.getRoomParticipants(roomId);
            res.json({
                success: true,
                data: participants,
            });
        });
        // Add participant to room
        this.addParticipant = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { roomId } = req.params;
            const { userId } = req.body;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    error: 'User ID is required',
                });
                return;
            }
            const participant = await this.chatService.addParticipant(roomId, userId, req.user?.id);
            logger_1.logger.info(`User ${userId} added to chat room ${roomId} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: participant,
            });
        });
        // Remove participant from room
        this.removeParticipant = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { roomId, userId } = req.params;
            await this.chatService.removeParticipant(roomId, userId, req.user?.id);
            logger_1.logger.info(`User ${userId} removed from chat room ${roomId} by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Participant removed successfully',
            });
        });
        // Search messages
        this.searchMessages = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { query, roomId, startDate, endDate } = req.query;
            if (!query) {
                res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                });
                return;
            }
            const results = await this.chatService.searchMessages({
                query: query,
                roomId: roomId,
                userId: req.user?.id,
                companyId: req.user?.companyId,
                startDate: startDate,
                endDate: endDate,
            });
            res.json({
                success: true,
                data: results,
            });
        });
        // Get unread count
        this.getUnreadCount = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const count = await this.chatService.getUnreadCount(req.user?.id);
            res.json({
                success: true,
                data: {
                    unreadCount: count,
                },
            });
        });
        // Create group chat
        this.createGroupChat = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { name, description, participantIds } = req.body;
            if (!name || !participantIds || !Array.isArray(participantIds)) {
                res.status(400).json({
                    success: false,
                    error: 'Name and participant IDs are required',
                });
                return;
            }
            const room = await this.chatService.createGroupChat({
                name,
                description,
                created_by: req.user?.id,
                participantIds,
            });
            logger_1.logger.info(`Group chat "${name}" created by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: room,
            });
        });
        // Archive chat room
        this.archiveChatRoom = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { roomId } = req.params;
            await this.chatService.archiveChatRoom(roomId, req.user?.id);
            logger_1.logger.info(`Chat room ${roomId} archived by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Chat room archived successfully',
            });
        });
        this.chatService = new chat_service_1.ChatService();
    }
}
exports.ChatController = ChatController;
exports.default = new ChatController();
//# sourceMappingURL=chat.controller.js.map