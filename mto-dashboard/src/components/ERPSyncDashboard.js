import React, { useState, useEffect, useMemo } from 'react';
import { ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, Clock, Database, Factory, Building2, TrendingUp, BarChart3, Wifi, WifiOff, Zap, ArrowUpDown, Send, Download, AlertCircle, Eye } from 'lucide-react';

const ERPSyncDashboard = () => {
  const [syncStatus, setSyncStatus] = useState('connected');
  const [lastSync, setLastSync] = useState(new Date());
  const [selectedSystem, setSelectedSystem] = useState('netsuite');
  const [viewDetails, setViewDetails] = useState(null);

  // Simulate real-time sync status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date());
      // Occasionally simulate connection issues
      if (Math.random() > 0.95) {
        setSyncStatus(Math.random() > 0.5 ? 'warning' : 'connected');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const erpSystems = useMemo(() => ({
    netsuite: {
      name: 'NetSuite ERP',
      icon: Database,
      status: syncStatus,
      lastSync: lastSync,
      version: 'v2024.1',
      endpoint: 'https://api.netsuite.com/v1/',
      connections: {
        factory: {
          status: 'connected',
          lastSync: new Date(Date.now() - 30000),
          dataTypes: ['MTOs', 'Production Orders', 'Inventory', 'Quality Reports'],
          throughput: '1,247 records/hour',
          errorRate: '0.2%'
        },
        brand: {
          status: 'connected', 
          lastSync: new Date(Date.now() - 60000),
          dataTypes: ['Customer Orders', 'Product Catalog', 'Shipping', 'Returns'],
          throughput: '890 records/hour',
          errorRate: '0.1%'
        }
      },
      recentTransfers: [
        { id: 'T-001', type: 'MTO Creation', from: 'ERP', to: 'Factory', status: 'completed', timestamp: new Date(Date.now() - 300000), records: 47 },
        { id: 'T-002', type: 'Production Status', from: 'Factory', to: 'ERP', status: 'completed', timestamp: new Date(Date.now() - 600000), records: 152 },
        { id: 'T-003', type: 'Quality Reports', from: 'Factory', to: 'Brand', status: 'in_progress', timestamp: new Date(Date.now() - 120000), records: 23 },
        { id: 'T-004', type: 'Shipping Updates', from: 'Brand', to: 'ERP', status: 'completed', timestamp: new Date(Date.now() - 180000), records: 89 },
        { id: 'T-005', type: 'Inventory Sync', from: 'ERP', to: 'Factory', status: 'failed', timestamp: new Date(Date.now() - 240000), records: 0 }
      ],
      metrics: {
        totalTransfers: 1247,
        successRate: 98.5,
        avgResponseTime: '245ms',
        dailyVolume: 12420
      }
    },
    sap: {
      name: 'SAP Business One',
      icon: Building2,
      status: 'warning',
      lastSync: new Date(Date.now() - 900000),
      version: 'v10.0',
      endpoint: 'https://api.sap.com/v2/',
      connections: {
        factory: {
          status: 'warning',
          lastSync: new Date(Date.now() - 900000),
          dataTypes: ['Materials', 'Work Orders', 'Labor Tracking'],
          throughput: '420 records/hour',
          errorRate: '2.1%'
        },
        brand: {
          status: 'disconnected',
          lastSync: new Date(Date.now() - 3600000),
          dataTypes: ['Financial Data', 'Cost Analysis'],
          throughput: '0 records/hour',
          errorRate: '100%'
        }
      },
      recentTransfers: [
        { id: 'S-001', type: 'Material Costs', from: 'ERP', to: 'Factory', status: 'warning', timestamp: new Date(Date.now() - 900000), records: 15 },
        { id: 'S-002', type: 'Labor Data', from: 'Factory', to: 'ERP', status: 'failed', timestamp: new Date(Date.now() - 1800000), records: 0 }
      ],
      metrics: {
        totalTransfers: 234,
        successRate: 76.3,
        avgResponseTime: '890ms',
        dailyVolume: 2340
      }
    }
  }), [syncStatus, lastSync]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <Wifi className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'disconnected': return <WifiOff className="h-5 w-5 text-red-600" />;
      case 'in_progress': return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      connected: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      disconnected: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const currentSystem = erpSystems[selectedSystem];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              ERP Sync Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Real-time synchronization between Factory, Brand, and ERP systems</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="netsuite">NetSuite ERP</option>
              <option value="sap">SAP Business One</option>
            </select>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Force Sync
            </button>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Active Connections</p>
                <p className="text-2xl font-bold text-blue-900">
                  {Object.values(erpSystems).reduce((acc, sys) => 
                    acc + Object.values(sys.connections).filter(conn => conn.status === 'connected').length, 0
                  )}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-green-900">{currentSystem.metrics.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Daily Volume</p>
                <p className="text-2xl font-bold text-purple-900">
                  {currentSystem.metrics.dailyVolume.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Avg Response</p>
                <p className="text-2xl font-bold text-amber-900">{currentSystem.metrics.avgResponseTime}</p>
              </div>
              <Zap className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Connections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factory Connection */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Factory className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Factory Connection</h3>
                <p className="text-sm text-slate-600">Production system integration</p>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${getStatusColor(currentSystem.connections.factory.status)}`}>
              {getStatusIcon(currentSystem.connections.factory.status)}
              <span className="text-sm font-medium capitalize">{currentSystem.connections.factory.status}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Last Sync:</span>
              <span className="text-sm font-medium">
                {currentSystem.connections.factory.lastSync.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Throughput:</span>
              <span className="text-sm font-medium">{currentSystem.connections.factory.throughput}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Error Rate:</span>
              <span className="text-sm font-medium text-green-600">{currentSystem.connections.factory.errorRate}</span>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Data Types:</p>
              <div className="flex flex-wrap gap-2">
                {currentSystem.connections.factory.dataTypes.map((type, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-100 rounded text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Brand Connection */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Brand Connection</h3>
                <p className="text-sm text-slate-600">Customer-facing system integration</p>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${getStatusColor(currentSystem.connections.brand.status)}`}>
              {getStatusIcon(currentSystem.connections.brand.status)}
              <span className="text-sm font-medium capitalize">{currentSystem.connections.brand.status}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Last Sync:</span>
              <span className="text-sm font-medium">
                {currentSystem.connections.brand.lastSync.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Throughput:</span>
              <span className="text-sm font-medium">{currentSystem.connections.brand.throughput}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Error Rate:</span>
              <span className="text-sm font-medium text-green-600">{currentSystem.connections.brand.errorRate}</span>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Data Types:</p>
              <div className="flex flex-wrap gap-2">
                {currentSystem.connections.brand.dataTypes.map((type, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-100 rounded text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Transfer Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Data Transfers</h2>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Log
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {currentSystem.recentTransfers.map((transfer) => (
            <div key={transfer.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-semibold">{transfer.type}</p>
                      <p className="text-sm text-slate-600">
                        {transfer.from} → {transfer.to}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-lg border ${getStatusColor(transfer.status)}`}>
                    <span className="text-sm font-medium capitalize">{transfer.status}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">{transfer.records} records</p>
                  <p className="text-sm text-slate-600">
                    {transfer.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-6">System Configuration</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Connection Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">System:</span>
                <span className="font-medium">{currentSystem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Version:</span>
                <span className="font-medium">{currentSystem.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Endpoint:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                    {currentSystem.endpoint}
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Performance Metrics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Transfers:</span>
                <span className="font-medium">{currentSystem.metrics.totalTransfers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Success Rate:</span>
                <span className="font-medium text-green-600">{currentSystem.metrics.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Avg Response:</span>
                <span className="font-medium">{currentSystem.metrics.avgResponseTime}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Data Flow Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">ERP → Factory: Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Factory → ERP: Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  currentSystem.connections.brand.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm">Brand ↔ ERP: {currentSystem.connections.brand.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERPSyncDashboard;