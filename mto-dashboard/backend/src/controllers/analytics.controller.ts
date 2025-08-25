import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AnalyticsService } from '../services/analytics.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  // Get dashboard overview
  getDashboardOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId as string,
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId as string,
    };

    const overview = await this.analyticsService.getDashboardOverview(filters);
    
    res.json({
      success: true,
      data: overview,
    });
  });

  // Get production analytics
  getProductionAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      groupBy: req.query.groupBy as string || 'day',
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId as string,
    };

    const analytics = await this.analyticsService.getProductionAnalytics(filters);
    
    res.json({
      success: true,
      data: analytics,
    });
  });

  // Get top products
  getTopProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string || 'quantity',
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId as string,
    };

    const products = await this.analyticsService.getTopProducts(filters);
    
    res.json({
      success: true,
      data: products,
    });
  });

  // Get defect analytics
  getDefectAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      groupBy: req.query.groupBy as string || 'type',
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId as string,
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId as string,
    };

    const analytics = await this.analyticsService.getDefectAnalytics(filters);
    
    res.json({
      success: true,
      data: analytics,
    });
  });

  // Get shipping analytics
  getShippingAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      groupBy: req.query.groupBy as string || 'status',
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId as string,
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId as string,
    };

    const analytics = await this.analyticsService.getShippingAnalytics(filters);
    
    res.json({
      success: true,
      data: analytics,
    });
  });

  // Get inventory analytics
  getInventoryAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      category: req.query.category as string,
      companyId: req.user?.companyId,
    };

    const analytics = await this.analyticsService.getInventoryAnalytics(filters);
    
    res.json({
      success: true,
      data: analytics,
    });
  });

  // Get timeline view
  getTimelineView = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      entityType: req.query.entityType as string || 'mto',
      entityId: req.query.entityId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const timeline = await this.analyticsService.getTimelineView(filters);
    
    res.json({
      success: true,
      data: timeline,
    });
  });

  // Get performance metrics
  getPerformanceMetrics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      metricType: req.query.metricType as string,
      companyId: req.user?.companyId,
    };

    const metrics = await this.analyticsService.getPerformanceMetrics(filters);
    
    res.json({
      success: true,
      data: metrics,
    });
  });

  // Get efficiency report
  getEfficiencyReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId as string,
    };

    const report = await this.analyticsService.getEfficiencyReport(filters);
    
    res.json({
      success: true,
      data: report,
    });
  });

  // Get quality metrics
  getQualityMetrics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId as string,
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId as string,
    };

    const metrics = await this.analyticsService.getQualityMetrics(filters);
    
    res.json({
      success: true,
      data: metrics,
    });
  });

  // Get zip code analytics
  getZipCodeAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      country: req.query.country as string || 'US',
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId as string,
    };

    const analytics = await this.analyticsService.getZipCodeAnalytics(filters);
    
    res.json({
      success: true,
      data: analytics,
    });
  });

  // Get trend analysis
  getTrendAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      metric: req.query.metric as string || 'orders',
      period: req.query.period as string || '30d',
      comparison: req.query.comparison as string || 'previous',
      companyId: req.user?.companyId,
    };

    const trends = await this.analyticsService.getTrendAnalysis(filters);
    
    res.json({
      success: true,
      data: trends,
    });
  });

  // Get forecast
  getForecast = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      metric: req.query.metric as string || 'production',
      horizon: parseInt(req.query.horizon as string) || 30,
      confidence: parseFloat(req.query.confidence as string) || 0.95,
      companyId: req.user?.companyId,
    };

    const forecast = await this.analyticsService.getForecast(filters);
    
    res.json({
      success: true,
      data: forecast,
    });
  });

  // Generate custom report
  generateCustomReport = asyncHandler(async (req: AuthRequest, res: Response) => {
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
    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=report-${reportType}-${Date.now()}.pdf`);
      res.send(report);
    } else {
      res.json({
        success: true,
        data: report,
      });
    }
    
    logger.info(`Custom report generated: ${reportType} by user: ${req.user?.email}`);
  });

  // Save report template
  saveReportTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
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
      userId: req.user?.id!,
      companyId: req.user?.companyId!,
    });
    
    logger.info(`Report template "${name}" saved by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: template,
    });
  });

  // Get report templates
  getReportTemplates = asyncHandler(async (req: AuthRequest, res: Response) => {
    const templates = await this.analyticsService.getReportTemplates(
      req.user?.companyId!
    );
    
    res.json({
      success: true,
      data: templates,
    });
  });

  // Delete report template
  deleteReportTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { templateId } = req.params;

    await this.analyticsService.deleteReportTemplate(
      templateId,
      req.user?.id!
    );
    
    logger.info(`Report template ${templateId} deleted by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Report template deleted successfully',
    });
  });
}

export default new AnalyticsController();