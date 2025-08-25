import React, { useState, useEffect } from 'react'
import { Building, Building2, Factory, Edit, Trash2, Plus, Search, CheckCircle, XCircle } from 'lucide-react'
import { apiClient } from '../../utils/api-client'

interface Company {
  id: string
  name: string
  code: string
  type: 'brand' | 'factory'
  contact_email?: string
  contact_person?: string
  phone?: string
  address?: string
  active: boolean
  created_at: string
  settings?: any
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'brand' as 'brand' | 'factory',
    contact_email: '',
    contact_person: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{success: boolean, data: Company[]}>('/companies')
      setCompanies(response.data.data || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCompany) {
        await apiClient.put(`/companies/${editingCompany.id}`, formData)
      } else {
        await apiClient.post('/companies', formData)
      }
      
      setShowForm(false)
      setEditingCompany(null)
      resetForm()
      fetchCompanies()
    } catch (error) {
      console.error('Error saving company:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return
    
    try {
      await apiClient.delete(`/companies/${id}`)
      fetchCompanies()
    } catch (error) {
      console.error('Error deleting company:', error)
    }
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      code: company.code,
      type: company.type,
      contact_email: company.contact_email || '',
      contact_person: company.contact_person || '',
      phone: company.phone || '',
      address: company.address || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'brand',
      contact_email: '',
      contact_person: '',
      phone: '',
      address: ''
    })
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await apiClient.patch(`/companies/${id}`, { active: !active })
      fetchCompanies()
    } catch (error) {
      console.error('Error updating company:', error)
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = !searchTerm || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || company.type === typeFilter
    
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
        <p className="text-gray-600">Manage brands and factories in the system</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search companies..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="brand">Brands</option>
              <option value="factory">Factories</option>
            </select>
          </div>

          <button
            onClick={() => {
              setShowForm(true)
              setEditingCompany(null)
              resetForm()
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </button>
        </div>
      </div>

      {/* Company Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingCompany ? 'Edit Company' : 'Create New Company'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Code</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'brand' | 'factory' }))}
                >
                  <option value="brand">Brand</option>
                  <option value="factory">Factory</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.contact_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCompany(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCompany ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Companies List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredCompanies.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500">
              {searchTerm || typeFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first company'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {company.type === 'brand' ? (
                          <Building2 className="h-5 w-5 text-blue-500 mr-3" />
                        ) : (
                          <Factory className="h-5 w-5 text-green-500 mr-3" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {company.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {company.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.type === 'brand' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {company.type === 'brand' ? 'Brand' : 'Factory'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {company.contact_person || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {company.contact_email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(company.id, company.active)}
                        className="inline-flex items-center"
                      >
                        {company.active ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`ml-2 text-sm ${company.active ? 'text-green-700' : 'text-red-700'}`}>
                          {company.active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(company)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit company"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete company"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Companies</p>
              <p className="text-lg font-semibold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Brands</p>
              <p className="text-lg font-semibold text-gray-900">
                {companies.filter(c => c.type === 'brand').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Factory className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Factories</p>
              <p className="text-lg font-semibold text-gray-900">
                {companies.filter(c => c.type === 'factory').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-lg font-semibold text-gray-900">
                {companies.filter(c => c.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Companies