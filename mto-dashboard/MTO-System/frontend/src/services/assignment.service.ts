import { apiClient } from '../utils/api-client';

export interface Company {
  id: string;
  name: string;
  code: string;
  type: 'brand' | 'factory';
  email?: string;
  contact_person?: string;
  active: boolean;
}

export interface BrandFactoryAssignment {
  id: string;
  brand_id: string;
  factory_id: string;
  status: 'active' | 'inactive' | 'suspended';
  capabilities: string[];
  production_capacity: number;
  quality_rating: number;
  preferred_for_categories: string[];
  notes?: string;
  assigned_at: string;
  updated_at: string;
  brand?: Company;
  factory?: Company;
  assigned_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CreateAssignmentData {
  brand_id: string;
  factory_id: string;
  capabilities?: string[];
  production_capacity?: number;
  quality_rating?: number;
  preferred_for_categories?: string[];
  notes?: string;
}

export interface UpdateAssignmentData extends Partial<CreateAssignmentData> {
  status?: 'active' | 'inactive' | 'suspended';
}

export interface AssignmentFilters {
  brand_id?: string;
  factory_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

class AssignmentService {
  private basePath = '/assignments';

  /**
   * Get all assignments with optional filters
   */
  async getAssignments(filters?: AssignmentFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    const response = await apiClient.get<{
      success: boolean;
      data: BrandFactoryAssignment[];
      filters: AssignmentFilters;
    }>(url);
    
    return response.data;
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(id: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: BrandFactoryAssignment;
    }>(`${this.basePath}/${id}`);
    
    return response.data;
  }

  /**
   * Create new assignment
   */
  async createAssignment(data: CreateAssignmentData) {
    const response = await apiClient.post<{
      success: boolean;
      data: BrandFactoryAssignment;
    }>(this.basePath, data);
    
    return response.data;
  }

  /**
   * Update assignment
   */
  async updateAssignment(id: string, data: UpdateAssignmentData) {
    const response = await apiClient.put<{
      success: boolean;
      data: BrandFactoryAssignment;
    }>(`${this.basePath}/${id}`, data);
    
    return response.data;
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(id: string) {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`${this.basePath}/${id}`);
    
    return response.data;
  }

  /**
   * Get available factories for a brand (Admin only)
   */
  async getAvailableFactoriesForBrand(brandId: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: Company[];
    }>(`${this.basePath}/brands/${brandId}/available-factories`);
    
    return response.data;
  }

  /**
   * Get assigned factories for a brand
   */
  async getAssignedFactoriesForBrand(brandId: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: BrandFactoryAssignment[];
    }>(`${this.basePath}/brands/${brandId}/factories`);
    
    return response.data;
  }

  /**
   * Get brands assigned to a factory
   */
  async getBrandsForFactory(factoryId: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: BrandFactoryAssignment[];
    }>(`${this.basePath}/factories/${factoryId}/brands`);
    
    return response.data;
  }
}

export const assignmentService = new AssignmentService();