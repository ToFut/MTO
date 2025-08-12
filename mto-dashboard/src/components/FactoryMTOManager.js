import React, { useState, useMemo } from 'react';
import { Play, Pause, CheckCircle2, AlertCircle, Clock, Eye, Zap, ArrowRight, Circle, Dot, MoreHorizontal, Search, Filter, Calendar, User, Package2, Target, Timer, ChevronDown, ChevronRight, RefreshCw, FastForward, Image, X, MessageCircle, AlertTriangle, TrendingUp, Truck, Send, Users, Factory, BarChart3, TrendingDown, AlertOctagon, CheckSquare, Activity, QrCode, Scan, Hash, Star, Camera, Coffee, Heart, Sun, Crown, Gift } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FactoryMTOManager = ({ mtoData = [] }) => {
  const { t } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState('active'); // active, completed, all
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedMTO, setSelectedMTO] = useState(null);
  const [expandedStations, setExpandedStations] = useState({ 'station-1': true });
  const [expandedDays, setExpandedDays] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({ '2025-01': true });
  const [showChat, setShowChat] = useState(false);
  const [chatContext, setChatContext] = useState(null); // { type: 'mto'|'day'|'month', id: string }
  const [chatMessage, setChatMessage] = useState('');
  const [viewType, setViewType] = useState('station'); // 'station' | 'timeline'

  // Enhanced MTO data with more variety and alerts
  const enhancedMTOData = [
    // Generate 25+ MTOs across different days and months
    ...Array.from({ length: 25 }, (_, index) => {
      const baseDate = new Date('2025-01-15');
      const daysOffset = Math.floor(index / 3) - 5; // Spread across ~8 days
      const currentDate = new Date(baseDate.getTime() + (daysOffset * 24 * 60 * 60 * 1000));
      
      const statuses = ['pending', 'in_progress', 'quality_check', 'completed', 'on_hold'];
      const priorities = ['urgent', 'high', 'medium', 'low'];
      const stations = [
        { id: 'station-1', name: t('factory.materialPrepStation', 'Material Prep Station') },
        { id: 'station-2', name: t('factory.customizationStation', 'Customization Station') },
        { id: 'station-3', name: t('factory.qcStation', 'QC Station') },
        { id: 'station-4', name: t('factory.packagingStation', 'Packaging Station') },
        { id: 'station-5', name: t('factory.xfTransferStation', 'XF Transfer Station') }
      ];
      
      const status = statuses[index % statuses.length];
      const station = stations[index % stations.length];
      const priority = priorities[index % priorities.length];
      
      // Generate customization spots with icons
      const spotCount = Math.floor(Math.random() * 6) + 1;
      const spotColors = ['#FF6B35', '#4ECDC4', '#FFE66D', '#9B59B6', '#E74C3C', '#2ECC71'];
      const iconTypes = [
        { icon: Star, name: 'Star' },
        { icon: Heart, name: 'Heart' },
        { icon: Camera, name: 'Camera' },
        { icon: Coffee, name: 'Coffee' },
        { icon: Sun, name: 'Sun' },
        { icon: Crown, name: 'Crown' },
        { icon: Gift, name: 'Gift' }
      ];
      
      const customizations = Array.from({ length: spotCount }, (_, spotIdx) => ({
        spot: spotIdx + 1,
        type: ['Patch', 'Embroidery', 'Print', 'Logo', 'Text', 'Icon'][spotIdx % 6],
        name: [`Logo ${spotIdx + 1}`, `Text ${spotIdx + 1}`, `Icon ${spotIdx + 1}`, `Patch ${spotIdx + 1}`][spotIdx % 4],
        color: spotColors[spotIdx % spotColors.length],
        icon: iconTypes[spotIdx % iconTypes.length],
        status: status === 'completed' ? 'completed' : 
                status === 'quality_check' ? 'in_review' :
                status === 'in_progress' ? (spotIdx < 2 ? 'completed' : 'in_progress') : 'ready'
      }));
      
      // Generate alerts
      const alerts = [];
      if (Math.random() > 0.7) {
        alerts.push({
          type: 'inventory',
          message: `Low stock: ${['Canvas Natural', 'Thread Black', 'Hardware Silver'][Math.floor(Math.random() * 3)]}`,
          severity: 'warning'
        });
      }
      if (Math.random() > 0.8) {
        alerts.push({
          type: 'xf',
          message: 'XF transfer pending approval',
          severity: 'info'
        });
      }
      if (status === 'on_hold') {
        alerts.push({
          type: 'production',
          message: 'Production halted - quality issue',
          severity: 'critical'
        });
      }
      
      return {
        id: `MTO-${String(24000 + index).padStart(5, '0')}`,
        sku: `SKU-${String(1000 + index).padStart(4, '0')}`,
        productName: [
          '14oz Natural Tote - Medium',
          '14oz Canvas Tote - Large', 
          '16oz Organic Tote - Small',
          'Premium Lined Tote - XL',
          'Eco-Friendly Tote - Medium'
        ][index % 5],
        brandName: 'BaubleBar',
        customerName: `Customer ${String(index + 1).padStart(3, '0')}`,
        status: status,
        priority: priority,
        station: station.name,
        stationId: station.id,
        progress: status === 'completed' ? 100 :
                 status === 'quality_check' ? 90 + Math.floor(Math.random() * 10) :
                 status === 'in_progress' ? 30 + Math.floor(Math.random() * 50) :
                 status === 'on_hold' ? Math.floor(Math.random() * 30) : 0,
        timeRemaining: status === 'completed' ? '0m' :
                      status === 'quality_check' ? `${Math.floor(Math.random() * 2)}h ${Math.floor(Math.random() * 60)}m` :
                      `${Math.floor(Math.random() * 8) + 1}h ${Math.floor(Math.random() * 60)}m`,
        nextAction: status === 'completed' ? 'Ship' :
                   status === 'quality_check' ? 'Final Inspection' :
                   status === 'in_progress' ? 'Continue Production' :
                   status === 'on_hold' ? 'Resolve Issue' : 'Start Production',
        dueTime: `${8 + Math.floor(Math.random() * 10)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        startedAt: status !== 'pending' ? `${6 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : null,
        customizations: customizations,
        materials: ['Canvas Natural', 'Thread Black', 'Hardware Silver', 'Backing Fabric', 'Zipper', 'Label'],
        qcNotes: status === 'quality_check' ? [
          'Check customization alignment',
          'Verify thread tension',
          'Inspect handle attachment'
        ].slice(0, Math.floor(Math.random() * 3) + 1) : [],
        batch: `B2025-${String(Math.floor(index / 5) + 1).padStart(3, '0')}`,
        alerts: alerts,
        // Date information
        productionDate: currentDate.toISOString().split('T')[0],
        month: currentDate.toISOString().slice(0, 7), // YYYY-MM format
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        // XF Information
        xfDate: Math.random() > 0.3 ? currentDate.toISOString().split('T')[0] : null,
        xfStatus: Math.random() > 0.5 ? 'transferred' : 'pending',
        // Original brand data (for reference)
        originalMTO: {
          internalId: String(37483586 + index),
          po: `PO${123 + Math.floor(index / 8)}`,
          status: ['QC', 'In Production', 'Shipped'][Math.floor(Math.random() * 3)]
        }
      };
    })
  ];

  // Transform brand MTO data into factory production format
  const transformMTOData = (brandMTOs) => {
    if (!brandMTOs || brandMTOs.length === 0) return enhancedMTOData;
    
    // Combine real brand data with enhanced sample data
    const transformedBrandData = brandMTOs.map((mto, index) => {
      // Map brand status to factory production status
      const getFactoryStatus = (brandStatus) => {
        switch (brandStatus?.toLowerCase()) {
          case 'shipped': return 'completed';
          case 'qc': return 'quality_check';
          case 'in production': return 'in_progress';
          default: return 'pending';
        }
      };
      
      // Extract customization spots from brand data
      const customizations = [];
      const spotColors = ['#FF6B35', '#4ECDC4', '#FFE66D', '#9B59B6', '#E74C3C', '#2ECC71'];
      
      // Check spots 1-6
      for (let i = 1; i <= 6; i++) {
        const spotValue = mto[`spot${i}`];
        const patchRef = mto[`spot${i}PatchRef`];
        
        if (spotValue && spotValue !== '' && spotValue !== '—') {
          customizations.push({
            spot: i,
            type: patchRef ? 'Patch' : 'Custom',
            name: patchRef || `Spot ${i}`,
            color: spotColors[(i - 1) % spotColors.length],
            status: getFactoryStatus(mto.status) === 'completed' ? 'completed' : 
                   getFactoryStatus(mto.status) === 'quality_check' ? 'in_review' :
                   getFactoryStatus(mto.status) === 'in_progress' ? 'in_progress' : 'ready'
          });
        }
      }
      
      // Assign production stations based on status and index
      const stations = [
        { id: 'station-1', name: t('factory.materialPrepStation', 'Material Prep Station') },
        { id: 'station-2', name: t('factory.customizationStation', 'Customization Station') },
        { id: 'station-3', name: t('factory.qcStation', 'QC Station') },
        { id: 'station-4', name: t('factory.packagingStation', 'Packaging Station') }
      ];
      
      const station = stations[index % stations.length];
      
      // Calculate progress based on status
      const getProgress = (status) => {
        switch (status) {
          case 'completed': return 100;
          case 'quality_check': return 90;
          case 'in_progress': return Math.floor(Math.random() * 60) + 20;
          default: return 0;
        }
      };
      
      const factoryStatus = getFactoryStatus(mto.status);
      const progress = getProgress(factoryStatus);
      
      return {
        id: `MTO-${mto.internalId || (24000 + index)}`,
        sku: mto.bagBasePid || `SKU-${index + 1}`,
        productName: mto.displayName || mto.style || '14oz Natural Tote - Medium',
        brandName: 'BaubleBar',
        customerName: `Customer ${index + 1}`,
        status: factoryStatus,
        priority: mto.urgent || Math.random() > 0.7 ? 'urgent' : 
                 Math.random() > 0.5 ? 'high' : 'medium',
        station: station.name,
        stationId: station.id,
        progress: progress,
        timeRemaining: progress === 100 ? '0m' : 
                      progress > 80 ? '30m' :
                      progress > 50 ? '2h 15m' : '4h 30m',
        nextAction: factoryStatus === 'completed' ? 'Ship' :
                   factoryStatus === 'quality_check' ? 'Final Inspection' :
                   factoryStatus === 'in_progress' ? 'Continue Production' : 'Start Production',
        dueTime: mto.eta || '14:30',
        startedAt: factoryStatus !== 'pending' ? '09:15' : null,
        customizations: customizations,
        materials: ['Canvas Natural', 'Thread Black', 'Hardware Silver'],
        qcNotes: factoryStatus === 'quality_check' ? ['Check customization alignment', 'Verify patch quality'] : [],
        batch: `B2024-${String(index + 1).padStart(3, '0')}`,
        // Keep original data for reference
        originalMTO: mto,
        // Add date and alert information to brand data
        productionDate: new Date().toISOString().split('T')[0],
        month: new Date().toISOString().slice(0, 7),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        alerts: [],
        xfDate: mto.xfDate || null,
        xfStatus: 'pending'
      };
    });
    
    return [...enhancedMTOData, ...transformedBrandData];
  };

  const mtos = transformMTOData(mtoData);

  // Group MTOs by month and day for timeline view
  const timelineGroups = useMemo(() => {
    const months = {};
    mtos.forEach(mto => {
      const month = mto.month;
      const day = mto.productionDate;
      
      if (!months[month]) {
        months[month] = {
          id: month,
          name: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          days: {},
          totalMTOs: 0,
          alerts: []
        };
      }
      
      if (!months[month].days[day]) {
        months[month].days[day] = {
          id: day,
          name: new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
          mtos: [],
          alerts: []
        };
      }
      
      months[month].days[day].mtos.push(mto);
      months[month].totalMTOs++;
      
      // Aggregate alerts
      mto.alerts.forEach(alert => {
        months[month].days[day].alerts.push(alert);
        months[month].alerts.push(alert);
      });
    });
    
    return Object.values(months).map(month => ({
      ...month,
      days: Object.values(month.days)
    }));
  }, [mtos]);

  // Group MTOs by production station
  const stationGroups = useMemo(() => {
    const stations = {};
    mtos.forEach(mto => {
      const stationId = mto.stationId;
      if (!stations[stationId]) {
        stations[stationId] = {
          id: stationId,
          name: mto.station,
          mtos: [],
          activeCount: 0,
          completedCount: 0
        };
      }
      stations[stationId].mtos.push(mto);
      if (mto.status === 'in_progress' || mto.status === 'pending') {
        stations[stationId].activeCount++;
      } else if (mto.status === 'completed') {
        stations[stationId].completedCount++;
      }
    });
    return Object.values(stations);
  }, [mtos]);

  // Filter MTOs based on status and search
  const filteredMTOs = useMemo(() => {
    return mtos.filter(mto => {
      const statusMatch = selectedStatus === 'all' || 
        (selectedStatus === 'active' && ['pending', 'in_progress', 'quality_check'].includes(mto.status)) ||
        (selectedStatus === 'completed' && mto.status === 'completed');
      
      const priorityMatch = selectedPriority === 'all' || mto.priority === selectedPriority;
      
      const searchMatch = searchTerm === '' || 
        (mto.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (mto.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (mto.productName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (mto.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [mtos, selectedStatus, selectedPriority, searchTerm]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: 'bg-amber-100 text-amber-800 border-amber-200', 
        icon: Clock, 
        label: t('mto.pending', 'Pending'),
        dot: 'bg-amber-400'
      },
      in_progress: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: Play, 
        label: t('mto.inProgress', 'In Progress'),
        dot: 'bg-blue-500'
      },
      quality_check: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: Eye, 
        label: t('factory.qualityReview', 'QC Review'),
        dot: 'bg-purple-500'
      },
      completed: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle2, 
        label: t('mto.completed', 'Completed'),
        dot: 'bg-green-500'
      },
      on_hold: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: Pause, 
        label: t('mto.onHold', 'On Hold'),
        dot: 'bg-red-500'
      }
    };
    return configs[status] || configs.pending;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'URGENT' },
      high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'HIGH' },
      medium: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'MEDIUM' },
      low: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', label: 'LOW' }
    };
    return configs[priority] || configs.medium;
  };

  const handleStatusUpdate = (mtoId, newStatus) => {
    console.log(`Updating MTO ${mtoId} to status: ${newStatus}`);
    // In real implementation, this would update the backend
  };

  const advanceToNextStep = (mtoId, currentStatus) => {
    const statusFlow = {
      'pending': 'in_progress',
      'in_progress': 'quality_check', 
      'quality_check': 'completed',
      'completed': 'completed' // Already at final step
    };
    
    const nextStatus = statusFlow[currentStatus];
    if (nextStatus && nextStatus !== currentStatus) {
      console.log(`Advancing MTO ${mtoId} from ${currentStatus} to ${nextStatus}`);
      // In real implementation, this would update the backend
    }
  };

  const toggleStation = (stationId) => {
    setExpandedStations(prev => ({
      ...prev,
      [stationId]: !prev[stationId]
    }));
  };

  const toggleMonth = (monthId) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthId]: !prev[monthId]
    }));
  };

  const toggleDay = (dayId) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };

  const openChat = (type, id, title) => {
    setChatContext({ type, id, title });
    setShowChat(true);
    setChatMessage('');
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    const messageData = {
      context: chatContext,
      message: chatMessage,
      timestamp: new Date().toISOString(),
      sender: 'Production Manager',
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      // Enhanced tracking data
      trackingInfo: {
        month: chatContext.type === 'month' ? chatContext.id : new Date().toISOString().slice(0, 7),
        day: chatContext.type === 'day' ? chatContext.id : new Date().toISOString().split('T')[0],
        mtoId: chatContext.type === 'mto' ? chatContext.id : null,
        cartonId: chatContext.cartonId || null,
        facility: 'Main Production Floor',
        department: 'MTO Assembly'
      }
    };
    
    console.log('Enhanced Chat Message:', messageData);
    
    // In real implementation, this would integrate with:
    // - Slack/Teams channels
    // - Production management system
    // - Quality control notifications
    // - Supplier communications
    
    setChatMessage('');
    setShowChat(false);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'inventory': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'xf': return <Truck className="h-4 w-4 text-blue-600" />;
      case 'production': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">

        {/* Enhanced Filters with View Toggle */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setViewType('station')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewType === 'station'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('factory.byStation', 'By Station')}
                  </button>
                  <button
                    onClick={() => setViewType('timeline')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewType === 'timeline'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('factory.timeline', 'Timeline')}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Status Filter Pills */}
                <div className="flex items-center gap-2">
                {[
                  { key: 'active', label: t('factory.active', 'Active'), count: filteredMTOs.filter(m => ['pending', 'in_progress', 'quality_check'].includes(m.status)).length },
                  { key: 'completed', label: t('factory.completedMTOs', 'Completed'), count: filteredMTOs.filter(m => m.status === 'completed').length },
                  { key: 'all', label: t('common.viewAll', 'All'), count: filteredMTOs.length }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedStatus(filter.key)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      selectedStatus === filter.key
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter.label} <span className="ml-1 opacity-75">({filter.count})</span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search MTO, SKU, Customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>

              {/* Priority Filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t('factory.allPriorities', 'All Priorities')}</option>
                <option value="urgent">{t('mto.urgent', 'Urgent')}</option>
                <option value="high">{t('mto.high', 'High')}</option>
                <option value="medium">{t('mto.medium', 'Medium')}</option>
                <option value="low">{t('mto.low', 'Low')}</option>
              </select>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        {viewType === 'timeline' && (
          <div className="space-y-4">
            {timelineGroups.map(month => {
              const isMonthExpanded = expandedMonths[month.id];
              const monthAlerts = month.alerts.filter(alert => alert.severity === 'critical').length;
              
              return (
                <div key={month.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Month Header */}
                  <div 
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                    onClick={() => toggleMonth(month.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {isMonthExpanded ? 
                          <ChevronDown className="h-6 w-6 text-blue-600" /> : 
                          <ChevronRight className="h-6 w-6 text-blue-600" />
                        }
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{month.name}</h3>
                          <p className="text-sm text-slate-600">{month.totalMTOs} MTOs across {month.days.length} days</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {monthAlerts > 0 && (
                          <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-700">{monthAlerts} Critical</span>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openChat('month', month.id, `Chat for ${month.name}`);
                          }}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          title="Chat about this month"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Days within Month */}
                  {isMonthExpanded && (
                    <div className="divide-y divide-slate-100">
                      {month.days.map(day => {
                        const isDayExpanded = expandedDays[day.id];
                        const dayAlerts = day.alerts.length;
                        const xfMTOs = day.mtos.filter(mto => mto.xfStatus === 'pending').length;
                        
                        return (
                          <div key={day.id} className="bg-slate-50">
                            {/* Day Header */}
                            <div 
                              className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                              onClick={() => toggleDay(day.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {isDayExpanded ? 
                                    <ChevronDown className="h-5 w-5 text-slate-600" /> : 
                                    <ChevronRight className="h-5 w-5 text-slate-600" />
                                  }
                                  <div>
                                    <h4 className="text-lg font-semibold text-slate-900">{day.name}</h4>
                                    <p className="text-sm text-slate-600">{day.mtos.length} MTOs scheduled</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  {/* Day Alerts */}
                                  {dayAlerts > 0 && (
                                    <div className="flex items-center gap-1">
                                      {day.alerts.map((alert, idx) => (
                                        <div key={idx} className={`p-1 rounded-full ${
                                          alert.severity === 'critical' ? 'bg-red-100' :
                                          alert.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                                        }`}>
                                          {getAlertIcon(alert.type)}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* XF Pending */}
                                  {xfMTOs > 0 && (
                                    <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
                                      <Truck className="h-3 w-3 text-blue-600" />
                                      <span className="text-xs font-medium text-blue-700">{xfMTOs} XF Pending</span>
                                    </div>
                                  )}
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openChat('day', day.id, `Chat for ${day.name}`);
                                    }}
                                    className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                                    title="Chat about this day"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* MTOs within Day */}
                            {isDayExpanded && (
                              <div className="bg-white divide-y divide-slate-100">
                                {day.mtos.map(mto => {
                                  const statusConfig = getStatusConfig(mto.status);
                                  const StatusIcon = statusConfig.icon;
                                  
                                  return (
                                    <div key={mto.id} className="p-4 hover:bg-slate-50 transition-colors">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          {/* MTO Info with Barcode Icons */}
                                          <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${statusConfig.dot}`}></div>
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-900 text-sm">{mto.id}</p>
                                                <div className="flex items-center gap-1">
                                                  <QrCode className="h-3 w-3 text-blue-600 cursor-pointer hover:text-blue-800" title="QR Code" />
                                                  <Hash className="h-3 w-3 text-green-600 cursor-pointer hover:text-green-800" title="Barcode" />
                                                </div>
                                              </div>
                                              <p className="text-xs text-slate-500">{mto.sku}</p>
                                            </div>
                                          </div>
                                          
                                          {/* Alerts */}
                                          {mto.alerts.length > 0 && (
                                            <div className="flex items-center gap-1">
                                              {mto.alerts.map((alert, idx) => (
                                                <div key={idx} className={`px-2 py-1 rounded text-xs font-medium ${
                                                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                  alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-blue-100 text-blue-800'
                                                }`}>
                                                  {alert.message}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                          <button
                                            onClick={() => openChat('mto', mto.id, `Chat for ${mto.id}`)}
                                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            title="Chat about this MTO"
                                          >
                                            <MessageCircle className="h-4 w-4" />
                                          </button>
                                          
                                          <button
                                            onClick={() => setSelectedMTO(mto)}
                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            title="View details"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Production Stations */}
        {viewType === 'station' && (
        <div className="space-y-4">
          {stationGroups.map(station => {
            const isExpanded = expandedStations[station.id];
            const stationMTOs = station.mtos.filter(mto => {
              const statusMatch = selectedStatus === 'all' || 
                (selectedStatus === 'active' && ['pending', 'in_progress', 'quality_check'].includes(mto.status)) ||
                (selectedStatus === 'completed' && mto.status === 'completed');
              
              const priorityMatch = selectedPriority === 'all' || mto.priority === selectedPriority;
              
              const searchMatch = searchTerm === '' || 
                mto.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mto.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mto.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mto.customerName.toLowerCase().includes(searchTerm.toLowerCase());
              
              return statusMatch && priorityMatch && searchMatch;
            });

            if (stationMTOs.length === 0) return null;

            return (
              <div key={station.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Station Header */}
                <div 
                  className="bg-slate-50 px-6 py-4 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => toggleStation(station.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {isExpanded ? 
                        <ChevronDown className="h-5 w-5 text-slate-500" /> : 
                        <ChevronRight className="h-5 w-5 text-slate-500" />
                      }
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-slate-900">{station.name}</h3>
                      </div>
                      <div className="flex items-center gap-4 ml-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-slate-600">{station.activeCount} Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-slate-600">{station.completedCount} Completed</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-500">
                      {stationMTOs.length} MTOs
                    </div>
                  </div>
                </div>

                {/* Station MTOs */}
                {isExpanded && (
                  <div className="divide-y divide-slate-100">
                    {stationMTOs.map(mto => {
                      const statusConfig = getStatusConfig(mto.status);
                      const priorityConfig = getPriorityConfig(mto.priority);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div 
                          key={mto.id} 
                          className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            {/* Left Section: MTO Number, Spots, SKU */}
                            <div className="flex items-center gap-4">
                              {/* MTO Number with Status Indicator and Barcode Icons */}
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${statusConfig.dot}`}></div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-slate-900 text-sm">{mto.id}</p>
                                    <div className="flex items-center gap-1">
                                      <QrCode className="h-4 w-4 text-blue-600 cursor-pointer hover:text-blue-800" title="QR Code" />
                                      <Hash className="h-4 w-4 text-green-600 cursor-pointer hover:text-green-800" title="Barcode" />
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-500">MTO Number</p>
                                </div>
                              </div>

                              {/* Customization Spots with Icons */}
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1 mb-1">
                                  {mto.customizations.slice(0, 4).map((spot, idx) => {
                                    const IconComponent = spot.icon?.icon || Star;
                                    return (
                                      <div
                                        key={idx}
                                        className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm border border-white"
                                        style={{ backgroundColor: spot.color }}
                                        title={`Spot ${spot.spot}: ${spot.name} (${spot.icon?.name || 'Icon'}) - ${spot.status}`}
                                      >
                                        <IconComponent className="h-4 w-4 text-white" />
                                      </div>
                                    );
                                  })}
                                  {mto.customizations.length > 4 && (
                                    <div className="w-8 h-8 rounded-md bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-300">
                                      +{mto.customizations.length - 4}
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500">{mto.customizations.length} spots with icons</p>
                              </div>

                              {/* SKU & Product Image */}
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-slate-200 shadow-sm overflow-hidden">
                                  {/* Real Tote Product Image */}
                                  <div className="w-full h-full relative">
                                    {/* Tote Bag Shape */}
                                    <div className="absolute inset-1 bg-gradient-to-b from-amber-50 to-amber-100 rounded-sm">
                                      {/* Tote Handles */}
                                      <div className="absolute -top-0.5 left-2 right-2 h-1 bg-amber-200 rounded-full"></div>
                                      <div className="absolute top-0 left-2 w-1 h-3 bg-amber-200 rounded-full"></div>
                                      <div className="absolute top-0 right-2 w-1 h-3 bg-amber-200 rounded-full"></div>
                                      {/* Tote Body */}
                                      <div className="absolute inset-1 bg-gradient-to-br from-amber-100 to-amber-200 rounded-sm border border-amber-300">
                                        {/* Sample customization spots */}
                                        {mto.customizations.slice(0, 2).map((spot, idx) => (
                                          <div
                                            key={idx}
                                            className="absolute w-1.5 h-1.5 rounded-full"
                                            style={{ 
                                              backgroundColor: spot.color,
                                              top: idx === 0 ? '20%' : '60%',
                                              left: '30%'
                                            }}
                                          ></div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">{mto.sku}</p>
                                  <p className="text-xs text-slate-600 line-clamp-1">{mto.productName}</p>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMTO(mto);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                  >
                                    View all spots →
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Center Section: Deadline & Current Stage */}
                            <div className="flex items-center gap-6">
                              {/* Deadline */}
                              <div className="text-center">
                                <p className="font-semibold text-slate-900 text-sm">{mto.dueTime}</p>
                                <p className="text-xs text-slate-500">Deadline</p>
                                <p className="text-xs text-amber-600">{mto.timeRemaining}</p>
                              </div>

                              {/* Current Stage */}
                              <div className="text-center">
                                <div className={`px-3 py-1 rounded-lg border ${statusConfig.color} flex items-center gap-2 mb-1`}>
                                  <StatusIcon className="h-3 w-3" />
                                  <span className="text-xs font-medium">{statusConfig.label}</span>
                                </div>
                                <p className="text-xs text-slate-500">Current stage</p>
                              </div>
                            </div>

                            {/* Right Section: Actions */}
                            <div className="flex items-center gap-3">
                              {/* Advance Next Step Button */}
                              {mto.status !== 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    advanceToNextStep(mto.id, mto.status);
                                  }}
                                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                  title="Advance to next production step"
                                >
                                  <FastForward className="h-4 w-4" />
                                  Next Step
                                </button>
                              )}

                              {/* Status Dropdown */}
                              <select
                                value={mto.status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(mto.id, e.target.value);
                                }}
                                className="text-xs border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 bg-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="quality_check">Quality Check</option>
                                <option value="completed">Completed</option>
                                <option value="on_hold">On Hold</option>
                              </select>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openChat('mto', mto.id, `Chat for ${mto.id}`);
                                }}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                title="Chat about this MTO"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </button>
                              
                              <button 
                                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMTO(mto);
                                }}
                                title="View details"
                              >
                                <Eye className="h-4 w-4 text-slate-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
        {/* Chat Modal */}
        {showChat && chatContext && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-6 w-6" />
                    <div>
                      <h2 className="text-xl font-bold">{chatContext.title}</h2>
                      <p className="text-green-100 text-sm">
                        {chatContext.type === 'mto' ? 'MTO-specific chat' :
                         chatContext.type === 'day' ? 'Day-level coordination' :
                         'Month-level planning'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {/* Sample previous messages */}
                  <div className="bg-slate-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-700">Factory Manager</span>
                      <span className="text-xs text-slate-500">2 hours ago</span>
                    </div>
                    <p className="text-sm text-slate-800">
                      {chatContext.type === 'mto' ? 'Any updates on the customization spots for this MTO?' :
                       chatContext.type === 'day' ? 'How are we tracking for today\'s production targets?' :
                       'Monthly production planning review needed'}
                    </p>
                  </div>
                  
                  <div className="bg-blue-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-blue-700">Production Team</span>
                      <span className="text-xs text-blue-500">1 hour ago</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      {chatContext.type === 'mto' ? 'Spots 1-3 completed, working on spot 4 now. ETA 2 hours.' :
                       chatContext.type === 'day' ? 'On track for 85% completion. Two MTOs delayed due to material shortage.' :
                       'Inventory levels look good for next month. XF transfers need approval.'}
                    </p>
                  </div>
                </div>

                {/* Message Input */}
                <div className="space-y-4">
                  <textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={`Type your message about ${chatContext.type === 'mto' ? 'this MTO' : 
                                 chatContext.type === 'day' ? 'this day' : 'this month'}...`}
                    className="w-full p-3 border border-slate-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowChat(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatMessage.trim()}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced MTO Detail Modal - Much Larger */}
        {selectedMTO && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Package2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedMTO.id}</h2>
                        <p className="text-blue-100">{selectedMTO.productName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMTO(null)}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                  {/* Customization Spots Grid */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 text-lg">Customization Spots</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedMTO.customizations.map((custom, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: custom.color }}
                            >
                              {custom.spot}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{custom.name}</p>
                              <p className="text-sm text-slate-600">{custom.type}</p>
                            </div>
                          </div>
                          
                          <div className="text-xs text-slate-500 space-y-1">
                            <p><strong>Color:</strong> {custom.color}</p>
                            <p><strong>Position:</strong> Spot {custom.spot}</p>
                            <p><strong>Type:</strong> {custom.type}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Show empty spots */}
                      {Array.from({ length: Math.max(0, 6 - selectedMTO.customizations.length) }, (_, idx) => {
                        const usedSpots = selectedMTO.customizations.map(c => c.spot);
                        const availableSpots = [1,2,3,4,5,6].filter(spot => !usedSpots.includes(spot));
                        
                        if (idx >= availableSpots.length) return null;
                        
                        return (
                          <div key={`empty-detail-${idx}`} className="bg-slate-50 rounded-xl p-6 border-2 border-dashed border-slate-300">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-8 h-8 rounded-xl border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 font-bold text-lg">
                                {availableSpots[idx]}
                              </div>
                              <div>
                                <p className="font-bold text-slate-500 text-lg">Empty Spot</p>
                                <p className="text-sm text-slate-400 font-medium">Available</p>
                              </div>
                            </div>
                            
                            <div className="px-4 py-2 rounded-lg text-sm font-bold text-center bg-slate-100 text-slate-500 border border-slate-300">
                              NOT USED
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Materials & QC */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="font-semibold text-slate-900 mb-4">Required Materials</h3>
                      <div className="space-y-2">
                        {selectedMTO.materials.map((material, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-slate-700">{material}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-6">
                      <h3 className="font-semibold text-slate-900 mb-4">QC Notes</h3>
                      {selectedMTO.qcNotes.length > 0 ? (
                        <div className="space-y-2">
                          {selectedMTO.qcNotes.map((note, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                              <span className="text-slate-700 text-sm">{note}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No QC issues reported</p>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="bg-slate-100 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Update Production Status</h3>
                    <div className="flex items-center gap-4">
                      <select
                        value={selectedMTO.status}
                        onChange={(e) => handleStatusUpdate(selectedMTO.id, e.target.value)}
                        className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending - Ready to Start</option>
                        <option value="in_progress">In Progress - Currently Working</option>
                        <option value="quality_check">Quality Check - Ready for Review</option>
                        <option value="completed">Completed - Ready to Ship</option>
                        <option value="on_hold">On Hold - Issue Needs Resolution</option>
                      </select>
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                        Update Status
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

export default FactoryMTOManager;