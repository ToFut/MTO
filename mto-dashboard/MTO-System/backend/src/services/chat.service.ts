import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';

export class ChatService {
  private supabase = getSupabase();
  private io: any; // Socket.io instance

  constructor(io?: any) {
    this.io = io;
  }

  setSocketIO(io: any) {
    this.io = io;
  }

  async getChatRooms(userId: string, companyId: string, filters: any) {
    try {
      let query = this.supabase.from('chat_rooms').select('*', { count: 'exact' });
      
      if (filters.roomType) query = query.eq('room_type', filters.roomType);
      if (filters.mtoId) query = query.eq('mto_id', filters.mtoId);
      
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
      const { data, error, count } = await query;
      
      if (error) throw new AppError(error.message, 400);
      return { data: data || [], total: count || 0 };
    } catch (error: any) {
      logger.error('Error fetching chat rooms:', error);
      throw error;
    }
  }

  async getOrCreateMTOChatRoom(mtoId: string) {
    const { data: existing } = await this.supabase.from('chat_rooms').select('*').eq('mto_id', mtoId).single();
    
    if (existing) return existing;
    
    const { data } = await this.supabase.from('chat_rooms').insert({
      room_type: 'mto',
      mto_id: mtoId,
      room_name: `MTO Chat - ${mtoId}`,
      is_active: true
    }).select().single();
    
    return data;
  }

  async getChatMessages(roomId: string, limit: number, offset: number) {
    const { data } = await this.supabase
      .from('chat_messages')
      .select('*, user:users(full_name, email)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    return data || [];
  }

  async sendMessage(messageData: any) {
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
      
      logger.info(`Real-time message sent to room ${messageData.room_id}`);
    }
    
    return data;
  }

  async editMessage(messageId: string, message: string, userId: string) {
    const { data } = await this.supabase
      .from('chat_messages')
      .update({ message, edited_at: new Date() })
      .eq('id', messageId)
      .eq('user_id', userId)
      .select()
      .single();
    return data;
  }

  async deleteMessage(messageId: string, userId: string, isAdmin: boolean) {
    const query = this.supabase.from('chat_messages').delete().eq('id', messageId);
    if (!isAdmin) query.eq('user_id', userId);
    
    const { data } = await query.select().single();
    return data;
  }

  async markMessagesAsRead(roomId: string, messageIds: string[], userId: string) {
    if (messageIds.length > 0) {
      await this.supabase.from('message_reads').insert(
        messageIds.map(id => ({ message_id: id, user_id: userId }))
      );
    }
    return true;
  }

  async uploadAttachment(file: any, userId: string) {
    return { url: '/uploads/' + file.filename, filename: file.originalname };
  }

  async getRoomParticipants(roomId: string) {
    const { data } = await this.supabase.from('chat_participants').select('*, user:users(*)').eq('room_id', roomId);
    return data || [];
  }

  async addParticipant(roomId: string, userId: string, addedBy: string) {
    const { data } = await this.supabase.from('chat_participants').insert({ room_id: roomId, user_id: userId }).select().single();
    return data;
  }

  async removeParticipant(roomId: string, userId: string, removedBy: string) {
    await this.supabase.from('chat_participants').delete().eq('room_id', roomId).eq('user_id', userId);
    return true;
  }

  async searchMessages(filters: any) {
    const { data } = await this.supabase.from('chat_messages').select('*').ilike('message', `%${filters.query}%`);
    return data || [];
  }

  async getUnreadCount(userId: string) {
    return 0;
  }

  async createGroupChat(chatData: any) {
    const { data } = await this.supabase.from('chat_rooms').insert(chatData).select().single();
    return data;
  }

  async archiveChatRoom(roomId: string, userId: string) {
    await this.supabase.from('chat_rooms').update({ is_active: false }).eq('id', roomId);
    return true;
  }
}
