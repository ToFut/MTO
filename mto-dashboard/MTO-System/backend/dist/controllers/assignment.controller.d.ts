import { Request, Response } from 'express';
export declare class AssignmentController {
    createAssignment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAssignments: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAssignmentById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateAssignment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteAssignment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAvailableFactories: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAssignedFactories: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getBrandsForFactory: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: AssignmentController;
export default _default;
//# sourceMappingURL=assignment.controller.d.ts.map