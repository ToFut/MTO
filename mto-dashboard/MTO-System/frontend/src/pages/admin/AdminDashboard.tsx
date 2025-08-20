import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, FileText, Eye, BarChart3, Settings, Link as LinkIcon } from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const stats = [
    { name: 'Total Users', value: '142', change: '+5%', changeType: 'increase' as const },
    { name: 'Active Companies', value: '24', change: '+2%', changeType: 'increase' as const },
    { name: 'System Uptime', value: '99.9%', change: '0%', changeType: 'increase' as const },
    { name: 'Monthly MTOs', value: '5,234', change: '+18%', changeType: 'increase' as const },
  ]

  const quickActions = [
    { name: 'User Management', href: '/admin/users', icon: Users, color: 'bg-blue-500' },
    { name: 'Company Management', href: '/admin/companies', icon: Building2, color: 'bg-green-500' },
    { name: 'Brand-Factory Assignments', href: '/admin/assignments', icon: LinkIcon, color: 'bg-indigo-500' },
    { name: 'System Reports', href: '/admin/reports', icon: FileText, color: 'bg-purple-500' },
    { name: 'System Oversight', href: '/admin/oversight', icon: Eye, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and administrative controls.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border">
            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
            <dd className={`mt-1 text-sm ${
              stat.changeType === 'increase' ? 'text-green-600' : 
              stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {stat.change} from last month
            </dd>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Administrative Actions</h2>
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

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">System Health</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Response Time</span>
                <span className="text-sm font-medium text-green-600">&lt; 100ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database Connections</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Storage Usage</span>
                <span className="text-sm font-medium text-yellow-600">67%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm font-medium text-gray-900">89</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent System Events</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900">New user registered: john@brand.com</span>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-900">System backup completed</span>
                <span className="text-xs text-gray-500">3 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-900">High CPU usage detected</span>
                <span className="text-xs text-gray-500">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard