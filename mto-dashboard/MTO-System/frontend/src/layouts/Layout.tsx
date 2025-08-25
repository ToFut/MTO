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
  Database
} from 'lucide-react'

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
          { path: '/admin/reports', label: 'Reports', icon: FileText },
          { path: '/admin/oversight', label: 'Oversight', icon: Eye },
        ]
      
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 h-16 border-b">
            {sidebarOpen && (
              <h2 className="text-xl font-bold text-indigo-600">MTO System</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  {sidebarOpen && (
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              {sidebarOpen && (
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="mt-3 w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={16} />
                <span className="ml-2">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Messages */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <MessageCircle size={20} />
              </button>
              
              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
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