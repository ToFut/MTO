import { Request, Response } from 'express';
export declare class AnalyticsController {
    private analyticsService;
    constructor();
    getDashboardOverview: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getProductionAnalytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTopProducts: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getDefectAnalytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getShippingAnalytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getInventoryAnalytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTimelineView: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPerformanceMetrics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getEfficiencyReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getQualityMetrics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getZipCodeAnalytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTrendAnalysis: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getForecast: (req: Request, res: Response, next: import("express").NextFunction) => void;
    generateCustomReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
    saveReportTemplate: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getReportTemplates: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteReportTemplate: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: AnalyticsController;
export default _default;
//# sourceMappingURL=analytics.controller.d.ts.map