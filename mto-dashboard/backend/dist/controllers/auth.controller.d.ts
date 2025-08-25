import { Request, Response } from 'express';
export declare class AuthController {
    private supabase;
    register: (req: Request, res: Response, next: import("express").NextFunction) => void;
    login: (req: Request, res: Response, next: import("express").NextFunction) => void;
    logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getCurrentUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updatePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    forgotPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=auth.controller.d.ts.map