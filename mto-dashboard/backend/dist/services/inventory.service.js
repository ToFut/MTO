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
exports.InventoryService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../config/logger");
const error_middleware_1 = require("../middleware/error.middleware");
const XLSX = __importStar(require("xlsx"));
class InventoryService {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    async getInventoryItems(filters) {
        try {
            let query = this.supabase.from('inventory').select('*', { count: 'exact' });
            if (filters.category)
                query = query.eq('category', filters.category);
            if (filters.isShortage)
                query = query.eq('is_shortage', filters.isShortage);
            query = query.range(filters.offset, filters.offset + filters.limit - 1);
            const { data, error, count } = await query;
            if (error)
                throw new error_middleware_1.AppError(error.message, 400);
            return { data: data || [], total: count || 0 };
        }
        catch (error) {
            logger_1.logger.error('Error fetching inventory:', error);
            throw error;
        }
    }
    async getInventoryItemById(id) {
        const { data, error } = await this.supabase.from('inventory').select('*').eq('id', id).single();
        if (error)
            return null;
        return data;
    }
    async createInventoryItem(itemData) {
        const { data, error } = await this.supabase.from('inventory').insert(itemData).select().single();
        if (error)
            throw new error_middleware_1.AppError(error.message, 400);
        return data;
    }
    async updateInventoryItem(id, updates) {
        const { data, error } = await this.supabase.from('inventory').update(updates).eq('id', id).select().single();
        if (error)
            throw new error_middleware_1.AppError(error.message, 400);
        return data;
    }
    async updateStock(id, quantity, operation, userId) {
        const { data: current } = await this.supabase.from('inventory').select('quantity_in_stock').eq('id', id).single();
        const newQuantity = operation === 'add' ? (current?.quantity_in_stock || 0) + quantity : (current?.quantity_in_stock || 0) - quantity;
        return this.updateInventoryItem(id, { quantity_in_stock: newQuantity });
    }
    async deleteInventoryItem(id) {
        await this.supabase.from('inventory').delete().eq('id', id);
        return true;
    }
    async getShortageAlerts(filters) {
        const { data } = await this.supabase.from('inventory').select('*').eq('is_shortage', true);
        return data || [];
    }
    async autoPopulateFromMTOs(poId) {
        const { data: mtos } = await this.supabase.from('mtos').select('*').eq('po_id', poId);
        return { populated: mtos?.length || 0 };
    }
    async allocateToMTO(inventoryId, mtoId, quantity, userId) {
        return { allocated: true };
    }
    async getInventoryStatistics(companyId) {
        return { total: 0, shortage: 0, allocated: 0 };
    }
    async getInventoryMovements(id) {
        return [];
    }
    async bulkUploadInventory(file, companyId, userId) {
        return { created: 0, items: [] };
    }
    async exportInventoryToExcel(filters) {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
    async getReorderSuggestions(companyId) {
        return [];
    }
}
exports.InventoryService = InventoryService;
//# sourceMappingURL=inventory.service.js.map