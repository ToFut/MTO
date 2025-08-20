import React, { useState, useMemo } from 'react';
import { Package, AlertTriangle, TrendingDown, BarChart3, AlertCircle, RefreshCw, Calendar, Eye, Download, Filter, CheckCircle2 } from 'lucide-react';

const InventoryGapTracking = ({ mtoData = [] }) => {
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  // Generate inventory gap data
  const inventoryGaps = useMemo(() => {
    const materials = {
      'Canvas Natural': {
        id: 'MAT001',
        category: 'Base Material',
        currentStock: 450,
        requiredStock: 800,
        gap: 350,
        unit: 'yards',
        leadTime: '7 days',
        supplier: 'Textile Corp',
        affectedMTOs: []
      },
      'Thread Black': {
        id: 'MAT002',
        category: 'Thread',
        currentStock: 200,
        requiredStock: 250,
        gap: 50,
        unit: 'spools',
        leadTime: '3 days',
        supplier: 'Thread Masters',
        affectedMTOs: []
      },
      'Hardware Silver': {
        id: 'MAT003',
        category: 'Hardware',
        currentStock: 1200,
        requiredStock: 2000,
        gap: 800,
        unit: 'pieces',
        leadTime: '14 days',
        supplier: 'Metal Works Inc',
        affectedMTOs: []
      },
      'Backing Fabric': {
        id: 'MAT004',
        category: 'Support Material',
        currentStock: 300,
        requiredStock: 400,
        gap: 100,
        unit: 'yards',
        leadTime: '5 days',
        supplier: 'Fabric Plus',
        affectedMTOs: []
      },
      'Zipper YKK #5': {
        id: 'MAT005',
        category: 'Hardware',
        currentStock: 50,
        requiredStock: 300,
        gap: 250,
        unit: 'pieces',
        leadTime: '10 days',
        supplier: 'YKK Direct',
        affectedMTOs: []
      },
      'Label - Woven': {
        id: 'MAT006',
        category: 'Branding',
        currentStock: 5000,
        requiredStock: 5500,
        gap: 500,
        unit: 'pieces',
        leadTime: '21 days',
        supplier: 'Label Pro',
        affectedMTOs: []
      }
    };

    // Link affected MTOs
    mtoData.forEach((mto) => {
      if (mto.materials) {
        mto.materials.forEach(material => {
          if (materials[material] && materials[material].gap > 0) {
            materials[material].affectedMTOs.push({
              id: mto.id,
              priority: mto.priority,
              dueDate: mto.dueTime,
              quantity: mto.quantity || 1
            });
          }
        });
      }
    });

    // Calculate gap severity
    Object.values(materials).forEach(material => {
      const gapPercentage = (material.gap / material.requiredStock) * 100;
      material.severity = gapPercentage > 50 ? 'critical' : 
                         gapPercentage > 25 ? 'high' : 
                         gapPercentage > 10 ? 'medium' : 'low';
      material.gapPercentage = gapPercentage;
      
      // Projected stockout date
      const dailyUsage = material.requiredStock / 30; // Assuming 30-day requirement
      const daysToStockout = Math.floor(material.currentStock / dailyUsage);
      const stockoutDate = new Date();
      stockoutDate.setDate(stockoutDate.getDate() + daysToStockout);
      material.stockoutDate = stockoutDate;
      material.daysToStockout = daysToStockout;
    });

    return materials;
  }, [mtoData]);

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        dot: 'bg-red-500',
        icon: AlertTriangle,
        bgColor: 'bg-red-50'
      },
      high: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        dot: 'bg-orange-500',
        icon: AlertCircle,
        bgColor: 'bg-orange-50'
      },
      medium: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        dot: 'bg-yellow-500',
        icon: TrendingDown,
        bgColor: 'bg-yellow-50'
      },
      low: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        dot: 'bg-green-500',
        icon: CheckCircle2,
        bgColor: 'bg-green-50'
      }
    };
    return configs[severity] || configs.medium;
  };

  const filteredGaps = Object.entries(inventoryGaps).filter(([name, material]) => 
    filterLevel === 'all' || material.severity === filterLevel
  );

  const totalGapValue = Object.values(inventoryGaps).reduce((sum, mat) => sum + (mat.gap * 25), 0); // Estimated $25 per unit

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-orange-600" />
              Inventory Gap Tracking
            </h1>
            <p className="text-slate-600 mt-1">Real-time material shortage analysis and impact assessment</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <button className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Update Stock
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Critical Gaps</p>
                <p className="text-2xl font-bold text-red-900">
                  {Object.values(inventoryGaps).filter(m => m.severity === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Total Gap Value</p>
                <p className="text-2xl font-bold text-orange-900">${totalGapValue.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Affected MTOs</p>
                <p className="text-2xl font-bold text-blue-900">
                  {Object.values(inventoryGaps).reduce((sum, m) => sum + m.affectedMTOs.length, 0)}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Lead Time</p>
                <p className="text-2xl font-bold text-purple-900">9.5 days</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Gaps List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold">Material Inventory Gaps</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {filteredGaps.map(([materialName, material]) => {
            const severityConfig = getSeverityConfig(material.severity);
            const SeverityIcon = severityConfig.icon;
            
            return (
              <div key={material.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Material Info */}
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${severityConfig.dot}`}></div>
                      <div>
                        <p className="font-bold text-slate-900">{materialName}</p>
                        <p className="text-sm text-slate-600">{material.id} • {material.category}</p>
                      </div>
                    </div>

                    {/* Severity Badge */}
                    <div className={`px-3 py-1 rounded-lg border ${severityConfig.color} flex items-center gap-2`}>
                      <SeverityIcon className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">{material.severity}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedMaterial(selectedMaterial === material.id ? null : material.id)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {selectedMaterial === material.id ? 'Hide' : 'View'} Details
                    </button>
                  </div>
                </div>

                {/* Stock Levels */}
                <div className="grid grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-600">Current Stock</p>
                    <p className="font-bold">{material.currentStock} {material.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Required</p>
                    <p className="font-bold">{material.requiredStock} {material.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Gap</p>
                    <p className="font-bold text-red-600">-{material.gap} {material.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Days to Stockout</p>
                    <p className={`font-bold ${material.daysToStockout < 7 ? 'text-red-600' : 'text-slate-900'}`}>
                      {material.daysToStockout} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Lead Time</p>
                    <p className="font-bold">{material.leadTime}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Stock Level</span>
                    <span className="font-medium">{Math.round((material.currentStock / material.requiredStock) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        material.severity === 'critical' ? 'bg-red-500' :
                        material.severity === 'high' ? 'bg-orange-500' :
                        material.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (material.currentStock / material.requiredStock) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedMaterial === material.id && (
                  <div className={`mt-4 rounded-lg p-4 ${severityConfig.bgColor}`}>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Supplier Information</h4>
                        <p className="text-sm">Supplier: {material.supplier}</p>
                        <p className="text-sm">Lead Time: {material.leadTime}</p>
                        <p className="text-sm">Stockout Date: {material.stockoutDate.toLocaleDateString()}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Affected MTOs ({material.affectedMTOs.length})</h4>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {material.affectedMTOs.slice(0, 5).map((mto, idx) => (
                            <div key={idx} className="text-sm flex justify-between">
                              <span>{mto.id}</span>
                              <span className={`font-medium ${mto.priority === 'urgent' ? 'text-red-600' : ''}`}>
                                {mto.priority}
                              </span>
                            </div>
                          ))}
                          {material.affectedMTOs.length > 5 && (
                            <p className="text-sm text-slate-600">+{material.affectedMTOs.length - 5} more</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InventoryGapTracking;