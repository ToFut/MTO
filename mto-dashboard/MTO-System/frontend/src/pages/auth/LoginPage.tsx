import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

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
    
    // Use the actual demo credentials
    const credentials = {
      brand: { email: 'brand@example.com', password: 'Test123!@#' },
      factory: { email: 'factory@example.com', password: 'Test123!@#' },
      admin: { email: 'admin@example.com', password: 'Test123!@#' }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MTO Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Mock Login Buttons */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 text-center">Demo Login</h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleDemoLogin('brand')}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login as Brand Manager'}
            </button>
            <button
              onClick={() => handleDemoLogin('factory')}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login as Factory Operator'}
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or sign in manually</span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage