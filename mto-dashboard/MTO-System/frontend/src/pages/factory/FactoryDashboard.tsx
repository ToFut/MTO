import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Building2, Warehouse, Truck, AlertTriangle, Loader2 } from 'lucide-react'
import { mtoService } from '../../services/mto.service'
import { assignmentService } from '../../services/assignment.service'
import { defectService } from '../../services/defect.service'
import { inventoryService } from '../../services/inventory.service'
import { useAuth } from '../../contexts/AuthContext'

const FactoryDashboard: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { name: 'Daily MTOs', value: '0', change: '+0%', changeType: 'neutral' as 'increase' | 'decrease' | 'neutral' },
    { name: 'Monthly MTOs', value: '0', change: '+0%', changeType: 'neutral' as 'increase' | 'decrease' | 'neutral' },
    { name: 'In Production', value: '0', change: '+0%', changeType: 'neutral' as 'increase' | 'decrease' | 'neutral' },
    { name: 'QC Pending', value: '0', change: '+0%', changeType: 'neutral' as 'increase' | 'decrease' | 'neutral' },
  ])
  const [productionData, setProductionData] = useState<any>({})
  const [urgentItems, setUrgentItems] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user?.companyId) return
    
    setLoading(true)
    try {
      // Fetch assignments for this factory
      const [assignments, defects, inventory] = await Promise.all([
        assignmentService.getAssignments({ 
          factoryId: user.companyId || undefined,
          limit: 100 
        }),
        defectService.getDefects({
          factoryId: user.companyId || undefined,
          resolved: false,
          limit: 20
        }),
        inventoryService.getShortageAlerts({
          factoryId: user.companyId || undefined
        })
      ])

      // Calculate daily and monthly MTOs
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0))
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      
      const dailyMTOs = assignments.data.filter(a => 
        new Date(a.created_at) >= startOfDay
      ).length
      
      const monthlyMTOs = assignments.data.filter(a => 
        new Date(a.created_at) >= startOfMonth
      ).length

      const inProduction = assignments.data.filter(a => 
        a.status === 'in_production' || a.status === 'accepted'
      ).length

      const qcPending = defects.data.filter(d => !d.resolved_at).length

      // Update stats
      setStats([
        { 
          name: 'Daily MTOs', 
          value: dailyMTOs.toString(), 
          change: '+0%', 
          changeType: 'neutral' 
        },
        { 
          name: 'Monthly MTOs', 
          value: monthlyMTOs.toString(), 
          change: '+0%', 
          changeType: 'neutral' 
        },
        { 
          name: 'In Production', 
          value: inProduction.toString(), 
          change: '+0%', 
          changeType: 'neutral' 
        },
        { 
          name: 'QC Pending', 
          value: qcPending.toString(), 
          change: defects.total > 0 ? '-5%' : '+0%', 
          changeType: defects.total > 0 ? 'decrease' : 'neutral' 
        },
      ])

      // Get production statistics
      const prodStats = await assignmentService.getStatistics({
        factoryId: user.companyId || undefined
      })
      
      setProductionData({
        cutting: assignments.data.filter(a => a.status === 'in_production').length,
        sewing: Math.floor(assignments.data.filter(a => a.status === 'in_production').length * 0.8),
        embroidery: Math.floor(assignments.data.filter(a => a.status === 'in_production').length * 0.6),
        qc: qcPending,
        packing: assignments.data.filter(a => a.status === 'completed').length
      })

      // Get urgent items
      const overdueAssignments = await assignmentService.getOverdueAssignments({
        factoryId: user.companyId || undefined
      })

      const urgentList = [
        ...overdueAssignments.slice(0, 2).map(a => ({
          type: 'mto',
          id: a.mto_id,
          message: 'Rush order',
          severity: 'high',
          dueText: 'Due today'
        })),
        ...inventory.slice(0, 1).map(i => ({
          type: 'inventory',
          id: i.sku,
          message: `Inventory shortage: ${i.name}`,
          severity: 'medium',
          dueText: 'Order needed'
        }))
      ]
      
      setUrgentItems(urgentList)
    } catch (error) {
      console.error('Error fetching factory dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { name: 'Production Workboard', href: '/factory/workboard', icon: ClipboardList, color: 'bg-blue-500' },
    { name: 'Production Floor', href: '/factory/production', icon: Building2, color: 'bg-green-500' },
    { name: 'Inventory Status', href: '/factory/inventory', icon: Warehouse, color: 'bg-purple-500' },
    { name: 'Shipping Queue', href: '/factory/shipping', icon: Truck, color: 'bg-orange-500' },
    { name: 'Defect Reports', href: '/factory/defects', icon: AlertTriangle, color: 'bg-red-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Factory Dashboard</h1>
        <p className="text-gray-600">Monitor production progress and manage daily operations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border">
            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
            <dd className={`mt-1 text-sm ${
              stat.changeType === 'increase' ? 'text-green-600' : 
              stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {stat.change} from last week
            </dd>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.name}
                to={action.href}
                className="relative group bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div>
                  <span className={`${action.color} rounded-lg inline-flex p-3 text-white`}>
                    <Icon size={24} />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                    {action.name}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Production Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Today's Production</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cutting</span>
                <span className="text-sm font-medium text-gray-900">{productionData.cutting || 0} MTOs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sewing</span>
                <span className="text-sm font-medium text-gray-900">{productionData.sewing || 0} MTOs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Embroidery</span>
                <span className="text-sm font-medium text-gray-900">{productionData.embroidery || 0} MTOs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">QC</span>
                <span className="text-sm font-medium text-gray-900">{productionData.qc || 0} MTOs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Packing</span>
                <span className="text-sm font-medium text-gray-900">{productionData.packing || 0} MTOs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Urgent Items</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {urgentItems.length > 0 ? (
                urgentItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.severity === 'high' ? 'bg-red-500' :
                      item.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm text-gray-900">
                      {item.type === 'mto' ? item.id : ''} {item.message}
                    </span>
                    <span className={`text-xs ${
                      item.severity === 'high' ? 'text-red-600' :
                      item.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {item.dueText}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No urgent items at this time</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FactoryDashboard