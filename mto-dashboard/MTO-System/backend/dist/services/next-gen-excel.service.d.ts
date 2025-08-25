/**
 * Next-Generation Excel Parser Service
 * Handles ANY Excel format with complete column detection
 */
export declare class NextGenExcelService {
    /**
     * Parse Excel with COMPLETE column detection
     */
    parseExcel(fileBuffer: Buffer): Promise<any>;
    /**
     * Find the actual header row by analyzing patterns
     */
    private findHeaderRow;
    /**
     * Create COMPREHENSIVE column mapping for ALL columns
     */
    private createComprehensiveMapping;
    /**
     * Parse a single row with ALL data preserved
     */
    private parseRow;
    /**
     * Get value from row using column mapping
     */
    private getValue;
    /**
     * Check if row is empty
     */
    private isEmptyRow;
    /**
     * Generate preview with ALL columns shown
     */
    generatePreview(fileBuffer: Buffer, limit?: number): Promise<any>;
}
declare const _default: NextGenExcelService;
export default _default;
//# sourceMappingURL=next-gen-excel.service.d.ts.map