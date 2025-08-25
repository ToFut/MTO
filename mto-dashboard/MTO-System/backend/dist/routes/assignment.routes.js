"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_1 = __importDefault(require("../controllers/assignment.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Validation rules
const createAssignmentValidation = [
    (0, express_validator_1.body)('brand_id').isUUID().withMessage('Valid brand ID is required'),
    (0, express_validator_1.body)('factory_id').isUUID().withMessage('Valid factory ID is required'),
    (0, express_validator_1.body)('capabilities').optional().isArray().withMessage('Capabilities must be an array'),
    (0, express_validator_1.body)('production_capacity').optional().isInt({ min: 0 }).withMessage('Production capacity must be a positive number'),
    (0, express_validator_1.body)('quality_rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Quality rating must be between 0 and 10'),
    (0, express_validator_1.body)('preferred_for_categories').optional().isArray().withMessage('Preferred categories must be an array'),
    (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
];
const updateAssignmentValidation = [
    (0, express_validator_1.body)('capabilities').optional().isArray().withMessage('Capabilities must be an array'),
    (0, express_validator_1.body)('production_capacity').optional().isInt({ min: 0 }).withMessage('Production capacity must be a positive number'),
    (0, express_validator_1.body)('quality_rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Quality rating must be between 0 and 10'),
    (0, express_validator_1.body)('preferred_for_categories').optional().isArray().withMessage('Preferred categories must be an array'),
    (0, express_validator_1.body)('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
    (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
];
const uuidValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid ID is required'),
];
const brandIdValidation = [
    (0, express_validator_1.param)('brandId').isUUID().withMessage('Valid brand ID is required'),
];
const factoryIdValidation = [
    (0, express_validator_1.param)('factoryId').isUUID().withMessage('Valid factory ID is required'),
];
// Routes
// Create new assignment (Admin only)
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), createAssignmentValidation, assignment_controller_1.default.createAssignment);
// Get all assignments (filtered by role)
router.get('/', auth_middleware_1.authenticate, assignment_controller_1.default.getAssignments);
// Get assignment by ID
router.get('/:id', auth_middleware_1.authenticate, uuidValidation, assignment_controller_1.default.getAssignmentById);
// Update assignment (Admin only)
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), uuidValidation, updateAssignmentValidation, assignment_controller_1.default.updateAssignment);
// Delete assignment (Admin only)
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), uuidValidation, assignment_controller_1.default.deleteAssignment);
// Get available factories for a brand (Admin only)
router.get('/brands/:brandId/available-factories', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), brandIdValidation, assignment_controller_1.default.getAvailableFactories);
// Get assigned factories for a brand
router.get('/brands/:brandId/factories', auth_middleware_1.authenticate, brandIdValidation, assignment_controller_1.default.getAssignedFactories);
// Get brands for a factory
router.get('/factories/:factoryId/brands', auth_middleware_1.authenticate, factoryIdValidation, assignment_controller_1.default.getBrandsForFactory);
exports.default = router;
//# sourceMappingURL=assignment.routes.js.map