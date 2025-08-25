"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const error_middleware_1 = require("../middleware/error.middleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    constructor() {
        // Get all users (admin only)
        this.getUsers = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            try {
                // Check if user is admin
                if (req.user?.role !== 'admin') {
                    res.status(403).json({
                        success: false,
                        error: 'Access denied. Admin only.'
                    });
                    return;
                }
                const { data: users, error } = await database_1.db
                    .from('users')
                    .select(`
          id,
          email,
          full_name,
          role,
          company_id,
          language,
          active,
          created_at,
          last_login,
          company:companies(id, name, type)
        `)
                    .order('created_at', { ascending: false });
                if (error) {
                    logger_1.logger.error('Error fetching users:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to fetch users'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: users || []
                });
            }
            catch (error) {
                logger_1.logger.error('Error in getUsers:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch users'
                });
            }
        });
        // Get single user
        this.getUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            try {
                const { data: user, error } = await database_1.db
                    .from('users')
                    .select(`
          id,
          email,
          full_name,
          role,
          company_id,
          language,
          phone,
          avatar_url,
          preferences,
          active,
          created_at,
          last_login,
          company:companies(*)
        `)
                    .eq('id', id)
                    .single();
                if (error || !user) {
                    res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: user
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching user:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch user'
                });
            }
        });
        // Create user (admin only)
        this.createUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            // Check if user is admin
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Access denied. Admin only.'
                });
                return;
            }
            const { email, password, full_name, role, company_id } = req.body;
            try {
                // Check if user already exists
                const { data: existing } = await database_1.db
                    .from('users')
                    .select('id')
                    .eq('email', email)
                    .single();
                if (existing) {
                    res.status(400).json({
                        success: false,
                        error: 'User with this email already exists'
                    });
                    return;
                }
                // Hash password
                const passwordHash = await bcryptjs_1.default.hash(password, 12);
                // Create user
                const { data: user, error } = await database_1.db
                    .from('users')
                    .insert({
                    email,
                    password_hash: passwordHash,
                    full_name,
                    role,
                    company_id,
                    language: 'en',
                    active: true
                })
                    .select()
                    .single();
                if (error) {
                    logger_1.logger.error('Error creating user:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to create user'
                    });
                    return;
                }
                res.status(201).json({
                    success: true,
                    data: user
                });
            }
            catch (error) {
                logger_1.logger.error('Error creating user:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create user'
                });
            }
        });
        // Update user
        this.updateUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const updates = req.body;
            try {
                // If updating password, hash it
                if (updates.password) {
                    updates.password_hash = await bcryptjs_1.default.hash(updates.password, 12);
                    delete updates.password;
                }
                const { data: user, error } = await database_1.db
                    .from('users')
                    .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                    .eq('id', id)
                    .select()
                    .single();
                if (error) {
                    logger_1.logger.error('Error updating user:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to update user'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: user
                });
            }
            catch (error) {
                logger_1.logger.error('Error updating user:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update user'
                });
            }
        });
        // Toggle user active status
        this.toggleUserStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { active } = req.body;
            try {
                const { data: user, error } = await database_1.db
                    .from('users')
                    .update({
                    active,
                    updated_at: new Date().toISOString()
                })
                    .eq('id', id)
                    .select()
                    .single();
                if (error) {
                    logger_1.logger.error('Error toggling user status:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to update user status'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: user
                });
            }
            catch (error) {
                logger_1.logger.error('Error toggling user status:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update user status'
                });
            }
        });
        // Delete user (admin only)
        this.deleteUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            // Check if user is admin
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Access denied. Admin only.'
                });
                return;
            }
            const { id } = req.params;
            try {
                const { error } = await database_1.db
                    .from('users')
                    .delete()
                    .eq('id', id);
                if (error) {
                    logger_1.logger.error('Error deleting user:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to delete user'
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: 'User deleted successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error deleting user:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete user'
                });
            }
        });
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=user.controller.js.map