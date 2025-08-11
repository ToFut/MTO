import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Package, Target, Filter, Calendar, Download, Eye, Star, Heart, Camera, Coffee, Sun, Crown, Gift, Hash, QrCode, Scan, FileText, MapPin, Activity } from 'lucide-react';

const AnalyticsDashboard = ({ mtoData = [] }) => {
  const [selectedAWB, setSelectedAWB] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'spots', 'awb-detail'
  const [timeRange, setTimeRange] = useState('30d');

  // Generate analytics data from MTOs
  const analyticsData = useMemo(() => {
    // Generate AWB numbers and analytics data
    const awbAnalytics = {};
    const spotStatistics = {};
    
    mtoData.forEach((mto, index) => {
      // Generate AWB number for each MTO
      const awbNumber = `AWB${String(1000000 + index).padStart(7, '0')}`;
      
      if (!awbAnalytics[awbNumber]) {
        awbAnalytics[awbNumber] = {
          awb: awbNumber,
          account: mto.customerName || `Account${index % 10 + 1}`,
          poNumber: mto.poNumber || `PO${String(1000 + index).padStart(4, '0')}`,
          referenceNumber: mto.referenceNumber || mto.lineId || `REF${String(index).padStart(4, '0')}`,
          pidNumber: mto.bagBasePID || `PID${String(133900 + index).padStart(6, '0')}`,
          totalQty: 0,
          completedQty: 0,
          pendingQty: 0,
          spots: {},
          mtos: [],
          description: mto.displayName || 'Custom Embroidered Product',
          value: 0
        };
      }
      
      const awb = awbAnalytics[awbNumber];
      awb.totalQty += mto.quantity || 1;
      awb.mtos.push(mto);
      awb.value += (mto.quantity || 1) * 45; // $45 average per piece
      
      if (mto.status === 'completed' || mto.status === 'shipped') {
        awb.completedQty += mto.quantity || 1;
      } else {
        awb.pendingQty += mto.quantity || 1;
      }
      
      // Analyze spots 1-6 for embroidery statistics
      for (let i = 1; i <= 6; i++) {
        const spotValue = mto[`spot${i}`];
        if (spotValue && spotValue !== '' && spotValue !== '—') {
          const spotSize = ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)];
          const spotKey = `Spot ${i}`;
          
          if (!awb.spots[spotKey]) {
            awb.spots[spotKey] = {
              spot: i,
              design: spotValue,
              size: spotSize,
              quantity: 0,
              amount: 0
            };
          }
          awb.spots[spotKey].quantity += mto.quantity || 1;
          awb.spots[spotKey].amount += (mto.quantity || 1) * (5 + (i * 2)); // Different pricing per spot
          
          // Global spot statistics
          if (!spotStatistics[spotKey]) {
            spotStatistics[spotKey] = {
              spot: i,
              totalQuantity: 0,
              totalAmount: 0,
              designs: {},
              sizes: { Small: 0, Medium: 0, Large: 0 }
            };
          }
          
          spotStatistics[spotKey].totalQuantity += mto.quantity || 1;
          spotStatistics[spotKey].totalAmount += (mto.quantity || 1) * (5 + (i * 2));
          spotStatistics[spotKey].sizes[spotSize] += mto.quantity || 1;
          
          if (!spotStatistics[spotKey].designs[spotValue]) {
            spotStatistics[spotKey].designs[spotValue] = 0;
          }
          spotStatistics[spotKey].designs[spotValue] += mto.quantity || 1;
        }
      }
    });
    
    return {
      awbs: Object.values(awbAnalytics),
      spots: spotStatistics,
      totalAWBs: Object.keys(awbAnalytics).length,
      totalValue: Object.values(awbAnalytics).reduce((sum, awb) => sum + awb.value, 0),
      totalQuantity: Object.values(awbAnalytics).reduce((sum, awb) => sum + awb.totalQty, 0)
    };
  }, [mtoData]);

  const getSpotIcon = (spotNumber) => {
    const icons = [Star, Heart, Camera, Coffee, Sun, Crown, Gift];
    const IconComponent = icons[(spotNumber - 1) % icons.length];
    return IconComponent;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Embroidery Analytics by AWB
            </h1>
            <p className="text-slate-600 mt-1">Detailed analysis per Air Waybill with spot-level breakdowns</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="overview">Overview</option>
              <option value="spots">Spots Analysis</option>
              <option value="awb-detail">AWB Details</option>
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total AWBs</p>
                <p className="text-2xl font-bold text-blue-900">{analyticsData.totalAWBs}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Pieces</p>
                <p className="text-2xl font-bold text-green-900">{analyticsData.totalQuantity.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Value</p>
                <p className="text-2xl font-bold text-purple-900">${analyticsData.totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Active Spots</p>
                <p className="text-2xl font-bold text-amber-900">{Object.keys(analyticsData.spots).length}</p>
              </div>
              <Activity className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AWB Details View */}
      {viewMode === 'awb-detail' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-6">AWB Analysis Detail</h2>
          
          <div className="space-y-4">
            {analyticsData.awbs.map((awb) => (
              <div key={awb.awb} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-blue-600" />
                      <Hash className="h-5 w-5 text-green-600" />
                      <span className="font-bold text-lg">{awb.awb}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Account:</span> {awb.account}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedAWB(selectedAWB === awb.awb ? null : awb.awb)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {selectedAWB === awb.awb ? 'Hide' : 'View'} Details
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">PO#:</span>
                    <p className="text-slate-900">{awb.poNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Reference#:</span>
                    <p className="text-slate-900">{awb.referenceNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">PID#:</span>
                    <p className="text-slate-900">{awb.pidNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Quantity:</span>
                    <p className="text-slate-900 font-bold">{awb.totalQty} PCS</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Value:</span>
                    <p className="text-slate-900 font-bold">${awb.value.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="font-medium text-slate-700">Description:</span>
                  <p className="text-slate-900">{awb.description}</p>
                </div>

                {/* Spots Statistics for this AWB */}
                {selectedAWB === awb.awb && (
                  <div className="bg-slate-50 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold mb-3">Embroidery Spots Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.values(awb.spots).map((spot) => {
                        const IconComponent = getSpotIcon(spot.spot);
                        return (
                          <div key={spot.spot} className="bg-white p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <IconComponent className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-bold text-sm">Spot {spot.spot}</p>
                                <p className="text-xs text-slate-600">{spot.size}</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 mb-1">Design: {spot.design}</p>
                            <p className="text-xs text-slate-700">Qty: {spot.quantity} | ${spot.amount}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spots Analysis View */}
      {viewMode === 'spots' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Spots Statistics Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(analyticsData.spots).map(([spotKey, spotData]) => {
              const IconComponent = getSpotIcon(spotData.spot);
              return (
                <div key={spotKey} className="border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{spotKey}</h3>
                      <p className="text-sm text-slate-600">Embroidery Position</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Quantity:</span>
                      <span className="font-bold">{spotData.totalQuantity} PCS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Amount:</span>
                      <span className="font-bold text-green-600">${spotData.totalAmount}</span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">By Size:</p>
                      <div className="space-y-1">
                        {Object.entries(spotData.sizes).map(([size, qty]) => (
                          <div key={size} className="flex justify-between text-sm">
                            <span>{size}:</span>
                            <span>{qty} PCS</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Top Designs:</p>
                      <div className="space-y-1">
                        {Object.entries(spotData.designs)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([design, qty]) => (
                          <div key={design} className="flex justify-between text-sm">
                            <span className="truncate">{design}:</span>
                            <span>{qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overview Charts */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AWB Volume Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-4">AWB Volume Distribution</h3>
            <div className="space-y-3">
              {analyticsData.awbs.slice(0, 10).map((awb, index) => (
                <div key={awb.awb} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{awb.awb}</p>
                      <p className="text-sm text-slate-600">{awb.account}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{awb.totalQty} PCS</p>
                    <p className="text-sm text-slate-600">${awb.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spots Performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Spots Performance</h3>
            <div className="space-y-4">
              {Object.entries(analyticsData.spots)
                .sort(([,a], [,b]) => b.totalAmount - a.totalAmount)
                .slice(0, 6)
                .map(([spotKey, spotData]) => {
                  const IconComponent = getSpotIcon(spotData.spot);
                  return (
                    <div key={spotKey} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{spotKey}</p>
                          <p className="text-sm text-slate-600">{spotData.totalQuantity} pieces</p>
                        </div>
                      </div>
                      <p className="font-bold text-green-600">${spotData.totalAmount}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;