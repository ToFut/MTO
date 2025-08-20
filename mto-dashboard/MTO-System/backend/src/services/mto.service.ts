import { db } from '../config/database';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

interface MTOFilters {
  poId?: string;
  status?: string;
  productionCategory?: string;
  priority?: string;
  brandId?: string;
  factoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit: number;
  offset: number;
}

export class MTOService {
  private db = db;

  async getMTOs(filters: MTOFilters) {
    try {
      let query = this.db
        .from('mtos')
        .select(`
          *,
          purchase_orders(*),
          defects(count)
        `, { count: 'exact' });

      // Apply filters
      if (filters.poId) {
        query = query.eq('po_id', filters.poId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.productionCategory) {
        query = query.eq('production_category', filters.productionCategory);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.brandId) {
        query = query.eq('brand_id', filters.brandId);
      }
      if (filters.factoryId) {
        query = query.eq('factory_id', filters.factoryId);
      }
      if (filters.search) {
        query = query.or(`
          internal_id.ilike.%${filters.search}%,
          reference_number.ilike.%${filters.search}%,
          display_name.ilike.%${filters.search}%,
          sales_order_number.ilike.%${filters.search}%
        `);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // Pagination
      query = query
        .order('created_at', { ascending: false })
        .range(filters.offset, filters.offset + filters.limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new AppError(error.message, 400);
      }

      return {
        data: data || [],
        total: count || 0,
      };
    } catch (error: any) {
      logger.error('Error fetching MTOs:', error);
      throw error;
    }
  }

  async getMTOById(id: string) {
    try {
      const { data, error } = await this.db
        .from('mtos')
        .select(`
          *,
          po:purchase_orders(*),
          brand:companies!mtos_brand_id_fkey(*),
          factory:companies!mtos_factory_id_fkey(*),
          defects(*),
          barcodes(*),
          inventory_allocations(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new AppError(error.message, 400);
      }

      return data;
    } catch (error: any) {
      logger.error(`Error fetching MTO ${id}:`, error);
      throw error;
    }
  }

  async createMTO(mtoData: any) {
    try {
      // Generate internal ID if not provided
      if (!mtoData.internal_id) {
        mtoData.internal_id = await this.generateInternalId();
      }

      // Set default values
      mtoData.status = mtoData.status || 'pending';
      mtoData.production_stage = mtoData.production_stage || 'receive';
      mtoData.is_replacement = mtoData.is_replacement || false;

      const { data, error } = await this.db
        .from('mtos')
        .insert(mtoData)
        .select()
        .single();

      if (error) {
        throw new AppError(error.message, 400);
      }

      // Create barcodes for the MTO
      await this.createMTOBarcodes(data.id, data);

      // Auto-populate inventory if needed
      await this.autoPopulateInventory(data);

      return data;
    } catch (error: any) {
      logger.error('Error creating MTO:', error);
      throw error;
    }
  }

  async updateMTO(id: string, updates: any) {
    try {
      const { data, error } = await this.db
        .from('mtos')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new AppError(error.message, 400);
      }

      return data;
    } catch (error: any) {
      logger.error(`Error updating MTO ${id}:`, error);
      throw error;
    }
  }

  async updateMTOStatus(id: string, status: string, userId: string) {
    try {
      // Get current MTO
      const { data: currentMTO } = await this.db
        .from('mtos')
        .select('status')
        .eq('id', id)
        .single();

      // Update status
      const { data, error } = await this.db
        .from('mtos')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new AppError(error.message, 400);
      }

      // Log status change
      await this.db
        .from('mto_status_history')
        .insert({
          mto_id: id,
          old_status: currentMTO?.status,
          new_status: status,
          changed_by: userId,
        });

      return data;
    } catch (error: any) {
      logger.error(`Error updating MTO status ${id}:`, error);
      throw error;
    }
  }

  async updateProductionStage(id: string, stage: string, userId: string) {
    try {
      // Get current MTO
      const { data: currentMTO } = await this.db
        .from('mtos')
        .select('production_stage')
        .eq('id', id)
        .single();

      // Update production stage
      const { data, error } = await this.db
        .from('mtos')
        .update({
          production_stage: stage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new AppError(error.message, 400);
      }

      // Log production stage change
      await this.db
        .from('production_history')
        .insert({
          mto_id: id,
          old_stage: currentMTO?.production_stage,
          new_stage: stage,
          changed_by: userId,
        });

      return data;
    } catch (error: any) {
      logger.error(`Error updating production stage ${id}:`, error);
      throw error;
    }
  }

  async deleteMTO(id: string) {
    try {
      const { error } = await this.db
        .from('mtos')
        .delete()
        .eq('id', id);

      if (error) {
        throw new AppError(error.message, 400);
      }

      return true;
    } catch (error: any) {
      logger.error(`Error deleting MTO ${id}:`, error);
      throw error;
    }
  }

  async bulkUploadMTOs(file: any, poId: string, brandId: string, userId: string) {
    try {
      // Read Excel file
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Parse MTOs from Excel data
      const mtos = this.parseExcelData(data, poId, brandId);

      // Validate MTOs
      const validMTOs = [];
      const errors = [];

      for (let i = 0; i < mtos.length; i++) {
        const validation = this.validateMTO(mtos[i]);
        if (validation.isValid) {
          validMTOs.push(mtos[i]);
        } else {
          errors.push({
            row: i + 2,
            errors: validation.errors,
          });
        }
      }

      // Insert valid MTOs
      if (validMTOs.length > 0) {
        const { data: insertedMTOs, error } = await this.db
          .from('mtos')
          .insert(validMTOs)
          .select();

        if (error) {
          throw new AppError(error.message, 400);
        }

        // Create barcodes for all MTOs
        for (const mto of insertedMTOs || []) {
          await this.createMTOBarcodes(mto.id, mto);
        }

        // Clean up uploaded file
        fs.unlinkSync(file.path);

        return {
          created: insertedMTOs?.length || 0,
          errors,
          mtos: insertedMTOs,
        };
      }

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      return {
        created: 0,
        errors,
        mtos: [],
      };
    } catch (error: any) {
      logger.error('Error in bulk MTO upload:', error);
      throw error;
    }
  }

  async getMTOStatistics(filters: any) {
    try {
      let query = this.db
        .from('mtos')
        .select('*', { count: 'exact', head: false });

      // Apply filters
      if (filters.brandId) {
        query = query.eq('brand_id', filters.brandId);
      }
      if (filters.factoryId) {
        query = query.eq('factory_id', filters.factoryId);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, count } = await query;

      if (!data) {
        return this.getEmptyStatistics();
      }

      // Calculate statistics
      const stats = {
        total: count || 0,
        byStatus: this.groupBy(data, 'status'),
        byProductionStage: this.groupBy(data, 'production_stage'),
        byPriority: this.groupBy(data, 'priority'),
        byCategory: this.groupBy(data, 'production_category'),
        dailyCount: data.filter((m: any) => m.production_category === 'daily').length,
        monthlyCount: data.filter((m: any) => m.production_category === 'monthly').length,
        urgentCount: data.filter((m: any) => m.priority === 'urgent').length,
        completionRate: this.calculateCompletionRate(data),
        averageProductionTime: await this.calculateAverageProductionTime(data),
      };

      return stats;
    } catch (error: any) {
      logger.error('Error getting MTO statistics:', error);
      throw error;
    }
  }

  async getMTOTimeline(id: string) {
    try {
      const { data: statusHistory } = await this.db
        .from('mto_status_history')
        .select(`
          *,
          user:users(full_name, email)
        `)
        .eq('mto_id', id)
        .order('created_at', { ascending: true });

      const { data: productionHistory } = await this.db
        .from('production_history')
        .select(`
          *,
          user:users(full_name, email)
        `)
        .eq('mto_id', id)
        .order('created_at', { ascending: true });

      return {
        statusHistory: statusHistory || [],
        productionHistory: productionHistory || [],
      };
    } catch (error: any) {
      logger.error(`Error getting MTO timeline ${id}:`, error);
      throw error;
    }
  }

  async exportMTOsToExcel(filters: any) {
    try {
      // Get MTOs
      const { data: mtos } = await this.getMTOs({
        ...filters,
        limit: 10000,
        offset: 0,
      });

      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert MTOs to worksheet data
      const worksheetData = mtos.map((mto: any) => ({
        'Internal ID': mto.internal_id,
        'PO Line ID': mto.po_line_id,
        'Reference Number': mto.reference_number,
        'Display Name': mto.display_name,
        'Status': mto.status,
        'Production Stage': mto.production_stage,
        'Priority': mto.priority,
        'Category': mto.production_category,
        'Quantity': mto.quantity,
        'Ship Date': mto.expected_ship_date,
        'Created At': mto.created_at,
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'MTOs');
      
      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return buffer;
    } catch (error: any) {
      logger.error('Error exporting MTOs to Excel:', error);
      throw error;
    }
  }

  // Helper methods
  private async generateInternalId(): Promise<string> {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `MTO-${timestamp}-${random}`.toUpperCase();
  }

  private async createMTOBarcodes(mtoId: string, mtoData: any) {
    try {
      const barcodes = [];

      // Line barcode
      barcodes.push({
        mto_id: mtoId,
        type: 'line',
        value: `PO:${mtoData.po_id}|LINE:${mtoData.po_line_id}|REF:${mtoData.reference_number}`,
      });

      // Spot barcodes
      for (let i = 1; i <= 6; i++) {
        const spotSKU = mtoData[`spot${i}`];
        if (spotSKU) {
          barcodes.push({
            mto_id: mtoId,
            type: 'spot',
            value: `PO:${mtoData.po_id}|LINE:${mtoData.po_line_id}|SPOT:${i}|SKU:${spotSKU}`,
            spot_number: i,
          });
        }
      }

      // Master carton barcode
      if (mtoData.master_carton) {
        barcodes.push({
          mto_id: mtoId,
          type: 'master',
          value: `PO:${mtoData.po_id}|MASTER:${mtoData.master_carton}`,
        });
      }

      // Insert barcodes
      if (barcodes.length > 0) {
        await this.db.from('barcodes').insert(barcodes);
      }
    } catch (error: any) {
      logger.error(`Error creating barcodes for MTO ${mtoId}:`, error);
    }
  }

  private async autoPopulateInventory(mtoData: any) {
    try {
      // Extract all SKUs from MTO
      const skus = [];
      
      // Base product
      if (mtoData.bag_base_pid) {
        skus.push(mtoData.bag_base_pid);
      }

      // Spots
      for (let i = 1; i <= 6; i++) {
        const spotSKU = mtoData[`spot${i}`];
        if (spotSKU) {
          skus.push(spotSKU);
        }
      }

      // Check and create inventory items if they don't exist
      for (const sku of skus) {
        const { data: existing } = await this.db
          .from('inventory')
          .select('id')
          .eq('sku', sku)
          .single();

        if (!existing) {
          await this.db
            .from('inventory')
            .insert({
              sku,
              name: sku,
              category: 'patch',
              current_stock: 0,
              reserved_stock: 0,
              available_stock: 0,
              reorder_level: 100,
              reorder_quantity: 500,
            });
        }
      }
    } catch (error: any) {
      logger.error('Error auto-populating inventory:', error);
    }
  }

  private parseExcelData(data: any[], poId: string, brandId: string): any[] {
    const headers = data[0];
    const mtos = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip empty rows

      const mto = {
        internal_id: row[0],
        po_id: poId,
        po_line_id: row[1],
        expected_ship_date: this.parseExcelDate(row[2]),
        actual_ship_date: this.parseExcelDate(row[3]),
        po_line_tracking: row[4],
        awb: row[5],
        master_carton: row[6],
        vendor_po_status: row[7],
        order_submit_date: this.parseExcelDate(row[8]),
        so_date: this.parseExcelDate(row[9]),
        shopify_order_date: this.parseExcelDate(row[10]),
        sales_order_number: row[11],
        cpsd: this.parseExcelDate(row[12]),
        display_name: row[13],
        reference_number: row[14],
        quantity: parseInt(row[15]) || 1,
        spot1: row[16],
        spot2: row[17],
        spot3: row[18],
        spot4: row[19],
        spot5: row[20],
        spot6: row[21],
        bag_base_pid: row[22],
        spot1_patch_ref: row[23],
        spot2_patch_ref: row[24],
        spot3_patch_ref: row[25],
        spot4_patch_ref: row[26],
        spot5_patch_ref: row[27],
        spot6_patch_ref: row[28],
        brand_id: brandId,
        status: 'pending',
        production_stage: 'receive',
        production_category: this.determineCategory(row[2]),
        priority: this.determinePriority(row[2]),
        is_replacement: false,
      };

      mtos.push(mto);
    }

    return mtos;
  }

  private parseExcelDate(value: any): string | null {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'number') {
      // Excel date serial number
      const excelEpoch = new Date(1900, 0, 1);
      const msPerDay = 24 * 60 * 60 * 1000;
      const date = new Date(excelEpoch.getTime() + (value - 2) * msPerDay);
      return date.toISOString();
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString();
    }
    return null;
  }

  private determineCategory(shipDate: any): 'daily' | 'monthly' {
    if (!shipDate) return 'monthly';
    const date = this.parseExcelDate(shipDate);
    if (!date) return 'monthly';
    const daysUntilShip = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilShip <= 7 ? 'daily' : 'monthly';
  }

  private determinePriority(shipDate: any): string {
    const category = this.determineCategory(shipDate);
    if (category === 'daily') return 'urgent';
    
    const date = this.parseExcelDate(shipDate);
    if (!date) return 'normal';
    
    const daysUntilShip = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilShip < 0) return 'urgent';
    if (daysUntilShip <= 3) return 'urgent';
    if (daysUntilShip <= 7) return 'high';
    if (daysUntilShip <= 14) return 'normal';
    return 'low';
  }

  private validateMTO(mto: any): { isValid: boolean; errors: string[] } {
    const errors = [];
    
    if (!mto.internal_id) {
      errors.push('Internal ID is required');
    }
    
    if (!mto.po_line_id) {
      errors.push('PO Line ID is required');
    }
    
    if (!mto.reference_number) {
      errors.push('Reference number is required');
    }
    
    if (!mto.display_name) {
      errors.push('Display name is required');
    }
    
    if (!mto.quantity || mto.quantity < 1) {
      errors.push('Valid quantity is required');
    }
    
    if (!mto.bag_base_pid) {
      errors.push('Base product ID is required');
    }
    
    // Check if at least one spot is filled
    const hasSpots = [
      mto.spot1, mto.spot2, mto.spot3,
      mto.spot4, mto.spot5, mto.spot6
    ].some(spot => spot && spot.toString().trim());
    
    if (!hasSpots) {
      errors.push('At least one customization spot is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private groupBy(data: any[], key: string): Record<string, number> {
    return data.reduce((acc, item) => {
      const value = item[key] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateCompletionRate(data: any[]): number {
    if (data.length === 0) return 0;
    const completed = data.filter((m: any) => m.status === 'shipped').length;
    return Math.round((completed / data.length) * 100);
  }

  private async calculateAverageProductionTime(data: any[]): Promise<number> {
    const completedMTOs = data.filter((m: any) => m.status === 'shipped' && m.created_at && m.updated_at);
    
    if (completedMTOs.length === 0) return 0;
    
    const totalTime = completedMTOs.reduce((sum, mto) => {
      const start = new Date(mto.created_at).getTime();
      const end = new Date(mto.updated_at).getTime();
      return sum + (end - start);
    }, 0);
    
    // Return average time in days
    return Math.round(totalTime / completedMTOs.length / (1000 * 60 * 60 * 24));
  }

  private getEmptyStatistics() {
    return {
      total: 0,
      byStatus: {},
      byProductionStage: {},
      byPriority: {},
      byCategory: {},
      dailyCount: 0,
      monthlyCount: 0,
      urgentCount: 0,
      completionRate: 0,
      averageProductionTime: 0,
    };
  }
}