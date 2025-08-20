import React, { useState, useMemo } from 'react'
import { 
  AlertTriangle, AlertCircle, CheckCircle2, X, Eye, Send, Scan, Package,
  MessageCircle, RefreshCw, Clock, TrendingUp, BarChart3, FileText,
  ExternalLink, Truck, ArrowRight, QrCode, Hash, Camera, Zap,
  Search, Filter, Plus, Upload, Download
} from 'lucide-react'

interface Defect {
  id: string
  mtoId: string
  soReference: string
  barcode: string
  qrCode: string
  type: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: string
  description: string
  reportedDate: string
  reportedBy: string
  assignedTo: string
  resolution: string
  images: string[]
  reproductionStatus: string
  completionDate?: string
  reproductionItems?: number
  reproducer: string
  netSuiteId: string
  itemInternalId: string
  salesOrderNumber: string
  poNumber: string
  factory: string
  customer: string
  productName: string
}

interface DefectStats {
  totalDefects: number
  openDefects: number
  inProgress: number
  resolved: number
  critical: number
  reproductionRate: number
}

const Defects: React.FC = () => {
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'reproduction' | 'resolved'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showReportModal, setShowReportModal] = useState(false)
  const [newDefectReport, setNewDefectReport] = useState({
    mtoId: '',
    type: '',
    category: '',
    severity: 'medium' as const,
    description: '',
    images: [] as string[]
  })

  // Sample defect data
  const defectStats: DefectStats = {
    totalDefects: 48,
    openDefects: 12,
    inProgress: 8,
    resolved: 28,
    critical: 3,
    reproductionRate: 85.2
  }

  const sampleDefects: Defect[] = [
    {
      id: 'DEF-1001',
      mtoId: 'MTO-2025-01-0001',
      soReference: 'SO-50001',
      barcode: 'BC1234567890',
      qrCode: 'QR1234567890',
      type: 'defect_embroidery',
      category: 'Embroidery Defect',
      severity: 'high',
      status: 'investigating',
      description: 'Embroidery thread misalignment on spot 3, causing distorted camera icon',
      reportedDate: '2025-01-15',
      reportedBy: 'QC Inspector',
      assignedTo: 'Production Manager',
      resolution: '',
      images: ['embroidery_defect_1.jpg', 'embroidery_defect_2.jpg'],
      reproductionStatus: 'in_progress',
      netSuiteId: 'NS-37483586',
      itemInternalId: '133938',
      salesOrderNumber: 'SO2508459',
      poNumber: 'PO123',
      factory: 'GZ Totes',
      customer: 'Sarah Johnson',
      productName: 'Custom Tote Bag - 14oz Natural Lined - Medium',
      reproductionItems: 5,
      reproducer: 'Factory QC Team'
    },
    {
      id: 'DEF-1002',
      mtoId: 'MTO-2025-01-0002',
      soReference: 'SO-50002',
      barcode: 'BC1234567891',
      qrCode: 'QR1234567891',
      type: 'defect_bag',
      category: 'Bag Production Defect',
      severity: 'critical',
      status: 'open',
      description: 'Material tear in bag body, compromising structural integrity',
      reportedDate: '2025-01-16',
      reportedBy: 'Factory Inspector',
      assignedTo: 'Quality Manager',
      resolution: '',
      images: ['bag_defect_1.jpg'],
      reproductionStatus: 'pending',
      netSuiteId: 'NS-37483587',
      itemInternalId: '133939',
      salesOrderNumber: 'SO2508460',
      poNumber: 'PO124',
      factory: 'GZ Factory',
      customer: 'Mike Chen',
      productName: 'Custom Canvas Tote - Large',
      reproductionItems: 0,
      reproducer: ''
    },
    {
      id: 'DEF-1003',
      mtoId: 'MTO-2025-01-0003',
      soReference: 'SO-50003',
      barcode: 'BC1234567892',
      qrCode: 'QR1234567892',
      type: 'missing',
      category: 'Missing Items',
      severity: 'high',
      status: 'resolved',
      description: 'Missing heart icon patch from spot 1',
      reportedDate: '2025-01-14',
      reportedBy: 'Shipping Team',
      assignedTo: 'Production Supervisor',
      resolution: 'Replacement item produced and shipped',
      images: [],
      reproductionStatus: 'reproduction_complete',
      completionDate: '2025-01-18',
      netSuiteId: 'NS-37483588',
      itemInternalId: '133940',
      salesOrderNumber: 'SO2508461',
      poNumber: 'PO125',
      factory: 'Shanghai Bags',
      customer: 'Emma Davis',
      productName: 'Custom Natural Tote - Multi-pack',
      reproductionItems: 1,
      reproducer: 'Production Line 2'
    },
    {
      id: 'DEF-1004',
      mtoId: 'MTO-2025-01-0004',
      soReference: 'SO-50004',
      barcode: 'BC1234567893',
      qrCode: 'QR1234567893',
      type: 'quality',
      category: 'Quality Issue',
      severity: 'medium',
      status: 'in_reproduction',
      description: 'Color variation in bag material from approved sample',
      reportedDate: '2025-01-17',
      reportedBy: 'Brand QA',
      assignedTo: 'Material Specialist',
      resolution: '',
      images: ['color_variation_1.jpg', 'color_variation_2.jpg'],
      reproductionStatus: 'in_progress',
      netSuiteId: 'NS-37483589',
      itemInternalId: '133941',
      salesOrderNumber: 'SO2508462',
      poNumber: 'PO126',
      factory: 'GZ Totes',
      customer: 'Alex Wilson',
      productName: 'Premium Canvas Tote',
      reproductionItems: 3,
      reproducer: 'QC Team Lead'
    }
  ]

  const defectTypes = [
    { id: 'defect_embroidery', label: 'Embroidery Defect', icon: AlertCircle },
    { id: 'defect_bag', label: 'Bag Production Defect', icon: AlertTriangle },
    { id: 'missing', label: 'Missing Items', icon: Package },
    { id: 'quality', label: 'Quality Issue', icon: Eye },
    { id: 'damage', label: 'Shipping Damage', icon: Truck }
  ]

  const filteredDefects = useMemo(() => {
    return sampleDefects.filter(defect => {
      const matchesSearch = defect.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           defect.mtoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           defect.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           defect.customer.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSeverity = filterSeverity === 'all' || defect.severity === filterSeverity
      const matchesStatus = filterStatus === 'all' || defect.status === filterStatus

      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [sampleDefects, searchTerm, filterSeverity, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'investigating': return 'bg-blue-100 text-blue-800'
      case 'in_reproduction': return 'bg-purple-100 text-purple-800'
      case 'open': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDefectIcon = (type: string) => {
    const defectType = defectTypes.find(dt => dt.id === type)
    return defectType?.icon || AlertTriangle
  }

  const recentActivity = [
    { id: 1, type: 'defect_reported', message: 'New embroidery defect reported for MTO-001', time: '2 hours ago', defect: 'DEF-1001' },
    { id: 2, type: 'defect_resolved', message: 'DEF-1003 resolved - replacement shipped', time: '1 day ago', defect: 'DEF-1003' },
    { id: 3, type: 'reproduction_started', message: 'Reproduction started for DEF-1004', time: '4 hours ago', defect: 'DEF-1004' },
    { id: 4, type: 'defect_escalated', message: 'DEF-1002 escalated to critical priority', time: '6 hours ago', defect: 'DEF-1002' }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'defect_reported': return <AlertTriangle size={16} className="text-red-600" />
      case 'defect_resolved': return <CheckCircle2 size={16} className="text-green-600" />
      case 'reproduction_started': return <RefreshCw size={16} className="text-blue-600" />
      case 'defect_escalated': return <TrendingUp size={16} className="text-orange-600" />
      default: return <Clock size={16} className="text-gray-600" />
    }
  }

  const handleChatClick = (defect: Defect) => {
    console.log('Opening chat for defect:', defect.id)
  }

  const handleReportDefect = () => {
    setShowReportModal(true)
  }

  const handleSubmitReport = () => {
    console.log('Submitting defect report:', newDefectReport)
    setShowReportModal(false)
    setNewDefectReport({
      mtoId: '',
      type: '',
      category: '',
      severity: 'medium',
      description: '',
      images: []
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Defect Management</h1>
          <p className="text-gray-600">Track and manage quality issues and defect reports</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleReportDefect}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Report Defect
          </button>
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
              <p className="text-sm font-medium text-gray-600">Total Defects</p>
              <p className="text-2xl font-bold text-gray-900">{defectStats.totalDefects}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Defects</p>
              <p className="text-2xl font-bold text-red-600">{defectStats.openDefects}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{defectStats.inProgress}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <RefreshCw className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{defectStats.resolved}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{defectStats.critical}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Repro Rate</p>
              <p className="text-2xl font-bold text-green-600">{defectStats.reproductionRate}%</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
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
              { id: 'active', label: 'Active Defects', icon: AlertTriangle },
              { id: 'reproduction', label: 'Reproduction', icon: RefreshCw },
              { id: 'resolved', label: 'Resolved', icon: CheckCircle2 }
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

              {/* Defect Categories Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Defect Categories</h4>
                  <div className="space-y-3">
                    {defectTypes.map((type) => {
                      const count = sampleDefects.filter(d => d.type === type.id).length
                      const percentage = sampleDefects.length > 0 ? (count / sampleDefects.length) * 100 : 0
                      const Icon = type.icon
                      return (
                        <div key={type.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon size={16} className="text-gray-600" />
                            <span className="text-sm text-gray-900">{type.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Resolution Performance</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Resolution Time</span>
                      <span className="text-sm font-semibold text-gray-900">3.2 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reproduction Success Rate</span>
                      <span className="text-sm font-semibold text-green-600">{defectStats.reproductionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <span className="text-sm font-semibold text-green-600">96.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'active' || activeTab === 'reproduction' || activeTab === 'resolved') && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search by ID, MTO, customer, or description..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="in_reproduction">In Reproduction</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Defects Table */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defect ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MTO</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDefects.map((defect) => {
                      const DefectIcon = getDefectIcon(defect.type)
                      return (
                        <tr key={defect.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {defect.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {defect.mtoId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <DefectIcon size={16} className="text-gray-600" />
                              <span className="text-sm text-gray-900">{defect.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(defect.severity)}`}>
                              {defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(defect.status)}`}>
                              {defect.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {defect.customer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {defect.reportedDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedDefect(defect)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleChatClick(defect)}
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
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Defect Details Modal */}
      {selectedDefect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Defect Details - {selectedDefect.id}</h2>
                <button
                  onClick={() => setSelectedDefect(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Defect Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="text-sm text-gray-900">{selectedDefect.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Severity</dt>
                      <dd>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedDefect.severity)}`}>
                          {selectedDefect.severity.charAt(0).toUpperCase() + selectedDefect.severity.slice(1)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDefect.status)}`}>
                          {selectedDefect.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-900">{selectedDefect.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Reported By</dt>
                      <dd className="text-sm text-gray-900">{selectedDefect.reportedBy}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                      <dd className="text-sm text-gray-900">{selectedDefect.assignedTo}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">MTO ID</dt>
                      <dd className="text-sm text-gray-900">{selectedDefect.mtoId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Product</dt>
                      <dd className="text-sm text-gray-900">{selectedDefect.productName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Customer</dt>
                      <dd className="text-sm text-gray-900">{selectedDefect.customer}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Factory</dt>
                      <dd className="text-sm text-gray-900">{selectedDefect.factory}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">PO Number</dt>
                      <dd className="text-sm text-gray-900">{selectedDefect.poNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">SO Reference</dt>
                      <dd className="text-sm text-gray-900">{selectedDefect.soReference}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {selectedDefect.reproductionStatus !== 'pending' && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Reproduction Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="text-sm text-gray-900">{selectedDefect.reproductionStatus.replace('_', ' ')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Items</dt>
                        <dd className="text-sm text-gray-900">{selectedDefect.reproductionItems || 0}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Reproducer</dt>
                        <dd className="text-sm text-gray-900">{selectedDefect.reproducer || '—'}</dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedDefect.resolution && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Resolution</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedDefect.resolution}</p>
                    {selectedDefect.completionDate && (
                      <p className="text-xs text-gray-500 mt-2">Completed on {selectedDefect.completionDate}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Defect Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Report New Defect</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MTO ID</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newDefectReport.mtoId}
                  onChange={(e) => setNewDefectReport({...newDefectReport, mtoId: e.target.value})}
                  placeholder="Enter MTO ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Defect Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newDefectReport.type}
                  onChange={(e) => {
                    const selectedType = defectTypes.find(t => t.id === e.target.value)
                    setNewDefectReport({
                      ...newDefectReport, 
                      type: e.target.value,
                      category: selectedType?.label || ''
                    })
                  }}
                >
                  <option value="">Select defect type</option>
                  {defectTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newDefectReport.severity}
                  onChange={(e) => setNewDefectReport({...newDefectReport, severity: e.target.value as any})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  value={newDefectReport.description}
                  onChange={(e) => setNewDefectReport({...newDefectReport, description: e.target.value})}
                  placeholder="Describe the defect in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">Drop images here or click to upload</p>
                  <button className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                    Choose Files
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Defects
