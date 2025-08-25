import { apiClient } from '../utils/api-client'

export interface Defect {
  id: string
  mto_id: string
  type: 'material' | 'stitching' | 'printing' | 'cutting' | 'other'
  severity: 'minor' | 'major' | 'critical'
  description: string
  photos?: string[]
  reported_by: string
  reported_at: string
  resolved_at?: string
  resolution?: string
  replacement_mto_id?: string
  created_at: string
  updated_at: string
}

export interface DefectFilter {
  mtoId?: string
  type?: string
  severity?: string
  resolved?: boolean
  brandId?: string
  factoryId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

class DefectService {
  private readonly BASE_PATH = '/defects'

  async getDefects(filter?: DefectFilter): Promise<{
    data: Defect[]
    total: number
  }> {
    const response = await apiClient.get(this.BASE_PATH, {
      params: filter
    })
    return response.data
  }

  async getDefect(id: string): Promise<Defect> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`)
    return response.data.data
  }

  async createDefect(defect: {
    mto_id: string
    type: string
    severity: string
    description: string
    photos?: string[]
  }): Promise<Defect> {
    const response = await apiClient.post(this.BASE_PATH, defect)
    return response.data.data
  }

  async updateDefect(id: string, updates: Partial<Defect>): Promise<Defect> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}`, updates)
    return response.data.data
  }

  async resolveDefect(id: string, resolution: string): Promise<Defect> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/resolve`, {
      resolution
    })
    return response.data.data
  }

  async createReplacement(defectId: string): Promise<{
    defect: Defect
    replacementMTO: any
  }> {
    const response = await apiClient.post(`${this.BASE_PATH}/${defectId}/replacement`)
    return response.data
  }

  async getStatistics(filter?: {
    brandId?: string
    factoryId?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    resolved: number
    pending: number
    averageResolutionTime: number
  }> {
    const response = await apiClient.get(`${this.BASE_PATH}/statistics`, {
      params: filter
    })
    return response.data.data
  }

  async uploadPhoto(defectId: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await apiClient.post(
      `${this.BASE_PATH}/${defectId}/photo`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    return response.data.photoUrl
  }
}

export const defectService = new DefectService()