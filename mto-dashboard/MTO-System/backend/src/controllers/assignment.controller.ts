import { Request, Response } from 'express';
import { assignmentService } from '../services/assignment.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class AssignmentController {
  // Create new brand-factory assignment (Admin only)
  createAssignment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { brand_id, factory_id, capabilities, production_capacity, quality_rating, preferred_for_categories, notes } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Only admins can create assignments
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Only administrators can create brand-factory assignments',
      });
      return;
    }

    try {
      const assignment = await assignmentService.createAssignment({
        brand_id,
        factory_id,
        assigned_by: req.user.id,
        capabilities,
        production_capacity,
        quality_rating,
        preferred_for_categories,
        notes,
      });

      logger.info(`Assignment created by admin ${req.user.email}: Brand ${brand_id} -> Factory ${factory_id}`);

      res.status(201).json({
        success: true,
        data: assignment,
      });
    } catch (error: any) {
      logger.error('Assignment creation error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to create assignment',
      });
    }
  });

  // Get all assignments with filters
  getAssignments = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    try {
      const filters: any = {
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
      };

      // Apply role-based filtering
      if (req.user.role === 'brand_manager') {
        filters.brand_id = req.user.companyId;
      } else if (req.user.role === 'factory_operator') {
        filters.factory_id = req.user.companyId;
      }
      // Admins can see all assignments (no additional filters)

      // Optional query filters
      if (req.query.brand_id) filters.brand_id = req.query.brand_id;
      if (req.query.factory_id) filters.factory_id = req.query.factory_id;
      if (req.query.status) filters.status = req.query.status;

      const assignments = await assignmentService.getAssignments(filters);

      res.json({
        success: true,
        data: assignments,
        filters: filters,
      });
    } catch (error: any) {
      logger.error('Get assignments error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch assignments',
      });
    }
  });

  // Get assignment by ID
  getAssignmentById = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    try {
      const assignment = await assignmentService.getAssignmentById(req.params.id);

      if (!assignment) {
        res.status(404).json({
          success: false,
          error: 'Assignment not found',
        });
        return;
      }

      // Check permissions
      if (req.user.role !== 'admin') {
        const hasAccess = (req.user.role === 'brand_manager' && assignment.brand_id === req.user.companyId) ||
                         (req.user.role === 'factory_operator' && assignment.factory_id === req.user.companyId);
        
        if (!hasAccess) {
          res.status(403).json({
            success: false,
            error: 'Access denied',
          });
          return;
        }
      }

      res.json({
        success: true,
        data: assignment,
      });
    } catch (error: any) {
      logger.error('Get assignment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch assignment',
      });
    }
  });

  // Update assignment (Admin only)
  updateAssignment = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Only admins can update assignments
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Only administrators can update assignments',
      });
      return;
    }

    try {
      const updateData = req.body;
      const assignment = await assignmentService.updateAssignment(req.params.id, updateData);

      logger.info(`Assignment updated by admin ${req.user.email}: ${req.params.id}`);

      res.json({
        success: true,
        data: assignment,
      });
    } catch (error: any) {
      logger.error('Update assignment error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to update assignment',
      });
    }
  });

  // Delete assignment (Admin only)
  deleteAssignment = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Only admins can delete assignments
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Only administrators can delete assignments',
      });
      return;
    }

    try {
      await assignmentService.deleteAssignment(req.params.id);

      logger.info(`Assignment deleted by admin ${req.user.email}: ${req.params.id}`);

      res.json({
        success: true,
        message: 'Assignment deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete assignment error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to delete assignment',
      });
    }
  });

  // Get available factories for a brand (Admin only)
  getAvailableFactories = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Only administrators can access this resource',
      });
      return;
    }

    try {
      const factories = await assignmentService.getAvailableFactoriesForBrand(req.params.brandId);

      res.json({
        success: true,
        data: factories,
      });
    } catch (error: any) {
      logger.error('Get available factories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch available factories',
      });
    }
  });

  // Get assigned factories for a brand
  getAssignedFactories = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    try {
      const brandId = req.params.brandId;

      // Check permissions
      if (req.user.role !== 'admin' && req.user.companyId !== brandId) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      const assignments = await assignmentService.getAssignedFactoriesForBrand(brandId);

      res.json({
        success: true,
        data: assignments,
      });
    } catch (error: any) {
      logger.error('Get assigned factories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch assigned factories',
      });
    }
  });

  // Get brands for a factory
  getBrandsForFactory = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    try {
      const factoryId = req.params.factoryId;

      // Check permissions
      if (req.user.role !== 'admin' && req.user.companyId !== factoryId) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      const assignments = await assignmentService.getBrandsForFactory(factoryId);

      res.json({
        success: true,
        data: assignments,
      });
    } catch (error: any) {
      logger.error('Get brands for factory error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch brands for factory',
      });
    }
  });
}

export default new AssignmentController();