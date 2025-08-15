import React, { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, X, Eye, Send, Scan, Package, MessageCircle, RefreshCw, Clock, TrendingUp, BarChart3, FileText, ExternalLink, Truck, ArrowRight, QrCode, Hash, Camera, Zap } from 'lucide-react';

const DefectManagement = ({ mtoData = [], onOpenChat }) => {
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [reproductionMode, setReproductionMode] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [defectReport, setDefectReport] = useState({
    category: '',
    description: '',
    severity: 'medium',
    images: []
  });
  const [chatMessage, setChatMessage] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [scanningStep, setScanningStep] = useState('setup'); // 'setup', 'scan', 'complete'

  // Generate defect data with NetSuite integration
  const defectData = useMemo(() => {
    const defects = [];
    const defectTypes = [
      { type: 'missing', category: 'Missing Items', icon: Package, severity: 'high' },
      { type: 'defect_bag', category: 'Bag Production Defect', icon: AlertTriangle, severity: 'critical' },
      { type: 'defect_embroidery', category: 'Embroidery Defect', icon: AlertCircle, severity: 'medium' },
      { type: 'quality', category: 'Quality Issue', icon: Eye, severity: 'medium' },
      { type: 'damage', category: 'Shipping Damage', icon: Truck, severity: 'high' }
    ];

    // Generate more defects with various statuses
    mtoData.slice(0, 50).forEach((mto, index) => {
      // Generate random defects (60% chance for more defects)
      if (Math.random() > 0.4) {
        const defectType = defectTypes[Math.floor(Math.random() * defectTypes.length)];
        
        // Determine status with more variety
        const statusOptions = ['open', 'investigating', 'in_reproduction', 'reproduction_complete', 'shipped', 'resolved'];
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        // Generate completion details based on status
        const completionDetails = generateCompletionDetails(randomStatus, defectType.severity);
        
        defects.push({
          id: `DEF-${String(1000 + index).padStart(4, '0')}`,
          mtoId: mto.id || `MTO-${index}`,
          soReference: `SO-${String(50000 + index).padStart(5, '0')}`,
          barcode: `BC${String(Date.now() + index).substr(-10)}`,
          qrCode: `QR${String(Date.now() + index).substr(-10)}`,
          type: defectType.type,
          category: defectType.category,
          severity: defectType.severity,
          description: generateDefectDescription(defectType.type),
          status: randomStatus,
          reportedBy: ['QC Inspector', 'Production Manager', 'Shipping Team'][Math.floor(Math.random() * 3)],
          reportedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          affectedQuantity: Math.floor(Math.random() * 5) + 1,
          reproductionRequired: defectType.severity === 'critical' || Math.random() > 0.6,
          completionDetails: completionDetails,
          netsuiteSync: {
            synced: Math.random() > 0.3,
            lastSync: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
            netsuiteId: `NS-${String(900000 + index).padStart(6, '0')}`,
            status: Math.random() > 0.3 ? 'synced' : 'pending'
          },
          painPoints: generatePainPoints(defectType.type),
          actions: generateActions(randomStatus),
          images: [],
          chatThread: `chat_${defectType.type}_${index}`
        });
      }
    });

    return defects;
  }, [mtoData]);

  function generateDefectDescription(type) {
    const descriptions = {
      missing: 'Missing customization patch or component during final inspection',
      defect_bag: 'Structural defect in bag construction - seam failure or material flaw',
      defect_embroidery: 'Embroidery misalignment, thread breaks, or color inconsistency',
      quality: 'Does not meet quality standards for customer delivery',
      damage: 'Product damaged during packaging or shipping process'
    };
    return descriptions[type] || 'Quality issue detected';
  }

  function generatePainPoints(type) {
    const painPoints = {
      missing: ['Inventory shortage', 'Production scheduling error', 'Material tracking failure'],
      defect_bag: ['Equipment malfunction', 'Material quality issue', 'Training requirement'],
      defect_embroidery: ['Machine calibration', 'Thread quality', 'Design complexity'],
      quality: ['Process deviation', 'Inspection gap', 'Standard clarification'],
      damage: ['Packaging inadequacy', 'Handling procedure', 'Shipping method']
    };
    return painPoints[type] || ['Process improvement needed'];
  }

  function generateCompletionDetails(status, severity) {
    const details = {
      open: null,
      investigating: {
        assignedTo: 'QC Team',
        startDate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        estimatedCompletion: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      in_reproduction: {
        reproductionMTO: `MTO-REP-${Math.floor(Math.random() * 1000)}`,
        startDate: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
        progress: Math.floor(Math.random() * 80) + 20,
        estimatedCompletion: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      reproduction_complete: {
        reproductionMTO: `MTO-REP-${Math.floor(Math.random() * 1000)}`,
        completedDate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        awaitingShipment: true,
        trackingNumber: null
      },
      shipped: {
        reproductionMTO: `MTO-REP-${Math.floor(Math.random() * 1000)}`,
        shippedDate: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
        trackingNumber: `TRK${Math.floor(Math.random() * 900000) + 100000}`,
        carrier: ['FedEx', 'UPS', 'DHL'][Math.floor(Math.random() * 3)],
        estimatedDelivery: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      resolved: {
        resolvedDate: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        resolution: severity === 'critical' ? 'Replaced and delivered' : 'Issue corrected',
        verifiedBy: 'Customer Service',
        customerSatisfied: true
      }
    };
    return details[status];
  }

  function generateActions(status) {
    const actions = [];
    const now = Date.now();
    
    if (status !== 'open') {
      actions.push({
        type: 'status_change',
        from: 'open',
        to: 'investigating',
        timestamp: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'QC Manager'
      });
    }
    
    if (['in_reproduction', 'reproduction_complete', 'shipped', 'resolved'].includes(status)) {
      actions.push({
        type: 'reproduction_started',
        timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Production Team',
        note: 'Reproduction MTO created'
      });
    }
    
    if (['reproduction_complete', 'shipped', 'resolved'].includes(status)) {
      actions.push({
        type: 'reproduction_complete',
        timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Production Team',
        note: 'Quality check passed'
      });
    }
    
    if (['shipped', 'resolved'].includes(status)) {
      actions.push({
        type: 'shipped',
        timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Shipping Team',
        note: 'Package dispatched'
      });
    }
    
    if (status === 'resolved') {
      actions.push({
        type: 'resolved',
        timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Customer Service',
        note: 'Customer confirmed receipt'
      });
    }
    
    return actions;
  }

  const handleBarcodeScanning = (defectId) => {
    setScannerActive(true);
    setScannedBarcode('');
    setScanningStep('setup');
    setDefectReport({
      category: '',
      description: '',
      severity: 'medium',
      images: []
    });
    
    // Store defect id if scanning existing defect
    if (defectId) {
      const defect = defectData.find(d => d.id === defectId);
      if (defect) {
        setDefectReport(prev => ({
          ...prev,
          defectId: defectId,
          relatedBarcode: defect.barcode
        }));
      }
    }
  };

  const startScanning = () => {
    // Validate that required fields are filled
    if (!defectReport.category || !defectReport.severity) {
      alert('Please select issue category and urgency level before scanning');
      return;
    }
    
    setScanningStep('scan');
    
    // Simulate barcode scanning
    setTimeout(() => {
      // Generate or use existing barcode
      const barcode = defectReport.relatedBarcode || `BC${Date.now()}`;
      setScannedBarcode(barcode);
      setScanningStep('complete');
    }, 2000);
  };

  const handleDefectSubmit = () => {
    // Process the defect report
    console.log('Submitting defect report:', {
      barcode: scannedBarcode,
      ...defectReport
    });
    
    setScannerActive(false);
    setScanningStep('setup');
    setDefectReport({
      category: '',
      description: '',
      severity: 'medium',
      images: []
    });
  };

  const handleReproduction = (defectId) => {
    const defect = defectData.find(d => d.id === defectId);
    if (defect) {
      setReproductionMode(true);
      console.log('Creating reproduction MTO for defect:', {
        originalMTO: defect.mtoId,
        defectId: defectId,
        reproductionMTO: `${defect.mtoId}-REP`,
        priority: 'urgent',
        highlightDefect: true,
        specialInstructions: `Reproduction due to ${defect.category.toLowerCase()}`
      });
    }
  };

  const sendToChatSystem = (defect) => {
    const chatData = {
      threadId: defect.chatThread,
      defectId: defect.id,
      mtoId: defect.mtoId,
      category: defect.category,
      severity: defect.severity,
      message: `Defect reported: ${defect.description}`,
      participants: ['QC Team', 'Production Manager', 'Customer Service'],
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending to Chat System:', chatData);
    
    // Open chat with defect context
    if (onOpenChat) {
      onOpenChat({
        type: 'defect',
        id: defect.id,
        title: `Defect ${defect.id} - ${defect.category}`,
        context: chatData
      });
    }
  };

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: { color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
      low: { color: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500' }
    };
    return configs[severity] || configs.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      open: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Open' },
      investigating: { color: 'bg-yellow-100 text-yellow-800', icon: Eye, label: 'Investigating' },
      in_reproduction: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'In Reproduction' },
      reproduction_complete: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle2, label: 'Reproduction Complete' },
      shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck, label: 'Shipped' },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Resolved' }
    };
    return configs[status] || configs.open;
  };

  const filteredDefects = defectData.filter(defect => 
    filterSeverity === 'all' || defect.severity === filterSeverity
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              Defect Management System
            </h1>
            <p className="text-slate-600 mt-1">Pain points tracking with NetSuite integration</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <button
              onClick={() => setScannerActive(!scannerActive)}
              className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${
                scannerActive 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Scan className="h-4 w-4" />
              {scannerActive ? 'Scanning...' : 'Start Scanner'}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-6 gap-4 mt-6">
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Open</p>
                <p className="text-2xl font-bold text-red-900">
                  {defectData.filter(d => d.status === 'open').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Investigating</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {defectData.filter(d => d.status === 'investigating').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">In Reproduction</p>
                <p className="text-2xl font-bold text-blue-900">
                  {defectData.filter(d => d.status === 'in_reproduction').length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Ready to Ship</p>
                <p className="text-2xl font-bold text-purple-900">
                  {defectData.filter(d => d.status === 'reproduction_complete').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Shipped</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {defectData.filter(d => d.status === 'shipped').length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Resolved</p>
                <p className="text-2xl font-bold text-green-900">
                  {defectData.filter(d => d.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Defects List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold">Active Defects</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {filteredDefects.map((defect) => {
            const severityConfig = getSeverityConfig(defect.severity);
            const statusConfig = getStatusConfig(defect.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={defect.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Defect ID with Barcode Icons */}
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${severityConfig.dot}`}></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{defect.id}</p>
                          <div className="flex items-center gap-1">
                            <QrCode className="h-4 w-4 text-blue-600 cursor-pointer hover:text-blue-800" title={defect.qrCode} />
                            <Hash className="h-4 w-4 text-green-600 cursor-pointer hover:text-green-800" title={defect.barcode} />
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">MTO: {defect.mtoId}</p>
                      </div>
                    </div>

                    {/* Category and Status */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`px-3 py-1 rounded-lg border ${severityConfig.color} inline-block`}>
                          <span className="text-sm font-medium">{defect.category}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-lg ${statusConfig.color} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          <span className="text-xs font-medium">{statusConfig.label}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 max-w-md">{defect.description}</p>
                      
                      {/* Show completion status inline */}
                      {defect.completionDetails && (
                        <div className="mt-2 text-xs text-slate-600">
                          {defect.status === 'in_reproduction' && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-xs">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${defect.completionDetails.progress}%` }}
                                />
                              </div>
                              <span>{defect.completionDetails.progress}% Complete</span>
                            </div>
                          )}
                          {defect.status === 'shipped' && defect.completionDetails.trackingNumber && (
                            <div className="flex items-center gap-2">
                              <Truck className="h-3 w-3" />
                              <span>{defect.completionDetails.carrier}: {defect.completionDetails.trackingNumber}</span>
                            </div>
                          )}
                          {defect.status === 'resolved' && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span>{defect.completionDetails.resolution}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* NetSuite Sync Status */}
                    <div className="text-center">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                        defect.netsuiteSync.synced 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        <ExternalLink className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {defect.netsuiteSync.synced ? 'Synced' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{defect.netsuiteSync.netsuiteId}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {/* Scanner Button */}
                    <button
                      onClick={() => handleBarcodeScanning(defect.id)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Scan for SO Reference"
                    >
                      <Scan className="h-4 w-4" />
                    </button>

                    {/* Reproduction Button */}
                    {defect.reproductionRequired && defect.status !== 'resolved' && (
                      <button
                        onClick={() => handleReproduction(defect.id)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                        title="Create Reproduction MTO"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reproduce
                      </button>
                    )}

                    {/* Chat Button */}
                    <button
                      onClick={() => sendToChatSystem(defect)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Send to Chat"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>

                    {/* View Details */}
                    <button
                      onClick={() => setSelectedDefect(selectedDefect?.id === defect.id ? null : defect)}
                      className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedDefect?.id === defect.id && (
                  <div className="mt-4 bg-slate-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Pain Points */}
                      <div>
                        <h4 className="font-semibold mb-2">Identified Pain Points:</h4>
                        <ul className="space-y-1">
                          {defect.painPoints.map((point, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action History */}
                      <div>
                        <h4 className="font-semibold mb-2">Action History:</h4>
                        <div className="space-y-2">
                          {defect.actions.length > 0 ? (
                            defect.actions.map((action, idx) => (
                              <div key={idx} className="text-xs border-l-2 border-slate-300 pl-3 py-1">
                                <div className="font-medium text-slate-700">
                                  {action.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                                <div className="text-slate-600">
                                  {new Date(action.timestamp).toLocaleDateString()} - {action.user}
                                </div>
                                {action.note && <div className="text-slate-500 italic">{action.note}</div>}
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">No actions yet</span>
                          )}
                        </div>
                      </div>

                      {/* Completion Details */}
                      <div>
                        <h4 className="font-semibold mb-2">Resolution Details:</h4>
                        <div className="space-y-2">
                          {defect.completionDetails ? (
                            <>
                              {defect.status === 'investigating' && (
                                <>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Eye className="h-3 w-3 text-yellow-500" />
                                    <span>Assigned to: {defect.completionDetails.assignedTo}</span>
                                  </div>
                                  <div className="text-xs text-slate-600">
                                    Est. completion: {new Date(defect.completionDetails.estimatedCompletion).toLocaleDateString()}
                                  </div>
                                </>
                              )}
                              {(defect.status === 'in_reproduction' || defect.status === 'reproduction_complete' || defect.status === 'shipped') && (
                                <div className="flex items-center gap-2 text-sm">
                                  <RefreshCw className="h-3 w-3 text-blue-500" />
                                  <span>Reproduction: {defect.completionDetails.reproductionMTO}</span>
                                </div>
                              )}
                              {defect.status === 'shipped' && (
                                <>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Truck className="h-3 w-3 text-indigo-500" />
                                    <span>{defect.completionDetails.carrier} - {defect.completionDetails.trackingNumber}</span>
                                  </div>
                                  <div className="text-xs text-slate-600">
                                    Est. delivery: {new Date(defect.completionDetails.estimatedDelivery).toLocaleDateString()}
                                  </div>
                                </>
                              )}
                              {defect.status === 'resolved' && (
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  <span>Verified by: {defect.completionDetails.verifiedBy}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {defect.reproductionRequired && (
                                <div className="flex items-center gap-2 text-sm">
                                  <RefreshCw className="h-3 w-3 text-orange-500" />
                                  <span>Reproduction Required</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <MessageCircle className="h-3 w-3 text-green-500" />
                                <span>Chat: {defect.chatThread}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <ExternalLink className="h-3 w-3 text-blue-500" />
                                <span>NetSuite: {defect.netsuiteSync.netsuiteId}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Scanner Modal */}
      {scannerActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {scanningStep === 'setup' ? 'Report Defect' : 
                   scanningStep === 'scan' ? 'Scanning Barcode' : 'Defect Reported'}
                </h3>
                <button
                  onClick={() => {
                    setScannerActive(false);
                    setScanningStep('setup');
                  }}
                  className="p-2 hover:bg-slate-200 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {scanningStep === 'setup' && (
                <div className="space-y-4">
                  {/* Issue Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Defect Reason <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={defectReport.category}
                      onChange={(e) => setDefectReport({...defectReport, category: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Choose defect reason...</option>
                      <option value="missing">Missing Items</option>
                      <option value="defect_bag">Bag Production Defect</option>
                      <option value="defect_embroidery">Embroidery Defect</option>
                      <option value="quality">Quality Issue</option>
                      <option value="damage">Shipping Damage</option>
                    </select>
                  </div>
                  
                  {/* Urgency/Severity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Urgency <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={defectReport.severity}
                      onChange={(e) => setDefectReport({...defectReport, severity: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="low">Low - Can wait</option>
                      <option value="medium">Medium - Address soon</option>
                      <option value="high">High - Urgent attention</option>
                      <option value="critical">Critical - Stop production</option>
                    </select>
                  </div>
                  
                  {/* Free Text Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Free Text (Optional)
                    </label>
                    <textarea
                      value={defectReport.description}
                      onChange={(e) => setDefectReport({...defectReport, description: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows="3"
                      placeholder="Additional details about the defect..."
                    />
                  </div>
                  
                  {/* Camera Access Button */}
                  <div className="pt-4">
                    <button
                      onClick={startScanning}
                      disabled={!defectReport.category || !defectReport.severity}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Camera className="h-5 w-5" />
                      Open Camera to Scan Barcode
                    </button>
                    {(!defectReport.category || !defectReport.severity) && (
                      <p className="text-xs text-red-500 mt-2 text-center">
                        Please select defect reason and urgency before scanning
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {scanningStep === 'scan' && (
                <div className="text-center py-8">
                  <div className="w-32 h-32 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center relative">
                    <Camera className="h-16 w-16 text-blue-600 animate-pulse" />
                    <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-ping"></div>
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">Scan the Barcode</h4>
                  <p className="text-slate-600 mb-4">Position the barcode within the camera view</p>
                  <div className="flex items-center justify-center gap-2">
                    <Scan className="h-5 w-5 text-blue-600 animate-pulse" />
                    <span className="text-sm text-slate-600">Scanning in progress...</span>
                  </div>
                  <div className="mt-4 w-48 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full animate-scan-progress"></div>
                  </div>
                </div>
              )}
              
              {scanningStep === 'complete' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <span className="font-semibold text-green-900">Defect Reported Successfully!</span>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Barcode:</strong> {scannedBarcode}</p>
                      <p><strong>Reason:</strong> {defectReport.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p><strong>Urgency:</strong> {defectReport.severity.charAt(0).toUpperCase() + defectReport.severity.slice(1)}</p>
                      {defectReport.description && <p><strong>Notes:</strong> {defectReport.description}</p>}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setScanningStep('setup');
                        setDefectReport({
                          category: '',
                          description: '',
                          severity: 'medium',
                          images: []
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Report Another Defect
                    </button>
                    <button
                      onClick={() => {
                        setScannerActive(false);
                        setScanningStep('setup');
                      }}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reproduction Mode Indicator */}
      {reproductionMode && (
        <div className="fixed bottom-4 right-4 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="font-medium">Creating Reproduction MTO...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefectManagement;