import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Building2, Settings, Shield, Loader2 } from 'lucide-react'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Starting login process...', { email, password: '***' })
      await login(email, password)
      console.log('Login successful, navigating...')
      
      // Navigate to appropriate dashboard based on the demo user's role
      if (email === 'brand@brand.com') {
        console.log('Navigating to /brand')
        navigate('/brand')
      } else if (email === 'factory@factory.com') {
        console.log('Navigating to /factory')
        navigate('/factory')
      } else {
        // Default navigation for other users
        console.log('Navigating to default /brand')
        navigate('/brand')
      }
    } catch (err: any) {
      console.error('Login failed:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Demo login with real credentials
  const handleDemoLogin = async (role: 'brand' | 'factory' | 'admin') => {
    setLoading(true)
    setError('')
    
    // Use the actual demo credentials from the database
    const credentials = {
      brand: { email: 'brand@brand.com', password: 'brand123' },
      factory: { email: 'factory@factory.com', password: 'factory123' },
      admin: { email: 'admin@mto.com', password: 'admin123' }
    }
    
    const { email, password } = credentials[role]
    
    try {
      console.log(`Starting demo login for ${role}...`)
      await login(email, password)
      console.log('Demo login successful, navigating...')
      
      // Navigation will be handled by the auth context based on user role
      if (role === 'admin') {
        navigate('/admin')
      } else if (role === 'brand') {
        navigate('/brand')
      } else {
        navigate('/factory')
      }
    } catch (err: any) {
      console.error('Demo login failed:', err)
      setError(err.message || 'Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="mb-12">
            <h1 className="text-4xl font-light text-slate-800 mb-4">
              MTO
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Intelligent manufacturing orchestration platform
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login */}
      <div className="flex-1 lg:max-w-md bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile Header */}
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-2xl font-light text-slate-800 mb-2">MTO</h1>
            <p className="text-slate-600">Manufacturing Platform</p>
          </div>

          {/* Role Selection */}
          <div className="space-y-3 mb-8">
            <h3 className="text-lg font-medium text-slate-800 mb-6">Access Platform</h3>
            <div className="space-y-3">
              {[
                { 
                  role: 'brand', 
                  label: 'Brand Manager', 
                  icon: Building2,
                  color: 'text-blue-600'
                },
                { 
                  role: 'factory', 
                  label: 'Factory Operator', 
                  icon: Settings,
                  color: 'text-emerald-600'
                },
                { 
                  role: 'admin', 
                  label: 'Administrator', 
                  icon: Shield,
                  color: 'text-purple-600'
                }
              ].map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.role}
                    onClick={() => handleDemoLogin(role.role as 'brand' | 'factory' | 'admin')}
                    disabled={loading}
                    className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                      <Icon className={`h-5 w-5 ${role.color}`} />
                    </div>
                    <div className="ml-4 text-left flex-1">
                      <div className="text-sm font-medium text-slate-800">
                        {loading ? 'Signing in...' : role.label}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">
                or sign in with credentials
              </span>
            </div>
          </div>

          {/* Manual Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage