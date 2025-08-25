import React, { useState, useEffect } from 'react'
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Calendar,
  Package,
  ChevronRight,
  ChevronDown,
  BarChart3,
  MapPin,
  Users,
  Activity,
  Target,
  Star,
  Camera,
  Music,
  Coffee,
  Heart,
  Sun,
  Crown,
  Gift,
  MessageCircle,
  Eye,
  Settings
} from 'lucide-react'
import { assignmentService, Assignment } from '../../services/assignment.service'
import { mtoService } from '../../services/mto.service'
import { useAuth } from '../../contexts/AuthContext'

interface WorkboardColumn {
  id: string
  title: string
  status: Assignment['status'][]
  color: string
  icon: React.ElementType
}

const Workboard: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [mtoData, setMtoData] = useState<Record<string, any>>({})
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [filter, setFilter] = useState({
    priority: '',
    overdue: false
  })
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline' | 'stations'>('timeline')
  const [expandedStations, setExpandedStations] = useState<Set<string>>(new Set(['station-1']))
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set(['2025-01']))
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedStation, setSelectedStation] = useState<string>('all')

  const columns: WorkboardColumn[] = [
    {
      id: 'pending',
      title: 'Pending',
      status: ['pending'],
      color: 'bg-gray-100',
      icon: Clock
    },
    {
      id: 'accepted',
      title: 'Accepted',
      status: ['accepted'],
      color: 'bg-blue-100',
      icon: CheckCircle
    },
    {
      id: 'production',
      title: 'In Production',
      status: ['in_production'],
      color: 'bg-yellow-100',
      icon: ClipboardList
    },
    {
      id: 'completed',
      title: 'Completed',
      status: ['completed'],
      color: 'bg-green-100',
      icon: Package
    }
  ]

  const stations = [
    { id: 'station-1', name: 'Material Prep Station', icon: Package, color: 'bg-blue-100' },
    { id: 'station-2', name: 'Customization Station', icon: Star, color: 'bg-purple-100' },
    { id: 'station-3', name: 'QC Station', icon: CheckCircle, color: 'bg-green-100' },
    { id: 'station-4', name: 'Packaging Station', icon: Package, color: 'bg-yellow-100' },
    { id: 'station-5', name: 'XF Transfer Station', icon: Activity, color: 'bg-orange-100' }
  ]

  useEffect(() => {
    fetchAssignments()
  }, [user, filter])

  const fetchAssignments = async () => {
    if (!user?.companyId) return
    
    setLoading(true)
    try {
      const response = await assignmentService.getAssignments({
        factoryId: user.companyId || undefined,
        priority: filter.priority || undefined,
        overdue: filter.overdue || undefined,
        limit: 100
      })
      
      setAssignments(response.data)
      
      // Fetch MTO details for each assignment
      const mtoIds = [...new Set(response.data.map(a => a.mto_id))]
      const mtoDetails: Record<string, any> = {}
      
      for (const mtoId of mtoIds) {
        try {
          const mto = await mtoService.getMTO(mtoId)
          mtoDetails[mtoId] = mto
        } catch (error) {
          console.error(`Error fetching MTO ${mtoId}:`, error)
        }
      }
      
      setMtoData(mtoDetails)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptAssignment = async (assignment: Assignment) => {
    try {
      await assignmentService.acceptAssignment(assignment.id)
      await fetchAssignments()
    } catch (error) {
      console.error('Error accepting assignment:', error)
    }
  }

  const handleRejectAssignment = async (assignment: Assignment, reason: string) => {
    try {
      await assignmentService.rejectAssignment(assignment.id, reason)
      await fetchAssignments()
    } catch (error) {
      console.error('Error rejecting assignment:', error)
    }
  }

  const handleUpdateProgress = async (assignment: Assignment, status: Assignment['status']) => {
    try {
      await assignmentService.updateAssignment(assignment.id, { status })
      await fetchAssignments()
    } catch (error) {
      console.error('Error updating assignment:', error)
    }
  }

  const getAssignmentsByStatus = (statuses: Assignment['status'][]) => {
    return assignments.filter(a => statuses.includes(a.status))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'normal': return 'text-blue-600 bg-blue-100'
      case 'low': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Workboard</h1>
          <p className="text-gray-600">Manage MTO assignments and track production progress.</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filter.overdue}
              onChange={(e) => setFilter({ ...filter, overdue: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show Overdue Only</span>
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const Icon = column.icon
          const columnAssignments = getAssignmentsByStatus(column.status)
          
          return (
            <div key={column.id} className={`${column.color} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Icon className="h-5 w-5 mr-2" />
                  {column.title}
                </h3>
                <span className="text-sm text-gray-600">
                  {columnAssignments.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {columnAssignments.map((assignment) => {
                  const mto = mtoData[assignment.mto_id]
                  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
                  
                  return (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedAssignment(assignment)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm text-gray-900">
                          {mto?.mto_number || assignment.mto_id}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority}
                        </span>
                      </div>
                      
                      {mto && (
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Style: {mto.style_number}</div>
                          <div>Qty: {mto.total_quantity}</div>
                        </div>
                      )}
                      
                      {assignment.due_date && (
                        <div className={`flex items-center mt-2 text-xs ${
                          isOverdue ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(assignment.due_date).toLocaleDateString()}
                          {isOverdue && <AlertCircle className="h-3 w-3 ml-1" />}
                        </div>
                      )}
                      
                      {column.id === 'pending' && (
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAcceptAssignment(assignment)
                            }}
                            className="flex-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const reason = prompt('Rejection reason:')
                              if (reason) handleRejectAssignment(assignment, reason)
                            }}
                            className="flex-1 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {column.id === 'accepted' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateProgress(assignment, 'in_production')
                          }}
                          className="w-full mt-3 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center justify-center"
                        >
                          Start Production
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </button>
                      )}
                      
                      {column.id === 'production' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateProgress(assignment, 'completed')
                          }}
                          className="w-full mt-3 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center justify-center"
                        >
                          Mark Complete
                          <CheckCircle className="h-3 w-3 ml-1" />
                        </button>
                      )}
                    </div>
                  )
                })}
                
                {columnAssignments.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No assignments
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Assignment Details</h2>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">MTO ID</label>
                  <p className="text-gray-900">{selectedAssignment.mto_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="text-gray-900 capitalize">{selectedAssignment.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <p className="text-gray-900 capitalize">{selectedAssignment.priority}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Due Date</label>
                  <p className="text-gray-900">
                    {selectedAssignment.due_date 
                      ? new Date(selectedAssignment.due_date).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
              </div>
              
              {selectedAssignment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-gray-900 mt-1">{selectedAssignment.notes}</p>
                </div>
              )}
              
              {selectedAssignment.rejection_reason && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Rejection Reason</label>
                  <p className="text-red-600 mt-1">{selectedAssignment.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Workboard