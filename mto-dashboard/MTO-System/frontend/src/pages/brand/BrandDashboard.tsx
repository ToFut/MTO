import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, Upload, Warehouse, Truck, AlertTriangle, BarChart3, Loader2,
  TrendingUp, TrendingDown, Activity, Zap, Shield, Globe, Users,
  Clock, CheckCircle2, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight,
  Sparkles, Target, Award, Calendar, Filter, Search, Bell, Command,
  ChevronRight, MoreVertical, RefreshCw, Download, Send, Eye, Briefcase,
  DollarSign, Box, Layers, PieChart, FileText, MessageSquare
} from 'lucide-react'
import { mtoService } from '../../services/mto.service'
import { useAuth } from '../../contexts/AuthContext'

// Component for animated number counter
const AnimatedCounter: React.FC<{ value: number; duration?: number; prefix?: string; suffix?: string }> = ({ 
  value, duration = 1000, prefix = '', suffix = '' 
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const steps = 50
    const increment = value / steps
    const stepDuration = duration / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, stepDuration)
    
    return () => clearInterval(timer)
  }, [value, duration])
  
  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>
}

// Component for mini chart sparkline
const SparklineChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min
  const width = 100
  const height = 40
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')
  
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <polyline
        points={`${points} ${width},${height} 0,${height}`}
        fill={`url(#gradient-${color})`}
        stroke="none"
      />
    </svg>
  )
}

// Component for progress ring
const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number }> = ({ 
  progress, size = 120, strokeWidth = 8 
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-gray-200"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-indigo-600 transition-all duration-1000 ease-out"
        strokeLinecap="round"
      />
    </svg>
  )
}

const BrandDashboard: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)
  
  // Mock data for charts
  const weeklyData = [65, 72, 68, 74, 79, 83, 87]
  const monthlyRevenue = [45000, 52000, 48000, 61000, 58000, 67000, 72000]
  
  useEffect(() => {
    fetchDashboardData()
    
    // Set up keyboard shortcut for command palette
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const stats = await mtoService.getStatistics({
        brandId: user?.companyId
      })
      setStatistics(stats)
      
      const history = await mtoService.getUploadHistory({
        brandId: user?.companyId,
        limit: 5,
        offset: 0
      })
      
      const activities = history.data.map((item: any) => ({
        id: item.id,
        type: item.total_mtos > 50 ? 'important' : 'normal',
        icon: item.total_mtos > 50 ? Zap : Package,
        title: `${item.po?.po_number || 'PO'} uploaded`,
        description: `${item.total_mtos || 0} MTOs added to production`,
        time: new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        color: item.total_mtos > 50 ? 'text-purple-600 bg-purple-100' : 'text-blue-600 bg-blue-100',
        metrics: {
          mtos: item.total_mtos || 0,
          spots: item.spots_detected || 0,
          quality: item.quality_score || 95
        }
      }))
      
      setRecentActivity(activities)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setTimeout(() => setRefreshing(false), 500)
  }

  // Calculate dynamic metrics
  const productionHealth = statistics ? 
    Math.round(((statistics.byStatus?.shipped || 0) / Math.max(statistics.total, 1)) * 100) : 0
  
  const urgencyScore = statistics?.urgentCount || 0
  const completionRate = statistics?.completionRate || 0
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 -m-6 p-6">
      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Command className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  className="flex-1 outline-none text-lg"
                  autoFocus
                />
                <button 
                  onClick={() => setShowCommandPalette(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
              {[
                { icon: Upload, label: 'Upload PO/MTO', shortcut: '⌘U', href: '/brand/upload' },
                { icon: Package, label: 'View all MTOs', shortcut: '⌘M', href: '/brand/mtos' },
                { icon: Warehouse, label: 'Check Inventory', shortcut: '⌘I', href: '/brand/inventory' },
                { icon: MessageSquare, label: 'Open Chat', shortcut: '⌘C', href: '#' },
                { icon: Download, label: 'Export Report', shortcut: '⌘E', href: '#' },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
                  onClick={() => setShowCommandPalette(false)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="text-gray-700 group-hover:text-gray-900">{item.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{item.shortcut}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Impressive Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}!
              <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Your production line is {productionHealth > 80 ? 'running smoothly' : productionHealth > 60 ? 'performing well' : 'needs attention'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter</option>
            </select>
            
            {/* Action Buttons */}
            <button 
              onClick={handleRefresh}
              className={`p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
            
            <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            <button 
              onClick={() => setShowCommandPalette(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Command className="h-4 w-4" />
              <span>Actions</span>
              <span className="text-xs opacity-70">⌘K</span>
            </button>
          </div>
        </div>

        {/* Primary Metric Card - Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 animate-pulse delay-1000"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Production Health */}
            <div className="text-center lg:text-left">
              <p className="text-white/80 text-sm font-medium mb-2">Production Health</p>
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <div className="relative">
                  <ProgressRing progress={productionHealth} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{productionHealth}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter value={statistics?.total || 0} suffix=" MTOs" />
                  </p>
                  <p className="text-white/70 text-sm">Total in system</p>
                </div>
              </div>
            </div>
            
            {/* Revenue Projection */}
            <div className="text-center">
              <p className="text-white/80 text-sm font-medium mb-2">This Month's Revenue</p>
              <p className="text-4xl font-bold mb-2">
                <AnimatedCounter value={72000} prefix="$" duration={1500} />
              </p>
              <div className="flex items-center justify-center space-x-2">
                <ArrowUpRight className="h-5 w-5 text-green-300" />
                <span className="text-green-300 font-semibold">+18.5%</span>
                <span className="text-white/70 text-sm">vs last month</span>
              </div>
              <div className="mt-4">
                <SparklineChart data={monthlyRevenue} color="#ffffff" />
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs">Completed Today</p>
                    <p className="font-bold">{statistics?.byStatus?.shipped || 0} MTOs</p>
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-green-300" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs">In Production</p>
                    <p className="font-bold">
                      {((statistics?.byStatus?.proceed || 0) + (statistics?.byStatus?.qc || 0))} MTOs
                    </p>
                  </div>
                </div>
                {urgencyScore > 0 && <AlertCircle className="h-4 w-4 text-amber-300" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Ready to Ship',
            value: statistics?.byStatus?.shipping || 0,
            change: '+12%',
            trend: 'up',
            icon: Truck,
            color: 'blue',
            sparkline: [45, 52, 48, 58, 62, 67, 71],
            action: '/brand/shipping'
          },
          {
            title: 'Quality Check',
            value: statistics?.byStatus?.qc || 0,
            change: completionRate + '%',
            trend: 'neutral',
            icon: Shield,
            color: 'purple',
            sparkline: [30, 35, 32, 38, 40, 42, 45],
            action: '/brand/mtos'
          },
          {
            title: 'Daily Production',
            value: statistics?.dailyCount || 0,
            change: urgencyScore > 0 ? `${urgencyScore} urgent` : 'On track',
            trend: urgencyScore > 0 ? 'down' : 'up',
            icon: Zap,
            color: urgencyScore > 0 ? 'red' : 'green',
            sparkline: weeklyData,
            action: '/brand/mtos'
          },
          {
            title: 'Active Factories',
            value: 3,
            change: '100% online',
            trend: 'up',
            icon: Briefcase,
            color: 'indigo',
            sparkline: [100, 100, 95, 100, 98, 100, 100],
            action: '#'
          }
        ].map((metric, index) => (
          <Link
            key={index}
            to={metric.action}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${metric.color}-100 rounded-xl group-hover:scale-110 transition-transform`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              
              <p className="text-gray-600 text-sm mb-1">{metric.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                <AnimatedCounter value={metric.value} />
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  {metric.trend === 'neutral' && <Activity className="h-4 w-4 text-gray-500" />}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <SparklineChart data={metric.sparkline} color={
                  metric.color === 'blue' ? '#3B82F6' :
                  metric.color === 'purple' ? '#9333EA' :
                  metric.color === 'green' ? '#10B981' :
                  metric.color === 'red' ? '#EF4444' :
                  '#6366F1'
                } />
              </div>
            </div>
            
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-4 w-4 text-indigo-600" />
            </div>
          </Link>
        ))}
      </div>

      {/* Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Live Activity Feed</h2>
              </div>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All →
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="group flex items-start space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${activity.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.metrics && (
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">
                          <Box className="h-3 w-3 inline mr-1" />
                          {activity.metrics.mtos} MTOs
                        </span>
                        <span className="text-xs text-gray-500">
                          <Layers className="h-3 w-3 inline mr-1" />
                          {activity.metrics.spots} Spots
                        </span>
                        <span className="text-xs text-gray-500">
                          <Target className="h-3 w-3 inline mr-1" />
                          {activity.metrics.quality}% Quality
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <p className="text-xs text-gray-400">{activity.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
                <Link to="/brand/upload" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block">
                  Upload your first PO →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Smart Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <span>Quick Actions</span>
            </h2>
          </div>
          
          <div className="p-6 space-y-3">
            {[
              { 
                name: 'Upload PO/MTO', 
                href: '/brand/upload', 
                icon: Upload, 
                color: 'bg-gradient-to-r from-blue-500 to-blue-600',
                badge: null,
                description: 'Add new production orders'
              },
              { 
                name: 'View All MTOs', 
                href: '/brand/mtos', 
                icon: Package, 
                color: 'bg-gradient-to-r from-green-500 to-green-600',
                badge: statistics?.total || 0,
                description: 'Track production status'
              },
              { 
                name: 'Check Inventory', 
                href: '/brand/inventory', 
                icon: Warehouse, 
                color: 'bg-gradient-to-r from-purple-500 to-purple-600',
                badge: null,
                description: 'Monitor stock levels'
              },
              { 
                name: 'Shipping Status', 
                href: '/brand/shipping', 
                icon: Truck, 
                color: 'bg-gradient-to-r from-orange-500 to-orange-600',
                badge: statistics?.byStatus?.shipping || 0,
                description: 'Ready for delivery'
              },
              { 
                name: 'Reports & Analytics', 
                href: '/brand/analytics', 
                icon: PieChart, 
                color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
                badge: 'New',
                description: 'View insights & trends'
              }
            ].map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 ${action.color} rounded-xl text-white group-hover:scale-110 transition-transform shadow-lg`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {action.name}
                    </p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {action.badge && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      typeof action.badge === 'number' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    }`}>
                      {action.badge}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandDashboard