import { Server as SocketIOServer } from 'socket.io';
export declare const configureSocket: (io: SocketIOServer) => void;
export declare const emitToRoom: (io: SocketIOServer, room: string, event: string, data: any) => void;
export declare const emitToUser: (io: SocketIOServer, userId: string, event: string, data: any) => void;
export declare const emitToCompany: (io: SocketIOServer, companyId: string, event: string, data: any) => void;
//# sourceMappingURL=socket.d.ts.map