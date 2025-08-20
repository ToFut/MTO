import React from 'react'
import { Globe } from 'lucide-react'

const LanguageToggle: React.FC = () => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'cn', name: '中文' },
    { code: 'th', name: 'ไทย' },
    { code: 'vn', name: 'Tiếng Việt' },
    { code: 'kh', name: 'ខ្មែរ' },
  ]

  return (
    <div className="relative">
      <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
        <Globe size={16} />
        <span>EN</span>
      </button>
    </div>
  )
}

export default LanguageToggle