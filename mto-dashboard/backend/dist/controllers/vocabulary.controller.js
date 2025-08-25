"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VocabularyController = void 0;
const vocabulary_service_1 = require("../services/vocabulary.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const express_validator_1 = require("express-validator");
class VocabularyController {
    constructor() {
        // Get all vocabulary mappings
        this.getMappings = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                brandId: req.query.brandId,
                factoryId: req.query.factoryId,
                category: req.query.category,
                search: req.query.search,
                isActive: req.query.isActive === 'true',
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
        this.getMapping = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
        this.createMapping = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
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
            logger_1.logger.info(`Vocabulary mapping created: ${mapping.id} by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: mapping,
            });
        });
        // Update vocabulary mapping
        this.updateMapping = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const mapping = await this.vocabularyService.updateMapping(id, req.body);
            logger_1.logger.info(`Vocabulary mapping updated: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: mapping,
            });
        });
        // Delete vocabulary mapping
        this.deleteMapping = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.vocabularyService.deleteMapping(id);
            logger_1.logger.info(`Vocabulary mapping deleted: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Vocabulary mapping deleted successfully',
            });
        });
        // Bulk upload vocabulary mappings
        this.bulkUploadMappings = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: 'CSV/Excel file is required',
                });
                return;
            }
            const result = await this.vocabularyService.bulkUploadMappings(req.file, req.user?.companyId, req.user?.id);
            logger_1.logger.info(`Bulk vocabulary upload: ${result.created} mappings created by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: result,
            });
        });
        // Get patch library
        this.getPatchLibrary = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                category: req.query.category,
                search: req.query.search,
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
        this.getIconWall = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const iconWall = await this.vocabularyService.getIconWall();
            res.json({
                success: true,
                data: iconWall,
            });
        });
        // Translate vocabulary
        this.translateVocabulary = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
        this.searchBySKU = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { sku } = req.params;
            const results = await this.vocabularyService.searchBySKU(sku);
            res.json({
                success: true,
                data: results,
            });
        });
        // Get vocabulary statistics
        this.getStatistics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const stats = await this.vocabularyService.getVocabularyStatistics(req.user?.companyId, req.user?.companyType);
            res.json({
                success: true,
                data: stats,
            });
        });
        // Export vocabulary to Excel
        this.exportVocabulary = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId,
                factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId,
            };
            const buffer = await this.vocabularyService.exportVocabularyToExcel(filters);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=vocabulary-export-${Date.now()}.xlsx`);
            res.send(buffer);
        });
        this.vocabularyService = new vocabulary_service_1.VocabularyService();
    }
}
exports.VocabularyController = VocabularyController;
exports.default = new VocabularyController();
//# sourceMappingURL=vocabulary.controller.js.map