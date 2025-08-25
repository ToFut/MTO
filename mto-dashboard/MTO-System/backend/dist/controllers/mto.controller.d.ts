import { Request, Response } from 'express';
export declare class MTOController {
    private mtoService;
    constructor();
    getMTOs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMTO: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createMTO: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateMTO: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateMTOStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateProductionStage: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteMTO: (req: Request, res: Response, next: import("express").NextFunction) => void;
    uploadMTOs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    previewMTOs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    smartUploadMTOs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    bulkUploadMTOs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMTOStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMTOTimeline: (req: Request, res: Response, next: import("express").NextFunction) => void;
    exportMTOs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getUploadHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: MTOController;
export default _default;
//# sourceMappingURL=mto.controller.d.ts.map