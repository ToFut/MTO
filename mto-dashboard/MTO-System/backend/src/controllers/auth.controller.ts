import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {

  // Register new user
  register = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { email, password, full_name, role, company_id } = req.body;

    try {
      const result = await authService.register({
        email,
        full_name,
        role: role || 'viewer',
        company_id,
        password,
      });

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            full_name: result.user.full_name,
            role: result.user.role,
          },
          token: result.token,
        },
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  });

  // Login
  login = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    try {
      const result = await authService.login({ email, password });

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            full_name: result.user.full_name,
            role: result.user.role,
          },
          token: result.token,
        },
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Login failed',
      });
    }
  });

  // Logout
  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      logger.info(`User logged out: ${req.user?.email}`);
      
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
  });

  // Get current user
  getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const user = await authService.getUserById(req.user.id);

    if (!user) {
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
      },
    });
  });

  // Update password
  updatePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
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
      await authService.changePassword(req.user.id, currentPassword, newPassword);

      logger.info(`Password updated for user: ${req.user.email}`);

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error: any) {
      logger.error('Password update error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update password',
      });
    }
  });

  // Forgot password
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
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
      logger.info(`Password reset requested for: ${email}`);

      res.json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error: any) {
      logger.error('Forgot password error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to send password reset email',
      });
    }
  });

  // Reset password
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
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
      logger.info('Password reset completed');

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error: any) {
      logger.error('Reset password error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to reset password',
      });
    }
  });
}

export default new AuthController();