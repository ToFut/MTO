import React, { useState, useMemo, useEffect } from 'react'
import { 
  Search, Eye, MessageCircle, Download, ChevronDown, ChevronRight, ChevronLeft,
  Package, CheckCircle2, AlertTriangle, Clock, RefreshCw,
  Upload, QrCode, Calendar, Star,
  Camera, Music, Coffee, Heart, Sun, Crown, Gift, X, Loader2,
  BarChart3, TrendingUp, Settings,
  Activity, Sparkles, ArrowUpRight, Zap, Shield, Globe, Layers,
  Target, Building2, MoreVertical, Folder, Archive
} from 'lucide-react'
import { mtoService } from '../../services/mto.service'
import { useAuth } from '../../contexts/AuthContext'
import { useChat } from '../../contexts/ChatContext'

interface MTO {
  lineId: number
  qty: number
  customization: string
  status: string
  eta: string
  progress: number
  style: string
  internalId: string
  poLineId: string
  expectedShipDate: string
  actualShipDate: string
  poLineTrackingNumber: string
  awb: string
  masterCarton: string
  vendorPoStatus: string
  orderSubmitDate: string
  soDate: string
  shopifyOrderDateTime: string
  salesOrderNumber: string
  cpsd: string
  displayName: string
  referenceNumber: string
  quantity: number
  spot1: string
  spot2: string
  spot3: string
  spot4: string
  spot5: string
  spot6: string
  bagBasePid: string
  spot1PatchRef: string
  spot2PatchRef: string
  spot3PatchRef: string
  spot4PatchRef: string
  spot5PatchRef: string
  spot6PatchRef: string
  xfDate: string
  productType: string
}

interface PO {
  po: string
  totalUnits: number
  completed: number
  percent: number
  eta: string
  status: string
  uploadDate: string
  factory: string
  urgent?: boolean
  mtos: MTO[]
}

const MTOList: React.FC = () => {
  const { user } = useAuth()
  const { openChat, buildMTOChatId } = useChat()
  const [expandedPOs, setExpandedPOs] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterFactory, setFilterFactory] = useState('all')
  const [viewMode, setViewMode] = useState<'po' | 'temporal' | 'analytics'>('temporal')
  const [selectedMTO, setSelectedMTO] = useState<MTO | null>(null)
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set(['2025-01']))
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [expandedMTOs, setExpandedMTOs] = useState<Set<string>>(new Set())
  const [selectedProductType, setSelectedProductType] = useState<string>('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [mtos, setMtos] = useState<any[]>([])
  const [brandPOs, setBrandPOs] = useState<PO[]>([])

  useEffect(() => {
    fetchMTOs()
  }, [filterStatus, filterFactory])

  const fetchMTOs = async () => {
    try {
      setLoading(true)
      const response = await mtoService.findAll({
        brandId: user?.companyId,
        status: filterStatus !== 'all' ? filterStatus as any : undefined,
        limit: 100,
        offset: 0
      })
      
      // Transform real MTOs to component format
      const realMtos = response.data || []
      setMtos(realMtos)
      
      // Group MTOs by PO
      const poMap = new Map<string, PO>()
      
      realMtos.forEach((mto: any) => {
        const poNumber = mto.purchase_orders?.po_number || 'Unknown PO'
        
        if (!poMap.has(poNumber)) {
          poMap.set(poNumber, {
            po: poNumber,
            totalUnits: 0,
            completed: 0,
            percent: 0,
            eta: mto.expected_ship_date || 'TBD',
            status: mto.status === 'shipped' ? 'Shipped' : mto.status === 'shipping' ? 'Ready to Ship' : 'In Production',
            uploadDate: new Date(mto.created_at).toLocaleDateString(),
            factory: 'GZ Factory',
            urgent: mto.priority === 'urgent',
            mtos: []
          })
        }
        
        const po = poMap.get(poNumber)!
        po.totalUnits += mto.quantity || 1
        if (mto.status === 'shipped') po.completed += mto.quantity || 1
        
        // Transform MTO to component format
        const transformedMTO: MTO = {
          id: mto.id,
          lineId: po.mtos.length + 1,
          qty: mto.quantity || 1,
          customization: `${mto.spots_data?.length || 0} spots`,
          status: mto.status,
          eta: mto.expected_ship_date || 'TBD',
          progress: mto.status === 'shipped' ? 100 : mto.status === 'shipping' ? 90 : mto.status === 'qc' ? 75 : mto.status === 'proceed' ? 50 : 25,
          style: mto.style_number || mto.product_name || 'Custom Tote',
          internalId: mto.internal_id,
          poLineId: mto.po_line_id,
          expectedShipDate: mto.expected_ship_date || '',
          actualShipDate: mto.actual_ship_date || '',
          poLineTrackingNumber: mto.po_line_tracking || '',
          awb: mto.awb || '',
          masterCarton: mto.master_carton || '',
          vendorPoStatus: mto.vendor_po_status || mto.status,
          orderSubmitDate: mto.order_submit_date || '',
          soDate: mto.so_date || '',
          shopifyOrderDateTime: mto.shopify_order_date || '',
          salesOrderNumber: mto.sales_order_number || '',
          cpsd: mto.cpsd || '',
          displayName: mto.display_name || mto.sku || '',
          referenceNumber: mto.reference_number || mto.sku || '',
          quantity: mto.quantity || 1,
          po: poNumber,
          spot1: mto.spots_data?.[0]?.sku || '',
          spot2: mto.spots_data?.[1]?.sku || '',
          spot3: mto.spots_data?.[2]?.sku || '',
          spot4: mto.spots_data?.[3]?.sku || '',
          spot5: mto.spots_data?.[4]?.sku || '',
          spot6: mto.spots_data?.[5]?.sku || '',
          bagBasePid: mto.bag_base_pid || '',
          spot1PatchRef: mto.spots_data?.[0]?.patch_ref || '',
          spot2PatchRef: mto.spots_data?.[1]?.patch_ref || '',
          spot3PatchRef: mto.spots_data?.[2]?.patch_ref || '',
          spot4PatchRef: mto.spots_data?.[3]?.patch_ref || '',
          spot5PatchRef: mto.spots_data?.[4]?.patch_ref || '',
          spot6PatchRef: mto.spots_data?.[5]?.patch_ref || '',
          xfDate: mto.xf_date || '',
          productType: mto.production_category === 'daily' ? 'Rush Order' : 'Initial Tote'
        }
        
        po.mtos.push(transformedMTO)
      })
      
      // Calculate percentages
      poMap.forEach(po => {
        po.percent = po.totalUnits > 0 ? Math.round((po.completed / po.totalUnits) * 100) : 0
      })
      
      setBrandPOs(Array.from(poMap.values()))
    } catch (error) {
      console.error('Failed to fetch MTOs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Keep sample data as fallback
  const samplePOs: PO[] = [
    {
      po: 'PO123',
      totalUnits: 500,
      completed: 280,
      percent: 56,
      eta: 'July 11, 2025',
      status: 'In Production',
      uploadDate: 'June 15, 2025',
      factory: 'GZ Totes',
      mtos: [
        {
          lineId: 6,
          qty: 1,
          customization: 'Spot 1-6',
          status: 'QC',
          eta: 'July 5, 2025',
          progress: 75,
          style: '14oz Natural Tote - Medium',
          internalId: '37483586',
          poLineId: '6',
          expectedShipDate: '24/07/2025',
          actualShipDate: '',
          poLineTrackingNumber: '',
          awb: '',
          masterCarton: '',
          vendorPoStatus: 'process',
          orderSubmitDate: '16/07/2025',
          soDate: '16/07/2025',
          shopifyOrderDateTime: '07/16/25 02:15 PM',
          salesOrderNumber: 'SO2508459',
          cpsd: '06/08/2025',
          displayName: 'Custom Tote Bag - 14oz Natural Lined - Medium',
          referenceNumber: 'md6a4z3j45we9',
          quantity: 1,
          spot1: '129559',
          spot2: '137234',
          spot3: '128687',
          spot4: '128698',
          spot5: '128954',
          spot6: '',
          bagBasePid: '133938',
          spot1PatchRef: '63 - Camera Icon',
          spot2PatchRef: '171 - Music Notes Icon',
          spot3PatchRef: '17 - Spicy Margarita Icon',
          spot4PatchRef: '30 - Airplane Icon',
          spot5PatchRef: '38 - H - Classic Letter',
          spot6PatchRef: '',
          xfDate: '01/07/2025',
          productType: 'Initial Tote'
        }
      ]
    },
    {
      po: 'PO124',
      totalUnits: 300,
      completed: 85,
      percent: 28,
      eta: 'July 18, 2025',
      status: 'In Production',
      urgent: true,
      uploadDate: 'June 20, 2025',
      factory: 'GZ Factory',
      mtos: [
        {
          lineId: 12,
          qty: 2,
          customization: 'Spot 1-4',
          status: 'In Production',
          eta: 'July 15, 2025',
          progress: 60,
          style: '14oz Canvas Tote - Large',
          internalId: '37483587',
          poLineId: '12',
          expectedShipDate: '18/07/2025',
          actualShipDate: '',
          poLineTrackingNumber: '',
          awb: '',
          masterCarton: '',
          vendorPoStatus: 'process',
          orderSubmitDate: '20/06/2025',
          soDate: '20/06/2025',
          shopifyOrderDateTime: '06/20/25 10:30 AM',
          salesOrderNumber: 'SO2508460',
          cpsd: '15/07/2025',
          displayName: 'Custom Canvas Tote - Large',
          referenceNumber: 'lg4b5c6d78ef0',
          quantity: 2,
          spot1: '129560',
          spot2: '137235',
          spot3: '128688',
          spot4: '128699',
          spot5: '',
          spot6: '',
          bagBasePid: '133939',
          spot1PatchRef: '64 - Heart Icon',
          spot2PatchRef: '172 - Coffee Icon',
          spot3PatchRef: '18 - Sun Icon',
          spot4PatchRef: '31 - Crown Icon',
          spot5PatchRef: '',
          spot6PatchRef: '',
          xfDate: '05/07/2025',
          productType: 'Premium Tote'
        }
      ]
    },
    {
      po: 'PO125',
      totalUnits: 750,
      completed: 750,
      percent: 100,
      eta: 'June 30, 2025',
      status: 'Shipped',
      uploadDate: 'June 1, 2025',
      factory: 'Shanghai Bags',
      mtos: [
        {
          lineId: 14,
          qty: 5,
          customization: 'Spot 1-6',
          status: 'Shipped',
          eta: 'June 30, 2025',
          progress: 100,
          style: '14oz Natural Tote - Medium',
          internalId: '37483588',
          poLineId: '14',
          expectedShipDate: '30/06/2025',
          actualShipDate: '29/06/2025',
          poLineTrackingNumber: '1Z123456789',
          awb: 'AWB123456',
          masterCarton: 'MC-001',
          vendorPoStatus: 'shipped',
          orderSubmitDate: '01/06/2025',
          soDate: '01/06/2025',
          shopifyOrderDateTime: '06/01/25 09:00 AM',
          salesOrderNumber: 'SO2508461',
          cpsd: '30/06/2025',
          displayName: 'Custom Natural Tote - Multi-pack',
          referenceNumber: 'mp5c6d7e89fg1',
          quantity: 5,
          spot1: '129561',
          spot2: '137236',
          spot3: '128689',
          spot4: '128700',
          spot5: '128955',
          spot6: '128956',
          bagBasePid: '133940',
          spot1PatchRef: '65 - Star Icon',
          spot2PatchRef: '173 - Gift Icon',
          spot3PatchRef: '19 - Music Notes',
          spot4PatchRef: '32 - Camera Icon',
          spot5PatchRef: '39 - L - Letter',
          spot6PatchRef: '40 - Crown Icon',
          xfDate: '25/06/2025',
          productType: 'Classic Tote'
        }
      ]
    }
  ]

  const filteredPOs = useMemo(() => {
    return brandPOs.filter(po => {
      const matchesSearch = po.po.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           po.factory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           po.mtos.some(mto => 
                             mto.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             mto.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
                           )
      
      const matchesStatus = filterStatus === 'all' || po.status === filterStatus
      const matchesFactory = filterFactory === 'all' || po.factory === filterFactory

      return matchesSearch && matchesStatus && matchesFactory
    })
  }, [brandPOs, searchTerm, filterStatus, filterFactory])

  const allMTOs = useMemo(() => {
    return brandPOs.flatMap(po => 
      po.mtos.map(mto => ({ ...mto, po: po.po, factory: po.factory }))
    )
  }, [brandPOs])

  const togglePOExpansion = (po: string) => {
    const newExpanded = new Set(expandedPOs)
    if (newExpanded.has(po)) {
      newExpanded.delete(po)
    } else {
      newExpanded.add(po)
    }
    setExpandedPOs(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
      case 'shipping': return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'qc': return 'bg-violet-50 text-violet-600 border-violet-200'
      case 'proceed': return 'bg-amber-50 text-amber-600 border-amber-200'
      case 'in production': return 'bg-amber-50 text-amber-600 border-amber-200'
      case 'pending': return 'bg-gray-50 text-gray-600 border-gray-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getPatchIcon = (patchRef: string) => {
    if (patchRef.includes('Camera')) return Camera
    if (patchRef.includes('Music')) return Music
    if (patchRef.includes('Coffee')) return Coffee
    if (patchRef.includes('Heart')) return Heart
    if (patchRef.includes('Sun')) return Sun
    if (patchRef.includes('Crown')) return Crown
    if (patchRef.includes('Gift')) return Gift
    if (patchRef.includes('Star')) return Star
    return Package
  }

  const handleChatClick = (mto: MTO, context: string) => {
    try {
      let chatId: string;
      
      // Determine chat type based on context
      if (context.startsWith('month-')) {
        // Month-level chat: extract month from context
        const monthKey = context.replace('month-', '');
        const [year, month] = monthKey.split('-');
        chatId = buildMTOChatId({
          level: 'MO',
          month: `${year}-${month.padStart(2, '0')}`
        });
      } else if (context.startsWith('day-')) {
        // Day-level chat: extract date from context
        const dayKey = context.replace('day-', '');
        const [year, month, day] = dayKey.split('-');
        chatId = buildMTOChatId({
          level: 'DY',
          date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        });
      } else if (context.startsWith('mto-')) {
        // Specific MTO chat
        const mtoId = context.replace('mto-', '');
        chatId = buildMTOChatId({
          level: 'SP',
          mtoId: mtoId || mto.internalId || mto.lineId.toString()
        });
      } else {
        // Fallback to specific MTO
        chatId = buildMTOChatId({
          level: 'SP',
          mtoId: mto.internalId || mto.lineId.toString()
        });
      }
      
      openChat(chatId);
    } catch (error) {
      console.error('Failed to open chat:', error);
    }
  }

  // Temporal grouping functions
  const groupMTOsByMonth = (mtos: any[]) => {
    const monthGroups = new Map<string, any[]>()
    
    mtos.forEach(mto => {
      const date = new Date(mto.created_at || mto.expected_ship_date || Date.now())
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, [])
      }
      monthGroups.get(monthKey)!.push(mto)
    })
    
    return Array.from(monthGroups.entries()).map(([monthKey, mtos]) => ({
      monthKey,
      monthName: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      mtos,
      totalMTOs: mtos.length,
      productTypes: {
        'Initial Tote': mtos.filter(m => (m.productType || 'Initial Tote') === 'Initial Tote').length,
        'Icon Tote': mtos.filter(m => (m.productType || 'Initial Tote') === 'Icon Tote').length,
        'Rush Order': mtos.filter(m => (m.productType || 'Initial Tote') === 'Rush Order').length,
        'Classic Tote': mtos.filter(m => (m.productType || 'Initial Tote') === 'Classic Tote').length
      }
    })).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  }

  const groupMTOsByDay = (monthMTOs: any[]) => {
    const dayGroups = new Map<string, any[]>()
    
    monthMTOs.forEach(mto => {
      const date = new Date(mto.created_at || mto.expected_ship_date || Date.now())
      const dayKey = date.toISOString().split('T')[0]
      
      if (!dayGroups.has(dayKey)) {
        dayGroups.set(dayKey, [])
      }
      dayGroups.get(dayKey)!.push(mto)
    })
    
    return Array.from(dayGroups.entries()).map(([dayKey, mtos]) => ({
      dayKey,
      dayName: new Date(dayKey).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      mtos,
      totalMTOs: mtos.length,
      statusBreakdown: {
        completed: mtos.filter(m => m.status === 'shipped').length,
        inProgress: mtos.filter(m => ['proceed', 'qc', 'shipping'].includes(m.status)).length,
        pending: mtos.filter(m => m.status === 'pending').length
      }
    })).sort((a, b) => b.dayKey.localeCompare(a.dayKey))
  }

  const toggleMonthExpansion = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey)
    } else {
      newExpanded.add(monthKey)
    }
    setExpandedMonths(newExpanded)
  }

  const toggleDayExpansion = (dayKey: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey)
    } else {
      newExpanded.add(dayKey)
    }
    setExpandedDays(newExpanded)
  }

  const toggleMTOExpansion = (mtoId: string) => {
    const newExpanded = new Set(expandedMTOs)
    if (newExpanded.has(mtoId)) {
      newExpanded.delete(mtoId)
    } else {
      newExpanded.add(mtoId)
    }
    setExpandedMTOs(newExpanded)
  }

  const handleViewDetails = (mto: any) => {
    setSelectedMTO(mto)
  }

  const navigateMonth = (direction: 'prev' | 'next' | 'current') => {
    if (direction === 'current') {
      setCurrentDate(new Date())
    } else if (direction === 'prev') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }
  }

  // Get temporal data
  const temporalData = useMemo(() => {
    const allMTOsFlat = brandPOs.flatMap(po => 
      po.mtos.map(mto => ({ ...mto, po: po.po, factory: po.factory }))
    )
    
    // Filter by product type
    const filteredMTOs = selectedProductType === 'all' 
      ? allMTOsFlat 
      : allMTOsFlat.filter(mto => (mto.productType || 'Initial Tote') === selectedProductType)
    
    return groupMTOsByMonth(filteredMTOs)
  }, [brandPOs, selectedProductType, currentDate])

  const productTypes = ['all', 'Initial Tote', 'Icon Tote', 'Rush Order', 'Classic Tote']

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="space-y-6 p-4 lg:p-8 max-w-8xl mx-auto">
        {/* Enhanced Premium Header */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-blue-600/5"></div>
          <div className="relative">
            {/* Status Bar */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-white animate-pulse" />
                    <span className="text-xs font-medium text-white/90">System Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/80">3 Factories Connected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/80">Secure</span>
                  </div>
                </div>
                <div className="text-xs text-white/80">
                  {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            </div>
            
            {/* Main Header Content */}
            <div className="px-8 py-10">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-lg">
                      <Layers className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        MTO Command Center
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                      </h1>
                      <p className="text-sm text-gray-500 mt-1">Production Intelligence & Order Management</p>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Active MTOs</p>
                        <p className="text-lg font-bold text-gray-900">{mtos.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Factories</p>
                        <p className="text-lg font-bold text-gray-900">3</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Zap className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Progress</p>
                        <p className="text-lg font-bold text-gray-900">
                          {Math.round(mtos.reduce((sum, mto) => sum + (mto.progress || 0), 0) / Math.max(mtos.length, 1))}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Target className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">On Track</p>
                        <p className="text-lg font-bold text-gray-900">
                          {Math.round((mtos.filter(m => m.status === 'shipped' || m.status === 'shipping').length / Math.max(mtos.length, 1)) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button className="group relative px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2 font-medium shadow-sm hover:shadow-md">
                    <Download className="w-4 h-4 group-hover:text-indigo-600 transition-colors" />
                    Export
                  </button>
                  <button className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Upload className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Upload PO
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Control Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            {/* Search and Filters Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search MTOs, POs, SKUs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:bg-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="lg:col-span-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:bg-white appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="proceed">In Production</option>
                  <option value="qc">Quality Check</option>
                  <option value="shipping">Ready to Ship</option>
                  <option value="shipped">Shipped</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Factory Filter */}
              <div className="lg:col-span-3">
                <select
                  value={filterFactory}
                  onChange={(e) => setFilterFactory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:bg-white appearance-none cursor-pointer"
                >
                  <option value="all">All Factories</option>
                  <option value="GZ Totes">GZ Totes</option>
                  <option value="GZ Factory">GZ Factory</option>
                  <option value="Shanghai Bags">Shanghai Bags</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <div className="lg:col-span-2">
                <button
                  onClick={() => fetchMTOs()}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center group disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('temporal')}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      viewMode === 'temporal'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Timeline
                  </button>
                  <button
                    onClick={() => setViewMode('analytics')}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      viewMode === 'analytics'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Analytics
                  </button>
                  <button
                    onClick={() => setViewMode('po')}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      viewMode === 'po'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Package className="w-4 h-4 inline mr-2" />
                    PO View
                  </button>
                </div>
                
                {/* View-specific controls */}
                {viewMode === 'temporal' && (
                  <div className="flex items-center space-x-3">
                    <select
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={selectedProductType}
                      onChange={(e) => setSelectedProductType(e.target.value)}
                    >
                      {productTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'All Types' : type}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-1.5 hover:bg-white rounded transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => navigateMonth('current')}
                        className="px-3 py-1.5 text-xs font-medium hover:bg-white rounded transition-colors"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-1.5 hover:bg-white rounded transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
          {brandPOs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No MTOs Available</h3>
              <p className="text-gray-500 mb-6 max-w-md text-center">
                Start managing your production orders by uploading your first MTO file.
              </p>
              <a
                href="/brand/upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Your First MTO
              </a>
            </div>
          ) : viewMode === 'temporal' ? (
            /* Enhanced Temporal View */
            <div className="p-6">
              <div className="space-y-3">
                {temporalData.map((monthData) => (
                  <div key={monthData.monthKey} className="group bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                    {/* Monthly Header */}
                    <div
                      className="p-4 cursor-pointer bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white transition-all duration-200 rounded-t-xl"
                      onClick={() => toggleMonthExpansion(monthData.monthKey)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{monthData.monthName}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500">{monthData.totalMTOs} MTOs</span>
                              <div className="flex items-center space-x-2">
                                {Object.entries(monthData.productTypes).slice(0, 3).map(([type, count], idx) => (
                                  count > 0 && (
                                    <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                      {count} {type}
                                    </span>
                                  )
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 transition-transform duration-200 ${expandedMonths.has(monthData.monthKey) ? 'rotate-90' : ''}`}>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleChatClick(monthData.mtos[0], `month-${monthData.monthKey}`)
                              }}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Month Chat"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                              <Folder className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Content */}
                    {expandedMonths.has(monthData.monthKey) && (
                      <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                        <div className="space-y-3">
                          {/* Daily Groups */}
                          {groupMTOsByDay(monthData.mtos).map((dayData) => (
                            <div key={dayData.dayKey} className="bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-all duration-200 overflow-hidden">
                              {/* Daily Header */}
                              <div
                                className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all duration-200"
                                onClick={() => toggleDayExpansion(dayData.dayKey)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`transition-transform duration-200 ${expandedDays.has(dayData.dayKey) ? 'rotate-90' : ''}`}>
                                      <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">{dayData.dayName}</h4>
                                      <div className="flex items-center space-x-3 mt-1">
                                        <span className="text-sm text-gray-500">{dayData.totalMTOs} MTOs</span>
                                        <div className="flex items-center space-x-2">
                                          <span className="flex items-center text-xs text-emerald-600">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            {dayData.statusBreakdown.completed}
                                          </span>
                                          <span className="flex items-center text-xs text-amber-600">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {dayData.statusBreakdown.inProgress}
                                          </span>
                                          {dayData.statusBreakdown.pending > 0 && (
                                            <span className="flex items-center text-xs text-gray-500">
                                              <AlertTriangle className="w-3 h-3 mr-1" />
                                              {dayData.statusBreakdown.pending}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleChatClick(dayData.mtos[0], `day-${dayData.dayKey}`)
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                      title="Day Chat"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Daily MTOs */}
                              {expandedDays.has(dayData.dayKey) && (
                                <div className="border-t border-gray-100 bg-gray-50/30 p-3">
                                  <div className="space-y-2">
                                    {dayData.mtos.map((mto) => {
                                      const isExpanded = expandedMTOs.has(mto.id || mto.lineId)
                                      
                                      return (
                                        <div key={mto.id || mto.lineId} className="bg-white rounded-lg border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                                          {/* MTO Row */}
                                          <div
                                            className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all duration-200"
                                            onClick={() => toggleMTOExpansion(mto.id || mto.lineId)}
                                          >
                                          <div className="flex items-center justify-between">
                                            {/* Left: Essential Info */}
                                            <div className="flex items-center space-x-3 flex-1">
                                              {/* Expand/Collapse Icon */}
                                              <div className="flex items-center space-x-1">
                                                {isExpanded ? (
                                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                                ) : (
                                                  <ChevronRight className="h-4 w-4 text-gray-500" />
                                                )}
                                                {/* Priority Indicator */}
                                                {mto.urgent && (
                                                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                                )}
                                              </div>
                                              
                                              {/* Line Number */}
                                              <div className="min-w-[30px] text-center">
                                                <span className="text-xs text-gray-400">{mto.lineId}</span>
                                              </div>
                                              
                                              {/* SKU/Product Name */}
                                              <div className="min-w-[180px]">
                                                <div className="text-sm text-gray-800">
                                                  {mto.style || 'Custom Tote'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                  {mto.displayName || mto.referenceNumber || 'SKU'}
                                                </div>
                                              </div>
                                              
                                              {/* Quantity */}
                                              <div className="min-w-[50px] text-center">
                                                <span className="text-sm font-medium text-gray-700">{mto.quantity || mto.qty}</span>
                                                <span className="text-xs text-gray-400 ml-0.5">pc</span>
                                              </div>
                                              
                                              {/* Customization Spots Visual */}
                                              <div className="min-w-[100px]">
                                                <div className="flex space-x-0.5">
                                                  {[1,2,3,4,5,6].map(n => {
                                                    const hasSpot = mto[`spot${n}`] && mto[`spot${n}`] !== ''
                                                    return (
                                                      <div 
                                                        key={n} 
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                                          hasSpot ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-300'
                                                        }`}
                                                      >
                                                        {n}
                                                      </div>
                                                    )
                                                  })}
                                                </div>
                                              </div>
                                              
                                              {/* Expected Ship Date */}
                                              <div className="min-w-[70px] text-center">
                                                {mto.expectedShipDate || mto.eta ? (
                                                  <div className="text-xs text-gray-600">
                                                    {new Date(mto.expectedShipDate || mto.eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                  </div>
                                                ) : (
                                                  <span className="text-xs text-gray-300">—</span>
                                                )}
                                              </div>
                                              
                                              {/* Progress Bar */}
                                              <div className="flex items-center space-x-1.5 flex-1 max-w-[140px]">
                                                <div className="flex-1 bg-gray-100 rounded-full h-1">
                                                  <div
                                                    className="bg-gradient-to-r from-indigo-400 to-indigo-500 h-1 rounded-full transition-all duration-500"
                                                    style={{ width: `${mto.progress || 0}%` }}
                                                  ></div>
                                                </div>
                                                <span className="text-xs text-gray-500 min-w-[32px] text-right">{mto.progress || 0}%</span>
                                              </div>
                                            </div>
                                            
                                            {/* Right: Status & Actions */}
                                            <div className="flex items-center space-x-2">
                                              {/* Tracking if shipped */}
                                              {mto.poLineTrackingNumber && (
                                                <div className="text-xs text-blue-500 font-mono opacity-70">
                                                  {mto.poLineTrackingNumber.slice(0, 8)}...
                                                </div>
                                              )}
                                              
                                              {/* Status Badge */}
                                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusColor(mto.status)}`}>
                                                {mto.status}
                                              </span>
                                              
                                              {/* Quick Actions */}
                                              <div className="flex items-center">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleChatClick(mto, `mto-${mto.id || mto.lineId}`)
                                                  }}
                                                  className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all duration-200"
                                                  title="Chat"
                                                >
                                                  <MessageCircle className="h-3 w-3" />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleViewDetails(mto)
                                                  }}
                                                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all duration-200"
                                                  title="Details"
                                                >
                                                  <Eye className="h-3 w-3" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Expanded Detailed View */}
                                        {isExpanded && (
                                          <div className="border-t border-gray-200 p-5 bg-gradient-to-br from-gray-50 to-indigo-50/20">
                                            {/* Complete Details Grid - Like App.js */}
                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                              {/* Column 1 - IDs & References */}
                                              <div className="space-y-2">
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">Internal ID</div>
                                                  <div className="font-mono text-gray-900 font-bold">{mto.internalId}</div>
                                                </div>
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">PO Line ID</div>
                                                  <div className="font-mono text-gray-900">{mto.poLineId}</div>
                                                </div>
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">Sales Order</div>
                                                  <div className="font-mono text-gray-900">{mto.salesOrderNumber}</div>
                                                </div>
                                              </div>
                                              
                                              {/* Column 2 - PO Details */}
                                              <div className="space-y-2">
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">PO Number</div>
                                                  <div className="font-bold text-gray-900">{mto.po}</div>
                                                </div>
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">PO Line ID</div>
                                                  <div className="font-bold text-gray-900">Line #{mto.lineId} ({mto.poLineId})</div>
                                                </div>
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">Quantity</div>
                                                  <div className="font-bold text-gray-900">{mto.quantity || mto.qty} units</div>
                                                </div>
                                              </div>
                                              
                                              {/* Column 3 - Dates */}
                                              <div className="space-y-2">
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">Order Submit</div>
                                                  <div className="font-semibold text-gray-900">{mto.orderSubmitDate}</div>
                                                </div>
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">Expected Ship</div>
                                                  <div className="font-semibold text-green-600">{mto.expectedShipDate || mto.eta}</div>
                                                </div>
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">XF Date</div>
                                                  <div className="font-semibold text-purple-600">{mto.xfDate || 'N/A'}</div>
                                                </div>
                                              </div>
                                              
                                              {/* Column 4 - Shipping & Tracking */}
                                              <div className="space-y-2">
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">Tracking</div>
                                                  <div className="font-mono text-blue-600 text-xs">{mto.poLineTrackingNumber || 'Pending'}</div>
                                                </div>
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">AWB</div>
                                                  <div className="font-mono text-gray-900">{mto.awb || 'N/A'}</div>
                                                </div>
                                                <div className="bg-white/80 rounded-lg p-2 border border-gray-200">
                                                  <div className="text-xs text-gray-500 font-semibold uppercase">Master Carton</div>
                                                  <div className="font-mono text-gray-900">{mto.masterCarton || 'TBD'}</div>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Additional Details Row */}
                                            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
                                                <div className="text-xs text-blue-600 font-semibold uppercase">Shopify Order</div>
                                                <div className="font-semibold text-gray-900">{mto.shopifyOrderDateTime}</div>
                                              </div>
                                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200">
                                                <div className="text-xs text-green-600 font-semibold uppercase">SO Date</div>
                                                <div className="font-semibold text-gray-900">{mto.soDate}</div>
                                              </div>
                                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200">
                                                <div className="text-xs text-purple-600 font-semibold uppercase">CPSD</div>
                                                <div className="font-semibold text-gray-900">{mto.cpsd}</div>
                                              </div>
                                            </div>
                                            
                                            {/* Customization Spots - Full Details */}
                                            <div className="mt-4">
                                              <div className="text-xs text-gray-500 font-semibold uppercase mb-2">Customization Details (All 6 Spots)</div>
                                              <div className="grid grid-cols-6 gap-2">
                                                {[1, 2, 3, 4, 5, 6].map((spotNum) => {
                                                  const spotKey = `spot${spotNum}` as keyof typeof mto
                                                  const patchRefKey = `spot${spotNum}PatchRef` as keyof typeof mto
                                                  const spotValue = mto[spotKey]
                                                  const patchRef = mto[patchRefKey]
                                                  const hasValue = spotValue && spotValue !== ''
                                                  
                                                  return (
                                                    <div key={spotNum} className={`rounded-lg p-2 text-center ${hasValue ? 'bg-gradient-to-b from-indigo-100 to-blue-100 border-2 border-indigo-300' : 'bg-gray-100 border border-gray-300'}`}>
                                                      <div className="text-xs font-bold text-gray-600 mb-1">Spot {spotNum}</div>
                                                      {hasValue ? (
                                                        <>
                                                          {patchRef && (() => {
                                                            const IconComponent = getPatchIcon(patchRef as string)
                                                            return (
                                                              <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center mb-1">
                                                                <IconComponent className="w-5 h-5 text-indigo-600" />
                                                              </div>
                                                            )
                                                          })()}
                                                          <div className="text-xs font-mono text-gray-700">{spotValue}</div>
                                                          <div className="text-xs text-indigo-600 font-semibold mt-1">{patchRef}</div>
                                                        </>
                                                      ) : (
                                                        <div className="text-xs text-gray-400 mt-3">Empty</div>
                                                      )}
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            </div>
                                            
                                            {/* Product Details Row */}
                                            <div className="grid grid-cols-3 gap-4 mt-4">
                                              <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                                                <div className="text-xs text-yellow-700 font-semibold uppercase">Product Type</div>
                                                <div className="font-bold text-gray-900">{mto.productType}</div>
                                              </div>
                                              <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                                                <div className="text-xs text-orange-700 font-semibold uppercase">Bag Base PID</div>
                                                <div className="font-mono text-gray-900">{mto.bagBasePid}</div>
                                              </div>
                                              <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                                                <div className="text-xs text-red-700 font-semibold uppercase">Vendor PO Status</div>
                                                <div className="font-bold text-gray-900">{mto.vendorPoStatus}</div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          ) : viewMode === 'analytics' ? (
          /* Analytics View */
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {brandPOs.reduce((sum, po) => sum + po.totalUnits, 0)}
                  </div>
                  <div className="text-gray-700 font-medium mt-2">Total MTOs</div>
                  <div className="text-sm text-gray-500">Across all POs</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {brandPOs.reduce((sum, po) => sum + po.completed, 0)}
                  </div>
                  <div className="text-gray-700 font-medium mt-2">Completed</div>
                  <div className="text-sm text-gray-500">Ready to ship</div>
                </div>
                <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600">
                    {Math.round(
                      (brandPOs.reduce((sum, po) => sum + po.completed, 0) /
                        Math.max(brandPOs.reduce((sum, po) => sum + po.totalUnits, 0), 1)) * 100
                    )}%
                  </div>
                  <div className="text-gray-700 font-medium mt-2">Completion Rate</div>
                  <div className="text-sm text-gray-500">Overall progress</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">
                    {brandPOs.filter(po => po.urgent).length}
                  </div>
                  <div className="text-gray-700 font-medium mt-2">Urgent POs</div>
                  <div className="text-sm text-gray-500">Need attention</div>
                </div>
              </div>
              
              {/* Factory Performance */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Factory Performance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from(new Set(brandPOs.map(po => po.factory))).map((factory) => {
                        const factoryPOs = brandPOs.filter(po => po.factory === factory)
                        const totalUnits = factoryPOs.reduce((sum, po) => sum + po.totalUnits, 0)
                        const completed = factoryPOs.reduce((sum, po) => sum + po.completed, 0)
                        const rate = totalUnits > 0 ? Math.round((completed / totalUnits) * 100) : 0
                        
                        return (
                          <tr key={factory}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {factory}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {totalUnits} MTOs
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{ width: `${rate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900">{rate}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                rate >= 80 ? 'bg-green-100 text-green-800' : 
                                rate >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {rate >= 80 ? 'Excellent' : rate >= 60 ? 'Good' : 'Needs Attention'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          ) : viewMode === 'po' ? (
          <div className="divide-y divide-gray-200">
            {filteredPOs.map((po) => (
              <div key={po.po} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePOExpansion(po.po)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedPOs.has(po.po) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{po.po}</h3>
                        {po.urgent && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            Urgent
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                          {po.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{po.factory} • {po.totalUnits} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Progress: {po.completed}/{po.totalUnits} ({po.percent}%)</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${po.percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {expandedPOs.has(po.po) && (
                  <div className="mt-4 bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customization</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {po.mtos.map((mto) => (
                          <tr key={mto.lineId} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{mto.lineId}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{mto.displayName}</div>
                                <div className="text-sm text-gray-500">Qty: {mto.qty}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {[mto.spot1PatchRef, mto.spot2PatchRef, mto.spot3PatchRef, mto.spot4PatchRef, mto.spot5PatchRef, mto.spot6PatchRef]
                                  .filter(Boolean)
                                  .map((patch, index) => {
                                    const IconComponent = getPatchIcon(patch)
                                    return (
                                      <div key={index} className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">
                                        <IconComponent size={12} className="mr-1" />
                                        {patch.split(' - ')[1] || patch}
                                      </div>
                                    )
                                  })}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mto.status)}`}>
                                {mto.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {mto.eta}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedMTO(mto)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleChatClick(mto, po.po)}
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
                )}
              </div>
            ))}
          </div>
          ) : (
          // MTO View
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MTO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allMTOs
                  .filter(mto => 
                    filterStatus === 'all' || mto.status === filterStatus
                  )
                  .filter(mto =>
                    filterFactory === 'all' || mto.factory === filterFactory
                  )
                  .filter(mto =>
                    mto.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mto.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mto.po.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((mto) => (
                    <tr key={`${mto.po}-${mto.lineId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{mto.lineId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mto.po}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{mto.displayName}</div>
                          <div className="text-sm text-gray-500">Qty: {mto.qty}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {[mto.spot1PatchRef, mto.spot2PatchRef, mto.spot3PatchRef, mto.spot4PatchRef, mto.spot5PatchRef, mto.spot6PatchRef]
                            .filter(Boolean)
                            .map((patch, index) => {
                              const IconComponent = getPatchIcon(patch)
                              return (
                                <div key={index} className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">
                                  <IconComponent size={12} className="mr-1" />
                                  {patch.split(' - ')[1] || patch}
                                </div>
                              )
                            })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mto.status)}`}>
                          {mto.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mto.factory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedMTO(mto)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleChatClick(mto, mto.po)}
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
          )}
        </div>

      {/* MTO Details Modal */}
      {selectedMTO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">MTO Details - Line #{selectedMTO.lineId}</h2>
                <button
                  onClick={() => setSelectedMTO(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Display Name</dt>
                      <dd className="text-sm text-gray-900">{selectedMTO.displayName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Product Type</dt>
                      <dd className="text-sm text-gray-900">{selectedMTO.productType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                      <dd className="text-sm text-gray-900">{selectedMTO.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Style</dt>
                      <dd className="text-sm text-gray-900">{selectedMTO.style}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Reference Number</dt>
                      <dd className="text-sm text-gray-900">{selectedMTO.referenceNumber}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Internal ID</dt>
                      <dd className="text-sm text-gray-900">{selectedMTO.internalId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Sales Order</dt>
                      <dd className="text-sm text-gray-900">{selectedMTO.salesOrderNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                      <dd className="text-sm text-gray-900">{selectedMTO.orderSubmitDate}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expected Ship Date</dt>
                      <dd className="text-sm text-gray-900">{selectedMTO.expectedShipDate}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMTO.status)}`}>
                          {selectedMTO.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customization Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { spot: 'spot1', ref: selectedMTO.spot1PatchRef, pid: selectedMTO.spot1 },
                    { spot: 'spot2', ref: selectedMTO.spot2PatchRef, pid: selectedMTO.spot2 },
                    { spot: 'spot3', ref: selectedMTO.spot3PatchRef, pid: selectedMTO.spot3 },
                    { spot: 'spot4', ref: selectedMTO.spot4PatchRef, pid: selectedMTO.spot4 },
                    { spot: 'spot5', ref: selectedMTO.spot5PatchRef, pid: selectedMTO.spot5 },
                    { spot: 'spot6', ref: selectedMTO.spot6PatchRef, pid: selectedMTO.spot6 }
                  ]
                    .filter(item => item.ref && item.ref.trim())
                    .map((item, index) => {
                      const IconComponent = getPatchIcon(item.ref)
                      return (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent size={16} className="text-indigo-600" />
                            <span className="text-sm font-medium text-gray-900">
                              Spot {item.spot.replace('spot', '')}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div>{item.ref}</div>
                            <div>PID: {item.pid}</div>
                          </div>
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

export default MTOList