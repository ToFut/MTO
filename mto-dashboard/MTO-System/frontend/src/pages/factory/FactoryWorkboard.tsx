import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Package, Clock, CheckCircle2, AlertCircle, Truck, Shield,
  ChevronRight, ChevronDown, Camera, Upload, MessageCircle, 
  BarChart3, Eye, Download, RefreshCw, Filter, Search,
  Activity, Zap, Users, Calendar, MapPin, Hash, QrCode,
  ArrowRight, ArrowUpRight, Loader2, X, Bell, Settings,
  Scissors, ShirtIcon, Sparkles, Box, Send, Check
} from 'lucide-react'
import { mtoService } from '../../services/mto.service'
import { useAuth } from '../../contexts/AuthContext'
import { io, Socket } from 'socket.io-client'

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
  onPhotoUpload: (mtoId: string, stage: string, file: File) => void
  onOpenDetails: (mto: any) => void
}> = ({ mto, onStageChange, onPhotoUpload, onOpenDetails }) => {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const currentStageIndex = PRODUCTION_STAGES.findIndex(s => s.id === mto.production_stage)
  const currentStage = PRODUCTION_STAGES[currentStageIndex]
  const nextStage = PRODUCTION_STAGES[currentStageIndex + 1]
  const progress = ((currentStageIndex + 1) / PRODUCTION_STAGES.length) * 100

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      await onPhotoUpload(mto.id, mto.production_stage, file)
      setUploading(false)
    }
  }

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
                MTO #{mto.internal_id || mto.mto_number}
              </h3>
              {isUrgent && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full animate-pulse">
                  URGENT
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {mto.display_name || mto.product_name}
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
            <span>SKU: {mto.sku}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Package className="h-3.5 w-3.5" />
            <span>Qty: {mto.quantity}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>PO: {mto.po_number}</span>
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
              {Object.entries(mto.spots_data).map(([spot, value]: [string, any]) => (
                <span key={spot} className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">
                  {spot}: {value}
                </span>
              ))}
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
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`p-2 ${currentStage.bgColor} hover:bg-white rounded-lg transition-colors group border ${currentStage.borderColor}`}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                ) : (
                  <Camera className={`h-4 w-4 ${currentStage.textColor}`} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {nextStage && (
            <button
              onClick={() => onStageChange(mto.id, nextStage.id)}
              className={`flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02]`}
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
          <button
            className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const FactoryWorkboard: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [mtos, setMtos] = useState<any[]>([])
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMTO, setSelectedMTO] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5010', {
      auth: {
        token: localStorage.getItem('token')
      }
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      // Join factory room
      if (user?.companyId) {
        newSocket.emit('join-factory', user.companyId)
      }
    })

    newSocket.on('mto-updated', (data) => {
      // Update MTO in real-time when brand or factory makes changes
      setMtos(prev => prev.map(m => m.id === data.mtoId ? { ...m, ...data.updates } : m))
      
      // Show notification
      setNotifications(prev => [{
        id: Date.now(),
        message: `MTO ${data.mtoId} updated: ${data.updates.production_stage}`,
        type: 'info'
      }, ...prev].slice(0, 5))
    })

    newSocket.on('new-mto', (mto) => {
      // Add new MTO when brand uploads
      setMtos(prev => [mto, ...prev])
      setNotifications(prev => [{
        id: Date.now(),
        message: `New MTO received: ${mto.internal_id}`,
        type: 'success'
      }, ...prev].slice(0, 5))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user])

  useEffect(() => {
    fetchMTOs()
  }, [user])

  const fetchMTOs = async () => {
    if (!user?.companyId) return
    
    setLoading(true)
    try {
      // Get MTOs assigned to this factory through the workspace
      const response = await mtoService.getMTOList({
        factoryId: user.companyId,
        limit: 100,
        offset: 0
      })
      
      setMtos(response.data || [])
    } catch (error) {
      console.error('Error fetching MTOs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStageChange = async (mtoId: string, newStage: string) => {
    try {
      // Update MTO stage
      await mtoService.updateMTO(mtoId, {
        production_stage: newStage,
        [`${newStage}_at`]: new Date().toISOString(),
        [`${newStage}_by`]: user?.id
      })

      // Update local state
      setMtos(prev => prev.map(m => 
        m.id === mtoId ? { ...m, production_stage: newStage } : m
      ))

      // Emit WebSocket event to notify brand
      if (socket) {
        socket.emit('update-mto-stage', {
          mtoId,
          stage: newStage,
          factoryId: user?.companyId,
          updatedBy: user?.email || 'Factory'
        })
      }

      // Show success notification
      setNotifications(prev => [{
        id: Date.now(),
        message: `MTO moved to ${newStage}`,
        type: 'success'
      }, ...prev].slice(0, 5))
    } catch (error) {
      console.error('Error updating MTO stage:', error)
      setNotifications(prev => [{
        id: Date.now(),
        message: 'Failed to update MTO stage',
        type: 'error'
      }, ...prev].slice(0, 5))
    }
  }

  const handlePhotoUpload = async (mtoId: string, stage: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('stage', stage)
      formData.append('mtoId', mtoId)

      // Upload photo to backend
      await mtoService.uploadProductionPhoto(mtoId, formData)

      // Notify brand via WebSocket
      if (socket) {
        socket.emit('photo-uploaded', {
          mtoId,
          stage,
          factoryId: user?.companyId,
          uploadedBy: user?.name
        })
      }

      setNotifications(prev => [{
        id: Date.now(),
        message: 'Photo uploaded successfully',
        type: 'success'
      }, ...prev].slice(0, 5))
    } catch (error) {
      console.error('Error uploading photo:', error)
      setNotifications(prev => [{
        id: Date.now(),
        message: 'Failed to upload photo',
        type: 'error'
      }, ...prev].slice(0, 5))
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
      const matchesStage = selectedStage === 'all' || mto.production_stage === selectedStage
      const matchesSearch = !searchTerm || 
        mto.internal_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mto.mto_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mto.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mto.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStage && matchesSearch
    })
  }, [mtos, selectedStage, searchTerm])

  // Group MTOs by stage for kanban view
  const mtosByStage = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    PRODUCTION_STAGES.forEach(stage => {
      grouped[stage.id] = mtos.filter(m => m.production_stage === stage.id)
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
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm animate-slide-in-right ${
              notif.type === 'success' ? 'bg-green-500/90 text-white' :
              notif.type === 'error' ? 'bg-red-500/90 text-white' :
              'bg-blue-500/90 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">{notif.message}</span>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="ml-4"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              Production Workboard
              <Activity className="h-8 w-8 text-indigo-600 animate-pulse" />
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage and track MTO production stages in real-time
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
                  {stage.name}
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
                  mto.sku?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(mto => (
                  <MTOCard
                    key={mto.id}
                    mto={mto}
                    onStageChange={handleStageChange}
                    onPhotoUpload={handlePhotoUpload}
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
                  MTO Details - {selectedMTO.internal_id}
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
              {/* Details content here */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium">{selectedMTO.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium">{selectedMTO.display_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{selectedMTO.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PO Number:</span>
                      <span className="font-medium">{selectedMTO.po_number}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Production Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Stage:</span>
                      <span className="font-medium capitalize">{selectedMTO.production_stage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`font-medium ${
                        selectedMTO.priority === 'urgent' ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {selectedMTO.priority || 'Normal'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Ship Date:</span>
                      <span className="font-medium">
                        {selectedMTO.expected_ship_date ? 
                          new Date(selectedMTO.expected_ship_date).toLocaleDateString() : 
                          'Not set'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customization Spots */}
              {selectedMTO.spots_data && Object.keys(selectedMTO.spots_data).length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Customization Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(selectedMTO.spots_data).map(([spot, value]: [string, any]) => (
                        <div key={spot} className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">{spot}</p>
                          <p className="font-medium text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Production Timeline */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Production Timeline</h3>
                <div className="space-y-3">
                  {PRODUCTION_STAGES.map((stage, index) => {
                    const isCompleted = PRODUCTION_STAGES.findIndex(s => s.id === selectedMTO.production_stage) >= index
                    const isCurrent = stage.id === selectedMTO.production_stage
                    
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
                        {isCompleted && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
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

export default FactoryWorkboard