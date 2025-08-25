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
      // First check if the brand_factory_assignments table exists
      const { error: tableCheckError } = await db
        .from('brand_factory_assignments')
        .select('count')
        .limit(0);

      if (tableCheckError && (tableCheckError.message.includes('does not exist') || tableCheckError.message.includes('relation') && tableCheckError.message.includes('does not exist'))) {
        logger.error('brand_factory_assignments table does not exist:', tableCheckError);
        throw new AppError('Assignment functionality is not available. Please contact administrator to set up the database tables.', 503);
      }

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

      // Create the assignment with fallback to old schema
      let insertData: any = {
        brand_id: data.brand_id,
        factory_id: data.factory_id,
        assigned_by: data.assigned_by,
      };

      // Test if capabilities column exists by trying a select
      const { error: capabilitiesTestError } = await db
        .from('brand_factory_assignments')
        .select('capabilities')
        .limit(0);

      logger.info('Capabilities column test error:', capabilitiesTestError?.message || 'No error');

      // If capabilities column doesn't exist, use old schema
      if (capabilitiesTestError && capabilitiesTestError.message.includes('capabilities')) {
        logger.info('Using OLD schema for assignment creation');
        insertData = {
          ...insertData,
          assignment_type: 'preferred',
          capacity_allocation: data.production_capacity || 100,
          priority_level: Math.round((data.quality_rating || 5) / 2), // Convert 0-10 to 0-5
          settings: {
            capabilities: data.capabilities || [],
            preferred_categories: data.preferred_for_categories || [],
            notes: data.notes || ''
          },
          active: true
        };
      } else {
        // Use new schema
        logger.info('Using NEW schema for assignment creation');
        insertData = {
          ...insertData,
          capabilities: data.capabilities || [],
          production_capacity: data.production_capacity || 0,
          quality_rating: data.quality_rating || 0,
          preferred_for_categories: data.preferred_for_categories || [],
          notes: data.notes,
          status: 'active'
        };
      }

      const { data: assignment, error } = await db
        .from('brand_factory_assignments')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating brand-factory assignment:', error);
        if (error.message.includes('capabilities') || error.message.includes('column') && error.message.includes('does not exist')) {
          throw new AppError('Database table is missing required columns. Please contact administrator to update the database schema.', 503);
        }
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
      // First check if the brand_factory_assignments table exists
      const { error: tableCheckError } = await db
        .from('brand_factory_assignments')
        .select('count')
        .limit(0);

      if (tableCheckError && (tableCheckError.message.includes('does not exist') || tableCheckError.message.includes('relation') && tableCheckError.message.includes('does not exist'))) {
        logger.warn('brand_factory_assignments table does not exist, returning empty assignments');
        return [];
      }

      // First check what columns are available
      const { data: schemaCheck } = await db
        .from('brand_factory_assignments')
        .select('*')
        .limit(1);

      let query;
      
      if (schemaCheck && schemaCheck.length > 0) {
        const columns = Object.keys(schemaCheck[0]);
        if (columns.includes('capabilities')) {
          // New schema - select all with joins
          query = db
            .from('brand_factory_assignments')
            .select(`
              *,
              brand:companies!brand_factory_assignments_brand_id_fkey(
                id, name, code, contact_email, contact_phone
              ),
              factory:companies!brand_factory_assignments_factory_id_fkey(
                id, name, code, contact_email, contact_phone
              ),
              assigned_by_user:users!brand_factory_assignments_assigned_by_fkey(
                id, full_name, email
              )
            `);
        } else {
          // Old schema - select available columns
          query = db
            .from('brand_factory_assignments')
            .select('*');
        }
      } else {
        // Empty table - use new schema format
        query = db
          .from('brand_factory_assignments')
          .select(`
            *,
            brand:companies!brand_factory_assignments_brand_id_fkey(
              id, name, code, contact_email, contact_phone
            ),
            factory:companies!brand_factory_assignments_factory_id_fkey(
              id, name, code, contact_email, contact_phone
            ),
            assigned_by_user:users!brand_factory_assignments_assigned_by_fkey(
              id, full_name, email
            )
          `);
      }

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

      // Use different order column based on what exists
      // Test for assigned_at column
      const { error: assignedAtTestError } = await db
        .from('brand_factory_assignments')
        .select('assigned_at')
        .limit(0);

      if (assignedAtTestError && assignedAtTestError.message.includes('assigned_at')) {
        // assigned_at doesn't exist, try created_at
        const { error: createdAtTestError } = await db
          .from('brand_factory_assignments')
          .select('created_at')
          .limit(0);
          
        if (createdAtTestError && createdAtTestError.message.includes('created_at')) {
          // Use updated_at as fallback
          query = query.order('updated_at', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }
      } else {
        query = query.order('assigned_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching assignments:', error);
        if (error.message.includes('does not exist') || error.message.includes('relation')) {
          return [];
        }
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