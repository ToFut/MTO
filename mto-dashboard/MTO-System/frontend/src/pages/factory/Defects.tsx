import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useChat } from '../../contexts/ChatContext'
import { ChatPanel } from '../../components/chat/ChatPanel'
import { 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Camera,
  FileText,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Eye,
  MessageCircle,
  Send,
  BarChart3,
  Package,
  Shield,
  Zap
} from 'lucide-react'

interface DefectReport {
  id: string
  mtoId: string
  lineNumber: string
  brand: string
  sku: string
  defectType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'reported' | 'under_review' | 'in_progress' | 'resolved' | 'closed'
  description: string
  reportedBy: string
  assignedTo?: string
  reportedAt: string
  resolvedAt?: string
  defectCategory: string
  affectedQuantity: number
  totalQuantity: number
  rootCause?: string
  correctiveAction?: string
  preventiveAction?: string
  photos: string[]
  estimatedCost: number
  actualCost?: number
  location: string
  workstation: string
}

interface DefectStats {
  totalReports: number
  openReports: number
  resolvedReports: number
  criticalReports: number
  defectRate: number
  avgResolutionTime: number
  totalCost: number
}

const Defects: React.FC = () => {
  const { user } = useAuth()
  const { buildDefectChatId, openChat, closeChat, chatState } = useChat()
  const [defectReports, setDefectReports] = useState<DefectReport[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'reportedAt' | 'severity' | 'status' | 'cost'>('reportedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedDefect, setSelectedDefect] = useState<DefectReport | null>(null)

  useEffect(() => {
    fetchDefectsData()
    const interval = setInterval(fetchDefectsData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDefectsData = async () => {
    try {
      const sampleDefects: DefectReport[] = Array.from({ length: 60 }, (_, i) => {
        const reportedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        const isResolved = Math.random() > 0.4
        const resolvedAt = isResolved ? new Date(reportedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined
        const affectedQty = Math.floor(Math.random() * 50) + 1
        const totalQty = Math.floor(Math.random() * 500) + 100
        
        return {
          id: `defect-${i + 1}`,
          mtoId: `MTO-${Math.floor(Math.random() * 50) + 1}`,
          lineNumber: `L${Math.floor(Math.random() * 20) + 1}`,
          brand: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance'][Math.floor(Math.random() * 5)],
          sku: `SKU${1000 + Math.floor(Math.random() * 200)}`,
          defectType: ['Stitching Issue', 'Color Mismatch', 'Size Variance', 'Material Defect', 'Print Quality', 'Logo Misalignment', 'Sole Separation', 'Hole/Tear'][Math.floor(Math.random() * 8)],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          status: isResolved ? 
            ['resolved', 'closed'][Math.floor(Math.random() * 2)] as any :
            ['reported', 'under_review', 'in_progress'][Math.floor(Math.random() * 3)] as any,
          description: ['Poor stitching quality on side seam', 'Color does not match approved sample', 'Size measurements outside tolerance', 'Material texture inconsistent'][Math.floor(Math.random() * 4)],
          reportedBy: `QC Inspector ${Math.floor(Math.random() * 10) + 1}`,
          assignedTo: Math.random() > 0.3 ? `Production Supervisor ${Math.floor(Math.random() * 5) + 1}` : undefined,
          reportedAt: reportedAt.toISOString(),
          resolvedAt: resolvedAt?.toISOString(),
          defectCategory: ['Production', 'Material', 'Design', 'Equipment', 'Process'][Math.floor(Math.random() * 5)],
          affectedQuantity: affectedQty,
          totalQuantity: totalQty,
          rootCause: isResolved ? ['Machine calibration', 'Material batch issue', 'Operator error', 'Process deviation', 'Tool wear'][Math.floor(Math.random() * 5)] : undefined,
          correctiveAction: isResolved ? ['Rework affected units', 'Replace materials', 'Retrain operator', 'Adjust process parameters'][Math.floor(Math.random() * 4)] : undefined,
          preventiveAction: isResolved ? ['Daily machine checks', 'Improved material inspection', 'Enhanced training program', 'Process documentation update'][Math.floor(Math.random() * 4)] : undefined,
          photos: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => `photo_${i}_${j}.jpg`),
          estimatedCost: Math.floor(Math.random() * 5000) + 100,
          actualCost: isResolved ? Math.floor(Math.random() * 5000) + 100 : undefined,
          location: `Warehouse ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}`,
          workstation: `Station ${Math.floor(Math.random() * 20) + 1}`
        }
      })

      setDefectReports(sampleDefects)
    } catch (error) {
      console.error('Error fetching defects data:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-red-100 text-red-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reported': return <AlertTriangle className="w-4 h-4" />
      case 'under_review': return <Eye className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'resolved': return <CheckCircle2 className="w-4 h-4" />
      case 'closed': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredAndSortedDefects = useMemo(() => {
    let filtered = defectReports.filter(defect => {
      const matchesSearch = searchTerm === '' ||
        defect.mtoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        defect.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        defect.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        defect.defectType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || defect.status === selectedStatus
      const matchesSeverity = selectedSeverity === 'all' || defect.severity === selectedSeverity
      const matchesCategory = selectedCategory === 'all' || defect.defectCategory === selectedCategory
      
      return matchesSearch && matchesStatus && matchesSeverity && matchesCategory
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'reportedAt':
          comparison = new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime()
          break
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          comparison = severityOrder[b.severity] - severityOrder[a.severity]
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'cost':
          comparison = (a.actualCost || a.estimatedCost) - (b.actualCost || b.estimatedCost)
          break
        default:
          comparison = 0
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [defectReports, searchTerm, selectedStatus, selectedSeverity, selectedCategory, sortBy, sortOrder])

  const defectStats = useMemo(() => {
    const totalReports = defectReports.length
    const openReports = defectReports.filter(d => !['resolved', 'closed'].includes(d.status)).length
    const resolvedReports = defectReports.filter(d => d.status === 'resolved').length
    const criticalReports = defectReports.filter(d => d.severity === 'critical').length
    const totalCost = defectReports.reduce((sum, d) => sum + (d.actualCost || d.estimatedCost), 0)
    
    const resolvedWithTime = defectReports.filter(d => d.resolvedAt)
    const avgResolutionTime = resolvedWithTime.length > 0 
      ? resolvedWithTime.reduce((sum, d) => {
          const reportTime = new Date(d.reportedAt).getTime()
          const resolveTime = new Date(d.resolvedAt!).getTime()
          return sum + (resolveTime - reportTime) / (24 * 60 * 60 * 1000) // days
        }, 0) / resolvedWithTime.length
      : 0
    
    const totalProduced = defectReports.reduce((sum, d) => sum + d.totalQuantity, 0)
    const totalDefective = defectReports.reduce((sum, d) => sum + d.affectedQuantity, 0)
    const defectRate = totalProduced > 0 ? (totalDefective / totalProduced) * 100 : 0
    
    return {
      totalReports,
      openReports,
      resolvedReports,
      criticalReports,
      defectRate: Math.round(defectRate * 100) / 100,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      totalCost
    }
  }, [defectReports])

  const categories = [...new Set(defectReports.map(d => d.defectCategory))]

  const handleChatClick = async (defect: DefectReport) => {
    const chatId = buildDefectChatId(defect.id, defect.mtoId)
    
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
          <h1 className="text-2xl font-bold text-gray-900">Factory Quality Control & Defects</h1>
          <p className="text-gray-600">Track and resolve quality issues with comprehensive defect management and chat support</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Last updated: {new Date().toLocaleTimeString()}</div>
          <div className="mt-1 font-medium text-gray-900">
            {filteredAndSortedDefects.length} of {defectStats.totalReports} defects shown
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Reports</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{defectStats.totalReports}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Open</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{defectStats.openReports}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Resolved</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600">{defectStats.resolvedReports}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Critical</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{defectStats.criticalReports}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Defect Rate</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-orange-600">{defectStats.defectRate}%</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Avg Resolution</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600">{defectStats.avgResolutionTime}d</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-600">Total Cost</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">${Math.round(defectStats.totalCost / 1000)}K</div>
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
                placeholder="Search by MTO ID, SKU, Brand, or Defect Type..."
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
            <option value="reported">Reported</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

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

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="reportedAt">Report Date</option>
              <option value="severity">Severity</option>
              <option value="status">Status</option>
              <option value="cost">Cost</option>
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

      {/* Defects Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Defect Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MTO</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defect Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affected Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedDefects.slice(0, 100).map(defect => (
                <React.Fragment key={defect.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{defect.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{defect.mtoId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{defect.brand}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{defect.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-32 truncate">{defect.defectType}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(defect.severity)}`}>
                        {defect.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(defect.status)}`}>
                        {getStatusIcon(defect.status)}
                        <span className="capitalize">{defect.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span className="text-red-600 font-medium">{defect.affectedQuantity}</span> / {defect.totalQuantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(defect.reportedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ${(defect.actualCost || defect.estimatedCost).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedDefect(defect)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleChatClick(defect)}
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
          {filteredAndSortedDefects.length > 100 && (
            <div className="px-4 py-3 text-center text-sm text-gray-500 bg-gray-50 border-t">
              Showing first 100 of {filteredAndSortedDefects.length} defects. Use filters to narrow down results.
            </div>
          )}
        </div>
      </div>

      {/* Defect Details Modal */}
      {selectedDefect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Defect Report Details</h3>
                  <p className="text-gray-600">{selectedDefect.id} - {selectedDefect.mtoId}</p>
                </div>
                <button
                  onClick={() => setSelectedDefect(null)}
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
                  <div className="text-sm text-blue-600 font-mono">{selectedDefect.mtoId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Line Number</label>
                  <div className="text-sm text-gray-900">{selectedDefect.lineNumber}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Brand</label>
                  <div className="text-sm text-gray-900">{selectedDefect.brand}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">SKU</label>
                  <div className="text-sm font-mono text-gray-900">{selectedDefect.sku}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Defect Type</label>
                  <div className="text-sm text-gray-900">{selectedDefect.defectType}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="text-sm text-gray-900">{selectedDefect.defectCategory}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Affected Quantity</label>
                  <div className="text-sm text-red-600 font-medium">{selectedDefect.affectedQuantity} / {selectedDefect.totalQuantity}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="text-sm text-gray-900">{selectedDefect.location}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Workstation</label>
                  <div className="text-sm text-gray-900">{selectedDefect.workstation}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reported By</label>
                  <div className="text-sm text-gray-900">{selectedDefect.reportedBy}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <div className="text-sm text-gray-900">{selectedDefect.assignedTo || 'Unassigned'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reported At</label>
                  <div className="text-sm text-gray-900">{new Date(selectedDefect.reportedAt).toLocaleString()}</div>
                </div>
                {selectedDefect.resolvedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Resolved At</label>
                    <div className="text-sm text-green-600">{new Date(selectedDefect.resolvedAt).toLocaleString()}</div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Estimated Cost</label>
                  <div className="text-sm text-gray-900">${selectedDefect.estimatedCost.toLocaleString()}</div>
                </div>
                {selectedDefect.actualCost && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Actual Cost</label>
                    <div className="text-sm text-red-600 font-medium">${selectedDefect.actualCost.toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedDefect.description}</div>
              </div>

              {selectedDefect.rootCause && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Root Cause</label>
                  <div className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-lg">{selectedDefect.rootCause}</div>
                </div>
              )}

              {selectedDefect.correctiveAction && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Corrective Action</label>
                  <div className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg">{selectedDefect.correctiveAction}</div>
                </div>
              )}

              {selectedDefect.preventiveAction && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Preventive Action</label>
                  <div className="text-sm text-gray-900 bg-green-50 p-3 rounded-lg">{selectedDefect.preventiveAction}</div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedDefect(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredAndSortedDefects.length === 0 && searchTerm && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No defect reports found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}

    </div>
  )
}

export default Defects
