import { apiClient } from '../utils/api-client'

export interface Shipment {
  id: string
  tracking_number: string
  mto_ids: string[]
  factory_id: string
  brand_id: string
  carrier: string
  status: 'preparing' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled'
  shipped_date?: string
  estimated_delivery?: string
  actual_delivery?: string
  shipping_method: 'air' | 'sea' | 'express' | 'standard'
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  cost?: number
  documents?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface ShipmentFilter {
  status?: string
  carrier?: string
  brandId?: string
  factoryId?: string
  startDate?: string
  endDate?: string
  trackingNumber?: string
  limit?: number
  offset?: number
}

export interface ShipmentTracking {
  timestamp: string
  location: string
  status: string
  description: string
}

class ShipmentService {
  private readonly BASE_PATH = '/shipments'

  async getShipments(filter?: ShipmentFilter): Promise<{
    data: Shipment[]
    total: number
  }> {
    const response = await apiClient.get(this.BASE_PATH, {
      params: filter
    })
    return response.data
  }

  async getShipment(id: string): Promise<Shipment> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`)
    return response.data.data
  }

  async createShipment(shipment: {
    mto_ids: string[]
    carrier: string
    shipping_method: string
    estimated_delivery?: string
    notes?: string
  }): Promise<Shipment> {
    const response = await apiClient.post(this.BASE_PATH, shipment)
    return response.data.data
  }

  async updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}`, updates)
    return response.data.data
  }

  async updateStatus(id: string, status: Shipment['status']): Promise<Shipment> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/status`, {
      status
    })
    return response.data.data
  }

  async getTracking(id: string): Promise<ShipmentTracking[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/tracking`)
    return response.data.data
  }

  async addTrackingUpdate(id: string, update: {
    location: string
    status: string
    description: string
  }): Promise<ShipmentTracking> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/tracking`, update)
    return response.data.data
  }

  async uploadDocument(id: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append('document', file)
    
    const response = await apiClient.post(
      `${this.BASE_PATH}/${id}/document`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    return response.data.documentUrl
  }

  async generateLabel(id: string): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/label`, {
      responseType: 'blob'
    })
    return response.data
  }

  async getStatistics(filter?: {
    brandId?: string
    factoryId?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    total: number
    byStatus: Record<string, number>
    byCarrier: Record<string, number>
    averageDeliveryTime: number
    onTimeDeliveryRate: number
  }> {
    const response = await apiClient.get(`${this.BASE_PATH}/statistics`, {
      params: filter
    })
    return response.data.data
  }

  async bulkCreate(shipments: Array<{
    mto_ids: string[]
    carrier: string
    shipping_method: string
  }>): Promise<Shipment[]> {
    const response = await apiClient.post(`${this.BASE_PATH}/bulk`, {
      shipments
    })
    return response.data.data
  }

  async cancelShipment(id: string, reason: string): Promise<Shipment> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/cancel`, {
      reason
    })
    return response.data.data
  }
}

export const shipmentService = new ShipmentService()