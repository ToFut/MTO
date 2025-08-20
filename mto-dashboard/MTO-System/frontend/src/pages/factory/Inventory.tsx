import React from 'react'

const Inventory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Factory Inventory</h1>
        <p className="text-gray-600">Inventory management for factory operations.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Interface</h3>
        <p className="text-gray-600">This page will contain the factory Inventory functionality.</p>
      </div>
    </div>
  )
}

export default Inventory
