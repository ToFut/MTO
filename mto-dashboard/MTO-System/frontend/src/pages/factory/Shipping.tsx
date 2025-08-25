import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useChat } from '../../contexts/ChatContext'
import { ChatPanel } from '../../components/chat/ChatPanel'
import { 
  Truck,
  Package,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  MessageCircle,
  Send,
  Ship,
  Plane,
  Navigation,
  BarChart3,
  FileText
} from 'lucide-react'

interface Shipment {
  id: string
  mtoId: string
  lineNumbers: string[]
  brand: string
  destination: string
  carrier: string
  trackingNumber: string
  status: 'preparing' | 'ready_to_ship' | 'in_transit' | 'delivered' | 'delayed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  shipDate: string
  estimatedDelivery: string
  actualDelivery?: string
  totalCartons: number
  totalWeight: number
  totalValue: number
  dimensions: string
  notes: string
  lastUpdate: string
}

interface CarrierPerformance {
  name: string
  onTimeRate: number
  totalShipments: number
  avgTransitTime: number
  cost: number
}

const Shipping: React.FC = () => {
  const { user } = useAuth()
  const { buildShippingChatId, openChat, closeChat, chatState } = useChat()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCarrier, setSelectedCarrier] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'shipDate' | 'priority' | 'value' | 'status'>('shipDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)

  useEffect(() => {
    fetchShippingData()
    const interval = setInterval(fetchShippingData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchShippingData = async () => {
    try {
      const sampleShipments: Shipment[] = Array.from({ length: 80 }, (_, i) => {
        const shipDate = new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000)
        const estimatedDelivery = new Date(shipDate.getTime() + (Math.random() * 7 + 3) * 24 * 60 * 60 * 1000)
        
        return {
          id: `ship-${i + 1}`,
          mtoId: `MTO-${Math.floor(Math.random() * 50) + 1}`,
          lineNumbers: [`L${Math.floor(Math.random() * 20) + 1}`, `L${Math.floor(Math.random() * 20) + 1}`],
          brand: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance'][Math.floor(Math.random() * 5)],
          destination: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'][Math.floor(Math.random() * 6)],
          carrier: ['FedEx', 'UPS', 'DHL', 'USPS', 'TNT'][Math.floor(Math.random() * 5)],
          trackingNumber: `TRK${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
          status: ['preparing', 'ready_to_ship', 'in_transit', 'delivered', 'delayed'][Math.floor(Math.random() * 5)] as any,
          priority: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
          shipDate: shipDate.toISOString().split('T')[0],
          estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
          actualDelivery: Math.random() > 0.7 ? estimatedDelivery.toISOString().split('T')[0] : undefined,
          totalCartons: Math.floor(Math.random() * 20) + 1,
          totalWeight: Math.floor(Math.random() * 500) + 50,
          totalValue: Math.floor(Math.random() * 50000) + 5000,
          dimensions: `${Math.floor(Math.random() * 50) + 20}x${Math.floor(Math.random() * 30) + 15}x${Math.floor(Math.random() * 20) + 10} cm`,
          notes: ['Handle with care', 'Fragile items', 'Express delivery', 'Standard shipping', ''][Math.floor(Math.random() * 5)],
          lastUpdate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      setShipments(sampleShipments)
    } catch (error) {
      console.error('Error fetching shipping data:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800'
      case 'ready_to_ship': return 'bg-blue-100 text-blue-800'
      case 'in_transit': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing': return <Package className="w-4 h-4" />
      case 'ready_to_ship': return <Send className="w-4 h-4" />
      case 'in_transit': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />
      case 'delayed': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredAndSortedShipments = useMemo(() => {
    let filtered = shipments.filter(shipment => {
      const matchesSearch = searchTerm === '' ||
        shipment.mtoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || shipment.status === selectedStatus
      const matchesCarrier = selectedCarrier === 'all' || shipment.carrier === selectedCarrier
      
      return matchesSearch && matchesStatus && matchesCarrier
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'shipDate':
          comparison = new Date(a.shipDate).getTime() - new Date(b.shipDate).getTime()
          break
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
        case 'value':
          comparison = a.totalValue - b.totalValue
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        default:
          comparison = 0
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [shipments, searchTerm, selectedStatus, selectedCarrier, sortBy, sortOrder])

  const shippingStats = useMemo(() => {
    const totalShipments = shipments.length
    const preparingShipments = shipments.filter(s => s.status === 'preparing').length
    const inTransitShipments = shipments.filter(s => s.status === 'in_transit').length
    const deliveredShipments = shipments.filter(s => s.status === 'delivered').length
    const delayedShipments = shipments.filter(s => s.status === 'delayed').length
    const urgentShipments = shipments.filter(s => s.priority === 'urgent').length
    const totalValue = shipments.reduce((sum, s) => sum + s.totalValue, 0)
    
    return {
      totalShipments,
      preparingShipments,
      inTransitShipments,
      deliveredShipments,
      delayedShipments,
      urgentShipments,
      totalValue,
      onTimeRate: Math.round((deliveredShipments / Math.max(deliveredShipments + delayedShipments, 1)) * 100)
    }
  }, [shipments])

  const carriers = [...new Set(shipments.map(s => s.carrier))]

  const handleChatClick = async (shipment: Shipment) => {
    const chatId = buildShippingChatId(shipment.id, shipment.trackingNumber)
    
    try {
      await openChat(chatId)
    } catch (error) {
      console.error('Failed to open chat:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factory Shipping Management</h1>
          <p className="text-gray-600">Track and manage shipments with real-time updates and chat support</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Last updated: {new Date().toLocaleTimeString()}</div>
          <div className="mt-1 font-medium text-gray-900">
            {filteredAndSortedShipments.length} of {shippingStats.totalShipments} shipments shown
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Ship className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{shippingStats.totalShipments}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Preparing</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-yellow-600">{shippingStats.preparingShipments}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">In Transit</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600">{shippingStats.inTransitShipments}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Delivered</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600">{shippingStats.deliveredShipments}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Delayed</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{shippingStats.delayedShipments}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Urgent</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-orange-600">{shippingStats.urgentShipments}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-600">On Time</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{shippingStats.onTimeRate}%</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by MTO ID, Brand, Tracking Number, or Destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="preparing">Preparing</option>
            <option value="ready_to_ship">Ready to Ship</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="delayed">Delayed</option>
          </select>

          <select
            value={selectedCarrier}
            onChange={(e) => setSelectedCarrier(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Carriers</option>
            {carriers.map(carrier => (
              <option key={carrier} value={carrier}>{carrier}</option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="shipDate">Ship Date</option>
              <option value="priority">Priority</option>
              <option value="value">Value</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Shipments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MTO ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lines</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ship Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Delivery</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedShipments.slice(0, 100).map(shipment => (
                <React.Fragment key={shipment.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{shipment.mtoId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {shipment.lineNumbers.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{shipment.brand}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-32 truncate">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{shipment.destination}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{shipment.carrier}</td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{shipment.trackingNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
                        {getStatusIcon(shipment.status)}
                        <span className="capitalize">{shipment.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(shipment.priority)}`}>
                        {shipment.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(shipment.shipDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(shipment.estimatedDelivery).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">${shipment.totalValue.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedShipment(shipment)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleChatClick(shipment)}
                          className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                          title="Chat"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredAndSortedShipments.length > 100 && (
            <div className="px-4 py-3 text-center text-sm text-gray-500 bg-gray-50 border-t">
              Showing first 100 of {filteredAndSortedShipments.length} shipments. Use filters to narrow down results.
            </div>
          )}
        </div>
      </div>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Shipment Details</h3>
                  <p className="text-gray-600">{selectedShipment.mtoId} - {selectedShipment.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">MTO ID</label>
                  <div className="text-sm text-blue-600 font-mono">{selectedShipment.mtoId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Line Numbers</label>
                  <div className="text-sm text-gray-900">{selectedShipment.lineNumbers.join(', ')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Brand</label>
                  <div className="text-sm text-gray-900">{selectedShipment.brand}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Destination</label>
                  <div className="text-sm text-gray-900">{selectedShipment.destination}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Carrier</label>
                  <div className="text-sm text-gray-900">{selectedShipment.carrier}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tracking Number</label>
                  <div className="text-sm font-mono text-blue-600">{selectedShipment.trackingNumber}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Cartons</label>
                  <div className="text-sm text-gray-900">{selectedShipment.totalCartons}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Weight</label>
                  <div className="text-sm text-gray-900">{selectedShipment.totalWeight} kg</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dimensions</label>
                  <div className="text-sm text-gray-900">{selectedShipment.dimensions}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Value</label>
                  <div className="text-sm font-semibold text-gray-900">${selectedShipment.totalValue.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ship Date</label>
                  <div className="text-sm text-gray-900">{new Date(selectedShipment.shipDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estimated Delivery</label>
                  <div className="text-sm text-gray-900">{new Date(selectedShipment.estimatedDelivery).toLocaleDateString()}</div>
                </div>
                {selectedShipment.actualDelivery && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Actual Delivery</label>
                    <div className="text-sm text-green-600">{new Date(selectedShipment.actualDelivery).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              {selectedShipment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedShipment.notes}</div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Track Shipment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredAndSortedShipments.length === 0 && searchTerm && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}

    </div>
  )
}

export default Shipping
