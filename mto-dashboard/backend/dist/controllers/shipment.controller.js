"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentController = void 0;
const shipment_service_1 = require("../services/shipment.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const express_validator_1 = require("express-validator");
class ShipmentController {
    constructor() {
        // Get all shipments
        this.getShipments = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                poId: req.query.poId,
                status: req.query.status,
                awb: req.query.awb,
                masterCarton: req.query.masterCarton,
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
            const result = await this.shipmentService.getShipments(filters);
            res.json({
                success: true,
                data: result.data,
                total: result.total,
                limit: filters.limit,
                offset: filters.offset,
            });
        });
        // Get single shipment
        this.getShipment = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const shipment = await this.shipmentService.getShipmentById(id);
            if (!shipment) {
                res.status(404).json({
                    success: false,
                    error: 'Shipment not found',
                });
                return;
            }
            res.json({
                success: true,
                data: shipment,
            });
        });
        // Create new shipment
        this.createShipment = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const shipmentData = {
                ...req.body,
                created_by: req.user?.id,
                company_id: req.user?.companyId,
            };
            const shipment = await this.shipmentService.createShipment(shipmentData);
            logger_1.logger.info(`Shipment created: ${shipment.id} by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: shipment,
            });
        });
        // Update shipment
        this.updateShipment = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const shipment = await this.shipmentService.updateShipment(id, req.body);
            logger_1.logger.info(`Shipment updated: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: shipment,
            });
        });
        // Update shipment status
        this.updateShipmentStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status, location, notes } = req.body;
            if (!status) {
                res.status(400).json({
                    success: false,
                    error: 'Status is required',
                });
                return;
            }
            const shipment = await this.shipmentService.updateShipmentStatus(id, status, location, notes, req.user?.id);
            logger_1.logger.info(`Shipment ${id} status updated to ${status} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: shipment,
            });
        });
        // Track AWB
        this.trackAWB = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { awb } = req.params;
            const tracking = await this.shipmentService.trackAWB(awb);
            if (!tracking) {
                res.status(404).json({
                    success: false,
                    error: 'AWB not found',
                });
                return;
            }
            res.json({
                success: true,
                data: tracking,
            });
        });
        // Create master carton
        this.createMasterCarton = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const { cartonNumber, mtoIds, dimensions, weight } = req.body;
            if (!cartonNumber || !mtoIds || !Array.isArray(mtoIds)) {
                res.status(400).json({
                    success: false,
                    error: 'Carton number and MTO IDs are required',
                });
                return;
            }
            const masterCarton = await this.shipmentService.createMasterCarton({
                cartonNumber,
                mtoIds,
                dimensions,
                weight,
                created_by: req.user?.id,
            });
            logger_1.logger.info(`Master carton created: ${cartonNumber} by user: ${req.user?.email}`);
            res.status(201).json({
                success: true,
                data: masterCarton,
            });
        });
        // Get master carton details
        this.getMasterCarton = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { cartonNumber } = req.params;
            const carton = await this.shipmentService.getMasterCarton(cartonNumber);
            if (!carton) {
                res.status(404).json({
                    success: false,
                    error: 'Master carton not found',
                });
                return;
            }
            res.json({
                success: true,
                data: carton,
            });
        });
        // Generate packing list
        this.generatePackingList = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { shipmentId } = req.params;
            const pdf = await this.shipmentService.generatePackingList(shipmentId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=packing-list-${shipmentId}.pdf`);
            res.send(pdf);
        });
        // Generate shipping labels
        this.generateShippingLabels = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { shipmentId } = req.params;
            const pdf = await this.shipmentService.generateShippingLabels(shipmentId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=shipping-labels-${shipmentId}.pdf`);
            res.send(pdf);
        });
        // Delete shipment
        this.deleteShipment = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            // Only admin can delete shipments
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Only administrators can delete shipments',
                });
                return;
            }
            await this.shipmentService.deleteShipment(id);
            logger_1.logger.info(`Shipment deleted: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Shipment deleted successfully',
            });
        });
        // Get delivery status
        this.getDeliveryStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const status = await this.shipmentService.getDeliveryStatus(id);
            res.json({
                success: true,
                data: status,
            });
        });
        // Update delivery confirmation
        this.confirmDelivery = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { signature, notes, photos } = req.body;
            const confirmation = await this.shipmentService.confirmDelivery(id, {
                signature,
                notes,
                photos,
                confirmed_by: req.user?.id,
                confirmed_at: new Date(),
            });
            logger_1.logger.info(`Delivery confirmed for shipment ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: confirmation,
            });
        });
        // Get shipment timeline
        this.getShipmentTimeline = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const timeline = await this.shipmentService.getShipmentTimeline(id);
            res.json({
                success: true,
                data: timeline,
            });
        });
        // Get shipping statistics
        this.getShippingStatistics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId,
                factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId,
            };
            const stats = await this.shipmentService.getShippingStatistics(filters);
            res.json({
                success: true,
                data: stats,
            });
        });
        // Export shipments report
        this.exportShipmentsReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                status: req.query.status,
                companyId: req.user?.companyId,
            };
            const buffer = await this.shipmentService.exportShipmentsToExcel(filters);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=shipments-report-${Date.now()}.xlsx`);
            res.send(buffer);
        });
        this.shipmentService = new shipment_service_1.ShipmentService();
    }
}
exports.ShipmentController = ShipmentController;
exports.default = new ShipmentController();
//# sourceMappingURL=shipment.controller.js.map