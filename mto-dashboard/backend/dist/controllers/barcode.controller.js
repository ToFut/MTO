"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodeController = void 0;
const barcode_service_1 = require("../services/barcode.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const express_validator_1 = require("express-validator");
class BarcodeController {
    constructor() {
        // Generate barcode for MTO
        this.generateMTOBarcode = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { mtoId } = req.params;
            const { type } = req.body;
            if (!type || !['spot', 'line', 'master', 'po'].includes(type)) {
                res.status(400).json({
                    success: false,
                    error: 'Valid barcode type is required (spot, line, master, po)',
                });
                return;
            }
            const barcode = await this.barcodeService.generateMTOBarcode(mtoId, type);
            logger_1.logger.info(`Barcode generated for MTO ${mtoId}, type: ${type} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: barcode,
            });
        });
        // Generate bulk barcodes for PO
        this.generatePOBarcodes = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { poId } = req.params;
            const barcodes = await this.barcodeService.generatePOBarcodes(poId);
            logger_1.logger.info(`Bulk barcodes generated for PO ${poId} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: barcodes,
                count: barcodes.length,
            });
        });
        // Get barcode by ID
        this.getBarcode = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const barcode = await this.barcodeService.getBarcodeById(id);
            if (!barcode) {
                res.status(404).json({
                    success: false,
                    error: 'Barcode not found',
                });
                return;
            }
            res.json({
                success: true,
                data: barcode,
            });
        });
        // Scan barcode
        this.scanBarcode = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { code } = req.body;
            if (!code) {
                res.status(400).json({
                    success: false,
                    error: 'Barcode value is required',
                });
                return;
            }
            const result = await this.barcodeService.scanBarcode(code, req.user?.id);
            if (!result) {
                res.status(404).json({
                    success: false,
                    error: 'Barcode not found or invalid',
                });
                return;
            }
            logger_1.logger.info(`Barcode scanned: ${code} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: result,
            });
        });
        // Get MTO barcodes
        this.getMTOBarcodes = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { mtoId } = req.params;
            const barcodes = await this.barcodeService.getMTOBarcodes(mtoId);
            res.json({
                success: true,
                data: barcodes,
            });
        });
        // Print barcode labels
        this.printBarcodeLabels = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { barcodeIds, format } = req.body;
            if (!barcodeIds || !Array.isArray(barcodeIds) || barcodeIds.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Barcode IDs array is required',
                });
                return;
            }
            const pdf = await this.barcodeService.generateBarcodeLabels(barcodeIds, format || 'standard');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=barcode-labels-${Date.now()}.pdf`);
            res.send(pdf);
        });
        // Bulk print for master carton
        this.printMasterCartonLabels = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { masterCartonId } = req.params;
            const pdf = await this.barcodeService.generateMasterCartonLabels(masterCartonId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=master-carton-${masterCartonId}-labels.pdf`);
            res.send(pdf);
        });
        // Update barcode scan status
        this.updateScanStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status, location, notes } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const barcode = await this.barcodeService.updateScanStatus(id, {
                status,
                location,
                notes,
                scanned_by: req.user?.id,
            });
            logger_1.logger.info(`Barcode ${id} status updated to ${status} by user: ${req.user?.email}`);
            res.json({
                success: true,
                data: barcode,
            });
        });
        // Get scan history
        this.getScanHistory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const history = await this.barcodeService.getScanHistory(id);
            res.json({
                success: true,
                data: history,
            });
        });
        // Validate barcode format
        this.validateBarcode = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { code } = req.body;
            if (!code) {
                res.status(400).json({
                    success: false,
                    error: 'Barcode value is required',
                });
                return;
            }
            const isValid = await this.barcodeService.validateBarcodeFormat(code);
            res.json({
                success: true,
                data: {
                    code,
                    isValid,
                    parsedData: isValid ? this.barcodeService.parseBarcodeData(code) : null,
                },
            });
        });
        // Generate spot barcode sheet
        this.generateSpotBarcodeSheet = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { mtoId } = req.params;
            const pdf = await this.barcodeService.generateSpotBarcodeSheet(mtoId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=mto-${mtoId}-spot-barcodes.pdf`);
            res.send(pdf);
        });
        // Get barcode statistics
        this.getBarcodeStatistics = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                type: req.query.type,
                companyId: req.user?.companyId,
            };
            const stats = await this.barcodeService.getBarcodeStatistics(filters);
            res.json({
                success: true,
                data: stats,
            });
        });
        // Delete barcode
        this.deleteBarcode = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            // Only admin can delete barcodes
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Only administrators can delete barcodes',
                });
                return;
            }
            await this.barcodeService.deleteBarcode(id);
            logger_1.logger.info(`Barcode deleted: ${id} by user: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Barcode deleted successfully',
            });
        });
        this.barcodeService = new barcode_service_1.BarcodeService();
    }
}
exports.BarcodeController = BarcodeController;
exports.default = new BarcodeController();
//# sourceMappingURL=barcode.controller.js.map