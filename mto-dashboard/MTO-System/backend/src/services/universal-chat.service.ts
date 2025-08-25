import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';

interface ChatContext {
  type: string;
  level?: string;
  rawId: string;
  mtoId?: string;
  date?: string;
  month?: string;
  year?: string;
  sku?: string;
  defectId?: string;
  linkedMtoId?: string;
  carton?: string;
  tracking?: string;
  poNumber?: string;
}

interface ChatRoom {
  id: string;
  chat_id: string;
  chat_type: string;
  chat_level?: string;
  metadata: any;
  participant_count: number;
  message_count: number;
  last_activity: Date;
  created_at: Date;
}

export class UniversalChatService {
  private supabase = getSupabase();
  private io: any; // Socket.io instance

  constructor(io?: any) {
    this.io = io;
  }

  setSocketIO(io: any) {
    this.io = io;
  }

  /**
   * Generate smart chat ID based on context
   */
  generateChatId(params: {
    type: string;
    level?: string;
    ids: Record<string, any>;
  }): string {
    const parts = [params.type.toUpperCase()];

    if (params.level) {
      parts.push(params.level.toUpperCase());
    }

    // Build ID based on type
    switch (params.type.toUpperCase()) {
      case 'MTO':
        if (params.level === 'SP') {
          parts.push(params.ids.mtoId || params.ids.internalId);
        } else if (params.level === 'DY') {
          const date = params.ids.date.replace(/-/g, '_');
          parts.push(...date.split('_'));
        } else if (params.level === 'MO') {
          const month = params.ids.month.replace(/-/g, '_');
          parts.push(...month.split('_'));
        } else if (params.level === 'YR') {
          parts.push(params.ids.year);
        }
        break;

      case 'INV':
        parts.push(params.ids.sku);
        break;

      case 'DEF':
        parts.push(params.ids.defectId);
        if (params.ids.mtoId) {
          parts.push('MTO', params.ids.mtoId);
        }
        break;

      case 'SHIP':
        parts.push(params.ids.carton);
        if (params.ids.tracking) {
          parts.push(params.ids.tracking);
        }
        break;

      case 'PO':
        parts.push(params.ids.poNumber.replace(/[^A-Z0-9]/gi, ''));
        break;
    }

    return parts.join('_');
  }

  /**
   * Parse chat ID to understand context
   */
  parseChatId(chatId: string): ChatContext {
    const parts = chatId.split('_');
    const type = parts[0];

    const context: ChatContext = {
      type,
      level: parts[1],
      rawId: chatId,
    };

    // Extract specific identifiers based on type
    switch (type) {
      case 'MTO':
        if (parts[1] === 'SP') {
          context.mtoId = parts.slice(2).join('_');
        } else if (parts[1] === 'DY') {
          context.date = `${parts[2]}-${parts[3]}-${parts[4]}`;
        } else if (parts[1] === 'MO') {
          context.month = `${parts[2]}-${parts[3]}`;
        } else if (parts[1] === 'YR') {
          context.year = parts[2];
        }
        break;

      case 'INV':
        context.sku = parts.slice(1).join('_');
        break;

      case 'DEF':
        context.defectId = parts[1];
        const mtoIndex = parts.indexOf('MTO');
        if (mtoIndex > -1) {
          context.linkedMtoId = parts.slice(mtoIndex + 1).join('_');
        }
        break;

      case 'SHIP':
        context.carton = parts[1];
        if (parts[2]) {
          context.tracking = parts.slice(2).join('_');
        }
        break;

      case 'PO':
        context.poNumber = parts.slice(1).join('_');
        break;
    }

    return context;
  }

  /**
   * Universal method to get or create ANY chat
   */
  async getOrCreateChat(chatId: string, userId?: string): Promise<ChatRoom> {
    try {
      // 1. Try to get existing room
      let { data: room, error } = await this.supabase
        .from('chat_rooms')
        .select('*')
        .eq('chat_id', chatId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw new AppError(`Failed to fetch chat room: ${error.message}`, 400);
      }

      if (!room) {
        // 2. Parse context from ID
        const context = this.parseChatId(chatId);

        // 3. Build metadata based on context
        const metadata = await this.buildMetadata(context);

        // 4. Create new room
        const { data: newRoom, error: createError } = await this.supabase
          .from('chat_rooms')
          .insert({
            chat_id: chatId,
            metadata,
            last_activity: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          throw new AppError(`Failed to create chat room: ${createError.message}`, 400);
        }

        room = newRoom;

        // 5. Auto-subscribe relevant users
        if (userId) {
          await this.autoSubscribe(chatId, context, userId);
        }

        // 6. Send initial context message
        await this.sendSystemMessage(
          chatId,
          this.generateWelcomeMessage(context, metadata)
        );

        logger.info(`Created new chat room: ${chatId}`);
      }

      return room;
    } catch (error: any) {
      logger.error('Error in getOrCreateChat:', error);
      throw error;
    }
  }

  /**
   * Build metadata based on chat context
   */
  async buildMetadata(context: ChatContext): Promise<any> {
    const metadata: any = {
      type: context.type,
      level: context.level,
      created_from: context,
      description: '',
    };

    try {
      // Fetch relevant data based on type
      switch (context.type) {
        case 'MTO':
          if (context.mtoId) {
            // Specific MTO
            const { data: mto } = await this.supabase
              .from('mtos')
              .select('*, purchase_orders(po_number)')
              .eq('id', context.mtoId)
              .single();

            if (mto) {
              metadata.mto = {
                id: mto.id,
                internal_id: mto.internal_id,
                line: mto.line_id,
                product: mto.display_name || mto.sku,
                status: mto.status,
                quantity: mto.quantity,
                po_number: mto.purchase_orders?.po_number,
              };
              metadata.description = `MTO #${mto.line_id || mto.internal_id} - ${mto.display_name || mto.sku}`;
            }
          } else if (context.date) {
            // Day level
            const { data: mtos, count } = await this.supabase
              .from('mtos')
              .select('*', { count: 'exact', head: false })
              .gte('created_at', `${context.date}T00:00:00`)
              .lt('created_at', `${context.date}T23:59:59`);

            metadata.day = {
              date: context.date,
              mto_count: count || 0,
              status_breakdown: this.getStatusBreakdown(mtos || []),
            };
            metadata.description = `All MTOs for ${context.date} (${count} items)`;
          } else if (context.month) {
            // Month level
            const startDate = `${context.month}-01`;
            const endDate = new Date(context.month + '-01');
            endDate.setMonth(endDate.getMonth() + 1);

            const { data: mtos, count } = await this.supabase
              .from('mtos')
              .select('*', { count: 'exact', head: false })
              .gte('created_at', startDate)
              .lt('created_at', endDate.toISOString().split('T')[0]);

            metadata.month = {
              month: context.month,
              mto_count: count || 0,
              status_breakdown: this.getStatusBreakdown(mtos || []),
            };
            metadata.description = `Monthly overview for ${context.month} (${count} MTOs)`;
          }
          break;

        case 'INV':
          const { data: item } = await this.supabase
            .from('inventory')
            .select('*')
            .eq('sku', context.sku)
            .single();

          if (item) {
            metadata.inventory = {
              id: item.id,
              sku: item.sku,
              name: item.name,
              stock: item.quantity_available,
              reorder_point: item.reorder_point,
              status: item.quantity_available < item.reorder_point ? 'low_stock' : 'in_stock',
            };
            metadata.description = `Inventory: ${item.name} (SKU: ${item.sku})`;
          }
          break;

        case 'DEF':
          const { data: defect } = await this.supabase
            .from('defects')
            .select('*, mtos(display_name, sku)')
            .eq('id', context.defectId)
            .single();

          if (defect) {
            metadata.defect = {
              id: defect.id,
              reference: defect.reference_number,
              severity: defect.severity,
              category: defect.category,
              status: defect.status,
              mto_reference: defect.mtos?.display_name || defect.mtos?.sku,
            };
            metadata.description = `Defect ${defect.reference_number} - ${defect.category} (${defect.severity})`;
          }
          break;

        case 'SHIP':
          const { data: shipment } = await this.supabase
            .from('shipments')
            .select('*')
            .or(`master_carton.eq.${context.carton},tracking_number.eq.${context.tracking}`)
            .single();

          if (shipment) {
            metadata.shipment = {
              id: shipment.id,
              carton: shipment.master_carton,
              tracking: shipment.tracking_number,
              carrier: shipment.carrier,
              status: shipment.status,
              eta: shipment.estimated_arrival,
            };
            metadata.description = `Shipment ${context.carton} - ${shipment.carrier} (${shipment.status})`;
          }
          break;

        case 'PO':
          const { data: po } = await this.supabase
            .from('purchase_orders')
            .select('*, mtos(count)')
            .eq('po_number', context.poNumber)
            .single();

          if (po) {
            metadata.po = {
              id: po.id,
              po_number: po.po_number,
              total_mtos: po.mtos?.length || 0,
              upload_date: po.created_at,
              status: po.status,
            };
            metadata.description = `Purchase Order ${po.po_number}`;
          }
          break;
      }
    } catch (error: any) {
      logger.error('Error building metadata:', error);
      // Continue with basic metadata even if fetch fails
    }

    return metadata;
  }

  /**
   * Smart auto-subscription based on chat ID
   */
  async autoSubscribe(chatId: string, context: ChatContext, currentUserId: string): Promise<void> {
    const users = new Set<string>();
    users.add(currentUserId); // Always add the user who opened the chat

    try {
      // Determine who should be subscribed based on context
      switch (context.type) {
        case 'MTO':
          if (context.mtoId) {
            // Specific MTO - subscribe direct stakeholders
            const { data: mto } = await this.supabase
              .from('mtos')
              .select('brand_user_id, factory_assignee_id')
              .eq('id', context.mtoId)
              .single();

            if (mto) {
              if (mto.brand_user_id) users.add(mto.brand_user_id);
              if (mto.factory_assignee_id) users.add(mto.factory_assignee_id);
            }
          } else if (context.date) {
            // Day level - subscribe production managers
            const { data: managers } = await this.supabase
              .from('users')
              .select('id')
              .in('role', ['production_manager', 'supervisor']);

            managers?.forEach(m => users.add(m.id));
          } else if (context.month) {
            // Month level - subscribe executives
            const { data: executives } = await this.supabase
              .from('users')
              .select('id')
              .in('role', ['manager', 'executive']);

            executives?.forEach(e => users.add(e.id));
          }
          break;

        case 'INV':
          // Subscribe warehouse team
          const { data: warehouseTeam } = await this.supabase
            .from('users')
            .select('id')
            .eq('department', 'warehouse');

          warehouseTeam?.forEach(u => users.add(u.id));
          break;

        case 'DEF':
          // Subscribe QC team
          const { data: qcTeam } = await this.supabase
            .from('users')
            .select('id')
            .eq('department', 'quality_control');

          qcTeam?.forEach(u => users.add(u.id));
          break;

        case 'SHIP':
          // Subscribe logistics team
          const { data: logisticsTeam } = await this.supabase
            .from('users')
            .select('id')
            .eq('department', 'logistics');

          logisticsTeam?.forEach(u => users.add(u.id));
          break;

        case 'PO':
          // Subscribe PO stakeholders
          const { data: po } = await this.supabase
            .from('purchase_orders')
            .select('brand_buyer_id, factory_manager_id')
            .eq('po_number', context.poNumber)
            .single();

          if (po) {
            if (po.brand_buyer_id) users.add(po.brand_buyer_id);
            if (po.factory_manager_id) users.add(po.factory_manager_id);
          }
          break;
      }

      // Subscribe all identified users
      const subscriptions = Array.from(users).map(userId => ({
        chat_id: chatId,
        user_id: userId,
        role: userId === currentUserId ? 'member' : 'member',
        notifications_enabled: true,
      }));

      if (subscriptions.length > 0) {
        await this.supabase
          .from('chat_participants')
          .upsert(subscriptions, { onConflict: 'chat_id,user_id' });
      }

      logger.info(`Auto-subscribed ${subscriptions.length} users to chat ${chatId}`);
    } catch (error: any) {
      logger.error('Error in autoSubscribe:', error);
      // Continue even if auto-subscribe fails
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: string, userId: string, content: string, type: string = 'text'): Promise<any> {
    try {
      const { data: message, error } = await this.supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: userId,
          message: content,
          message_type: type,
        })
        .select('*, sender:sender_id(id, full_name, email)')
        .single();

      if (error) {
        throw new AppError(`Failed to send message: ${error.message}`, 400);
      }

      // Emit via Socket.IO if available
      if (this.io && message) {
        this.io.to(`chat:${chatId}`).emit('message:new', {
          ...message,
          chat_id: chatId,
        });
      }

      return message;
    } catch (error: any) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send system message
   */
  async sendSystemMessage(chatId: string, content: string): Promise<void> {
    try {
      // Get system user or use a default system ID
      const systemUserId = '00000000-0000-0000-0000-000000000000';

      await this.supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: systemUserId,
          message: content,
          message_type: 'system',
        });
    } catch (error: any) {
      logger.error('Error sending system message:', error);
      // Don't throw - system messages are not critical
    }
  }

  /**
   * Get messages for a chat
   */
  async getMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const { data: messages, error } = await this.supabase
        .from('chat_messages')
        .select(`
          *,
          sender:sender_id(id, full_name, email)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new AppError(`Failed to fetch messages: ${error.message}`, 400);
      }

      return messages || [];
    } catch (error: any) {
      logger.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Get related chats based on current chat ID
   */
  async getRelatedChats(chatId: string): Promise<string[]> {
    const context = this.parseChatId(chatId);
    const related: string[] = [];

    try {
      // Find hierarchical relationships
      if (context.type === 'MTO') {
        if (context.mtoId) {
          // Specific MTO - get day and month chats
          const { data: mto } = await this.supabase
            .from('mtos')
            .select('created_at')
            .eq('id', context.mtoId)
            .single();

          if (mto) {
            const date = new Date(mto.created_at);
            const dateStr = date.toISOString().split('T')[0];
            const monthStr = dateStr.substring(0, 7);

            related.push(`MTO_DY_${dateStr.replace(/-/g, '_')}`);
            related.push(`MTO_MO_${monthStr.replace(/-/g, '_')}`);
          }

          // Get related defects
          const { data: defects } = await this.supabase
            .from('defects')
            .select('id')
            .eq('mto_id', context.mtoId);

          defects?.forEach(d => related.push(`DEF_${d.id}_MTO_${context.mtoId}`));
        } else if (context.date) {
          // Day level - get month and specific MTOs
          const monthStr = context.date.substring(0, 7);
          related.push(`MTO_MO_${monthStr.replace(/-/g, '_')}`);

          const { data: dayMTOs } = await this.supabase
            .from('mtos')
            .select('id')
            .gte('created_at', `${context.date}T00:00:00`)
            .lt('created_at', `${context.date}T23:59:59`);

          dayMTOs?.forEach(mto => related.push(`MTO_SP_${mto.id}`));
        } else if (context.month) {
          // Month level - get days
          const startDate = new Date(context.month + '-01');
          const endDate = new Date(context.month + '-01');
          endDate.setMonth(endDate.getMonth() + 1);

          const { data: mtos } = await this.supabase
            .from('mtos')
            .select('created_at')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString());

          const uniqueDays = new Set<string>();
          mtos?.forEach(mto => {
            const day = new Date(mto.created_at).toISOString().split('T')[0];
            uniqueDays.add(`MTO_DY_${day.replace(/-/g, '_')}`);
          });

          related.push(...Array.from(uniqueDays));
        }
      }
    } catch (error: any) {
      logger.error('Error getting related chats:', error);
    }

    return related;
  }

  /**
   * Navigate between chat contexts
   */
  async navigateChat(currentChatId: string, direction: 'up' | 'down' | 'related'): Promise<string[]> {
    const context = this.parseChatId(currentChatId);
    const targets: string[] = [];

    try {
      if (direction === 'up') {
        // Go to parent context
        if (context.type === 'MTO' && context.mtoId) {
          // Specific → Day
          const { data: mto } = await this.supabase
            .from('mtos')
            .select('created_at')
            .eq('id', context.mtoId)
            .single();

          if (mto) {
            const date = new Date(mto.created_at).toISOString().split('T')[0];
            targets.push(`MTO_DY_${date.replace(/-/g, '_')}`);
          }
        } else if (context.type === 'MTO' && context.date) {
          // Day → Month
          const monthStr = context.date.substring(0, 7);
          targets.push(`MTO_MO_${monthStr.replace(/-/g, '_')}`);
        } else if (context.type === 'MTO' && context.month) {
          // Month → Year
          const year = context.month.substring(0, 4);
          targets.push(`MTO_YR_${year}`);
        }
      } else if (direction === 'down') {
        // Go to child contexts
        if (context.type === 'MTO' && context.month) {
          // Month → Days
          const startDate = new Date(context.month + '-01');
          const endDate = new Date(context.month + '-01');
          endDate.setMonth(endDate.getMonth() + 1);

          const { data: mtos } = await this.supabase
            .from('mtos')
            .select('created_at')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString());

          const uniqueDays = new Set<string>();
          mtos?.forEach(mto => {
            const day = new Date(mto.created_at).toISOString().split('T')[0];
            uniqueDays.add(`MTO_DY_${day.replace(/-/g, '_')}`);
          });

          targets.push(...Array.from(uniqueDays));
        } else if (context.type === 'MTO' && context.date) {
          // Day → Specific MTOs
          const { data: mtos } = await this.supabase
            .from('mtos')
            .select('id')
            .gte('created_at', `${context.date}T00:00:00`)
            .lt('created_at', `${context.date}T23:59:59`);

          mtos?.forEach(mto => targets.push(`MTO_SP_${mto.id}`));
        }
      } else {
        // Get related contexts
        targets.push(...(await this.getRelatedChats(currentChatId)));
      }
    } catch (error: any) {
      logger.error('Error navigating chat:', error);
    }

    return targets;
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, userId: string, messageIds?: string[]): Promise<void> {
    try {
      // Update last read in participants
      await this.supabase
        .from('chat_participants')
        .update({
          last_read_at: new Date().toISOString(),
          unread_count: 0,
        })
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      // Add read receipts if specific messages provided
      if (messageIds && messageIds.length > 0) {
        const receipts = messageIds.map(messageId => ({
          message_id: messageId,
          user_id: userId,
        }));

        await this.supabase
          .from('message_read_receipts')
          .upsert(receipts, { onConflict: 'message_id,user_id' });
      }
    } catch (error: any) {
      logger.error('Error marking messages as read:', error);
    }
  }

  /**
   * Get participants for a chat
   */
  async getParticipants(chatId: string): Promise<any[]> {
    try {
      const { data: participants } = await this.supabase
        .from('chat_participants')
        .select('*, user:user_id(id, full_name, email, role)')
        .eq('chat_id', chatId)
        .eq('is_active', true);

      return participants || [];
    } catch (error: any) {
      logger.error('Error fetching participants:', error);
      return [];
    }
  }

  /**
   * Helper: Get status breakdown for MTOs
   */
  private getStatusBreakdown(mtos: any[]): any {
    const breakdown: any = {
      total: mtos.length,
      pending: 0,
      proceed: 0,
      qc: 0,
      shipping: 0,
      shipped: 0,
    };

    mtos.forEach(mto => {
      if (breakdown[mto.status] !== undefined) {
        breakdown[mto.status]++;
      }
    });

    return breakdown;
  }

  /**
   * Generate welcome message based on context
   */
  private generateWelcomeMessage(context: ChatContext, metadata: any): string {
    let message = '🎉 Chat room created!\n\n';

    switch (context.type) {
      case 'MTO':
        if (context.level === 'SP') {
          message += `📦 **MTO Discussion**\n`;
          message += `• Product: ${metadata.mto?.product || 'N/A'}\n`;
          message += `• Quantity: ${metadata.mto?.quantity || 0}\n`;
          message += `• Status: ${metadata.mto?.status || 'Unknown'}\n`;
          message += `• PO: ${metadata.mto?.po_number || 'N/A'}`;
        } else if (context.level === 'DY') {
          message += `📅 **Daily MTO Overview**\n`;
          message += `• Date: ${context.date}\n`;
          message += `• Total MTOs: ${metadata.day?.mto_count || 0}\n`;
          message += `• Status: ${JSON.stringify(metadata.day?.status_breakdown || {})}`;
        } else if (context.level === 'MO') {
          message += `📆 **Monthly MTO Summary**\n`;
          message += `• Month: ${context.month}\n`;
          message += `• Total MTOs: ${metadata.month?.mto_count || 0}`;
        }
        break;

      case 'INV':
        message += `📦 **Inventory Item Discussion**\n`;
        message += `• Item: ${metadata.inventory?.name || 'Unknown'}\n`;
        message += `• SKU: ${context.sku}\n`;
        message += `• Stock: ${metadata.inventory?.stock || 0} units\n`;
        message += `• Status: ${metadata.inventory?.status || 'Unknown'}`;
        break;

      case 'DEF':
        message += `⚠️ **Defect Resolution Chat**\n`;
        message += `• Defect: ${metadata.defect?.reference || context.defectId}\n`;
        message += `• Severity: ${metadata.defect?.severity || 'Unknown'}\n`;
        message += `• Category: ${metadata.defect?.category || 'Unknown'}\n`;
        message += `• Status: ${metadata.defect?.status || 'Open'}`;
        break;

      case 'SHIP':
        message += `🚚 **Shipping Coordination**\n`;
        message += `• Carton: ${context.carton}\n`;
        message += `• Tracking: ${context.tracking || 'N/A'}\n`;
        message += `• Status: ${metadata.shipment?.status || 'Unknown'}`;
        break;

      case 'PO':
        message += `📋 **Purchase Order Discussion**\n`;
        message += `• PO Number: ${context.poNumber}\n`;
        message += `• Total MTOs: ${metadata.po?.total_mtos || 0}`;
        break;

      default:
        message += `Chat for ${context.type}`;
    }

    return message;
  }
}

export default UniversalChatService;