import React from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Building2, Warehouse, Truck, AlertTriangle } from 'lucide-react'

const FactoryDashboard: React.FC = () => {
  const stats = [
    { name: 'Daily MTOs', value: '45', change: '+15%', changeType: 'increase' as const },
    { name: 'Monthly MTOs', value: '289', change: '+8%', changeType: 'increase' as const },
    { name: 'In Production', value: '67', change: '+12%', changeType: 'increase' as const },
    { name: 'QC Pending', value: '23', change: '-5%', changeType: 'decrease' as const },
  ]

  const quickActions = [
    { name: 'Production Workboard', href: '/factory/workboard', icon: ClipboardList, color: 'bg-blue-500' },
    { name: 'Production Floor', href: '/factory/production', icon: Building2, color: 'bg-green-500' },
    { name: 'Inventory Status', href: '/factory/inventory', icon: Warehouse, color: 'bg-purple-500' },
    { name: 'Shipping Queue', href: '/factory/shipping', icon: Truck, color: 'bg-orange-500' },
    { name: 'Defect Reports', href: '/factory/defects', icon: AlertTriangle, color: 'bg-red-500' },
  ]

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
              stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
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
                <span className="text-sm font-medium text-gray-900">15 MTOs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sewing</span>
                <span className="text-sm font-medium text-gray-900">12 MTOs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Embroidery</span>
                <span className="text-sm font-medium text-gray-900">8 MTOs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">QC</span>
                <span className="text-sm font-medium text-gray-900">5 MTOs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Packing</span>
                <span className="text-sm font-medium text-gray-900">3 MTOs</span>
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
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-900">MTO-2024-001 - Rush order</span>
                <span className="text-xs text-red-600">Due today</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-900">MTO-2024-015 - QC required</span>
                <span className="text-xs text-orange-600">Due tomorrow</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Inventory shortage: Patch #123</span>
                <span className="text-xs text-yellow-600">Order needed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FactoryDashboard