import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';
import * as XLSX from 'xlsx';

export class ShipmentService {
  private supabase = getSupabase();

  async getShipments(filters: any) {
    try {
      let query = this.supabase.from('shipments').select('*', { count: 'exact' });
      
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.awb) query = query.eq('awb', filters.awb);
      
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
      const { data, error, count } = await query;
      
      if (error) throw new AppError(error.message, 400);
      return { data: data || [], total: count || 0 };
    } catch (error: any) {
      logger.error('Error fetching shipments:', error);
      throw error;
    }
  }

  async getShipmentById(id: string) {
    const { data } = await this.supabase.from('shipments').select('*').eq('id', id).single();
    return data;
  }

  async createShipment(shipmentData: any) {
    const { data } = await this.supabase.from('shipments').insert(shipmentData).select().single();
    return data;
  }

  async updateShipment(id: string, updates: any) {
    const { data } = await this.supabase.from('shipments').update(updates).eq('id', id).select().single();
    return data;
  }

  async updateShipmentStatus(id: string, status: string, location: string, notes: string, userId: string) {
    const { data } = await this.supabase.from('shipments').update({ status, current_location: location, notes }).eq('id', id).select().single();
    return data;
  }

  async trackAWB(awb: string) {
    const { data } = await this.supabase.from('shipments').select('*').eq('awb', awb).single();
    return data;
  }

  async createMasterCarton(cartonData: any) {
    const { data } = await this.supabase.from('master_cartons').insert(cartonData).select().single();
    return data;
  }

  async getMasterCarton(cartonNumber: string) {
    const { data } = await this.supabase.from('master_cartons').select('*').eq('carton_number', cartonNumber).single();
    return data;
  }

  async generatePackingList(shipmentId: string) {
    return Buffer.from('PDF packing list');
  }

  async generateShippingLabels(shipmentId: string) {
    return Buffer.from('PDF shipping labels');
  }

  async deleteShipment(id: string) {
    await this.supabase.from('shipments').delete().eq('id', id);
    return true;
  }

  async getDeliveryStatus(id: string) {
    const { data } = await this.supabase.from('shipments').select('delivery_status').eq('id', id).single();
    return data;
  }

  async confirmDelivery(id: string, confirmationData: any) {
    const { data } = await this.supabase.from('shipments').update({ ...confirmationData, status: 'delivered' }).eq('id', id).select().single();
    return data;
  }

  async getShipmentTimeline(id: string) {
    return [];
  }

  async getShippingStatistics(filters: any) {
    return { total: 0, delivered: 0, inTransit: 0, pending: 0 };
  }

  async exportShipmentsToExcel(filters: any) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipments');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
