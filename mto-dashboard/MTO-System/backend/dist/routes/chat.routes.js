"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const chat_controller_1 = __importDefault(require("../controllers/chat.controller"));
const router = (0, express_1.Router)();
// ============ UNIVERSAL CHAT ROUTES ============
// Open or create chat with smart ID
router.post('/open', auth_middleware_1.authenticate, (0, express_validator_1.body)('chatId').notEmpty().withMessage('Chat ID is required'), chat_controller_1.default.openChat);
// Send message to chat
router.post('/:chatId/messages', auth_middleware_1.authenticate, (0, express_validator_1.body)('message').notEmpty().withMessage('Message is required'), chat_controller_1.default.sendUniversalMessage);
// Get messages for chat
router.get('/:chatId/messages', auth_middleware_1.authenticate, chat_controller_1.default.getUniversalMessages);
// Navigate between chat contexts
router.get('/:chatId/navigate/:direction', auth_middleware_1.authenticate, chat_controller_1.default.navigateChat);
// Mark messages as read
router.put('/:chatId/read', auth_middleware_1.authenticate, chat_controller_1.default.markUniversalMessagesAsRead);
// Get participants
router.get('/:chatId/participants', auth_middleware_1.authenticate, chat_controller_1.default.getUniversalParticipants);
// Helper to generate chat IDs (for frontend development)
router.post('/generate-id', auth_middleware_1.authenticate, (0, express_validator_1.body)('type').notEmpty().withMessage('Type is required'), (0, express_validator_1.body)('ids').isObject().withMessage('IDs object is required'), chat_controller_1.default.generateChatId);
// ============ LEGACY CHAT ROUTES (keep for backward compatibility) ============
// Get chat rooms (legacy)
router.get('/rooms', auth_middleware_1.authenticate, chat_controller_1.default.getChatRooms);
// Get or create MTO chat room (legacy)
router.post('/mto/:mtoId', auth_middleware_1.authenticate, chat_controller_1.default.getMTOChatRoom);
// Get chat messages (legacy)
router.get('/rooms/:roomId/messages', auth_middleware_1.authenticate, chat_controller_1.default.getChatMessages);
// Send chat message (legacy)
router.post('/rooms/:roomId/messages', auth_middleware_1.authenticate, (0, express_validator_1.body)('message').notEmpty().withMessage('Message is required'), chat_controller_1.default.sendMessage);
// Edit message (legacy)
router.put('/messages/:messageId', auth_middleware_1.authenticate, (0, express_validator_1.body)('message').notEmpty().withMessage('Message is required'), chat_controller_1.default.editMessage);
// Delete message (legacy)
router.delete('/messages/:messageId', auth_middleware_1.authenticate, chat_controller_1.default.deleteMessage);
// Mark messages as read (legacy)
router.put('/rooms/:roomId/read', auth_middleware_1.authenticate, chat_controller_1.default.markAsRead);
// Upload attachment (legacy)
router.post('/upload', auth_middleware_1.authenticate, chat_controller_1.default.uploadAttachment);
// Get room participants (legacy)
router.get('/rooms/:roomId/participants', auth_middleware_1.authenticate, chat_controller_1.default.getRoomParticipants);
// Add participant (legacy)
router.post('/rooms/:roomId/participants', auth_middleware_1.authenticate, (0, express_validator_1.body)('userId').notEmpty().withMessage('User ID is required'), chat_controller_1.default.addParticipant);
// Remove participant (legacy)
router.delete('/rooms/:roomId/participants/:userId', auth_middleware_1.authenticate, chat_controller_1.default.removeParticipant);
// Search messages (legacy)
router.get('/search', auth_middleware_1.authenticate, chat_controller_1.default.searchMessages);
// Get unread count (legacy)
router.get('/unread', auth_middleware_1.authenticate, chat_controller_1.default.getUnreadCount);
// Create group chat (legacy)
router.post('/groups', auth_middleware_1.authenticate, (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'), (0, express_validator_1.body)('participantIds').isArray().withMessage('Participant IDs must be an array'), chat_controller_1.default.createGroupChat);
// Archive chat room (legacy)
router.put('/rooms/:roomId/archive', auth_middleware_1.authenticate, chat_controller_1.default.archiveChatRoom);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map