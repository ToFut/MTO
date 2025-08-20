"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const error_middleware_1 = require("../middleware/error.middleware");
class AuthService {
    generateToken(userId, role) {
        if (!process.env.JWT_SECRET) {
            throw new error_middleware_1.AppError('JWT_SECRET not configured', 500);
        }
        const payload = { userId, role };
        const secret = process.env.JWT_SECRET;
        return jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });
    }
    async hashPassword(password) {
        const saltRounds = 12;
        return bcryptjs_1.default.hash(password, saltRounds);
    }
    async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    async register(userData) {
        try {
            const { password, ...userDataWithoutPassword } = userData;
            // Check if user already exists
            const { data: existingUser } = await database_1.db
                .from('users')
                .select('email')
                .eq('email', userData.email)
                .single();
            if (existingUser) {
                throw new error_middleware_1.AppError('User with this email already exists', 409);
            }
            // Hash password
            const password_hash = await this.hashPassword(password);
            // Create user
            const { data: newUser, error } = await database_1.db
                .from('users')
                .insert({
                ...userDataWithoutPassword,
                password_hash,
            })
                .select(`
          id, email, full_name, role, company_id, language, avatar_url, 
          phone, preferences, last_login, active, created_at, updated_at
        `)
                .single();
            if (error) {
                logger_1.logger.error('Failed to create user:', error);
                throw new error_middleware_1.AppError('Failed to create user', 500);
            }
            if (!newUser) {
                throw new error_middleware_1.AppError('User creation failed', 500);
            }
            // Generate token
            const token = this.generateToken(newUser.id, newUser.role);
            // Update last login
            await database_1.db
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', newUser.id);
            return {
                user: newUser,
                token,
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError)
                throw error;
            logger_1.logger.error('Registration error:', error);
            throw new error_middleware_1.AppError('Registration failed', 500);
        }
    }
    async login(credentials) {
        try {
            const { email, password } = credentials;
            // Find user with password hash
            const { data: user, error } = await database_1.db
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('active', true)
                .single();
            if (error || !user) {
                throw new error_middleware_1.AppError('Invalid credentials', 401);
            }
            // Check password
            const isValidPassword = await this.comparePassword(password, user.password_hash);
            if (!isValidPassword) {
                throw new error_middleware_1.AppError('Invalid credentials', 401);
            }
            // Generate token
            const token = this.generateToken(user.id, user.role);
            // Update last login
            await database_1.db
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);
            // Remove password hash from response
            const { password_hash, ...userWithoutPassword } = user;
            return {
                user: userWithoutPassword,
                token,
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError)
                throw error;
            logger_1.logger.error('Login error:', error);
            throw new error_middleware_1.AppError('Login failed', 500);
        }
    }
    async getUserById(userId) {
        try {
            const { data: user, error } = await database_1.db
                .from('users')
                .select(`
          id, email, full_name, role, company_id, language, avatar_url, 
          phone, preferences, last_login, active, created_at, updated_at
        `)
                .eq('id', userId)
                .eq('active', true)
                .single();
            if (error) {
                logger_1.logger.error('Failed to get user by ID:', error);
                return null;
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Get user error:', error);
            return null;
        }
    }
    async getUserByEmail(email) {
        try {
            const { data: user, error } = await database_1.db
                .from('users')
                .select(`
          id, email, full_name, role, company_id, language, avatar_url, 
          phone, preferences, last_login, active, created_at, updated_at
        `)
                .eq('email', email)
                .eq('active', true)
                .single();
            if (error) {
                return null;
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Get user by email error:', error);
            return null;
        }
    }
    async updateUser(userId, updateData) {
        try {
            const { data: updatedUser, error } = await database_1.db
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select(`
          id, email, full_name, role, company_id, language, avatar_url, 
          phone, preferences, last_login, active, created_at, updated_at
        `)
                .single();
            if (error || !updatedUser) {
                logger_1.logger.error('Failed to update user:', error);
                throw new error_middleware_1.AppError('Failed to update user', 500);
            }
            return updatedUser;
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError)
                throw error;
            logger_1.logger.error('Update user error:', error);
            throw new error_middleware_1.AppError('Failed to update user', 500);
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Get user with password hash
            const { data: user, error } = await database_1.db
                .from('users')
                .select('password_hash')
                .eq('id', userId)
                .single();
            if (error || !user) {
                throw new error_middleware_1.AppError('User not found', 404);
            }
            // Verify current password
            const isValidPassword = await this.comparePassword(currentPassword, user.password_hash);
            if (!isValidPassword) {
                throw new error_middleware_1.AppError('Current password is incorrect', 401);
            }
            // Hash new password
            const newPasswordHash = await this.hashPassword(newPassword);
            // Update password
            const { error: updateError } = await database_1.db
                .from('users')
                .update({ password_hash: newPasswordHash })
                .eq('id', userId);
            if (updateError) {
                logger_1.logger.error('Failed to update password:', updateError);
                throw new error_middleware_1.AppError('Failed to update password', 500);
            }
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError)
                throw error;
            logger_1.logger.error('Change password error:', error);
            throw new error_middleware_1.AppError('Password change failed', 500);
        }
    }
    async deactivateUser(userId) {
        try {
            const { error } = await database_1.db
                .from('users')
                .update({ active: false })
                .eq('id', userId);
            if (error) {
                logger_1.logger.error('Failed to deactivate user:', error);
                throw new error_middleware_1.AppError('Failed to deactivate user', 500);
            }
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError)
                throw error;
            logger_1.logger.error('Deactivate user error:', error);
            throw new error_middleware_1.AppError('User deactivation failed', 500);
        }
    }
    verifyToken(token) {
        try {
            if (!process.env.JWT_SECRET) {
                throw new error_middleware_1.AppError('JWT_SECRET not configured', 500);
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (typeof decoded === 'object' && decoded.userId && decoded.role) {
                return {
                    userId: decoded.userId,
                    role: decoded.role,
                };
            }
            return null;
        }
        catch (error) {
            logger_1.logger.error('Token verification error:', error);
            return null;
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map