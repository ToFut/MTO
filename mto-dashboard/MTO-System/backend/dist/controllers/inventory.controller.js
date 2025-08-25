"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("../services/inventory.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const express_validator_1 = require("express-validator");
const supabase_1 = require("../config/supabase");
class InventoryController {
    constructor() {
        // Get all inventory items
        this.getInventoryItems = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                category: req.query.category,
                productionCategory: req.query.productionCategory,
                isShortage: req.query.isShortage === 'true',
                search: req.query.search,
                brandId: req.query.brandId,
                factoryId: req.query.factoryId,
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
        this.getInventoryItem = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
        this.createInventoryItem = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
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
            logger_1.logger.info(`Inventory item created: ${item.id} by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: item,
            });
        });
        // Update inventory item
        this.updateInventoryItem = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const item = await this.inventoryService.updateInventoryItem(id, req.body);
            logger_1.logger.info(`Inventory item updated: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: item,
            });
        });
        // Update stock levels
        this.updateStock = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { quantity, operation } = req.body;
            if (!quantity || !operation) {
                res.status(400).json({
                    success: false,
                    error: 'Quantity and operation are required',
                });
                return;
            }
            const item = await this.inventoryService.updateStock(id, quantity, operation, req.user?.id);
            logger_1.logger.info(`Stock updated for item ${id}: ${operation} ${quantity} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: item,
            });
        });
        // Delete inventory item
        this.deleteInventoryItem = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.inventoryService.deleteInventoryItem(id);
            logger_1.logger.info(`Inventory item deleted: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Inventory item deleted successfully',
            });
        });
        // Get shortage alerts
        this.getShortageAlerts = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                priority: req.query.priority,
                category: req.query.category,
                companyId: req.user?.companyId,
            };
            const alerts = await this.inventoryService.getShortageAlerts(filters);
            res.json({
                success: true,
                data: alerts,
            });
        });
        // Auto-populate inventory from MTOs
        this.autoPopulateFromMTOs = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
            const { data: mtos } = await (0, supabase_1.getSupabase)()
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
            logger_1.logger.info(`Inventory auto-populated from PO ${poId} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: result,
            });
        });
        // Allocate inventory to MTO
        this.allocateToMTO = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { inventoryId, mtoId, quantity } = req.body;
            if (!inventoryId || !mtoId || !quantity) {
                res.status(400).json({
                    success: false,
                    error: 'Inventory ID, MTO ID, and quantity are required',
                });
                return;
            }
            const allocation = await this.inventoryService.allocateToMTO(inventoryId, mtoId, quantity, req.user?.id);
            res.json({
                success: true,
                data: allocation,
            });
        });
        // Get inventory statistics
        this.getInventoryStatistics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const stats = await this.inventoryService.getInventoryStatistics(req.user?.companyId);
            res.json({
                success: true,
                data: stats,
            });
        });
        // Get inventory movements history
        this.getMovements = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const movements = await this.inventoryService.getInventoryMovements(id);
            res.json({
                success: true,
                data: movements,
            });
        });
        // Bulk upload inventory
        this.bulkUploadInventory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: 'CSV/Excel file is required',
                });
                return;
            }
            const result = await this.inventoryService.bulkUploadInventory(req.file, req.user?.companyId, req.user?.id);
            logger_1.logger.info(`Bulk inventory upload: ${result.created} items created by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: result,
            });
        });
        // Export inventory to Excel
        this.exportInventory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                companyId: req.user?.companyId,
                category: req.query.category,
                isShortage: req.query.isShortage === 'true',
            };
            const buffer = await this.inventoryService.exportInventoryToExcel(filters);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=inventory-export-${Date.now()}.xlsx`);
            res.send(buffer);
        });
        // Get reorder suggestions
        this.getReorderSuggestions = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const suggestions = await this.inventoryService.getReorderSuggestions(req.user?.companyId);
            res.json({
                success: true,
                data: suggestions,
            });
        });
        this.inventoryService = new inventory_service_1.InventoryService();
    }
}
exports.InventoryController = InventoryController;
exports.default = new InventoryController();
//# sourceMappingURL=inventory.controller.js.map