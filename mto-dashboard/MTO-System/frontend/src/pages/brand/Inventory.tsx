import React, { useState } from 'react'
import { 
  Package, Warehouse, BarChart3, TrendingUp, AlertTriangle,
  Search, Filter, RefreshCw, Download, Eye, MessageCircle, QrCode,
  Truck, CheckCircle2, Clock, Hash
} from 'lucide-react'
// import InventoryCartonSplit from '../../components/InventoryCartonSplit'

interface InventoryStats {
  totalMTOs: number
  completedMTOs: number
  inProgressMTOs: number
  totalCartons: number
  readyToShip: number
  defectiveItems: number
}

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cartons' | 'tracking'>('overview')
  const [showChat, setShowChat] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Sample inventory data - would come from API in real implementation
  const inventoryStats: InventoryStats = {
    totalMTOs: 1247,
    completedMTOs: 823,
    inProgressMTOs: 424,
    totalCartons: 52,
    readyToShip: 18,
    defectiveItems: 12
  }

  const sampleMTOData = [
    {
      id: 'MTO-001',
      uniqueId: 'MTO-2025-01-0001',
      internalId: '37483586',
      lineId: '6',
      referenceNumber: 'md6a4z3j45we9',
      sku: 'SKU-1234',
      displayName: 'Custom Tote Bag - 14oz Natural Lined - Medium',
      productType: 'Initial Tote',
      bagBasePID: '133938',
      quantity: 1,
      status: 'QC',
      orderDate: '2025-01-15T10:00:00Z',
      expectedShipDate: '2025-07-24',
      actualShipDate: null,
      customer: 'Sarah Johnson',
      customizations: {
        spot1: '129559',
        spot2: '137234',
        spot3: '128687',
        spot4: '128698',
        spot5: '128954',
        spot6: ''
      },
      patchRefs: {
        spot1: '63 - Camera Icon',
        spot2: '171 - Music Notes Icon',
        spot3: '17 - Spicy Margarita Icon',
        spot4: '30 - Airplane Icon',
        spot5: '38 - H - Classic Letter',
        spot6: ''
      },
      masterCarton: 'MC-001',
      xfDate: '01/07/2025',
      trackingNumber: '',
      awb: '',
      qcStatus: 'pending',
      defectTag: null
    }
    // More MTOs would be added here...
  ]

  const recentActivity = [
    { id: 1, type: 'status_change', message: 'MTO-001 moved to QC stage', time: '2 hours ago', mto: 'MTO-001' },
    { id: 2, type: 'carton_packed', message: 'Carton MC-002 packed with 24 items', time: '4 hours ago', carton: 'MC-002' },
    { id: 3, type: 'defect_found', message: 'Defect reported for MTO-045 - material issue', time: '6 hours ago', mto: 'MTO-045' },
    { id: 4, type: 'shipped', message: 'Carton MC-001 shipped - Tracking: 1Z123456', time: '1 day ago', carton: 'MC-001' }
  ]

  const cartonSummary = [
    { id: 'MC-001', status: 'Shipped', items: 24, completedItems: 24, progress: 100, shipDate: '2025-01-18', tracking: '1Z123456789' },
    { id: 'MC-002', status: 'Ready to Ship', items: 24, completedItems: 24, progress: 100, shipDate: '2025-01-20', tracking: '' },
    { id: 'MC-003', status: 'In Progress', items: 24, completedItems: 18, progress: 75, shipDate: '2025-01-22', tracking: '' },
    { id: 'MC-004', status: 'In Progress', items: 24, completedItems: 12, progress: 50, shipDate: '2025-01-24', tracking: '' }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped': return 'bg-green-100 text-green-800'
      case 'ready to ship': return 'bg-blue-100 text-blue-800'
      case 'in progress': return 'bg-yellow-100 text-yellow-800'
      case 'qc': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <RefreshCw size={16} className="text-blue-600" />
      case 'carton_packed': return <Package size={16} className="text-green-600" />
      case 'defect_found': return <AlertTriangle size={16} className="text-red-600" />
      case 'shipped': return <Truck size={16} className="text-purple-600" />
      default: return <Clock size={16} className="text-gray-600" />
    }
  }

  const handleChatClick = (mto?: any) => {
    setShowChat(true)
    console.log('Opening chat for:', mto)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Monitor and track all inventory items and cartons</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download size={16} />
            Export Report
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total MTOs</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalMTOs.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Hash className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{inventoryStats.completedMTOs.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{inventoryStats.inProgressMTOs.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cartons</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalCartons}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready to Ship</p>
              <p className="text-2xl font-bold text-blue-600">{inventoryStats.readyToShip}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Defective Items</p>
              <p className="text-2xl font-bold text-red-600">{inventoryStats.defectiveItems}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'cartons', label: 'Carton Management', icon: Package },
              { id: 'tracking', label: 'Item Tracking', icon: Search }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carton Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Carton Summary</h3>
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carton ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ship Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cartonSummary.map((carton) => (
                        <tr key={carton.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {carton.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(carton.status)}`}>
                              {carton.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {carton.completedItems}/{carton.items}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full" 
                                  style={{ width: `${carton.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{carton.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {carton.shipDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {carton.tracking || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button className="text-indigo-600 hover:text-indigo-900">
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleChatClick()}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                <MessageCircle size={16} />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <QrCode size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cartons' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Carton Management</h3>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-gray-600">Carton management interface will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search by MTO ID, customer name, or reference..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter size={16} />
                  Filters
                </button>
              </div>

              {/* Item Tracking Table */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MTO ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carton</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Ship</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleMTOData.map((mto) => (
                      <tr key={mto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {mto.uniqueId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{mto.displayName}</div>
                            <div className="text-sm text-gray-500">{mto.productType}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mto.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mto.status)}`}>
                            {mto.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mto.masterCarton || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mto.expectedShipDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleChatClick(mto)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <MessageCircle size={16} />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <QrCode size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Inventory
