"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../config/logger");
const error_middleware_1 = require("../middleware/error.middleware");
class ChatService {
    constructor(io) {
        this.supabase = (0, supabase_1.getSupabase)();
        this.io = io;
    }
    setSocketIO(io) {
        this.io = io;
    }
    async getChatRooms(userId, companyId, filters) {
        try {
            let query = this.supabase.from('chat_rooms').select('*', { count: 'exact' });
            if (filters.roomType)
                query = query.eq('room_type', filters.roomType);
            if (filters.mtoId)
                query = query.eq('mto_id', filters.mtoId);
            query = query.range(filters.offset, filters.offset + filters.limit - 1);
            const { data, error, count } = await query;
            if (error)
                throw new error_middleware_1.AppError(error.message, 400);
            return { data: data || [], total: count || 0 };
        }
        catch (error) {
            logger_1.logger.error('Error fetching chat rooms:', error);
            throw error;
        }
    }
    async getOrCreateMTOChatRoom(mtoId) {
        const { data: existing } = await this.supabase.from('chat_rooms').select('*').eq('mto_id', mtoId).single();
        if (existing)
            return existing;
        const { data } = await this.supabase.from('chat_rooms').insert({
            room_type: 'mto',
            mto_id: mtoId,
            room_name: `MTO Chat - ${mtoId}`,
            is_active: true
        }).select().single();
        return data;
    }
    async getChatMessages(roomId, limit, offset) {
        const { data } = await this.supabase
            .from('chat_messages')
            .select('*, user:users(full_name, email)')
            .eq('room_id', roomId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        return data || [];
    }
    async sendMessage(messageData) {
        const { data } = await this.supabase.from('chat_messages').insert(messageData).select().single();
        // Emit real-time message if socket.io is available
        if (this.io && data) {
            this.io.to(`room_${messageData.room_id}`).emit('new_message', {
                id: data.id,
                message: data.message,
                user_id: data.user_id,
                room_id: data.room_id,
                message_type: data.message_type,
                created_at: data.created_at,
                attachments: data.attachments
            });
            logger_1.logger.info(`Real-time message sent to room ${messageData.room_id}`);
        }
        return data;
    }
    async editMessage(messageId, message, userId) {
        const { data } = await this.supabase
            .from('chat_messages')
            .update({ message, edited_at: new Date() })
            .eq('id', messageId)
            .eq('user_id', userId)
            .select()
            .single();
        return data;
    }
    async deleteMessage(messageId, userId, isAdmin) {
        const query = this.supabase.from('chat_messages').delete().eq('id', messageId);
        if (!isAdmin)
            query.eq('user_id', userId);
        const { data } = await query.select().single();
        return data;
    }
    async markMessagesAsRead(roomId, messageIds, userId) {
        if (messageIds.length > 0) {
            await this.supabase.from('message_reads').insert(messageIds.map(id => ({ message_id: id, user_id: userId })));
        }
        return true;
    }
    async uploadAttachment(file, userId) {
        return { url: '/uploads/' + file.filename, filename: file.originalname };
    }
    async getRoomParticipants(roomId) {
        const { data } = await this.supabase.from('chat_participants').select('*, user:users(*)').eq('room_id', roomId);
        return data || [];
    }
    async addParticipant(roomId, userId, addedBy) {
        const { data } = await this.supabase.from('chat_participants').insert({ room_id: roomId, user_id: userId }).select().single();
        return data;
    }
    async removeParticipant(roomId, userId, removedBy) {
        await this.supabase.from('chat_participants').delete().eq('room_id', roomId).eq('user_id', userId);
        return true;
    }
    async searchMessages(filters) {
        const { data } = await this.supabase.from('chat_messages').select('*').ilike('message', `%${filters.query}%`);
        return data || [];
    }
    async getUnreadCount(userId) {
        return 0;
    }
    async createGroupChat(chatData) {
        const { data } = await this.supabase.from('chat_rooms').insert(chatData).select().single();
        return data;
    }
    async archiveChatRoom(roomId, userId) {
        await this.supabase.from('chat_rooms').update({ is_active: false }).eq('id', roomId);
        return true;
    }
}
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map