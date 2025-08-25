export interface ExcelAnalysisResult {
    totalRows: number;
    detectedSpots: number;
    columnMapping: Record<string, string>;
    spotColumns: Array<{
        position: number;
        skuColumn: string;
        refColumn?: string;
    }>;
    hasHeaders: boolean;
    suggestedMapping: Record<string, string>;
    qualityScore: number;
}
export interface SpotData {
    position: number;
    sku: string;
    patch_ref?: string;
}
export interface ParsedMTO {
    internal_id: string;
    po_line_id: string;
    display_name: string;
    reference_number: string;
    quantity: number;
    bag_base_pid?: string;
    expected_ship_date?: Date;
    actual_ship_date?: Date;
    order_submit_date?: Date;
    so_date?: Date;
    shopify_order_date?: Date;
    cpsd?: Date;
    po_line_tracking?: string;
    awb?: string;
    master_carton?: string;
    vendor_po_status?: string;
    sales_order_number?: string;
    spots: SpotData[];
    originalRowIndex: number;
    confidence: number;
}
/**
 * Smart Excel Analysis Service
 * Intelligently analyzes Excel files to detect MTO structure and extract data
 */
export declare class ExcelService {
    /**
     * Phase 1: Analyze Excel structure and detect patterns
     */
    analyzeExcelStructure(fileBuffer: Buffer): Promise<ExcelAnalysisResult>;
    /**
     * Phase 2: Extract MTOs from analyzed Excel structure
     */
    extractMTOsFromExcel(analysisResult: ExcelAnalysisResult, fileBuffer?: Buffer): Promise<ParsedMTO[]>;
    /**
     * Smart structural analysis of Excel data
     */
    private performStructuralAnalysis;
    /**
     * Detect if first row contains headers
     */
    private detectHeaders;
    /**
     * Smart column pattern detection
     */
    private detectColumnPatterns;
    /**
     * Smart spot detection with flexible positioning
     */
    private detectSpots;
    /**
     * Find spots by analyzing data patterns when headers don't help
     */
    private findSpotsByDataPattern;
    /**
     * Check if a value looks like a SKU
     */
    private looksLikeSKU;
    /**
     * Check if a value looks like a patch reference
     */
    private looksLikePatchRef;
    /**
     * Pattern matching helper
     */
    private matchesPattern;
    /**
     * Extract MTOs from rows using detected structure
     */
    private extractMTOsFromRows;
    /**
     * Extract single MTO from row
     */
    private extractMTOFromRow;
    /**
     * Check if row contains valid data
     */
    private isValidDataRow;
    /**
     * Smart date parsing
     */
    private parseDate;
    /**
     * Calculate quality score for the analysis
     */
    private calculateQualityScore;
    /**
     * Suggest optimal column mapping
     */
    private suggestOptimalMapping;
    /**
     * Validate Excel file before processing
     */
    validateExcelFile(fileBuffer: Buffer): Promise<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
    }>;
}
//# sourceMappingURL=excel.service.d.ts.map