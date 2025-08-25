import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useChat } from '../../contexts/ChatContext'
import { ChatPanel } from '../../components/chat/ChatPanel'
import { 
  Package,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  Edit,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Box,
  Warehouse,
  MessageCircle
} from 'lucide-react'

interface InventoryItem {
  id: string
  sku: string
  brand: string
  description: string
  category: string
  currentStock: number
  reservedStock: number
  availableStock: number
  minimumStock: number
  maximumStock: number
  unit: string
  location: string
  lastUpdated: string
  costPerUnit: number
  totalValue: number
  supplier: string
  leadTime: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked'
  reorderPoint: number
}

interface StockMovement {
  id: string
  sku: string
  type: 'inbound' | 'outbound' | 'adjustment' | 'reserved' | 'released'
  quantity: number
  reason: string
  mtoId?: string
  timestamp: string
  user: string
}

const Inventory: React.FC = () => {
  const { user } = useAuth()
  const { buildInventoryChatId, openChat, closeChat, chatState } = useChat()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'sku' | 'stock' | 'value' | 'lastUpdated'>('sku')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [showMovements, setShowMovements] = useState<boolean>(false)

  useEffect(() => {
    fetchInventoryData()
    const interval = setInterval(fetchInventoryData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchInventoryData = async () => {
    try {
      // Generate sample inventory data
      const sampleItems: InventoryItem[] = Array.from({ length: 200 }, (_, i) => {
        const currentStock = Math.floor(Math.random() * 1000) + 50
        const reservedStock = Math.floor(Math.random() * currentStock * 0.3)
        const minimumStock = Math.floor(Math.random() * 100) + 20
        const costPerUnit = Math.floor(Math.random() * 50) + 5
        
        return {
          id: `inv-${i + 1}`,
          sku: `SKU${1000 + i}`,
          brand: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance'][Math.floor(Math.random() * 5)],
          description: ['Mesh Fabric', 'Rubber Sole', 'Lace System', 'Cushioning Foam', 'Synthetic Leather'][Math.floor(Math.random() * 5)],
          category: ['Raw Materials', 'Components', 'Finished Goods', 'Packaging', 'Tools'][Math.floor(Math.random() * 5)],
          currentStock,
          reservedStock,
          availableStock: currentStock - reservedStock,
          minimumStock,
          maximumStock: minimumStock * 3,
          unit: ['pcs', 'kg', 'm', 'roll', 'box'][Math.floor(Math.random() * 5)],
          location: [`A${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 20) + 1}`],
          lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          costPerUnit,
          totalValue: currentStock * costPerUnit,
          supplier: [`Supplier ${Math.floor(Math.random() * 10) + 1}`],
          leadTime: Math.floor(Math.random() * 14) + 1,
          status: currentStock === 0 ? 'out_of_stock' : 
                  currentStock <= minimumStock ? 'low_stock' :
                  currentStock >= minimumStock * 3 ? 'overstocked' : 'in_stock',
          reorderPoint: minimumStock
        }
      })

      const sampleMovements: StockMovement[] = Array.from({ length: 50 }, (_, i) => ({
        id: `mov-${i + 1}`,
        sku: `SKU${1000 + Math.floor(Math.random() * 200)}`,
        type: ['inbound', 'outbound', 'adjustment', 'reserved', 'released'][Math.floor(Math.random() * 5)] as any,
        quantity: Math.floor(Math.random() * 100) + 1,
        reason: ['Production Order', 'Stock Adjustment', 'Damaged Goods', 'MTO Reservation', 'Quality Issue'][Math.floor(Math.random() * 5)],
        mtoId: Math.random() > 0.5 ? `MTO-${Math.floor(Math.random() * 20) + 1}` : undefined,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        user: `${user?.email || 'Factory User'}`
      }))

      setInventoryItems(sampleItems)
      setStockMovements(sampleMovements)
    } catch (error) {
      console.error('Error fetching inventory data:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      case 'overstocked': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle2 className="w-4 h-4" />
      case 'low_stock': return <AlertTriangle className="w-4 h-4" />
      case 'out_of_stock': return <AlertTriangle className="w-4 h-4" />
      case 'overstocked': return <TrendingUp className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const filteredAndSortedItems = useMemo(() => {
    let filtered = inventoryItems.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'sku':
          comparison = a.sku.localeCompare(b.sku)
          break
        case 'stock':
          comparison = a.currentStock - b.currentStock
          break
        case 'value':
          comparison = a.totalValue - b.totalValue
          break
        case 'lastUpdated':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
          break
        default:
          comparison = 0
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [inventoryItems, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder])

  const inventoryStats = useMemo(() => {
    const totalItems = inventoryItems.length
    const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0)
    const lowStockItems = inventoryItems.filter(item => item.status === 'low_stock').length
    const outOfStockItems = inventoryItems.filter(item => item.status === 'out_of_stock').length
    const overstockedItems = inventoryItems.filter(item => item.status === 'overstocked').length
    
    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      overstockedItems,
      avgStockLevel: Math.round(inventoryItems.reduce((sum, item) => sum + item.currentStock, 0) / Math.max(totalItems, 1))
    }
  }, [inventoryItems])

  const categories = [...new Set(inventoryItems.map(item => item.category))]

  const handleChatClick = async (item: InventoryItem) => {
    const chatId = buildInventoryChatId(item.sku)
    
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
          <h1 className="text-2xl font-bold text-gray-900">Factory Inventory Management</h1>
          <p className="text-gray-600">Real-time inventory tracking and stock management</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Last updated: {new Date().toLocaleTimeString()}</div>
          <div className="mt-1 font-medium text-gray-900">
            {filteredAndSortedItems.length} of {inventoryStats.totalItems} items shown
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Items</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{inventoryStats.totalItems.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Total Value</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600">${inventoryStats.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Low Stock</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-yellow-600">{inventoryStats.lowStockItems}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Out of Stock</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{inventoryStats.outOfStockItems}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Overstocked</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600">{inventoryStats.overstockedItems}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Warehouse className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Avg Stock</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600">{inventoryStats.avgStockLevel}</div>
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
                placeholder="Search by SKU, Brand, or Description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="overstocked">Overstocked</option>
          </select>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="sku">SKU</option>
              <option value="stock">Stock Level</option>
              <option value="value">Total Value</option>
              <option value="lastUpdated">Last Updated</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => setShowMovements(!showMovements)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showMovements 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Stock Movements
          </button>
        </div>
      </div>

      {/* Stock Movements Panel */}
      {showMovements && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Stock Movements</h3>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MTO ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockMovements.slice(0, 20).map(movement => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(movement.timestamp).toLocaleDateString()} {new Date(movement.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{movement.sku}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${
                          movement.type === 'inbound' ? 'bg-green-100 text-green-800' :
                          movement.type === 'outbound' ? 'bg-red-100 text-red-800' :
                          movement.type === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                          movement.type === 'released' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {movement.type === 'inbound' && <Plus className="w-3 h-3" />}
                          {movement.type === 'outbound' && <Minus className="w-3 h-3" />}
                          {movement.type === 'reserved' && <Clock className="w-3 h-3" />}
                          <span className="capitalize">{movement.type}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{movement.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{movement.reason}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{movement.mtoId || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{movement.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Items Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedItems.slice(0, 100).map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.sku}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.brand}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-48 truncate">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.currentStock} {item.unit}</td>
                  <td className="px-4 py-3 text-sm text-yellow-600">{item.reservedStock} {item.unit}</td>
                  <td className="px-4 py-3 text-sm text-green-600">{item.availableStock} {item.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.location}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">${item.totalValue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleChatClick(item)}
                        className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                        title={`Chat for ${item.sku}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                        title="Edit Stock"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSortedItems.length > 100 && (
            <div className="px-4 py-3 text-center text-sm text-gray-500 bg-gray-50 border-t">
              Showing first 100 of {filteredAndSortedItems.length} items. Use filters to narrow down results.
            </div>
          )}
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedItem.sku}</h3>
                  <p className="text-gray-600">{selectedItem.description}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Box className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Brand</label>
                  <div className="text-sm text-gray-900">{selectedItem.brand}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="text-sm text-gray-900">{selectedItem.category}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Stock</label>
                  <div className="text-sm font-semibold text-gray-900">{selectedItem.currentStock} {selectedItem.unit}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reserved Stock</label>
                  <div className="text-sm text-yellow-600">{selectedItem.reservedStock} {selectedItem.unit}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Available Stock</label>
                  <div className="text-sm text-green-600">{selectedItem.availableStock} {selectedItem.unit}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reorder Point</label>
                  <div className="text-sm text-orange-600">{selectedItem.reorderPoint} {selectedItem.unit}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="text-sm text-gray-900">{selectedItem.location}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Supplier</label>
                  <div className="text-sm text-gray-900">{selectedItem.supplier}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cost per Unit</label>
                  <div className="text-sm text-gray-900">${selectedItem.costPerUnit}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Value</label>
                  <div className="text-sm font-semibold text-gray-900">${selectedItem.totalValue.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Lead Time</label>
                  <div className="text-sm text-gray-900">{selectedItem.leadTime} days</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="text-sm text-gray-900">{new Date(selectedItem.lastUpdated).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Edit Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredAndSortedItems.length === 0 && searchTerm && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}

    </div>
  )
}

export default Inventory
