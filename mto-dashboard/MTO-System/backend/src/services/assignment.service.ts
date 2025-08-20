import { db } from '../config/database';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';

interface BrandFactoryAssignment {
  id: string;
  brand_id: string;
  factory_id: string;
  assigned_by: string;
  status: 'active' | 'inactive' | 'suspended';
  capabilities: string[];
  production_capacity: number;
  quality_rating: number;
  preferred_for_categories: string[];
  notes?: string;
  assigned_at: string;
  updated_at: string;
}

interface CreateAssignmentData {
  brand_id: string;
  factory_id: string;
  assigned_by: string;
  capabilities?: string[];
  production_capacity?: number;
  quality_rating?: number;
  preferred_for_categories?: string[];
  notes?: string;
}

interface AssignmentFilters {
  brand_id?: string;
  factory_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export class AssignmentService {
  async createAssignment(data: CreateAssignmentData): Promise<BrandFactoryAssignment> {
    try {
      // Validate that brand and factory exist and are correct types
      const { data: brand, error: brandError } = await db
        .from('companies')
        .select('id, type')
        .eq('id', data.brand_id)
        .eq('type', 'brand')
        .single();

      if (brandError || !brand) {
        throw new AppError('Brand company not found', 404);
      }

      const { data: factory, error: factoryError } = await db
        .from('companies')
        .select('id, type')
        .eq('id', data.factory_id)
        .eq('type', 'factory')
        .single();

      if (factoryError || !factory) {
        throw new AppError('Factory company not found', 404);
      }

      // Check if assignment already exists
      const { data: existing } = await db
        .from('brand_factory_assignments')
        .select('id')
        .eq('brand_id', data.brand_id)
        .eq('factory_id', data.factory_id)
        .single();

      if (existing) {
        throw new AppError('Assignment already exists between this brand and factory', 409);
      }

      // Create the assignment
      const { data: assignment, error } = await db
        .from('brand_factory_assignments')
        .insert({
          brand_id: data.brand_id,
          factory_id: data.factory_id,
          assigned_by: data.assigned_by,
          capabilities: data.capabilities || [],
          production_capacity: data.production_capacity || 0,
          quality_rating: data.quality_rating || 0,
          preferred_for_categories: data.preferred_for_categories || [],
          notes: data.notes,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating brand-factory assignment:', error);
        throw new AppError('Failed to create assignment', 500);
      }

      logger.info(`Brand-factory assignment created: ${assignment.id}`);
      return assignment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Assignment creation error:', error);
      throw new AppError('Failed to create assignment', 500);
    }
  }

  async getAssignments(filters: AssignmentFilters = {}) {
    try {
      let query = db
        .from('brand_factory_assignments')
        .select(`
          *,
          brand:companies!brand_factory_assignments_brand_id_fkey(
            id, name, code, email, contact_person
          ),
          factory:companies!brand_factory_assignments_factory_id_fkey(
            id, name, code, email, contact_person
          ),
          assigned_by_user:users!brand_factory_assignments_assigned_by_fkey(
            id, full_name, email
          )
        `);

      // Apply filters
      if (filters.brand_id) {
        query = query.eq('brand_id', filters.brand_id);
      }
      if (filters.factory_id) {
        query = query.eq('factory_id', filters.factory_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Pagination
      if (filters.limit) {
        const offset = filters.offset || 0;
        query = query.range(offset, offset + filters.limit - 1);
      }

      query = query.order('assigned_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching assignments:', error);
        throw new AppError('Failed to fetch assignments', 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get assignments error:', error);
      throw new AppError('Failed to fetch assignments', 500);
    }
  }

  async getAssignmentById(id: string): Promise<BrandFactoryAssignment | null> {
    try {
      const { data, error } = await db
        .from('brand_factory_assignments')
        .select(`
          *,
          brand:companies!brand_factory_assignments_brand_id_fkey(*),
          factory:companies!brand_factory_assignments_factory_id_fkey(*),
          assigned_by_user:users!brand_factory_assignments_assigned_by_fkey(
            id, full_name, email
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Error fetching assignment:', error);
        throw new AppError('Failed to fetch assignment', 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get assignment error:', error);
      throw new AppError('Failed to fetch assignment', 500);
    }
  }

  async updateAssignment(id: string, updateData: Partial<CreateAssignmentData & { status: string }>): Promise<BrandFactoryAssignment> {
    try {
      const { data, error } = await db
        .from('brand_factory_assignments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating assignment:', error);
        throw new AppError('Failed to update assignment', 500);
      }

      if (!data) {
        throw new AppError('Assignment not found', 404);
      }

      logger.info(`Assignment updated: ${id}`);
      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update assignment error:', error);
      throw new AppError('Failed to update assignment', 500);
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    try {
      const { error } = await db
        .from('brand_factory_assignments')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting assignment:', error);
        throw new AppError('Failed to delete assignment', 500);
      }

      logger.info(`Assignment deleted: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete assignment error:', error);
      throw new AppError('Failed to delete assignment', 500);
    }
  }

  async getAvailableFactoriesForBrand(brandId: string) {
    try {
      // Get all factories not already assigned to this brand
      const { data, error } = await db
        .from('companies')
        .select(`
          id, name, code, email, contact_person, address,
          settings, active, created_at
        `)
        .eq('type', 'factory')
        .eq('active', true)
        .not('id', 'in', `(
          SELECT factory_id FROM brand_factory_assignments 
          WHERE brand_id = '${brandId}' AND status = 'active'
        )`);

      if (error) {
        logger.error('Error fetching available factories:', error);
        throw new AppError('Failed to fetch available factories', 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get available factories error:', error);
      throw new AppError('Failed to fetch available factories', 500);
    }
  }

  async getAssignedFactoriesForBrand(brandId: string) {
    try {
      const { data, error } = await db
        .from('brand_factory_assignments')
        .select(`
          *,
          factory:companies!brand_factory_assignments_factory_id_fkey(*)
        `)
        .eq('brand_id', brandId)
        .eq('status', 'active');

      if (error) {
        logger.error('Error fetching assigned factories:', error);
        throw new AppError('Failed to fetch assigned factories', 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get assigned factories error:', error);
      throw new AppError('Failed to fetch assigned factories', 500);
    }
  }

  async getBrandsForFactory(factoryId: string) {
    try {
      const { data, error } = await db
        .from('brand_factory_assignments')
        .select(`
          *,
          brand:companies!brand_factory_assignments_brand_id_fkey(*)
        `)
        .eq('factory_id', factoryId)
        .eq('status', 'active');

      if (error) {
        logger.error('Error fetching brands for factory:', error);
        throw new AppError('Failed to fetch brands for factory', 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get brands for factory error:', error);
      throw new AppError('Failed to fetch brands for factory', 500);
    }
  }
}

export const assignmentService = new AssignmentService();