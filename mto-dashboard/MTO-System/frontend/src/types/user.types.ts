export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  companyId: string | null
  company?: Company
  language: string
  avatarUrl: string | null
  phone: string | null
  preferences: UserPreferences
  lastLogin: Date | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'admin' | 'brand_manager' | 'factory_operator' | 'viewer'

export interface Company {
  id: string
  name: string
  type: 'brand' | 'factory'
  code: string
  address: string | null
  contactEmail: string | null
  contactPhone: string | null
  timezone: string
  settings: CompanySettings
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  dashboard: {
    defaultView: string
    widgets: string[]
  }
}

export interface CompanySettings {
  features: {
    chat: boolean
    analytics: boolean
    defectManagement: boolean
    barcodeScanning: boolean
  }
  branding: {
    primaryColor: string
    logo: string | null
  }
  integrations: {
    netsuite: boolean
    shopify: boolean
  }
}

export interface Permission {
  id: string
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface Session {
  user: User
  token: string
  refreshToken: string
  expiresAt: Date
}