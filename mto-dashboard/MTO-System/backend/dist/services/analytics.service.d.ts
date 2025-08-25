export declare class AnalyticsService {
    private supabase;
    getDashboardOverview(filters: any): Promise<{
        totalMTOs: number;
        completedMTOs: number;
        pendingMTOs: number;
        defectRate: number;
        onTimeDelivery: number;
        inventoryStatus: {
            inStock: number;
            shortage: number;
        };
    }>;
    getProductionAnalytics(filters: any): Promise<{
        daily: unknown[];
        monthly: unknown[];
        efficiency: number;
    }>;
    getTopProducts(filters: any): Promise<unknown[]>;
    getDefectAnalytics(filters: any): Promise<{
        byType: any;
        byStage: any;
        trend: any;
    }>;
    getShippingAnalytics(filters: any): Promise<{
        onTime: number;
        delayed: number;
        inTransit: number;
    }>;
    getInventoryAnalytics(filters: any): Promise<{
        byCategory: any;
        turnover: any;
        shortage: {
            sku: any;
            name: any;
            available: any;
            needed: any;
        }[];
    }>;
    getTimelineView(filters: any): Promise<{
        id: any;
        title: any;
        date: any;
        stage: any;
        status: any;
        dueDate: any;
        type: string;
    }[]>;
    getPerformanceMetrics(filters: any): Promise<{
        efficiency: number;
        quality: number;
        speed: number;
    }>;
    getEfficiencyReport(filters: any): Promise<{
        overall: number;
        byStage: any;
        bottlenecks: {
            stage: any;
            efficiency: any;
            pending: number;
        }[];
    }>;
    getQualityMetrics(filters: any): Promise<{
        defectRate: number;
        firstPassYield: number;
        rework: number;
    }>;
    getZipCodeAnalytics(filters: any): Promise<{
        byZip: {};
        heatmap: any[];
    }>;
    getTrendAnalysis(filters: any): Promise<{
        trend: unknown[];
        forecast: any[];
        change: number;
    }>;
    getForecast(filters: any): Promise<{
        forecast: any[];
        confidence: number;
    }>;
    generateCustomReport(options: any): Promise<any>;
    saveReportTemplate(templateData: any): Promise<any>;
    getReportTemplates(companyId: string): Promise<any[]>;
    deleteReportTemplate(templateId: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=analytics.service.d.ts.map