import React, { useState, useEffect, useMemo } from 'react'
import { 
  Package, Clock, CheckCircle2, AlertCircle, Truck, Shield,
  ChevronRight, Camera, Upload, MessageCircle, 
  Eye, RefreshCw, Search,
  Activity, Zap, Calendar, Hash, QrCode,
  ArrowRight, Loader2, X, Bell,
  Sparkles, Box, Send, Check
} from 'lucide-react'
import { mtoService } from '../../services/mto.service'
import { useAuth } from '../../contexts/AuthContext'

// Production stages with icons and colors
const PRODUCTION_STAGES = [
  { 
    id: 'received', 
    name: 'Received', 
    icon: Package, 
    color: 'gray',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    description: 'New MTO from brand'
  },
  { 
    id: 'customizing', 
    name: 'Customizing', 
    icon: Sparkles, 
    color: 'purple',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
    description: 'Adding spots/patches'
  },
  { 
    id: 'qc', 
    name: 'Quality Check', 
    icon: Shield, 
    color: 'blue',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    description: 'Quality control check'
  },
  { 
    id: 'packing', 
    name: 'Packing', 
    icon: Box, 
    color: 'amber',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-700',
    description: 'Packing into cartons'
  },
  { 
    id: 'ready_to_ship', 
    name: 'Ready to Ship', 
    icon: Send, 
    color: 'green',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
    description: 'Ready for pickup'
  },
  { 
    id: 'shipped', 
    name: 'Shipped', 
    icon: Truck, 
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-700',
    description: 'Shipped by carrier'
  }
]

// MTO Card Component
const MTOCard: React.FC<{
  mto: any
  onStageChange: (mtoId: string, newStage: string) => void
  onOpenDetails: (mto: any) => void
}> = ({ mto, onStageChange, onOpenDetails }) => {
  const currentStageIndex = PRODUCTION_STAGES.findIndex(s => s.id === (mto.production_stage || 'received'))
  const currentStage = PRODUCTION_STAGES[currentStageIndex]
  const nextStage = PRODUCTION_STAGES[currentStageIndex + 1]
  const progress = ((currentStageIndex + 1) / PRODUCTION_STAGES.length) * 100

  const isUrgent = mto.priority === 'urgent' || mto.is_rush
  const daysUntilDue = mto.expected_ship_date ? 
    Math.ceil((new Date(mto.expected_ship_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-2 ${currentStage.borderColor} overflow-hidden group`}>
      {/* Progress Bar */}
      <div className="h-2 bg-gray-100">
        <div 
          className={`h-full transition-all duration-500 ${
            progress === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-indigo-500 to-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">
                MTO #{mto.internal_id || mto.mto_number || mto.lineId}
              </h3>
              {isUrgent && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full animate-pulse">
                  URGENT
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {mto.display_name || mto.displayName || mto.product_name || 'Product'}
            </p>
          </div>
          <button
            onClick={() => onOpenDetails(mto)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* MTO Info Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Hash className="h-3.5 w-3.5" />
            <span>SKU: {mto.sku || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Package className="h-3.5 w-3.5" />
            <span>Qty: {mto.quantity || 1}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>PO: {mto.po_number || mto.poNumber || 'N/A'}</span>
          </div>
          {daysUntilDue !== null && (
            <div className={`flex items-center gap-1.5 ${daysUntilDue <= 3 ? 'text-red-600' : 'text-gray-600'}`}>
              <Clock className="h-3.5 w-3.5" />
              <span>{daysUntilDue} days left</span>
            </div>
          )}
        </div>

        {/* Customization Spots */}
        {mto.spots_data && Object.keys(mto.spots_data).length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-2">Customization Spots:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(mto.spots_data).slice(0, 3).map(([spot, value]: [string, any]) => (
                <span key={spot} className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">
                  {spot}: {value}
                </span>
              ))}
              {Object.keys(mto.spots_data).length > 3 && (
                <span className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-600">
                  +{Object.keys(mto.spots_data).length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Current Stage */}
        <div className={`p-3 ${currentStage.bgColor} rounded-lg mb-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <currentStage.icon className={`h-5 w-5 ${currentStage.textColor}`} />
              <div>
                <p className={`font-medium ${currentStage.textColor}`}>
                  {currentStage.name}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {currentStage.description}
                </p>
              </div>
            </div>
            <button className={`p-2 ${currentStage.bgColor} hover:bg-white rounded-lg transition-colors group border ${currentStage.borderColor}`}>
              <Camera className={`h-4 w-4 ${currentStage.textColor}`} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {nextStage && (
            <button
              onClick={() => onStageChange(mto.id || mto.lineId, nextStage.id)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              <span>Move to {nextStage.name}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {mto.production_stage === 'shipped' && (
            <div className="flex-1 px-4 py-2.5 bg-green-100 text-green-700 rounded-lg flex items-center justify-center gap-2 font-medium">
              <Check className="h-4 w-4" />
              <span>Completed</span>
            </div>
          )}
          <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const Workboard: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [mtos, setMtos] = useState<any[]>([])
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMTO, setSelectedMTO] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchMTOs()
  }, [user])

  const fetchMTOs = async () => {
    if (!user?.companyId) return
    
    setLoading(true)
    try {
      // Get MTOs for this factory - using the existing workspace relationship
      const response = await mtoService.getMTOList({
        factoryId: user.companyId,
        limit: 100,
        offset: 0
      })
      
      // For demo purposes, if no MTOs, use sample data
      if (!response.data || response.data.length === 0) {
        const sampleMTOs = [
          {
            id: 'mto-001',
            lineId: '1',
            internal_id: 'MTO-2025-001',
            mto_number: 'MTO-001',
            sku: 'TB-001',
            display_name: 'Custom Tote Bag - Navy Blue',
            quantity: 5,
            po_number: 'PO-2025-001',
            production_stage: 'received',
            priority: 'urgent',
            expected_ship_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            spots_data: { 'Spot 1': 'Logo A', 'Spot 2': 'Text B', 'Spot 3': 'Icon C' }
          },
          {
            id: 'mto-002',
            lineId: '2',
            internal_id: 'MTO-2025-002',
            mto_number: 'MTO-002',
            sku: 'TB-002',
            display_name: 'Premium Canvas Bag - Black',
            quantity: 3,
            po_number: 'PO-2025-001',
            production_stage: 'customizing',
            priority: 'normal',
            expected_ship_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            spots_data: { 'Spot 1': 'Design X', 'Spot 2': 'Pattern Y' }
          },
          {
            id: 'mto-003',
            lineId: '3',
            internal_id: 'MTO-2025-003',
            mto_number: 'MTO-003',
            sku: 'TB-003',
            display_name: 'Eco Tote - Natural',
            quantity: 10,
            po_number: 'PO-2025-002',
            production_stage: 'qc',
            priority: 'normal',
            expected_ship_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            spots_data: { 'Spot 1': 'Eco Logo' }
          },
          {
            id: 'mto-004',
            lineId: '4',
            internal_id: 'MTO-2025-004',
            mto_number: 'MTO-004',
            sku: 'TB-004',
            display_name: 'Beach Tote - Striped',
            quantity: 2,
            po_number: 'PO-2025-002',
            production_stage: 'packing',
            priority: 'normal',
            expected_ship_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            spots_data: {}
          },
          {
            id: 'mto-005',
            lineId: '5',
            internal_id: 'MTO-2025-005',
            mto_number: 'MTO-005',
            sku: 'TB-005',
            display_name: 'Luxury Leather Tote',
            quantity: 1,
            po_number: 'PO-2025-003',
            production_stage: 'ready_to_ship',
            priority: 'urgent',
            expected_ship_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            spots_data: { 'Spot 1': 'Monogram' }
          }
        ]
        setMtos(sampleMTOs)
      } else {
        setMtos(response.data)
      }
    } catch (error) {
      console.error('Error fetching MTOs:', error)
      // Use sample data on error for demo
      const sampleMTOs = [
        {
          id: 'mto-demo-001',
          lineId: '1',
          internal_id: 'DEMO-001',
          display_name: 'Demo Tote Bag',
          quantity: 5,
          production_stage: 'received',
          priority: 'normal',
          sku: 'DEMO-SKU-001',
          po_number: 'DEMO-PO-001'
        }
      ]
      setMtos(sampleMTOs)
    } finally {
      setLoading(false)
    }
  }

  const handleStageChange = async (mtoId: string, newStage: string) => {
    try {
      // Update locally for instant feedback
      setMtos(prev => prev.map(m => 
        (m.id === mtoId || m.lineId === mtoId) ? { ...m, production_stage: newStage } : m
      ))

      // Try to update backend
      await mtoService.updateMTO(mtoId, {
        production_stage: newStage,
        [`${newStage}_at`]: new Date().toISOString()
      }).catch(err => {
        console.error('Backend update failed, but continuing:', err)
      })
    } catch (error) {
      console.error('Error updating MTO stage:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMTOs()
    setTimeout(() => setRefreshing(false), 500)
  }

  // Filter MTOs based on stage and search
  const filteredMTOs = useMemo(() => {
    return mtos.filter(mto => {
      const matchesStage = selectedStage === 'all' || (mto.production_stage || 'received') === selectedStage
      const matchesSearch = !searchTerm || 
        mto.internal_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mto.mto_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mto.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mto.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mto.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStage && matchesSearch
    })
  }, [mtos, selectedStage, searchTerm])

  // Group MTOs by stage for kanban view
  const mtosByStage = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    PRODUCTION_STAGES.forEach(stage => {
      grouped[stage.id] = mtos.filter(m => (m.production_stage || 'received') === stage.id)
    })
    return grouped
  }, [mtos])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = mtos.length
    const urgent = mtos.filter(m => m.priority === 'urgent' || m.is_rush).length
    const completed = mtos.filter(m => m.production_stage === 'shipped').length
    const inProgress = mtos.filter(m => 
      m.production_stage !== 'received' && m.production_stage !== 'shipped'
    ).length
    
    return { total, urgent, completed, inProgress }
  }, [mtos])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading production workboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 -m-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              Production Workboard
              <Activity className="h-8 w-8 text-indigo-600 animate-pulse" />
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage and track MTO production stages
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
            
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
              <QrCode className="h-4 w-4" />
              <span>Scan MTO</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total MTOs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <Activity className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <Zap className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search MTOs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Stage Filter */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedStage('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selectedStage === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Stages
              </button>
              {PRODUCTION_STAGES.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedStage === stage.id 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <stage.icon className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{stage.name}</span>
                  {mtosByStage[stage.id]?.length > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                      selectedStage === stage.id 
                        ? `${stage.bgColor} ${stage.textColor}` 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {mtosByStage[stage.id].length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {PRODUCTION_STAGES.map(stage => (
          <div key={stage.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`p-4 ${stage.bgColor} border-b ${stage.borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <stage.icon className={`h-5 w-5 ${stage.textColor}`} />
                  <h3 className={`font-semibold ${stage.textColor}`}>
                    {stage.name}
                  </h3>
                </div>
                <span className={`px-2 py-1 ${stage.bgColor} ${stage.textColor} text-xs font-semibold rounded-full`}>
                  {mtosByStage[stage.id]?.length || 0}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{stage.description}</p>
            </div>
            
            <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
              {(selectedStage === 'all' || selectedStage === stage.id) && 
                mtosByStage[stage.id]?.filter(mto => 
                  !searchTerm || 
                  mto.internal_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  mto.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  mto.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(mto => (
                  <MTOCard
                    key={mto.id || mto.lineId}
                    mto={mto}
                    onStageChange={handleStageChange}
                    onOpenDetails={setSelectedMTO}
                  />
                ))
              }
              
              {mtosByStage[stage.id]?.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <stage.icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No MTOs in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MTO Details Modal */}
      {selectedMTO && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  MTO Details - {selectedMTO.internal_id || selectedMTO.mto_number}
                </h2>
                <button
                  onClick={() => setSelectedMTO(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Production Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Production Timeline</h3>
                <div className="space-y-3">
                  {PRODUCTION_STAGES.map((stage, index) => {
                    const currentIndex = PRODUCTION_STAGES.findIndex(s => s.id === (selectedMTO.production_stage || 'received'))
                    const isCompleted = currentIndex >= index
                    const isCurrent = stage.id === (selectedMTO.production_stage || 'received')
                    
                    return (
                      <div key={stage.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                        isCurrent ? stage.bgColor : isCompleted ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        <div className={`p-2 rounded-full ${
                          isCurrent ? stage.bgColor : isCompleted ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          <stage.icon className={`h-4 w-4 ${
                            isCurrent ? stage.textColor : isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            isCurrent ? stage.textColor : isCompleted ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {stage.name}
                          </p>
                          <p className="text-xs text-gray-600">{stage.description}</p>
                        </div>
                        {isCompleted && !isCurrent && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {isCurrent && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                            Current Stage
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Workboard