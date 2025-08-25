"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POController = void 0;
const po_service_1 = require("../services/po.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const express_validator_1 = require("express-validator");
class POController {
    constructor() {
        // Get all POs with filtering
        this.getPOs = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                brandId: req.query.brandId,
                factoryId: req.query.factoryId,
                status: req.query.status,
                search: req.query.search,
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
        this.getPO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
        this.createPO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
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
            logger_1.logger.info(`PO created: ${po.id} by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: po,
            });
        });
        // Update PO
        this.updatePO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const errors = (0, express_validator_1.validationResult)(req);
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
            logger_1.logger.info(`PO updated: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: po,
            });
        });
        // Update PO status
        this.updatePOStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                res.status(400).json({
                    success: false,
                    error: 'Status is required',
                });
                return;
            }
            const po = await this.poService.updatePOStatus(id, status, req.user?.id);
            logger_1.logger.info(`PO status updated: ${id} to ${status} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: po,
            });
        });
        // Delete PO
        this.deletePO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
            logger_1.logger.info(`PO deleted: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Purchase order deleted successfully',
            });
        });
        // Get PO progress
        this.getPOProgress = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const progress = await this.poService.getPOProgress(id);
            res.json({
                success: true,
                data: progress,
            });
        });
        // Get PO timeline
        this.getPOTimeline = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const timeline = await this.poService.getPOTimeline(id);
            res.json({
                success: true,
                data: timeline,
            });
        });
        // Export PO to Excel
        this.exportPO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const buffer = await this.poService.exportPOToExcel(id);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=po-${id}-export-${Date.now()}.xlsx`);
            res.send(buffer);
        });
        this.poService = new po_service_1.POService();
    }
}
exports.POController = POController;
exports.default = new POController();
//# sourceMappingURL=po.controller.js.map