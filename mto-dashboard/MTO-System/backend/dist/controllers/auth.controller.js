"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const express_validator_1 = require("express-validator");
class AuthController {
    constructor() {
        // Register new user
        this.register = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const { email, password, full_name, role, company_id } = req.body;
            try {
                const result = await auth_service_1.authService.register({
                    email,
                    full_name,
                    role: role || 'viewer',
                    company_id,
                    password,
                });
                logger_1.logger.info(`New user registered: ${email}`);
                res.status(201).json({
                    success: true,
                    data: {
                        user: result.user,
                        token: result.token,
                    },
                });
            }
            catch (error) {
                logger_1.logger.error('Registration error:', error);
                res.status(400).json({
                    success: false,
                    error: error.message || 'Registration failed',
                });
            }
        });
        // Login
        this.login = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const { email, password } = req.body;
            try {
                const result = await auth_service_1.authService.login({ email, password });
                logger_1.logger.info(`User logged in: ${email}`);
                res.json({
                    success: true,
                    data: {
                        user: result.user,
                        token: result.token,
                    },
                });
            }
            catch (error) {
                logger_1.logger.error('Login error:', error);
                res.status(401).json({
                    success: false,
                    error: error.message || 'Login failed',
                });
            }
        });
        // Logout
        this.logout = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            try {
                logger_1.logger.info(`User logged out: ${req.user?.email}`);
                res.json({
                    success: true,
                    message: 'Logged out successfully',
                });
            }
            catch (error) {
                logger_1.logger.error('Logout error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Logout failed',
                });
            }
        });
        // Get current user
        this.getCurrentUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Not authenticated',
                });
                return;
            }
            const user = await auth_service_1.authService.getUserById(req.user.id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User not found',
                });
                return;
            }
            res.json({
                success: true,
                data: user,
            });
        });
        // Update password
        this.updatePassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const { currentPassword, newPassword } = req.body;
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Not authenticated',
                });
                return;
            }
            try {
                await auth_service_1.authService.changePassword(req.user.id, currentPassword, newPassword);
                logger_1.logger.info(`Password updated for user: ${req.user.email}`);
                res.json({
                    success: true,
                    message: 'Password updated successfully',
                });
            }
            catch (error) {
                logger_1.logger.error('Password update error:', error);
                res.status(400).json({
                    success: false,
                    error: error.message || 'Failed to update password',
                });
            }
        });
        // Forgot password
        this.forgotPassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const { email } = req.body;
            try {
                // For now, just log the request
                // In production, you would send an actual email
                logger_1.logger.info(`Password reset requested for: ${email}`);
                res.json({
                    success: true,
                    message: 'Password reset email sent',
                });
            }
            catch (error) {
                logger_1.logger.error('Forgot password error:', error);
                res.status(400).json({
                    success: false,
                    error: 'Failed to send password reset email',
                });
            }
        });
        // Reset password
        this.resetPassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }
            const { token, newPassword } = req.body;
            try {
                // In production, you would verify the token and update the password
                logger_1.logger.info('Password reset completed');
                res.json({
                    success: true,
                    message: 'Password reset successfully',
                });
            }
            catch (error) {
                logger_1.logger.error('Reset password error:', error);
                res.status(400).json({
                    success: false,
                    error: 'Failed to reset password',
                });
            }
        });
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map