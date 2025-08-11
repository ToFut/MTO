import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, MessageCircle, Bell, Package, Truck, CheckCircle2, AlertTriangle, Eye, Paperclip, Edit, 
  Building2, FileText, Download, X, ChevronDown, ChevronRight, BarChart3, Clock, Play, Filter, 
  Calendar, TrendingUp, MapPin, Layers, Star, ShoppingBag, Palette, Box, Search, Users, Zap, 
  AlertCircle, Award, Target, Globe, Warehouse, Scan, PieChart, Activity, Maximize2, Minimize2,
  Diamond, Crown, Sparkles
} from 'lucide-react';

const DashboardComplete = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('brand');
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedPOs, setExpandedPOs] = useState(new Set());
  const [activeChatTab, setActiveChatTab] = useState('general');
  const [selectedPOs, setSelectedPOs] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  // Sample brand dashboard data
  const brandMetrics = {
    activePOs: 12,
    inProduction: 45,
    completed: 128,
    totalValue: 284500,
    avgLeadTime: 14,
    onTimeDelivery: 94
  };

  const brandPOs = [
    {
      id: 'PO-2024-001',
      customer: 'BaubleBar Inc.',
      products: 3,
      totalQuantity: 150,
      value: 7200,
      status: 'In Production',
      progress: 65,
      dueDate: '2024-02-15',
      priority: 'High',
      factory: 'Factory A',
      mtos: []
    },
    {
      id: 'PO-2024-002', 
      customer: 'Nordstrom',
      products: 5,
      totalQuantity: 200,
      value: 9600,
      status: 'Design Review',
      progress: 25,
      dueDate: '2024-02-28',
      priority: 'Medium',
      factory: 'Factory B',
      mtos: []
    },
    {
      id: 'PO-2024-003',
      customer: 'Anthropologie',
      products: 2,
      totalQuantity: 80,
      value: 3840,
      status: 'Completed',
      progress: 100,
      dueDate: '2024-02-05',
      priority: 'Low',
      factory: 'Factory A',
      mtos: []
    }
  ];

  // Factory metrics data
  const factoryMetrics = {
    totalCapacity: 5000,
    currentUtilization: 78,
    activeMachines: 24,
    totalMachines: 30,
    workersPresent: 145,
    totalWorkers: 160,
    defectRate: 2.3,
    efficiency: 91
  };

  const productionLines = [
    {
      id: 'LINE-A1',
      name: 'Bracelet Assembly Line A',
      status: 'Active',
      currentOrder: 'PO-2024-001',
      progress: 65,
      efficiency: 94,
      workersAssigned: 12,
      outputToday: 45,
      targetToday: 50
    },
    {
      id: 'LINE-B1',
      name: 'Necklace Production Line B',
      status: 'Active',
      currentOrder: 'PO-2024-002',
      progress: 40,
      efficiency: 88,
      workersAssigned: 15,
      outputToday: 38,
      targetToday: 45
    },
    {
      id: 'LINE-C1',
      name: 'Custom Engraving Station',
      status: 'Maintenance',
      currentOrder: '-',
      progress: 0,
      efficiency: 0,
      workersAssigned: 0,
      outputToday: 0,
      targetToday: 30
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in production': case 'active': return 'text-blue-600 bg-blue-100';
      case 'design review': case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'delayed': case 'maintenance': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Peak Order MTO</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setCurrentView('brand')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'brand'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Brand Dashboard
              </button>
              <button
                onClick={() => setCurrentView('factory')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'factory'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Factory Operations
              </button>
              <button
                onClick={() => setCurrentView('orders')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'orders'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'analytics'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                className="p-2 text-gray-400 hover:text-gray-500"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-6 w-6" />
              </button>
              <button 
                className="p-2 text-gray-400 hover:text-gray-500"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Brand Dashboard View */}
        {currentView === 'brand' && (
          <div className="px-4 py-6 sm:px-0">
            {/* 3D Customization Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Palette className="h-8 w-8 text-purple-200" />
                    Premium 3D Jewelry Studio
                  </h1>
                  <p className="text-purple-100 mt-2 text-lg">
                    Design and customize jewelry with real-time 3D preview and professional materials
                  </p>
                  <div className="flex gap-4 mt-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">Ultra HD Rendering</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">Real-time Materials</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">Professional Lighting</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Diamond className="h-6 w-6" />
                  Launch 3D Studio
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-green-600">+12%</span>
                </div>
                <p className="text-2xl font-bold mt-2">{brandMetrics.activePOs}</p>
                <p className="text-sm text-gray-600">Active POs</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="text-xs text-green-600">+8%</span>
                </div>
                <p className="text-2xl font-bold mt-2">{brandMetrics.inProduction}</p>
                <p className="text-sm text-gray-600">In Production</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-green-600">+25%</span>
                </div>
                <p className="text-2xl font-bold mt-2">{brandMetrics.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-green-600">+18%</span>
                </div>
                <p className="text-2xl font-bold mt-2">${brandMetrics.totalValue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Value</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-xs text-yellow-600">-2d</span>
                </div>
                <p className="text-2xl font-bold mt-2">{brandMetrics.avgLeadTime}d</p>
                <p className="text-sm text-gray-600">Avg Lead Time</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-green-600">+3%</span>
                </div>
                <p className="text-2xl font-bold mt-2">{brandMetrics.onTimeDelivery}%</p>
                <p className="text-sm text-gray-600">On-Time Delivery</p>
              </div>
            </div>

            {/* Active Purchase Orders */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Active Purchase Orders</h2>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                    New PO
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Export
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {brandPOs.map((po) => (
                  <div key={po.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{po.id}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(po.status)}`}>
                            {po.status}
                          </span>
                          {po.priority === 'High' && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                              High Priority
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{po.customer}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{po.products} products</span>
                          <span>{po.totalQuantity} units</span>
                          <span>${po.value.toLocaleString()}</span>
                          <span>Due: {po.dueDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{po.progress}%</p>
                          <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-full bg-purple-600 rounded-full"
                              style={{ width: `${po.progress}%` }}
                            />
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Factory Dashboard View */}
        {currentView === 'factory' && (
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Factory Operations Dashboard</h1>

            {/* Factory Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <Warehouse className="h-5 w-5 text-purple-600" />
                  <span className={`text-xs ${factoryMetrics.currentUtilization > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {factoryMetrics.currentUtilization}%
                  </span>
                </div>
                <p className="text-2xl font-bold mt-2">{factoryMetrics.totalCapacity}</p>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                  <div 
                    className={`h-full rounded-full ${factoryMetrics.currentUtilization > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${factoryMetrics.currentUtilization}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-green-600">Active</span>
                </div>
                <p className="text-2xl font-bold mt-2">{factoryMetrics.activeMachines}/{factoryMetrics.totalMachines}</p>
                <p className="text-sm text-gray-600">Machines Running</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-xs text-gray-600">{Math.round((factoryMetrics.workersPresent / factoryMetrics.totalWorkers) * 100)}%</span>
                </div>
                <p className="text-2xl font-bold mt-2">{factoryMetrics.workersPresent}/{factoryMetrics.totalWorkers}</p>
                <p className="text-sm text-gray-600">Workers Present</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className={`text-xs ${factoryMetrics.defectRate > 3 ? 'text-red-600' : 'text-green-600'}`}>
                    {factoryMetrics.defectRate > 3 ? '↑' : '↓'}
                  </span>
                </div>
                <p className="text-2xl font-bold mt-2">{factoryMetrics.defectRate}%</p>
                <p className="text-sm text-gray-600">Defect Rate</p>
              </div>
            </div>

            {/* Production Lines Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Production Lines Status</h2>
              <div className="space-y-4">
                {productionLines.map((line) => (
                  <div key={line.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{line.name}</h3>
                        <p className="text-sm text-gray-600">Line ID: {line.id}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(line.status)}`}>
                        {line.status}
                      </span>
                    </div>
                    
                    {line.status === 'Active' && (
                      <>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Current Order</p>
                            <p className="font-semibold">{line.currentOrder}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Progress</p>
                            <p className="font-semibold">{line.progress}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Efficiency</p>
                            <p className="font-semibold text-green-600">{line.efficiency}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Output Today</p>
                            <p className="font-semibold">{line.outputToday}/{line.targetToday}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{line.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${line.progress}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Alerts */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Real-time Alerts</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Line C1 - Maintenance Required</p>
                    <p className="text-sm text-red-700">Engraving station requires immediate maintenance. Production halted.</p>
                    <p className="text-xs text-red-600 mt-1">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Material Shortage Warning</p>
                    <p className="text-sm text-yellow-700">Gold plating solution running low. Reorder needed within 2 days.</p>
                    <p className="text-xs text-yellow-600 mt-1">15 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Production Milestone</p>
                    <p className="text-sm text-blue-700">Line A1 completed 50% of PO-2024-001 ahead of schedule.</p>
                    <p className="text-xs text-blue-600 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Orders View */}
        {currentView === 'orders' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">All Orders</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select 
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="production">In Production</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {brandPOs.map((po) => (
                      <tr key={po.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {po.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {po.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {po.products} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${po.value.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(po.status)}`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                              <div 
                                className="h-full bg-purple-600 rounded-full"
                                style={{ width: `${po.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">{po.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {po.dueDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-purple-600 hover:text-purple-900">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {currentView === 'analytics' && (
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Production Trends */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Production Trends</h2>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">Production chart visualization</p>
                </div>
              </div>

              {/* Order Volume */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Order Volume</h2>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">Order volume chart</p>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Quality Metrics</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">First Pass Yield</span>
                      <span className="text-sm text-gray-600">97.7%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '97.7%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <span className="text-sm text-gray-600">94.2%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '94.2%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">On-Time Delivery</span>
                      <span className="text-sm text-gray-600">91.5%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '91.5%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Top Products</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Custom Initial Bracelet</p>
                        <p className="text-sm text-gray-500">245 orders</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">$11,760</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <Diamond className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium">Beaded Charm Bracelet</p>
                        <p className="text-sm text-gray-500">189 orders</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">$12,852</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Crown className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Layered Initial Necklace</p>
                        <p className="text-sm text-gray-500">156 orders</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">$12,168</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat Widget */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-xl border flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Production Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm">Factory Manager: Line A is running ahead of schedule!</p>
                <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3 ml-auto max-w-xs">
                <p className="text-sm">Great news! Keep up the good work.</p>
                <p className="text-xs text-gray-500 mt-1">10:32 AM</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-xl border p-4">
          <h3 className="font-semibold mb-3">Notifications</h3>
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">New order received</p>
              <p className="text-xs text-gray-600">PO-2024-004 from Target</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium">Production completed</p>
              <p className="text-xs text-gray-600">PO-2024-003 ready for shipping</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardComplete;