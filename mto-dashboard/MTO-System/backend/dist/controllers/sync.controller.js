"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncController = void 0;
const sync_service_1 = require("../services/sync.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
class SyncController {
    constructor() {
        // Get sync status
        this.getSyncStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const status = await this.syncService.getSyncStatus(req.user?.companyId);
            res.json({
                success: true,
                data: status,
            });
        });
        // Sync with NetSuite
        this.syncWithNetSuite = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
                companyId: req.user?.companyId,
                userId: req.user?.id,
            });
            logger_1.logger.info(`NetSuite sync initiated for ${entityType} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: result,
            });
        });
        // Get sync history
        this.getSyncHistory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                entityType: req.query.entityType,
                status: req.query.status,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                limit: parseInt(req.query.limit) || 50,
                offset: parseInt(req.query.offset) || 0,
            };
            const history = await this.syncService.getSyncHistory(req.user?.companyId, filters);
            res.json({
                success: true,
                data: history.data,
                total: history.total,
                limit: filters.limit,
                offset: filters.offset,
            });
        });
        // Get sync errors
        this.getSyncErrors = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = await this.syncService.getSyncErrors(req.user?.companyId);
            res.json({
                success: true,
                data: errors,
            });
        });
        // Retry failed sync
        this.retrySync = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { syncId } = req.params;
            const result = await this.syncService.retrySync(syncId, req.user?.id);
            logger_1.logger.info(`Sync retry initiated for ${syncId} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: result,
            });
        });
        // Configure sync settings
        this.configureSyncSettings = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const settings = req.body;
            // Only admin can configure sync settings
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Only administrators can configure sync settings',
                });
                return;
            }
            const updatedSettings = await this.syncService.configureSyncSettings(req.user.companyId, settings);
            logger_1.logger.info(`Sync settings updated by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: updatedSettings,
            });
        });
        // Get sync mappings
        this.getSyncMappings = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const mappings = await this.syncService.getSyncMappings(req.user?.companyId);
            res.json({
                success: true,
                data: mappings,
            });
        });
        // Update sync mapping
        this.updateSyncMapping = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { mappingId } = req.params;
            const mappingData = req.body;
            const mapping = await this.syncService.updateSyncMapping(mappingId, mappingData, req.user?.id);
            logger_1.logger.info(`Sync mapping ${mappingId} updated by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: mapping,
            });
        });
        // Test connection
        this.testConnection = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { system } = req.params;
            if (!['netsuite', 'shopify', 'sap'].includes(system)) {
                res.status(400).json({
                    success: false,
                    error: 'Valid system name is required (netsuite, shopify, sap)',
                });
                return;
            }
            const result = await this.syncService.testConnection(system, req.user?.companyId);
            res.json({
                success: true,
                data: result,
            });
        });
        // Schedule sync
        this.scheduleSync = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
                companyId: req.user?.companyId,
                createdBy: req.user?.id,
            });
            logger_1.logger.info(`Scheduled sync created for ${entityType} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: scheduledSync,
            });
        });
        // Get scheduled syncs
        this.getScheduledSyncs = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const schedules = await this.syncService.getScheduledSyncs(req.user?.companyId);
            res.json({
                success: true,
                data: schedules,
            });
        });
        // Delete scheduled sync
        this.deleteScheduledSync = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { scheduleId } = req.params;
            await this.syncService.deleteScheduledSync(scheduleId, req.user?.id);
            logger_1.logger.info(`Scheduled sync ${scheduleId} deleted by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Scheduled sync deleted successfully',
            });
        });
        // Get sync statistics
        this.getSyncStatistics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const stats = await this.syncService.getSyncStatistics(req.user?.companyId);
            res.json({
                success: true,
                data: stats,
            });
        });
        // Export sync report
        this.exportSyncReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            const buffer = await this.syncService.exportSyncReport(req.user?.companyId, filters);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=sync-report-${Date.now()}.xlsx`);
            res.send(buffer);
        });
        this.syncService = new sync_service_1.SyncService();
    }
}
exports.SyncController = SyncController;
exports.default = new SyncController();
//# sourceMappingURL=sync.controller.js.map