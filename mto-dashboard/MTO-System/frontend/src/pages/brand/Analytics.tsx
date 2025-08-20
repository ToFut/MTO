import React, { useState } from 'react'
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, Package, Truck, 
  AlertTriangle, CheckCircle2, Calendar, Filter, Download, RefreshCw,
  DollarSign, Users, Star, Target, Globe, Factory, Layers, Hash,
  ArrowUp, ArrowDown, Minus, Eye, MessageCircle
} from 'lucide-react'

interface AnalyticsData {
  productionMetrics: {
    totalMTOs: number
    completedMTOs: number
    avgProductionTime: string
    onTimeDelivery: number
    defectRate: number
    capacity: number
  }
  factoryPerformance: {
    name: string
    totalOrders: number
    onTime: number
    quality: number
    efficiency: number
  }[]
  timelineData: {
    date: string
    produced: number
    shipped: number
    defects: number
  }[]
  customizationTrends: {
    type: string
    count: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }[]
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'quality' | 'trends'>('overview')
  const [dateRange, setDateRange] = useState('30d')
  const [selectedFactory, setSelectedFactory] = useState('all')

  // Sample analytics data
  const analyticsData: AnalyticsData = {
    productionMetrics: {
      totalMTOs: 1247,
      completedMTOs: 1089,
      avgProductionTime: '3.2 days',
      onTimeDelivery: 94.2,
      defectRate: 2.8,
      capacity: 87.5
    },
    factoryPerformance: [
      { name: 'GZ Totes', totalOrders: 425, onTime: 96.2, quality: 98.1, efficiency: 89.3 },
      { name: 'GZ Factory', totalOrders: 312, onTime: 92.8, quality: 96.5, efficiency: 85.7 },
      { name: 'Shanghai Bags', totalOrders: 510, onTime: 95.1, quality: 97.8, efficiency: 91.2 }
    ],
    timelineData: [
      { date: '2025-01-01', produced: 45, shipped: 42, defects: 1 },
      { date: '2025-01-02', produced: 52, shipped: 48, defects: 2 },
      { date: '2025-01-03', produced: 38, shipped: 40, defects: 0 },
      { date: '2025-01-04', produced: 61, shipped: 55, defects: 1 },
      { date: '2025-01-05', produced: 48, shipped: 52, defects: 3 },
      { date: '2025-01-06', produced: 55, shipped: 49, defects: 1 },
      { date: '2025-01-07', produced: 42, shipped: 46, defects: 0 }
    ],
    customizationTrends: [
      { type: 'Camera Icon', count: 156, trend: 'up', percentage: 12.5 },
      { type: 'Heart Icon', count: 142, trend: 'up', percentage: 8.3 },
      { type: 'Music Notes', count: 134, trend: 'down', percentage: -5.2 },
      { type: 'Star Icon', count: 128, trend: 'stable', percentage: 2.1 },
      { type: 'Coffee Icon', count: 119, trend: 'up', percentage: 15.7 }
    ]
  }

  const recentInsights = [
    { 
      id: 1, 
      type: 'performance', 
      title: 'Production Efficiency Up 12%', 
      description: 'GZ Totes showing significant improvement in production speed', 
      time: '2 hours ago',
      impact: 'positive'
    },
    { 
      id: 2, 
      type: 'quality', 
      title: 'Defect Rate Below Target', 
      description: 'Overall defect rate decreased to 2.8%, below 3% target', 
      time: '4 hours ago',
      impact: 'positive'
    },
    { 
      id: 3, 
      type: 'trend', 
      title: 'Camera Icon Popularity Rising', 
      description: 'Camera icon customizations increased 12.5% this week', 
      time: '1 day ago',
      impact: 'neutral'
    },
    { 
      id: 4, 
      type: 'alert', 
      title: 'GZ Factory Capacity Warning', 
      description: 'Operating at 95% capacity, may need load balancing', 
      time: '1 day ago',
      impact: 'warning'
    }
  ]

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'mtos': return Package
      case 'time': return Clock
      case 'delivery': return Truck
      case 'defects': return AlertTriangle
      case 'capacity': return BarChart3
      default: return Hash
    }
  }

  const getPerformanceColor = (value: number, type: 'quality' | 'efficiency' | 'onTime') => {
    if (type === 'quality') {
      if (value >= 97) return 'text-green-600'
      if (value >= 95) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (type === 'efficiency') {
      if (value >= 90) return 'text-green-600'
      if (value >= 80) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (type === 'onTime') {
      if (value >= 95) return 'text-green-600'
      if (value >= 90) return 'text-yellow-600'
      return 'text-red-600'
    }
    return 'text-gray-600'
  }

  const getTrendIcon = (trend: string, percentage: number) => {
    if (trend === 'up') return <ArrowUp size={16} className="text-green-600" />
    if (trend === 'down') return <ArrowDown size={16} className="text-red-600" />
    return <Minus size={16} className="text-gray-600" />
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp size={16} className="text-blue-600" />
      case 'quality': return <CheckCircle2 size={16} className="text-green-600" />
      case 'trend': return <BarChart3 size={16} className="text-purple-600" />
      case 'alert': return <AlertTriangle size={16} className="text-orange-600" />
      default: return <Clock size={16} className="text-gray-600" />
    }
  }

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'border-l-green-500'
      case 'warning': return 'border-l-orange-500'
      case 'negative': return 'border-l-red-500'
      default: return 'border-l-blue-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Performance insights and production analytics</p>
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total MTOs</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.productionMetrics.totalMTOs}</p>
              <p className="text-xs text-green-600">+12% vs last month</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.productionMetrics.completedMTOs}</p>
              <p className="text-xs text-green-600">+8% vs last month</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Production</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.productionMetrics.avgProductionTime}</p>
              <p className="text-xs text-green-600">-0.3d vs last month</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.productionMetrics.onTimeDelivery}%</p>
              <p className="text-xs text-green-600">+2.1% vs last month</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Defect Rate</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.productionMetrics.defectRate}%</p>
              <p className="text-xs text-green-600">-0.7% vs last month</p>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Capacity</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.productionMetrics.capacity}%</p>
              <p className="text-xs text-blue-600">+5.2% vs last month</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
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
              { id: 'production', label: 'Production Analysis', icon: Factory },
              { id: 'quality', label: 'Quality Metrics', icon: CheckCircle2 },
              { id: 'trends', label: 'Customization Trends', icon: TrendingUp }
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
              {/* Recent Insights */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Insights</h3>
                <div className="space-y-3">
                  {recentInsights.map((insight) => (
                    <div key={insight.id} className={`flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-l-4 ${getInsightColor(insight.impact)}`}>
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{insight.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Factory Performance Comparison */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Factory Performance</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {analyticsData.factoryPerformance.map((factory) => (
                    <div key={factory.name} className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{factory.name}</h4>
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <Factory className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Orders</span>
                          <span className="text-sm font-semibold text-gray-900">{factory.totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">On-Time Rate</span>
                          <span className={`text-sm font-semibold ${getPerformanceColor(factory.onTime, 'onTime')}`}>
                            {factory.onTime}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Quality Score</span>
                          <span className={`text-sm font-semibold ${getPerformanceColor(factory.quality, 'quality')}`}>
                            {factory.quality}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Efficiency</span>
                          <span className={`text-sm font-semibold ${getPerformanceColor(factory.efficiency, 'efficiency')}`}>
                            {factory.efficiency}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Production Timeline (Last 7 Days)</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produced</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipped</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defects</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.timelineData.map((day) => {
                        const efficiency = day.produced > 0 ? ((day.produced - day.defects) / day.produced * 100) : 0
                        return (
                          <tr key={day.date} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(day.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {day.produced}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {day.shipped}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${day.defects === 0 ? 'text-green-600' : day.defects <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {day.defects}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${efficiency >= 95 ? 'text-green-600' : efficiency >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {efficiency.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Quality Score</h4>
                      <p className="text-3xl font-bold">97.4%</p>
                      <p className="text-green-100">Above industry standard</p>
                    </div>
                    <div className="bg-green-400 p-3 rounded-lg">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Customer Rating</h4>
                      <p className="text-3xl font-bold">4.8/5</p>
                      <p className="text-blue-100">Based on 1,247 reviews</p>
                    </div>
                    <div className="bg-blue-400 p-3 rounded-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quality Metrics by Factory</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defect Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Pass Yield</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.factoryPerformance.map((factory) => {
                        const defectRate = (100 - factory.quality).toFixed(1)
                        const firstPassYield = (factory.quality * 0.95).toFixed(1)
                        return (
                          <tr key={factory.name} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {factory.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${getPerformanceColor(factory.quality, 'quality')}`}>
                                {factory.quality}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {defectRate}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {firstPassYield}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button className="text-indigo-600 hover:text-indigo-900">
                                  <Eye size={16} />
                                </button>
                                <button className="text-purple-600 hover:text-purple-900">
                                  <MessageCircle size={16} />
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
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Customizations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.customizationTrends.map((trend, index) => (
                    <div key={trend.type} className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">#{index + 1} {trend.type}</h4>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(trend.trend, trend.percentage)}
                          <span className={`text-sm font-medium ${
                            trend.trend === 'up' ? 'text-green-600' : 
                            trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Orders</span>
                        <span className="text-2xl font-bold text-gray-900">{trend.count}</span>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${(trend.count / analyticsData.customizationTrends[0].count) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Trends</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Holiday Icons</span>
                      <span className="text-sm font-semibold text-green-600">+25% expected</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nature Themes</span>
                      <span className="text-sm font-semibold text-blue-600">+18% this season</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tech Icons</span>
                      <span className="text-sm font-semibold text-gray-600">Stable</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Regional Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">North America</span>
                      <span className="text-sm font-semibold text-gray-900">Tech & Food icons</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Europe</span>
                      <span className="text-sm font-semibold text-gray-900">Nature & Travel</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Asia</span>
                      <span className="text-sm font-semibold text-gray-900">Traditional & Modern</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
