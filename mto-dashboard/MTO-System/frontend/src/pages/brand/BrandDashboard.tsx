import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Upload, Warehouse, Truck, AlertTriangle, BarChart3, Loader2 } from 'lucide-react'
import { mtoService } from '../../services/mto.service'
import { useAuth } from '../../contexts/AuthContext'

const BrandDashboard: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch MTO statistics
      const stats = await mtoService.getStatistics({
        brandId: user?.companyId
      })
      setStatistics(stats)
      
      // Fetch recent upload history
      const history = await mtoService.getUploadHistory({
        brandId: user?.companyId,
        limit: 5,
        offset: 0
      })
      
      // Transform history to activity format
      const activities = history.data.map((item: any) => ({
        id: item.id,
        type: 'upload',
        message: `${item.po?.po_number || 'PO'} uploaded - ${item.total_mtos || 0} MTOs`,
        time: new Date(item.created_at).toLocaleTimeString(),
        date: new Date(item.created_at).toLocaleDateString(),
        color: 'bg-green-500'
      }))
      
      setRecentActivity(activities)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = loading ? [] : [
    { 
      name: 'Total MTOs', 
      value: statistics?.total?.toString() || '0', 
      change: 'Overall', 
      changeType: 'neutral' as 'increase' | 'decrease' | 'neutral'
    },
    { 
      name: 'In Production', 
      value: ((statistics?.byStatus?.proceed || 0) + (statistics?.byStatus?.qc || 0)).toString(), 
      change: `${statistics?.urgentCount || 0} urgent`, 
      changeType: (statistics?.urgentCount > 0 ? 'increase' : 'neutral') as 'increase' | 'decrease' | 'neutral'
    },
    { 
      name: 'Ready to Ship', 
      value: (statistics?.byStatus?.shipping || 0).toString(), 
      change: `${statistics?.completionRate || 0}% complete`, 
      changeType: 'neutral' as 'increase' | 'decrease' | 'neutral'
    },
    { 
      name: 'Daily Production', 
      value: (statistics?.dailyCount || 0).toString(), 
      change: 'Need immediate attention', 
      changeType: (statistics?.dailyCount > 0 ? 'increase' : 'neutral') as 'increase' | 'decrease' | 'neutral'
    },
  ]

  const quickActions = [
    { name: 'Upload PO/MTO', href: '/brand/upload', icon: Upload, color: 'bg-blue-500' },
    { name: 'View MTOs', href: '/brand/mtos', icon: Package, color: 'bg-green-500' },
    { name: 'Check Inventory', href: '/brand/inventory', icon: Warehouse, color: 'bg-purple-500' },
    { name: 'Shipping Status', href: '/brand/shipping', icon: Truck, color: 'bg-orange-500' },
    { name: 'Defect Reports', href: '/brand/defects', icon: AlertTriangle, color: 'bg-red-500' },
    { name: 'Analytics', href: '/brand/analytics', icon: BarChart3, color: 'bg-indigo-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Brand Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your orders.</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border">
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
              <dd className={`mt-1 text-sm ${
                stat.changeType === 'increase' ? 'text-orange-600' : 
                stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </dd>
            </div>
          ))}
        </div>
      )}

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

      {/* Recent Activity */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                  <span className="text-sm text-gray-900 flex-1">{activity.message}</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">{activity.time}</span>
                    <span className="text-xs text-gray-400">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <p className="text-sm">No recent activity</p>
              <Link to="/brand/upload" className="text-indigo-600 hover:text-indigo-500 text-sm mt-2 inline-block">
                Upload your first MTO →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrandDashboard