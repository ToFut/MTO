"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodeService = void 0;
const supabase_1 = require("../config/supabase");
const error_middleware_1 = require("../middleware/error.middleware");
const qrcode_1 = __importDefault(require("qrcode"));
class BarcodeService {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    async generateMTOBarcode(mtoId, type) {
        const barcodeData = {
            mto_id: mtoId,
            type,
            value: `MTO:${mtoId}|TYPE:${type}|TS:${Date.now()}`,
            qr_image: await this.generateQRCode(`MTO:${mtoId}|TYPE:${type}`)
        };
        const { data, error } = await this.supabase.from('barcodes').insert(barcodeData).select().single();
        if (error)
            throw new error_middleware_1.AppError(error.message, 400);
        return data;
    }
    async generatePOBarcodes(poId) {
        const { data: mtos } = await this.supabase.from('mtos').select('*').eq('po_id', poId);
        const barcodes = [];
        for (const mto of mtos || []) {
            const barcode = await this.generateMTOBarcode(mto.id, 'line');
            barcodes.push(barcode);
        }
        return barcodes;
    }
    async getBarcodeById(id) {
        const { data } = await this.supabase.from('barcodes').select('*').eq('id', id).single();
        return data;
    }
    async scanBarcode(code, userId) {
        const { data } = await this.supabase.from('barcodes').select('*').eq('value', code).single();
        if (data) {
            await this.supabase.from('barcode_scans').insert({ barcode_id: data.id, scanned_by: userId });
        }
        return data;
    }
    async getMTOBarcodes(mtoId) {
        const { data } = await this.supabase.from('barcodes').select('*').eq('mto_id', mtoId);
        return data || [];
    }
    async generateBarcodeLabels(barcodeIds, format) {
        return Buffer.from('PDF content');
    }
    async generateMasterCartonLabels(masterCartonId) {
        return Buffer.from('PDF content');
    }
    async updateScanStatus(id, updates) {
        const { data } = await this.supabase.from('barcodes').update(updates).eq('id', id).select().single();
        return data;
    }
    async getScanHistory(id) {
        const { data } = await this.supabase.from('barcode_scans').select('*').eq('barcode_id', id);
        return data || [];
    }
    async validateBarcodeFormat(code) {
        return code.includes('MTO:') || code.includes('PO:');
    }
    parseBarcodeData(code) {
        const parts = code.split('|');
        return parts.reduce((acc, part) => {
            const [key, value] = part.split(':');
            acc[key.toLowerCase()] = value;
            return acc;
        }, {});
    }
    async generateSpotBarcodeSheet(mtoId) {
        return Buffer.from('PDF content');
    }
    async getBarcodeStatistics(filters) {
        return { total: 0, scanned: 0, pending: 0 };
    }
    async deleteBarcode(id) {
        await this.supabase.from('barcodes').delete().eq('id', id);
        return true;
    }
    async generateQRCode(data) {
        try {
            return await qrcode_1.default.toDataURL(data);
        }
        catch {
            return null;
        }
    }
}
exports.BarcodeService = BarcodeService;
//# sourceMappingURL=barcode.service.js.map