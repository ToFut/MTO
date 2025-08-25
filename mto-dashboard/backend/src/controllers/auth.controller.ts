import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../config/supabase';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  private supabase = getSupabase();

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
      const hashedPassword = await bcrypt.hash(password, 10);

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
        await this.supabase.auth.admin.deleteUser(authData.user!.id);
        throw profileError;
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, companyId: user.company_id },
        process.env.JWT_SECRET || 'your_jwt_secret_here_change_this_in_production',
        { expiresIn: '7d' }
      );

      logger.info(`New user registered: ${email}`);

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
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          companyId: user.company_id,
          companyType: user.company?.type,
        },
        process.env.JWT_SECRET || 'your_jwt_secret_here_change_this_in_production',
        { expiresIn: '7d' }
      );

      logger.info(`User logged in: ${email}`);

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
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: 'Login failed',
      });
    }
  });

  // Logout
  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      await this.supabase.auth.signOut();
      
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

      logger.info(`Password updated for user: ${req.user.email}`);

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error: any) {
      logger.error('Password update error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to update password',
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
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.CLIENT_URL}/reset-password`,
      });

      if (error) {
        throw error;
      }

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
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

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