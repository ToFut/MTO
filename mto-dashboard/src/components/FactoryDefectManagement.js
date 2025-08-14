import React, { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, X, Eye, Send, Package, MessageCircle, RefreshCw, Clock, ArrowRight, QrCode, Hash, Camera, Zap, ChevronRight, Upload, Factory, FileText, User, Truck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FactoryDefectManagement = ({ mtoData = [], onOpenChat, onCreateReproductionMTO }) => {
  const { t } = useLanguage();
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState({
    message: '',
    estimatedCompletion: '',
    rootCause: '',
    preventiveMeasures: ''
  });

  // Generate factory-specific defect data
  const defectData = useMemo(() => {
    const defects = [];
    const defectTypes = [
      { type: 'missing', category: 'Missing Items', icon: Package, severity: 'high' },
      { type: 'defect_bag', category: 'Bag Production Defect', icon: AlertTriangle, severity: 'critical' },
      { type: 'defect_embroidery', category: 'Embroidery Defect', icon: AlertCircle, severity: 'medium' },
      { type: 'quality', category: 'Quality Issue', icon: Eye, severity: 'medium' },
      { type: 'damage', category: 'Shipping Damage', icon: Package, severity: 'high' },
      { type: 'lost_transit', category: 'Lost in Transit', icon: Truck, severity: 'high' },
      { type: 'order_swap', category: 'Order Swap', icon: RefreshCw, severity: 'medium' }
    ];

    // Simulate defects assigned to factory
    mtoData.slice(0, 30).forEach((mto, index) => {
      if (Math.random() > 0.5) {
        const defectType = defectTypes[Math.floor(Math.random() * defectTypes.length)];
        const statusOptions = ['assigned', 'acknowledged', 'investigating', 'reproducing', 'completed'];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        defects.push({
          id: `DEF-${String(1000 + index).padStart(4, '0')}`,
          mtoId: mto.id || `MTO-${index}`,
          brandRef: `BR-${String(2000 + index).padStart(4, '0')}`,
          barcode: `BC${String(Date.now() + index).substr(-10)}`,
          type: defectType.type,
          category: defectType.category,
          severity: defectType.severity,
          description: `${defectType.category} reported by brand quality control`,
          status: status,
          assignedDate: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
          reportedBy: 'Brand QC Team',
          affectedQuantity: Math.floor(Math.random() * 5) + 1,
          priority: defectType.severity === 'critical' ? 'urgent' : 'normal',
          reproductionMTO: status === 'reproducing' || status === 'completed' ? `MTO-REP-${index}` : null,
          factoryResponse: status !== 'assigned' ? {
            acknowledgedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            message: 'Issue acknowledged, investigating root cause',
            estimatedCompletion: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
          } : null,
          rootCause: status === 'investigating' || status === 'reproducing' || status === 'completed' ? 
            ['Machine calibration issue', 'Material defect', 'Human error', 'Process deviation'][Math.floor(Math.random() * 4)] : null,
          preventiveMeasures: status === 'completed' ? 'Process updated and team retrained' : null
        });
      }
    });

    return defects;
  }, [mtoData]);

  const getStatusConfig = (status) => {
    const configs = {
      assigned: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: t('quality.newAssignment', 'New Assignment') },
      acknowledged: { color: 'bg-yellow-100 text-yellow-800', icon: Eye, label: t('quality.acknowledged', 'Acknowledged') },
      investigating: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, label: t('quality.investigating', 'Investigating') },
      reproducing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: t('quality.reproducing', 'Reproducing') },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: t('quality.completed', 'Completed') }
    };
    return configs[status] || configs.assigned;
  };

  const handleAcknowledge = (defect) => {
    console.log('Acknowledging defect:', defect.id);
    // Update defect status to acknowledged
  };

  const handleStartInvestigation = (defect) => {
    setSelectedDefect(defect);
    console.log('Starting investigation for:', defect.id);
  };

  const handleCreateReproduction = (defect) => {
    // Create reproduction MTO
    const reproductionData = {
      originalDefectId: defect.id,
      originalMTO: defect.mtoId,
      quantity: defect.affectedQuantity,
      priority: 'urgent',
      defectTag: true,
      defectReason: defect.category,
      specialInstructions: `Reproduction for ${defect.category} - ${defect.description}`
    };
    
    console.log('Creating reproduction MTO:', reproductionData);
    
    if (onCreateReproductionMTO) {
      onCreateReproductionMTO(reproductionData);
    }
  };

  const handleSubmitResponse = () => {
    console.log('Submitting response:', {
      defectId: respondingTo.id,
      ...response
    });
    
    setRespondingTo(null);
    setResponse({
      message: '',
      estimatedCompletion: '',
      rootCause: '',
      preventiveMeasures: ''
    });
  };

  const openDefectChat = (defect) => {
    if (onOpenChat) {
      onOpenChat({
        type: 'defect',
        id: defect.id,
        title: `Defect ${defect.id} - ${defect.category}`,
        context: {
          defectId: defect.id,
          mtoId: defect.mtoId,
          category: defect.category,
          severity: defect.severity
        }
      });
    }
  };

  // Group defects by status
  const defectsByStatus = useMemo(() => {
    return {
      new: defectData.filter(d => d.status === 'assigned'),
      active: defectData.filter(d => ['acknowledged', 'investigating', 'reproducing'].includes(d.status)),
      completed: defectData.filter(d => d.status === 'completed')
    };
  }, [defectData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Factory className="h-8 w-8 text-orange-600" />
              {t('quality.factoryDefectManagement', 'Factory Defect Management')}
            </h1>
            <p className="text-slate-600 mt-1">{t('quality.respondToDefects', 'Respond to brand-reported defects and manage reproductions')}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-600">Active Defects</p>
              <p className="text-2xl font-bold text-orange-600">{defectsByStatus.new.length + defectsByStatus.active.length}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">{t('quality.newAssignments', 'New Assignments')}</p>
                <p className="text-2xl font-bold text-red-900">{defectsByStatus.new.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">{t('quality.investigating', 'Investigating')}</p>
                <p className="text-2xl font-bold text-orange-900">
                  {defectData.filter(d => d.status === 'investigating').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">{t('quality.reproducing', 'Reproducing')}</p>
                <p className="text-2xl font-bold text-blue-900">
                  {defectData.filter(d => d.status === 'reproducing').length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">{t('quality.criticalPriority', 'Critical Priority')}</p>
                <p className="text-2xl font-bold text-purple-900">
                  {defectData.filter(d => d.severity === 'critical').length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">{t('quality.completed', 'Completed')}</p>
                <p className="text-2xl font-bold text-green-900">{defectsByStatus.completed.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Factory Experience & Expertise Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Factory className="h-6 w-6 text-blue-600" />
            {t('quality.factoryExperience', 'Factory Experience')}
          </h2>
          <span className="text-sm text-slate-600">{t('quality.last30Days', 'Last 30 Days')}</span>
        </div>
        
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">+15%</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">98.5%</p>
            <p className="text-sm text-slate-600">{t('quality.defectResolutionRate', 'Defect Resolution Rate')}</p>
            <div className="mt-2 text-xs text-slate-500">
              <div>Total: 243 defects</div>
              <div>Resolved: 239</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">-2hrs</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">4.2 hrs</p>
            <p className="text-sm text-slate-600">{t('quality.avgResponseTime', 'Avg Response Time')}</p>
            <div className="mt-2 text-xs text-slate-500">
              <div>Critical: 1.5 hrs</div>
              <div>Normal: 6.8 hrs</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">100%</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">87%</p>
            <p className="text-sm text-slate-600">{t('quality.reproductionSuccess', 'Reproduction Success')}</p>
            <div className="mt-2 text-xs text-slate-500">
              <div>Reproductions: 45</div>
              <div>Successful: 39</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">A+</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">9.6/10</p>
            <p className="text-sm text-slate-600">{t('quality.qualityScore', 'Quality Score')}</p>
            <div className="mt-2 text-xs text-slate-500">
              <div>{t('quality.defectsResolved', 'Defects Resolved')}: 239</div>
              <div>{t('quality.pendingReview', 'Pending Review')}: 4</div>
            </div>
          </div>
        </div>
        
        {/* Experience Details */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-3 border border-blue-100">
            <h4 className="font-semibold text-slate-900 text-sm mb-2">{t('quality.rootCauseAnalysis', 'Root Cause Analysis')}</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Material Issues</span>
                <span className="font-medium">32%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Process Deviation</span>
                <span className="font-medium">28%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Equipment Calibration</span>
                <span className="font-medium">20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Human Error</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Design Issue</span>
                <span className="font-medium">5%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-3 border border-blue-100">
            <h4 className="font-semibold text-slate-900 text-sm mb-2">{t('quality.preventiveMeasures', 'Preventive Measures')}</h4>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5" />
                <span>Enhanced QC checkpoints added</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5" />
                <span>Staff retrained on critical processes</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5" />
                <span>Equipment maintenance schedule updated</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5" />
                <span>Material supplier quality audit completed</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5" />
                <span>SOP documentation improved</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-3 border border-blue-100">
            <h4 className="font-semibold text-slate-900 text-sm mb-2">Top Performing Areas</h4>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Embroidery Station</span>
                  <span className="font-medium text-green-600">99.2%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '99.2%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Material Prep</span>
                  <span className="font-medium text-green-600">98.7%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '98.7%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Final QC</span>
                  <span className="font-medium text-blue-600">97.5%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '97.5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Assignments - Urgent Response Required */}
      {defectsByStatus.new.length > 0 && (
        <div className="bg-red-50 rounded-2xl shadow-sm border border-red-200">
          <div className="p-6 border-b border-red-200">
            <h2 className="text-xl font-semibold text-red-900 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              New Defect Assignments - Response Required
            </h2>
          </div>
          
          <div className="divide-y divide-red-100">
            {defectsByStatus.new.map((defect) => {
              const statusConfig = getStatusConfig(defect.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={defect.id} className="p-6 hover:bg-red-100/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-red-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{defect.id}</p>
                            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg">NEW</span>
                          </div>
                          <p className="text-sm text-slate-600">Brand Ref: {defect.brandRef}</p>
                          <p className="text-xs text-slate-500">Assigned {new Date(defect.assignedDate).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex-1 px-4">
                        <p className="font-medium text-slate-900">{defect.category}</p>
                        <p className="text-sm text-slate-700">{defect.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                          <span>MTO: {defect.mtoId}</span>
                          <span>Qty: {defect.affectedQuantity}</span>
                          <span className={`px-2 py-1 rounded ${
                            defect.severity === 'critical' ? 'bg-red-200 text-red-800' : 
                            defect.severity === 'high' ? 'bg-orange-200 text-orange-800' : 
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {defect.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAcknowledge(defect)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => setRespondingTo(defect)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Respond
                      </button>
                      <button
                        onClick={() => openDefectChat(defect)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Defects */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold">Active Defects</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {defectsByStatus.active.map((defect) => {
            const statusConfig = getStatusConfig(defect.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={defect.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${
                        defect.status === 'investigating' ? 'text-orange-600' :
                        defect.status === 'reproducing' ? 'text-blue-600 animate-spin' :
                        'text-yellow-600'
                      }`} />
                      <div>
                        <p className="font-bold text-slate-900">{defect.id}</p>
                        <p className="text-sm text-slate-600">MTO: {defect.mtoId}</p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-3 py-1 rounded-lg ${statusConfig.color} text-xs font-medium`}>
                          {statusConfig.label}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{defect.category}</span>
                      </div>
                      <p className="text-sm text-slate-600">{defect.description}</p>
                      
                      {defect.factoryResponse && (
                        <div className="mt-2 p-2 bg-slate-100 rounded text-xs">
                          <p className="font-medium">Response: {defect.factoryResponse.message}</p>
                          <p className="text-slate-600">
                            Est. completion: {new Date(defect.factoryResponse.estimatedCompletion).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      {defect.reproductionMTO && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                          <RefreshCw className="h-4 w-4" />
                          <span>Reproduction MTO: {defect.reproductionMTO}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {defect.status === 'acknowledged' && (
                      <button
                        onClick={() => handleStartInvestigation(defect)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Start Investigation
                      </button>
                    )}
                    
                    {defect.status === 'investigating' && (
                      <button
                        onClick={() => handleCreateReproduction(defect)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Create Reproduction
                      </button>
                    )}
                    
                    {defect.status === 'reproducing' && (
                      <button className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                        Reproduction in Progress
                      </button>
                    )}
                    
                    <button
                      onClick={() => openDefectChat(defect)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => setSelectedDefect(selectedDefect?.id === defect.id ? null : defect)}
                      className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedDefect?.id === defect.id && (
                  <div className="mt-4 bg-slate-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Defect Details:</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Reported by:</strong> {defect.reportedBy}</p>
                          <p><strong>Severity:</strong> {defect.severity}</p>
                          <p><strong>Affected Quantity:</strong> {defect.affectedQuantity}</p>
                          <p><strong>Root Cause:</strong> {defect.rootCause || 'Under investigation'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Actions:</h4>
                        <div className="space-y-2">
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Update Status
                          </button>
                          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                            Upload Evidence
                          </button>
                          <button className="w-full px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                            View Full History
                          </button>
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

      {/* Response Modal */}
      {respondingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Respond to Defect {respondingTo.id}</h3>
                <button
                  onClick={() => setRespondingTo(null)}
                  className="p-2 hover:bg-slate-200 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Initial Response <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={response.message}
                    onChange={(e) => setResponse({...response, message: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Acknowledge the issue and provide initial assessment..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estimated Completion Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={response.estimatedCompletion}
                    onChange={(e) => setResponse({...response, estimatedCompletion: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Root Cause Analysis
                  </label>
                  <select
                    value={response.rootCause}
                    onChange={(e) => setResponse({...response, rootCause: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select root cause...</option>
                    <option value="machine_calibration">Machine Calibration Issue</option>
                    <option value="material_defect">Material Defect</option>
                    <option value="human_error">Human Error</option>
                    <option value="process_deviation">Process Deviation</option>
                    <option value="design_issue">Design Issue</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preventive Measures
                  </label>
                  <textarea
                    value={response.preventiveMeasures}
                    onChange={(e) => setResponse({...response, preventiveMeasures: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Describe steps to prevent recurrence..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setRespondingTo(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitResponse}
                    disabled={!response.message || !response.estimatedCompletion}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300"
                  >
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactoryDefectManagement;