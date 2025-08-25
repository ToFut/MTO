import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import chatController from '../controllers/chat.controller';

const router = Router();

// ============ UNIVERSAL CHAT ROUTES ============

// Open or create chat with smart ID
router.post('/open', 
  authenticate,
  body('chatId').notEmpty().withMessage('Chat ID is required'),
  chatController.openChat
);

// Send message to chat
router.post('/:chatId/messages', 
  authenticate,
  body('message').notEmpty().withMessage('Message is required'),
  chatController.sendUniversalMessage
);

// Get messages for chat
router.get('/:chatId/messages', authenticate, chatController.getUniversalMessages);

// Navigate between chat contexts
router.get('/:chatId/navigate/:direction', authenticate, chatController.navigateChat);

// Mark messages as read
router.put('/:chatId/read', authenticate, chatController.markUniversalMessagesAsRead);

// Get participants
router.get('/:chatId/participants', authenticate, chatController.getUniversalParticipants);

// Helper to generate chat IDs (for frontend development)
router.post('/generate-id',
  authenticate,
  body('type').notEmpty().withMessage('Type is required'),
  body('ids').isObject().withMessage('IDs object is required'),
  chatController.generateChatId
);

// ============ LEGACY CHAT ROUTES (keep for backward compatibility) ============

// Get chat rooms (legacy)
router.get('/rooms', authenticate, chatController.getChatRooms);

// Get or create MTO chat room (legacy)
router.post('/mto/:mtoId', authenticate, chatController.getMTOChatRoom);

// Get chat messages (legacy)
router.get('/rooms/:roomId/messages', authenticate, chatController.getChatMessages);

// Send chat message (legacy)
router.post('/rooms/:roomId/messages', 
  authenticate,
  body('message').notEmpty().withMessage('Message is required'),
  chatController.sendMessage
);

// Edit message (legacy)
router.put('/messages/:messageId', 
  authenticate, 
  body('message').notEmpty().withMessage('Message is required'),
  chatController.editMessage
);

// Delete message (legacy)
router.delete('/messages/:messageId', authenticate, chatController.deleteMessage);

// Mark messages as read (legacy)
router.put('/rooms/:roomId/read', authenticate, chatController.markAsRead);

// Upload attachment (legacy)
router.post('/upload', authenticate, chatController.uploadAttachment);

// Get room participants (legacy)
router.get('/rooms/:roomId/participants', authenticate, chatController.getRoomParticipants);

// Add participant (legacy)
router.post('/rooms/:roomId/participants', 
  authenticate,
  body('userId').notEmpty().withMessage('User ID is required'),
  chatController.addParticipant
);

// Remove participant (legacy)
router.delete('/rooms/:roomId/participants/:userId', authenticate, chatController.removeParticipant);

// Search messages (legacy)
router.get('/search', authenticate, chatController.searchMessages);

// Get unread count (legacy)
router.get('/unread', authenticate, chatController.getUnreadCount);

// Create group chat (legacy)
router.post('/groups', 
  authenticate,
  body('name').notEmpty().withMessage('Name is required'),
  body('participantIds').isArray().withMessage('Participant IDs must be an array'),
  chatController.createGroupChat
);

// Archive chat room (legacy)
router.put('/rooms/:roomId/archive', authenticate, chatController.archiveChatRoom);

export default router;
