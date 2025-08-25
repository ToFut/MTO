import { Request, Response } from 'express';
export declare class InventoryController {
    private inventoryService;
    constructor();
    getInventoryItems: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getInventoryItem: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createInventoryItem: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateInventoryItem: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateStock: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteInventoryItem: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getShortageAlerts: (req: Request, res: Response, next: import("express").NextFunction) => void;
    autoPopulateFromMTOs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    allocateToMTO: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getInventoryStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMovements: (req: Request, res: Response, next: import("express").NextFunction) => void;
    bulkUploadInventory: (req: Request, res: Response, next: import("express").NextFunction) => void;
    exportInventory: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getReorderSuggestions: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: InventoryController;
export default _default;
//# sourceMappingURL=inventory.controller.d.ts.map