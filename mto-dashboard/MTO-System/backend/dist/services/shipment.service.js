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
exports.ShipmentService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../config/logger");
const error_middleware_1 = require("../middleware/error.middleware");
const XLSX = __importStar(require("xlsx"));
class ShipmentService {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    async getShipments(filters) {
        try {
            let query = this.supabase.from('shipments').select('*', { count: 'exact' });
            if (filters.status)
                query = query.eq('status', filters.status);
            if (filters.awb)
                query = query.eq('awb', filters.awb);
            query = query.range(filters.offset, filters.offset + filters.limit - 1);
            const { data, error, count } = await query;
            if (error)
                throw new error_middleware_1.AppError(error.message, 400);
            return { data: data || [], total: count || 0 };
        }
        catch (error) {
            logger_1.logger.error('Error fetching shipments:', error);
            throw error;
        }
    }
    async getShipmentById(id) {
        const { data } = await this.supabase.from('shipments').select('*').eq('id', id).single();
        return data;
    }
    async createShipment(shipmentData) {
        const { data } = await this.supabase.from('shipments').insert(shipmentData).select().single();
        return data;
    }
    async updateShipment(id, updates) {
        const { data } = await this.supabase.from('shipments').update(updates).eq('id', id).select().single();
        return data;
    }
    async updateShipmentStatus(id, status, location, notes, userId) {
        const { data } = await this.supabase.from('shipments').update({ status, current_location: location, notes }).eq('id', id).select().single();
        return data;
    }
    async trackAWB(awb) {
        const { data } = await this.supabase.from('shipments').select('*').eq('awb', awb).single();
        return data;
    }
    async createMasterCarton(cartonData) {
        const { data } = await this.supabase.from('master_cartons').insert(cartonData).select().single();
        return data;
    }
    async getMasterCarton(cartonNumber) {
        const { data } = await this.supabase.from('master_cartons').select('*').eq('carton_number', cartonNumber).single();
        return data;
    }
    async generatePackingList(shipmentId) {
        return Buffer.from('PDF packing list');
    }
    async generateShippingLabels(shipmentId) {
        return Buffer.from('PDF shipping labels');
    }
    async deleteShipment(id) {
        await this.supabase.from('shipments').delete().eq('id', id);
        return true;
    }
    async getDeliveryStatus(id) {
        const { data } = await this.supabase.from('shipments').select('delivery_status').eq('id', id).single();
        return data;
    }
    async confirmDelivery(id, confirmationData) {
        const { data } = await this.supabase.from('shipments').update({ ...confirmationData, status: 'delivered' }).eq('id', id).select().single();
        return data;
    }
    async getShipmentTimeline(id) {
        return [];
    }
    async getShippingStatistics(filters) {
        return { total: 0, delivered: 0, inTransit: 0, pending: 0 };
    }
    async exportShipmentsToExcel(filters) {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipments');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
}
exports.ShipmentService = ShipmentService;
//# sourceMappingURL=shipment.service.js.map