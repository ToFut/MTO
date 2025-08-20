import { Router } from 'express';
import assignmentController from '../controllers/assignment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { body, param } from 'express-validator';

const router = Router();

// Validation rules
const createAssignmentValidation = [
  body('brand_id').isUUID().withMessage('Valid brand ID is required'),
  body('factory_id').isUUID().withMessage('Valid factory ID is required'),
  body('capabilities').optional().isArray().withMessage('Capabilities must be an array'),
  body('production_capacity').optional().isInt({ min: 0 }).withMessage('Production capacity must be a positive number'),
  body('quality_rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Quality rating must be between 0 and 10'),
  body('preferred_for_categories').optional().isArray().withMessage('Preferred categories must be an array'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

const updateAssignmentValidation = [
  body('capabilities').optional().isArray().withMessage('Capabilities must be an array'),
  body('production_capacity').optional().isInt({ min: 0 }).withMessage('Production capacity must be a positive number'),
  body('quality_rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Quality rating must be between 0 and 10'),
  body('preferred_for_categories').optional().isArray().withMessage('Preferred categories must be an array'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

const uuidValidation = [
  param('id').isUUID().withMessage('Valid ID is required'),
];

const brandIdValidation = [
  param('brandId').isUUID().withMessage('Valid brand ID is required'),
];

const factoryIdValidation = [
  param('factoryId').isUUID().withMessage('Valid factory ID is required'),
];

// Routes

// Create new assignment (Admin only)
router.post('/', 
  authenticate, 
  authorize(['admin']), 
  createAssignmentValidation, 
  assignmentController.createAssignment
);

// Get all assignments (filtered by role)
router.get('/', 
  authenticate, 
  assignmentController.getAssignments
);

// Get assignment by ID
router.get('/:id', 
  authenticate, 
  uuidValidation, 
  assignmentController.getAssignmentById
);

// Update assignment (Admin only)
router.put('/:id', 
  authenticate, 
  authorize(['admin']), 
  uuidValidation, 
  updateAssignmentValidation, 
  assignmentController.updateAssignment
);

// Delete assignment (Admin only)
router.delete('/:id', 
  authenticate, 
  authorize(['admin']), 
  uuidValidation, 
  assignmentController.deleteAssignment
);

// Get available factories for a brand (Admin only)
router.get('/brands/:brandId/available-factories', 
  authenticate, 
  authorize(['admin']), 
  brandIdValidation, 
  assignmentController.getAvailableFactories
);

// Get assigned factories for a brand
router.get('/brands/:brandId/factories', 
  authenticate, 
  brandIdValidation, 
  assignmentController.getAssignedFactories
);

// Get brands for a factory
router.get('/factories/:factoryId/brands', 
  authenticate, 
  factoryIdValidation, 
  assignmentController.getBrandsForFactory
);

export default router;