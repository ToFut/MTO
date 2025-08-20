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
}
export default VocabularyService;
//# sourceMappingURL=vocabulary.service.d.ts.map