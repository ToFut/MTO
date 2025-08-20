import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { SyncService } from '../services/sync.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';

export class SyncController {
  private syncService: SyncService;

  constructor() {
    this.syncService = new SyncService();
  }

  // Get sync status
  getSyncStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const status = await this.syncService.getSyncStatus(req.user?.companyId!);
    
    res.json({
      success: true,
      data: status,
    });
  });

  // Sync with NetSuite
  syncWithNetSuite = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { entityType, entityId, direction } = req.body;

    if (!entityType || !['po', 'mto', 'inventory', 'all'].includes(entityType)) {
      res.status(400).json({
        success: false,
        error: 'Valid entity type is required (po, mto, inventory, all)',
      });
      return;
    }

    const result = await this.syncService.syncWithNetSuite({
      entityType,
      entityId,
      direction: direction || 'both',
      companyId: req.user?.companyId!,
      userId: req.user?.id!,
    });
    
    logger.info(`NetSuite sync initiated for ${entityType} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: result,
    });
  });

  // Get sync history
  getSyncHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      entityType: req.query.entityType as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const history = await this.syncService.getSyncHistory(
      req.user?.companyId!,
      filters
    );
    
    res.json({
      success: true,
      data: history.data,
      total: history.total,
      limit: filters.limit,
      offset: filters.offset,
    });
  });

  // Get sync errors
  getSyncErrors = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = await this.syncService.getSyncErrors(req.user?.companyId!);
    
    res.json({
      success: true,
      data: errors,
    });
  });

  // Retry failed sync
  retrySync = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { syncId } = req.params;

    const result = await this.syncService.retrySync(syncId, req.user?.id!);
    
    logger.info(`Sync retry initiated for ${syncId} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: result,
    });
  });

  // Configure sync settings
  configureSyncSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const settings = req.body;

    // Only admin can configure sync settings
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Only administrators can configure sync settings',
      });
      return;
    }

    const updatedSettings = await this.syncService.configureSyncSettings(
      req.user.companyId,
      settings
    );
    
    logger.info(`Sync settings updated by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: updatedSettings,
    });
  });

  // Get sync mappings
  getSyncMappings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const mappings = await this.syncService.getSyncMappings(req.user?.companyId!);
    
    res.json({
      success: true,
      data: mappings,
    });
  });

  // Update sync mapping
  updateSyncMapping = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { mappingId } = req.params;
    const mappingData = req.body;

    const mapping = await this.syncService.updateSyncMapping(
      mappingId,
      mappingData,
      req.user?.id!
    );
    
    logger.info(`Sync mapping ${mappingId} updated by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: mapping,
    });
  });

  // Test connection
  testConnection = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { system } = req.params;

    if (!['netsuite', 'shopify', 'sap'].includes(system)) {
      res.status(400).json({
        success: false,
        error: 'Valid system name is required (netsuite, shopify, sap)',
      });
      return;
    }

    const result = await this.syncService.testConnection(
      system,
      req.user?.companyId!
    );
    
    res.json({
      success: true,
      data: result,
    });
  });

  // Schedule sync
  scheduleSync = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { entityType, schedule, enabled } = req.body;

    if (!entityType || !schedule) {
      res.status(400).json({
        success: false,
        error: 'Entity type and schedule are required',
      });
      return;
    }

    const scheduledSync = await this.syncService.scheduleSync({
      entityType,
      schedule,
      enabled: enabled !== false,
      companyId: req.user?.companyId!,
      createdBy: req.user?.id!,
    });
    
    logger.info(`Scheduled sync created for ${entityType} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: scheduledSync,
    });
  });

  // Get scheduled syncs
  getScheduledSyncs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const schedules = await this.syncService.getScheduledSyncs(req.user?.companyId!);
    
    res.json({
      success: true,
      data: schedules,
    });
  });

  // Delete scheduled sync
  deleteScheduledSync = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { scheduleId } = req.params;

    await this.syncService.deleteScheduledSync(scheduleId, req.user?.id!);
    
    logger.info(`Scheduled sync ${scheduleId} deleted by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Scheduled sync deleted successfully',
    });
  });

  // Get sync statistics
  getSyncStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.syncService.getSyncStatistics(req.user?.companyId!);
    
    res.json({
      success: true,
      data: stats,
    });
  });

  // Export sync report
  exportSyncReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const buffer = await this.syncService.exportSyncReport(
      req.user?.companyId!,
      filters
    );
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=sync-report-${Date.now()}.xlsx`);
    res.send(buffer);
  });
}

export default new SyncController();