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
    private db;
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
    exportMTOsToExcel(filters: any): Promise<any>;
    private generateInternalId;
    private createMTOBarcodes;
    private autoPopulateInventory;
    private parseExcelData;
    private parseExcelDate;
    private determineCategory;
    private determinePriority;
    private validateMTO;
    private groupBy;
    private calculateCompletionRate;
    private calculateAverageProductionTime;
    private getEmptyStatistics;
}
export {};
//# sourceMappingURL=mto.service.d.ts.map