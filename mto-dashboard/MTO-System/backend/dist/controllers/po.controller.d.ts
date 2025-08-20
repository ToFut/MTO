import { Request, Response } from 'express';
export declare class POController {
    private poService;
    constructor();
    getPOs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPO: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createPO: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updatePO: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updatePOStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deletePO: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPOProgress: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPOTimeline: (req: Request, res: Response, next: import("express").NextFunction) => void;
    exportPO: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: POController;
export default _default;
//# sourceMappingURL=po.controller.d.ts.map