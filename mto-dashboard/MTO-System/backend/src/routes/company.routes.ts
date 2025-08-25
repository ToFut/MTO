import { Router } from 'express';
import { companyController } from '../controllers/company.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all companies
router.get('/', companyController.getCompanies);

// Get single company
router.get('/:id', companyController.getCompany);

// Create new company (admin only)
router.post('/',
  [
    body('name').notEmpty().withMessage('Company name is required'),
    body('code').notEmpty().withMessage('Company code is required'),
    body('type').isIn(['brand', 'factory']).withMessage('Type must be brand or factory')
  ],
  companyController.createCompany
);

// Update company
router.put('/:id', companyController.updateCompany);

// Toggle company active status
router.patch('/:id', companyController.toggleCompanyStatus);

// Delete company (admin only)
router.delete('/:id', companyController.deleteCompany);

export default router;