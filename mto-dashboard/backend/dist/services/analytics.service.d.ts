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
        daily: any[];
        monthly: any[];
        efficiency: number;
    }>;
    getTopProducts(filters: any): Promise<any[]>;
    getDefectAnalytics(filters: any): Promise<{
        byType: {};
        byStage: {};
        trend: any[];
    }>;
    getShippingAnalytics(filters: any): Promise<{
        onTime: number;
        delayed: number;
        inTransit: number;
    }>;
    getInventoryAnalytics(filters: any): Promise<{
        byCategory: {};
        turnover: number;
        shortage: any[];
    }>;
    getTimelineView(filters: any): Promise<any[]>;
    getPerformanceMetrics(filters: any): Promise<{
        efficiency: number;
        quality: number;
        speed: number;
    }>;
    getEfficiencyReport(filters: any): Promise<{
        overall: number;
        byStage: {};
        bottlenecks: any[];
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
        trend: any[];
        forecast: any[];
        change: number;
    }>;
    getForecast(filters: any): Promise<{
        forecast: any[];
        confidence: any;
    }>;
    generateCustomReport(options: any): Promise<any>;
    saveReportTemplate(templateData: any): Promise<any>;
    getReportTemplates(companyId: string): Promise<any[]>;
    deleteReportTemplate(templateId: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=analytics.service.d.ts.map