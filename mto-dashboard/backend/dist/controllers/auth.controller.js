"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../config/supabase");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const express_validator_1 = require("express-validator");
class AuthController {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
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
                // Check if user already exists
                const { data: existingUser } = await this.supabase
                    .from('users')
                    .select('id')
                    .eq('email', email)
                    .single();
                if (existingUser) {
                    res.status(400).json({
                        success: false,
                        error: 'User with this email already exists',
                    });
                    return;
                }
                // Hash password
                const hashedPassword = await bcryptjs_1.default.hash(password, 10);
                // Create user in Supabase Auth
                const { data: authData, error: authError } = await this.supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name,
                        },
                    },
                });
                if (authError) {
                    throw authError;
                }
                // Create user profile
                const { data: user, error: profileError } = await this.supabase
                    .from('users')
                    .insert({
                    id: authData.user?.id,
                    email,
                    full_name,
                    role: role || 'viewer',
                    company_id,
                    is_active: true,
                })
                    .select()
                    .single();
                if (profileError) {
                    // Clean up auth user if profile creation fails
                    await this.supabase.auth.admin.deleteUser(authData.user.id);
                    throw profileError;
                }
                // Generate JWT token
                const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, companyId: user.company_id }, process.env.JWT_SECRET || 'your_jwt_secret_here_change_this_in_production', { expiresIn: '7d' });
                logger_1.logger.info(`New user registered: ${email}`);
                res.status(201).json({
                    success: true,
                    data: {
                        user: {
                            id: user.id,
                            email: user.email,
                            full_name: user.full_name,
                            role: user.role,
                        },
                        token,
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
                // Sign in with Supabase Auth
                const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (authError) {
                    res.status(401).json({
                        success: false,
                        error: 'Invalid email or password',
                    });
                    return;
                }
                // Get user profile
                const { data: user, error: userError } = await this.supabase
                    .from('users')
                    .select(`
          *,
          company:companies(*)
        `)
                    .eq('id', authData.user.id)
                    .single();
                if (userError || !user) {
                    res.status(401).json({
                        success: false,
                        error: 'User profile not found',
                    });
                    return;
                }
                if (!user.is_active) {
                    res.status(403).json({
                        success: false,
                        error: 'Account is deactivated',
                    });
                    return;
                }
                // Generate JWT token
                const token = jsonwebtoken_1.default.sign({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    companyId: user.company_id,
                    companyType: user.company?.type,
                }, process.env.JWT_SECRET || 'your_jwt_secret_here_change_this_in_production', { expiresIn: '7d' });
                logger_1.logger.info(`User logged in: ${email}`);
                res.json({
                    success: true,
                    data: {
                        user: {
                            id: user.id,
                            email: user.email,
                            full_name: user.full_name,
                            role: user.role,
                            company: user.company,
                        },
                        token,
                    },
                });
            }
            catch (error) {
                logger_1.logger.error('Login error:', error);
                res.status(401).json({
                    success: false,
                    error: 'Login failed',
                });
            }
        });
        // Logout
        this.logout = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            try {
                await this.supabase.auth.signOut();
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
            const { data: user, error } = await this.supabase
                .from('users')
                .select(`
        *,
        company:companies(*)
      `)
                .eq('id', req.user.id)
                .single();
            if (error || !user) {
                res.status(404).json({
                    success: false,
                    error: 'User not found',
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    company: user.company,
                },
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
                // Verify current password
                const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                    email: req.user.email,
                    password: currentPassword,
                });
                if (authError) {
                    res.status(401).json({
                        success: false,
                        error: 'Current password is incorrect',
                    });
                    return;
                }
                // Update password
                const { error: updateError } = await this.supabase.auth.updateUser({
                    password: newPassword,
                });
                if (updateError) {
                    throw updateError;
                }
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
                    error: 'Failed to update password',
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
                const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${process.env.CLIENT_URL}/reset-password`,
                });
                if (error) {
                    throw error;
                }
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
                const { error } = await this.supabase.auth.updateUser({
                    password: newPassword,
                });
                if (error) {
                    throw error;
                }
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