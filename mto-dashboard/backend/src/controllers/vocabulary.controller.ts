import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { VocabularyService } from '../services/vocabulary.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';

export class VocabularyController {
  private vocabularyService: VocabularyService;

  constructor() {
    this.vocabularyService = new VocabularyService();
  }

  // Get all vocabulary mappings
  getMappings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      brandId: req.query.brandId as string,
      factoryId: req.query.factoryId as string,
      category: req.query.category as string,
      search: req.query.search as string,
      isActive: req.query.isActive === 'true',
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    // Apply company filter based on user role
    if (req.user?.companyType === 'brand') {
      filters.brandId = req.user.companyId;
    } else if (req.user?.companyType === 'factory') {
      filters.factoryId = req.user.companyId;
    }

    const result = await this.vocabularyService.getMappings(filters);
    
    res.json({
      success: true,
      data: result.data,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    });
  });

  // Get single mapping by ID
  getMapping = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const mapping = await this.vocabularyService.getMappingById(id);
    
    if (!mapping) {
      res.status(404).json({
        success: false,
        error: 'Vocabulary mapping not found',
      });
      return;
    }

    res.json({
      success: true,
      data: mapping,
    });
  });

  // Create new vocabulary mapping
  createMapping = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const mappingData = {
      ...req.body,
      created_by: req.user?.id,
      brand_id: req.user?.companyType === 'brand' ? req.user.companyId : req.body.brand_id,
      factory_id: req.user?.companyType === 'factory' ? req.user.companyId : req.body.factory_id,
    };

    const mapping = await this.vocabularyService.createMapping(mappingData);
    
    logger.info(`Vocabulary mapping created: ${mapping.id} by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: mapping,
    });
  });

  // Update vocabulary mapping
  updateMapping = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const mapping = await this.vocabularyService.updateMapping(id, req.body);
    
    logger.info(`Vocabulary mapping updated: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: mapping,
    });
  });

  // Delete vocabulary mapping
  deleteMapping = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await this.vocabularyService.deleteMapping(id);
    
    logger.info(`Vocabulary mapping deleted: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Vocabulary mapping deleted successfully',
    });
  });

  // Bulk upload vocabulary mappings
  bulkUploadMappings = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'CSV/Excel file is required',
      });
      return;
    }

    const result = await this.vocabularyService.bulkUploadMappings(
      req.file,
      req.user?.companyId!,
      req.user?.id!
    );

    logger.info(`Bulk vocabulary upload: ${result.created} mappings created by user: ${req.user?.email}`);

    res.json({
      success: true,
      data: result,
    });
  });

  // Get patch library
  getPatchLibrary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      category: req.query.category as string,
      search: req.query.search as string,
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : undefined,
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : undefined,
    };

    const patches = await this.vocabularyService.getPatchLibrary(filters);
    
    res.json({
      success: true,
      data: patches,
    });
  });

  // Get icon wall (visual gallery)
  getIconWall = asyncHandler(async (req: AuthRequest, res: Response) => {
    const iconWall = await this.vocabularyService.getIconWall();
    
    res.json({
      success: true,
      data: iconWall,
    });
  });

  // Translate vocabulary
  translateVocabulary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fromSKU, toLanguage } = req.body;

    if (!fromSKU || !toLanguage) {
      res.status(400).json({
        success: false,
        error: 'SKU and target language are required',
      });
      return;
    }

    const translation = await this.vocabularyService.translateVocabulary(fromSKU, toLanguage);
    
    res.json({
      success: true,
      data: translation,
    });
  });

  // Search vocabulary by SKU
  searchBySKU = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { sku } = req.params;
    
    const results = await this.vocabularyService.searchBySKU(sku);
    
    res.json({
      success: true,
      data: results,
    });
  });

  // Get vocabulary statistics
  getStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.vocabularyService.getVocabularyStatistics(
      req.user?.companyId!,
      req.user?.companyType!
    );
    
    res.json({
      success: true,
      data: stats,
    });
  });

  // Export vocabulary to Excel
  exportVocabulary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId as string,
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId as string,
    };

    const buffer = await this.vocabularyService.exportVocabularyToExcel(filters);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=vocabulary-export-${Date.now()}.xlsx`);
    res.send(buffer);
  });
}

export default new VocabularyController();