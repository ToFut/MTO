"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Validation rules
const registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (0, express_validator_1.body)('full_name').notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('company_id').optional().isUUID().withMessage('Valid company ID is required'),
    (0, express_validator_1.body)('role').optional().isIn(['viewer', 'brand_manager', 'factory_manager', 'production', 'qc', 'shipping', 'admin']),
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
const updatePasswordValidation = [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Reset token is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];
// Routes
router.post('/register', rateLimit_middleware_1.strictRateLimiter, registerValidation, auth_controller_1.default.register);
router.post('/login', rateLimit_middleware_1.strictRateLimiter, loginValidation, auth_controller_1.default.login);
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.default.logout);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.default.getCurrentUser);
router.put('/password', auth_middleware_1.authenticate, updatePasswordValidation, auth_controller_1.default.updatePassword);
router.post('/forgot-password', rateLimit_middleware_1.strictRateLimiter, forgotPasswordValidation, auth_controller_1.default.forgotPassword);
router.post('/reset-password', rateLimit_middleware_1.strictRateLimiter, resetPasswordValidation, auth_controller_1.default.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map