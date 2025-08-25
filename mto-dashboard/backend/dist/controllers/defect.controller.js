"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectController = void 0;
const defect_service_1 = require("../services/defect.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const express_validator_1 = require("express-validator");
class DefectController {
    constructor() {
        // Get all defects
        this.getDefects = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                mtoId: req.query.mtoId,
                poId: req.query.poId,
                defectType: req.query.defectType,
                status: req.query.status,
                severity: req.query.severity,
                brandId: req.query.brandId,
                factoryId: req.query.factoryId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                limit: parseInt(req.query.limit) || 50,
                offset: parseInt(req.query.offset) || 0,
            };
            // Apply company filter based on user role
            if (req.user?.companyType === 'brand') {
                filters.brandId = req.user.companyId;
            }
            else if (req.user?.companyType === 'factory') {
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
        this.getDefect = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
        this.reportDefect = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
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
                defectData.qc_photos = req.files.map((file) => file.path);
            }
            const result = await this.defectService.reportDefect(defectData);
            logger_1.logger.info(`Defect reported for MTO ${defectData.mto_id} by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: result,
            });
        });
        // Update defect status
        this.updateDefectStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status, notes } = req.body;
            if (!status) {
                res.status(400).json({
                    success: false,
                    error: 'Status is required',
                });
                return;
            }
            const defect = await this.defectService.updateDefectStatus(id, status, notes, req.user?.id);
            logger_1.logger.info(`Defect ${id} status updated to ${status} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: defect,
            });
        });
        // Create replacement MTO
        this.createReplacementMTO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { defectId } = req.params;
            const { isRush, notes } = req.body;
            const replacement = await this.defectService.createReplacementMTO(defectId, isRush || false, notes, req.user?.id);
            logger_1.logger.info(`Replacement MTO created for defect ${defectId} by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: replacement,
            });
        });
        // Update defect
        this.updateDefect = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const defect = await this.defectService.updateDefect(id, req.body);
            logger_1.logger.info(`Defect updated: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: defect,
            });
        });
        // Delete defect
        this.deleteDefect = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
            logger_1.logger.info(`Defect deleted: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Defect deleted successfully',
            });
        });
        // Get defect queue
        this.getDefectQueue = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                priority: req.query.priority,
                assignedTo: req.query.assignedTo,
                companyId: req.user?.companyId,
            };
            const queue = await this.defectService.getDefectQueue(filters);
            res.json({
                success: true,
                data: queue,
            });
        });
        // Assign defect to user
        this.assignDefect = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { assignedTo } = req.body;
            if (!assignedTo) {
                res.status(400).json({
                    success: false,
                    error: 'User ID to assign is required',
                });
                return;
            }
            const defect = await this.defectService.assignDefect(id, assignedTo, req.user?.id);
            logger_1.logger.info(`Defect ${id} assigned to user ${assignedTo} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: defect,
            });
        });
        // Get defect statistics
        this.getDefectStatistics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId,
                factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId,
            };
            const stats = await this.defectService.getDefectStatistics(filters);
            res.json({
                success: true,
                data: stats,
            });
        });
        // Get defect timeline
        this.getDefectTimeline = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const timeline = await this.defectService.getDefectTimeline(id);
            res.json({
                success: true,
                data: timeline,
            });
        });
        // Upload QC photos
        this.uploadQCPhotos = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'At least one photo is required',
                });
                return;
            }
            const photos = req.files.map((file) => file.path);
            const defect = await this.defectService.addQCPhotos(id, photos);
            logger_1.logger.info(`QC photos uploaded for defect ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: defect,
            });
        });
        // Export defects report
        this.exportDefectsReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId,
                factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId,
            };
            const buffer = await this.defectService.exportDefectsToExcel(filters);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=defects-report-${Date.now()}.xlsx`);
            res.send(buffer);
        });
        // Get AQL report
        this.getAQLReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                poId: req.query.poId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                companyId: req.user?.companyId,
            };
            const report = await this.defectService.generateAQLReport(filters);
            res.json({
                success: true,
                data: report,
            });
        });
        this.defectService = new defect_service_1.DefectService();
    }
}
exports.DefectController = DefectController;
exports.default = new DefectController();
//# sourceMappingURL=defect.controller.js.map