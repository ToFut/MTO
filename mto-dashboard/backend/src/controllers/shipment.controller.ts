import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ShipmentService } from '../services/shipment.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';

export class ShipmentController {
  private shipmentService: ShipmentService;

  constructor() {
    this.shipmentService = new ShipmentService();
  }

  // Get all shipments
  getShipments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      poId: req.query.poId as string,
      status: req.query.status as string,
      awb: req.query.awb as string,
      masterCarton: req.query.masterCarton as string,
      brandId: req.query.brandId as string,
      factoryId: req.query.factoryId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    // Apply company filter based on user role
    if (req.user?.companyType === 'brand') {
      filters.brandId = req.user.companyId;
    } else if (req.user?.companyType === 'factory') {
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
  getShipment = asyncHandler(async (req: AuthRequest, res: Response) => {
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
  createShipment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
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
    
    logger.info(`Shipment created: ${shipment.id} by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: shipment,
    });
  });

  // Update shipment
  updateShipment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const shipment = await this.shipmentService.updateShipment(id, req.body);
    
    logger.info(`Shipment updated: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: shipment,
    });
  });

  // Update shipment status
  updateShipmentStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, location, notes } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Status is required',
      });
      return;
    }

    const shipment = await this.shipmentService.updateShipmentStatus(
      id,
      status,
      location,
      notes,
      req.user?.id!
    );
    
    logger.info(`Shipment ${id} status updated to ${status} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: shipment,
    });
  });

  // Track AWB
  trackAWB = asyncHandler(async (req: AuthRequest, res: Response) => {
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
  createMasterCarton = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
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
    
    logger.info(`Master carton created: ${cartonNumber} by user: ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: masterCarton,
    });
  });

  // Get master carton details
  getMasterCarton = asyncHandler(async (req: AuthRequest, res: Response) => {
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
  generatePackingList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { shipmentId } = req.params;
    
    const pdf = await this.shipmentService.generatePackingList(shipmentId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=packing-list-${shipmentId}.pdf`);
    res.send(pdf);
  });

  // Generate shipping labels
  generateShippingLabels = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { shipmentId } = req.params;
    
    const pdf = await this.shipmentService.generateShippingLabels(shipmentId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=shipping-labels-${shipmentId}.pdf`);
    res.send(pdf);
  });

  // Delete shipment
  deleteShipment = asyncHandler(async (req: AuthRequest, res: Response) => {
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
    
    logger.info(`Shipment deleted: ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Shipment deleted successfully',
    });
  });

  // Get delivery status
  getDeliveryStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const status = await this.shipmentService.getDeliveryStatus(id);
    
    res.json({
      success: true,
      data: status,
    });
  });

  // Update delivery confirmation
  confirmDelivery = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { signature, notes, photos } = req.body;

    const confirmation = await this.shipmentService.confirmDelivery(
      id,
      {
        signature,
        notes,
        photos,
        confirmed_by: req.user?.id,
        confirmed_at: new Date(),
      }
    );
    
    logger.info(`Delivery confirmed for shipment ${id} by user: ${req.user?.email}`);
    
    res.json({
      success: true,
      data: confirmation,
    });
  });

  // Get shipment timeline
  getShipmentTimeline = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const timeline = await this.shipmentService.getShipmentTimeline(id);
    
    res.json({
      success: true,
      data: timeline,
    });
  });

  // Get shipping statistics
  getShippingStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      brandId: req.user?.companyType === 'brand' ? req.user.companyId : req.query.brandId as string,
      factoryId: req.user?.companyType === 'factory' ? req.user.companyId : req.query.factoryId as string,
    };

    const stats = await this.shipmentService.getShippingStatistics(filters);
    
    res.json({
      success: true,
      data: stats,
    });
  });

  // Export shipments report
  exportShipmentsReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      status: req.query.status as string,
      companyId: req.user?.companyId,
    };

    const buffer = await this.shipmentService.exportShipmentsToExcel(filters);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=shipments-report-${Date.now()}.xlsx`);
    res.send(buffer);
  });
}

export default new ShipmentController();