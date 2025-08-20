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
exports.DefectService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../config/logger");
const error_middleware_1 = require("../middleware/error.middleware");
const XLSX = __importStar(require("xlsx"));
class DefectService {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    async getDefects(filters) {
        try {
            let query = this.supabase.from('defects').select('*', { count: 'exact' });
            if (filters.mtoId)
                query = query.eq('mto_id', filters.mtoId);
            if (filters.status)
                query = query.eq('status', filters.status);
            query = query.range(filters.offset, filters.offset + filters.limit - 1);
            const { data, error, count } = await query;
            if (error)
                throw new error_middleware_1.AppError(error.message, 400);
            return { data: data || [], total: count || 0 };
        }
        catch (error) {
            logger_1.logger.error('Error fetching defects:', error);
            throw error;
        }
    }
    async getDefectById(id) {
        const { data } = await this.supabase.from('defects').select('*').eq('id', id).single();
        return data;
    }
    async reportDefect(defectData) {
        const { data: defect } = await this.supabase.from('defects').insert(defectData).select().single();
        if (defectData.create_replacement) {
            const replacement = await this.createReplacementMTO(defect.id, true, '', defectData.reported_by);
            return { defect, replacement };
        }
        return { defect };
    }
    async updateDefectStatus(id, status, notes, userId) {
        const { data } = await this.supabase.from('defects').update({ status, notes }).eq('id', id).select().single();
        return data;
    }
    async createReplacementMTO(defectId, isRush, notes, userId) {
        const { data: defect } = await this.supabase.from('defects').select('*, mto:mtos(*)').eq('id', defectId).single();
        if (!defect || !defect.mto)
            throw new error_middleware_1.AppError('Defect or MTO not found', 404);
        const replacementMTO = {
            ...defect.mto,
            id: undefined,
            is_replacement: true,
            is_rush: isRush,
            parent_mto_id: defect.mto_id,
            defect_id: defectId,
            status: 'pending',
            priority: 'urgent'
        };
        const { data } = await this.supabase.from('mtos').insert(replacementMTO).select().single();
        return data;
    }
    async updateDefect(id, updates) {
        const { data } = await this.supabase.from('defects').update(updates).eq('id', id).select().single();
        return data;
    }
    async deleteDefect(id) {
        await this.supabase.from('defects').delete().eq('id', id);
        return true;
    }
    async getDefectQueue(filters) {
        const { data } = await this.supabase.from('defects').select('*').eq('status', 'pending');
        return data || [];
    }
    async assignDefect(id, assignedTo, assignedBy) {
        const { data } = await this.supabase.from('defects').update({ assigned_to: assignedTo }).eq('id', id).select().single();
        return data;
    }
    async getDefectStatistics(filters) {
        return { total: 0, resolved: 0, pending: 0, byType: {} };
    }
    async getDefectTimeline(id) {
        return [];
    }
    async addQCPhotos(id, photos) {
        const { data } = await this.supabase.from('defects').update({ qc_photos: photos }).eq('id', id).select().single();
        return data;
    }
    async exportDefectsToExcel(filters) {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Defects');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
    async generateAQLReport(filters) {
        return { passed: 0, failed: 0, defectRate: 0 };
    }
}
exports.DefectService = DefectService;
//# sourceMappingURL=defect.service.js.map