export declare class BarcodeService {
    private supabase;
    generateMTOBarcode(mtoId: string, type: string): Promise<any>;
    generatePOBarcodes(poId: string): Promise<any[]>;
    getBarcodeById(id: string): Promise<any>;
    scanBarcode(code: string, userId: string): Promise<any>;
    getMTOBarcodes(mtoId: string): Promise<any[]>;
    generateBarcodeLabels(barcodeIds: string[], format: string): Promise<Buffer<ArrayBuffer>>;
    generateMasterCartonLabels(masterCartonId: string): Promise<Buffer<ArrayBuffer>>;
    updateScanStatus(id: string, updates: any): Promise<any>;
    getScanHistory(id: string): Promise<any[]>;
    validateBarcodeFormat(code: string): Promise<boolean>;
    parseBarcodeData(code: string): any;
    generateSpotBarcodeSheet(mtoId: string): Promise<Buffer<ArrayBuffer>>;
    getBarcodeStatistics(filters: any): Promise<{
        total: number;
        scanned: number;
        pending: number;
    }>;
    deleteBarcode(id: string): Promise<boolean>;
    private generateQRCode;
}
//# sourceMappingURL=barcode.service.d.ts.map