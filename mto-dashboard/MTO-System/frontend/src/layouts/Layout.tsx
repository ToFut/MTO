import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useChat } from '../contexts/ChatContext'
import ChatPanel from '../components/chat/ChatPanel'
import {
  Menu,
  X,
  Home,
  Package,
  Upload,
  Truck,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  MessageCircle,
  Users,
  Building2,
  FileText,
  Eye,
  Warehouse,
  ClipboardList,
  Database,
  Search,
  ChevronDown
} from 'lucide-react'

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const { chatState } = useChat()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getMenuItems = () => {
    if (!user) return []

    switch (user.role) {
      case 'brand_manager':
        return [
          { path: '/brand', label: 'Dashboard', icon: Home },
          { path: '/brand/mtos', label: 'MTOs', icon: Package },
          { path: '/brand/upload', label: 'Upload PO/MTO', icon: Upload },
          { path: '/brand/inventory', label: 'Inventory', icon: Warehouse },
          { path: '/brand/shipping', label: 'Shipping', icon: Truck },
          { path: '/brand/defects', label: 'Defects', icon: AlertTriangle },
          { path: '/brand/analytics', label: 'Analytics', icon: BarChart3 },
        ]
      
      case 'factory_operator':
        return [
          { path: '/factory', label: 'Dashboard', icon: Home },
          { path: '/factory/workboard', label: 'Workboard', icon: ClipboardList },
          { path: '/factory/production', label: 'Production', icon: Building2 },
          { path: '/factory/inventory', label: 'Inventory', icon: Warehouse },
          { path: '/factory/shipping', label: 'Shipping', icon: Truck },
          { path: '/factory/defects', label: 'Defects', icon: AlertTriangle },
        ]
      
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: Home },
          { path: '/admin/users', label: 'Users', icon: Users },
          { path: '/admin/companies', label: 'Companies', icon: Building2 },
          { path: '/admin/assignments', label: 'Workspaces', icon: Database },
          { path: '/admin/reports', label: 'Reports', icon: FileText },
          { path: '/admin/oversight', label: 'Oversight', icon: Eye },
        ]
      
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} ${sidebarOpen ? 'fixed lg:relative' : ''} z-50 lg:z-auto transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-xl border-r border-gray-200/50 h-full`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200/50 bg-gradient-to-r from-indigo-600 to-purple-600">
            {sidebarOpen && (
              <h2 className="text-xl font-bold text-white tracking-tight">MTO System</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-200 hover:scale-105 lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 transform scale-105' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md hover:scale-105'
                    }
                  `}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'} transition-colors`} />
                  {sidebarOpen && (
                    <span className="ml-3 text-sm font-semibold tracking-wide">{item.label}</span>
                  )}
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200/50 p-4 bg-gradient-to-r from-gray-50/50 to-white/50">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              {sidebarOpen && (
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="mt-3 w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                <LogOut size={16} />
                <span className="ml-2 font-medium">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-500 flex-1"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              {/* Messages */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <MessageCircle size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              
              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <Settings size={20} />
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200/50 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                      <Settings size={16} className="mr-2" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Chat Panel */}
      {chatState.isOpen && chatState.currentChat && (
        <ChatPanel
          chatId={chatState.currentChat}
          isOpen={chatState.isOpen}
          onClose={() => {}} // This will be handled by the chat context
        />
      )}
    </div>
  )
}