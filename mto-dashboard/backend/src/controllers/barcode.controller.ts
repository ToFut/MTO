import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BarcodeService } from '../services/barcode.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';

export class BarcodeController {
  private barcodeService: BarcodeService;

  constructor() {
    this.barcodeService = new BarcodeService();
  }

  // Generate barcode for MTO
  generateMTOBarcode = asyncHandler(async (req: AuthRequest, res: Response) => {
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
    
    logger.info(`Barcode generated for MTO ${mtoId}, type: ${type} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: barcode,
    });
  });

  // Generate bulk barcodes for PO
  generatePOBarcodes = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { poId } = req.params;
    
    const barcodes = await this.barcodeService.generatePOBarcodes(poId);
    
    logger.info(`Bulk barcodes generated for PO ${poId} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: barcodes,
      count: barcodes.length,
    });
  });

  // Get barcode by ID
  getBarcode = asyncHandler(async (req: AuthRequest, res: Response) => {
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
  scanBarcode = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({
        success: false,
        error: 'Barcode value is required',
      });
      return;
    }

    const result = await this.barcodeService.scanBarcode(code, req.user?.id!);
    
    if (!result) {
      res.status(404).json({
        success: false,
        error: 'Barcode not found or invalid',
      });
      return;
    }

    logger.info(`Barcode scanned: ${code} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: result,
    });
  });

  // Get MTO barcodes
  getMTOBarcodes = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { mtoId } = req.params;
    
    const barcodes = await this.barcodeService.getMTOBarcodes(mtoId);
    
    res.json({
      success: true,
      data: barcodes,
    });
  });

  // Print barcode labels
  printBarcodeLabels = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { barcodeIds, format } = req.body;

    if (!barcodeIds || !Array.isArray(barcodeIds) || barcodeIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Barcode IDs array is required',
      });
      return;
    }

    const pdf = await this.barcodeService.generateBarcodeLabels(
      barcodeIds,
      format || 'standard'
    );
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=barcode-labels-${Date.now()}.pdf`);
    res.send(pdf);
  });

  // Bulk print for master carton
  printMasterCartonLabels = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { masterCartonId } = req.params;
    
    const pdf = await this.barcodeService.generateMasterCartonLabels(masterCartonId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=master-carton-${masterCartonId}-labels.pdf`);
    res.send(pdf);
  });

  // Update barcode scan status
  updateScanStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, location, notes } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const barcode = await this.barcodeService.updateScanStatus(
      id,
      {
        status,
        location,
        notes,
        scanned_by: req.user?.id,
      }
    );
    
    logger.info(`Barcode ${id} status updated to ${status} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: barcode,
    });
  });

  // Get scan history
  getScanHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const history = await this.barcodeService.getScanHistory(id);
    
    res.json({
      success: true,
      data: history,
    });
  });

  // Validate barcode format
  validateBarcode = asyncHandler(async (req: AuthRequest, res: Response) => {
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
  generateSpotBarcodeSheet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { mtoId } = req.params;
    
    const pdf = await this.barcodeService.generateSpotBarcodeSheet(mtoId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=mto-${mtoId}-spot-barcodes.pdf`);
    res.send(pdf);
  });

  // Get barcode statistics
  getBarcodeStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      type: req.query.type as string,
      companyId: req.user?.companyId,
    };

    const stats = await this.barcodeService.getBarcodeStatistics(filters);
    
    res.json({
      success: true,
      data: stats,
    });
  });

  // Delete barcode
  deleteBarcode = asyncHandler(async (req: AuthRequest, res: Response) => {
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
    
    logger.info(`Barcode deleted: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Barcode deleted successfully',
    });
  });
}

export default new BarcodeController();