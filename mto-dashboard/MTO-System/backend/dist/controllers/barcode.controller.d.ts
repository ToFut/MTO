import { Request, Response } from 'express';
export declare class BarcodeController {
    private barcodeService;
    constructor();
    generateMTOBarcode: (req: Request, res: Response, next: import("express").NextFunction) => void;
    generatePOBarcodes: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getBarcode: (req: Request, res: Response, next: import("express").NextFunction) => void;
    scanBarcode: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMTOBarcodes: (req: Request, res: Response, next: import("express").NextFunction) => void;
    printBarcodeLabels: (req: Request, res: Response, next: import("express").NextFunction) => void;
    printMasterCartonLabels: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateScanStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getScanHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
    validateBarcode: (req: Request, res: Response, next: import("express").NextFunction) => void;
    generateSpotBarcodeSheet: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getBarcodeStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteBarcode: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: BarcodeController;
export default _default;
//# sourceMappingURL=barcode.controller.d.ts.map