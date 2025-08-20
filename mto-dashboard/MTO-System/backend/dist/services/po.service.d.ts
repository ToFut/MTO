interface POFilters {
    brandId?: string;
    factoryId?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit: number;
    offset: number;
}
export declare class POService {
    private supabase;
    getPOs(filters: POFilters): Promise<{
        data: any[];
        total: number;
    }>;
    getPOById(id: string): Promise<any>;
    createPO(poData: any): Promise<any>;
    updatePO(id: string, updates: any): Promise<any>;
    updatePOStatus(id: string, status: string, userId: string): Promise<any>;
    deletePO(id: string): Promise<boolean>;
    getPOProgress(id: string): Promise<{
        total: number;
        completed: number;
        inProgress: number;
        pending: number;
        defective: number;
        progress: number;
    }>;
    getPOTimeline(id: string): Promise<{
        statusHistory: any[];
        events: any[];
    }>;
    exportPOToExcel(id: string): Promise<any>;
    private generatePONumber;
    private updatePOProgress;
}
export default POService;
//# sourceMappingURL=po.service.d.ts.map