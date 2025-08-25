import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';
import * as XLSX from 'xlsx';

export class DefectService {
  private supabase = getSupabase();

  async getDefects(filters: any) {
    try {
      let query = this.supabase.from('defects').select('*', { count: 'exact' });
      
      if (filters.mtoId) query = query.eq('mto_id', filters.mtoId);
      if (filters.status) query = query.eq('status', filters.status);
      
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
      const { data, error, count } = await query;
      
      if (error) throw new AppError(error.message, 400);
      return { data: data || [], total: count || 0 };
    } catch (error: any) {
      logger.error('Error fetching defects:', error);
      throw error;
    }
  }

  async getDefectById(id: string) {
    const { data } = await this.supabase.from('defects').select('*').eq('id', id).single();
    return data;
  }

  async reportDefect(defectData: any) {
    const { data: defect } = await this.supabase.from('defects').insert(defectData).select().single();
    
    if (defectData.create_replacement) {
      const replacement = await this.createReplacementMTO(defect.id, true, '', defectData.reported_by);
      return { defect, replacement };
    }
    
    return { defect };
  }

  async updateDefectStatus(id: string, status: string, notes: string, userId: string) {
    const { data } = await this.supabase.from('defects').update({ status, notes }).eq('id', id).select().single();
    return data;
  }

  async createReplacementMTO(defectId: string, isRush: boolean, notes: string, userId: string) {
    const { data: defect } = await this.supabase.from('defects').select('*, mto:mtos(*)').eq('id', defectId).single();
    
    if (!defect || !defect.mto) throw new AppError('Defect or MTO not found', 404);
    
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

  async updateDefect(id: string, updates: any) {
    const { data } = await this.supabase.from('defects').update(updates).eq('id', id).select().single();
    return data;
  }

  async deleteDefect(id: string) {
    await this.supabase.from('defects').delete().eq('id', id);
    return true;
  }

  async getDefectQueue(filters: any) {
    const { data } = await this.supabase.from('defects').select('*').eq('status', 'pending');
    return data || [];
  }

  async assignDefect(id: string, assignedTo: string, assignedBy: string) {
    const { data } = await this.supabase.from('defects').update({ assigned_to: assignedTo }).eq('id', id).select().single();
    return data;
  }

  async getDefectStatistics(filters: any) {
    return { total: 0, resolved: 0, pending: 0, byType: {} };
  }

  async getDefectTimeline(id: string) {
    return [];
  }

  async addQCPhotos(id: string, photos: string[]) {
    const { data } = await this.supabase.from('defects').update({ qc_photos: photos }).eq('id', id).select().single();
    return data;
  }

  async exportDefectsToExcel(filters: any) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Defects');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateAQLReport(filters: any) {
    return { passed: 0, failed: 0, defectRate: 0 };
  }
}
