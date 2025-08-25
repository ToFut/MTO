import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';
import QRCode from 'qrcode';

export class BarcodeService {
  private supabase = getSupabase();

  async generateMTOBarcode(mtoId: string, type: string) {
    const barcodeData = {
      mto_id: mtoId,
      type,
      value: `MTO:${mtoId}|TYPE:${type}|TS:${Date.now()}`,
      qr_image: await this.generateQRCode(`MTO:${mtoId}|TYPE:${type}`)
    };
    
    const { data, error } = await this.supabase.from('barcodes').insert(barcodeData).select().single();
    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async generatePOBarcodes(poId: string) {
    const { data: mtos } = await this.supabase.from('mtos').select('*').eq('po_id', poId);
    const barcodes = [];
    for (const mto of mtos || []) {
      const barcode = await this.generateMTOBarcode(mto.id, 'line');
      barcodes.push(barcode);
    }
    return barcodes;
  }

  async getBarcodeById(id: string) {
    const { data } = await this.supabase.from('barcodes').select('*').eq('id', id).single();
    return data;
  }

  async scanBarcode(code: string, userId: string) {
    const { data } = await this.supabase.from('barcodes').select('*').eq('value', code).single();
    if (data) {
      await this.supabase.from('barcode_scans').insert({ barcode_id: data.id, scanned_by: userId });
    }
    return data;
  }

  async getMTOBarcodes(mtoId: string) {
    const { data } = await this.supabase.from('barcodes').select('*').eq('mto_id', mtoId);
    return data || [];
  }

  async generateBarcodeLabels(barcodeIds: string[], format: string) {
    return Buffer.from('PDF content');
  }

  async generateMasterCartonLabels(masterCartonId: string) {
    return Buffer.from('PDF content');
  }

  async updateScanStatus(id: string, updates: any) {
    const { data } = await this.supabase.from('barcodes').update(updates).eq('id', id).select().single();
    return data;
  }

  async getScanHistory(id: string) {
    const { data } = await this.supabase.from('barcode_scans').select('*').eq('barcode_id', id);
    return data || [];
  }

  async validateBarcodeFormat(code: string) {
    return code.includes('MTO:') || code.includes('PO:');
  }

  parseBarcodeData(code: string) {
    const parts = code.split('|');
    return parts.reduce((acc: any, part: string) => {
      const [key, value] = part.split(':');
      acc[key.toLowerCase()] = value;
      return acc;
    }, {});
  }

  async generateSpotBarcodeSheet(mtoId: string) {
    return Buffer.from('PDF content');
  }

  async getBarcodeStatistics(filters: any) {
    return { total: 0, scanned: 0, pending: 0 };
  }

  async deleteBarcode(id: string) {
    await this.supabase.from('barcodes').delete().eq('id', id);
    return true;
  }

  private async generateQRCode(data: string) {
    try {
      return await QRCode.toDataURL(data);
    } catch {
      return null;
    }
  }
}
