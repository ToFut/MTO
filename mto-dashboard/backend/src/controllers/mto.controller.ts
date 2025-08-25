import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { MTOService } from '../services/mto.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';

export class MTOController {
  private mtoService: MTOService;

  constructor() {
    this.mtoService = new MTOService();
  }

  // Get all MTOs with filtering
  getMTOs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      poId: req.query.poId as string,
      status: req.query.status as string,
      productionCategory: req.query.productionCategory as string,
      priority: req.query.priority as string,
      brandId: req.query.brandId as string,
      factoryId: req.query.factoryId as string,
      search: req.query.search as string,
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

    const result = await this.mtoService.getMTOs(filters);
    
    res.json({
      success: true,
      data: result.data,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    });
  });

  // Get single MTO by ID
  getMTO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const mto = await this.mtoService.getMTOById(id);
    
    if (!mto) {
      res.status(404).json({
        success: false,
        error: 'MTO not found',
      });
      return;
    }

    // Check access permissions
    if (req.user?.companyType === 'brand' && mto.brand_id !== req.user.companyId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    if (req.user?.companyType === 'factory' && mto.factory_id !== req.user.companyId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    res.json({
      success: true,
      data: mto,
    });
  });

  // Create new MTO
  createMTO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const mtoData = {
      ...req.body,
      created_by: req.user?.id,
      brand_id: req.user?.companyType === 'brand' ? req.user.companyId : req.body.brand_id,
      factory_id: req.body.factory_id,
    };

    const mto = await this.mtoService.createMTO(mtoData);
    
    logger.info(`MTO created: ${mto.id} by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: mto,
    });
  });

  // Update MTO
  updateMTO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    // Check if MTO exists and user has access
    const existingMTO = await this.mtoService.getMTOById(id);
    
    if (!existingMTO) {
      res.status(404).json({
        success: false,
        error: 'MTO not found',
      });
      return;
    }

    // Check permissions
    if (req.user?.companyType === 'brand' && existingMTO.brand_id !== req.user.companyId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const mto = await this.mtoService.updateMTO(id, req.body);
    
    logger.info(`MTO updated: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: mto,
    });
  });

  // Update MTO status
  updateMTOStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Status is required',
      });
      return;
    }

    const mto = await this.mtoService.updateMTOStatus(id, status, req.user?.id!);
    
    logger.info(`MTO status updated: ${id} to ${status} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: mto,
    });
  });

  // Update production stage
  updateProductionStage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      res.status(400).json({
        success: false,
        error: 'Production stage is required',
      });
      return;
    }

    const mto = await this.mtoService.updateProductionStage(id, stage, req.user?.id!);
    
    logger.info(`MTO production stage updated: ${id} to ${stage} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: mto,
    });
  });

  // Delete MTO
  deleteMTO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check if MTO exists and user has access
    const existingMTO = await this.mtoService.getMTOById(id);
    
    if (!existingMTO) {
      res.status(404).json({
        success: false,
        error: 'MTO not found',
      });
      return;
    }

    // Only admin or brand owner can delete
    if (req.user?.role !== 'admin' && 
        (req.user?.companyType !== 'brand' || existingMTO.brand_id !== req.user.companyId)) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    await this.mtoService.deleteMTO(id);
    
    logger.info(`MTO deleted: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'MTO deleted successfully',
    });
  });

  // Bulk upload MTOs from Excel
  bulkUploadMTOs = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Excel file is required',
      });
      return;
    }

    const { poId } = req.body;
    
    if (!poId) {
      res.status(400).json({
        success: false,
        error: 'Purchase Order ID is required',
      });
      return;
    }

    const result = await this.mtoService.bulkUploadMTOs(
      req.file,
      poId,
      req.user?.companyId!,
      req.user?.id!
    );

    logger.info(`Bulk MTO upload: ${result.created} MTOs created by user: ${req.user?.email}`);

    res.json({
      success: true,
      data: result,
    });
  });

  // Get MTO statistics
  getMTOStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      brandId: req.query.brandId as string,
      factoryId: req.query.factoryId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    // Apply company filter based on user role
    if (req.user?.companyType === 'brand') {
      filters.brandId = req.user.companyId;
    } else if (req.user?.companyType === 'factory') {
      filters.factoryId = req.user.companyId;
    }

    const stats = await this.mtoService.getMTOStatistics(filters);
    
    res.json({
      success: true,
      data: stats,
    });
  });

  // Get MTO timeline
  getMTOTimeline = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const timeline = await this.mtoService.getMTOTimeline(id);
    
    res.json({
      success: true,
      data: timeline,
    });
  });

  // Export MTOs to Excel
  exportMTOs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      poId: req.query.poId as string,
      status: req.query.status as string,
      brandId: req.query.brandId as string,
      factoryId: req.query.factoryId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    // Apply company filter based on user role
    if (req.user?.companyType === 'brand') {
      filters.brandId = req.user.companyId;
    } else if (req.user?.companyType === 'factory') {
      filters.factoryId = req.user.companyId;
    }

    const buffer = await this.mtoService.exportMTOsToExcel(filters);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=mtos-export-${Date.now()}.xlsx`);
    res.send(buffer);
  });
}

export default new MTOController();