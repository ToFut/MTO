import React, { useState, useMemo } from 'react'
import { 
  Search, Filter, Eye, MessageCircle, Download, ChevronDown, ChevronRight,
  Package, Truck, CheckCircle2, AlertTriangle, Clock, RefreshCw,
  Upload, FileText, QrCode, Calendar, User, Hash, MapPin, Star,
  Camera, Music, Coffee, Heart, Sun, Crown, Gift, X
} from 'lucide-react'

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
  const [expandedPOs, setExpandedPOs] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterFactory, setFilterFactory] = useState('all')
  const [viewMode, setViewMode] = useState<'po' | 'mto'>('po')
  const [selectedMTO, setSelectedMTO] = useState<MTO | null>(null)
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)

  // Sample data based on original system
  const brandPOs: PO[] = [
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
      case 'shipped': return 'bg-green-100 text-green-800'
      case 'qc': return 'bg-blue-100 text-blue-800'
      case 'in production': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const handleChatClick = (mto: MTO, po: string) => {
    // Chat functionality would be implemented here
    console.log('Open chat for MTO:', mto.lineId, 'in PO:', po)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MTO Management</h1>
          <p className="text-gray-600">Track and manage all your made-to-order items</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Upload size={16} />
            Upload PO
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search PO, factory, product..."
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
            <option value="In Production">In Production</option>
            <option value="QC">QC</option>
            <option value="Shipped">Shipped</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterFactory}
            onChange={(e) => setFilterFactory(e.target.value)}
          >
            <option value="all">All Factories</option>
            <option value="GZ Totes">GZ Totes</option>
            <option value="GZ Factory">GZ Factory</option>
            <option value="Shanghai Bags">Shanghai Bags</option>
          </select>

          <div className="flex border border-gray-300 rounded-lg">
            <button
              className={`px-4 py-2 rounded-l-lg ${viewMode === 'po' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setViewMode('po')}
            >
              PO View
            </button>
            <button
              className={`px-4 py-2 rounded-r-lg ${viewMode === 'mto' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setViewMode('mto')}
            >
              MTO View
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {viewMode === 'po' ? (
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