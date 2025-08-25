import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { db } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/error.middleware';

export class CompanyController {
  // Get all companies
  getCompanies = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { type } = req.query;

      let query = db
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by type if provided
      if (type && (type === 'brand' || type === 'factory')) {
        query = query.eq('type', type);
      }

      const { data: companies, error } = await query;

      if (error) {
        logger.error('Error fetching companies:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch companies'
        });
        return;
      }

      res.json({
        success: true,
        data: companies || []
      });
    } catch (error) {
      logger.error('Error in getCompanies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch companies'
      });
    }
  });

  // Get single company
  getCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      const { data: company, error } = await db
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !company) {
        res.status(404).json({
          success: false,
          error: 'Company not found'
        });
        return;
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      logger.error('Error fetching company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch company'
      });
    }
  });

  // Create company (admin only)
  createCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
      return;
    }

    const { name, code, type, contact_email, contact_person, phone, address } = req.body;

    try {
      // Check if company with same code exists
      const { data: existing } = await db
        .from('companies')
        .select('id')
        .eq('code', code)
        .single();

      if (existing) {
        res.status(400).json({
          success: false,
          error: 'Company with this code already exists'
        });
        return;
      }

      // Create company
      const { data: company, error } = await db
        .from('companies')
        .insert({
          name,
          code,
          type,
          contact_email,
          contact_person,
          phone,
          address,
          active: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating company:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create company'
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: company
      });
    } catch (error) {
      logger.error('Error creating company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create company'
      });
    }
  });

  // Update company
  updateCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const { data: company, error } = await db
        .from('companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating company:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update company'
        });
        return;
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      logger.error('Error updating company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update company'
      });
    }
  });

  // Toggle company active status
  toggleCompanyStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { active } = req.body;

    try {
      const { data: company, error } = await db
        .from('companies')
        .update({ 
          active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error toggling company status:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update company status'
        });
        return;
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      logger.error('Error toggling company status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update company status'
      });
    }
  });

  // Delete company (admin only)
  deleteCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
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
      // Check if company has users
      const { data: users } = await db
        .from('users')
        .select('id')
        .eq('company_id', id)
        .limit(1);

      if (users && users.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete company with active users'
        });
        return;
      }

      const { error } = await db
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting company:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to delete company'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete company'
      });
    }
  });
}

export const companyController = new CompanyController();