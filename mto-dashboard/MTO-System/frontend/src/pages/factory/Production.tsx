import React, { useState, useEffect, useMemo } from 'react'
import { mtoService } from '../../services/mto.service'
import { useAuth } from '../../contexts/AuthContext'
import { useChat } from '../../contexts/ChatContext'
import { ChatPanel } from '../../components/chat/ChatPanel'
import { 
  Calendar, 
  Package, 
  Filter, 
  Search, 
  ChevronRight,
  ChevronDown,
  Users, 
  Target, 
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart3,
  Activity,
  ArrowUp,
  ArrowDown,
  Layers,
  MessageCircle
} from 'lucide-react'

interface MTOSummary {
  month: string
  monthKey: string
  totalMTOs: number
  completedMTOs: number
  inProgressMTOs: number
  days: DailySummary[]
}

interface DailySummary {
  date: string
  dateKey: string
  totalLines: number
  completedLines: number
  inProgressLines: number
  urgentLines: number
  mtoLines: MTOLine[]
}

interface MTOLine {
  id: string
  mtoId: string
  lineNumber: string
  brand: string
  sku: string
  description: string
  quantity: number
  completedQuantity: number
  stage: 'received' | 'customizing' | 'qc' | 'packing' | 'ready_to_ship' | 'shipped'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  dueDate: string
  assignedWorker?: string
  estimatedHours: number
  actualHours: number
}

const Production: React.FC = () => {
  const { user } = useAuth()
  const { buildMTOChatId, openChat, closeChat, chatState } = useChat()
  const [mtoSummaries, setMtoSummaries] = useState<MTOSummary[]>([])
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'quantity'>('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchMTOData()
    const interval = setInterval(fetchMTOData, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchMTOData = async () => {
    try {
      // Generate sample hierarchical MTO data
      const today = new Date()
      const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      const currentMonthKey = `${today.getFullYear()}-${today.getMonth() + 1}`
      
      const sampleMTOLines: MTOLine[] = Array.from({ length: 150 }, (_, i) => ({
        id: `line-${i + 1}`,
        mtoId: `MTO-${Math.floor(i / 10) + 1}`,
        lineNumber: `L${(i % 10) + 1}`,
        brand: ['Nike', 'Adidas', 'Puma', 'Under Armour'][Math.floor(Math.random() * 4)],
        sku: `SKU${1000 + i}`,
        description: ['Athletic Shoes', 'Running Sneakers', 'Basketball Shoes', 'Casual Sneakers'][Math.floor(Math.random() * 4)],
        quantity: Math.floor(Math.random() * 500) + 100,
        completedQuantity: Math.floor(Math.random() * 400),
        stage: ['received', 'customizing', 'qc', 'packing', 'ready_to_ship', 'shipped'][Math.floor(Math.random() * 6)] as any,
        priority: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
        dueDate: new Date(today.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignedWorker: `Worker ${Math.floor(Math.random() * 20) + 1}`,
        estimatedHours: Math.floor(Math.random() * 8) + 2,
        actualHours: Math.floor(Math.random() * 10)
      }))

      // Group by days (showing current week)
      const days: DailySummary[] = Array.from({ length: 7 }, (_, dayOffset) => {
        const date = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000)
        const dateKey = date.toISOString().split('T')[0]
        const dayLines = sampleMTOLines.filter((_, i) => i % 7 === dayOffset)
        
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
          dateKey,
          totalLines: dayLines.length,
          completedLines: dayLines.filter(line => line.stage === 'shipped').length,
          inProgressLines: dayLines.filter(line => !['shipped', 'received'].includes(line.stage)).length,
          urgentLines: dayLines.filter(line => line.priority === 'urgent').length,
          mtoLines: dayLines
        }
      })

      const monthSummary: MTOSummary = {
        month: currentMonth,
        monthKey: currentMonthKey,
        totalMTOs: 15,
        completedMTOs: 8,
        inProgressMTOs: 7,
        days
      }

      setMtoSummaries([monthSummary])
      setExpandedMonths(new Set([currentMonthKey]))
    } catch (error) {
      console.error('Error fetching MTO data:', error)
    }
  }

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey)
    } else {
      newExpanded.add(monthKey)
    }
    setExpandedMonths(newExpanded)
  }

  const toggleDay = (dateKey: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey)
    } else {
      newExpanded.add(dateKey)
    }
    setExpandedDays(newExpanded)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'received': return 'bg-gray-100 text-gray-800'
      case 'customizing': return 'bg-blue-100 text-blue-800'
      case 'qc': return 'bg-yellow-100 text-yellow-800'
      case 'packing': return 'bg-purple-100 text-purple-800'
      case 'ready_to_ship': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const filteredAndSortedLines = useMemo(() => {
    let allLines: MTOLine[] = []
    mtoSummaries.forEach(month => {
      month.days.forEach(day => {
        if (expandedDays.has(day.dateKey)) {
          allLines = [...allLines, ...day.mtoLines]
        }
      })
    })

    // Apply filters
    let filtered = allLines.filter(line => {
      const matchesStage = selectedStage === 'all' || line.stage === selectedStage
      const matchesPriority = selectedPriority === 'all' || line.priority === selectedPriority
      const matchesSearch = searchTerm === '' || 
        line.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.mtoId.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStage && matchesPriority && matchesSearch
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
        case 'quantity':
          comparison = a.quantity - b.quantity
          break
        default:
          comparison = 0
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [mtoSummaries, expandedDays, selectedStage, selectedPriority, searchTerm, sortBy, sortOrder])

  const totalStats = useMemo(() => {
    const allLines: MTOLine[] = []
    mtoSummaries.forEach(month => {
      month.days.forEach(day => {
        allLines.push(...day.mtoLines)
      })
    })

    return {
      totalLines: allLines.length,
      urgentLines: allLines.filter(line => line.priority === 'urgent').length,
      overdueLines: allLines.filter(line => new Date(line.dueDate) < new Date()).length,
      completedToday: allLines.filter(line => line.stage === 'shipped').length,
      inProgress: allLines.filter(line => !['received', 'shipped'].includes(line.stage)).length
    }
  }, [mtoSummaries])

  const handleChatClick = async (line: MTOLine, day: DailySummary) => {
    const chatId = buildMTOChatId({
      level: 'SP',
      mtoId: line.mtoId,
      internalId: line.id
    })
    
    try {
      await openChat(chatId)
    } catch (error) {
      console.error('Failed to open chat:', error)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factory Production Management</h1>
          <p className="text-gray-600">Manage thousands of MTO lines efficiently with smart filtering and bulk actions</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Last updated: {new Date().toLocaleTimeString()}</div>
          <div className="mt-1 font-medium text-gray-900">
            {filteredAndSortedLines.length} of {totalStats.totalLines} lines shown
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Lines</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{totalStats.totalLines.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Urgent</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{totalStats.urgentLines}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Overdue</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-orange-600">{totalStats.overdueLines}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">In Progress</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600">{totalStats.inProgress}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Completed Today</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600">{totalStats.completedToday}</div>
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
                placeholder="Search by SKU, Brand, Description, or MTO ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            <option value="received">Received</option>
            <option value="customizing">Customizing</option>
            <option value="qc">Quality Check</option>
            <option value="packing">Packing</option>
            <option value="ready_to_ship">Ready to Ship</option>
            <option value="shipped">Shipped</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="quantity">Quantity</option>
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

      {/* Hierarchical MTO Structure */}
      <div className="space-y-4">
        {mtoSummaries.map(month => (
          <div key={month.monthKey} className="bg-white rounded-lg shadow-sm border">
            {/* Month Header */}
            <div 
              className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleMonth(month.monthKey)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {expandedMonths.has(month.monthKey) ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{month.month}</h3>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <span className="text-gray-600">
                    {month.completedMTOs}/{month.totalMTOs} MTOs completed
                  </span>
                  <span className="text-gray-600">
                    {month.inProgressMTOs} in progress
                  </span>
                </div>
              </div>
            </div>

            {/* Days */}
            {expandedMonths.has(month.monthKey) && (
              <div className="divide-y">
                {month.days.map(day => (
                  <div key={day.dateKey}>
                    {/* Day Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleDay(day.dateKey)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {expandedDays.has(day.dateKey) ? 
                            <ChevronDown className="w-4 h-4 text-gray-400 ml-6" /> : 
                            <ChevronRight className="w-4 h-4 text-gray-400 ml-6" />
                          }
                          <Package className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-gray-900">{day.date}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                            {day.totalLines} lines
                          </span>
                          {day.urgentLines > 0 && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              {day.urgentLines} urgent
                            </span>
                          )}
                          <span className="text-gray-600">
                            {day.completedLines}/{day.totalLines} completed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* MTO Lines Table */}
                    {expandedDays.has(day.dateKey) && (
                      <div className="px-4 pb-4">
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MTO ID</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {day.mtoLines
                                  .filter(line => {
                                    const matchesStage = selectedStage === 'all' || line.stage === selectedStage
                                    const matchesPriority = selectedPriority === 'all' || line.priority === selectedPriority
                                    const matchesSearch = searchTerm === '' || 
                                      line.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      line.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      line.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      line.mtoId.toLowerCase().includes(searchTerm.toLowerCase())
                                    return matchesStage && matchesPriority && matchesSearch
                                  })
                                  .slice(0, 50) // Limit to 50 lines per day for performance
                                  .map(line => (
                                  <tr key={line.id} className="hover:bg-white transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{line.mtoId}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{line.lineNumber}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{line.brand}</td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{line.sku}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 max-w-48 truncate">{line.description}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{line.quantity.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStageColor(line.stage)}`}>
                                        {line.stage.replace('_', ' ')}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(line.priority)}`}>
                                        {line.priority}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(line.dueDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                          <div 
                                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                                            style={{ width: `${(line.completedQuantity / line.quantity) * 100}%` }}
                                          />
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {Math.round((line.completedQuantity / line.quantity) * 100)}%
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <button
                                        onClick={() => handleChatClick(line, day)}
                                        className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                                        title={`Chat for ${line.mtoId} Line ${line.lineNumber}`}
                                      >
                                        <MessageCircle className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {day.mtoLines.length > 50 && (
                              <div className="px-4 py-3 text-center text-sm text-gray-500 bg-gray-50 border-t">
                                Showing first 50 of {day.mtoLines.length} lines. Use filters to narrow down results.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAndSortedLines.length === 0 && searchTerm && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}

    </div>
  )
}

export default Production
