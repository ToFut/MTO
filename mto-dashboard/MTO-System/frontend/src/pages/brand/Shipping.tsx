import React, { useState } from 'react'
import { 
  Truck, Package, MapPin, Clock, CheckCircle2, AlertTriangle,
  Search, Filter, Eye, MessageCircle, Download, RefreshCw,
  Calendar, Hash, BarChart3, TrendingUp, Ship, Plane
} from 'lucide-react'
// import InventoryCartonSplit from '../../components/InventoryCartonSplit'

interface ShippingStats {
  totalShipments: number
  inTransit: number
  delivered: number
  pending: number
  avgDeliveryTime: string
  onTimeDelivery: number
}

interface Shipment {
  id: string
  po: string
  cartonId: string
  trackingNumber: string
  carrier: string
  status: string
  shipDate: string
  estimatedDelivery: string
  actualDelivery?: string
  destination: string
  weight: string
  items: number
  awb: string
}

const Shipping: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'tracking' | 'inventory'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)

  // Sample shipping data
  const shippingStats: ShippingStats = {
    totalShipments: 152,
    inTransit: 38,
    delivered: 98,
    pending: 16,
    avgDeliveryTime: '4.2 days',
    onTimeDelivery: 94.2
  }

  const shipments: Shipment[] = [
    {
      id: 'SH-001',
      po: 'PO123',
      cartonId: 'MC-001',
      trackingNumber: '1Z123456789',
      carrier: 'UPS',
      status: 'In Transit',
      shipDate: '2025-01-18',
      estimatedDelivery: '2025-01-22',
      destination: 'New York, NY',
      weight: '12.5 kg',
      items: 24,
      awb: 'AWB123456'
    },
    {
      id: 'SH-002',
      po: 'PO124',
      cartonId: 'MC-002',
      trackingNumber: '1Z987654321',
      carrier: 'FedEx',
      status: 'Delivered',
      shipDate: '2025-01-15',
      estimatedDelivery: '2025-01-19',
      actualDelivery: '2025-01-18',
      destination: 'Los Angeles, CA',
      weight: '11.8 kg',
      items: 24,
      awb: 'AWB789012'
    },
    {
      id: 'SH-003',
      po: 'PO125',
      cartonId: 'MC-003',
      trackingNumber: '1Z456789123',
      carrier: 'DHL',
      status: 'Pending',
      shipDate: '2025-01-20',
      estimatedDelivery: '2025-01-24',
      destination: 'Chicago, IL',
      weight: '13.2 kg',
      items: 24,
      awb: 'AWB345678'
    },
    {
      id: 'SH-004',
      po: 'PO126',
      cartonId: 'MC-004',
      trackingNumber: '1Z789123456',
      carrier: 'UPS',
      status: 'Out for Delivery',
      shipDate: '2025-01-17',
      estimatedDelivery: '2025-01-21',
      destination: 'Miami, FL',
      weight: '12.0 kg',
      items: 24,
      awb: 'AWB901234'
    }
  ]

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
      status: 'shipped',
      orderDate: '2025-01-15T10:00:00Z',
      expectedShipDate: '2025-07-24',
      actualShipDate: '2025-01-18',
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
      trackingNumber: '1Z123456789',
      awb: 'AWB123456',
      qcStatus: 'approved',
      defectTag: null
    }
  ]

  const recentShippingActivity = [
    { id: 1, type: 'shipped', message: 'Carton MC-001 shipped via UPS - Tracking: 1Z123456789', time: '2 hours ago', shipment: 'SH-001' },
    { id: 2, type: 'delivered', message: 'Shipment SH-002 delivered successfully to Los Angeles', time: '1 day ago', shipment: 'SH-002' },
    { id: 3, type: 'out_for_delivery', message: 'Shipment SH-004 out for delivery in Miami', time: '4 hours ago', shipment: 'SH-004' },
    { id: 4, type: 'delay', message: 'Shipment SH-003 delayed due to weather conditions', time: '6 hours ago', shipment: 'SH-003' }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'in transit': return 'bg-blue-100 text-blue-800'
      case 'out for delivery': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCarrierIcon = (carrier: string) => {
    switch (carrier.toLowerCase()) {
      case 'ups':
      case 'fedex':
        return Truck
      case 'dhl':
        return Plane
      default:
        return Ship
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shipped': return <Truck size={16} className="text-blue-600" />
      case 'delivered': return <CheckCircle2 size={16} className="text-green-600" />
      case 'out_for_delivery': return <MapPin size={16} className="text-purple-600" />
      case 'delay': return <AlertTriangle size={16} className="text-red-600" />
      default: return <Clock size={16} className="text-gray-600" />
    }
  }

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.po.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || shipment.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const handleChatClick = (shipment?: Shipment) => {
    console.log('Opening chat for shipment:', shipment?.id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Management</h1>
          <p className="text-gray-600">Track and manage all shipments and deliveries</p>
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
              <p className="text-sm font-medium text-gray-600">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{shippingStats.totalShipments}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-blue-600">{shippingStats.inTransit}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{shippingStats.delivered}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{shippingStats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{shippingStats.avgDeliveryTime}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
              <p className="text-2xl font-bold text-green-600">{shippingStats.onTimeDelivery}%</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
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
              { id: 'shipments', label: 'Shipments', icon: Truck },
              { id: 'tracking', label: 'Live Tracking', icon: MapPin },
              { id: 'inventory', label: 'Ready to Ship', icon: Package }
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Shipping Activity</h3>
                <div className="space-y-3">
                  {recentShippingActivity.map((activity) => (
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

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                  <h4 className="text-lg font-semibold mb-2">This Week</h4>
                  <p className="text-3xl font-bold">24</p>
                  <p className="text-blue-100">Shipments sent</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                  <h4 className="text-lg font-semibold mb-2">This Month</h4>
                  <p className="text-3xl font-bold">152</p>
                  <p className="text-green-100">Total delivered</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                  <h4 className="text-lg font-semibold mb-2">Performance</h4>
                  <p className="text-3xl font-bold">94.2%</p>
                  <p className="text-purple-100">On-time delivery</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search by tracking number, PO, or destination..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in transit">In Transit</option>
                  <option value="out for delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              {/* Shipments Table */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ship Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredShipments.map((shipment) => {
                      const CarrierIcon = getCarrierIcon(shipment.carrier)
                      return (
                        <tr key={shipment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{shipment.id}</div>
                              <div className="text-sm text-gray-500">{shipment.po} • {shipment.cartonId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {shipment.trackingNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <CarrierIcon size={16} className="text-gray-600" />
                              <span className="text-sm text-gray-900">{shipment.carrier}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                              {shipment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {shipment.destination}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {shipment.shipDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {shipment.actualDelivery || shipment.estimatedDelivery}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedShipment(shipment)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleChatClick(shipment)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                <MessageCircle size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Live Tracking Map</h3>
              <p className="text-gray-600">Real-time shipment tracking visualization would be displayed here</p>
              <div className="mt-8 bg-gray-100 rounded-lg p-8">
                <p className="text-sm text-gray-500">Integration with carrier APIs for live tracking updates</p>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Items Ready to Ship</h3>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-gray-600">Shipping inventory interface will be implemented here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Shipment Details - {selectedShipment.id}</h2>
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipment Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
                      <dd className="text-sm font-mono text-gray-900">{selectedShipment.trackingNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Carrier</dt>
                      <dd className="text-sm text-gray-900">{selectedShipment.carrier}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Weight</dt>
                      <dd className="text-sm text-gray-900">{selectedShipment.weight}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Items</dt>
                      <dd className="text-sm text-gray-900">{selectedShipment.items} items</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">AWB Number</dt>
                      <dd className="text-sm text-gray-900">{selectedShipment.awb}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedShipment.status)}`}>
                          {selectedShipment.status}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Destination</dt>
                      <dd className="text-sm text-gray-900">{selectedShipment.destination}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ship Date</dt>
                      <dd className="text-sm text-gray-900">{selectedShipment.shipDate}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estimated Delivery</dt>
                      <dd className="text-sm text-gray-900">{selectedShipment.estimatedDelivery}</dd>
                    </div>
                    {selectedShipment.actualDelivery && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Actual Delivery</dt>
                        <dd className="text-sm text-gray-900">{selectedShipment.actualDelivery}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipping
