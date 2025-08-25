import { Request, Response } from 'express';
export declare class DefectController {
    private defectService;
    constructor();
    getDefects: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getDefect: (req: Request, res: Response, next: import("express").NextFunction) => void;
    reportDefect: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateDefectStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createReplacementMTO: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateDefect: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteDefect: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getDefectQueue: (req: Request, res: Response, next: import("express").NextFunction) => void;
    assignDefect: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getDefectStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getDefectTimeline: (req: Request, res: Response, next: import("express").NextFunction) => void;
    uploadQCPhotos: (req: Request, res: Response, next: import("express").NextFunction) => void;
    exportDefectsReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAQLReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: DefectController;
export default _default;
//# sourceMappingURL=defect.controller.d.ts.map