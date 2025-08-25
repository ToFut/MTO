import { Request, Response } from 'express';
export declare class UserController {
    getUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    toggleUserStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const userController: UserController;
//# sourceMappingURL=user.controller.d.ts.map