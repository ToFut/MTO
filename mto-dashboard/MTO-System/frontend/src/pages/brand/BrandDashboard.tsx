import React from 'react'
import { Link } from 'react-router-dom'
import { Package, Upload, Warehouse, Truck, AlertTriangle, BarChart3 } from 'lucide-react'

const BrandDashboard: React.FC = () => {
  const stats = [
    { name: 'Total MTOs', value: '1,234', change: '+12%', changeType: 'increase' as const },
    { name: 'In Production', value: '456', change: '+8%', changeType: 'increase' as const },
    { name: 'Ready to Ship', value: '89', change: '-2%', changeType: 'decrease' as const },
    { name: 'Defects', value: '12', change: '+5%', changeType: 'increase' as const },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border">
            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
            <dd className={`mt-1 text-sm ${
              stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change} from last month
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

      {/* Recent Activity */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900">PO-2024-001 uploaded successfully</span>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-900">MTO-001 moved to production</span>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-900">Defect reported for MTO-045</span>
              <span className="text-xs text-gray-500">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandDashboard