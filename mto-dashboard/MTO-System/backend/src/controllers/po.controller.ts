import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { POService } from '../services/po.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';

export class POController {
  private poService: POService;

  constructor() {
    this.poService = new POService();
  }

  // Get all POs with filtering
  getPOs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      brandId: req.query.brandId as string,
      factoryId: req.query.factoryId as string,
      status: req.query.status as string,
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

    const result = await this.poService.getPOs(filters);
    
    res.json({
      success: true,
      data: result.data,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    });
  });

  // Get single PO by ID
  getPO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const po = await this.poService.getPOById(id);
    
    if (!po) {
      res.status(404).json({
        success: false,
        error: 'Purchase order not found',
      });
      return;
    }

    // Check access permissions
    if (req.user?.companyType === 'brand' && po.brand_id !== req.user.companyId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    if (req.user?.companyType === 'factory' && po.factory_id !== req.user.companyId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    res.json({
      success: true,
      data: po,
    });
  });

  // Create new PO
  createPO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const poData = {
      ...req.body,
      created_by: req.user?.id,
      brand_id: req.user?.companyType === 'brand' ? req.user.companyId : req.body.brand_id,
    };

    const po = await this.poService.createPO(poData);
    
    logger.info(`PO created: ${po.id} by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: po,
    });
  });

  // Update PO
  updatePO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    // Check if PO exists and user has access
    const existingPO = await this.poService.getPOById(id);
    
    if (!existingPO) {
      res.status(404).json({
        success: false,
        error: 'Purchase order not found',
      });
      return;
    }

    // Check permissions
    if (req.user?.companyType === 'brand' && existingPO.brand_id !== req.user.companyId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const po = await this.poService.updatePO(id, req.body);
    
    logger.info(`PO updated: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: po,
    });
  });

  // Update PO status
  updatePOStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Status is required',
      });
      return;
    }

    const po = await this.poService.updatePOStatus(id, status, req.user?.id!);
    
    logger.info(`PO status updated: ${id} to ${status} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: po,
    });
  });

  // Delete PO
  deletePO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check if PO exists and user has access
    const existingPO = await this.poService.getPOById(id);
    
    if (!existingPO) {
      res.status(404).json({
        success: false,
        error: 'Purchase order not found',
      });
      return;
    }

    // Only admin or brand owner can delete
    if (req.user?.role !== 'admin' && 
        (req.user?.companyType !== 'brand' || existingPO.brand_id !== req.user.companyId)) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    await this.poService.deletePO(id);
    
    logger.info(`PO deleted: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Purchase order deleted successfully',
    });
  });

  // Get PO progress
  getPOProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const progress = await this.poService.getPOProgress(id);
    
    res.json({
      success: true,
      data: progress,
    });
  });

  // Get PO timeline
  getPOTimeline = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const timeline = await this.poService.getPOTimeline(id);
    
    res.json({
      success: true,
      data: timeline,
    });
  });

  // Export PO to Excel
  exportPO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const buffer = await this.poService.exportPOToExcel(id);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=po-${id}-export-${Date.now()}.xlsx`);
    res.send(buffer);
  });
}

export default new POController();