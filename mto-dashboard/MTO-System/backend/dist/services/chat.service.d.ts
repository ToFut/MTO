export declare class ChatService {
    private supabase;
    private io;
    constructor(io?: any);
    setSocketIO(io: any): void;
    getChatRooms(userId: string, companyId: string, filters: any): Promise<{
        data: any[];
        total: number;
    }>;
    getOrCreateMTOChatRoom(mtoId: string): Promise<any>;
    getChatMessages(roomId: string, limit: number, offset: number): Promise<any[]>;
    sendMessage(messageData: any): Promise<any>;
    editMessage(messageId: string, message: string, userId: string): Promise<any>;
    deleteMessage(messageId: string, userId: string, isAdmin: boolean): Promise<any>;
    markMessagesAsRead(roomId: string, messageIds: string[], userId: string): Promise<boolean>;
    uploadAttachment(file: any, userId: string): Promise<{
        url: string;
        filename: any;
    }>;
    getRoomParticipants(roomId: string): Promise<any[]>;
    addParticipant(roomId: string, userId: string, addedBy: string): Promise<any>;
    removeParticipant(roomId: string, userId: string, removedBy: string): Promise<boolean>;
    searchMessages(filters: any): Promise<any[]>;
    getUnreadCount(userId: string): Promise<number>;
    createGroupChat(chatData: any): Promise<any>;
    archiveChatRoom(roomId: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=chat.service.d.ts.map