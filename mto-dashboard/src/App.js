import React, { useState, useRef } from 'react';
import { Upload, MessageCircle, Bell, Package, Truck, CheckCircle2, AlertTriangle, Eye, Paperclip, Edit, Building2, FileText, Download, X, ChevronDown, ChevronRight, BarChart3, Clock, Play, Filter, Calendar } from 'lucide-react';

const BaubleBarDemo = () => {
  const [currentView, setCurrentView] = useState('brand');
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedPOs, setExpandedPOs] = useState(new Set());
  const [activeChatTab, setActiveChatTab] = useState('general');
  const [chatTabs, setChatTabs] = useState([
    { id: 'general', title: 'General', type: 'general', po: '', mto: '' }
  ]);
  const fileInputRef = useRef(null);

  // Add filter state and UI for BrandView
  const [brandFilters, setBrandFilters] = useState({ status: '', factory: '', dateFrom: '', dateTo: '' });
  // Add filter state and UI for FactoryView
  const [factoryFilters, setFactoryFilters] = useState({ status: '', dateFrom: '', dateTo: '' });

  // Replace filter UIs with a modern, next-gen filter bar
  // Add new state for showing advanced filter modal
  const [showBrandAdvanced, setShowBrandAdvanced] = useState(false);
  const [showFactoryAdvanced, setShowFactoryAdvanced] = useState(false);

  // Add state for selected MTO details modal
  const [viewMtoDetail, setViewMtoDetail] = useState(null);
  // Add state for QR modal
  const [qrMto, setQrMto] = useState(null);
  // Add state for QR spot modal
  const [qrSpot, setQrSpot] = useState(null);

  // Add state for auto-generating all QR codes
  const [autoGenerateQr, setAutoGenerateQr] = useState(null);

  const [notifications] = useState([
    { id: 1, type: 'status', message: 'PO123 Line 6 moved to QC stage', time: '2h ago', read: false, po: 'PO123' },
    { id: 2, type: 'delay', message: 'Material shortage: Patch 129559 for PO124', time: '4h ago', read: false, po: 'PO124' },
    { id: 3, type: 'message', message: 'New QC photos from GZ Totes for PO123', time: '6h ago', read: false, po: 'PO123' },
    { id: 4, type: 'shipping', message: 'PO125 Line 8 shipped - Tracking: 1Z123456', time: '1d ago', read: true, po: 'PO125' }
  ]);

  const [chatMessages, setChatMessages] = useState([
    // General messages
    { id: 1, sender: 'Brand', message: 'Hi team! How are things looking today?', time: '9:00 AM', po: '', mto: '', files: [] },
    { id: 2, sender: 'Factory', message: 'Good morning! Production is running smoothly. We have 3 active MTOs.', time: '9:05 AM', po: '', mto: '', files: [] },
    
    // PO123 messages
    { id: 3, sender: 'Factory', message: 'PO123 Line 6 - QC photos uploaded for review', time: '10:30 AM', po: 'PO123', mto: '6', files: ['qc_photo_line6.jpg'] },
    { id: 4, sender: 'Brand', message: 'PO123 Line 6 - Approved! Please proceed with shipping', time: '11:15 AM', po: 'PO123', mto: '6', files: [] },
    { id: 5, sender: 'Factory', message: 'PO123 Line 6 - Shipping scheduled for July 24th. Will provide tracking.', time: '2:45 PM', po: 'PO123', mto: '6', files: [] },
    
    // PO124 messages
    { id: 6, sender: 'Brand', message: 'PO124 - Can you prioritize Line 12? Customer requested rush.', time: '3:20 PM', po: 'PO124', mto: '12', files: ['priority_request.pdf'] },
    { id: 7, sender: 'Factory', message: 'PO124 Line 12 - Understood. Moving to high priority. Will start today.', time: '3:25 PM', po: 'PO124', mto: '12', files: [] },
    { id: 8, sender: 'Brand', message: 'PO124 - Thank you! Customer will be happy.', time: '3:30 PM', po: 'PO124', mto: '', files: [] },
    
    // PO125 messages
    { id: 9, sender: 'Factory', message: 'PO125 Line 14 - Shipped! Tracking: 1Z0987654321', time: '1:00 PM', po: 'PO125', mto: '14', files: ['packing_slip_line14.pdf'] },
    { id: 10, sender: 'Brand', message: 'PO125 - Perfect! All items received in good condition.', time: '4:00 PM', po: 'PO125', mto: '', files: [] }
  ]);

  // Enhanced data with all required features
  const brandPOs = [
    { 
      po: 'PO123', 
      totalUnits: 500, 
      completed: 280, 
      percent: 56, 
      eta: 'July 11, 2025', 
      status: 'In Production',
      uploadDate: 'June 15, 2025',
      mtos: [
        { lineId: 6, qty: 1, customization: 'Spot 1-6', status: 'QC', eta: 'July 5, 2025', progress: 75, style: '14oz Natural Tote - Medium' },
        { lineId: 7, qty: 2, customization: 'Spot 1-4', status: 'In Production', eta: 'July 8, 2025', progress: 50, style: '14oz Natural Tote - Large' },
        { lineId: 8, qty: 1, customization: 'Spot 1-3', status: 'Shipped', eta: 'June 28, 2025', progress: 100, style: '14oz Canvas Tote - Medium' },
        { lineId: 9, qty: 3, customization: 'Spot 1-5', status: 'Not Started', eta: 'July 12, 2025', progress: 0, style: '14oz Natural Tote - Small' }
      ]
    },
    { 
      po: 'PO124', 
      totalUnits: 300, 
      completed: 85, 
      percent: 28, 
      eta: 'July 18, 2025', 
      status: 'In Production',
      urgent: true,
      uploadDate: 'June 20, 2025',
      mtos: [
        { lineId: 12, qty: 2, customization: 'Spot 1-4', status: 'In Production', eta: 'July 15, 2025', progress: 60, style: '14oz Canvas Tote - Large' },
        { lineId: 13, qty: 1, customization: 'Spot 1-2', status: 'QC', eta: 'July 16, 2025', progress: 80, style: '14oz Natural Tote - Medium' }
      ]
    },
    { 
      po: 'PO125', 
      totalUnits: 750, 
      completed: 750, 
      percent: 100, 
      eta: 'June 30, 2025', 
      status: 'Shipped',
      uploadDate: 'June 1, 2025',
      mtos: [
        { lineId: 14, qty: 5, customization: 'Spot 1-6', status: 'Shipped', eta: 'June 30, 2025', progress: 100, style: '14oz Natural Tote - Medium' }
      ]
    }
  ];

  const factoryMTOs = [
    { 
      po: 'PO123', 
      lineId: 6, 
      qty: 1, 
      style: '14oz Natural Tote – Medium', 
      eta: 'July 24', 
      status: 'QC', 
      priority: 'high',
      customization: {
        spot1: '129559',
        spot2: '137234', 
        spot3: '128687',
        spot4: '128698',
        spot5: '128954',
        spot6: '—'
      },
      progress: 3, // 0=Receive PO, 1=In Production, 2=QC, 3=Shipping, 4=Shipped
      actualStartDate: 'July 1',
      estimatedShipDate: 'July 5',
      trackingNumber: '',
      qcPhotos: ['qc_photo_line6.jpg']
    },
    { 
      po: 'PO124', 
      lineId: 12, 
      qty: 2, 
      style: '14oz Canvas Tote – Large', 
      eta: 'July 26', 
      status: 'In Production', 
      priority: 'high',
      customization: {
        spot1: '129560',
        spot2: '137235', 
        spot3: '128688',
        spot4: '—',
        spot5: '—',
        spot6: '—'
      },
      progress: 1,
      actualStartDate: 'July 2',
      estimatedShipDate: 'July 8'
    },
    { 
      po: 'PO125', 
      lineId: 18, 
      qty: 1, 
      style: '14oz Natural Tote – Small', 
      eta: 'July 28', 
      status: 'Receive PO', 
      priority: 'normal',
      customization: {
        spot1: '129561',
        spot2: '—', 
        spot3: '—',
        spot4: '—',
        spot5: '—',
        spot6: '—'
      },
      progress: 0
    }
  ];

  const inventoryData = [
    { material: '14oz Tote Base', needed: 200, inStock: 140, allocated: 200, status: 'short', usedBy: ['PO123-6', 'PO124-12', 'PO125-18'] },
    { material: 'Patch 129559', needed: 30, inStock: 10, allocated: 30, status: 'short', usedBy: ['PO123-6'] },
    { material: 'Patch 137234', needed: 25, inStock: 30, allocated: 25, status: 'ok', usedBy: ['PO123-6'] },
    { material: 'Patch 128687', needed: 15, inStock: 20, allocated: 15, status: 'ok', usedBy: ['PO123-6'] },
    { material: 'Thread - Black', needed: 50, inStock: 100, allocated: 50, status: 'ok', usedBy: ['PO123-6', 'PO124-12'] }
  ];

  const shippingData = [
    { po: 'PO123', lineId: 6, shipDate: 'July 24', trackingNumber: '1Z1234567890', carrier: 'UPS', files: ['packing_slip_line6.pdf'] },
    { po: 'PO125', lineId: 14, shipDate: 'June 30', trackingNumber: '1Z0987654321', carrier: 'FedEx', files: ['packing_slip_line14.pdf', 'invoice.pdf'] }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Not Started': 'bg-gray-100 text-gray-700',
      'In Production': 'bg-blue-100 text-blue-700', 
      'QC': 'bg-yellow-100 text-yellow-700',
      'Shipping': 'bg-purple-100 text-purple-700',
      'Shipped': 'bg-green-100 text-green-700',
      'Receive PO': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getProgressSteps = (currentStep) => {
    const steps = ['Receive PO', 'In Production', 'QC', 'Shipping', 'Shipped'];
    return steps.map((step, index) => ({
      name: step,
      completed: index < currentStep,
      current: index === currentStep,
      future: index > currentStep
    }));
  };

  const togglePOExpansion = (po) => {
    const newExpanded = new Set(expandedPOs);
    if (newExpanded.has(po)) {
      newExpanded.delete(po);
    } else {
      newExpanded.add(po);
    }
    setExpandedPOs(newExpanded);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const currentChatTarget = chatTabs.find(tab => tab.id === activeChatTab) || { type: 'general', po: '', mto: '' };
      
      setChatMessages([...chatMessages, {
        id: Date.now(),
        sender: currentView === 'brand' ? 'Brand' : 'Factory',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        po: currentChatTarget.po || '',
        mto: currentChatTarget.mto || '',
        files: []
      }]);
      setNewMessage('');
    }
  };

  const advanceStatus = (mto) => {
    // In real app, this would update the MTO status
    console.log(`Advancing status for ${mto.po} Line ${mto.lineId}`);
  };

  // BRAND VIEW - Complete with all features
  const BrandView = () => (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Orders Dashboard</h1>
            <p className="text-gray-600 mt-1">Upload and track PO fulfillment progress</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Upload PO + MTO File
            </button>
            <button 
              onClick={() => {
                setShowChat(true);
              }}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <MessageCircle className="h-4 w-4" />
              Messages
            </button>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-800">
            <strong>File Format:</strong> CSV/Excel with columns: PO#, Line ID, Quantity, Requested Delivery Date, Spot1-6 customization details
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => console.log('File selected:', e.target.files[0])}
        />
      </div>

      {/* PO Dashboard */}
      <div className="space-y-4">
        {/* Add filter UI above PO Dashboard */}
        <FilterBar filters={brandFilters} setFilters={setBrandFilters} showAdvanced={showBrandAdvanced} setShowAdvanced={setShowBrandAdvanced} factoryList={["GZ Totes", "EcoManufacturing Inc"]} />
        <AdvancedFilterModal filters={brandFilters} setFilters={setBrandFilters} show={showBrandAdvanced} setShow={setShowBrandAdvanced} factoryList={["GZ Totes", "EcoManufacturing Inc"]} />
        {brandPOs
          .filter(po => !brandFilters.status || po.status === brandFilters.status)
          .filter(po => !brandFilters.factory || po.factory === brandFilters.factory)
          .filter(po => !brandFilters.dateFrom || new Date(po.uploadDate) >= new Date(brandFilters.dateFrom))
          .filter(po => !brandFilters.dateTo || new Date(po.uploadDate) <= new Date(brandFilters.dateTo))
          .map((po) => (
          <div key={po.po} className={`bg-white rounded-lg shadow-sm border-l-4 transition-all ${
            po.urgent ? 'border-red-500' : po.status === 'Shipped' ? 'border-green-500' : 'border-blue-500'
          }`}>
            {/* PO Header */}
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50"
              onClick={() => togglePOExpansion(po.po)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {expandedPOs.has(po.po) ? 
                      <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    }
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{po.po}</h3>
                      {/* In PO card header, add factory and PO size */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>Factory: {po.factory || 'GZ Totes'}</span>
                        <span>•</span>
                        <span>PO Size: {po.totalUnits} units</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{po.completed}</div>
                    <div className="text-sm text-gray-600">completed ({po.percent}%)</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(po.status)}`}>
                      {po.status}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">ETA: {po.eta}</div>
                    {po.urgent && <div className="text-red-600 text-xs font-medium mt-1">🔥 URGENT</div>}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChat(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title={`Chat about ${po.po}`}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      po.status === 'Shipped' ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${po.percent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* MTO Details (Expanded) */}
            {expandedPOs.has(po.po) && (
              <div className="border-t bg-gray-50">
                <div className="p-6">
                  <h4 className="font-semibold mb-4">MTO (Line Item) Details</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Style</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customization</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {po.mtos.map((mto) => (
                          <tr key={mto.lineId} className="hover:bg-gray-50">
                            <td className="px-4 py-4 font-medium">{mto.lineId}</td>
                            <td className="px-4 py-4">{mto.qty}</td>
                            <td className="px-4 py-4 text-sm">{mto.style}</td>
                            <td className="px-4 py-4 text-sm">{mto.customization}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mto.status)}`}>
                                {mto.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">{mto.eta}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${mto.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{mto.progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <button 
                                onClick={() => {
                                  setShowChat(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                                title={`Chat about ${po.po} Line ${mto.lineId}`}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => setViewMtoDetail({ mto, po })}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {viewMtoDetail && <MtoDetailModal mto={viewMtoDetail.mto} po={viewMtoDetail.po} onClose={() => setViewMtoDetail(null)} />}
    </div>
  );

  // FACTORY VIEW - Organized with tabs
  const FactoryView = () => {
    const [activeTab, setActiveTab] = useState('po-overview');

    // PO Overview Tab Content
    const renderPOOverview = () => {
      const poGroups = factoryMTOs.reduce((acc, mto) => {
        if (!acc[mto.po]) {
          acc[mto.po] = { po: mto.po, mtos: [], totalQty: 0, completedQty: 0 };
        }
        acc[mto.po].mtos.push(mto);
        acc[mto.po].totalQty += mto.qty;
        if (mto.progress === 4) acc[mto.po].completedQty += mto.qty;
        return acc;
      }, {});

      // In FactoryView, filter data using factoryFilters
      const filteredPOGroups = Object.values(poGroups).filter(poData =>
        !factoryFilters.status || poData.mtos.some(mto => mto.status === factoryFilters.status)
      );

      return (
        <div className="space-y-6">
          {Object.values(filteredPOGroups).map((poData) => (
            <div key={poData.po} className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{poData.po}</h3>
                    <p className="text-gray-600">{poData.mtos.length} line items • {poData.totalQty} total units</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{poData.completedQty}/{poData.totalQty}</div>
                    <div className="text-sm text-gray-600">units completed</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(poData.completedQty / poData.totalQty) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="font-medium mb-4">Line Items (MTOs):</h4>
                <div className="space-y-3">
                  {poData.mtos.map((mto) => (
                    <div 
                      key={mto.lineId} 
                      className={`border rounded-lg p-4 ${
                        mto.priority === 'high' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">Line {mto.lineId}</h5>
                            {mto.priority === 'high' && (
                              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">🔥 URGENT</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{mto.qty}x {mto.style}</p>
                          <p className="text-xs text-gray-500">Due: {mto.eta}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mto.status)}`}>
                            {mto.status}
                          </span>
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={() => setActiveTab('mto-production')}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => {
                                setShowChat(true);
                              }}
                              className="text-gray-600 hover:text-gray-800"
                              title={`Chat about ${mto.po} Line ${mto.lineId}`}
                            >
                              💬
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // MTO Production Tab Content
    const renderMTOProduction = () => (
      <div className="space-y-6">
        {inventoryData.filter(m => m.status === 'short').length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Material Shortages - Production Blocked</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {inventoryData.filter(m => m.status === 'short').map((material) => (
                <div key={material.material} className="bg-white rounded p-3 border border-red-200">
                  <div className="font-medium text-red-800">{material.material}</div>
                  <div className="text-sm text-red-600">Need: {material.needed} | Have: {material.inStock} | Short: {material.needed - material.inStock}</div>
                  <div className="text-xs text-gray-600 mt-1">Blocks MTOs: {material.usedBy.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Individual MTO Production</h2>
            <div className="text-sm text-gray-600">
              {factoryMTOs.filter(m => m.progress < 4).length} active MTOs
            </div>
          </div>
          
          {/* In renderMTOProduction, filter data using factoryFilters */}
          {factoryMTOs.filter(mto =>
            (!factoryFilters.status || mto.status === factoryFilters.status) &&
            (!factoryFilters.dateFrom || new Date(mto.actualStartDate || '1970-01-01') >= new Date(factoryFilters.dateFrom)) &&
            (!factoryFilters.dateTo || new Date(mto.actualStartDate || '2100-01-01') <= new Date(factoryFilters.dateTo))
          ).map((mto) => (
            <div 
              key={`${mto.po}-${mto.lineId}`} 
              className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${
                mto.priority === 'high' ? 'border-red-500' : 
                mto.progress === 4 ? 'border-green-500' : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      MTO: {mto.po} - Line {mto.lineId}
                    </h3>
                    {mto.priority === 'high' && (
                      <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">🔥 HIGH PRIORITY</span>
                    )}
                    {mto.progress === 4 && (
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">✅ COMPLETED</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Product:</span>
                      <span className="ml-2 font-medium">{mto.qty}x {mto.style}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Due Date:</span>
                      <span className="ml-2 font-medium">{mto.eta}</span>
                    </div>
                    {mto.actualStartDate && (
                      <>
                        <div>
                          <span className="text-gray-600">Started:</span>
                          <span className="ml-2 font-medium">{mto.actualStartDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Est. Ship:</span>
                          <span className="ml-2 font-medium">{mto.estimatedShipDate || 'TBD'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mto.status)}`}>
                    {mto.status}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {mto.progress < 4 && (
                      <button 
                        onClick={() => advanceStatus(mto)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        {mto.progress === 0 ? 'Start Production' : 
                         mto.progress === 1 ? 'Move to QC' :
                         mto.progress === 2 ? 'Ready to Ship' :
                         'Mark Shipped'}
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setShowChat(true);
                      }}
                      className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50"
                      title={`Chat about ${mto.po} Line ${mto.lineId}`}
                    >
                      💬 Chat
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Production Workflow:</h4>
                <div className="flex items-center justify-between">
                  {getProgressSteps(mto.progress).map((step, index) => (
                    <div key={index} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold ${
                        step.completed ? 'bg-green-600 border-green-600 text-white' :
                        step.current ? 'bg-blue-600 border-blue-600 text-white' :
                        'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <div className="ml-2 text-xs font-medium flex-1">{step.name}</div>
                      {index < 4 && (
                        <div className={`flex-1 h-1 mx-2 ${
                          step.completed ? 'bg-green-600' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded p-4 mb-4">
                <h4 className="font-semibold mb-3 text-blue-800">🎨 Customization Instructions for Line {mto.lineId}:</h4>
                <div className="grid grid-cols-6 gap-3">
                  {Object.entries(mto.customization).map(([spot, value]) => (
                    <div key={spot} className="text-center flex flex-col items-center gap-1">
                      <div className="text-xs font-bold text-blue-600 mb-1">
                        {spot.replace('spot', 'SPOT ').toUpperCase()}
                      </div>
                      <div className={`rounded p-2 text-sm font-mono border-2 w-full flex flex-col items-center gap-2 ${
                        value === '—' ? 'bg-gray-100 border-gray-300 text-gray-400' : 'bg-white border-blue-300 text-gray-900'
                      }`}>
                        <span>{value}</span>
                        {value !== '—' && (
                          <button
                            onClick={e => { e.stopPropagation(); setQrSpot({ mto, spot, value }); }}
                            className="mt-1 p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                            title="Generate QR for this spot"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h4v4H3V3zm0 14h4v4H3v-4zm14-14h4v4h-4V3zm0 14h4v4h-4v-4z" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-blue-700">
                  ⚠️ Each spot represents a specific patch/embroidery location on the tote
                </div>
                <button
                  onClick={() => setAutoGenerateQr(mto)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h4v4H3V3zm0 14h4v4H3v-4zm14-14h4v4h-4V3zm0 14h4v4h-4v-4z" /></svg>
                  Auto Generate QR Codes for All Spots
                </button>
              </div>

              <div className="bg-gray-50 rounded p-4">
                <h4 className="font-medium mb-3">Material Requirements for this MTO:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Base Material:</span>
                    <span className="ml-2 font-medium">14oz Tote Base ({mto.qty} units)</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Patches Needed:</span>
                    <div className="ml-2">
                      {Object.entries(mto.customization)
                        .filter(([_, value]) => value !== '—')
                        .map(([spot, value]) => (
                          <div key={spot} className="text-xs">Patch {value} ({mto.qty}x)</div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const InventoryTab = () => (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Inventory Management</h2>
              <p className="text-gray-600 mt-1">Auto-calculated material needs and allocation</p>
            </div>
            <div className="flex gap-2">
              <span className="text-sm text-gray-600">
                {inventoryData.filter(i => i.status === 'short').length} shortages detected
              </span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Needed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used By MTOs</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryData.map((item) => (
                <tr key={item.material} className={`hover:bg-gray-50 ${item.status === 'short' ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 font-medium">{item.material}</td>
                  <td className="px-6 py-4">{item.needed}</td>
                  <td className="px-6 py-4">{item.inStock}</td>
                  <td className="px-6 py-4">{item.allocated}</td>
                  <td className="px-6 py-4">
                    <span className={item.inStock - item.allocated < 0 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {item.inStock - item.allocated}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'short' ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'
                    }`}>
                      {item.status === 'short' ? (
                        <>
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          Short
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 inline mr-1" />
                          OK
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.usedBy.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Inventory Actions */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Inventory auto-deducted when MTOs marked "Shipped"
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              Update Stock Levels
            </button>
          </div>
        </div>
      </div>
    );

    const ShippingTab = () => (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Shipping & Tracking</h2>
            <p className="text-gray-600 mt-1">Manage shipments and tracking information</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO / Line ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ship Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shippingData.map((shipment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{shipment.po} - Line {shipment.lineId}</td>
                    <td className="px-6 py-4">{shipment.shipDate}</td>
                    <td className="px-6 py-4">{shipment.carrier}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">{shipment.trackingNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      {shipment.files.map((file, fileIndex) => (
                        <div key={fileIndex} className="text-sm text-blue-600 cursor-pointer hover:underline">
                          📎 {file}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Ready to ship MTOs */}
                {factoryMTOs.filter(mto => mto.progress === 3).map((mto) => (
                  <tr key={`ready-${mto.po}-${mto.lineId}`} className="bg-blue-50 hover:bg-blue-100">
                    <td className="px-6 py-4 font-medium">{mto.po} - Line {mto.lineId}</td>
                    <td className="px-6 py-4">
                      <input type="date" className="border rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-4">
                      <select className="border rounded px-2 py-1 text-sm">
                        <option>UPS</option>
                        <option>FedEx</option>
                        <option>DHL</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" placeholder="Enter tracking #" className="border rounded px-2 py-1 text-sm font-mono" />
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        <Paperclip className="h-4 w-4 inline mr-1" />
                        Upload
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        Ship
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Factory Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage production, inventory, and shipping</p>
            </div>
            <button 
              onClick={() => {
                setShowChat(true);
              }}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <MessageCircle className="h-4 w-4" />
              Messages
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mt-6">
            <button
              onClick={() => setActiveTab('po-overview')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'po-overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              PO Overview
            </button>
            <button
              onClick={() => setActiveTab('mto-production')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'mto-production' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="h-4 w-4" />
              MTO Production
              {factoryMTOs.filter(m => m.progress < 4).length > 0 && (
                <span className="bg-blue-100 text-blue-600 rounded-full text-xs px-2 py-1">
                  {factoryMTOs.filter(m => m.progress < 4).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Inventory
              {inventoryData.filter(i => i.status === 'short').length > 0 && (
                <span className="bg-red-100 text-red-600 rounded-full text-xs px-2 py-1">
                  {inventoryData.filter(i => i.status === 'short').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'shipping' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Truck className="h-4 w-4" />
              Shipping
              {factoryMTOs.filter(m => m.progress === 3).length > 0 && (
                <span className="bg-green-100 text-green-600 rounded-full text-xs px-2 py-1">
                  {factoryMTOs.filter(m => m.progress === 3).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'po-overview' && (
          <>
            {/* Add filter UI above PO Overview */}
            <FilterBar filters={factoryFilters} setFilters={setFactoryFilters} showAdvanced={showFactoryAdvanced} setShowAdvanced={setShowFactoryAdvanced} />
            <AdvancedFilterModal filters={factoryFilters} setFilters={setFactoryFilters} show={showFactoryAdvanced} setShow={setShowFactoryAdvanced} />
            {renderPOOverview()}
          </>
        )}
        {activeTab === 'mto-production' && (
          <>
            {/* Add filter UI above MTO Production */}
            <FilterBar filters={factoryFilters} setFilters={setFactoryFilters} showAdvanced={showFactoryAdvanced} setShowAdvanced={setShowFactoryAdvanced} />
            <AdvancedFilterModal filters={factoryFilters} setFilters={setFactoryFilters} show={showFactoryAdvanced} setShow={setShowFactoryAdvanced} />
            {renderMTOProduction()}
          </>
        )}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'shipping' && <ShippingTab />}
      </div>
    );
  };

  // ADMIN VIEW - Complete management features
  const AdminView = () => (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        {/* System Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{brandPOs.length}</div>
            <div className="text-gray-600">Active POs</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">8</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {inventoryData.filter(m => m.status === 'short').length}
            </div>
            <div className="text-gray-600">Material Alerts</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">2</div>
            <div className="text-gray-600">Connected Factories</div>
          </div>
        </div>

        {/* PO/MTO Oversight */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">PO / MTO Oversight</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brandPOs.map((po) => (
                  <tr key={po.po} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{po.po}</td>
                    <td className="px-6 py-4">BaubleBar</td>
                    <td className="px-6 py-4">GZ Totes</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span>{po.percent}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${po.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Chat Component with Tabs
  const ChatOverlay = () => {

    // Get all unique chat contexts from messages
    const chatContexts = chatMessages.reduce((contexts, msg) => {
      if (msg.po && msg.mto) {
        const contextId = `${msg.po}-${msg.mto}`;
        if (!contexts.find(c => c.id === contextId)) {
          contexts.push({ id: contextId, title: `${msg.po} Line ${msg.mto}`, type: 'mto', po: msg.po, mto: msg.mto });
        }
      } else if (msg.po) {
        const contextId = `po-${msg.po}`;
        if (!contexts.find(c => c.id === contextId)) {
          contexts.push({ id: contextId, title: `PO ${msg.po}`, type: 'po', po: msg.po, mto: '' });
        }
      }
      return contexts;
    }, []);

    // Add new contexts to tabs if they don't exist
    chatContexts.forEach(context => {
      if (!chatTabs.find(tab => tab.id === context.id)) {
        setChatTabs(prev => [...prev, context]);
      }
    });

    const currentChatTarget = chatTabs.find(tab => tab.id === activeChatTab) || chatTabs[0];
    
    const filteredMessages = chatMessages.filter(msg => {
      if (currentChatTarget.type === 'general') return true;
      if (currentChatTarget.type === 'po') return msg.po === currentChatTarget.po;
      if (currentChatTarget.type === 'mto') return msg.po === currentChatTarget.po && msg.mto === currentChatTarget.mto;
      return true;
    });

    const addNewChat = (type, po, mto) => {
      let newTab;
      if (type === 'mto') {
        newTab = { id: `${po}-${mto}`, title: `${po} Line ${mto}`, type, po, mto };
      } else if (type === 'po') {
        newTab = { id: `po-${po}`, title: `PO ${po}`, type, po, mto: '' };
      } else {
        newTab = { id: 'general', title: 'General', type: 'general', po: '', mto: '' };
      }
      
      if (!chatTabs.find(tab => tab.id === newTab.id)) {
        setChatTabs(prev => [...prev, newTab]);
      }
      setActiveChatTab(newTab.id);
    };

    const removeTab = (tabId) => {
      if (chatTabs.length > 1) {
        setChatTabs(prev => prev.filter(tab => tab.id !== tabId));
        if (activeChatTab === tabId) {
          setActiveChatTab(chatTabs[0].id);
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-[800px] h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-lg">Messages</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => addNewChat('general', '', '')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + New Chat
              </button>
              <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Tabs */}
          <div className="border-b bg-gray-50">
            <div className="flex overflow-x-auto">
              {chatTabs.map((tab) => (
                <div key={tab.id} className="flex items-center">
                  <button
                    onClick={() => setActiveChatTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium border-r border-gray-200 whitespace-nowrap ${
                      activeChatTab === tab.id 
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.title}
                  </button>
                  {tab.id !== 'general' && (
                    <button
                      onClick={() => removeTab(tab.id)}
                      className="px-2 py-2 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {filteredMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === (currentView === 'brand' ? 'Brand' : 'Factory') ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md px-4 py-3 rounded-lg shadow-sm ${
                    msg.sender === (currentView === 'brand' ? 'Brand' : 'Factory') 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium opacity-75">{msg.sender}</span>
                      <span className="text-xs opacity-75">{msg.time}</span>
                    </div>
                    <div className="text-sm">{msg.message}</div>
                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-opacity-20">
                        {msg.files.map((file, index) => (
                          <div key={index} className="flex items-center text-xs opacity-75 cursor-pointer hover:opacity-100">
                            <Paperclip className="h-3 w-3 mr-1" />
                            {file}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Type message for ${currentChatTarget.title}...`}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button 
                onClick={sendMessage} 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modern FilterBar component
  const statusOptions = [
    { value: '', label: 'All', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'Not Started', label: 'Not Started', icon: <Clock className="h-4 w-4" /> },
    { value: 'In Production', label: 'In Production', icon: <Play className="h-4 w-4" /> },
    { value: 'QC', label: 'QC', icon: <CheckCircle2 className="h-4 w-4" /> },
    { value: 'Shipped', label: 'Shipped', icon: <Truck className="h-4 w-4" /> },
  ];

  function FilterBar({ filters, setFilters, showAdvanced, setShowAdvanced, factoryList }) {
    return (
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 mb-4 border border-blue-100 animate-fade-in">
        {/* Status pill buttons */}
        <div className="flex gap-1">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilters(f => ({ ...f, status: opt.value }))}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 border-2 focus:outline-none
                ${filters.status === opt.value ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
        {/* Filter chips for active filters */}
        <div className="flex gap-2 ml-2">
          {filters.factory && (
            <span className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium shadow-sm animate-pop-in">
              <Building2 className="h-3 w-3 mr-1" />
              {filters.factory}
              <button onClick={() => setFilters(f => ({ ...f, factory: '' }))} className="ml-1 text-blue-500 hover:text-blue-800"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium shadow-sm animate-pop-in">
              <Calendar className="h-3 w-3 mr-1" />
              From {filters.dateFrom}
              <button onClick={() => setFilters(f => ({ ...f, dateFrom: '' }))} className="ml-1 text-blue-500 hover:text-blue-800"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.dateTo && (
            <span className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium shadow-sm animate-pop-in">
              <Calendar className="h-3 w-3 mr-1" />
              To {filters.dateTo}
              <button onClick={() => setFilters(f => ({ ...f, dateTo: '' }))} className="ml-1 text-blue-500 hover:text-blue-800"><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
        {/* Advanced filter button */}
        <button onClick={() => setShowAdvanced(true)} className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-sm border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 shadow-sm">
          <Filter className="h-4 w-4" /> Advanced
        </button>
      </div>
    );
  }

  // Advanced filter modal
  function AdvancedFilterModal({ filters, setFilters, show, setShow, factoryList }) {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl p-6 w-80 border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-blue-700">Advanced Filters</h3>
            <button onClick={() => setShow(false)} className="text-gray-400 hover:text-blue-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            {factoryList && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Factory</label>
                <select value={filters.factory} onChange={e => setFilters(f => ({ ...f, factory: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full">
                  <option value="">All</option>
                  {factoryList.map(fac => <option key={fac} value={fac}>{fac}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
              <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
              <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} className="border rounded px-2 py-1 text-sm w-full" />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => setShow(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply</button>
          </div>
        </div>
      </div>
    );
  }

  // Add MTO Detail Modal component
  function MtoDetailModal({ mto, po, onClose }) {
    if (!mto) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg border border-blue-200 relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600"><X className="h-5 w-5" /></button>
          <h2 className="text-xl font-bold text-blue-700 mb-2">Peak Order – MTO Details</h2>
          <div className="mb-4 text-sm text-gray-500">PO: <span className="font-semibold text-gray-900">{po.po}</span> | Line ID: <span className="font-semibold text-gray-900">{mto.lineId}</span></div>
          <div className="space-y-2">
            <div><span className="font-medium text-gray-700">Style:</span> {mto.style}</div>
            <div><span className="font-medium text-gray-700">Quantity:</span> {mto.qty}</div>
            <div><span className="font-medium text-gray-700">Customization:</span> {mto.customization}</div>
            <div><span className="font-medium text-gray-700">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mto.status)}`}>{mto.status}</span></div>
            <div><span className="font-medium text-gray-700">ETA:</span> {mto.eta}</div>
            <div className="flex items-center gap-2"><span className="font-medium text-gray-700">Progress:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${mto.progress}%` }}></div>
              </div>
              <span className="text-xs text-gray-600">{mto.progress}%</span>
            </div>
          </div>
          {/* Add more details as needed, e.g. files, comments */}
        </div>
      </div>
    );
  }

  // Add QR Modal component
  function QrModal({ mto, onClose }) {
    if (!mto) return null;
    const qrData = encodeURIComponent(`PO:${mto.po}|Line:${mto.lineId}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=200x200`;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs border border-blue-200 relative flex flex-col items-center">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600"><X className="h-5 w-5" /></button>
          <h2 className="text-lg font-bold text-blue-700 mb-2">MTO QR Code</h2>
          <div className="mb-2 text-xs text-gray-500">PO: {mto.po} | Line: {mto.lineId}</div>
          <img src={qrUrl} alt="QR Code" className="mb-4 border rounded" />
          <a href={qrUrl} download={`PeakOrder_PO${mto.po}_Line${mto.lineId}_QR.png`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Download QR</a>
        </div>
      </div>
    );
  }

  // Add QR Spot Modal component
  function QrSpotModal({ mto, spot, value, onClose }) {
    if (!mto || !spot) return null;
    const qrData = encodeURIComponent(`PO:${mto.po}|Line:${mto.lineId}|Spot:${spot.toUpperCase()}|Value:${value}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=200x200`;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs border border-blue-200 relative flex flex-col items-center">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600"><X className="h-5 w-5" /></button>
          <h2 className="text-lg font-bold text-blue-700 mb-2">Spot QR Code</h2>
          <div className="mb-2 text-xs text-gray-500">PO: {mto.po} | Line: {mto.lineId} | {spot.replace('spot', 'SPOT ').toUpperCase()}</div>
          <div className="mb-2 text-xs text-gray-700">Value: {value}</div>
          <img src={qrUrl} alt="QR Code" className="mb-4 border rounded" />
          <a href={qrUrl} download={`PeakOrder_PO${mto.po}_Line${mto.lineId}_${spot.toUpperCase()}_QR.png`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Download QR</a>
        </div>
      </div>
    );
  }

  // Add Auto Generate QR Modal component
  function AutoGenerateQrModal({ mto, onClose }) {
    if (!mto) return null;
    const spotsWithValues = Object.entries(mto.customization).filter(([_, value]) => value !== '—');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md border border-blue-200 relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600"><X className="h-5 w-5" /></button>
          <h2 className="text-lg font-bold text-blue-700 mb-2">Auto Generate QR Codes</h2>
          <div className="mb-4 text-sm text-gray-500">PO: {mto.po} | Line: {mto.lineId}</div>
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">QR codes will be generated for {spotsWithValues.length} spots:</p>
            <div className="grid grid-cols-2 gap-2">
              {spotsWithValues.map(([spot, value]) => (
                <div key={spot} className="text-xs bg-gray-50 p-2 rounded">
                  <span className="font-medium">{spot.replace('spot', 'SPOT ').toUpperCase()}:</span> {value}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {spotsWithValues.map(([spot, value]) => {
              const qrData = encodeURIComponent(`PO:${mto.po}|Line:${mto.lineId}|Spot:${spot.toUpperCase()}|Value:${value}`);
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=200x200`;
              return (
                <a
                  key={spot}
                  href={qrUrl}
                  download={`PeakOrder_PO${mto.po}_Line${mto.lineId}_${spot.toUpperCase()}_QR.png`}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
                >
                  Download {spot.replace('spot', 'SPOT ').toUpperCase()}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">Peak Order</h1>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('brand')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    currentView === 'brand' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Brand Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('factory')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    currentView === 'factory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Factory Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    currentView === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Admin Panel
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-800"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-1 rounded-full ${
                              notification.type === 'status' ? 'bg-blue-100' :
                              notification.type === 'delay' ? 'bg-red-100' : 
                              notification.type === 'message' ? 'bg-green-100' : 'bg-purple-100'
                            }`}>
                              {notification.type === 'status' && <Package className="h-4 w-4 text-blue-600" />}
                              {notification.type === 'delay' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                              {notification.type === 'message' && <MessageCircle className="h-4 w-4 text-green-600" />}
                              {notification.type === 'shipping' && <Truck className="h-4 w-4 text-purple-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {currentView === 'brand' ? 'Alice Chen (BaubleBar)' : 
                 currentView === 'factory' ? 'John Kim (GZ Totes)' : 'System Admin'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-6">
        {currentView === 'brand' && <BrandView />}
        {currentView === 'factory' && <FactoryView />}
        {currentView === 'admin' && <AdminView />}
      </div>

      {/* Chat Overlay */}
      {showChat && <ChatOverlay />}
      {qrMto && <QrModal mto={qrMto} onClose={() => setQrMto(null)} />}
      {qrSpot && <QrSpotModal mto={qrSpot.mto} spot={qrSpot.spot} value={qrSpot.value} onClose={() => setQrSpot(null)} />}
      {autoGenerateQr && <AutoGenerateQrModal mto={autoGenerateQr} onClose={() => setAutoGenerateQr(null)} />}
    </div>
  );
};

export default BaubleBarDemo;