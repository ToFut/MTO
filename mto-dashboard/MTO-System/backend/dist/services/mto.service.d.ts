interface MTOFilters {
    poId?: string;
    status?: string;
    productionCategory?: string;
    priority?: string;
    brandId?: string;
    factoryId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit: number;
    offset: number;
}
export declare class MTOService {
    private supabase;
    private excelService;
    private poParserService;
    private vocabularyService;
    private inventoryService;
    private barcodeService;
    getMTOs(filters: MTOFilters): Promise<{
        data: any[];
        total: number;
    }>;
    getMTOById(id: string): Promise<any>;
    createMTO(mtoData: any): Promise<any>;
    updateMTO(id: string, updates: any): Promise<any>;
    updateMTOStatus(id: string, status: string, userId: string): Promise<any>;
    updateProductionStage(id: string, stage: string, userId: string): Promise<any>;
    deleteMTO(id: string): Promise<boolean>;
    /**
     * Preview MTO Upload - Parse and analyze without saving to database
     * Returns parsed MTOs and analysis for user review
     */
    previewMTOUpload(fileBuffer: Buffer, poNumber: string, brandId: string, factoryId: string): Promise<{
        mtoCount: number;
        mtos: {
            internal_id: any;
            po_line_id: any;
            display_name: any;
            reference_number: any;
            quantity: any;
            production_category: any;
            priority: any;
            expected_ship_date: any;
            spots: any;
            spot_count: any;
            po_customer: any;
            hts_code: any;
            fob_cost: any;
            ext_fob: any;
        }[];
        analysis: {
            fileFormat: any;
            qualityScore: any;
            totalRows: any;
            detectedSpots: number;
            poInfo: any;
        };
        summary: {
            byCategory: Record<string, number>;
            byPriority: Record<string, number>;
            dailyCount: number;
            monthlyCount: number;
            urgentCount: number;
        };
        impact: {
            inventoryItemsToCreate: number;
            vocabularyMappingsNeeded: number;
            totalSpotsToProcess: number;
        };
        warnings: string[];
    }>;
    /**
     * Generate warnings for upload preview
     */
    private generateUploadWarnings;
    /**
     * Direct MTO Upload - no PO required (auto-creates PO and workspace)
     * Used by legacy frontend upload route
     */
    directMTOUpload(fileBuffer: Buffer, brandId: string, factoryId: string, uploadedBy: string): Promise<{
        success: boolean;
        created: number;
        mtos: any[];
        po: any;
        workspace: any;
        excelAnalysis: {
            totalRows: number;
            validRows: number;
            errorRows: number;
            detectedSpots: any;
            qualityScore: number;
            format: string;
            sheetsProcessed: number;
        };
        autoPopulation: {
            inventory: {
                created: number;
                skipped: number;
            };
            barcodes: {
                created: number;
                skipped: number;
            };
            vocabulary: {
                created: number;
                skipped: number;
            };
        };
        errors: any[];
    }>;
    /**
     * Smart MTO Upload and Analysis Engine
     * The heart of the system - intelligently processes Excel and populates everything
     */
    smartUploadMTOs(fileBuffer: Buffer, poNumber: string, brandId: string, factoryId: string, userId: string): Promise<{
        success: boolean;
        created: number;
        mtos: any[];
        analysisReport: {
            upload: {
                totalMTOs: number;
                uniqueSpots: number;
                dailyProduction: number;
                monthlyProduction: number;
                urgentItems: number;
                spotPatterns: Record<string, number>;
            };
            excel: {
                qualityScore: any;
                detectedSpots: any;
                totalRows: any;
            };
            autoPopulation: {
                inventoryItems: any;
                vocabularyMappings: any;
                barcodesGenerated: any;
            };
            summary: {
                successRate: number;
                systemsPopulated: string[];
                completedAt: string;
            };
        };
        autoPopulation: {
            inventory: any;
            vocabulary: {
                created: number;
                translated: number;
                mappings: any[];
                error?: undefined;
            } | {
                created: number;
                translated: number;
                error: any;
                mappings?: undefined;
            };
            barcodes: {
                created: number;
                error?: undefined;
            } | {
                created: number;
                error: any;
            };
        };
        excelAnalysis: {
            detectedSpots: any;
            qualityScore: any;
            totalRows: any;
            format: any;
        };
    }>;
    bulkUploadMTOs(file: any, poId: string, brandId: string, userId: string): Promise<{
        created: number;
        errors: any[];
        mtos: any[];
    }>;
    getMTOStatistics(filters: any): Promise<{
        total: number;
        byStatus: {};
        byProductionStage: {};
        byPriority: {};
        byCategory: {};
        dailyCount: number;
        monthlyCount: number;
        urgentCount: number;
        completionRate: number;
        averageProductionTime: number;
    }>;
    getMTOTimeline(id: string): Promise<{
        statusHistory: any[];
        productionHistory: any[];
    }>;
    getUploadHistory(filters?: {
        brandId?: string;
        factoryId?: string;
        limit?: number;
        offset?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        data: any[];
        total: number;
    }>;
    exportMTOsToExcel(filters: any): Promise<any>;
    private detectFileType;
    private generateInternalId;
    private generateUniqueInternalId;
    private generateUniqueReferenceNumber;
    private createMTOBarcodes;
    private autoPopulateInventory;
    /**
     * Parse Excel buffer into MTO data with validation and analysis
     * Handles multiple sheets and flexible MTO structures
     * Used by directMTOUpload method
     */
    private parseExcelData;
    /**
     * Legacy parseExcelData method for backward compatibility
     */
    private parseExcelDataLegacy;
    private parseExcelDate;
    private determineCategory;
    private determinePriority;
    private validateMTO;
    private groupBy;
    private calculateCompletionRate;
    private calculateAverageProductionTime;
    private getEmptyStatistics;
    /**
     * Create or get PO record
     */
    private createOrGetPO;
    /**
     * Smart MTO enrichment - adds intelligence to parsed Excel data
     */
    private smartEnrichMTOs;
    /**
     * Process spots with intelligent vocabulary mapping
     */
    private processAndEnrichSpots;
    /**
     * Bulk create MTOs with flexible spots stored as JSONB
     */
    private bulkCreateMTOsWithSpots;
    /**
     * Auto-populate all related systems based on MTO analysis
     */
    private autoPopulateAllSystems;
    /**
     * Process vocabulary mappings and translations for MTO spots
     */
    private processVocabularyForMTOs;
    /**
     * Detect patch type from description
     */
    private detectPatchType;
    /**
     * Generate comprehensive barcodes for all aspects of MTOs
     */
    private generateComprehensiveBarcodes;
    /**
     * Generate comprehensive analysis report
     */
    private generateSmartAnalysisReport;
    /**
     * Infer visual location based on spot position
     */
    private inferVisualLocation;
    /**
     * Estimate production time based on patch reference
     */
    private estimateProductionTime;
    /**
     * Check if order is rush based on ship date
     */
    private isRushOrder;
    /**
     * Generate smart tags for MTOs
     */
    private generateSmartTags;
    /**
     * Create header mapping for flexible column detection
     * Enhanced to handle your exact column names and any format
     */
    private createHeaderMap;
    /**
     * Get column value using header mapping
     */
    private getColumnValue;
    /**
     * Capture ALL Excel columns into JSONB for complete data preservation
     */
    private captureAllExcelData;
    /**
     * Perform comprehensive auto-population after MTO upload
     */
    private performAutoPopulation;
}
export {};
//# sourceMappingURL=mto.service.d.ts.map