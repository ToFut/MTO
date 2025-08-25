import { apiClient } from '../utils/api-client'

interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  reorder_level: number
  reorder_quantity: number
  is_shortage: boolean
  factory_id?: string
  brand_id?: string
  created_at: string
  updated_at: string
}

interface InventoryFilter {
  category?: string
  isShortage?: boolean
  factoryId?: string
  brandId?: string
  search?: string
  limit?: number
  offset?: number
}

class InventoryService {
  private readonly BASE_PATH = '/inventory'

  async getItems(filter?: InventoryFilter): Promise<{
    data: InventoryItem[]
    total: number
  }> {
    const response = await apiClient.get(this.BASE_PATH, {
      params: filter
    })
    return response.data
  }

  async getItem(id: string): Promise<InventoryItem> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`)
    return response.data.data
  }

  async createItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await apiClient.post(this.BASE_PATH, item)
    return response.data.data
  }

  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}`, updates)
    return response.data.data
  }

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`)
  }

  async updateStock(
    id: string,
    quantity: number,
    operation: 'add' | 'subtract' | 'reserve' | 'release'
  ): Promise<InventoryItem> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/stock`, {
      quantity,
      operation
    })
    return response.data.data
  }

  async getShortageAlerts(filter?: {
    factoryId?: string
    brandId?: string
  }): Promise<InventoryItem[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/shortage-alerts`, {
      params: filter
    })
    return response.data.data
  }

  async bulkUpdateStock(
    updates: Array<{
      id: string
      quantity: number
      operation: 'add' | 'subtract' | 'reserve' | 'release'
    }>
  ): Promise<InventoryItem[]> {
    const response = await apiClient.post(`${this.BASE_PATH}/bulk-stock`, {
      updates
    })
    return response.data.data
  }

  async getStockHistory(id: string, days: number = 30): Promise<any[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/history`, {
      params: { days }
    })
    return response.data.data
  }

  async importFromExcel(file: File): Promise<{
    created: number
    updated: number
    errors: string[]
  }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post(`${this.BASE_PATH}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }

  async exportToExcel(filter?: InventoryFilter): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_PATH}/export`, {
      params: filter,
      responseType: 'blob'
    })
    return response.data
  }
}

export const inventoryService = new InventoryService()
export type { InventoryItem, InventoryFilter }