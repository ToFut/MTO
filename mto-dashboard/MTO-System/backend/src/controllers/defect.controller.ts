import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DefectService } from '../services/defect.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';

export class DefectController {
  private defectService: DefectService;

  constructor() {
    this.defectService = new DefectService();
  }

  // Get all defects
  getDefects = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      mtoId: req.query.mtoId as string,
      poId: req.query.poId as string,
      defectType: req.query.defectType as string,
      status: req.query.status as string,
      severity: req.query.severity as string,
      brandId: req.query.brandId as string,
      factoryId: req.query.factoryId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    // Apply company filter based on user role
    if (req.user?.companyType === 'brand') {
      filters.brandId = req.user.companyId;
    } else if (req.user?.companyType === 'factory') {
      filters.factoryId = req.user.companyId;
    }

    const result = await this.defectService.getDefects(filters);
    
    res.json({
      success: true,
      data: result.data,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    });
  });

  // Get single defect
  getDefect = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const defect = await this.defectService.getDefectById(id);
    
    if (!defect) {
      res.status(404).json({
        success: false,
        error: 'Defect not found',
      });
      return;
    }

    res.json({
      success: true,
      data: defect,
    });
  });

  // Report new defect
  reportDefect = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const defectData = {
      ...req.body,
      reported_by: req.user?.id,
      company_id: req.user?.companyId,
    };

    // Handle QC photos if uploaded
    if (req.files && Array.isArray(req.files)) {
      defectData.qc_photos = req.files.map((file: any) => file.path);
    }

    const result = await this.defectService.reportDefect(defectData);
    
    logger.info(`Defect reported for MTO ${defectData.mto_id} by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  // Update defect status
  updateDefectStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Status is required',
      });
      return;
    }

    const defect = await this.defectService.updateDefectStatus(
      id,
      status,
      notes,
      req.user?.id!
    );
    
    logger.info(`Defect ${id} status updated to ${status} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: defect,
    });
  });

  // Create replacement MTO
  createReplacementMTO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { defectId } = req.params;
    const { isRush, notes } = req.body;

    const replacement = await this.defectService.createReplacementMTO(
      defectId,
      isRush || false,
      notes,
      req.user?.id!
    );
    
    logger.info(`Replacement MTO created for defect ${defectId} by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: replacement,
    });
  });

  // Update defect
  updateDefect = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const defect = await this.defectService.updateDefect(id, req.body);
    
    logger.info(`Defect updated: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: defect,
    });
  });

  // Delete defect
  deleteDefect = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Only admin can delete defects
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Only administrators can delete defects',
      });
      return;
    }

    await this.defectService.deleteDefect(id);
    
    logger.info(`Defect deleted: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Defect deleted successfully',
    });
  });

  // Get defect queue
  getDefectQueue = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      priority: req.query.priority as string,
      assignedTo: req.query.assignedTo as string,
      companyId: req.user?.companyId,
    };

    const queue = await this.defectService.getDefectQueue(filters);
    
    res.json({
      success: true,
      data: queue,
    });
  });

  // Assign defect to user
  assignDefect = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      res.status(400).json({
        success: false,
        error: 'User ID to assign is required',
      });
      return;
    }

    const defect = await this.defectService.assignDefect(
      id,
      assignedTo,
      req.user?.id!
    );
    
    logger.info(`Defect ${id} assigned to user ${assignedTo} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: defect,
    });
  });

  // Get defect statistics
  getDefectStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId as string,
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId as string,
    };

    const stats = await this.defectService.getDefectStatistics(filters);
    
    res.json({
      success: true,
      data: stats,
    });
  });

  // Get defect timeline
  getDefectTimeline = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const timeline = await this.defectService.getDefectTimeline(id);
    
    res.json({
      success: true,
      data: timeline,
    });
  });

  // Upload QC photos
  uploadQCPhotos = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'At least one photo is required',
      });
      return;
    }

    const photos = req.files.map((file: any) => file.path);
    const defect = await this.defectService.addQCPhotos(id, photos);
    
    logger.info(`QC photos uploaded for defect ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: defect,
    });
  });

  // Export defects report
  exportDefectsReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId as string,
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId as string,
    };

    const buffer = await this.defectService.exportDefectsToExcel(filters);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=defects-report-${Date.now()}.xlsx`);
    res.send(buffer);
  });

  // Get AQL report
  getAQLReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      poId: req.query.poId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      companyId: req.user?.companyId,
    };

    const report = await this.defectService.generateAQLReport(filters);
    
    res.json({
      success: true,
      data: report,
    });
  });
}

export default new DefectController();