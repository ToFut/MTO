import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (language: string) => void
  t: (key: string) => string
  languages: LanguageInfo[]
}

interface LanguageInfo {
  code: string
  name: string
  flag: string
  nativeName: string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'cn', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'vn', name: 'Vietnamese', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  { code: 'kh', name: 'Khmer', flag: '🇰🇭', nativeName: 'ភាសាខ្មែរ' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', nativeName: 'ไทย' }
]

// Simple translations for demo
const translations: Record<string, Record<string, string>> = {
  en: {
    'dashboard': 'Dashboard',
    'mtos': 'MTOs',
    'upload': 'Upload PO/MTO',
    'inventory': 'Inventory',
    'shipping': 'Shipping',
    'defects': 'Defects',
    'analytics': 'Analytics',
    'logout': 'Logout'
  },
  cn: {
    'dashboard': '仪表板',
    'mtos': '生产订单',
    'upload': '上传订单',
    'inventory': '库存',
    'shipping': '运输',
    'defects': '缺陷',
    'analytics': '分析',
    'logout': '退出登录'
  }
  // Add more languages as needed
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (newLanguage: string) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || key
  }

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
    languages: SUPPORTED_LANGUAGES
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}