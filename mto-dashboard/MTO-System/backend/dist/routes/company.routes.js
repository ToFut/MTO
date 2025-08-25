"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all companies
router.get('/', company_controller_1.companyController.getCompanies);
// Get single company
router.get('/:id', company_controller_1.companyController.getCompany);
// Create new company (admin only)
router.post('/', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Company name is required'),
    (0, express_validator_1.body)('code').notEmpty().withMessage('Company code is required'),
    (0, express_validator_1.body)('type').isIn(['brand', 'factory']).withMessage('Type must be brand or factory')
], company_controller_1.companyController.createCompany);
// Update company
router.put('/:id', company_controller_1.companyController.updateCompany);
// Toggle company active status
router.patch('/:id', company_controller_1.companyController.toggleCompanyStatus);
// Delete company (admin only)
router.delete('/:id', company_controller_1.companyController.deleteCompany);
exports.default = router;
//# sourceMappingURL=company.routes.js.map