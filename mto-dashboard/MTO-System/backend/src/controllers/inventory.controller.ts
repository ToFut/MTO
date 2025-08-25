import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { InventoryService } from '../services/inventory.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';
import { getSupabase } from '../config/supabase';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  // Get all inventory items
  getInventoryItems = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      category: req.query.category as string,
      productionCategory: req.query.productionCategory as string,
      isShortage: req.query.isShortage === 'true',
      search: req.query.search as string,
      brandId: req.query.brandId as string,
      factoryId: req.query.factoryId as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    // Apply company filter based on user role
    if (req.user?.companyType === 'brand') {
      filters.brandId = req.user.companyId;
    } else if (req.user?.companyType === 'factory') {
      filters.factoryId = req.user.companyId;
    }

    const result = await this.inventoryService.getInventoryItems(filters);
    
    res.json({
      success: true,
      data: result.data,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    });
  });

  // Get single inventory item
  getInventoryItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const item = await this.inventoryService.getInventoryItemById(id);
    
    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Inventory item not found',
      });
      return;
    }

    res.json({
      success: true,
      data: item,
    });
  });

  // Create inventory item
  createInventoryItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const itemData = {
      ...req.body,
      created_by: req.user?.id,
      company_id: req.user?.companyId,
    };

    const item = await this.inventoryService.createInventoryItem(itemData);
    
    logger.info(`Inventory item created: ${item.id} by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: item,
    });
  });

  // Update inventory item
  updateInventoryItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const item = await this.inventoryService.updateInventoryItem(id, req.body);
    
    logger.info(`Inventory item updated: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: item,
    });
  });

  // Update stock levels
  updateStock = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { quantity, operation } = req.body;

    if (!quantity || !operation) {
      res.status(400).json({
        success: false,
        error: 'Quantity and operation are required',
      });
      return;
    }

    const item = await this.inventoryService.updateStock(
      id, 
      quantity, 
      operation,
      req.user?.id!
    );
    
    logger.info(`Stock updated for item ${id}: ${operation} ${quantity} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: item,
    });
  });

  // Delete inventory item
  deleteInventoryItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await this.inventoryService.deleteInventoryItem(id);
    
    logger.info(`Inventory item deleted: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  });

  // Get shortage alerts
  getShortageAlerts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      priority: req.query.priority as string,
      category: req.query.category as string,
      companyId: req.user?.companyId,
    };

    const alerts = await this.inventoryService.getShortageAlerts(filters);
    
    res.json({
      success: true,
      data: alerts,
    });
  });

  // Auto-populate inventory from MTOs
  autoPopulateFromMTOs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { poId, brandId, factoryId } = req.body;

    if (!poId) {
      res.status(400).json({
        success: false,
        error: 'Purchase Order ID is required',
      });
      return;
    }

    if (!brandId || !factoryId) {
      res.status(400).json({
        success: false,
        error: 'Brand ID and Factory ID are required',
      });
      return;
    }

    // Get MTOs for the PO first
    const { data: mtos } = await getSupabase()
      .from('mtos')
      .select('*')
      .eq('po_id', poId);

    if (!mtos || mtos.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No MTOs found for the specified PO',
      });
      return;
    }

    const result = await this.inventoryService.autoPopulateFromMTOs(mtos, brandId, factoryId);
    
    logger.info(`Inventory auto-populated from PO ${poId} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: result,
    });
  });

  // Allocate inventory to MTO
  allocateToMTO = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { inventoryId, mtoId, quantity } = req.body;

    if (!inventoryId || !mtoId || !quantity) {
      res.status(400).json({
        success: false,
        error: 'Inventory ID, MTO ID, and quantity are required',
      });
      return;
    }

    const allocation = await this.inventoryService.allocateToMTO(
      inventoryId,
      mtoId,
      quantity,
      req.user?.id!
    );
    
    res.json({
      success: true,
      data: allocation,
    });
  });

  // Get inventory statistics
  getInventoryStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.inventoryService.getInventoryStatistics(
      req.user?.companyId!
    );
    
    res.json({
      success: true,
      data: stats,
    });
  });

  // Get inventory movements history
  getMovements = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const movements = await this.inventoryService.getInventoryMovements(id);
    
    res.json({
      success: true,
      data: movements,
    });
  });

  // Bulk upload inventory
  bulkUploadInventory = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'CSV/Excel file is required',
      });
      return;
    }

    const result = await this.inventoryService.bulkUploadInventory(
      req.file,
      req.user?.companyId!,
      req.user?.id!
    );

    logger.info(`Bulk inventory upload: ${result.created} items created by user: ${req.user?.email}`);

    res.json({
      success: true,
      data: result,
    });
  });

  // Export inventory to Excel
  exportInventory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      companyId: req.user?.companyId,
      category: req.query.category as string,
      isShortage: req.query.isShortage === 'true',
    };

    const buffer = await this.inventoryService.exportInventoryToExcel(filters);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=inventory-export-${Date.now()}.xlsx`);
    res.send(buffer);
  });

  // Get reorder suggestions
  getReorderSuggestions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const suggestions = await this.inventoryService.getReorderSuggestions(
      req.user?.companyId!
    );
    
    res.json({
      success: true,
      data: suggestions,
    });
  });
}

export default new InventoryController();