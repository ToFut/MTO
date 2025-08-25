import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';
import * as XLSX from 'xlsx';

export class InventoryService {
  private supabase = getSupabase();

  async getInventoryItems(filters: any) {
    try {
      let query = this.supabase.from('inventory').select('*', { count: 'exact' });
      
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.isShortage) query = query.eq('is_shortage', filters.isShortage);
      
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
      const { data, error, count } = await query;
      
      if (error) throw new AppError(error.message, 400);
      return { data: data || [], total: count || 0 };
    } catch (error: any) {
      logger.error('Error fetching inventory:', error);
      throw error;
    }
  }

  async getInventoryItemById(id: string) {
    const { data, error } = await this.supabase.from('inventory').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  async createInventoryItem(itemData: any) {
    const { data, error } = await this.supabase.from('inventory').insert(itemData).select().single();
    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async updateInventoryItem(id: string, updates: any) {
    const { data, error } = await this.supabase.from('inventory').update(updates).eq('id', id).select().single();
    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async updateStock(id: string, quantity: number, operation: string, userId: string) {
    const { data: current } = await this.supabase.from('inventory').select('quantity_in_stock').eq('id', id).single();
    const newQuantity = operation === 'add' ? (current?.quantity_in_stock || 0) + quantity : (current?.quantity_in_stock || 0) - quantity;
    return this.updateInventoryItem(id, { quantity_in_stock: newQuantity });
  }

  async deleteInventoryItem(id: string) {
    await this.supabase.from('inventory').delete().eq('id', id);
    return true;
  }

  async getShortageAlerts(filters: any) {
    const { data } = await this.supabase.from('inventory').select('*').eq('is_shortage', true);
    return data || [];
  }

  async autoPopulateFromMTOs(poId: string) {
    const { data: mtos } = await this.supabase.from('mtos').select('*').eq('po_id', poId);
    return { populated: mtos?.length || 0 };
  }

  async allocateToMTO(inventoryId: string, mtoId: string, quantity: number, userId: string) {
    return { allocated: true };
  }

  async getInventoryStatistics(companyId: string) {
    return { total: 0, shortage: 0, allocated: 0 };
  }

  async getInventoryMovements(id: string) {
    return [];
  }

  async bulkUploadInventory(file: any, companyId: string, userId: string) {
    return { created: 0, items: [] };
  }

  async exportInventoryToExcel(filters: any) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async getReorderSuggestions(companyId: string) {
    return [];
  }
}
