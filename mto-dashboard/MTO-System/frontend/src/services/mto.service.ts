import { apiClient } from '../utils/api-client'
import { MTO, MTOStatus, CreateMTODto, UpdateMTODto, MTOFilter } from '../types/mto.types'
import { PaginatedResponse } from '../types/common.types'

class MTOService {
  private readonly BASE_PATH = '/mtos'

  // CRUD Operations
  async create(data: CreateMTODto): Promise<MTO> {
    const response = await apiClient.post<MTO>(this.BASE_PATH, data)
    return response.data
  }

  async findAll(filter?: MTOFilter): Promise<PaginatedResponse<MTO>> {
    const response = await apiClient.get<PaginatedResponse<MTO>>(this.BASE_PATH, {
      params: filter
    })
    return response.data
  }

  async findOne(id: string): Promise<MTO> {
    const response = await apiClient.get<MTO>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  async update(id: string, data: UpdateMTODto): Promise<MTO> {
    const response = await apiClient.patch<MTO>(`${this.BASE_PATH}/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`)
  }

  // Bulk Operations
  async uploadExcel(file: File, onProgress?: (progress: number) => void): Promise<MTO[]> {
    const response = await apiClient.uploadFile(
      `${this.BASE_PATH}/upload`,
      file,
      onProgress
    )
    return response.data
  }

  async bulkUpdate(ids: string[], data: Partial<UpdateMTODto>): Promise<MTO[]> {
    const response = await apiClient.patch<MTO[]>(`${this.BASE_PATH}/bulk`, {
      ids,
      data
    })
    return response.data
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/bulk`, {
      data: { ids }
    })
  }

  // Status Management
  async updateStatus(id: string, status: MTOStatus): Promise<MTO> {
    const response = await apiClient.patch<MTO>(`${this.BASE_PATH}/${id}/status`, {
      status
    })
    return response.data
  }

  async advanceWorkflow(id: string): Promise<MTO> {
    const response = await apiClient.post<MTO>(`${this.BASE_PATH}/${id}/advance`)
    return response.data
  }

  // Defect Management
  async reportDefect(id: string, defectData: {
    type: string
    description: string
    photos?: string[]
  }): Promise<MTO> {
    const response = await apiClient.post<MTO>(`${this.BASE_PATH}/${id}/defect`, defectData)
    return response.data
  }

  async createReplacement(id: string): Promise<MTO> {
    const response = await apiClient.post<MTO>(`${this.BASE_PATH}/${id}/replacement`)
    return response.data
  }

  // Barcode Operations
  async generateBarcodes(id: string): Promise<{
    lineBarcode: string
    spotBarcodes: string[]
  }> {
    const response = await apiClient.post<{
      lineBarcode: string
      spotBarcodes: string[]
    }>(`${this.BASE_PATH}/${id}/barcodes`)
    return response.data
  }

  async scanBarcode(code: string): Promise<MTO> {
    const response = await apiClient.get<MTO>(`${this.BASE_PATH}/scan/${code}`)
    return response.data
  }

  // Chat Operations
  async getChat(id: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`${this.BASE_PATH}/${id}/chat`)
    return response.data
  }

  async sendMessage(id: string, message: string, attachments?: File[]): Promise<any> {
    const formData = new FormData()
    formData.append('message', message)
    
    if (attachments) {
      attachments.forEach(file => {
        formData.append('attachments', file)
      })
    }

    const response = await apiClient.post(`${this.BASE_PATH}/${id}/chat`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  // Analytics
  async getAnalytics(filter?: {
    startDate?: Date
    endDate?: Date
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<any> {
    const response = await apiClient.get(`${this.BASE_PATH}/analytics`, {
      params: filter
    })
    return response.data
  }

  // Export
  async exportToExcel(filter?: MTOFilter): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_PATH}/export`, {
      params: filter,
      responseType: 'blob'
    })
    return response.data as Blob
  }
}

export const mtoService = new MTOService()