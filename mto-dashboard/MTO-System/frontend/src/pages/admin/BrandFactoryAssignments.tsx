import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building, Factory, Users, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '../../utils/api-client';

interface Company {
  id: string;
  name: string;
  code: string;
  type: 'brand' | 'factory';
  email?: string;
  contact_person?: string;
  active: boolean;
}

interface Assignment {
  id: string;
  brand_id: string;
  factory_id: string;
  status: 'active' | 'inactive' | 'suspended';
  capabilities: string[];
  production_capacity: number;
  quality_rating: number;
  preferred_for_categories: string[];
  notes?: string;
  assigned_at: string;
  brand?: Company;
  factory?: Company;
  assigned_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface AssignmentFormData {
  brand_id: string;
  factory_id: string;
  capabilities: string[];
  production_capacity: number;
  quality_rating: number;
  preferred_for_categories: string[];
  notes: string;
}

const BrandFactoryAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [brands, setBrands] = useState<Company[]>([]);
  const [factories, setFactories] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState<AssignmentFormData>({
    brand_id: '',
    factory_id: '',
    capabilities: [],
    production_capacity: 0,
    quality_rating: 0,
    preferred_for_categories: [],
    notes: ''
  });

  const predefinedCapabilities = [
    'bags', 'apparel', 'accessories', 'footwear', 'leather_goods', 
    'electronics', 'home_goods', 'sporting_goods', 'jewelry', 'toys'
  ];

  const predefinedCategories = [
    'luxury_bags', 'premium_apparel', 'casual_wear', 'sportswear',
    'formal_wear', 'outdoor_gear', 'tech_accessories', 'home_decor'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, brandsRes, factoriesRes] = await Promise.all([
        apiClient.get('/assignments'),
        apiClient.get('/companies?type=brand'),
        apiClient.get('/companies?type=factory')
      ]);

      setAssignments(assignmentsRes.data.data || []);
      setBrands(brandsRes.data.data || []);
      setFactories(factoriesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAssignment) {
        await apiClient.put(`/assignments/${editingAssignment.id}`, formData);
      } else {
        await apiClient.post('/assignments', formData);
      }
      
      setShowForm(false);
      setEditingAssignment(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      alert(error.response?.data?.error || 'Failed to save assignment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await apiClient.delete(`/assignments/${id}`);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      alert(error.response?.data?.error || 'Failed to delete assignment');
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      brand_id: assignment.brand_id,
      factory_id: assignment.factory_id,
      capabilities: assignment.capabilities,
      production_capacity: assignment.production_capacity,
      quality_rating: assignment.quality_rating,
      preferred_for_categories: assignment.preferred_for_categories,
      notes: assignment.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      brand_id: '',
      factory_id: '',
      capabilities: [],
      production_capacity: 0,
      quality_rating: 0,
      preferred_for_categories: [],
      notes: ''
    });
  };

  const handleArrayFieldChange = (field: 'capabilities' | 'preferred_for_categories', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = !searchTerm || 
      assignment.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.factory?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      case 'suspended': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand-Factory Assignments</h1>
        <p className="text-gray-600">Manage relationships between brands and manufacturing factories</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search brands or factories..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setEditingAssignment(null);
              resetForm();
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </button>
        </div>
      </div>

      {/* Assignment Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.brand_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Factory</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.factory_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, factory_id: e.target.value }))}
                    >
                      <option value="">Select Factory</option>
                      {factories.map(factory => (
                        <option key={factory.id} value={factory.id}>{factory.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Production Capacity (monthly)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.production_capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, production_capacity: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality Rating (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.quality_rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, quality_rating: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capabilities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {predefinedCapabilities.map(capability => (
                      <label key={capability} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.capabilities.includes(capability)}
                          onChange={() => handleArrayFieldChange('capabilities', capability)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="capitalize">{capability.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Categories</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {predefinedCategories.map(category => (
                      <label key={category} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.preferred_for_categories.includes(category)}
                          onChange={() => handleArrayFieldChange('preferred_for_categories', category)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="capitalize">{category.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this assignment..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAssignment(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingAssignment ? 'Update' : 'Create'} Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredAssignments.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first brand-factory assignment'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingAssignment(null);
                  resetForm();
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand & Factory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity & Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capabilities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-blue-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.brand?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.brand?.code}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Factory className="h-4 w-4 text-green-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.factory?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.factory?.code}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(assignment.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {assignment.production_capacity.toLocaleString()} units/month
                      </div>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-500">
                          {assignment.quality_rating}/10
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {assignment.capabilities.slice(0, 3).map((capability, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {capability.replace('_', ' ')}
                          </span>
                        ))}
                        {assignment.capabilities.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            +{assignment.capabilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{assignment.assigned_by_user?.full_name}</div>
                      <div className="text-xs">
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit assignment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete assignment"
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
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Assignments</p>
              <p className="text-lg font-semibold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-lg font-semibold text-gray-900">
                {assignments.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Building className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Brands</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Set(assignments.filter(a => a.status === 'active').map(a => a.brand_id)).size}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Factory className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Factories</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Set(assignments.filter(a => a.status === 'active').map(a => a.factory_id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandFactoryAssignments;