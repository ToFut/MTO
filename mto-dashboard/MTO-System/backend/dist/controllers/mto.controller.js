"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTOController = void 0;
const mto_service_1 = require("../services/mto.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const express_validator_1 = require("express-validator");
class MTOController {
    constructor() {
        // Get all MTOs with filtering
        this.getMTOs = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                poId: req.query.poId,
                status: req.query.status,
                productionCategory: req.query.productionCategory,
                priority: req.query.priority,
                brandId: req.query.brandId,
                factoryId: req.query.factoryId,
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
        this.getMTO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
        this.createMTO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
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
            logger_1.logger.info(`MTO created: ${mto.id} by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: mto,
            });
        });
        // Update MTO
        this.updateMTO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const errors = (0, express_validator_1.validationResult)(req);
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
            logger_1.logger.info(`MTO updated: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: mto,
            });
        });
        // Update MTO status
        this.updateMTOStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                res.status(400).json({
                    success: false,
                    error: 'Status is required',
                });
                return;
            }
            const mto = await this.mtoService.updateMTOStatus(id, status, req.user?.id);
            logger_1.logger.info(`MTO status updated: ${id} to ${status} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: mto,
            });
        });
        // Update production stage
        this.updateProductionStage = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { stage } = req.body;
            if (!stage) {
                res.status(400).json({
                    success: false,
                    error: 'Production stage is required',
                });
                return;
            }
            const mto = await this.mtoService.updateProductionStage(id, stage, req.user?.id);
            logger_1.logger.info(`MTO production stage updated: ${id} to ${stage} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: mto,
            });
        });
        // Delete MTO
        this.deleteMTO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
            logger_1.logger.info(`MTO deleted: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'MTO deleted successfully',
            });
        });
        // Direct MTO upload - no PO required (legacy frontend route)
        this.uploadMTOs = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
                const result = await this.mtoService.directMTOUpload(fileBuffer, brandId || '', factoryId, req.user?.id);
                // Clean up file if it was saved temporarily
                if (req.file.path) {
                    require('fs').unlinkSync(req.file.path);
                }
                logger_1.logger.info(`Direct MTO upload completed: ${result.created} MTOs processed by user: ${req.user?.email}`);
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
            }
            catch (error) {
                logger_1.logger.error(`Direct MTO upload failed for user ${req.user?.email}:`, error);
                // Clean up file on error
                if (req.file?.path) {
                    try {
                        require('fs').unlinkSync(req.file.path);
                    }
                    catch (e) { }
                }
                res.status(500).json({
                    success: false,
                    error: error.message || 'Upload failed',
                    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        });
        // Preview MTOs before upload - parse without saving
        this.previewMTOs = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
            // Determine brand and factory IDs
            const brandId = req.user?.companyType === 'brand' ? req.user.companyId : req.body.brandId;
            const finalFactoryId = req.user?.companyType === 'factory' ? req.user.companyId : factoryId;
            try {
                // Read file buffer
                const fileBuffer = req.file.buffer || require('fs').readFileSync(req.file.path);
                // Parse and analyze without saving
                const previewResult = await this.mtoService.previewMTOUpload(fileBuffer, poNumber, brandId || '', finalFactoryId || '');
                // Clean up file if it was saved temporarily
                if (req.file.path) {
                    require('fs').unlinkSync(req.file.path);
                }
                logger_1.logger.info(`MTO preview generated: ${previewResult.mtoCount} MTOs parsed for PO: ${poNumber}`);
                res.json({
                    success: true,
                    preview: true,
                    data: previewResult,
                });
            }
            catch (error) {
                logger_1.logger.error('MTO preview failed:', error);
                // Clean up file on error
                if (req.file?.path) {
                    try {
                        require('fs').unlinkSync(req.file.path);
                    }
                    catch (e) { }
                }
                res.status(400).json({
                    success: false,
                    error: error.message || 'Failed to preview MTOs',
                });
            }
        });
        // Smart MTO upload with intelligent analysis and auto-population
        this.smartUploadMTOs = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
                const result = await this.mtoService.smartUploadMTOs(fileBuffer, poNumber, brandId, finalFactoryId, req.user?.id);
                // Clean up file if it was saved temporarily
                if (req.file.path) {
                    require('fs').unlinkSync(req.file.path);
                }
                logger_1.logger.info(`Smart MTO upload completed: ${result.created} MTOs processed by user: ${req.user?.email}`);
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
            }
            catch (error) {
                logger_1.logger.error(`Smart MTO upload failed for user ${req.user?.email}:`, error);
                res.status(500).json({
                    success: false,
                    error: error.message || 'Smart upload failed',
                    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        });
        // Legacy bulk upload (keep for backward compatibility)
        this.bulkUploadMTOs = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
            const result = await this.mtoService.bulkUploadMTOs(req.file, poId, req.user?.companyId, req.user?.id);
            logger_1.logger.info(`Bulk MTO upload: ${result.created} MTOs created by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: result,
            });
        });
        // Get MTO statistics
        this.getMTOStatistics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                brandId: req.query.brandId,
                factoryId: req.query.factoryId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            // Apply company filter based on user role
            if (req.user?.companyType === 'brand') {
                filters.brandId = req.user.companyId;
            }
            else if (req.user?.companyType === 'factory') {
                filters.factoryId = req.user.companyId;
            }
            const stats = await this.mtoService.getMTOStatistics(filters);
            res.json({
                success: true,
                data: stats,
            });
        });
        // Get MTO timeline
        this.getMTOTimeline = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const timeline = await this.mtoService.getMTOTimeline(id);
            res.json({
                success: true,
                data: timeline,
            });
        });
        // Export MTOs to Excel
        this.exportMTOs = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                poId: req.query.poId,
                status: req.query.status,
                brandId: req.query.brandId,
                factoryId: req.query.factoryId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            // Apply company filter based on user role
            if (req.user?.companyType === 'brand') {
                filters.brandId = req.user.companyId;
            }
            else if (req.user?.companyType === 'factory') {
                filters.factoryId = req.user.companyId;
            }
            const buffer = await this.mtoService.exportMTOsToExcel(filters);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=mtos-export-${Date.now()}.xlsx`);
            res.send(buffer);
        });
        // Get upload history (workspaces)
        this.getUploadHistory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                brandId: req.query.brandId,
                factoryId: req.query.factoryId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                limit: parseInt(req.query.limit) || 20,
                offset: parseInt(req.query.offset) || 0,
            };
            // Apply company filter based on user role
            if (req.user?.companyType === 'brand') {
                filters.brandId = req.user.companyId;
            }
            else if (req.user?.companyType === 'factory') {
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
        this.mtoService = new mto_service_1.MTOService();
    }
}
exports.MTOController = MTOController;
exports.default = new MTOController();
//# sourceMappingURL=mto.controller.js.map