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
export declare class UniversalChatService {
    private supabase;
    private io;
    constructor(io?: any);
    setSocketIO(io: any): void;
    /**
     * Generate smart chat ID based on context
     */
    generateChatId(params: {
        type: string;
        level?: string;
        ids: Record<string, any>;
    }): string;
    /**
     * Parse chat ID to understand context
     */
    parseChatId(chatId: string): ChatContext;
    /**
     * Universal method to get or create ANY chat
     */
    getOrCreateChat(chatId: string, userId?: string): Promise<ChatRoom>;
    /**
     * Build metadata based on chat context
     */
    buildMetadata(context: ChatContext): Promise<any>;
    /**
     * Smart auto-subscription based on chat ID
     */
    autoSubscribe(chatId: string, context: ChatContext, currentUserId: string): Promise<void>;
    /**
     * Send a message to a chat
     */
    sendMessage(chatId: string, userId: string, content: string, type?: string): Promise<any>;
    /**
     * Send system message
     */
    sendSystemMessage(chatId: string, content: string): Promise<void>;
    /**
     * Get messages for a chat
     */
    getMessages(chatId: string, limit?: number, offset?: number): Promise<any[]>;
    /**
     * Get related chats based on current chat ID
     */
    getRelatedChats(chatId: string): Promise<string[]>;
    /**
     * Navigate between chat contexts
     */
    navigateChat(currentChatId: string, direction: 'up' | 'down' | 'related'): Promise<string[]>;
    /**
     * Mark messages as read
     */
    markMessagesAsRead(chatId: string, userId: string, messageIds?: string[]): Promise<void>;
    /**
     * Get participants for a chat
     */
    getParticipants(chatId: string): Promise<any[]>;
    /**
     * Helper: Get status breakdown for MTOs
     */
    private getStatusBreakdown;
    /**
     * Generate welcome message based on context
     */
    private generateWelcomeMessage;
}
export default UniversalChatService;
//# sourceMappingURL=universal-chat.service.d.ts.map