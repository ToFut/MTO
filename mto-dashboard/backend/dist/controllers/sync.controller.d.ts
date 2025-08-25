import { Request, Response } from 'express';
export declare class SyncController {
    private syncService;
    constructor();
    getSyncStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    syncWithNetSuite: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSyncHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSyncErrors: (req: Request, res: Response, next: import("express").NextFunction) => void;
    retrySync: (req: Request, res: Response, next: import("express").NextFunction) => void;
    configureSyncSettings: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSyncMappings: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateSyncMapping: (req: Request, res: Response, next: import("express").NextFunction) => void;
    testConnection: (req: Request, res: Response, next: import("express").NextFunction) => void;
    scheduleSync: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getScheduledSyncs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteScheduledSync: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSyncStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    exportSyncReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: SyncController;
export default _default;
//# sourceMappingURL=sync.controller.d.ts.map