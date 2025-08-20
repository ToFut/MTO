import { apiClient } from '../utils/api-client'
import { User } from '../types/user.types'

interface LoginResponse {
  user: User
  token: string
}

interface BackendUser {
  id: string
  email: string
  full_name: string
  role: string
  company_id?: string
  language?: string
  avatar_url?: string
  phone?: string
  preferences?: any
  last_login?: string
  active: boolean
  created_at: string
  updated_at: string
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  role: 'brand' | 'factory' | 'admin'
  companyId?: string
}

class AuthService {
  private readonly BASE_PATH = '/auth'

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<{success: boolean, data: {user: BackendUser, token: string}}>(`${this.BASE_PATH}/login`, {
      email,
      password
    })
    
    // Map backend user format to frontend format
    const backendUser = response.data.data.user
    const frontendUser: User = {
      id: backendUser.id,
      email: backendUser.email,
      fullName: backendUser.full_name,
      role: backendUser.role as any,
      companyId: backendUser.company_id || null,
      language: backendUser.language || 'en',
      avatarUrl: backendUser.avatar_url || null,
      phone: backendUser.phone || null,
      preferences: backendUser.preferences || {
        theme: 'light',
        language: 'en',
        notifications: { email: true, push: true, sms: false },
        dashboard: { defaultView: 'overview', widgets: [] }
      },
      lastLogin: backendUser.last_login ? new Date(backendUser.last_login) : null,
      active: backendUser.active,
      createdAt: new Date(backendUser.created_at),
      updatedAt: new Date(backendUser.updated_at)
    }
    
    return {
      user: frontendUser,
      token: response.data.data.token
    }
  }

  async logout(): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/logout`)
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<{success: boolean, data: LoginResponse}>(`${this.BASE_PATH}/register`, data)
    return response.data.data
  }

  async verifyToken(token: string): Promise<User> {
    const response = await apiClient.get<{success: boolean, data: BackendUser}>(`${this.BASE_PATH}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    // Map backend user format to frontend format
    const backendUser = response.data.data
    const frontendUser: User = {
      id: backendUser.id,
      email: backendUser.email,
      fullName: backendUser.full_name,
      role: backendUser.role as any,
      companyId: backendUser.company_id || null,
      language: backendUser.language || 'en',
      avatarUrl: backendUser.avatar_url || null,
      phone: backendUser.phone || null,
      preferences: backendUser.preferences || {
        theme: 'light',
        language: 'en',
        notifications: { email: true, push: true, sms: false },
        dashboard: { defaultView: 'overview', widgets: [] }
      },
      lastLogin: backendUser.last_login ? new Date(backendUser.last_login) : null,
      active: backendUser.active,
      createdAt: new Date(backendUser.created_at),
      updatedAt: new Date(backendUser.updated_at)
    }
    
    return frontendUser
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`${this.BASE_PATH}/profile`, data)
    return response.data
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/forgot-password`, { email })
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/reset-password`, { token, password })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/change-password`, {
      currentPassword,
      newPassword
    })
  }
}

export const authService = new AuthService()