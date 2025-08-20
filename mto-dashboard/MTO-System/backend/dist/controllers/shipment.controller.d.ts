import { Request, Response } from 'express';
export declare class ShipmentController {
    private shipmentService;
    constructor();
    getShipments: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getShipment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createShipment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateShipment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateShipmentStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    trackAWB: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createMasterCarton: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMasterCarton: (req: Request, res: Response, next: import("express").NextFunction) => void;
    generatePackingList: (req: Request, res: Response, next: import("express").NextFunction) => void;
    generateShippingLabels: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteShipment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getDeliveryStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    confirmDelivery: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getShipmentTimeline: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getShippingStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    exportShipmentsReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: ShipmentController;
export default _default;
//# sourceMappingURL=shipment.controller.d.ts.map