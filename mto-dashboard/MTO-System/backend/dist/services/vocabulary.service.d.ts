interface VocabularyFilters {
    brandId?: string;
    factoryId?: string;
    category?: string;
    search?: string;
    isActive?: boolean;
    limit: number;
    offset: number;
}
export declare class VocabularyService {
    private supabase;
    /**
     * Smart vocabulary mapping - finds or creates mapping for SKU with intelligent analysis
     */
    findOrCreateMapping(sku: string, brandId: string, factoryId: string, patchRef?: string): Promise<any>;
    /**
     * Create vocabulary mappings from MTOs with smart analysis
     */
    createMappingsFromMTOs(mtos: any[], brandId: string, factoryId: string): Promise<any>;
    getMappings(filters: VocabularyFilters): Promise<{
        data: any[];
        total: number;
    }>;
    getMappingById(id: string): Promise<any>;
    createMapping(mappingData: any): Promise<any>;
    updateMapping(id: string, updates: any): Promise<any>;
    deleteMapping(id: string): Promise<boolean>;
    bulkUploadMappings(file: any, companyId: string, userId: string): Promise<{
        created: number;
        mappings: any[];
    }>;
    getPatchLibrary(filters: any): Promise<any>;
    getIconWall(): Promise<any>;
    translateVocabulary(fromSKU: string, toLanguage: string): Promise<any>;
    searchBySKU(sku: string): Promise<any[]>;
    getVocabularyStatistics(companyId: string, companyType: string): Promise<{
        total: number;
        active: number;
        inactive: number;
        byCategory: {};
        byType: {};
        withImages: number;
        withoutImages: number;
    }>;
    exportVocabularyToExcel(filters: any): Promise<any>;
    /**
     * Create smart mapping with intelligent analysis of patch reference
     */
    private createSmartMapping;
    /**
     * Generate smart mapping data with intelligent analysis
     */
    private generateSmartMappingData;
    /**
     * Intelligent patch reference analysis
     */
    private analyzePatchReference;
    /**
     * Default analysis for unknown patches
     */
    private getDefaultAnalysis;
    /**
     * Find best similarity match for fuzzy matching
     */
    private findBestSimilarityMatch;
    /**
     * Calculate string similarity using Levenshtein distance
     */
    private calculateSimilarity;
    /**
     * Calculate Levenshtein distance between two strings
     */
    private levenshteinDistance;
}
export default VocabularyService;
//# sourceMappingURL=vocabulary.service.d.ts.map