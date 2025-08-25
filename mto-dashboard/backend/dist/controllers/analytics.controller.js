"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
class AnalyticsController {
    constructor() {
        // Get dashboard overview
        this.getDashboardOverview = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId,
                factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId,
            };
            const overview = await this.analyticsService.getDashboardOverview(filters);
            res.json({
                success: true,
                data: overview,
            });
        });
        // Get production analytics
        this.getProductionAnalytics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                groupBy: req.query.groupBy || 'day',
                factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId,
            };
            const analytics = await this.analyticsService.getProductionAnalytics(filters);
            res.json({
                success: true,
                data: analytics,
            });
        });
        // Get top products
        this.getTopProducts = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                limit: parseInt(req.query.limit) || 10,
                sortBy: req.query.sortBy || 'quantity',
                brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId,
            };
            const products = await this.analyticsService.getTopProducts(filters);
            res.json({
                success: true,
                data: products,
            });
        });
        // Get defect analytics
        this.getDefectAnalytics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                groupBy: req.query.groupBy || 'type',
                brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId,
                factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId,
            };
            const analytics = await this.analyticsService.getDefectAnalytics(filters);
            res.json({
                success: true,
                data: analytics,
            });
        });
        // Get shipping analytics
        this.getShippingAnalytics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                groupBy: req.query.groupBy || 'status',
                brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId,
                factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId,
            };
            const analytics = await this.analyticsService.getShippingAnalytics(filters);
            res.json({
                success: true,
                data: analytics,
            });
        });
        // Get inventory analytics
        this.getInventoryAnalytics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                category: req.query.category,
                companyId: req.user?.companyId,
            };
            const analytics = await this.analyticsService.getInventoryAnalytics(filters);
            res.json({
                success: true,
                data: analytics,
            });
        });
        // Get timeline view
        this.getTimelineView = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                entityType: req.query.entityType || 'mto',
                entityId: req.query.entityId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            const timeline = await this.analyticsService.getTimelineView(filters);
            res.json({
                success: true,
                data: timeline,
            });
        });
        // Get performance metrics
        this.getPerformanceMetrics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                metricType: req.query.metricType,
                companyId: req.user?.companyId,
            };
            const metrics = await this.analyticsService.getPerformanceMetrics(filters);
            res.json({
                success: true,
                data: metrics,
            });
        });
        // Get efficiency report
        this.getEfficiencyReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId,
            };
            const report = await this.analyticsService.getEfficiencyReport(filters);
            res.json({
                success: true,
                data: report,
            });
        });
        // Get quality metrics
        this.getQualityMetrics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId,
                factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId,
            };
            const metrics = await this.analyticsService.getQualityMetrics(filters);
            res.json({
                success: true,
                data: metrics,
            });
        });
        // Get zip code analytics
        this.getZipCodeAnalytics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                country: req.query.country || 'US',
                brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId,
            };
            const analytics = await this.analyticsService.getZipCodeAnalytics(filters);
            res.json({
                success: true,
                data: analytics,
            });
        });
        // Get trend analysis
        this.getTrendAnalysis = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                metric: req.query.metric || 'orders',
                period: req.query.period || '30d',
                comparison: req.query.comparison || 'previous',
                companyId: req.user?.companyId,
            };
            const trends = await this.analyticsService.getTrendAnalysis(filters);
            res.json({
                success: true,
                data: trends,
            });
        });
        // Get forecast
        this.getForecast = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                metric: req.query.metric || 'production',
                horizon: parseInt(req.query.horizon) || 30,
                confidence: parseFloat(req.query.confidence) || 0.95,
                companyId: req.user?.companyId,
            };
            const forecast = await this.analyticsService.getForecast(filters);
            res.json({
                success: true,
                data: forecast,
            });
        });
        // Generate custom report
        this.generateCustomReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { reportType, filters, columns, format } = req.body;
            if (!reportType) {
                res.status(400).json({
                    success: false,
                    error: 'Report type is required',
                });
                return;
            }
            const report = await this.analyticsService.generateCustomReport({
                reportType,
                filters: {
                    ...filters,
                    companyId: req.user?.companyId,
                },
                columns,
                format: format || 'json',
                userId: req.user?.id,
            });
            if (format === 'excel') {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=report-${reportType}-${Date.now()}.xlsx`);
                res.send(report);
            }
            else if (format === 'pdf') {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=report-${reportType}-${Date.now()}.pdf`);
                res.send(report);
            }
            else {
                res.json({
                    success: true,
                    data: report,
                });
            }
            logger_1.logger.info(`Custom report generated: ${reportType} by user: ${req.user?.email}`);
        });
        // Save report template
        this.saveReportTemplate = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { name, description, reportType, filters, columns } = req.body;
            if (!name || !reportType) {
                res.status(400).json({
                    success: false,
                    error: 'Name and report type are required',
                });
                return;
            }
            const template = await this.analyticsService.saveReportTemplate({
                name,
                description,
                reportType,
                filters,
                columns,
                userId: req.user?.id,
                companyId: req.user?.companyId,
            });
            logger_1.logger.info(`Report template "${name}" saved by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: template,
            });
        });
        // Get report templates
        this.getReportTemplates = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const templates = await this.analyticsService.getReportTemplates(req.user?.companyId);
            res.json({
                success: true,
                data: templates,
            });
        });
        // Delete report template
        this.deleteReportTemplate = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { templateId } = req.params;
            await this.analyticsService.deleteReportTemplate(templateId, req.user?.id);
            logger_1.logger.info(`Report template ${templateId} deleted by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Report template deleted successfully',
            });
        });
        this.analyticsService = new analytics_service_1.AnalyticsService();
    }
}
exports.AnalyticsController = AnalyticsController;
exports.default = new AnalyticsController();
//# sourceMappingURL=analytics.controller.js.map