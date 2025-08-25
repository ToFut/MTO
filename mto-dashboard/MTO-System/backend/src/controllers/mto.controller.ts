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

  // Direct MTO upload - no PO required (legacy frontend route)
  uploadMTOs = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Excel file is required',
      });
      return;
    }

    try {
      // Get user's company info
      const brandId = req.user?.companyType === 'brand' ? req.user.companyId : null;
      let factoryId = req.user?.companyType === 'factory' ? req.user.companyId : null;

      if (!brandId && req.user?.role !== 'admin') {
        res.status(400).json({
          success: false,
          error: 'Brand user required for MTO upload',
        });
        return;
      }

      // If no factory specified, get the default or first available factory
      if (!factoryId) {
        const { getSupabase } = require('../config/supabase');
        const supabase = getSupabase();
        const { data: factories } = await supabase
          .from('companies')
          .select('id')
          .eq('type', 'factory')
          .limit(1);
        
        factoryId = factories?.[0]?.id || null;
      }

      if (!factoryId) {
        res.status(400).json({
          success: false,
          error: 'No factory available. Please contact admin to set up a factory.',
        });
        return;
      }

      // Read file buffer
      const fileBuffer = req.file.buffer || require('fs').readFileSync(req.file.path);

      // Use direct MTO upload method that auto-creates PO
      const result = await this.mtoService.directMTOUpload(
        fileBuffer,
        brandId || '',
        factoryId,
        req.user?.id!
      );

      // Clean up file if it was saved temporarily
      if (req.file.path) {
        require('fs').unlinkSync(req.file.path);
      }

      logger.info(`Direct MTO upload completed: ${result.created} MTOs processed by user: ${req.user?.email}`);

      res.json({
        success: true,
        message: `Successfully uploaded ${result.created} MTOs`,
        data: result.mtos,
        summary: {
          mtosCreated: result.created,
          poCreated: result.po,
          workspaceCreated: result.workspace,
          inventoryItemsCreated: result.autoPopulation?.inventory?.created || 0,
          barcodesGenerated: result.autoPopulation?.barcodes?.created || 0
        }
      });

    } catch (error) {
      logger.error(`Direct MTO upload failed for user ${req.user?.email}:`, error);
      
      // Clean up file on error
      if (req.file?.path) {
        try {
          require('fs').unlinkSync(req.file.path);
        } catch (e) {}
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Upload failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Preview MTOs before upload - parse without saving
  previewMTOs = asyncHandler(async (req: AuthRequest, res: Response) => {
    logger.info('🔍 PREVIEW ENDPOINT HIT - Starting deep dive debug');
    logger.info('File received:', req.file ? 'YES' : 'NO');
    logger.info('File details:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'NO FILE');
    logger.info('Body params:', req.body);
    
    if (!req.file) {
      logger.error('No file in request!');
      res.status(400).json({
        success: false,
        error: 'Excel file is required',
      });
      return;
    }

    const { poNumber, factoryId } = req.body;
    logger.info('Parsed params:', { poNumber, factoryId });
    
    if (!poNumber) {
      logger.error('No PO number provided!');
      res.status(400).json({
        success: false,
        error: 'Purchase Order number is required',
      });
      return;
    }

    // Determine brand and factory IDs
    const brandId = req.user?.companyType === 'brand' ? req.user.companyId : req.body.brandId;
    const finalFactoryId = req.user?.companyType === 'factory' ? req.user.companyId : factoryId;
    logger.info('Final IDs:', { brandId, finalFactoryId });

    try {
      // Read file buffer
      const fileBuffer = req.file.buffer || require('fs').readFileSync(req.file.path);
      logger.info('File buffer size:', fileBuffer.length);

      // Parse and analyze without saving
      logger.info('🚀 Calling previewMTOUpload with NextGen parser...');
      const previewResult = await this.mtoService.previewMTOUpload(
        fileBuffer,
        poNumber,
        brandId || '',
        finalFactoryId || ''
      );

      // Clean up file if it was saved temporarily
      if (req.file.path) {
        require('fs').unlinkSync(req.file.path);
      }

      logger.info(`✅ MTO preview generated: ${previewResult.mtoCount} MTOs parsed for PO: ${poNumber}`);
      logger.info('Preview result structure:', {
        mtoCount: previewResult.mtoCount,
        totalColumns: previewResult.analysis?.totalColumns,
        totalRows: previewResult.analysis?.totalRows,
        headers: previewResult.analysis?.headers?.slice(0, 5), // First 5 headers
        sampleMTO: previewResult.mtos?.[0] ? Object.keys(previewResult.mtos[0]) : 'NO MTOs'
      });

      res.json({
        success: true,
        preview: true,
        data: previewResult,
      });
    } catch (error: any) {
      logger.error('MTO preview failed:', error);
      
      // Clean up file on error
      if (req.file?.path) {
        try {
          require('fs').unlinkSync(req.file.path);
        } catch (e) {}
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Failed to preview MTOs',
      });
    }
  });

  // Smart MTO upload with intelligent analysis and auto-population
  smartUploadMTOs = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Excel file is required',
      });
      return;
    }

    const { poNumber, factoryId } = req.body;
    
    if (!poNumber) {
      res.status(400).json({
        success: false,
        error: 'Purchase Order number is required',
      });
      return;
    }

    if (!factoryId && req.user?.companyType === 'brand') {
      res.status(400).json({
        success: false,
        error: 'Factory ID is required for brand users',
      });
      return;
    }

    // Determine brand and factory IDs based on user type
    const brandId = req.user?.companyType === 'brand' ? req.user.companyId : req.body.brandId;
    const finalFactoryId = req.user?.companyType === 'factory' ? req.user.companyId : factoryId;

    if (!brandId || !finalFactoryId) {
      res.status(400).json({
        success: false,
        error: 'Both brand and factory must be specified',
      });
      return;
    }

    try {
      // Read file buffer
      const fileBuffer = req.file.buffer || require('fs').readFileSync(req.file.path);

      // Execute smart upload with full analysis
      const result = await this.mtoService.smartUploadMTOs(
        fileBuffer,
        poNumber,
        brandId,
        finalFactoryId,
        req.user?.id!
      );

      // Clean up file if it was saved temporarily
      if (req.file.path) {
        require('fs').unlinkSync(req.file.path);
      }

      logger.info(`Smart MTO upload completed: ${result.created} MTOs processed by user: ${req.user?.email}`);

      res.json({
        success: true,
        message: `Successfully processed ${result.created} MTOs with smart analysis`,
        data: result,
        summary: {
          mtosCreated: result.created,
          spotsDetected: result.excelAnalysis.detectedSpots,
          qualityScore: result.excelAnalysis.qualityScore,
          inventoryItemsCreated: result.autoPopulation.inventory.created,
          vocabularyMappingsCreated: result.autoPopulation.vocabulary.created,
          barcodesGenerated: result.autoPopulation.barcodes.created
        }
      });

    } catch (error) {
      logger.error(`Smart MTO upload failed for user ${req.user?.email}:`, error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Smart upload failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Legacy bulk upload (keep for backward compatibility)
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

  // Get upload history (workspaces)
  getUploadHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      brandId: req.query.brandId as string,
      factoryId: req.query.factoryId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0,
    };

    // Apply company filter based on user role
    if (req.user?.companyType === 'brand') {
      filters.brandId = req.user.companyId;
    } else if (req.user?.companyType === 'factory') {
      filters.factoryId = req.user.companyId;
    }

    const result = await this.mtoService.getUploadHistory(filters);
    
    res.json({
      success: true,
      data: result.data,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    });
  });
}

export default new MTOController();