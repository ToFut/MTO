import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';
import * as XLSX from 'xlsx';

export class AnalyticsService {
  private supabase = getSupabase();

  async getDashboardOverview(filters: any) {
    try {
      const { brandId, factoryId, startDate, endDate } = filters;
      
      // Build base query
      let query = this.supabase.from('mtos').select('*', { count: 'exact' });
      
      if (brandId) query = query.eq('brand_id', brandId);
      if (factoryId) query = query.eq('factory_id', factoryId);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      // Get total MTOs
      const { count: totalMTOs } = await query;

      // Get completed MTOs
      const { count: completedMTOs } = await query.eq('status', 'completed');

      // Get pending MTOs
      const { count: pendingMTOs } = await query.eq('status', 'pending');

      // Get defect rate
      const { data: defects } = await this.supabase
        .from('defects')
        .select('*', { count: 'exact' })
        .eq('status', 'reported');
      
      const defectRate = totalMTOs ? ((defects?.length || 0) / totalMTOs) * 100 : 0;

      // Get on-time delivery rate
      const { data: deliveries } = await this.supabase
        .from('mtos')
        .select('expected_ship_date, actual_ship_date')
        .not('actual_ship_date', 'is', null);
      
      const onTimeCount = deliveries?.filter(d => 
        new Date(d.actual_ship_date) <= new Date(d.expected_ship_date)
      ).length || 0;
      
      const onTimeDelivery = deliveries?.length 
        ? (onTimeCount / deliveries.length) * 100 
        : 0;

      // Get inventory status
      const { data: inventory } = await this.supabase
        .from('inventory')
        .select('quantity_available, reorder_point');
      
      const inStock = inventory?.filter(i => i.quantity_available > i.reorder_point).length || 0;
      const shortage = inventory?.filter(i => i.quantity_available <= i.reorder_point).length || 0;

      return {
        totalMTOs: totalMTOs || 0,
        completedMTOs: completedMTOs || 0,
        pendingMTOs: pendingMTOs || 0,
        defectRate: Math.round(defectRate * 100) / 100,
        onTimeDelivery: Math.round(onTimeDelivery * 100) / 100,
        inventoryStatus: { inStock, shortage }
      };
    } catch (error) {
      logger.error('Dashboard overview error:', error);
      throw new AppError('Failed to fetch dashboard overview', 500);
    }
  }

  async getProductionAnalytics(filters: any) {
    try {
      const { brandId, factoryId, startDate, endDate, groupBy = 'daily' } = filters;
      
      let query = this.supabase
        .from('mtos')
        .select('created_at, production_stage, quantity, status');
      
      if (brandId) query = query.eq('brand_id', brandId);
      if (factoryId) query = query.eq('factory_id', factoryId);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data: mtos } = await query;

      // Group by date
      const grouped = mtos?.reduce((acc: any, mto) => {
        const date = new Date(mto.created_at);
        const key = groupBy === 'daily' 
          ? date.toISOString().split('T')[0]
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[key]) {
          acc[key] = {
            date: key,
            total: 0,
            completed: 0,
            pending: 0,
            production: 0
          };
        }
        
        acc[key].total += 1;
        acc[key].production += mto.quantity || 0;
        if (mto.status === 'completed') acc[key].completed += 1;
        if (mto.status === 'pending') acc[key].pending += 1;
        
        return acc;
      }, {});

      const analytics = Object.values(grouped || {});
      
      // Calculate efficiency
      const totalProduced = analytics.reduce((sum: number, day: any) => sum + day.completed, 0);
      const totalTarget = analytics.reduce((sum: number, day: any) => sum + day.total, 0);
      const efficiency = totalTarget > 0 ? (totalProduced / totalTarget) * 100 : 0;

      return {
        daily: groupBy === 'daily' ? analytics : [],
        monthly: groupBy === 'monthly' ? analytics : [],
        efficiency: Math.round(efficiency * 100) / 100
      };
    } catch (error) {
      logger.error('Production analytics error:', error);
      throw new AppError('Failed to fetch production analytics', 500);
    }
  }

  async getTopProducts(filters: any) {
    try {
      const { brandId, factoryId, limit = 10 } = filters;
      
      let query = this.supabase
        .from('mtos')
        .select('display_name, reference_number, quantity');
      
      if (brandId) query = query.eq('brand_id', brandId);
      if (factoryId) query = query.eq('factory_id', factoryId);

      const { data: mtos } = await query;

      // Aggregate by product
      const productMap = mtos?.reduce((acc: any, mto) => {
        const key = mto.display_name || mto.reference_number;
        if (!acc[key]) {
          acc[key] = {
            name: key,
            count: 0,
            totalQuantity: 0
          };
        }
        acc[key].count += 1;
        acc[key].totalQuantity += mto.quantity || 0;
        return acc;
      }, {});

      // Sort and limit
      const topProducts = Object.values(productMap || {})
        .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);

      return topProducts;
    } catch (error) {
      logger.error('Top products error:', error);
      throw new AppError('Failed to fetch top products', 500);
    }
  }

  async getDefectAnalytics(filters: any) {
    try {
      const { brandId, factoryId, startDate, endDate } = filters;
      
      let query = this.supabase
        .from('defects')
        .select('*');
      
      if (brandId) query = query.eq('brand_id', brandId);
      if (factoryId) query = query.eq('factory_id', factoryId);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data: defects } = await query;

      // Group by type
      const byType = defects?.reduce((acc: any, defect) => {
        const type = defect.defect_type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Group by stage
      const byStage = defects?.reduce((acc: any, defect) => {
        const stage = defect.production_stage || 'Unknown';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {});

      // Trend over time
      const trend = defects?.reduce((acc: any, defect) => {
        const date = new Date(defect.created_at).toISOString().split('T')[0];
        const existing = acc.find((t: any) => t.date === date);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, []);

      return {
        byType: byType || {},
        byStage: byStage || {},
        trend: trend || []
      };
    } catch (error) {
      logger.error('Defect analytics error:', error);
      throw new AppError('Failed to fetch defect analytics', 500);
    }
  }

  async getShippingAnalytics(filters: any) {
    try {
      const { brandId, factoryId } = filters;
      
      let query = this.supabase
        .from('mtos')
        .select('status, expected_ship_date, actual_ship_date');
      
      if (brandId) query = query.eq('brand_id', brandId);
      if (factoryId) query = query.eq('factory_id', factoryId);

      const { data: mtos } = await query;

      const now = new Date();
      let onTime = 0;
      let delayed = 0;
      let inTransit = 0;

      mtos?.forEach(mto => {
        if (mto.status === 'shipped' || mto.status === 'in_transit') {
          inTransit++;
        }
        if (mto.actual_ship_date) {
          const actual = new Date(mto.actual_ship_date);
          const expected = new Date(mto.expected_ship_date);
          if (actual <= expected) {
            onTime++;
          } else {
            delayed++;
          }
        }
      });

      return { onTime, delayed, inTransit };
    } catch (error) {
      logger.error('Shipping analytics error:', error);
      throw new AppError('Failed to fetch shipping analytics', 500);
    }
  }

  async getInventoryAnalytics(filters: any) {
    try {
      const { brandId, factoryId } = filters;
      
      let query = this.supabase
        .from('inventory')
        .select('*');
      
      if (brandId) query = query.eq('brand_id', brandId);
      if (factoryId) query = query.eq('factory_id', factoryId);

      const { data: inventory } = await query;

      // Group by category
      const byCategory = inventory?.reduce((acc: any, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = {
            count: 0,
            totalQuantity: 0,
            value: 0
          };
        }
        acc[category].count += 1;
        acc[category].totalQuantity += item.quantity_available || 0;
        acc[category].value += (item.quantity_available || 0) * (item.unit_price || 0);
        return acc;
      }, {});

      // Calculate turnover rate
      const totalValue = inventory?.reduce((sum, item) => 
        sum + (item.quantity_available || 0) * (item.unit_price || 0), 0
      ) || 0;
      
      // Identify shortages
      const shortage = inventory?.filter(item => 
        item.quantity_available <= item.reorder_point
      ).map(item => ({
        sku: item.sku_code,
        name: item.item_name,
        available: item.quantity_available,
        needed: item.reorder_point
      })) || [];

      return {
        byCategory: byCategory || {},
        turnover: totalValue,
        shortage
      };
    } catch (error) {
      logger.error('Inventory analytics error:', error);
      throw new AppError('Failed to fetch inventory analytics', 500);
    }
  }

  async getTimelineView(filters: any) {
    try {
      const { brandId, factoryId, startDate, endDate } = filters;
      
      let query = this.supabase
        .from('mtos')
        .select('id, display_name, created_at, production_stage, status, expected_ship_date')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (brandId) query = query.eq('brand_id', brandId);
      if (factoryId) query = query.eq('factory_id', factoryId);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data: timeline } = await query;

      return timeline?.map(item => ({
        id: item.id,
        title: item.display_name,
        date: item.created_at,
        stage: item.production_stage,
        status: item.status,
        dueDate: item.expected_ship_date,
        type: 'mto'
      })) || [];
    } catch (error) {
      logger.error('Timeline view error:', error);
      throw new AppError('Failed to fetch timeline view', 500);
    }
  }

  async getPerformanceMetrics(filters: any) {
    try {
      const overview = await this.getDashboardOverview(filters);
      const production = await this.getProductionAnalytics(filters);
      const shipping = await this.getShippingAnalytics(filters);

      // Calculate performance scores
      const efficiency = production.efficiency || 0;
      const quality = 100 - (overview.defectRate || 0);
      const speed = overview.onTimeDelivery || 0;

      return {
        efficiency: Math.round(efficiency * 100) / 100,
        quality: Math.round(quality * 100) / 100,
        speed: Math.round(speed * 100) / 100
      };
    } catch (error) {
      logger.error('Performance metrics error:', error);
      throw new AppError('Failed to fetch performance metrics', 500);
    }
  }

  async getEfficiencyReport(filters: any) {
    try {
      const { brandId, factoryId } = filters;
      
      // Get production stage distribution
      let query = this.supabase
        .from('mtos')
        .select('production_stage, status');
      
      if (brandId) query = query.eq('brand_id', brandId);
      if (factoryId) query = query.eq('factory_id', factoryId);

      const { data: mtos } = await query;

      // Calculate efficiency by stage
      const byStage = mtos?.reduce((acc: any, mto) => {
        const stage = mto.production_stage || 'unknown';
        if (!acc[stage]) {
          acc[stage] = {
            total: 0,
            completed: 0,
            efficiency: 0
          };
        }
        acc[stage].total += 1;
        if (mto.status === 'completed') {
          acc[stage].completed += 1;
        }
        return acc;
      }, {});

      // Calculate efficiency percentages
      Object.keys(byStage || {}).forEach(stage => {
        byStage[stage].efficiency = byStage[stage].total > 0
          ? Math.round((byStage[stage].completed / byStage[stage].total) * 100)
          : 0;
      });

      // Identify bottlenecks (stages with low efficiency)
      const bottlenecks = Object.entries(byStage || {})
        .filter(([_, data]: any) => data.efficiency < 70)
        .map(([stage, data]: any) => ({
          stage,
          efficiency: data.efficiency,
          pending: data.total - data.completed
        }));

      // Calculate overall efficiency
      const totalMTOs = mtos?.length || 0;
      const completedMTOs = mtos?.filter(m => m.status === 'completed').length || 0;
      const overall = totalMTOs > 0 ? (completedMTOs / totalMTOs) * 100 : 0;

      return {
        overall: Math.round(overall * 100) / 100,
        byStage: byStage || {},
        bottlenecks
      };
    } catch (error) {
      logger.error('Efficiency report error:', error);
      throw new AppError('Failed to fetch efficiency report', 500);
    }
  }

  async getQualityMetrics(filters: any) {
    try {
      const { brandId, factoryId, startDate, endDate } = filters;
      
      // Get MTO and defect data
      let mtoQuery = this.supabase
        .from('mtos')
        .select('*', { count: 'exact' });
      
      let defectQuery = this.supabase
        .from('defects')
        .select('*');
      
      if (brandId) {
        mtoQuery = mtoQuery.eq('brand_id', brandId);
        defectQuery = defectQuery.eq('brand_id', brandId);
      }
      if (factoryId) {
        mtoQuery = mtoQuery.eq('factory_id', factoryId);
        defectQuery = defectQuery.eq('factory_id', factoryId);
      }
      if (startDate) {
        mtoQuery = mtoQuery.gte('created_at', startDate);
        defectQuery = defectQuery.gte('created_at', startDate);
      }
      if (endDate) {
        mtoQuery = mtoQuery.lte('created_at', endDate);
        defectQuery = defectQuery.lte('created_at', endDate);
      }

      const { count: totalMTOs } = await mtoQuery;
      const { data: defects } = await defectQuery;

      // Calculate metrics
      const defectCount = defects?.length || 0;
      const defectRate = totalMTOs ? (defectCount / totalMTOs) * 100 : 0;
      
      // First pass yield (MTOs without defects)
      const mtosWithDefects = new Set(defects?.map(d => d.mto_id));
      const firstPassYield = totalMTOs 
        ? ((totalMTOs - mtosWithDefects.size) / totalMTOs) * 100 
        : 100;
      
      // Rework rate
      const reworkCount = defects?.filter(d => d.status === 'rework').length || 0;
      const rework = defectCount > 0 ? (reworkCount / defectCount) * 100 : 0;

      return {
        defectRate: Math.round(defectRate * 100) / 100,
        firstPassYield: Math.round(firstPassYield * 100) / 100,
        rework: Math.round(rework * 100) / 100
      };
    } catch (error) {
      logger.error('Quality metrics error:', error);
      throw new AppError('Failed to fetch quality metrics', 500);
    }
  }

  async getZipCodeAnalytics(filters: any) {
    try {
      const { brandId, factoryId } = filters;
      
      // This would need a zip_code field in shipments or mtos table
      // For now, returning mock structure
      logger.warn('Zip code analytics requires zip_code field in database');
      
      return {
        byZip: {},
        heatmap: []
      };
    } catch (error) {
      logger.error('Zip code analytics error:', error);
      throw new AppError('Failed to fetch zip code analytics', 500);
    }
  }

  async getTrendAnalysis(filters: any) {
    try {
      const { metric = 'production', period = 30, brandId, factoryId } = filters;
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      
      let query = this.supabase
        .from('mtos')
        .select('created_at, quantity, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (brandId) query = query.eq('brand_id', brandId);
      if (factoryId) query = query.eq('factory_id', factoryId);

      const { data: mtos } = await query;

      // Group by day
      const dailyData = mtos?.reduce((acc: any, mto) => {
        const date = new Date(mto.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, value: 0 };
        }
        
        if (metric === 'production') {
          acc[date].value += mto.quantity || 0;
        } else if (metric === 'orders') {
          acc[date].value += 1;
        }
        
        return acc;
      }, {});

      const trend = Object.values(dailyData || {}).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate change percentage
      const firstValue = trend[0]?.value || 0;
      const lastValue = trend[trend.length - 1]?.value || 0;
      const change = firstValue > 0 
        ? ((lastValue - firstValue) / firstValue) * 100 
        : 0;

      // Simple linear forecast (next 7 days)
      const forecast = [];
      if (trend.length > 1) {
        const avgDailyChange = (lastValue - firstValue) / trend.length;
        for (let i = 1; i <= 7; i++) {
          const forecastDate = new Date(endDate);
          forecastDate.setDate(forecastDate.getDate() + i);
          forecast.push({
            date: forecastDate.toISOString().split('T')[0],
            value: Math.max(0, lastValue + (avgDailyChange * i))
          });
        }
      }

      return {
        trend,
        forecast,
        change: Math.round(change * 100) / 100
      };
    } catch (error) {
      logger.error('Trend analysis error:', error);
      throw new AppError('Failed to fetch trend analysis', 500);
    }
  }

  async getForecast(filters: any) {
    try {
      const { metric = 'production', days = 30, confidence = 0.8 } = filters;
      
      // Get historical data for forecast
      const trendData = await this.getTrendAnalysis({
        ...filters,
        period: 90 // Use 90 days of history for forecast
      });

      // Simple moving average forecast
      const forecast = trendData.forecast.map((point: any) => ({
        ...point,
        confidence: confidence * 100,
        upperBound: point.value * (1 + (1 - confidence)),
        lowerBound: point.value * confidence
      }));

      return {
        forecast,
        confidence: confidence * 100
      };
    } catch (error) {
      logger.error('Forecast error:', error);
      throw new AppError('Failed to generate forecast', 500);
    }
  }

  async generateCustomReport(options: any) {
    try {
      const { metrics, format, filters } = options;
      
      const reportData: any = {};
      
      // Fetch requested metrics
      if (metrics.includes('overview')) {
        reportData.overview = await this.getDashboardOverview(filters);
      }
      if (metrics.includes('production')) {
        reportData.production = await this.getProductionAnalytics(filters);
      }
      if (metrics.includes('quality')) {
        reportData.quality = await this.getQualityMetrics(filters);
      }
      if (metrics.includes('efficiency')) {
        reportData.efficiency = await this.getEfficiencyReport(filters);
      }
      if (metrics.includes('inventory')) {
        reportData.inventory = await this.getInventoryAnalytics(filters);
      }
      
      if (format === 'excel') {
        const workbook = XLSX.utils.book_new();
        
        // Add sheets for each metric
        Object.keys(reportData).forEach(key => {
          const data = Array.isArray(reportData[key]) 
            ? reportData[key] 
            : [reportData[key]];
          const worksheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(workbook, worksheet, key);
        });
        
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      }
      
      return { data: reportData };
    } catch (error) {
      logger.error('Custom report generation error:', error);
      throw new AppError('Failed to generate custom report', 500);
    }
  }

  async saveReportTemplate(templateData: any) {
    try {
      const { name, description, metrics, filters, userId, companyId } = templateData;
      
      const { data, error } = await this.supabase
        .from('report_templates')
        .insert({
          name,
          description,
          metrics,
          filters,
          created_by: userId,
          company_id: companyId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Save report template error:', error);
      throw new AppError('Failed to save report template', 500);
    }
  }

  async getReportTemplates(companyId: string) {
    try {
      const { data, error } = await this.supabase
        .from('report_templates')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Get report templates error:', error);
      throw new AppError('Failed to fetch report templates', 500);
    }
  }

  async deleteReportTemplate(templateId: string, userId: string) {
    try {
      const { error } = await this.supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId)
        .eq('created_by', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Delete report template error:', error);
      throw new AppError('Failed to delete report template', 500);
    }
  }
}