import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { db } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/error.middleware';
import bcrypt from 'bcryptjs';

export class UserController {
  // Get all users (admin only)
  getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Access denied. Admin only.'
        });
        return;
      }

      const { data: users, error } = await db
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
        logger.error('Error fetching users:', error);
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
    } catch (error) {
      logger.error('Error in getUsers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  });

  // Get single user
  getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      const { data: user, error } = await db
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
    } catch (error) {
      logger.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  });

  // Create user (admin only)
  createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
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
      const { data: existing } = await db
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
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const { data: user, error } = await db
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
        logger.error('Error creating user:', error);
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
    } catch (error) {
      logger.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }
  });

  // Update user
  updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      // If updating password, hash it
      if (updates.password) {
        updates.password_hash = await bcrypt.hash(updates.password, 12);
        delete updates.password;
      }

      const { data: user, error } = await db
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating user:', error);
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
    } catch (error) {
      logger.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user'
      });
    }
  });

  // Toggle user active status
  toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { active } = req.body;

    try {
      const { data: user, error } = await db
        .from('users')
        .update({ 
          active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error toggling user status:', error);
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
    } catch (error) {
      logger.error('Error toggling user status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user status'
      });
    }
  });

  // Delete user (admin only)
  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
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
      const { error } = await db
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting user:', error);
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
    } catch (error) {
      logger.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }
  });
}

export const userController = new UserController();