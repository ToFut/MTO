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

  /**
   * Smart auto-populate inventory from MTOs with intelligent analysis
   */
  async autoPopulateFromMTOs(mtos: any[], brandId: string, factoryId: string): Promise<any> {
    try {
      logger.info(`Starting smart inventory auto-population from ${mtos.length} MTOs...`);

      const inventoryMap = new Map<string, any>();
      const categoryStats = new Map<string, number>();

      // Process each MTO and extract spot requirements
      for (const mto of mtos) {
        if (mto.spots_data) {
          for (const spot of mto.spots_data) {
            const sku = spot.sku;
            
            if (inventoryMap.has(sku)) {
              // Update existing inventory item
              const item = inventoryMap.get(sku);
              item.quantity_needed += mto.quantity || 1;
              item.mto_ids.push(mto.id);
              if (!item.po_ids.includes(mto.po_id)) {
                item.po_ids.push(mto.po_id);
              }
              
              // Update production category distribution
              if (mto.production_category === 'daily') {
                item.daily_quantity += mto.quantity || 1;
              } else {
                item.monthly_quantity += mto.quantity || 1;
              }
            } else {
              // Create new inventory item with smart analysis
              const itemAnalysis = this.analyzeInventoryItem(spot, mto);
              
              const inventoryItem = {
                item_code: sku,
                item_name: spot.description || spot.patch_ref || `Patch ${sku}`,
                category: itemAnalysis.category,
                subcategory: itemAnalysis.subcategory,
                
                // Quantities
                quantity_needed: mto.quantity || 1,
                quantity_in_stock: 0,
                quantity_allocated: 0,
                quantity_available: 0,
                
                // Production distribution
                daily_quantity: mto.production_category === 'daily' ? (mto.quantity || 1) : 0,
                monthly_quantity: mto.production_category === 'monthly' ? (mto.quantity || 1) : 0,
                
                // Reorder management
                reorder_level: itemAnalysis.reorderLevel,
                reorder_quantity: itemAnalysis.reorderQuantity,
                is_shortage: true, // New items start as shortage
                
                // Production details
                production_time_minutes: spot.production_time_minutes || 15,
                complexity_level: spot.complexity_level || 'medium',
                
                // Visual and location info
                visual_location: spot.visual_location || 'center',
                patch_type: spot.patch_type || 'embroidery',
                patch_size: itemAnalysis.size,
                
                // Material details
                thread_colors: itemAnalysis.threadColors,
                material_cost: itemAnalysis.estimatedCost,
                
                // Tracking
                po_ids: [mto.po_id],
                mto_ids: [mto.id],
                brand_id: brandId,
                factory_id: factoryId,
                
                // Metadata
                tags: itemAnalysis.tags,
                priority: this.calculateInventoryPriority(mto, spot),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              inventoryMap.set(sku, inventoryItem);
              
              // Update category stats
              const category = itemAnalysis.category;
              categoryStats.set(category, (categoryStats.get(category) || 0) + 1);
            }
          }
        }

        // Process base product if exists
        if (mto.bag_base_pid) {
          const baseSku = mto.bag_base_pid;
          if (!inventoryMap.has(baseSku)) {
            const baseItem = {
              item_code: baseSku,
              item_name: `Base Product - ${mto.display_name || 'Unknown'}`,
              category: 'base_product',
              subcategory: 'bag',
              quantity_needed: mto.quantity || 1,
              quantity_in_stock: 0,
              quantity_allocated: 0,
              quantity_available: 0,
              daily_quantity: mto.production_category === 'daily' ? (mto.quantity || 1) : 0,
              monthly_quantity: mto.production_category === 'monthly' ? (mto.quantity || 1) : 0,
              reorder_level: 50,
              reorder_quantity: 100,
              is_shortage: true,
              po_ids: [mto.po_id],
              mto_ids: [mto.id],
              brand_id: brandId,
              factory_id: factoryId,
              tags: ['base-product', 'bag'],
              priority: 'high',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            inventoryMap.set(baseSku, baseItem);
            categoryStats.set('base_product', (categoryStats.get('base_product') || 0) + 1);
          }
        }
      }

      // Convert map to array and bulk upsert
      const inventoryItems = Array.from(inventoryMap.values());
      let createdCount = 0;
      let updatedCount = 0;

      // Process in batches
      const batchSize = 50;
      for (let i = 0; i < inventoryItems.length; i += batchSize) {
        const batch = inventoryItems.slice(i, i + batchSize);
        
        for (const item of batch) {
          try {
            // Check if item already exists
            const { data: existing } = await this.supabase
              .from('inventory')
              .select('*')
              .eq('item_code', item.item_code)
              .eq('brand_id', brandId)
              .single();

            if (existing) {
              // Update existing item
              const { error: updateError } = await this.supabase
                .from('inventory')
                .update({
                  quantity_needed: item.quantity_needed,
                  daily_quantity: item.daily_quantity,
                  monthly_quantity: item.monthly_quantity,
                  po_ids: [...new Set([...(existing.po_ids || []), ...item.po_ids])],
                  mto_ids: [...new Set([...(existing.mto_ids || []), ...item.mto_ids])],
                  updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);

              if (!updateError) updatedCount++;
            } else {
              // Create new item
              const { error: insertError } = await this.supabase
                .from('inventory')
                .insert(item);

              if (!insertError) createdCount++;
            }
          } catch (error) {
            logger.error(`Failed to process inventory item ${item.item_code}:`, error);
          }
        }
      }

      // Generate shortage alerts for high-priority items
      const shortageAlerts = await this.generateShortageAlerts(inventoryItems, brandId, factoryId);

      logger.info(`Inventory auto-population completed: ${createdCount} created, ${updatedCount} updated`);

      return {
        created: createdCount,
        updated: updatedCount,
        totalProcessed: inventoryItems.length,
        categoryBreakdown: Object.fromEntries(categoryStats),
        shortageAlerts: shortageAlerts.length,
        summary: {
          totalSKUs: inventoryMap.size,
          dailyProduction: inventoryItems.reduce((sum, item) => sum + item.daily_quantity, 0),
          monthlyProduction: inventoryItems.reduce((sum, item) => sum + item.monthly_quantity, 0),
          highPriorityItems: inventoryItems.filter(item => item.priority === 'high').length
        }
      };

    } catch (error) {
      logger.error('Error in smart inventory auto-population:', error);
      throw error;
    }
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

  // Smart Inventory Helper Methods

  /**
   * Analyze inventory item for intelligent categorization
   */
  private analyzeInventoryItem(spot: any, mto: any): any {
    const analysis = {
      category: 'patch',
      subcategory: 'embroidery',
      size: 'medium',
      threadColors: ['black'],
      estimatedCost: 2.5,
      reorderLevel: 100,
      reorderQuantity: 500,
      tags: []
    };

    // Category analysis based on patch type
    if (spot.patch_type) {
      const patchType = spot.patch_type.toLowerCase();
      if (patchType.includes('icon')) {
        analysis.category = 'icon_patch';
        analysis.subcategory = 'icon';
        analysis.estimatedCost = 1.5;
        analysis.reorderLevel = 200;
        analysis.tags.push('icon', 'simple');
      } else if (patchType.includes('letter')) {
        analysis.category = 'text_patch';
        analysis.subcategory = 'letter';
        analysis.estimatedCost = 1.8;
        analysis.reorderLevel = 150;
        analysis.tags.push('letter', 'monogram');
      } else if (patchType.includes('custom')) {
        analysis.category = 'custom_patch';
        analysis.subcategory = 'design';
        analysis.estimatedCost = 3.5;
        analysis.reorderLevel = 50;
        analysis.tags.push('custom', 'complex');
      }
    }

    // Size analysis
    if (spot.patch_size) {
      analysis.size = spot.patch_size;
      if (spot.patch_size === 'large') {
        analysis.estimatedCost *= 1.5;
        analysis.reorderLevel = Math.floor(analysis.reorderLevel * 0.7);
      } else if (spot.patch_size === 'small') {
        analysis.estimatedCost *= 0.8;
        analysis.reorderLevel = Math.floor(analysis.reorderLevel * 1.3);
      }
    }

    // Complexity analysis
    if (spot.complexity_level) {
      const complexity = spot.complexity_level.toLowerCase();
      if (complexity === 'complex') {
        analysis.estimatedCost *= 1.5;
        analysis.reorderLevel = Math.floor(analysis.reorderLevel * 0.6);
        analysis.tags.push('complex');
      } else if (complexity === 'simple') {
        analysis.estimatedCost *= 0.8;
        analysis.reorderLevel = Math.floor(analysis.reorderLevel * 1.4);
        analysis.tags.push('simple');
      }
    }

    // Thread color analysis
    if (spot.thread_colors && Array.isArray(spot.thread_colors)) {
      analysis.threadColors = spot.thread_colors;
      // More colors = higher cost and lower reorder level (specialty item)
      if (spot.thread_colors.length > 3) {
        analysis.estimatedCost *= 1.3;
        analysis.reorderLevel = Math.floor(analysis.reorderLevel * 0.8);
        analysis.tags.push('multi-color');
      }
    }

    // Production urgency impact
    if (mto.production_category === 'daily') {
      analysis.reorderLevel = Math.floor(analysis.reorderLevel * 1.5);
      analysis.reorderQuantity = Math.floor(analysis.reorderQuantity * 1.2);
      analysis.tags.push('urgent');
    }

    return analysis;
  }

  /**
   * Calculate inventory priority based on MTO and spot characteristics
   */
  private calculateInventoryPriority(mto: any, spot: any): string {
    let priorityScore = 0;

    // MTO priority influence
    if (mto.priority === 'urgent') priorityScore += 3;
    else if (mto.priority === 'high') priorityScore += 2;
    else if (mto.priority === 'normal') priorityScore += 1;

    // Production category influence
    if (mto.production_category === 'daily') priorityScore += 2;

    // Rush order influence
    if (mto.is_rush) priorityScore += 2;

    // Complexity influence (complex items need more lead time)
    if (spot.complexity_level === 'complex') priorityScore += 1;

    // Convert score to priority level
    if (priorityScore >= 6) return 'urgent';
    if (priorityScore >= 4) return 'high';
    if (priorityScore >= 2) return 'normal';
    return 'low';
  }

  /**
   * Generate shortage alerts for high-priority items
   */
  private async generateShortageAlerts(inventoryItems: any[], brandId: string, factoryId: string): Promise<any[]> {
    const alerts: any[] = [];

    for (const item of inventoryItems) {
      if (item.is_shortage && (item.priority === 'urgent' || item.priority === 'high')) {
        alerts.push({
          item_code: item.item_code,
          item_name: item.item_name,
          priority: item.priority,
          quantity_needed: item.quantity_needed,
          shortage_amount: item.quantity_needed - item.quantity_in_stock,
          affected_mtos: item.mto_ids.length,
          affected_pos: item.po_ids.length,
          category: item.category,
          estimated_cost: item.material_cost * item.quantity_needed,
          production_category: {
            daily: item.daily_quantity,
            monthly: item.monthly_quantity
          }
        });
      }
    }

    // Sort by priority and shortage amount
    alerts.sort((a, b) => {
      const priorityOrder = { urgent: 3, high: 2, normal: 1, low: 0 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.shortage_amount - a.shortage_amount;
    });

    logger.info(`Generated ${alerts.length} shortage alerts`);
    return alerts;
  }
}
