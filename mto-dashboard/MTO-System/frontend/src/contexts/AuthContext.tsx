import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/auth.service'
import { User } from '../types/user.types'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  role: 'brand' | 'factory' | 'admin'
  companyId?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      if (token) {
        const userData = await authService.verifyToken(token)
        setUser(userData)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      localStorage.removeItem('authToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      // Use real authentication service
      const { user: userData, token } = await authService.login(email, password)
      
      // Store token and user data
      localStorage.setItem('authToken', token)
      setUser(userData)
    } catch (err: any) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      localStorage.removeItem('authToken')
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setError(null)
      setLoading(true)
      const { user: userData, token } = await authService.register(data)
      localStorage.setItem('authToken', token)
      setUser(userData)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      setError(null)
      const updatedUser = await authService.updateProfile(data)
      setUser(updatedUser)
    } catch (err: any) {
      setError(err.message || 'Profile update failed')
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}