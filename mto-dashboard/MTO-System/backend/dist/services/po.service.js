"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.POService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../config/logger");
const error_middleware_1 = require("../middleware/error.middleware");
const XLSX = __importStar(require("xlsx"));
class POService {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    async getPOs(filters) {
        try {
            let query = this.supabase
                .from('purchase_orders')
                .select(`
          *,
          brand:companies!purchase_orders_brand_id_fkey(*),
          factory:companies!purchase_orders_factory_id_fkey(*),
          mtos(count)
        `, { count: 'exact' });
            // Apply filters
            if (filters.brandId) {
                query = query.eq('brand_id', filters.brandId);
            }
            if (filters.factoryId) {
                query = query.eq('factory_id', filters.factoryId);
            }
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.search) {
                query = query.or(`po_number.ilike.%${filters.search}%`);
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
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return {
                data: data || [],
                total: count || 0,
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching POs:', error);
            throw error;
        }
    }
    async getPOById(id) {
        try {
            const { data, error } = await this.supabase
                .from('purchase_orders')
                .select(`
          *,
          brand:companies!purchase_orders_brand_id_fkey(*),
          factory:companies!purchase_orders_factory_id_fkey(*),
          mtos(*)
        `)
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error(`Error fetching PO ${id}:`, error);
            throw error;
        }
    }
    async createPO(poData) {
        try {
            // Generate PO number if not provided
            if (!poData.po_number) {
                poData.po_number = await this.generatePONumber();
            }
            // Set default values
            poData.status = poData.status || 'not_started';
            poData.total_mtos = 0;
            poData.completed_mtos = 0;
            poData.defective_mtos = 0;
            poData.progress = 0;
            const { data, error } = await this.supabase
                .from('purchase_orders')
                .insert(poData)
                .select()
                .single();
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error creating PO:', error);
            throw error;
        }
    }
    async updatePO(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from('purchase_orders')
                .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            // Update progress if MTOs changed
            await this.updatePOProgress(id);
            return data;
        }
        catch (error) {
            logger_1.logger.error(`Error updating PO ${id}:`, error);
            throw error;
        }
    }
    async updatePOStatus(id, status, userId) {
        try {
            // Get current PO
            const { data: currentPO } = await this.supabase
                .from('purchase_orders')
                .select('status')
                .eq('id', id)
                .single();
            // Update status
            const { data, error } = await this.supabase
                .from('purchase_orders')
                .update({
                status,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            // Log status change
            await this.supabase
                .from('po_status_history')
                .insert({
                po_id: id,
                old_status: currentPO?.status,
                new_status: status,
                changed_by: userId,
            });
            return data;
        }
        catch (error) {
            logger_1.logger.error(`Error updating PO status ${id}:`, error);
            throw error;
        }
    }
    async deletePO(id) {
        try {
            // Check if PO has MTOs
            const { data: mtos } = await this.supabase
                .from('mtos')
                .select('id')
                .eq('po_id', id)
                .limit(1);
            if (mtos && mtos.length > 0) {
                throw new error_middleware_1.AppError('Cannot delete PO with existing MTOs', 400);
            }
            const { error } = await this.supabase
                .from('purchase_orders')
                .delete()
                .eq('id', id);
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Error deleting PO ${id}:`, error);
            throw error;
        }
    }
    async getPOProgress(id) {
        try {
            // Get all MTOs for this PO
            const { data: mtos } = await this.supabase
                .from('mtos')
                .select('status, production_stage')
                .eq('po_id', id);
            if (!mtos || mtos.length === 0) {
                return {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    pending: 0,
                    defective: 0,
                    progress: 0,
                };
            }
            const stats = {
                total: mtos.length,
                completed: mtos.filter(m => m.status === 'shipped').length,
                inProgress: mtos.filter(m => ['proceed', 'qc', 'shipping'].includes(m.status)).length,
                pending: mtos.filter(m => m.status === 'pending').length,
                defective: 0, // Will be calculated separately
                progress: 0,
            };
            // Get defect count
            const { count: defectCount } = await this.supabase
                .from('defects')
                .select('*', { count: 'exact', head: true })
                .in('mto_id', mtos.map((m) => m.id));
            stats.defective = defectCount || 0;
            stats.progress = Math.round((stats.completed / stats.total) * 100);
            return stats;
        }
        catch (error) {
            logger_1.logger.error(`Error getting PO progress ${id}:`, error);
            throw error;
        }
    }
    async getPOTimeline(id) {
        try {
            const { data: statusHistory } = await this.supabase
                .from('po_status_history')
                .select(`
          *,
          user:users(full_name, email)
        `)
                .eq('po_id', id)
                .order('created_at', { ascending: true });
            const { data: events } = await this.supabase
                .from('po_events')
                .select('*')
                .eq('po_id', id)
                .order('created_at', { ascending: true });
            return {
                statusHistory: statusHistory || [],
                events: events || [],
            };
        }
        catch (error) {
            logger_1.logger.error(`Error getting PO timeline ${id}:`, error);
            throw error;
        }
    }
    async exportPOToExcel(id) {
        try {
            // Get PO with all MTOs
            const po = await this.getPOById(id);
            if (!po) {
                throw new error_middleware_1.AppError('Purchase order not found', 404);
            }
            // Create workbook
            const workbook = XLSX.utils.book_new();
            // PO Summary Sheet
            const poSummary = [{
                    'PO Number': po.po_number,
                    'Brand': po.brand?.name,
                    'Factory': po.factory?.name,
                    'Status': po.status,
                    'Order Date': po.order_date,
                    'XF Date': po.xf_date,
                    'Expected Ship Date': po.expected_ship_date,
                    'Total MTOs': po.total_mtos,
                    'Completed MTOs': po.completed_mtos,
                    'Progress': `${po.progress}%`,
                }];
            const poSheet = XLSX.utils.json_to_sheet(poSummary);
            XLSX.utils.book_append_sheet(workbook, poSheet, 'PO Summary');
            // MTOs Sheet
            if (po.mtos && po.mtos.length > 0) {
                const mtosData = po.mtos.map((mto) => ({
                    'Internal ID': mto.internal_id,
                    'PO Line ID': mto.po_line_id,
                    'Reference': mto.reference_number,
                    'Display Name': mto.display_name,
                    'Status': mto.status,
                    'Production Stage': mto.production_stage,
                    'Priority': mto.priority,
                    'Quantity': mto.quantity,
                    'Expected Ship': mto.expected_ship_date,
                    'Actual Ship': mto.actual_ship_date,
                }));
                const mtoSheet = XLSX.utils.json_to_sheet(mtosData);
                XLSX.utils.book_append_sheet(workbook, mtoSheet, 'MTOs');
            }
            // Generate buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            return buffer;
        }
        catch (error) {
            logger_1.logger.error(`Error exporting PO ${id} to Excel:`, error);
            throw error;
        }
    }
    // Helper methods
    async generatePONumber() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `PO-${timestamp}-${random}`.toUpperCase();
    }
    async updatePOProgress(poId) {
        try {
            const progress = await this.getPOProgress(poId);
            await this.supabase
                .from('purchase_orders')
                .update({
                total_mtos: progress.total,
                completed_mtos: progress.completed,
                defective_mtos: progress.defective,
                progress: progress.progress,
                updated_at: new Date().toISOString(),
            })
                .eq('id', poId);
        }
        catch (error) {
            logger_1.logger.error(`Error updating PO progress ${poId}:`, error);
        }
    }
}
exports.POService = POService;
exports.default = POService;
//# sourceMappingURL=po.service.js.map