import React, { useState, useMemo } from 'react';
import { Package, Box, Search, Filter, ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Truck, Scan, FileText, Clock, MapPin, User, Hash, Layers, Calendar, TrendingUp, BarChart3, Archive, Palette, X, Eye, MessageCircle } from 'lucide-react';

const InventoryCartonSplit = ({ mtoData = [], isShippingView = false, onChatClick }) => {
  const [expandedCartons, setExpandedCartons] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCarton, setSelectedCarton] = useState(null);
  const [viewMode, setViewMode] = useState('carton'); // 'carton' or 'mto'
  const [selectedMto, setSelectedMto] = useState(null); // For popup modal

  // Group MTOs by master carton (24 MTOs per carton)
  const cartonData = useMemo(() => {
    const cartons = [];
    const MTOS_PER_CARTON = 24;
    
    // If we have less than 20 cartons worth of data, generate sample data
    const totalMtosNeeded = 20 * MTOS_PER_CARTON; // 480 MTOs for 20 cartons
    const currentMtos = [...mtoData];
    
    // Generate sample MTOs if needed
    while (currentMtos.length < totalMtosNeeded) {
      const sampleStatuses = ['pending', 'cutting', 'QC', 'completed', 'shipped'];
      const sampleProducts = ['Initial Tote', 'Premium Bag', 'Classic Tote', 'Deluxe Bag', 'Custom Pouch'];
      const sampleCustomers = ['Sarah Johnson', 'Mike Chen', 'Emma Davis', 'Alex Wilson', 'Lisa Brown'];
      const samplePatches = ['Letter A', 'Letter M', 'Heart Icon', 'Star Icon', 'Diamond Icon', 'Daisy Icon'];
      
      const randomStatus = sampleStatuses[Math.floor(Math.random() * sampleStatuses.length)];
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
      const randomCustomer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
      
      // Generate random customizations (1-6 spots filled)
      const numSpots = Math.floor(Math.random() * 6) + 1;
      const customizations = {};
      for (let i = 1; i <= numSpots; i++) {
        customizations[`spot${i}`] = samplePatches[Math.floor(Math.random() * samplePatches.length)];
      }
      
      currentMtos.push({
        id: `MTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        uniqueId: `MTO-2025-01-${String(currentMtos.length + 1).padStart(4, '0')}`,
        internalId: String(37400000 + currentMtos.length),
        lineId: String(Math.floor(Math.random() * 1000)),
        referenceNumber: `ref${Math.random().toString(36).substr(2, 12)}`,
        sku: `SKU-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        displayName: randomProduct,
        productType: randomProduct,
        bagBasePID: String(133900 + Math.floor(Math.random() * 100)),
        quantity: 1,
        status: randomStatus,
        trackingNumber: randomStatus === 'shipped' ? `DHL${Math.floor(Math.random() * 999999999)}` : null,
        carrier: 'DHL',
        shippedDate: randomStatus === 'shipped' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        deliveryDate: randomStatus === 'shipped' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        orderNumber: `ORD-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
        customerName: randomCustomer,
        orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        poNumber: `PO-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        factory: ['Factory A', 'Factory B', 'Factory C'][Math.floor(Math.random() * 3)],
        priority: ['Normal', 'High', 'Rush'][Math.floor(Math.random() * 3)],
        ...customizations
      });
    }
    
    // Sort MTOs by status and date for better grouping
    const sortedMtos = currentMtos.sort((a, b) => {
      // Group by status first
      if (a.status !== b.status) {
        const statusOrder = { 'shipped': 0, 'completed': 1, 'QC': 2, 'cutting': 3, 'pending': 4 };
        return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
      }
      // Then by date
      return (a.orderDate || '').localeCompare(b.orderDate || '');
    });
    
    // Group MTOs into cartons of 24
    for (let i = 0; i < Math.min(sortedMtos.length, 20 * MTOS_PER_CARTON); i += MTOS_PER_CARTON) {
      const cartonMtos = sortedMtos.slice(i, i + MTOS_PER_CARTON);
      const cartonNumber = Math.floor(i / MTOS_PER_CARTON) + 1;
      const cartonId = `MC${String(cartonNumber).padStart(4, '0')}`;
      
      // Create different scenarios for different cartons
      let cartonScenario = 'normal';
      if (cartonNumber <= 3) cartonScenario = 'shipped';
      else if (cartonNumber <= 6) cartonScenario = 'ready_to_ship';
      else if (cartonNumber <= 10) cartonScenario = 'in_progress';
      else if (cartonNumber <= 15) cartonScenario = 'partial';
      else cartonScenario = 'pending';
      
      // For partial cartons, only take some MTOs
      if (cartonScenario === 'partial') {
        const partialCount = Math.floor(Math.random() * 15) + 5; // 5-19 MTOs
        cartonMtos.splice(partialCount);
      }
      
      const carton = {
        id: cartonId,
        sku: `CARTON-${cartonId}`,
        status: 'pending',
        mtos: [],
        totalQuantity: 0,
        completedQuantity: 0,
        dimensions: '60cm x 45cm x 30cm',
        weight: `${(cartonMtos.length * 0.625).toFixed(1)} kg`, // ~625g per MTO
        trackingNumber: null,
        packingDate: null,
        shippingDate: null,
        mtoCount: cartonMtos.length,
        isFull: cartonMtos.length === MTOS_PER_CARTON,
        scenario: cartonScenario,
      };
      
      cartonMtos.forEach((mto) => {
        const mtoData = {
          id: mto.uniqueId || mto.id || `MTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          internalId: mto.internalId,
          lineId: mto.lineId || mto.poLineId,
          referenceNumber: mto.referenceNumber,
          sku: mto.sku,
          productName: mto.displayName || mto.style,
          productType: mto.productType,
          bagBasePid: mto.bagBasePid || mto.bagBasePID,
          quantity: mto.quantity || 1,
          status: mto.status || 'pending',
          shippingInfo: {
            trackingNumber: mto.trackingNumber,
            carrier: mto.carrier || 'DHL',
            shippedDate: mto.shippedDate,
            deliveryDate: mto.deliveryDate,
            shippingAddress: mto.shippingAddress,
            awb: mto.awb,
          },
          customizations: [
            mto.spot1 && { spot: 1, item: mto.spot1, type: 'patch' },
            mto.spot2 && { spot: 2, item: mto.spot2, type: 'patch' },
            mto.spot3 && { spot: 3, item: mto.spot3, type: 'patch' },
            mto.spot4 && { spot: 4, item: mto.spot4, type: 'patch' },
            mto.spot5 && { spot: 5, item: mto.spot5, type: 'patch' },
            mto.spot6 && { spot: 6, item: mto.spot6, type: 'patch' },
          ].filter(Boolean),
          orderInfo: {
            orderNumber: mto.orderNumber,
            customerName: mto.customerName,
            orderDate: mto.orderDate,
            poNumber: mto.poNumber,
          },
          production: {
            startDate: mto.productionStartDate,
            endDate: mto.productionEndDate,
            factory: mto.factory,
            priority: mto.priority,
          },
        };
        
        carton.mtos.push(mtoData);
        carton.totalQuantity += (mto.quantity || 1);
        
        if (mto.status === 'completed' || mto.status === 'shipped') {
          carton.completedQuantity += (mto.quantity || 1);
        }
      });

      // Update carton status based on scenario
      if (cartonScenario === 'shipped') {
        carton.status = 'shipped';
        carton.trackingNumber = `DHL${Math.floor(Math.random() * 999999999)}`;
        carton.shippingDate = new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        // Update all MTOs to shipped
        carton.mtos.forEach(mto => {
          mto.status = 'shipped';
          if (!mto.shippingInfo.trackingNumber) {
            mto.shippingInfo.trackingNumber = `DHL${Math.floor(Math.random() * 999999999)}`;
          }
        });
      } else if (cartonScenario === 'ready_to_ship') {
        carton.status = 'ready_to_ship';
        carton.packingDate = new Date().toISOString().split('T')[0];
        // Update all MTOs to completed
        carton.mtos.forEach(mto => {
          if (mto.status !== 'completed') mto.status = 'completed';
        });
        carton.completedQuantity = carton.totalQuantity;
      } else if (cartonScenario === 'in_progress') {
        carton.status = 'in_progress';
        // Mix of statuses
        carton.mtos.forEach((mto, idx) => {
          if (idx < 8) mto.status = 'completed';
          else if (idx < 16) mto.status = 'QC';
          else mto.status = 'cutting';
        });
      } else if (cartonScenario === 'partial') {
        carton.status = 'pending';
        // Mix of statuses for partial carton
        carton.mtos.forEach((mto, idx) => {
          if (idx % 3 === 0) mto.status = 'cutting';
          else if (idx % 3 === 1) mto.status = 'pending';
          else mto.status = 'QC';
        });
      }
      
      cartons.push(carton);
    }

    return cartons;
  }, [mtoData]);

  // Filter cartons based on search and status
  const filteredCartons = useMemo(() => {
    return cartonData.filter(carton => {
      const matchesSearch = searchTerm === '' || 
        carton.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carton.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carton.mtos.some(mto => 
          mto.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mto.internalId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = filterStatus === 'all' || carton.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [cartonData, searchTerm, filterStatus]);

  const toggleCartonExpansion = (cartonId) => {
    setExpandedCartons(prev => ({
      ...prev,
      [cartonId]: !prev[cartonId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'shipped': return 'text-green-600 bg-green-100';
      case 'ready_to_ship': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'cutting': return 'text-purple-600 bg-purple-100';
      case 'QC': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-teal-600 bg-teal-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shipped': return Truck;
      case 'ready_to_ship': return CheckCircle2;
      case 'in_progress': return Package;
      default: return Box;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isShippingView ? 'Shipping Management' : 'Inventory Carton Management'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isShippingView 
                ? 'Track shipments by master carton or individual MTO' 
                : 'Master cartons with MTO assignments and tracking'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isShippingView && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('carton')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'carton' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  By Carton
                </button>
                <button
                  onClick={() => setViewMode('mto')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'mto' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  By MTO
                </button>
              </div>
            )}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scan {viewMode === 'mto' ? 'MTO' : 'Carton'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Cartons</p>
                <p className="text-xl font-bold text-gray-900">{cartonData.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {cartonData.filter(c => c.isFull).length} full • {cartonData.filter(c => !c.isFull).length} partial
                </p>
              </div>
              <Box className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600">Shipped</p>
                <p className="text-xl font-bold text-green-900">
                  {cartonData.filter(c => c.status === 'shipped').length}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {cartonData.filter(c => c.status === 'shipped').reduce((sum, c) => sum + c.mtos.length, 0)} MTOs
                </p>
              </div>
              <Truck className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600">Ready to Ship</p>
                <p className="text-xl font-bold text-blue-900">
                  {cartonData.filter(c => c.status === 'ready_to_ship').length}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {cartonData.filter(c => c.status === 'ready_to_ship').reduce((sum, c) => sum + c.mtos.length, 0)} MTOs
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600">In Progress</p>
                <p className="text-xl font-bold text-yellow-900">
                  {cartonData.filter(c => c.status === 'in_progress').length}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {cartonData.filter(c => c.status === 'in_progress').reduce((sum, c) => sum + c.mtos.length, 0)} MTOs
                </p>
              </div>
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600">Total MTOs</p>
                <p className="text-xl font-bold text-purple-900">
                  {cartonData.reduce((sum, c) => sum + c.mtos.length, 0)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Avg {Math.round(cartonData.reduce((sum, c) => sum + c.mtos.length, 0) / cartonData.length)}/carton
                </p>
              </div>
              <Layers className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by carton ID, SKU, or MTO ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="ready_to_ship">Ready to Ship</option>
              <option value="shipped">Shipped</option>
            </select>
          </div>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Carton List View */}
      {viewMode === 'carton' && (
        <div className="space-y-4">
          {filteredCartons.map((carton) => {
          const StatusIcon = getStatusIcon(carton.status);
          const isExpanded = expandedCartons[carton.id];
          
          return (
            <div key={carton.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Carton Header - Compact */}
              <div 
                className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCartonExpansion(carton.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(carton.status).split(' ')[0]}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-gray-900">{carton.id}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(carton.status)}`}>
                          {carton.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          carton.isFull ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {carton.mtoCount}/24
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Progress: <strong>{Math.round((carton.completedQuantity / carton.totalQuantity) * 100)}%</strong></span>
                    <span>{carton.weight}</span>
                    {carton.trackingNumber && (
                      <span className="font-mono text-blue-600">{carton.trackingNumber}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content - MTO List Table */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">MTO ID</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Reference</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Product</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Customer</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700">Spots</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700">Status</th>
                          {isShippingView && <th className="px-3 py-2 text-left font-medium text-gray-700">Tracking</th>}
                          <th className="px-3 py-2 text-center font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {carton.mtos.map((mto, idx) => (
                          <tr key={mto.id} className="hover:bg-gray-50 cursor-pointer">
                            <td className="px-3 py-2">
                              <div>
                                <p className="font-mono font-semibold text-blue-700">{mto.id}</p>
                                <p className="text-gray-500">Int: {mto.internalId || 'N/A'}</p>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMto(mto);
                                }}
                                className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {mto.referenceNumber || 'N/A'}
                              </button>
                            </td>
                            <td className="px-3 py-2">
                              <div>
                                <p className="font-medium text-gray-900 line-clamp-1">{mto.productName}</p>
                                <p className="text-gray-500">SKU: {mto.sku}</p>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div>
                                <p className="font-medium text-gray-900">{mto.orderInfo.customerName || 'N/A'}</p>
                                <p className="text-gray-500">#{mto.orderInfo.orderNumber || 'N/A'}</p>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-1">
                                {[1, 2, 3, 4, 5, 6].map((spotNum) => {
                                  const spot = mto.customizations.find(c => c.spot === spotNum);
                                  return (
                                    <div
                                      key={spotNum}
                                      className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                                        spot 
                                          ? 'bg-purple-600 text-white' 
                                          : 'bg-gray-200 text-gray-400'
                                      }`}
                                      title={spot ? spot.item : `Spot ${spotNum} - Empty`}
                                    >
                                      {spotNum}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mto.status)}`}>
                                {mto.status}
                              </span>
                            </td>
                            {isShippingView && (
                              <td className="px-3 py-2">
                                {mto.shippingInfo?.trackingNumber ? (
                                  <span className="font-mono text-blue-600 text-xs">
                                    {mto.shippingInfo.trackingNumber}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            )}
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMto(mto);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {isShippingView && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onChatClick) {
                                        onChatClick('shipping', mto.poNumber || 'N/A', mto.lineId || 'N/A', mto.shippingInfo?.trackingNumber || '', mto.id);
                                      }
                                    }}
                                    className="text-purple-600 hover:text-purple-800"
                                    title="Chat about this shipment"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Carton Actions */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="flex gap-2">
                      <button className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                        Print Label
                      </button>
                      <button className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                        Generate Packing List
                      </button>
                    </div>
                    {carton.status === 'ready_to_ship' && (
                      <button className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Mark as Shipped
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {/* MTO List View - Compact Table */}
      {viewMode === 'mto' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">MTO ID</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Reference</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Product</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Customer</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Carton</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">Spots</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">Status</th>
                  {isShippingView && <th className="px-3 py-2 text-left font-medium text-gray-700">Tracking</th>}
                  <th className="px-3 py-2 text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cartonData.flatMap(carton => 
                  carton.mtos.map(mto => ({
                    ...mto,
                    cartonId: carton.id,
                    cartonStatus: carton.status,
                    cartonTrackingNumber: carton.trackingNumber,
                  }))
                )
                .filter(mto => {
                  const matchesSearch = searchTerm === '' || 
                    mto.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mto.internalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mto.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mto.sku?.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  const matchesStatus = filterStatus === 'all' || mto.status === filterStatus;
                  
                  return matchesSearch && matchesStatus;
                })
                .map((mto) => (
                  <tr key={mto.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div>
                        <p className="font-mono font-semibold text-blue-700">{mto.id}</p>
                        <p className="text-gray-500">Int: {mto.internalId || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => setSelectedMto(mto)}
                        className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {mto.referenceNumber || 'Click to view'}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{mto.productName}</p>
                        <p className="text-gray-500">SKU: {mto.sku}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <p className="font-medium text-gray-900">{mto.orderInfo.customerName || 'N/A'}</p>
                        <p className="text-gray-500">#{mto.orderInfo.orderNumber || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Box className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{mto.cartonId}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5, 6].map((spotNum) => {
                          const spot = mto.customizations.find(c => c.spot === spotNum);
                          return (
                            <div
                              key={spotNum}
                              className={`w-5 h-5 rounded text-xs flex items-center justify-center ${
                                spot 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-gray-200 text-gray-400'
                              }`}
                              title={spot ? spot.item : `Spot ${spotNum} - Empty`}
                            >
                              {spotNum}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mto.status)}`}>
                        {mto.status}
                      </span>
                    </td>
                    {isShippingView && (
                      <td className="px-3 py-2">
                        {mto.shippingInfo?.trackingNumber ? (
                          <span className="font-mono text-blue-600 text-xs">
                            {mto.shippingInfo.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedMto(mto)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {isShippingView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onChatClick) {
                                onChatClick('shipping', mto.poNumber || 'N/A', mto.lineId || 'N/A', mto.shippingInfo?.trackingNumber || '', mto.id);
                              }
                            }}
                            className="text-purple-600 hover:text-purple-800"
                            title="Chat about this shipment"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {((viewMode === 'carton' && filteredCartons.length === 0) || 
        (viewMode === 'mto' && cartonData.flatMap(c => c.mtos).length === 0)) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cartons found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* MTO Detail Modal */}
      {selectedMto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">MTO Details</h2>
                  <p className="text-blue-100 mt-1">{selectedMto.id}</p>
                </div>
                <button
                  onClick={() => setSelectedMto(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6 space-y-6">
                {/* Identification Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Hash className="h-5 w-5 text-gray-600" />
                    Identification
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">MTO ID</p>
                      <p className="font-mono font-semibold text-blue-700">{selectedMto.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Internal ID</p>
                      <p className="font-semibold">{selectedMto.internalId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Line ID</p>
                      <p className="font-semibold">{selectedMto.lineId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reference Number</p>
                      <p className="font-mono text-sm">{selectedMto.referenceNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Master Carton</p>
                      <p className="font-semibold">{selectedMto.cartonId}</p>
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Product Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Product Name</p>
                      <p className="font-semibold text-lg">{selectedMto.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Product Type</p>
                      <p className="font-semibold">{selectedMto.productType || 'Initial Tote'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SKU</p>
                      <p className="font-mono font-semibold">{selectedMto.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Base PID</p>
                      <p className="font-semibold">{selectedMto.bagBasePid || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-semibold text-lg">{selectedMto.quantity}</p>
                    </div>
                  </div>
                </div>

                {/* Customizations */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-600" />
                    Customization Spots
                  </h3>
                  <div className="grid grid-cols-6 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((spotNum) => {
                      const spot = selectedMto.customizations.find(c => c.spot === spotNum);
                      return (
                        <div
                          key={spotNum}
                          className={`rounded-lg p-3 text-center ${
                            spot 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          <p className="font-semibold">Spot {spotNum}</p>
                          <p className="text-sm mt-1">{spot ? spot.item : 'Empty'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Order Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="font-semibold">{selectedMto.orderInfo.customerName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="font-semibold">{selectedMto.orderInfo.orderNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">PO Number</p>
                      <p className="font-semibold">{selectedMto.orderInfo.poNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold">{selectedMto.orderInfo.orderDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Production & Status */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Production Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Status</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMto.status)}`}>
                        {selectedMto.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Factory</p>
                      <p className="font-semibold">{selectedMto.production?.factory || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Priority</p>
                      <p className="font-semibold">{selectedMto.production?.priority || 'Normal'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Production Date</p>
                      <p className="font-semibold">{selectedMto.production?.startDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                {isShippingView && selectedMto.shippingInfo && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      Shipping Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Carrier</p>
                        <p className="font-semibold">{selectedMto.shippingInfo.carrier || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tracking Number</p>
                        <p className="font-mono font-semibold text-blue-600">
                          {selectedMto.shippingInfo.trackingNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Shipped Date</p>
                        <p className="font-semibold">
                          {selectedMto.shippingInfo.shippedDate 
                            ? new Date(selectedMto.shippingInfo.shippedDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Expected Delivery</p>
                        <p className="font-semibold">
                          {selectedMto.shippingInfo.deliveryDate 
                            ? new Date(selectedMto.shippingInfo.deliveryDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      {selectedMto.shippingInfo.awb && (
                        <div>
                          <p className="text-sm text-gray-600">AWB</p>
                          <p className="font-semibold">{selectedMto.shippingInfo.awb}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedMto(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Print Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryCartonSplit;