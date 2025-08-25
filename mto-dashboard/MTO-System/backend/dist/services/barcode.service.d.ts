export declare class BarcodeService {
    private supabase;
    /**
     * Generate barcodes for MTOs with flexible spot support
     * Supports 3, 6, 20+ spots dynamically
     */
    generateBarcodesForMTOs(mtos: any[]): Promise<any>;
    /**
     * Generate complete set of barcodes for a single MTO
     * Creates 4-level barcode hierarchy: Spot → Line → Master → PO
     */
    generateCompleteMTOBarcodes(mto: any): Promise<any[]>;
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
    /**
     * Generate spot-level barcode value
     */
    private generateSpotBarcodeValue;
    /**
     * Generate line-level barcode value
     */
    private generateLineBarcodeValue;
    /**
     * Generate master carton barcode value
     */
    private generateMasterBarcodeValue;
    /**
     * Generate PO-level barcode value
     */
    private generatePOBarcodeValue;
    /**
     * Analyze barcode breakdown for reporting
     */
    private analyzeBarcodeBreakdown;
    /**
     * Enhanced barcode scanning with smart data parsing
     */
    smartScanBarcode(code: string, userId: string, location?: string): Promise<any>;
    /**
     * Parse advanced barcode data with intelligent field extraction
     */
    private parseAdvancedBarcodeData;
    /**
     * Get suggested actions based on barcode type and scan context
     */
    private getScanActions;
    /**
     * Generate printable barcode labels with flexible layout
     */
    generatePrintableLabels(barcodeIds: string[], format?: 'spot' | 'line' | 'master' | 'mixed'): Promise<Buffer>;
    /**
     * Group barcodes for optimal printing layout
     */
    private groupBarcodesForPrinting;
    /**
     * Generate PDF content for labels (simplified implementation)
     */
    private generateLabelPDFContent;
}
//# sourceMappingURL=barcode.service.d.ts.map