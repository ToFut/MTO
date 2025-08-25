import { apiClient } from '../utils/api-client'

export interface Assignment {
  id: string
  mto_id: string
  factory_id: string
  brand_id: string
  assigned_by: string
  assigned_at: string
  status: 'pending' | 'accepted' | 'rejected' | 'in_production' | 'completed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  due_date?: string
  accepted_at?: string
  rejected_at?: string
  rejection_reason?: string
  completed_at?: string
  notes?: string
  production_capacity?: number
  estimated_completion?: string
  created_at: string
  updated_at: string
}

export interface AssignmentFilter {
  status?: string
  priority?: string
  brandId?: string
  factoryId?: string
  assignedBy?: string
  startDate?: string
  endDate?: string
  overdue?: boolean
  limit?: number
  offset?: number
}

export interface ProductionUpdate {
  assignment_id: string
  progress_percentage: number
  completed_quantity: number
  notes?: string
  issues?: string[]
}

class AssignmentService {
  private readonly BASE_PATH = '/assignments'

  async getAssignments(filter?: AssignmentFilter): Promise<{
    data: Assignment[]
    total: number
  }> {
    const response = await apiClient.get<{
      data: Assignment[]
      total: number
    }>(this.BASE_PATH, {
      params: filter
    })
    return response.data
  }

  async getAssignment(id: string): Promise<Assignment> {
    const response = await apiClient.get<{ data: Assignment }>(`${this.BASE_PATH}/${id}`)
    return response.data.data
  }

  async createAssignment(assignment: {
    mto_id: string
    factory_id: string
    priority: string
    due_date?: string
    notes?: string
  }): Promise<Assignment> {
    const response = await apiClient.post<{ data: Assignment }>(this.BASE_PATH, assignment)
    return response.data.data
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const response = await apiClient.patch<{ data: Assignment }>(`${this.BASE_PATH}/${id}`, updates)
    return response.data.data
  }

  async acceptAssignment(id: string, production_capacity?: number): Promise<Assignment> {
    const response = await apiClient.post<{ data: Assignment }>(`${this.BASE_PATH}/${id}/accept`, {
      production_capacity
    })
    return response.data.data
  }

  async rejectAssignment(id: string, reason: string): Promise<Assignment> {
    const response = await apiClient.post<{ data: Assignment }>(`${this.BASE_PATH}/${id}/reject`, {
      reason
    })
    return response.data.data
  }

  async updateProgress(id: string, update: ProductionUpdate): Promise<Assignment> {
    const response = await apiClient.post<{ data: Assignment }>(`${this.BASE_PATH}/${id}/progress`, update)
    return response.data.data
  }

  async completeAssignment(id: string): Promise<Assignment> {
    const response = await apiClient.post<{ data: Assignment }>(`${this.BASE_PATH}/${id}/complete`)
    return response.data.data
  }

  async getFactoryCapacity(factoryId: string): Promise<{
    total_capacity: number
    current_load: number
    available_capacity: number
    assignments_in_progress: number
    estimated_availability: string
  }> {
    const response = await apiClient.get<{ data: {
      total_capacity: number
      current_load: number
      available_capacity: number
      assignments_in_progress: number
      estimated_availability: string
    }}>(`${this.BASE_PATH}/factory/${factoryId}/capacity`)
    return response.data.data
  }

  async bulkAssign(assignments: Array<{
    mto_id: string
    factory_id: string
    priority: string
  }>): Promise<Assignment[]> {
    const response = await apiClient.post<{ data: Assignment[] }>(`${this.BASE_PATH}/bulk`, {
      assignments
    })
    return response.data.data
  }

  async reassignAssignment(id: string, newFactoryId: string, reason: string): Promise<Assignment> {
    const response = await apiClient.post<{ data: Assignment }>(`${this.BASE_PATH}/${id}/reassign`, {
      factory_id: newFactoryId,
      reason
    })
    return response.data.data
  }

  async getStatistics(filter?: {
    brandId?: string
    factoryId?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    averageCompletionTime: number
    onTimeCompletionRate: number
    rejectionRate: number
  }> {
    const response = await apiClient.get<{ data: {
      total: number
      byStatus: Record<string, number>
      byPriority: Record<string, number>
      averageCompletionTime: number
      onTimeCompletionRate: number
      rejectionRate: number
    }}>(`${this.BASE_PATH}/statistics`, {
      params: filter
    })
    return response.data.data
  }

  async getOverdueAssignments(filter?: {
    brandId?: string
    factoryId?: string
  }): Promise<Assignment[]> {
    const response = await apiClient.get<{ data: Assignment[] }>(`${this.BASE_PATH}/overdue`, {
      params: filter
    })
    return response.data.data
  }

  async getTimeline(assignmentId: string): Promise<Array<{
    timestamp: string
    event: string
    description: string
    user?: string
  }>> {
    const response = await apiClient.get<{ data: Array<{
      timestamp: string
      event: string
      description: string
      user?: string
    }>}>(`${this.BASE_PATH}/${assignmentId}/timeline`)
    return response.data.data
  }
}

export const assignmentService = new AssignmentService()