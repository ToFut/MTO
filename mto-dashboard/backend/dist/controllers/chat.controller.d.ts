import { Request, Response } from 'express';
export declare class ChatController {
    private chatService;
    constructor();
    getChatRooms: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMTOChatRoom: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getChatMessages: (req: Request, res: Response, next: import("express").NextFunction) => void;
    sendMessage: (req: Request, res: Response, next: import("express").NextFunction) => void;
    editMessage: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteMessage: (req: Request, res: Response, next: import("express").NextFunction) => void;
    markAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
    uploadAttachment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getRoomParticipants: (req: Request, res: Response, next: import("express").NextFunction) => void;
    addParticipant: (req: Request, res: Response, next: import("express").NextFunction) => void;
    removeParticipant: (req: Request, res: Response, next: import("express").NextFunction) => void;
    searchMessages: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getUnreadCount: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createGroupChat: (req: Request, res: Response, next: import("express").NextFunction) => void;
    archiveChatRoom: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: ChatController;
export default _default;
//# sourceMappingURL=chat.controller.d.ts.map