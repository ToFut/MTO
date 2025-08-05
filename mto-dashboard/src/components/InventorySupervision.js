import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, MessageCircle, TrendingUp, TrendingDown, Activity, Eye, Send, AlertCircle, Info, Package, Truck, BarChart3, RefreshCw, X } from 'lucide-react';

const InventorySupervision = ({ inventoryData = [] }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [messageToFactory, setMessageToFactory] = useState('');
  const [alertFilter, setAlertFilter] = useState('all'); // all, critical, warning, info

  // Generate alerts based on inventory status
  const generateAlerts = () => {
    const alerts = [];
    
    inventoryData.forEach((item) => {
      const available = item.inStock - item.allocated;
      const shortage = item.needed - available;
      const stockPercentage = (available / item.reorderPoint) * 100;
      
      if (item.status === 'short') {
        alerts.push({
          id: `alert-${item.sku}`,
          type: 'critical',
          material: item.material,
          sku: item.sku,
          message: `Critical shortage: Only ${item.inStock} units remaining, need ${item.needed} units`,
          shortage: shortage,
          impact: `Will affect ${item.usedBy.length} production orders`,
          suggestedAction: `Order ${Math.max(item.minOrder, shortage + item.reorderPoint)} units immediately`,
          supplier: item.supplier,
          leadTime: item.leadTime,
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          affectedPOs: item.usedBy
        });
      } else if (item.status === 'low') {
        alerts.push({
          id: `alert-${item.sku}`,
          type: 'warning',
          material: item.material,
          sku: item.sku,
          message: `Low stock warning: ${stockPercentage.toFixed(0)}% of reorder point`,
          available: available,
          reorderPoint: item.reorderPoint,
          suggestedAction: `Plan to reorder within ${Math.floor(available / (item.needed / 30))} days`,
          supplier: item.supplier,
          leadTime: item.leadTime,
          timestamp: new Date(Date.now() - Math.random() * 172800000).toISOString()
        });
      }
      
      // Add supply chain alerts
      if (item.leadTime > 14) {
        alerts.push({
          id: `lead-${item.sku}`,
          type: 'info',
          material: item.material,
          sku: item.sku,
          message: `Long lead time: ${item.leadTime} days from ${item.supplier}`,
          suggestedAction: 'Consider maintaining higher safety stock',
          timestamp: new Date(Date.now() - Math.random() * 259200000).toISOString()
        });
      }
    });
    
    return alerts.sort((a, b) => {
      const priority = { critical: 0, warning: 1, info: 2 };
      return priority[a.type] - priority[b.type];
    });
  };

  const alerts = generateAlerts();
  const filteredAlerts = alertFilter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === alertFilter);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      default: return null;
    }
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const handleSendMessage = (alert) => {
    // In real implementation, this would send a message to the factory
    console.log('Sending message to factory:', {
      alert,
      message: messageToFactory,
      timestamp: new Date().toISOString()
    });
    setMessageToFactory('');
    setSelectedAlert(null);
  };

  return (
    <div className="space-y-6">
      {/* Main Dashboard */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventory Supervision Center</h2>
            <p className="text-gray-600 mt-1">Real-time monitoring of factory inventory levels and automated alerts</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </button>
            <div className="bg-white px-4 py-2 rounded-lg border border-green-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">System Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className={`rounded-lg p-4 ${alerts.filter(a => a.type === 'critical').length > 0 ? 'bg-red-100 border border-red-300' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-700 mt-1">
                  {alerts.filter(a => a.type === 'critical').length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Immediate action required</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${alerts.filter(a => a.type === 'critical').length > 0 ? 'text-red-600' : 'text-gray-300'}`} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Warnings</p>
                <p className="text-3xl font-bold text-yellow-700 mt-1">
                  {alerts.filter(a => a.type === 'warning').length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Monitor closely</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Materials Tracked</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{inventoryData.length}</p>
                <p className="text-xs text-gray-600 mt-1">Across all categories</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Health Score</p>
                <p className="text-3xl font-bold text-green-700 mt-1">
                  {Math.round((inventoryData.filter(i => i.status === 'ok').length / inventoryData.length) * 100)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">Inventory health</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter Alerts:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setAlertFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  alertFilter === 'all' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setAlertFilter('critical')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  alertFilter === 'critical' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Critical ({alerts.filter(a => a.type === 'critical').length})
              </button>
              <button
                onClick={() => setAlertFilter('warning')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  alertFilter === 'warning' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Warnings ({alerts.filter(a => a.type === 'warning').length})
              </button>
              <button
                onClick={() => setAlertFilter('info')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  alertFilter === 'info' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Info ({alerts.filter(a => a.type === 'info').length})
              </button>
            </div>
          </div>
          
          {alerts.filter(a => a.type === 'critical').length > 0 && (
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4" />
              Contact Factory About Critical Issues
            </button>
          )}
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-4 ${getAlertStyle(alert.type)} hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => setSelectedAlert(alert)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-900">{alert.material}</h4>
                    <span className="text-sm text-gray-500">SKU: {alert.sku}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                  
                  {alert.type === 'critical' && (
                    <div className="bg-white bg-opacity-60 rounded p-2 mb-2">
                      <p className="text-sm font-medium text-red-700">{alert.impact}</p>
                      <p className="text-xs text-gray-600 mt-1">Affected POs: {alert.affectedPOs?.join(', ')}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-600">Supplier: <strong>{alert.supplier}</strong></span>
                    <span className="text-gray-600">Lead time: <strong>{alert.leadTime} days</strong></span>
                    <span className="font-medium text-blue-600">{alert.suggestedAction}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAlert(alert);
                  }}
                  className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAlert(alert);
                  }}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Alerts State */}
      {filteredAlerts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">No {alertFilter === 'all' ? '' : alertFilter} alerts at this time. Inventory levels are healthy.</p>
        </div>
      )}

      {/* Material Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Status Overview</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Stock Level Indicators</h4>
            <div className="space-y-2">
              {inventoryData.slice(0, 10).map((item) => {
                const percentage = ((item.inStock - item.allocated) / item.reorderPoint) * 100;
                const barColor = item.status === 'short' ? 'bg-red-500' : 
                               item.status === 'low' ? 'bg-yellow-500' : 'bg-green-500';
                
                return (
                  <div key={item.sku} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-700 truncate">{item.material}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                      <div 
                        className={`${barColor} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      />
                    </div>
                    <div className="w-12 text-xs text-gray-600 text-right">
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Inventory Trends</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Stock Replenished</span>
                </div>
                <span className="text-sm text-green-600">12 materials today</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">High Consumption</span>
                </div>
                <span className="text-sm text-yellow-600">5 materials this week</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">In Transit</span>
                </div>
                <span className="text-sm text-blue-600">8 orders arriving soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Factory Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Alert Details & Factory Communication</h2>
                  <p className="text-blue-100 mt-1">{selectedAlert.material} - {selectedAlert.sku}</p>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className={`rounded-lg p-4 mb-4 ${getAlertStyle(selectedAlert.type)}`}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(selectedAlert.type)}
                  <div>
                    <p className="font-medium text-gray-900">{selectedAlert.message}</p>
                    {selectedAlert.impact && (
                      <p className="text-sm text-gray-700 mt-1">{selectedAlert.impact}</p>
                    )}
                    <p className="text-sm text-blue-600 font-medium mt-2">{selectedAlert.suggestedAction}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Supplier</p>
                  <p className="font-medium">{selectedAlert.supplier}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Lead Time</p>
                  <p className="font-medium">{selectedAlert.leadTime} days</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Send Message to Factory</h3>
                <textarea
                  value={messageToFactory}
                  onChange={(e) => setMessageToFactory(e.target.value)}
                  placeholder="Type your message to the factory regarding this alert..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendMessage(selectedAlert)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventorySupervision;