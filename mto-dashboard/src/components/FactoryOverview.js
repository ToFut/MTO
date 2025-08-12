import React from 'react';
import { Play, CheckCircle2, Users, Factory, BarChart3, TrendingUp, Truck, Send, AlertTriangle, CheckSquare, Activity, Package2, Target, AlertOctagon, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FactoryOverview = ({ mtoData = [] }) => {
  const { t } = useLanguage();
  
  // Calculate metrics from MTO data
  const totalPOs = new Set(mtoData.map(m => m.originalMTO?.po || 'PO-' + Math.floor(m.id?.split('-')?.[1] / 1000 || 123))).size;
  const inProgressCount = mtoData.filter(m => m.status === 'in_progress').length;
  const qualityCheckCount = mtoData.filter(m => m.status === 'quality_check').length;
  const completedCount = mtoData.filter(m => m.status === 'completed').length;
  const criticalIssuesCount = mtoData.filter(m => m.alerts?.some(a => a.severity === 'critical')).length;
  
  const inventoryAlerts = mtoData.filter(m => m.alerts?.some(a => a.type === 'inventory')).length;
  const xfAlerts = mtoData.filter(m => m.alerts?.some(a => a.type === 'xf')).length;
  const productionAlerts = mtoData.filter(m => m.alerts?.some(a => a.type === 'production')).length;

  return (
    <div className="space-y-6">
      {/* Enhanced Factory Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('factory.title', 'Factory Production Control')}</h1>
            <p className="text-slate-600">{t('factory.subtitle', 'Real-time manufacturing dashboard with comprehensive metrics and alerts')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{t('factory.shiftInfo', 'Shift A - 8 operators')}</span>
            </div>
            <button className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              <RefreshCw className="h-5 w-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">{t('factory.liveStatus', 'Live Status')}</span>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Grid */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          {/* Production Overview */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{t('factory.totalPOs', 'Total POs')}</p>
                <p className="text-3xl font-bold">{totalPOs}</p>
                <p className="text-blue-200 text-sm">{t('factory.purchaseOrders', 'Purchase orders')}</p>
              </div>
              <Package2 className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">{t('factory.totalMTOs', 'Total MTOs')}</p>
                <p className="text-3xl font-bold">{mtoData.length}</p>
                <p className="text-purple-200 text-sm">{t('factory.manufacturingItems', 'Manufacturing items')}</p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">{t('factory.inProduction', 'In Production')}</p>
                <p className="text-3xl font-bold">{inProgressCount}</p>
                <p className="text-green-200 text-sm">{t('factory.activeWorkstations', 'Active workstations')}</p>
              </div>
              <Factory className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">{t('factory.qualityCheck', 'Quality Check')}</p>
                <p className="text-3xl font-bold">{qualityCheckCount}</p>
                <p className="text-amber-200 text-sm">{t('factory.awaitingQC', 'Awaiting QC')}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-amber-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">{t('factory.completed', 'Completed')}</p>
                <p className="text-3xl font-bold">{completedCount}</p>
                <p className="text-teal-200 text-sm">{t('factory.readyToShip', 'Ready to ship')}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-teal-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">{t('factory.criticalIssues', 'Critical Issues')}</p>
                <p className="text-3xl font-bold">{criticalIssuesCount}</p>
                <p className="text-red-200 text-sm">{t('factory.needAttention', 'Need attention')}</p>
              </div>
              <AlertOctagon className="h-8 w-8 text-red-200" />
            </div>
          </div>
        </div>

        {/* Production Efficiency Section */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{t('factory.productionEfficiency', 'Production Efficiency')}</h3>
              <Activity className="h-6 w-6 text-slate-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{t('factory.dailyTarget', 'Daily Target')}</span>
                <span className="font-bold text-slate-900">120 MTOs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{t('factory.currentRate', 'Current Rate')}</span>
                <span className="font-bold text-green-600">89%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">{t('factory.vsYesterday', '+5% vs yesterday')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{t('factory.stationUtilization', 'Station Utilization')}</h3>
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{t('factory.activeStations', 'Active Stations')}</span>
                <span className="font-bold text-slate-900">4/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{t('factory.avgUtilization', 'Avg Utilization')}</span>
                <span className="font-bold text-orange-600">82%</span>
              </div>
              <div className="space-y-2">
                {['Material Prep: 95%', 'Customization: 87%', 'QC: 75%', 'Packaging: 90%'].map((station, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{station.split(':')[0]}</span>
                    <span className="font-medium">{station.split(':')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{t('factory.alertSummary', 'Alert Summary')}</h3>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-3">
              {[
                { type: 'Inventory', count: inventoryAlerts, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                { type: 'XF Transfers', count: xfAlerts, color: 'text-blue-600', bg: 'bg-blue-100' },
                { type: 'Production', count: productionAlerts, color: 'text-red-600', bg: 'bg-red-100' }
              ].map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${alert.bg}`}></div>
                    <span className="text-sm text-slate-600">{alert.type}</span>
                  </div>
                  <span className={`font-bold ${alert.color}`}>{alert.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <h4 className="font-semibold text-slate-900">{t('factory.quickActions', 'Quick Actions:')}</h4>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Play className="h-4 w-4" />
              {t('factory.startNextBatch', 'Start Next Batch')}
            </button>
            <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
              <CheckSquare className="h-4 w-4" />
              {t('factory.qcReview', 'QC Review')}
            </button>
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <Truck className="h-4 w-4" />
              {t('factory.processXF', 'Process XF')}
            </button>
          </div>
          <div className="text-sm text-slate-600">
            {t('factory.nextShiftStarts', 'Next shift starts in')} <span className="font-semibold text-slate-900">2h 30m</span>
          </div>
        </div>
      </div>

      {/* Additional Factory Statistics */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('factory.todaysProduction', "Today's Production Summary")}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-slate-900">{t('factory.completedMTOs', 'Completed MTOs')}</span>
              </div>
              <span className="text-xl font-bold text-green-600">{completedCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-slate-900">{t('factory.inProgressMTOs', 'In Progress')}</span>
              </div>
              <span className="text-xl font-bold text-blue-600">{inProgressCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-slate-900">{t('factory.qualityReview', 'Quality Review')}</span>
              </div>
              <span className="text-xl font-bold text-amber-600">{qualityCheckCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('factory.resourceStatus', 'Resource Status')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-slate-900">{t('factory.activeOperators', 'Active Operators')}</span>
              </div>
              <span className="text-xl font-bold text-blue-600">8/10</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Factory className="h-5 w-5 text-green-600" />
                <span className="font-medium text-slate-900">{t('factory.stationsOnline', 'Stations Online')}</span>
              </div>
              <span className="text-xl font-bold text-green-600">4/5</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-slate-900">{t('factory.efficiencyRate', 'Efficiency Rate')}</span>
              </div>
              <span className="text-xl font-bold text-purple-600">89%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactoryOverview;