import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { strictRateLimiter } from '../middleware/rateLimit.middleware';
import { body } from 'express-validator';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('company_id').isUUID().withMessage('Valid company ID is required'),
  body('role').optional().isIn(['viewer', 'brand_manager', 'factory_manager', 'production', 'qc', 'shipping', 'admin']),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

// Routes
router.post('/register', strictRateLimiter, registerValidation, authController.register);
router.post('/login', strictRateLimiter, loginValidation, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/password', authenticate, updatePasswordValidation, authController.updatePassword);
router.post('/forgot-password', strictRateLimiter, forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', strictRateLimiter, resetPasswordValidation, authController.resetPassword);

export default router;