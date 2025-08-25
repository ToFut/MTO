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

  // Preview MTOs before upload
  async previewUpload(
    file: File,
    poNumber: string,
    factoryId?: string,
    brandId?: string
  ): Promise<{
    mtoCount: number;
    mtos: Array<{
      internal_id: string;
      po_line_id: string;
      display_name: string;
      reference_number: string;
      quantity: number;
      production_category: string;
      priority: string;
      expected_ship_date: string;
      spots: any[];
      spot_count: number;
      po_customer?: string;
      hts_code?: string;
      fob_cost?: number;
      ext_fob?: number;
    }>;
    analysis: {
      fileFormat: string;
      qualityScore: number;
      totalRows: number;
      detectedSpots: number;
      poInfo?: {
        poNumber: string;
        customer: string;
        totalAmount: number;
        totalQty: number;
        requestedShipDate: string;
        vendor: any;
        shipTo: any;
      };
    };
    summary: {
      byCategory: Record<string, number>;
      byPriority: Record<string, number>;
      dailyCount: number;
      monthlyCount: number;
      urgentCount: number;
    };
    impact: {
      inventoryItemsToCreate: number;
      vocabularyMappingsNeeded: number;
      totalSpotsToProcess: number;
    };
    warnings: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('poNumber', poNumber);
    if (factoryId) formData.append('factoryId', factoryId);
    if (brandId) formData.append('brandId', brandId);

    const response = await apiClient.post(
      `${this.BASE_PATH}/preview`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000 // 1 minute for preview
      }
    );
    return response.data.data;
  }

  // Smart Upload with Intelligence
  async smartUpload(
    file: File, 
    poNumber: string, 
    factoryId?: string, 
    brandId?: string,
    onProgress?: (progress: number) => void
  ): Promise<{
    success: boolean;
    message: string;
    created: number;
    summary: {
      mtosCreated: number;
      spotsDetected: number;
      qualityScore: number;
      inventoryItemsCreated: number;
      vocabularyMappingsCreated: number;
      barcodesGenerated: number;
    };
    analysisReport: any;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('poNumber', poNumber);
    if (factoryId) formData.append('factoryId', factoryId);
    if (brandId) formData.append('brandId', brandId);

    const response = await apiClient.post(
      `${this.BASE_PATH}/smart-upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress ? (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          onProgress(progress);
        } : undefined,
        timeout: 300000 // 5 minutes for large files
      }
    );
    return response.data;
  }

  // Legacy Excel Upload
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

  // Statistics
  async getStatistics(filters?: {
    brandId?: string;
    factoryId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byProductionStage: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
    dailyCount: number;
    monthlyCount: number;
    urgentCount: number;
    completionRate: number;
    averageProductionTime: number;
  }> {
    const response = await apiClient.get(`${this.BASE_PATH}/statistics`, {
      params: filters
    });
    return response.data.data;
  }

  // Get single MTO
  async getMTO(id: string): Promise<any> {
    const response = await apiClient.get<{ data: any }>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  // Upload History
  async getUploadHistory(filters?: {
    brandId?: string;
    factoryId?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: any[];
    total: number;
  }> {
    const response = await apiClient.get(`${this.BASE_PATH}/upload-history`, {
      params: filters
    });
    return response.data;
  }

  // Update MTO (for factory stage changes)
  async updateMTO(id: string, updates: any): Promise<any> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}`, updates);
    return response.data.data;
  }

  // Upload production photo
  async uploadProductionPhoto(mtoId: string, formData: FormData): Promise<any> {
    const response = await apiClient.post(`${this.BASE_PATH}/${mtoId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Export MTOs
  async exportToExcel(filters?: any): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_PATH}/export`, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }

  // MTO Timeline
  async getTimeline(id: string): Promise<{
    statusHistory: any[];
    productionHistory: any[];
  }> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/timeline`);
    return response.data.data;
  }

  // Production Stage
  async updateProductionStage(id: string, stage: string): Promise<MTO> {
    const response = await apiClient.patch<MTO>(`${this.BASE_PATH}/${id}/production-stage`, {
      stage
    });
    return response.data;
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


}

export const mtoService = new MTOService()