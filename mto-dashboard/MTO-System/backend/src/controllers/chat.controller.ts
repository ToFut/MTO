import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ChatService } from '../services/chat.service';
import UniversalChatService from '../services/universal-chat.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';
import { emitToRoom } from '../config/socket';

export class ChatController {
  private chatService: ChatService;
  private universalChat: UniversalChatService;

  constructor() {
    this.chatService = new ChatService();
    this.universalChat = new UniversalChatService();
  }

  setSocketIO(io: any) {
    this.universalChat.setSocketIO(io);
  }

  // Get chat rooms
  getChatRooms = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      roomType: req.query.roomType as string,
      mtoId: req.query.mtoId as string,
      poId: req.query.poId as string,
      isActive: req.query.isActive === 'true',
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const result = await this.chatService.getChatRooms(
      req.user?.id!,
      req.user?.companyId!,
      filters
    );
    
    res.json({
      success: true,
      data: result.data,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    });
  });

  // Get or create MTO chat room
  getMTOChatRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { mtoId } = req.params;
    
    const room = await this.chatService.getOrCreateMTOChatRoom(mtoId);
    
    res.json({
      success: true,
      data: room,
    });
  });

  // Get chat messages
  getChatMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await this.chatService.getChatMessages(
      roomId,
      limit,
      offset
    );
    
    res.json({
      success: true,
      data: messages,
    });
  });

  // Send chat message
  sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { message, attachments, replyTo } = req.body;

    const errors = validationResult(req);
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
      user_id: req.user?.id!,
      message,
      attachments,
      reply_to: replyTo,
    });

    // Emit message to room via Socket.IO
    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, `chat:${roomId}`, 'chat:newMessage', chatMessage);
    }
    
    logger.info(`Chat message sent in room ${roomId} by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: chatMessage,
    });
  });

  // Edit message
  editMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { messageId } = req.params;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        error: 'Message content is required',
      });
      return;
    }

    const updatedMessage = await this.chatService.editMessage(
      messageId,
      message,
      req.user?.id!
    );

    // Emit update to room
    const io = req.app.get('io');
    if (io && updatedMessage) {
      emitToRoom(io, `chat:${updatedMessage.room_id}`, 'chat:messageEdited', updatedMessage);
    }
    
    res.json({
      success: true,
      data: updatedMessage,
    });
  });

  // Delete message
  deleteMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { messageId } = req.params;

    const deletedMessage = await this.chatService.deleteMessage(
      messageId,
      req.user?.id!,
      req.user?.role === 'admin'
    );

    // Emit deletion to room
    const io = req.app.get('io');
    if (io && deletedMessage) {
      emitToRoom(io, `chat:${deletedMessage.room_id}`, 'chat:messageDeleted', {
        messageId,
      });
    }
    
    logger.info(`Chat message ${messageId} deleted by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  });

  // Mark messages as read
  markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { messageIds } = req.body;

    await this.chatService.markMessagesAsRead(
      roomId,
      messageIds || [],
      req.user?.id!
    );
    
    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  });

  // Upload chat attachment
  uploadAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'File is required',
      });
      return;
    }

    const attachment = await this.chatService.uploadAttachment(
      req.file,
      req.user?.id!
    );
    
    res.json({
      success: true,
      data: attachment,
    });
  });

  // Get room participants
  getRoomParticipants = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    
    const participants = await this.chatService.getRoomParticipants(roomId);
    
    res.json({
      success: true,
      data: participants,
    });
  });

  // Add participant to room
  addParticipant = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    const participant = await this.chatService.addParticipant(
      roomId,
      userId,
      req.user?.id!
    );
    
    logger.info(`User ${userId} added to chat room ${roomId} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: participant,
    });
  });

  // Remove participant from room
  removeParticipant = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { roomId, userId } = req.params;

    await this.chatService.removeParticipant(
      roomId,
      userId,
      req.user?.id!
    );
    
    logger.info(`User ${userId} removed from chat room ${roomId} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Participant removed successfully',
    });
  });

  // Search messages
  searchMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { query, roomId, startDate, endDate } = req.query;

    if (!query) {
      res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
      return;
    }

    const results = await this.chatService.searchMessages({
      query: query as string,
      roomId: roomId as string,
      userId: req.user?.id!,
      companyId: req.user?.companyId!,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    
    res.json({
      success: true,
      data: results,
    });
  });

  // Get unread count
  getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const count = await this.chatService.getUnreadCount(req.user?.id!);
    
    res.json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  });

  // Create group chat
  createGroupChat = asyncHandler(async (req: AuthRequest, res: Response) => {
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
      created_by: req.user?.id!,
      participantIds,
    });
    
    logger.info(`Group chat "${name}" created by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: room,
    });
  });

  // Archive chat room
  archiveChatRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;

    await this.chatService.archiveChatRoom(roomId, req.user?.id!);
    
    logger.info(`Chat room ${roomId} archived by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Chat room archived successfully',
    });
  });

  // ============ NEW UNIVERSAL CHAT METHODS ============

  // Open or create universal chat with smart ID
  openChat = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { chatId } = req.body;

    if (!chatId) {
      res.status(400).json({
        success: false,
        error: 'Chat ID is required',
      });
      return;
    }

    const room = await this.universalChat.getOrCreateChat(chatId, req.user?.id!);
    const messages = await this.universalChat.getMessages(chatId);
    const participants = await this.universalChat.getParticipants(chatId);
    const relatedChats = await this.universalChat.getRelatedChats(chatId);

    logger.info(`Chat opened: ${chatId} by user: ${req.user?.email}`);

    res.json({
      success: true,
      data: {
        room,
        messages: messages.reverse(), // Oldest first for display
        participants,
        relatedChats,
        navigation: this.buildNavigation(chatId),
      },
    });
  });

  // Send message to universal chat
  sendUniversalMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { chatId } = req.params;
    const { message, type = 'text' } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    if (!message?.trim()) {
      res.status(400).json({
        success: false,
        error: 'Message content is required',
      });
      return;
    }

    const chatMessage = await this.universalChat.sendMessage(
      chatId,
      req.user?.id!,
      message,
      type
    );

    logger.info(`Message sent to ${chatId} by user: ${req.user?.email}`);

    res.status(201).json({
      success: true,
      data: chatMessage,
    });
  });

  // Get messages for universal chat
  getUniversalMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await this.universalChat.getMessages(chatId, limit, offset);

    res.json({
      success: true,
      data: messages.reverse(), // Oldest first for display
    });
  });

  // Navigate between chat contexts
  navigateChat = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { chatId, direction } = req.params;

    if (!['up', 'down', 'related'].includes(direction)) {
      res.status(400).json({
        success: false,
        error: 'Invalid direction. Must be: up, down, or related',
      });
      return;
    }

    const targets = await this.universalChat.navigateChat(
      chatId,
      direction as 'up' | 'down' | 'related'
    );

    res.json({
      success: true,
      data: {
        targets,
        direction,
        current: chatId,
      },
    });
  });

  // Mark messages as read
  markUniversalMessagesAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { chatId } = req.params;
    const { messageIds } = req.body;

    await this.universalChat.markMessagesAsRead(chatId, req.user?.id!, messageIds);

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  });

  // Get chat participants
  getUniversalParticipants = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { chatId } = req.params;

    const participants = await this.universalChat.getParticipants(chatId);

    res.json({
      success: true,
      data: participants,
    });
  });

  // Generate smart chat ID helper
  generateChatId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { type, level, ids } = req.body;

    if (!type || !ids) {
      res.status(400).json({
        success: false,
        error: 'Type and IDs are required',
      });
      return;
    }

    const chatId = this.universalChat.generateChatId({ type, level, ids });

    res.json({
      success: true,
      data: { chatId, type, level, ids },
    });
  });

  // Helper: Build navigation context
  private buildNavigation(chatId: string) {
    const context = this.universalChat.parseChatId(chatId);

    return {
      current: {
        id: chatId,
        type: context.type,
        level: context.level,
        description: this.getContextDescription(context),
      },
      breadcrumb: this.buildBreadcrumb(context),
      canGoUp: this.canNavigateUp(context),
      canGoDown: this.canNavigateDown(context),
    };
  }

  // Helper: Get context description
  private getContextDescription(context: any): string {
    switch (context.type) {
      case 'MTO':
        if (context.level === 'SP') return `MTO #${context.mtoId}`;
        if (context.level === 'DY') return `MTOs for ${context.date}`;
        if (context.level === 'MO') return `MTOs for ${context.month}`;
        if (context.level === 'YR') return `MTOs for ${context.year}`;
        break;
      case 'INV':
        return `Inventory: ${context.sku}`;
      case 'DEF':
        return `Defect: ${context.defectId}`;
      case 'SHIP':
        return `Shipment: ${context.carton}`;
      case 'PO':
        return `PO: ${context.poNumber}`;
    }
    return context.rawId;
  }

  // Helper: Build breadcrumb
  private buildBreadcrumb(context: any): string[] {
    const breadcrumb = [context.type];

    switch (context.type) {
      case 'MTO':
        if (context.level === 'SP') {
          breadcrumb.push('Specific', `#${context.mtoId}`);
        } else if (context.level === 'DY') {
          breadcrumb.push('Daily', context.date);
        } else if (context.level === 'MO') {
          breadcrumb.push('Monthly', context.month);
        } else if (context.level === 'YR') {
          breadcrumb.push('Yearly', context.year);
        }
        break;
      case 'INV':
        breadcrumb.push('Item', context.sku);
        break;
      case 'DEF':
        breadcrumb.push('Defect', context.defectId);
        break;
      case 'SHIP':
        breadcrumb.push('Carton', context.carton);
        break;
      case 'PO':
        breadcrumb.push('Order', context.poNumber);
        break;
    }

    return breadcrumb;
  }

  // Helper: Check if can navigate up
  private canNavigateUp(context: any): boolean {
    return (
      (context.type === 'MTO' && context.level === 'SP') || // Specific → Day
      (context.type === 'MTO' && context.level === 'DY') || // Day → Month
      (context.type === 'MTO' && context.level === 'MO')    // Month → Year
    );
  }

  // Helper: Check if can navigate down
  private canNavigateDown(context: any): boolean {
    return (
      (context.type === 'MTO' && context.level === 'YR') || // Year → Month
      (context.type === 'MTO' && context.level === 'MO') || // Month → Day
      (context.type === 'MTO' && context.level === 'DY')    // Day → Specific
    );
  }
}

export default new ChatController();