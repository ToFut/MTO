import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Upload, MessageCircle, Bell, Package, Truck, CheckCircle2, AlertTriangle, Eye, Paperclip, Edit, Building2, FileText, Download, X, ChevronDown, ChevronRight, BarChart3, Clock, Play, Filter, Calendar, TrendingUp, MapPin, Layers, Star, ShoppingBag, Palette, Box, Search, Users, Zap, AlertCircle, Award, Target, Globe, Warehouse, Scan, PieChart, Activity, Maximize2, Minimize2, Camera, Music, Coffee, Plane, Flower, Heart, Sparkles, Baby, Cat, Dog, Home, Car, Utensils, Palette as PaletteIcon, Trophy, Gift, Sun, Moon, CloudRain, Zap as Lightning, Anchor, Mountain, Leaf, Diamond, Crown, Flame, Snowflake, Feather, Circle, Bug, Fish, Bird, TreePine, Apple, Cherry, Grape, Pizza, IceCream, Cake, Cookie, RefreshCw, Database } from 'lucide-react';
import CustomizationRouter from './components/CustomizationRouter';
import ProductCatalog from './components/ProductCatalog';
import InventoryCartonSplit from './components/InventoryCartonSplit';
import InventorySupervision from './components/InventorySupervision';
import FactoryMTOManager from './components/FactoryMTOManager';
import FactoryOverview from './components/FactoryOverview';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DefectManagement from './components/DefectManagement';
import FactoryDefectManagement from './components/FactoryDefectManagement';
import ERPSyncDashboard from './components/ERPSyncDashboard';
import NetSuiteLogin from './components/NetSuiteLogin';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import LanguageToggle from './components/ui/LanguageToggle';

// Comprehensive Icon Library for Customization Patches
const CUSTOMIZATION_ICONS = {
  // Electronics & Tech
  'Camera Icon': { icon: Camera, color: 'text-purple-600', bg: 'bg-purple-100', category: 'Tech' },
  'Music Notes Icon': { icon: Music, color: 'text-pink-600', bg: 'bg-pink-100', category: 'Music' },
  
  // Food & Drinks
  'Coffee Icon': { icon: Coffee, color: 'text-amber-700', bg: 'bg-amber-100', category: 'Food' },
  'Hot Sauce Icon': { icon: Flame, color: 'text-red-600', bg: 'bg-red-100', category: 'Food' },
  'Spicy Margarita Icon': { icon: Coffee, color: 'text-lime-600', bg: 'bg-lime-100', category: 'Drinks' },
  'Pickles Icon': { icon: Apple, color: 'text-green-600', bg: 'bg-green-100', category: 'Food' },
  'Pizza Icon': { icon: Pizza, color: 'text-orange-600', bg: 'bg-orange-100', category: 'Food' },
  'Ice Cream Icon': { icon: IceCream, color: 'text-cyan-600', bg: 'bg-cyan-100', category: 'Food' },
  'Cake Icon': { icon: Cake, color: 'text-pink-600', bg: 'bg-pink-100', category: 'Food' },
  'Cookie Icon': { icon: Cookie, color: 'text-yellow-700', bg: 'bg-yellow-100', category: 'Food' },
  
  // Transportation
  'Airplane Icon': { icon: Plane, color: 'text-blue-600', bg: 'bg-blue-100', category: 'Travel' },
  'Car Icon': { icon: Car, color: 'text-gray-700', bg: 'bg-gray-100', category: 'Travel' },
  
  // Nature & Flowers
  'Daisy Icon': { icon: Flower, color: 'text-yellow-500', bg: 'bg-yellow-100', category: 'Nature' },
  'Leaf Icon': { icon: Leaf, color: 'text-green-500', bg: 'bg-green-100', category: 'Nature' },
  'Tree Icon': { icon: TreePine, color: 'text-emerald-600', bg: 'bg-emerald-100', category: 'Nature' },
  'Mountain Icon': { icon: Mountain, color: 'text-stone-600', bg: 'bg-stone-100', category: 'Nature' },
  'Sun Icon': { icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100', category: 'Weather' },
  'Moon Icon': { icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-100', category: 'Weather' },
  'Rain Icon': { icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-100', category: 'Weather' },
  'Snow Icon': { icon: Snowflake, color: 'text-cyan-400', bg: 'bg-cyan-100', category: 'Weather' },
  
  // Animals
  'Cat Icon': { icon: Cat, color: 'text-orange-600', bg: 'bg-orange-100', category: 'Pets' },
  'Dog Icon': { icon: Dog, color: 'text-amber-700', bg: 'bg-amber-100', category: 'Pets' },
  'Bird Icon': { icon: Bird, color: 'text-sky-600', bg: 'bg-sky-100', category: 'Animals' },
  'Fish Icon': { icon: Fish, color: 'text-teal-600', bg: 'bg-teal-100', category: 'Animals' },
  'Bug Icon': { icon: Bug, color: 'text-green-700', bg: 'bg-green-100', category: 'Animals' },
  
  // Special Symbols
  'Heart Icon': { icon: Heart, color: 'text-red-500', bg: 'bg-red-100', category: 'Love' },
  'Star Icon': { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100', category: 'Special' },
  'Crown Icon': { icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-100', category: 'Special' },
  'Diamond Icon': { icon: Diamond, color: 'text-cyan-600', bg: 'bg-cyan-100', category: 'Luxury' },
  'Trophy Icon': { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100', category: 'Awards' },
  'Gift Icon': { icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-100', category: 'Special' },
  'Lightning Icon': { icon: Lightning, color: 'text-purple-600', bg: 'bg-purple-100', category: 'Energy' },
  'Sparkles Icon': { icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-100', category: 'Magic' },
  'Flame Icon': { icon: Flame, color: 'text-red-600', bg: 'bg-red-100', category: 'Fire' },
  
  // Lifestyle
  'Home Icon': { icon: Home, color: 'text-slate-600', bg: 'bg-slate-100', category: 'Home' },
  'Utensils Icon': { icon: Utensils, color: 'text-gray-700', bg: 'bg-gray-100', category: 'Kitchen' },
  'Palette Icon': { icon: PaletteIcon, color: 'text-indigo-600', bg: 'bg-indigo-100', category: 'Art' },
  'Baby Icon': { icon: Baby, color: 'text-pink-400', bg: 'bg-pink-100', category: 'Family' },
  
  // Ocean & Beach
  'Anchor Icon': { icon: Anchor, color: 'text-navy-600', bg: 'bg-blue-100', category: 'Ocean' },
  'Shell Icon': { icon: Circle, color: 'text-orange-400', bg: 'bg-orange-100', category: 'Beach' },
  'Feather Icon': { icon: Feather, color: 'text-gray-500', bg: 'bg-gray-100', category: 'Nature' },
  
  // Letters (A-Z)
  'A - Classic Letter': { icon: () => <span className="font-bold text-lg">A</span>, color: 'text-gray-800', bg: 'bg-gray-100', category: 'Letters' },
  'B - Classic Letter': { icon: () => <span className="font-bold text-lg">B</span>, color: 'text-gray-800', bg: 'bg-gray-100', category: 'Letters' },
  'C - Classic Letter': { icon: () => <span className="font-bold text-lg">C</span>, color: 'text-gray-800', bg: 'bg-gray-100', category: 'Letters' },
  'H - Classic Letter': { icon: () => <span className="font-bold text-lg">H</span>, color: 'text-gray-800', bg: 'bg-gray-100', category: 'Letters' },
  'M - Classic Letter': { icon: () => <span className="font-bold text-lg">M</span>, color: 'text-gray-800', bg: 'bg-gray-100', category: 'Letters' },
  'S - Classic Letter': { icon: () => <span className="font-bold text-lg">S</span>, color: 'text-gray-800', bg: 'bg-gray-100', category: 'Letters' }
};

// Helper function to get icon details from patch reference
const getIconFromPatchRef = (patchRef) => {
  if (!patchRef) return null;
  
  // Extract the icon name from patch reference (e.g., "63 - Camera Icon" -> "Camera Icon")
  const iconName = patchRef.split(' - ')[1] || patchRef;
  return CUSTOMIZATION_ICONS[iconName] || null;
};

// Helper function to generate patch preview image based on patch reference
const generatePatchPreview = (patchRef, sku) => {
  if (!patchRef) return null;
  
  const iconName = patchRef.split(' - ')[1] || patchRef;
  const iconData = CUSTOMIZATION_ICONS[iconName];
  
  if (!iconData) return null;
  
  // Create a visual representation of the patch
  return {
    iconName,
    iconData,
    sku,
    patchRef,
    // Generate example patch designs
    patchStyle: {
      shape: 'circle', // circle, square, oval, custom
      size: 'medium', // small, medium, large
      material: 'embroidered', // embroidered, printed, vinyl, leather
      colors: [iconData.color.replace('text-', ''), 'white', 'black'],
      texture: iconData.category === 'Letters' ? 'metallic' : 'fabric'
    }
  };
};

// Visual Patch Preview Component - Shows actual patch design
const PatchPreview = ({ patchData, size = 'small' }) => {
  if (!patchData) return null;
  
  const { iconData, patchStyle, iconName } = patchData;
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };
  
  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg',
    oval: 'rounded-full transform scale-x-110',
    custom: 'rounded-lg'
  };
  
  return (
    <div className={`${sizeClasses[size]} ${shapeClasses[patchStyle.shape]} relative overflow-hidden`}>
      {/* Patch Background with Texture */}
      <div className={`absolute inset-0 ${iconData.bg} border-2 border-gray-300`}>
        {/* Fabric/Material Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: patchStyle.texture === 'metallic' 
              ? 'linear-gradient(45deg, rgba(255,255,255,0.3) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.3) 25%, transparent 25%)'
              : 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)',
            backgroundSize: patchStyle.texture === 'metallic' ? '8px 8px' : '4px 4px'
          }}
        />
        
        {/* Embroidered Border Effect */}
        {patchStyle.material === 'embroidered' && (
          <div className="absolute inset-0 border-2 border-dashed border-gray-400 opacity-30 rounded-inherit"></div>
        )}
        
        {/* Icon in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          {React.createElement(iconData.icon, { 
            size: size === 'small' ? 12 : size === 'medium' ? 16 : size === 'large' ? 20 : 24,
            className: `${iconData.color} drop-shadow-sm`
          })}
        </div>
        
        {/* Material-specific effects */}
        {patchStyle.material === 'vinyl' && (
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-20"></div>
        )}
        
        {patchStyle.material === 'leather' && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-transparent to-amber-200 opacity-30"></div>
        )}
      </div>
    </div>
  );
};

const BaubleBarDemo = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState('brand');
  const [showChat, setShowChat] = useState(false);
  const [chatContext, setChatContext] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedPOs, setExpandedPOs] = useState(new Set());
  const [activeChatTab, setActiveChatTab] = useState('general');
  const [showNetSuiteLogin, setShowNetSuiteLogin] = useState(false);
  const [netsuiteAuth, setNetsuiteAuth] = useState(null);
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

  // Add state for new features
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [showLocationView, setShowLocationView] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [selectedCustomizationProduct, setSelectedCustomizationProduct] = useState(null);
  const [expandedCarton, setExpandedCarton] = useState(null);
  
  // Add state for customization preview gallery
  const [showCustomizationGallery, setShowCustomizationGallery] = useState(false);
  
  // Add state for Brand view tabs
  const [brandActiveTab, setBrandActiveTab] = useState('overview');
  
  // Advanced search state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    po: '', sku: '', brand: '', factory: '', xfDate: '', awb: '', status: '', productType: ''
  });
  const [viewMode, setViewMode] = useState('po'); // 'po' or 'mto'

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

  // Enhanced data with all required features - Complete MTO field set from improvements spec
  const brandPOs = [
    { 
      po: 'PO123', 
      totalUnits: 500, 
      completed: 280, 
      percent: 56, 
      eta: 'July 11, 2025', 
      status: 'In Production',
      uploadDate: 'June 15, 2025',
      factory: 'GZ Totes',
      mtos: [
        { 
          lineId: 6, 
          qty: 1, 
          customization: 'Spot 1-6', 
          status: 'QC', 
          eta: 'July 5, 2025', 
          progress: 75, 
          style: '14oz Natural Tote - Medium',
          // Complete MTO Details from improvements spec
          internalId: '37483586',
          poLineId: '6',
          expectedShipDate: '24/07/2025',
          actualShipDate: '',
          poLineTrackingNumber: '',
          awb: '',
          masterCarton: '',
          vendorPoStatus: 'process',
          orderSubmitDate: '16/07/2025',
          soDate: '16/07/2025',
          shopifyOrderDateTime: '07/16/25 02:15 PM',
          salesOrderNumber: 'SO2508459',
          cpsd: '06/08/2025',
          displayName: 'Custom Tote Bag - 14oz Natural Lined - Medium',
          referenceNumber: 'md6a4z3j45we9',
          quantity: 1,
          spot1: '129559',
          spot2: '137234',
          spot3: '128687',
          spot4: '128698',
          spot5: '128954',
          spot6: '',
          bagBasePid: '133938',
          spot1PatchRef: '63 - Camera Icon',
          spot2PatchRef: '171 - Music Notes Icon',
          spot3PatchRef: '17 - Spicy Margarita Icon',
          spot4PatchRef: '30 - Airplane Icon',
          spot5PatchRef: '38 - H - Classic Letter',
          spot6PatchRef: '',
          xfDate: '01/07/2025',
          productType: 'Initial Tote'
        }
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
    // Raw materials with realistic quantities and usage
    { 
      id: 'MAT001', material: '14oz Tote Base - Natural', sku: 'TB-14OZ-NAT', 
      needed: 200, inStock: 140, allocated: 200, status: 'short', 
      usedBy: ['PO123-6', 'PO124-12', 'PO125-18', 'PO126-3', 'PO127-12'],
      supplier: 'GZ Totes', leadTime: 14, cost: 8.50, minOrder: 50,
      location: 'Warehouse A', lastUpdated: '2025-07-25 16:30',
      reorderPoint: 100, maxStock: 500, category: 'Base Materials'
    },
    { 
      id: 'MAT002', material: 'Patch 129559 - Camera Icon', sku: 'PATCH-129559', 
      needed: 30, inStock: 10, allocated: 30, status: 'short', 
      usedBy: ['PO123-6', 'PO128-7'],
      supplier: 'Icon Supply Co', leadTime: 7, cost: 2.25, minOrder: 25,
      location: 'Warehouse B', lastUpdated: '2025-07-25 14:15',
      reorderPoint: 20, maxStock: 200, category: 'Patches'
    },
    { 
      id: 'MAT003', material: 'Patch 137234 - Music Notes', sku: 'PATCH-137234', 
      needed: 25, inStock: 30, allocated: 25, status: 'ok', 
      usedBy: ['PO123-6', 'PO124-8'],
      supplier: 'Icon Supply Co', leadTime: 7, cost: 2.10, minOrder: 25,
      location: 'Warehouse B', lastUpdated: '2025-07-25 15:45',
      reorderPoint: 15, maxStock: 150, category: 'Patches'
    },
    { 
      id: 'MAT004', material: 'Patch 128687 - Spicy Margarita', sku: 'PATCH-128687', 
      needed: 15, inStock: 20, allocated: 15, status: 'ok', 
      usedBy: ['PO123-6'],
      supplier: 'Icon Supply Co', leadTime: 7, cost: 2.40, minOrder: 25,
      location: 'Warehouse B', lastUpdated: '2025-07-25 13:20',
      reorderPoint: 10, maxStock: 100, category: 'Patches'
    },
    { 
      id: 'MAT005', material: 'Thread - Black', sku: 'THREAD-BLK', 
      needed: 50, inStock: 100, allocated: 50, status: 'ok', 
      usedBy: ['PO123-6', 'PO124-12', 'PO125-14', 'PO126-3'],
      supplier: 'Thread Masters', leadTime: 3, cost: 0.85, minOrder: 100,
      location: 'Warehouse A', lastUpdated: '2025-07-25 17:00',
      reorderPoint: 75, maxStock: 300, category: 'Threads'
    },
    { 
      id: 'MAT006', material: 'Canvas Fabric - Natural', sku: 'CANVAS-NAT', 
      needed: 80, inStock: 45, allocated: 80, status: 'low', 
      usedBy: ['PO124-8', 'PO125-14', 'PO126-3'],
      supplier: 'Fabric World', leadTime: 10, cost: 12.50, minOrder: 25,
      location: 'Warehouse A', lastUpdated: '2025-07-25 16:45',
      reorderPoint: 40, maxStock: 200, category: 'Fabrics'
    },
    { 
      id: 'MAT007', material: 'Wool Blanket Base', sku: 'WOOL-BLANKET', 
      needed: 35, inStock: 15, allocated: 35, status: 'short', 
      usedBy: ['PO124-8', 'PO127-12'],
      supplier: 'Wool Suppliers', leadTime: 21, cost: 25.00, minOrder: 20,
      location: 'Warehouse C', lastUpdated: '2025-07-25 14:30',
      reorderPoint: 20, maxStock: 100, category: 'Blankets'
    },
    { 
      id: 'MAT008', material: 'Zipper - 12 inch', sku: 'ZIP-12IN', 
      needed: 60, inStock: 85, allocated: 60, status: 'ok', 
      usedBy: ['PO123-6', 'PO124-8', 'PO125-14'],
      supplier: 'Zipper Pro', leadTime: 5, cost: 1.75, minOrder: 50,
      location: 'Warehouse A', lastUpdated: '2025-07-25 15:15',
      reorderPoint: 50, maxStock: 250, category: 'Hardware'
    },
    { 
      id: 'MAT009', material: 'Leather Handle - Brown', sku: 'LEATHER-HANDLE-BRN', 
      needed: 40, inStock: 25, allocated: 40, status: 'low', 
      usedBy: ['PO125-14', 'PO126-3', 'PO127-12'],
      supplier: 'Leather Craft', leadTime: 12, cost: 4.20, minOrder: 30,
      location: 'Warehouse B', lastUpdated: '2025-07-25 16:00',
      reorderPoint: 20, maxStock: 120, category: 'Hardware'
    },
    { 
      id: 'MAT010', material: 'Embroidered Logo Patch', sku: 'LOGO-PATCH', 
      needed: 45, inStock: 55, allocated: 45, status: 'ok', 
      usedBy: ['PO123-6', 'PO124-8', 'PO125-14', 'PO126-3'],
      supplier: 'Logo Embroiderers', leadTime: 8, cost: 3.50, minOrder: 25,
      location: 'Warehouse B', lastUpdated: '2025-07-25 15:30',
      reorderPoint: 30, maxStock: 150, category: 'Patches'
    }
  ];

  const shippingData = [
    // Active shipments with various statuses
    { 
      id: 'SH001', po: 'PO123', lineId: 6, mtoId: 'MTO-123-6', 
      shipDate: 'July 24', trackingNumber: '1Z1234567890', carrier: 'UPS', 
      files: ['packing_slip_line6.pdf', 'invoice_line6.pdf'], 
      masterCarton: 'MC001', awb: 'AWB123456', eta: 'July 26', 
      referenceNumber: 'REF001', status: 'In Transit',
      destination: 'New York, NY', weight: '2.5kg', dimensions: '30x20x15cm',
      contents: ['Initial Tote - Natural'], qty: 1, value: 45.00,
      lastUpdate: '2025-07-25 14:30', nextUpdate: '2025-07-26 08:00'
    },
    { 
      id: 'SH002', po: 'PO125', lineId: 14, mtoId: 'MTO-125-14', 
      shipDate: 'June 30', trackingNumber: '1Z0987654321', carrier: 'FedEx', 
      files: ['packing_slip_line14.pdf', 'invoice.pdf'], 
      masterCarton: 'MC002', awb: 'AWB789012', eta: 'July 2', 
      referenceNumber: 'REF002', status: 'Delivered',
      destination: 'Los Angeles, CA', weight: '1.8kg', dimensions: '25x18x12cm',
      contents: ['Icon Tote - Canvas'], qty: 1, value: 38.00,
      lastUpdate: '2025-07-02 10:15', deliveredDate: '2025-07-02 09:45'
    },
    { 
      id: 'SH003', po: 'PO124', lineId: 8, mtoId: 'MTO-124-8', 
      shipDate: 'July 28', trackingNumber: '1Z5556667777', carrier: 'DHL', 
      files: ['packing_slip_line8.pdf'], 
      masterCarton: 'MC003', awb: 'AWB345678', eta: 'July 30', 
      referenceNumber: 'REF003', status: 'Pending',
      destination: 'Chicago, IL', weight: '3.2kg', dimensions: '35x25x20cm',
      contents: ['Blanket - Wool'], qty: 1, value: 65.00,
      lastUpdate: '2025-07-28 16:20', nextUpdate: '2025-07-29 12:00'
    },
    { 
      id: 'SH004', po: 'PO126', lineId: 3, mtoId: 'MTO-126-3', 
      shipDate: 'July 25', trackingNumber: '1Z8889990000', carrier: 'UPS', 
      files: ['packing_slip_line3.pdf', 'customs_form.pdf'], 
      masterCarton: 'MC004', awb: 'AWB901234', eta: 'July 27', 
      referenceNumber: 'REF004', status: 'In Transit',
      destination: 'Miami, FL', weight: '2.1kg', dimensions: '28x22x16cm',
      contents: ['Tote Bag - Premium'], qty: 1, value: 52.00,
      lastUpdate: '2025-07-26 11:45', nextUpdate: '2025-07-27 06:00'
    },
    { 
      id: 'SH005', po: 'PO127', lineId: 12, mtoId: 'MTO-127-12', 
      shipDate: 'July 29', trackingNumber: '1Z1112223333', carrier: 'FedEx', 
      files: ['packing_slip_line12.pdf'], 
      masterCarton: 'MC005', awb: 'AWB567890', eta: 'July 31', 
      referenceNumber: 'REF005', status: 'Pending',
      destination: 'Seattle, WA', weight: '1.9kg', dimensions: '26x19x13cm',
      contents: ['Initial Tote - Black'], qty: 1, value: 42.00,
      lastUpdate: '2025-07-29 09:30', nextUpdate: '2025-07-30 14:00'
    },
    { 
      id: 'SH006', po: 'PO128', lineId: 7, mtoId: 'MTO-128-7', 
      shipDate: 'July 26', trackingNumber: '1Z4445556666', carrier: 'DHL', 
      files: ['packing_slip_line7.pdf', 'insurance_cert.pdf'], 
      masterCarton: 'MC006', awb: 'AWB234567', eta: 'July 28', 
      referenceNumber: 'REF006', status: 'In Transit',
      destination: 'Boston, MA', weight: '2.8kg', dimensions: '32x24x18cm',
      contents: ['Icon Tote - Red'], qty: 1, value: 48.00,
      lastUpdate: '2025-07-27 13:15', nextUpdate: '2025-07-28 08:00'
    },
    { 
      id: 'SH007', po: 'PO129', lineId: 15, mtoId: 'MTO-129-15', 
      shipDate: 'July 23', trackingNumber: '1Z7778889999', carrier: 'UPS', 
      files: ['packing_slip_line15.pdf'], 
      masterCarton: 'MC007', awb: 'AWB678901', eta: 'July 25', 
      referenceNumber: 'REF007', status: 'Delivered',
      destination: 'Denver, CO', weight: '2.3kg', dimensions: '29x21x14cm',
      contents: ['Blanket - Cotton'], qty: 1, value: 58.00,
      lastUpdate: '2025-07-25 15:20', deliveredDate: '2025-07-25 14:30'
    },
    { 
      id: 'SH008', po: 'PO130', lineId: 4, mtoId: 'MTO-130-4', 
      shipDate: 'July 30', trackingNumber: '1Z0001112222', carrier: 'FedEx', 
      files: ['packing_slip_line4.pdf'], 
      masterCarton: 'MC008', awb: 'AWB345678', eta: 'August 1', 
      referenceNumber: 'REF008', status: 'Pending',
      destination: 'Phoenix, AZ', weight: '1.7kg', dimensions: '24x17x11cm',
      contents: ['Tote Bag - Canvas'], qty: 1, value: 35.00,
      lastUpdate: '2025-07-30 10:45', nextUpdate: '2025-07-31 16:00'
    }
  ];

  // Best Products Overview Data
  const bestProducts = [
    { 
      sku: 'TT-001', 
      name: 'Initial Tote - Natural', 
      type: 'Initial Tote', 
      orderVolume: 1250, 
      delayFreq: 5, 
      rating: 4.8, 
      trend: 'up',
      icon: '🛍️',
      color: '#F3F4F6'
    },
    { 
      sku: 'TT-002', 
      name: 'Icon Tote - Canvas', 
      type: 'Icon Tote', 
      orderVolume: 890, 
      delayFreq: 12, 
      rating: 4.6, 
      trend: 'stable',
      icon: '⭐',
      color: '#EEF2FF'
    },
    { 
      sku: 'BL-001', 
      name: 'Comfort Blanket - Wool', 
      type: 'Blanket', 
      orderVolume: 456, 
      delayFreq: 8, 
      rating: 4.9, 
      trend: 'up',
      icon: '🧸',
      color: '#FEF3C7' 
    },
    { 
      sku: 'TB-001', 
      name: 'Premium Tote Bag', 
      type: 'Tote Bag', 
      orderVolume: 678, 
      delayFreq: 15, 
      rating: 4.3, 
      trend: 'down',
      icon: '👜',
      color: '#FECACA'
    }
  ];

  // Sales Analytics Data by Countries and Cities
  const salesData = {
    countries: [
      {
        id: 1,
        name: 'United States',
        flag: '🇺🇸',
        totalSales: 2847500,
        growth: 12.5,
        topCities: [
          {
            name: 'New York',
            sales: 485000,
            growth: 15.2,
            bestProducts: [
              { name: 'Initial Tote', sales: 125000, units: 2500, icon: '👜' },
              { name: 'Icon Tote', sales: 98000, units: 1960, icon: '🎒' },
              { name: 'Blanket', sales: 67000, units: 1340, icon: '🛏️' }
            ],
            topStores: ['Bloomingdale\'s', 'Macy\'s', 'Nordstrom']
          },
          {
            name: 'Los Angeles',
            sales: 320000,
            growth: 8.7,
            bestProducts: [
              { name: 'Icon Tote', sales: 89000, units: 1780, icon: '🎒' },
              { name: 'Initial Tote', sales: 76000, units: 1520, icon: '👜' },
              { name: 'Tote Bag', sales: 54000, units: 1080, icon: '🛍️' }
            ],
            topStores: ['Nordstrom', 'Neiman Marcus', 'Saks Fifth Avenue']
          },
          {
            name: 'Chicago',
            sales: 285000,
            growth: 11.3,
            bestProducts: [
              { name: 'Initial Tote', sales: 78000, units: 1560, icon: '👜' },
              { name: 'Tote Bag', sales: 62000, units: 1240, icon: '🛍️' },
              { name: 'Icon Tote', sales: 58000, units: 1160, icon: '🎒' }
            ],
            topStores: ['Nordstrom', 'Macy\'s', 'Bloomingdale\'s']
          }
        ]
      },
      {
        id: 2,
        name: 'Canada',
        flag: '🇨🇦',
        totalSales: 1250000,
        growth: 9.8,
        topCities: [
          {
            name: 'Toronto',
            sales: 420000,
            growth: 7.5,
            bestProducts: [
              { name: 'Icon Tote', sales: 115000, units: 2300, icon: '🎒' },
              { name: 'Initial Tote', sales: 98000, units: 1960, icon: '👜' },
              { name: 'Blanket', sales: 45000, units: 900, icon: '🛏️' }
            ],
            topStores: ['Hudson\'s Bay', 'Holt Renfrew', 'Nordstrom']
          },
          {
            name: 'Vancouver',
            sales: 280000,
            growth: 12.1,
            bestProducts: [
              { name: 'Tote Bag', sales: 85000, units: 1700, icon: '🛍️' },
              { name: 'Icon Tote', sales: 72000, units: 1440, icon: '🎒' },
              { name: 'Initial Tote', sales: 68000, units: 1360, icon: '👜' }
            ],
            topStores: ['Holt Renfrew', 'Nordstrom', 'Hudson\'s Bay']
          }
        ]
      },
      {
        id: 3,
        name: 'United Kingdom',
        flag: '🇬🇧',
        totalSales: 980000,
        growth: 6.2,
        topCities: [
          {
            name: 'London',
            sales: 520000,
            growth: 5.8,
            bestProducts: [
              { name: 'Initial Tote', sales: 145000, units: 2900, icon: '👜' },
              { name: 'Icon Tote', sales: 112000, units: 2240, icon: '🎒' },
              { name: 'Tote Bag', sales: 78000, units: 1560, icon: '🛍️' }
            ],
            topStores: ['Selfridges', 'Harrods', 'Liberty London']
          },
          {
            name: 'Manchester',
            sales: 180000,
            growth: 8.9,
            bestProducts: [
              { name: 'Icon Tote', sales: 52000, units: 1040, icon: '🎒' },
              { name: 'Initial Tote', sales: 48000, units: 960, icon: '👜' },
              { name: 'Blanket', sales: 32000, units: 640, icon: '🛏️' }
            ],
            topStores: ['Selfridges', 'Harvey Nichols', 'John Lewis']
          }
        ]
      },
      {
        id: 4,
        name: 'Germany',
        flag: '🇩🇪',
        totalSales: 750000,
        growth: 4.5,
        topCities: [
          {
            name: 'Berlin',
            sales: 220000,
            growth: 6.2,
            bestProducts: [
              { name: 'Icon Tote', sales: 68000, units: 1360, icon: '🎒' },
              { name: 'Tote Bag', sales: 58000, units: 1160, icon: '🛍️' },
              { name: 'Initial Tote', sales: 52000, units: 1040, icon: '👜' }
            ],
            topStores: ['KaDeWe', 'Galeries Lafayette', 'Breuninger']
          },
          {
            name: 'Munich',
            sales: 180000,
            growth: 3.8,
            bestProducts: [
              { name: 'Initial Tote', sales: 52000, units: 1040, icon: '👜' },
              { name: 'Icon Tote', sales: 48000, units: 960, icon: '🎒' },
              { name: 'Blanket', sales: 38000, units: 760, icon: '🛏️' }
            ],
            topStores: ['Ludwig Beck', 'Breuninger', 'Oberpollinger']
          }
        ]
      },
      {
        id: 5,
        name: 'Australia',
        flag: '🇦🇺',
        totalSales: 680000,
        growth: 15.7,
        topCities: [
          {
            name: 'Sydney',
            sales: 320000,
            growth: 18.2,
            bestProducts: [
              { name: 'Icon Tote', sales: 95000, units: 1900, icon: '🎒' },
              { name: 'Tote Bag', sales: 78000, units: 1560, icon: '🛍️' },
              { name: 'Initial Tote', sales: 72000, units: 1440, icon: '👜' }
            ],
            topStores: ['David Jones', 'Myer', 'Westfield']
          },
          {
            name: 'Melbourne',
            sales: 280000,
            growth: 12.8,
            bestProducts: [
              { name: 'Tote Bag', sales: 82000, units: 1640, icon: '🛍️' },
              { name: 'Icon Tote', sales: 76000, units: 1520, icon: '🎒' },
              { name: 'Initial Tote', sales: 68000, units: 1360, icon: '👜' }
            ],
            topStores: ['David Jones', 'Myer', 'Chadstone']
          }
        ]
      }
    ],
    globalStats: {
      totalRevenue: 6507500,
      totalGrowth: 10.2,
      totalOrders: 125000,
      averageOrderValue: 52.06,
      topPerformingCountry: 'United States',
      fastestGrowingCountry: 'Australia'
    }
  };

  // Factory & Brand Location Data (keeping for reference)
  // Brand Sales by Location Data (based on shipping zip codes)
  const brandSalesLocationData = [
    {
      id: 1,
      region: 'New York Metro',
      city: 'New York',
      state: 'NY',
      zipCodes: ['10001-10299', '11201-11256'],
      coordinates: { lat: 40.7128, lng: -74.0060 },
      type: 'sales_region',
      totalSales: 45892,
      totalOrders: 1823,
      avgOrderValue: 251.85,
      topProducts: [
        { name: 'Custom Initial Bracelet', sales: 12450, orders: 532, revenue: 23424 },
        { name: 'Icon Tote Bag', sales: 8932, orders: 287, revenue: 18657 },
        { name: 'Premium Monogram Tote', sales: 6789, orders: 198, revenue: 14851 },
        { name: 'Luxury Throw Blanket', sales: 4523, orders: 124, revenue: 14968 },
        { name: 'Initial Signet Ring', sales: 3456, orders: 89, revenue: 6945 }
      ],
      demographics: { age: '25-35', income: 'High', interests: ['Fashion', 'Luxury'] },
      growthRate: 15.2,
      monthlyTrend: [3200, 3450, 3890, 4123, 4567, 4892]
    },
    {
      id: 2,
      region: 'Los Angeles Metro',
      city: 'Los Angeles',
      state: 'CA',
      zipCodes: ['90001-90899', '91001-91999'],
      coordinates: { lat: 34.0522, lng: -118.2437 },
      type: 'sales_region',
      totalSales: 38567,
      totalOrders: 1456,
      avgOrderValue: 264.89,
      topProducts: [
        { name: 'Beaded Charm Bracelet', sales: 9876, orders: 423, revenue: 28748 },
        { name: 'Custom Cozy Blanket', sales: 7654, orders: 234, revenue: 22234 },
        { name: 'Personalized Hair Clips', sales: 5432, orders: 567, revenue: 15209 },
        { name: 'Custom Leather Keychain', sales: 4321, orders: 189, revenue: 15124 },
        { name: 'Monogram Makeup Bag', sales: 3289, orders: 298, revenue: 12497 }
      ],
      demographics: { age: '22-32', income: 'Medium-High', interests: ['Beach', 'Wellness', 'Style'] },
      growthRate: 12.8,
      monthlyTrend: [2800, 3100, 3200, 3456, 3789, 3567]
    },
    {
      id: 3,
      region: 'Chicago Metro',
      city: 'Chicago',
      state: 'IL',
      zipCodes: ['60601-60827'],
      coordinates: { lat: 41.8781, lng: -87.6298 },
      type: 'sales_region',
      totalSales: 29834,
      totalOrders: 1134,
      avgOrderValue: 263.15,
      topProducts: [
        { name: 'Stackable Ring Set', sales: 7890, orders: 298, revenue: 19345 },
        { name: 'Custom Anklet', sales: 5678, orders: 234, revenue: 23865 },
        { name: 'Charm Choker Necklace', sales: 4567, orders: 189, revenue: 31082 },
        { name: 'Custom Picture Frame', sales: 3456, orders: 167, revenue: 8019 },
        { name: 'Personalized Water Bottle', sales: 2890, orders: 123, revenue: 15034 }
      ],
      demographics: { age: '28-38', income: 'Medium', interests: ['Family', 'Home', 'Urban'] },
      growthRate: 8.4,
      monthlyTrend: [2200, 2400, 2650, 2890, 3100, 2834]
    },
    {
      id: 4,
      region: 'Miami Metro',
      city: 'Miami',
      state: 'FL',
      zipCodes: ['33101-33299'],
      coordinates: { lat: 25.7617, lng: -80.1918 },
      type: 'sales_region',
      totalSales: 32145,
      totalOrders: 1289,
      avgOrderValue: 249.46,
      topProducts: [
        { name: 'Custom Pet Collar', sales: 8765, orders: 456, revenue: 14608 },
        { name: 'Personalized Water Bottle', sales: 6543, orders: 289, revenue: 34024 },
        { name: 'Custom Initial Bracelet', sales: 5432, orders: 234, revenue: 11251 },
        { name: 'Beaded Charm Bracelet', sales: 4321, orders: 198, revenue: 13464 },
        { name: 'Personalized Mouse Pad', sales: 2109, orders: 167, revenue: 5273 }
      ],
      demographics: { age: '24-34', income: 'Medium-High', interests: ['Pets', 'Beach', 'Travel'] },
      growthRate: 18.7,
      monthlyTrend: [2100, 2345, 2678, 2890, 3098, 3145]
    },
    {
      id: 5,
      region: 'Seattle Metro',
      city: 'Seattle',
      state: 'WA',
      zipCodes: ['98101-98199'],
      coordinates: { lat: 47.6062, lng: -122.3321 },
      type: 'sales_region',
      totalSales: 26789,
      totalOrders: 998,
      avgOrderValue: 268.42,
      topProducts: [
        { name: 'Luxury Throw Blanket', sales: 7890, orders: 234, revenue: 28080 },
        { name: 'Custom Cozy Blanket', sales: 5432, orders: 189, revenue: 17955 },
        { name: 'Personalized Mouse Pad', sales: 4321, orders: 298, revenue: 10803 },
        { name: 'Custom Leather Keychain', sales: 3210, orders: 156, revenue: 11235 },
        { name: 'Icon Tote Bag', sales: 2987, orders: 121, revenue: 19419 }
      ],
      demographics: { age: '26-36', income: 'High', interests: ['Tech', 'Outdoors', 'Coffee'] },
      growthRate: 21.3,
      monthlyTrend: [1800, 2100, 2300, 2456, 2598, 2789]
    },
    {
      id: 6,
      region: 'Austin Metro',
      city: 'Austin',
      state: 'TX',
      zipCodes: ['78701-78799'],
      coordinates: { lat: 30.2672, lng: -97.7431 },
      type: 'sales_region',
      totalSales: 24567,
      totalOrders: 923,
      avgOrderValue: 266.25,
      topProducts: [
        { name: 'Premium Monogram Tote', sales: 6789, orders: 189, revenue: 14175 },
        { name: 'Custom Initial Bracelet', sales: 5432, orders: 234, revenue: 11237 },
        { name: 'Initial Signet Ring', sales: 4321, orders: 167, revenue: 33703 },
        { name: 'Personalized Hair Clips', sales: 3210, orders: 234, revenue: 8988 },
        { name: 'Monogram Makeup Bag', sales: 2890, orders: 198, revenue: 10980 }
      ],
      demographics: { age: '23-33', income: 'Medium-High', interests: ['Music', 'Food', 'Art'] },
      growthRate: 14.6,
      monthlyTrend: [1900, 2050, 2200, 2345, 2456, 2567]
    }
  ];

  const locationData = [
    { 
      id: 1, 
      name: 'GZ Totes Manufacturing', 
      type: 'factory', 
      location: 'Guangzhou, China', 
      region: 'Asia Pacific', 
      lat: 23.1291, 
      lng: 113.2644, 
      activePOs: 8, 
      completionRate: 94,
      specialties: ['Totes', 'Canvas Products']
    },
    { 
      id: 2, 
      name: 'EcoManufacturing Inc', 
      type: 'factory', 
      location: 'Mumbai, India', 
      region: 'Asia Pacific', 
      lat: 19.0760, 
      lng: 72.8777, 
      activePOs: 3, 
      completionRate: 88,
      specialties: ['Blankets', 'Sustainable Materials']
    },
    { 
      id: 3, 
      name: 'BaubleBar HQ', 
      type: 'brand', 
      location: 'New York, USA', 
      region: 'North America', 
      lat: 40.7128, 
      lng: -74.0060, 
      activePOs: 0, 
      completionRate: 0,
      specialties: ['Design', 'Quality Control']
    }
  ];

  // MTO Volume Analytics Data
  const mtoVolumeData = {
    month: [
      { period: 'Jan 2025', month: 0, year: 2025, initialTote: 245, iconTote: 189, blanket: 67, toteBag: 123 },
      { period: 'Feb 2025', month: 1, year: 2025, initialTote: 298, iconTote: 156, blanket: 89, toteBag: 167 },
      { period: 'Mar 2025', month: 2, year: 2025, initialTote: 334, iconTote: 201, blanket: 98, toteBag: 145 },
      { period: 'Apr 2025', month: 3, year: 2025, initialTote: 287, iconTote: 234, blanket: 76, toteBag: 198 },
      { period: 'May 2025', month: 4, year: 2025, initialTote: 356, iconTote: 189, blanket: 112, toteBag: 176 },
      { period: 'Jun 2025', month: 5, year: 2025, initialTote: 298, iconTote: 267, blanket: 89, toteBag: 134 },
      { period: 'Jul 2025', month: 6, year: 2025, initialTote: 312, iconTote: 245, blanket: 95, toteBag: 156 },
      { period: 'Aug 2025', month: 7, year: 2025, initialTote: 289, iconTote: 223, blanket: 87, toteBag: 143 },
      { period: 'Sep 2025', month: 8, year: 2025, initialTote: 276, iconTote: 198, blanket: 82, toteBag: 134 },
      { period: 'Oct 2025', month: 9, year: 2025, initialTote: 301, iconTote: 256, blanket: 91, toteBag: 167 },
      { period: 'Nov 2025', month: 10, year: 2025, initialTote: 324, iconTote: 278, blanket: 98, toteBag: 178 },
      { period: 'Dec 2025', month: 11, year: 2025, initialTote: 356, iconTote: 312, blanket: 112, toteBag: 198 }
    ],
    day: [
      { period: 'Mon', initialTote: 45, iconTote: 32, blanket: 12, toteBag: 28 },
      { period: 'Tue', initialTote: 52, iconTote: 38, blanket: 15, toteBag: 31 },
      { period: 'Wed', initialTote: 48, iconTote: 41, blanket: 18, toteBag: 35 },
      { period: 'Thu', initialTote: 56, iconTote: 29, blanket: 11, toteBag: 42 },
      { period: 'Fri', initialTote: 61, iconTote: 47, blanket: 16, toteBag: 38 },
      { period: 'Sat', initialTote: 34, iconTote: 25, blanket: 8, toteBag: 22 },
      { period: 'Sun', initialTote: 29, iconTote: 18, blanket: 6, toteBag: 19 }
    ]
  };

  // Helper function to generate daily dates for a specific month
  const generateDailyDatesForMonth = (monthData) => {
    const { month, year } = monthData;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyDates = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const fullDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      const isoDate = date.toISOString().split('T')[0];
      
      // Calculate MTO distribution for this day (simulate realistic distribution)
      const dayIndex = (day - 1) % 7; // Cycle through weekdays
      const baseData = mtoVolumeData.day[dayIndex];
      const dayMultiplier = day <= 15 ? 1.2 : 0.8; // More MTOs in first half of month
      
      dailyDates.push({
        day: day,
        date: date,
        dayOfWeek: dayOfWeek,
        dayName: dayName,
        fullDate: fullDate,
        isoDate: isoDate,
        period: `${dayOfWeek} ${day}`,
        initialTote: Math.round(baseData.initialTote * dayMultiplier),
        iconTote: Math.round(baseData.iconTote * dayMultiplier),
        blanket: Math.round(baseData.blanket * dayMultiplier),
        toteBag: Math.round(baseData.toteBag * dayMultiplier),
        totalMTOs: Math.round((baseData.initialTote + baseData.iconTote + baseData.blanket + baseData.toteBag) * dayMultiplier)
      });
    }
    
    return dailyDates;
  };

  // Helper function to get current month and year
  const getCurrentMonthYear = () => {
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear()
    };
  };

  // Helper function to format date for display
  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to get date range for a month
  const getMonthDateRange = (monthData) => {
    const { month, year } = monthData;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    return {
      start: startDate,
      end: endDate,
      startFormatted: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      endFormatted: endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  // Master Carton Data
  const masterCartonData = [
    {
      id: 'MC001',
      sku: 'MC-TT-001',
      referenceNumber: 'REF001',
      awb: 'AWB123456',
      eta: 'July 26, 2025',
      status: 'In Transit',
      mtos: [
        { po: 'PO123', lineId: 6, qty: 1, style: '14oz Natural Tote - Medium' },
        { po: 'PO123', lineId: 7, qty: 2, style: '14oz Natural Tote - Large' }
      ]
    },
    {
      id: 'MC002', 
      sku: 'MC-BL-001',
      referenceNumber: 'REF002',
      awb: 'AWB789012',
      eta: 'July 2, 2025',
      status: 'Delivered',
      mtos: [
        { po: 'PO125', lineId: 14, qty: 5, style: '14oz Natural Tote - Medium' }
      ]
    }
  ];

  // Audit Logs Data  
  const auditLogs = [
    {
      id: 1,
      timestamp: '2025-07-15 14:30:25',
      type: 'carton_mapping',
      sku: 'TT-001',
      cartonId: 'MC001',
      action: 'Packed',
      expectedQty: 3,
      actualQty: 3,
      variance: 0,
      status: 'ok'
    },
    {
      id: 2,
      timestamp: '2025-07-15 14:25:12',
      type: 'missing_product',
      sku: 'TT-002',
      cartonId: 'MC003',
      action: 'Quality Check',
      expectedQty: 5,
      actualQty: 4,
      variance: -1,
      status: 'shortage'
    },
    {
      id: 3,
      timestamp: '2025-07-15 13:45:33',
      type: 'carton_mapping',
      sku: 'BL-001',
      cartonId: 'MC002',
      action: 'Packed',
      expectedQty: 2,
      actualQty: 2,
      variance: 0,
      status: 'ok'
    },
    {
      id: 4,
      timestamp: '2025-07-15 12:15:44',
      type: 'missing_product',
      sku: 'TB-001',
      cartonId: 'MC004',
      action: 'Final Inspection',
      expectedQty: 8,
      actualQty: 7,
      variance: -1,
      status: 'shortage'
    }
  ];

  // Enhanced status options with new statuses
  const allStatusOptions = [
    'Not Started', 'In Production', 'QC', 'Shipping', 'Shipped', 'Cancelled', 'Rush Replacement'
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Not Started': 'bg-gray-100 text-gray-700',
      'In Production': 'bg-blue-100 text-blue-700', 
      'QC': 'bg-yellow-100 text-yellow-700',
      'Shipping': 'bg-purple-100 text-purple-700',
      'Shipped': 'bg-green-100 text-green-700',
      'Receive PO': 'bg-gray-100 text-gray-700',
      'Cancelled': 'bg-red-100 text-red-700',
      'Rush Replacement': 'bg-orange-100 text-orange-700'
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
    console.log('togglePOExpansion called with:', po, 'Current tab:', brandActiveTab);
    const newExpanded = new Set(expandedPOs);
    if (newExpanded.has(po)) {
      newExpanded.delete(po);
    } else {
      newExpanded.add(po);
    }
    setExpandedPOs(newExpanded);
    // Ensure we stay in the MTO Management tab when expanding/collapsing
    if (brandActiveTab === 'mto-management') {
      // Force a re-render without changing the tab
      setTimeout(() => {
        console.log('Ensuring we stay in MTO Management tab');
      }, 0);
    }
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

  // Function to handle clicking on reference number to show MTO details popup
  const handleReferenceNumberClick = (shipment) => {
    // Find the corresponding MTO data
    const mtoData = brandPOs.flatMap(po => 
      po.mtos.filter(mto => 
        po.po === shipment.po && mto.lineId === shipment.lineId
      )
    )[0];
    
    if (mtoData) {
      setViewMtoDetail({ mto: mtoData, po: brandPOs.find(po => po.po === shipment.po) });
    }
  };

  // Shared InventoryTab component
  const InventoryTab = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{t('nav.inventory', 'Inventory Management')}</h2>
            <p className="text-gray-600 mt-1">{t('common.autoCalculatedMaterial', 'Auto-calculated material needs and allocation')}</p>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.material', 'Material')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.needed', 'Needed')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.inStock', 'In Stock')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.allocated', 'Allocated')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.available', 'Available')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.status', 'Status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.usedByMTOs', 'Used By MTOs')}</th>
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
                <td className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.usedBy.join(', ')}</span>
                    {item.status === 'short' && (
                      <button 
                        onClick={() => {
                          setShowChat(true);
                          // Auto-create chat for material inquiry
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 px-2 py-1 rounded flex items-center gap-1"
                        title={t('descriptions.autoChatWithFactory', 'AutoChat with factory about material availability')}
                      >
                        <MessageCircle className="h-3 w-3" />
                        Inquiry
                      </button>
                    )}
                  </div>
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
            {t('descriptions.inventoryAutoDeducted', 'Inventory auto-deducted when MTOs marked "Shipped"')}
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            Update Stock Levels
          </button>
        </div>
      </div>
    </div>
  );

  const BrandView = () => (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setBrandActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                brandActiveTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('nav.overview', 'Overview')}
              </div>
            </button>
            <button
              onClick={() => setBrandActiveTab('mto-management')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                brandActiveTab === 'mto-management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('nav.mtoManagement', 'MTO Management')}
              </div>
            </button>
            <button
              onClick={() => setBrandActiveTab('shipping')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                brandActiveTab === 'shipping'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                {t('nav.shipping', 'Shipping')}
              </div>
            </button>
            <button
              onClick={() => setBrandActiveTab('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                brandActiveTab === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t('nav.inventory', 'Inventory')}
              </div>
            </button>
            <button
              onClick={() => setBrandActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                brandActiveTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                {t('nav.messages', 'Messages')}
              </div>
            </button>
            <button
              onClick={() => setBrandActiveTab('defects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                brandActiveTab === 'defects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {t('nav.defects', 'Defects')}
              </div>
            </button>
            <button
              onClick={() => setBrandActiveTab('connections')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                brandActiveTab === 'connections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                {t('nav.connections', 'Connections')}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {brandActiveTab === 'overview' && (
        <div className="space-y-6">
          {/* Best Products Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              {t('brand.bestProducts', 'Best Products Overview')}
            </h2>
            <p className="text-gray-600 mt-1">{t('brand.topPerformingSKUs', 'Top performing SKUs by volume, delays, and ratings')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestProducts.map((product) => (
            <div 
              key={product.sku} 
              className="group relative bg-gradient-to-br from-white to-gray-50 border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
              style={{ backgroundColor: product.color }}
              onClick={() => setSelectedProduct(product)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{product.icon}</div>
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  product.trend === 'up' ? 'bg-green-100 text-green-700' :
                  product.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {product.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                   product.trend === 'down' ? <AlertTriangle className="h-3 w-3" /> :
                   <BarChart3 className="h-3 w-3" />}
                  {product.trend}
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-xs text-gray-600 mb-3">{product.type}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('common.volume', 'Volume')}</span>
                  <span className="font-medium">{product.orderVolume}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('common.delays', 'Delays')}</span>
                  <span className={`font-medium ${product.delayFreq > 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {product.delayFreq}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('common.rating', 'Rating')}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-xl transition-all"></div>
            </div>
          ))}
        </div>
      </div>

      {/* MTO Volume Analytics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              {t('brand.mtoVolumeAnalytics', 'MTO Volume Analytics')}
            </h2>
            <p className="text-gray-600 mt-1">{t('brand.trackMTOVolume', 'Track MTO volume by product type over time')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowLocationView(!showLocationView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                showLocationView 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <MapPin className="h-4 w-4" />
              {showLocationView ? t('common.hideLocationView', 'Hide Location View') : t('common.salesByLocation', 'Sales by Location')}
            </button>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedTimeframe('day')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedTimeframe === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('common.perDay', 'Per Day')}
              </button>
              <button
                onClick={() => setSelectedTimeframe('month')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedTimeframe === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('common.perMonth', 'Per Month')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex items-end justify-between h-64 gap-2">
              {mtoVolumeData[selectedTimeframe].map((data, index) => {
                const total = data.initialTote + data.iconTote + data.blanket + data.toteBag;
                const maxTotal = Math.max(...mtoVolumeData[selectedTimeframe].map(d => 
                  d.initialTote + d.iconTote + d.blanket + d.toteBag
                ));
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-100 rounded-t relative" style={{ height: `${(total / maxTotal) * 200}px` }}>
                      <div 
                        className="bg-blue-500 rounded-t absolute bottom-0 w-full"
                        style={{ height: `${(data.initialTote / total) * 100}%` }}
                        title={`Initial Tote: ${data.initialTote}`}
                      ></div>
                      <div 
                        className="bg-purple-500 absolute w-full"
                        style={{ 
                          height: `${(data.iconTote / total) * 100}%`,
                          bottom: `${(data.initialTote / total) * 100}%`
                        }}
                        title={`Icon Tote: ${data.iconTote}`}
                      ></div>
                      <div 
                        className="bg-yellow-500 absolute w-full"
                        style={{ 
                          height: `${(data.blanket / total) * 100}%`,
                          bottom: `${((data.initialTote + data.iconTote) / total) * 100}%`
                        }}
                        title={`Blanket: ${data.blanket}`}
                      ></div>
                      <div 
                        className="bg-green-500 absolute w-full"
                        style={{ 
                          height: `${(data.toteBag / total) * 100}%`,
                          bottom: `${((data.initialTote + data.iconTote + data.blanket) / total) * 100}%`
                        }}
                        title={`Tote Bag: ${data.toteBag}`}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-center">
                      <div className="font-medium">{data.period}</div>
                      <div className="text-gray-600">{total}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>{t('products.initialTote', 'Initial Tote')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>{t('products.iconTote', 'Icon Tote')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>{t('products.blanket', 'Blanket')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>{t('products.toteBag', 'Tote Bag')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Inline Location View */}
        {showLocationView && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                {t('common.salesByLocation', 'Sales by Location')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{t('descriptions.revenueDistribution', 'Revenue distribution by shipping regions and zip codes')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map Placeholder */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 h-80 flex items-center justify-center">
                <div className="text-center text-gray-700">
                  <Globe className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <p className="text-lg font-medium mb-2">{t('descriptions.interactiveSalesMap', 'Interactive Sales Map')}</p>
                  <p className="text-sm text-gray-600 mb-2">Visual distribution of sales data:</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Regional performance by zip codes</p>
                    <p>• Top products per location</p>
                    <p>• Growth trends and demographics</p>
                  </div>
                </div>
              </div>
              
              {/* Sales Regions Data */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">{t('descriptions.regionalOverview', 'Regional Overview')}</h4>
                  <div className="text-sm text-gray-500">
                    Total: ${brandSalesLocationData.reduce((sum, region) => sum + region.totalSales, 0).toLocaleString()}
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {brandSalesLocationData.slice(0, 4).map((region) => (
                    <div key={region.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900">{region.region}</h5>
                          <p className="text-sm text-gray-600">{region.city}, {region.state}</p>
                          <p className="text-xs text-gray-500">Zip: {region.zipCodes.slice(0, 2).join(', ')}</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {region.growth > 0 ? `+${region.growth}%` : `${region.growth}%`}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">${(region.totalSales / 1000).toFixed(0)}k</div>
                          <div className="text-xs text-gray-600">{t('table.sales', 'Sales')}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{region.totalOrders}</div>
                          <div className="text-xs text-gray-600">{t('table.orders', 'Orders')}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-purple-600">${Math.round(region.totalSales / region.totalOrders)}</div>
                          <div className="text-xs text-gray-600">{t('table.avg', 'Avg')}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-1 font-medium">Top Products:</p>
                        <div className="space-y-1">
                          {region.topProducts.slice(0, 2).map((product, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-gray-700 truncate">{product.name}</span>
                              <span className="text-gray-500 ml-2">${(product.revenue / 1000).toFixed(0)}k</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-bold text-blue-600">
                        {brandSalesLocationData.reduce((sum, region) => sum + region.totalOrders, 0).toLocaleString()}
                      </div>
                      <div className="text-gray-600">{t('table.totalOrders', 'Total Orders')}</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-600">
                        {Math.round(brandSalesLocationData.reduce((sum, region) => sum + region.growth, 0) / brandSalesLocationData.length)}%
                      </div>
                      <div className="text-gray-600">{t('table.avgGrowth', 'Avg Growth')}</div>
                    </div>
                    <div>
                      <div className="font-bold text-purple-600">
                        {brandSalesLocationData.length}
                      </div>
                      <div className="text-gray-600">Regions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Dashboard Integration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              AWB Analytics Overview
            </h2>
            <p className="text-gray-600 mt-1">Air Waybill analysis and embroidery statistics</p>
          </div>
          <button
            onClick={() => setBrandActiveTab('analytics-full')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Full Analytics →
          </button>
        </div>
        <AnalyticsDashboard mtoData={brandPOs.flatMap(po => po.mtos || [])} />
      </div>

        </div>
      )}

      {/* MTO Management Tab */}
      {brandActiveTab === 'mto-management' && (
        <div className="space-y-6">
          {/* PO Management Header */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">PO Management</h2>
                <span className="text-xs text-gray-500">Upload and track PO/MTO fulfillment</span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => setShowAdvancedSearch(true)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700"
                >
                  <Search className="h-3 w-3" />
                  Search
                </button>
                <button 
                  onClick={() => setShowChat(true)}
                  className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded text-xs hover:bg-gray-50"
                >
                  <MessageCircle className="h-3 w-3" />
                  Chat
                </button>
                <button 
                  onClick={() => navigate('/products')}
                  className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded text-xs hover:bg-gray-50"
                >
                  <Box className="h-3 w-3" />
                  3D
                </button>
              </div>
            </div>

            {/* Upload PO + MTO File Section */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-gray-900">Upload PO + MTO File</h3>
                  <span className="text-xs text-gray-500">Excel or CSV files</span>
                </div>
                <div className="flex gap-1">
                  <button className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700">
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                  <button className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded text-xs hover:bg-gray-50">
                    <Download className="h-3 w-3" />
                    Template
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar 
              filters={brandFilters} 
              setFilters={setBrandFilters} 
              showAdvanced={showBrandAdvanced} 
              setShowAdvanced={setShowBrandAdvanced}
              factoryList={['GZ Totes', 'ABC Factory', 'XYZ Manufacturing']}
            />
            
            {/* Date Range Filter */}
            <div className="bg-gray-50 rounded-lg p-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-medium text-gray-900">Date Range:</h3>
                  <input 
                    type="date" 
                    className="border border-gray-300 rounded px-2 py-1 text-xs w-28"
                    placeholder={t('forms.from', 'From')}
                  />
                  <span className="text-xs text-gray-500">to</span>
                  <input 
                    type="date" 
                    className="border border-gray-300 rounded px-2 py-1 text-xs w-28"
                    placeholder={t('forms.to', 'To')}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                    {t('common.apply', 'Apply')}
                  </button>
                  <button className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MTO Management by Product Category */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-gray-900">MTO Management by Product Category</h3>
                <span className="text-xs text-gray-500">Track by product type and status</span>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded p-1">
                <button
                  onClick={() => setViewMode('po')}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    viewMode === 'po' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  PO View
                </button>
                <button
                  onClick={() => setViewMode('mto')}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    viewMode === 'mto' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  MTO View
                </button>
              </div>
            </div>

                         {/* Product Type Tabs */}
             <div className="flex gap-1 bg-gray-100 rounded p-1 mb-3">
               {[t('common.allProducts', 'All Products'), t('products.initialTote', 'Initial Tote'), t('products.iconTote', 'Icon Tote'), t('products.blanket', 'Blanket'), t('products.toteBag', 'Tote Bag')].map((product, index) => (
                 <button
                   key={product}
                   onClick={() => setSelectedProductType(index === 0 ? null : product)}
                   className={`px-2 py-1 rounded text-xs font-medium transition-colors flex-1 ${
                     (selectedProductType || t('common.allProducts', 'All Products')) === product ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                   }`}
                 >
                   {product}
                 </button>
               ))}
             </div>

            {/* Monthly MTO View - Top Level */}
            <div className="space-y-4">
                          {/* Date Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-gray-900">Date Navigation</h3>
                  <div className="flex items-center gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                      Current
                    </button>
                    <button className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                      Prev
                    </button>
                    <button className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input 
                    type="month" 
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                    defaultValue="2025-07"
                  />
                  <button className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                    Go
                  </button>
                </div>
              </div>
            </div>
              
              {mtoVolumeData.month.map((monthData) => {
                const monthlyMTOs = brandPOs.flatMap(po => 
                  po.mtos.filter(mto => {
                    if (selectedProductType && (mto.productType || 'Initial Tote') !== selectedProductType) {
                      return false;
                    }
                    return true;
                  })
                );
                
                return (
                  <div key={monthData.period} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    {/* Monthly Header */}
                    <div 
                      className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 cursor-pointer hover:from-blue-100 hover:to-blue-200"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Month clicked:', monthData.period);
                        togglePOExpansion(monthData.period);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {expandedPOs.has(monthData.period) ? 
                              <ChevronDown className="h-6 w-6 text-blue-600" /> : 
                              <ChevronRight className="h-6 w-6 text-blue-600" />
                            }
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">📅 {monthData.period}</h3>
                              <p className="text-sm text-gray-700">
                                {selectedProductType ? 
                                  `${monthData[selectedProductType.toLowerCase().replace(' ', '')] || 0} ${selectedProductType} MTOs` :
                                  `${monthData.initialTote + monthData.iconTote + monthData.blanket + monthData.toteBag} Total MTOs`
                                }
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {getMonthDateRange(monthData).startFormatted} - {getMonthDateRange(monthData).endFormatted}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Monthly Summary */}
                        <div className="flex items-center gap-6">
                          <div className="grid grid-cols-4 gap-3 text-center">
                            <div className="bg-white rounded-lg px-3 py-2">
                              <div className="text-xs text-gray-600">Initial</div>
                              <div className="font-bold text-lg">{monthData.initialTote}</div>
                            </div>
                            <div className="bg-white rounded-lg px-3 py-2">
                              <div className="text-xs text-gray-600">Icon</div>
                              <div className="font-bold text-lg">{monthData.iconTote}</div>
                            </div>
                            <div className="bg-white rounded-lg px-3 py-2">
                              <div className="text-xs text-gray-600">Blanket</div>
                              <div className="font-bold text-lg">{monthData.blanket}</div>
                            </div>
                            <div className="bg-white rounded-lg px-3 py-2">
                              <div className="text-xs text-gray-600">Tote</div>
                              <div className="font-bold text-lg">{monthData.toteBag}</div>
                            </div>
                          </div>
                          {/* Month Chat Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowChat(true);
                              setChatContext({
                                type: 'month',
                                id: monthData.period,
                                title: `Monthly Planning - ${monthData.period}`
                              });
                            }}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title={`Chat about ${monthData.period} production`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Daily MTO View - Nested within Month */}
                    {expandedPOs.has(monthData.period) && (
                      <div className="bg-gray-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-700">📆 Daily MTO Breakdown</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{getMonthDateRange(monthData).startFormatted} - {getMonthDateRange(monthData).endFormatted}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {generateDailyDatesForMonth(monthData).map((dayData) => (
                            <div key={`${monthData.period}-${dayData.isoDate}`} className="bg-white border rounded-lg overflow-hidden">
                              {/* Daily Header */}
                              <div 
                                className="bg-gray-100 p-2 cursor-pointer hover:bg-gray-200"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Day clicked:', `${monthData.period}-${dayData.isoDate}`);
                                  togglePOExpansion(`${monthData.period}-${dayData.isoDate}`);
                                }}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {expandedPOs.has(`${monthData.period}-${dayData.isoDate}`) ? 
                                        <ChevronDown className="h-4 w-4 text-gray-600" /> : 
                                        <ChevronRight className="h-4 w-4 text-gray-600" />
                                      }
                                      <div>
                                        <h5 className="text-sm font-semibold flex items-center gap-1">
                                          <span className="text-blue-600">{dayData.dayOfWeek}</span>
                                          <span className="text-gray-900">{dayData.day}</span>
                                          <span className="text-xs text-gray-500">({dayData.fullDate})</span>
                                        </h5>
                                        <p className="text-xs text-gray-600">
                                          {dayData.totalMTOs} MTOs • {dayData.dayName}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Daily Product Counts */}
                                  <div className="flex items-center gap-3">
                                    <div className="flex gap-3 text-xs">
                                      <span className="text-gray-600">IT: <strong>{dayData.initialTote}</strong></span>
                                      <span className="text-gray-600">IC: <strong>{dayData.iconTote}</strong></span>
                                      <span className="text-gray-600">BL: <strong>{dayData.blanket}</strong></span>
                                      <span className="text-gray-600">TB: <strong>{dayData.toteBag}</strong></span>
                                    </div>
                                    {/* Day Chat Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowChat(true);
                                        setChatContext({
                                          type: 'day',
                                          id: dayData.isoDate,
                                          title: `Daily Production - ${dayData.fullDate}`
                                        });
                                      }}
                                      className="p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                      title={`Chat about ${dayData.fullDate} production`}
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Individual MTOs with Unique IDs */}
                              {expandedPOs.has(`${monthData.period}-${dayData.isoDate}`) && (
                                <div className="p-3 bg-gray-50">
                                  {/* Ultra-Compact Header */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{monthlyMTOs.slice(0, dayData.initialTote + dayData.iconTote + dayData.blanket + dayData.toteBag).length}</span>
                                      </div>
                                      <div>
                                        <h5 className="text-sm font-semibold text-gray-900">{dayData.period} Production</h5>
                                        <div className="flex items-center gap-3 text-xs text-gray-600">
                                          <span>🟢 {monthlyMTOs.filter(m => m.status === 'cutting' || m.status === 'QC').length} Active</span>
                                          <span>🟡 {monthlyMTOs.filter(m => m.status === 'pending').length} Pending</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <input type="text" placeholder={t('forms.searchID', 'Search ID...')} className="text-xs border border-gray-300 rounded px-2 py-1 w-24" />
                                      <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Filter</button>
                                    </div>
                                  </div>
                                  
                                  {/* Ultra-Dense Table for 100+ Items */}
                                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto max-h-96">
                                      <table className="w-full text-xs">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                          <tr className="border-b border-gray-200">
                                            <th className="px-2 py-1.5 text-left font-medium text-gray-700 w-32">MTO ID & Internal</th>
                                            <th className="px-2 py-1.5 text-left font-medium text-gray-700 w-48">Product Details</th>
                                            <th className="px-2 py-1.5 text-left font-medium text-gray-700 w-32">Order Info</th>
                                            <th className="px-2 py-1.5 text-center font-medium text-gray-700 w-16">Q</th>
                                            <th className="px-2 py-1.5 text-center font-medium text-gray-700 w-20">Status</th>
                                            <th className="px-2 py-1.5 text-left font-medium text-gray-700 w-28">Key Dates</th>
                                            <th className="px-2 py-1.5 text-left font-medium text-gray-700 w-32">Shipping Details</th>
                                            <th className="px-2 py-1.5 text-center font-medium text-gray-700 w-40">
                                              <div className="flex items-center justify-center gap-2">
                                                <span>Customization Spots</span>
                                                <button
                                                  onClick={() => setShowCustomizationGallery(true)}
                                                  className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
                                                  title={t('descriptions.viewCustomizationGallery', 'View Customization Gallery')}
                                                >
                                                  <Palette className="h-3 w-3" />
                                                </button>
                                              </div>
                                            </th>
                                            <th className="px-2 py-1.5 text-left font-medium text-gray-700 w-28">Production Info</th>
                                            <th className="px-2 py-1.5 text-center font-medium text-gray-700 w-12">Chat</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                          {monthlyMTOs.slice(0, dayData.totalMTOs).map((mto, idx) => {
                                            const uniqueMtoId = `MTO-${monthData.period.replace(' ', '')}-${dayData.isoDate}-${mto.internalId || mto.lineId}-${idx}`;
                                            const filledSpots = [1, 2, 3, 4, 5, 6].filter(spot => mto[`spot${spot}`]).length;
                                            const isActive = mto.status === 'cutting' || mto.status === 'QC';
                                            const progress = (filledSpots / 6) * 100;
                                            
                                            return (
                                              <tr 
                                                key={uniqueMtoId} 
                                                data-mto-id={uniqueMtoId}
                                                className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                                                  isActive ? 'bg-green-50/30' : ''
                                                }`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setViewMtoDetail({ 
                                                    mto: { ...mto, uniqueId: uniqueMtoId }, 
                                                    po: brandPOs.find(po => po.mtos.includes(mto)) 
                                                  });
                                                }}
                                              >
                                                {/* MTO ID & Internal Details */}
                                                <td className="px-2 py-1.5">
                                                  <div className="flex items-center gap-1">
                                                    <div className={`w-1.5 h-10 rounded-full ${isActive ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                    <div>
                                                      <div className="font-mono text-xs font-bold text-blue-700">
                                                        {uniqueMtoId}
                                                      </div>
                                                      <div className="text-xs text-gray-700 font-semibold">
                                                        Internal: {mto.internalId || '37483586'}
                                                      </div>
                                                      <div className="text-xs text-gray-500">
                                                        Line: {mto.poLineId || mto.lineId}
                                                      </div>
                                                      <div className="text-xs text-gray-400 font-mono">
                                                        Ref: {mto.referenceNumber || 'md6a4z3j45we9'}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </td>
                                                
                                                {/* Product Details */}
                                                <td className="px-2 py-1.5">
                                                  <div>
                                                    <div className="text-xs font-semibold text-gray-900 line-clamp-2">
                                                      {mto.displayName || mto.style}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-0.5">
                                                      Product Type: {mto.productType || 'Initial Tote'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      Bag Base PID: {mto.bagBasePid || mto.bagBasePID || '133938'}
                                                    </div>
                                                  </div>
                                                </td>
                                                
                                                {/* Order Information */}
                                                <td className="px-2 py-1.5">
                                                  <div>
                                                    <div className="text-xs font-semibold text-blue-600">
                                                      SO: {mto.salesOrderNumber || 'SO2508459'}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                      Shopify: {mto.shopifyOrderDateTime || '07/16/25 02:15 PM'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      SO Date: {mto.soDate || '16/07/2025'}
                                                    </div>
                                                  </div>
                                                </td>
                                                
                                                {/* Quantity */}
                                                <td className="px-2 py-1.5 text-center">
                                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-sm font-bold">
                                                    {mto.qty || mto.quantity || 1}
                                                  </span>
                                                </td>
                                                
                                                {/* Status Details */}
                                                <td className="px-2 py-1.5 text-center">
                                                  <div className="flex flex-col items-center gap-0.5">
                                                    <div className={`w-4 h-4 rounded-full ${
                                                      isActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                                                    }`}></div>
                                                    <span className="text-xs text-gray-700 font-medium">
                                                      {mto.vendorPoStatus || mto.status || 'process'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                      {mto.priority === 'high' ? '🔥 HIGH' : 'Normal'}
                                                    </span>
                                                    {/* Defect Indicator */}
                                                    {(Math.random() > 0.8 || mto.hasDefect) && (
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setBrandActiveTab('defects');
                                                        }}
                                                        className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
                                                        title="This MTO has reported defects - Click to view"
                                                      >
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Defect
                                                      </button>
                                                    )}
                                                  </div>
                                                </td>
                                                
                                                {/* Key Dates */}
                                                <td className="px-2 py-1.5">
                                                  <div>
                                                    <div className="text-xs font-semibold text-blue-600">
                                                      Expected: {mto.expectedShipDate || mto.eta}
                                                    </div>
                                                    <div className="text-xs text-green-600">
                                                      Actual: {mto.actualShipDate || 'Pending'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      Submit: {mto.orderSubmitDate || '16/07/2025'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      CPSD: {mto.cpsd || '06/08/2025'}
                                                    </div>
                                                  </div>
                                                </td>
                                                
                                                {/* Shipping Details */}
                                                <td className="px-2 py-1.5">
                                                  <div>
                                                    <div className="text-xs font-medium text-gray-900">
                                                      AWB: {mto.awb || 'Not Assigned'}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                      Track: {mto.poLineTrackingNumber || 'Not Available'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      Master: {mto.masterCarton || 'TBD'}
                                                    </div>
                                                  </div>
                                                </td>
                                                
                                                {/* Visual Customization Spots with Icons */}
                                                <td className="px-2 py-1.5">
                                                  <div>
                                                    <div className="grid grid-cols-6 gap-0.5 mb-1">
                                                      {[1, 2, 3, 4, 5, 6].map((spot) => {
                                                        const patchRef = mto[`spot${spot}PatchRef`];
                                                        const iconData = getIconFromPatchRef(patchRef);
                                                        const hasPatch = mto[`spot${spot}`];
                                                        const patchPreview = hasPatch ? generatePatchPreview(patchRef, mto[`spot${spot}`]) : null;
                                                        
                                                        return (
                                                          <div 
                                                            key={spot}
                                                            className={`relative w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border-2 group cursor-help transition-all hover:scale-110 ${
                                                              hasPatch 
                                                                ? iconData 
                                                                  ? `${iconData.bg} ${iconData.color} border-current shadow-sm`
                                                                  : 'bg-blue-500 text-white border-blue-600 shadow-sm'
                                                                : 'bg-gray-100 text-gray-400 border-gray-300'
                                                            }`}
                                                          >
                                                            {hasPatch && iconData ? (
                                                              // Render the actual icon
                                                              React.createElement(iconData.icon, { 
                                                                size: 12, 
                                                                className: 'drop-shadow-sm' 
                                                              })
                                                            ) : (
                                                              // Show spot number if no icon
                                                              <span className="text-xs font-bold">{spot}</span>
                                                            )}
                                                            
                                                            {/* Enhanced Hover Tooltip with Actual Patch Preview */}
                                                            {hasPatch && (
                                                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30">
                                                                <div className="bg-white border border-gray-200 rounded-lg shadow-xl px-4 py-3 whitespace-nowrap max-w-80">
                                                                  {/* Header with Patch Preview */}
                                                                  <div className="flex items-center gap-3 mb-2">
                                                                    {patchPreview && (
                                                                      <PatchPreview 
                                                                        patchData={patchPreview} 
                                                                        size="large" 
                                                                      />
                                                                    )}
                                                                    <div>
                                                                      <div className="font-bold text-gray-900 text-sm">
                                                                        Spot {spot} - {patchPreview?.iconName || 'Custom'}
                                                                      </div>
                                                                      <div className="text-xs text-gray-500">
                                                                        {iconData ? iconData.category : 'Custom'} • {patchPreview?.patchStyle.material || 'Embroidered'}
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                  
                                                                  {/* Patch Specifications */}
                                                                  <div className="border-t border-gray-100 pt-2 space-y-1">
                                                                    <div className="text-xs font-medium text-gray-700">
                                                                      SKU: <span className="text-blue-600 font-mono">{mto[`spot${spot}`]}</span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-600">
                                                                      {patchRef || 'No description'}
                                                                    </div>
                                                                    {patchPreview && (
                                                                      <div className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-50">
                                                                        <div>Shape: {patchPreview.patchStyle.shape} • Size: {patchPreview.patchStyle.size}</div>
                                                                        <div>Material: {patchPreview.patchStyle.material} • {patchPreview.patchStyle.texture}</div>
                                                                      </div>
                                                                    )}
                                                                  </div>
                                                                  
                                                                  {/* Additional Patch Examples */}
                                                                  {patchPreview && (
                                                                    <div className="border-t border-gray-100 pt-2 mt-2">
                                                                      <div className="text-xs font-medium text-gray-700 mb-1">Preview Variations:</div>
                                                                      <div className="flex items-center gap-2">
                                                                        <PatchPreview 
                                                                          patchData={{...patchPreview, patchStyle: {...patchPreview.patchStyle, shape: 'circle'}}} 
                                                                          size="small" 
                                                                        />
                                                                        <PatchPreview 
                                                                          patchData={{...patchPreview, patchStyle: {...patchPreview.patchStyle, shape: 'square'}}} 
                                                                          size="small" 
                                                                        />
                                                                        <PatchPreview 
                                                                          patchData={{...patchPreview, patchStyle: {...patchPreview.patchStyle, material: 'vinyl'}}} 
                                                                          size="small" 
                                                                        />
                                                                        <div className="text-xs text-gray-400 ml-1">+more</div>
                                                                      </div>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                                {/* Tooltip Arrow */}
                                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                                  <div className="border-4 border-transparent border-t-white"></div>
                                                                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-1">
                                                                    <div className="border-4 border-transparent border-t-gray-200"></div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            )}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                    
                                                    {/* Progress Bar with Category Breakdown */}
                                                    <div className="text-xs text-gray-600 mb-1 flex items-center justify-between">
                                                      <span>Fill: {filledSpots}/6 ({Math.round(progress)}%)</span>
                                                      <div className="flex items-center gap-1">
                                                        {Object.values([1,2,3,4,5,6].reduce((acc, spot) => {
                                                          const patchRef = mto[`spot${spot}PatchRef`];
                                                          const iconData = getIconFromPatchRef(patchRef);
                                                          if (iconData && mto[`spot${spot}`]) {
                                                            acc[iconData.category] = (acc[iconData.category] || 0) + 1;
                                                          }
                                                          return acc;
                                                        }, {})).slice(0, 3).map((count, idx) => (
                                                          <div key={idx} className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                    
                                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                      <div 
                                                        className={`h-full transition-all ${
                                                          progress === 100 ? 'bg-green-500' : 
                                                          progress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                                                        }`}
                                                        style={{ width: `${progress}%` }}
                                                      ></div>
                                                    </div>
                                                    
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                      Hover for visual preview
                                                    </div>
                                                  </div>
                                                </td>
                                                
                                                {/* Production Information */}
                                                <td className="px-2 py-1.5">
                                                  <div>
                                                    <div className="text-xs font-medium text-gray-900">
                                                      {mto.progress ? `Step ${mto.progress}/4` : 'Not Started'}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                      XF Date: {mto.xfDate || 'TBD'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      Factory: {mto.factory || 'Main'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      Started: {mto.actualStartDate || 'Pending'}
                                                    </div>
                                                  </div>
                                                </td>
                                                
                                                {/* Action */}
                                                <td className="px-2 py-1.5 text-center">
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setShowChat(true);
                                                      setChatContext({
                                                        type: 'mto',
                                                        id: uniqueMtoId,
                                                        title: `MTO ${uniqueMtoId}`,
                                                        cartonId: mto.masterCarton
                                                      });
                                                    }}
                                                    className="p-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                                    title={`Chat about MTO ${uniqueMtoId}`}
                                                  >
                                                    <MessageCircle className="h-3 w-3" />
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                    
                                    {/* Pagination for 100+ items */}
                                    <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-600 flex items-center justify-between">
                                      <span>1-{Math.min(100, monthlyMTOs.length)} of {monthlyMTOs.length}</span>
                                      <div className="flex items-center gap-1">
                                        <button className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100">Prev</button>
                                        <button className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100">Next</button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Bottom Quick Stats - Minimal */}
                                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                                    <div className="flex items-center gap-4">
                                      <span>Active: <strong className="text-green-600">{monthlyMTOs.filter(m => m.status === 'cutting' || m.status === 'QC').length}</strong></span>
                                      <span>Pending: <strong className="text-yellow-600">{monthlyMTOs.filter(m => m.status === 'pending').length}</strong></span>
                                      <span>Units: <strong className="text-blue-600">{monthlyMTOs.reduce((sum, m) => sum + (m.qty || 1), 0)}</strong></span>
                                    </div>
                                    <div>
                                      Completion: <strong className="text-indigo-600">{Math.round(monthlyMTOs.reduce((sum, m) => sum + ([1,2,3,4,5,6].filter(s => m[`spot${s}`]).length), 0) / (monthlyMTOs.length * 6) * 100)}%</strong>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Shipping Tab */}
      {brandActiveTab === 'shipping' && (
        <div className="space-y-6">
          <InventoryCartonSplit mtoData={brandPOs.flatMap(po => po.mtos || [])} isShippingView={true} />
        </div>
      )}

      {/* Original Shipping Tab Content - Hidden for now */}
      {brandActiveTab === 'shipping-old' && (
        <div className="space-y-6">
          {/* Shipping Overview Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                              <div>
                  <h2 className="text-xl font-bold text-gray-900">Shipping Management</h2>
                  <p className="text-gray-600 mt-1">Track shipments, manage carriers, and monitor delivery performance</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Upload className="h-4 w-4" />
                    Create Shipment
                  </button>
                  <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                    <Download className="h-4 w-4" />
                    Export Report
                  </button>
                  <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                    <Truck className="h-4 w-4" />
                    Carrier Management
                  </button>
                </div>
            </div>

            {/* Shipping Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">In Transit</p>
                    <p className="text-2xl font-bold text-blue-700">{shippingData.filter(s => s.status === 'In Transit').length}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Delivered</p>
                    <p className="text-2xl font-bold text-green-700">{shippingData.filter(s => s.status === 'Delivered').length}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                    <Award className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">{shippingData.filter(s => s.status === 'Pending').length}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Shipments</p>
                    <p className="text-2xl font-bold text-purple-700">{shippingData.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

                         {/* Carrier Performance */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
               <h3 className="font-semibold text-gray-900 mb-3">Carrier Performance</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-white rounded-lg p-3">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-gray-900">UPS</span>
                     <span className="text-sm text-green-600">96%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">On-time delivery rate</p>
                 </div>
                 <div className="bg-white rounded-lg p-3">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-gray-900">FedEx</span>
                     <span className="text-sm text-blue-600">94%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">On-time delivery rate</p>
                 </div>
                 <div className="bg-white rounded-lg p-3">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-gray-900">DHL</span>
                     <span className="text-sm text-yellow-600">89%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">On-time delivery rate</p>
                 </div>
               </div>
             </div>
          </div>

                     {/* Active Shipments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Active Shipments</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={t('forms.searchShipments', 'Search shipments...')} 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>{t('common.allStatus', 'All Status')}</option>
                    <option>{t('mto.inTransit', 'In Transit')}</option>
                    <option>{t('mto.delivered', 'Delivered')}</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">
                      Shipment Details
                      <div className="text-xs text-gray-500 font-normal mt-1">Click Ref # for MTO details</div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Tracking</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Carrier</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Timeline</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shippingData.map((shipment, index) => {
                    const statusColor = shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                                      shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                      'bg-yellow-100 text-yellow-800';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div 
                              className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 group"
                              onClick={() => handleReferenceNumberClick(shipment)}
                              title={t('descriptions.viewMTODetails', 'Click to view MTO details')}
                            >
                              <span>Ref: {shipment.referenceNumber}</span>
                              <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-sm text-gray-600">PO: {shipment.po} Line {shipment.lineId}</div>
                            <div className="text-xs text-gray-500">Master Carton: {shipment.masterCarton}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-blue-600">{shipment.trackingNumber}</div>
                            <div className="text-sm text-gray-600">AWB: {shipment.awb}</div>
                            <div className="text-xs text-gray-500">Ship Date: {shipment.shipDate}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Truck className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{shipment.carrier}</div>
                              <div className="text-xs text-gray-500">Express</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">ETA: {shipment.eta}</div>
                            <div className="text-xs text-gray-500">
                              {shipment.status === 'In Transit' ? '2 days remaining' : 
                               shipment.status === 'Delivered' ? 'Delivered on time' : 'Processing'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Track
                            </button>
                            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                              Details
                            </button>
                            {shipment.files.length > 0 && (
                              <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                Files ({shipment.files.length})
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipping Analytics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Delivery Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">On-time Delivery</span>
                    <span className="text-sm font-medium text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Transit Time</span>
                    <span className="text-sm font-medium text-blue-600">3.2 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Damaged Shipments</span>
                    <span className="text-sm font-medium text-red-600">0.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lost Shipments</span>
                    <span className="text-sm font-medium text-red-600">0.1%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Cost Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Spend</span>
                    <span className="text-sm font-medium text-gray-900">$8,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Cost/Shipment</span>
                    <span className="text-sm font-medium text-blue-600">$42.25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cost Savings</span>
                    <span className="text-sm font-medium text-green-600">$1,230</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Insurance Claims</span>
                    <span className="text-sm font-medium text-yellow-600">$45</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Geographic Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Domestic (US)</span>
                    <span className="text-sm font-medium text-blue-600">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">International</span>
                    <span className="text-sm font-medium text-green-600">22%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Top Destination</span>
                    <span className="text-sm font-medium text-gray-900">California</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {brandActiveTab === 'inventory' && (
        <InventoryTab />
      )}


      {/* Messages Tab */}
      {brandActiveTab === 'messages' && (
        <div className="space-y-6">
          {/* Messages Overview Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Communication Center</h2>
                <p className="text-gray-600 mt-1">Manage all communications with factories, track issues, and monitor project status</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowChat(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  New Message
                </button>
                <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4" />
                  Export Chat History
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Messages</p>
                    <p className="text-2xl font-bold text-blue-700">{chatMessages.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active Conversations</p>
                    <p className="text-2xl font-bold text-green-700">{chatTabs.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending Responses</p>
                    <p className="text-2xl font-bold text-yellow-700">{chatMessages.filter(m => m.sender === 'Factory' && !m.read).length}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Files Shared</p>
                    <p className="text-2xl font-bold text-purple-700">{chatMessages.reduce((sum, m) => sum + m.files.length, 0)}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                    <Paperclip className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Conversations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('factory.recentConversations', 'Recent Conversations')}</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm">{t('common.viewAll', 'View All')}</button>
              </div>
              <div className="space-y-3">
                {chatTabs.slice(0, 5).map((tab) => (
                  <div 
                    key={tab.id} 
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setActiveChatTab(tab.id);
                      setShowChat(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{tab.title}</div>
                        <div className="text-sm text-gray-600">{tab.type === 'general' ? t('factory.generalDiscussion', 'General Discussion') : `PO: ${tab.po} Line: ${tab.mto}`}</div>
                      </div>
                      <div className="text-xs text-gray-500">2m ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Issues */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('factory.priorityIssues', 'Priority Issues')}</h3>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">3 Active</span>
              </div>
              <div className="space-y-3">
                <div className="border-l-4 border-red-500 pl-3 py-2">
                  <div className="font-medium text-gray-900">{t('factory.materialShortage', 'Material Shortage')} - PO124</div>
                  <div className="text-sm text-gray-600">{t('factory.patchOutOfStock', 'Patch 129559 out of stock')}</div>
                  <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
                </div>
                <div className="border-l-4 border-yellow-500 pl-3 py-2">
                  <div className="font-medium text-gray-900">{t('factory.qualityIssue', 'Quality Issue')} - PO123</div>
                  <div className="text-sm text-gray-600">{t('factory.qcPhotosReview', 'QC photos need review')}</div>
                  <div className="text-xs text-gray-500 mt-1">4 hours ago</div>
                </div>
                <div className="border-l-4 border-orange-500 pl-3 py-2">
                  <div className="font-medium text-gray-900">{t('factory.shippingDelay', 'Shipping Delay')} - PO125</div>
                  <div className="text-sm text-gray-600">{t('factory.carrierPickupDelayed', 'Carrier pickup delayed')}</div>
                  <div className="text-xs text-gray-500 mt-1">6 hours ago</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Send Status Update</div>
                    <div className="text-sm text-gray-600">Notify all factories</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Request QC Photos</div>
                    <div className="text-sm text-gray-600">For pending items</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Generate Report</div>
                    <div className="text-sm text-gray-600">Communication summary</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Escalate Issue</div>
                    <div className="text-sm text-gray-600">For urgent problems</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Messages with Enhanced Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
              <div className="flex gap-2">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>{t('common.allMessages', 'All Messages')}</option>
                  <option>{t('mto.poRelated', 'PO Related')}</option>
                  <option>{t('mto.general', 'General')}</option>
                  <option>Issues</option>
                </select>
                <input 
                  type="text" 
                  placeholder={t('forms.searchMessages', 'Search messages...')} 
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48"
                />
              </div>
            </div>
            <div className="space-y-4">
              {chatMessages.slice(0, 8).map((message) => (
                <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === 'Brand' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            message.sender === 'Brand' ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {message.sender === 'Brand' ? 'B' : 'F'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{message.sender}</span>
                          <span className="text-sm text-gray-500">{message.time}</span>
                          {message.po && (
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">PO: {message.po}</span>
                          )}
                          {message.mto && (
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Line: {message.mto}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{message.message}</p>
                      {message.files.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{message.files.length} file(s) attached</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Reply</button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm">Forward</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Defects Tab */}
      {brandActiveTab === 'defects' && (
        <div className="space-y-6">
          <DefectManagement 
            mtoData={brandPOs.flatMap(po => po.mtos || [])} 
            onOpenChat={(chatContext) => {
              setShowChat(true);
              setChatContext(chatContext);
            }}
          />
        </div>
      )}
      
      {/* Connections Tab */}
      {brandActiveTab === 'connections' && (
        <div className="space-y-6">
          {/* NetSuite Connection Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  NetSuite Connection
                </h2>
                <p className="text-gray-600 mt-1">Manage your NetSuite integration and data sync</p>
              </div>
              <button
                onClick={() => setShowNetSuiteLogin(true)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  netsuiteAuth
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {netsuiteAuth ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Connect
                  </>
                )}
              </button>
            </div>
            
            {netsuiteAuth && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Connected to NetSuite</p>
                    <p className="text-sm text-green-700">Environment: {netsuiteAuth.environment} • Version: {netsuiteAuth.apiVersion}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* ERP Sync Dashboard */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-green-600" />
                  ERP Sync Status
                </h2>
                <p className="text-gray-600 mt-1">Real-time synchronization between Factory, Brand, and NetSuite</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Live Sync Active</span>
                </div>
              </div>
            </div>
            <ERPSyncDashboard />
          </div>
        </div>
      )}

      {viewMtoDetail && <MtoDetailModal mto={viewMtoDetail.mto} po={viewMtoDetail.po} onClose={() => setViewMtoDetail(null)} />}
    </div>
  );

  // FACTORY VIEW - Organized with tabs
  const FactoryView = () => {
    const [factoryActiveTab, setFactoryActiveTab] = useState('overview');

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
                              onClick={() => setFactoryActiveTab('mto-management')}
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
                            title={t('descriptions.generateQRCode', 'Generate QR for this spot')}
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

    const ShippingTab = () => (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">{t('factory.shippingTracking', 'Shipping & Tracking')}</h2>
            <p className="text-gray-600 mt-1">{t('factory.manageShipments', 'Manage shipments and tracking information')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('factory.poLineID', 'PO / Line ID')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('factory.shipDate', 'Ship Date')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('factory.carrier', 'Carrier')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('factory.trackingNumber', 'Tracking Number')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.files', 'Files')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions', 'Actions')}</th>
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
                      <input type="text" placeholder={t('forms.enterTracking', 'Enter tracking #')} className="border rounded px-2 py-1 text-sm font-mono" />
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

    const AuditLogsTab = () => (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Audit Logs & Quality Control
                </h2>
                <p className="text-gray-600 mt-1">Track SKU to Carton mapping and identify missing product trends</p>
              </div>
              <button 
                onClick={() => setShowAuditLogs(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Search className="h-4 w-4" />
                View Full Logs
              </button>
            </div>
          </div>
          
          {/* Missing Product Alert */}
          <div className="p-6 border-b bg-red-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Missing Product Trend Alert</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-red-600">
                  {auditLogs.filter(log => log.status === 'shortage').length}
                </div>
                <div className="text-sm text-gray-600">Recent Shortages</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-red-600">12%</div>
                <div className="text-sm text-gray-600">Avg Shortage Rate</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-green-600">
                  {auditLogs.filter(log => log.status === 'ok').length}
                </div>
                <div className="text-sm text-gray-600">Successful Mappings</div>
              </div>
            </div>
          </div>
          
          {/* Master Carton Section */}
          <div className="p-6 border-b">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              Master Carton Management
            </h3>
            <div className="space-y-3">
              {masterCartonData.map((carton) => (
                <div key={carton.id} className="border rounded-lg hover:bg-gray-50">
                  <div 
                    className="p-4 cursor-pointer flex justify-between items-center"
                    onClick={() => setExpandedCarton(expandedCarton === carton.id ? null : carton.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {expandedCarton === carton.id ? 
                          <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        }
                        <div>
                          <h4 className="font-medium">{carton.id}</h4>
                          <p className="text-sm text-gray-600">SKU: {carton.sku}</p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div><strong>AWB:</strong> {carton.awb}</div>
                        <div><strong>ETA:</strong> {carton.eta}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        carton.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {carton.status}
                      </span>
                      <span className="text-sm text-gray-500">{carton.mtos.length} MTOs</span>
                    </div>
                  </div>
                  
                  {expandedCarton === carton.id && (
                    <div className="border-t bg-gray-50 p-4">
                      <h5 className="font-medium mb-3">MTO Line Breakdown:</h5>
                      <div className="space-y-2">
                        {carton.mtos.map((mto, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border">
                            <div>
                              <span className="font-medium">{mto.po} - Line {mto.lineId}</span>
                              <span className="text-sm text-gray-600 ml-2">({mto.qty}x {mto.style})</span>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              View Details
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Activity Log */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carton</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className={`hover:bg-gray-50 ${log.status === 'shortage' ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 text-sm font-mono">{log.timestamp}</td>
                    <td className="px-6 py-4 font-medium">{log.sku}</td>
                    <td className="px-6 py-4">{log.cartonId}</td>
                    <td className="px-6 py-4 text-sm">{log.action}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${log.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {log.variance}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.status === 'shortage' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {log.status === 'shortage' ? 'Shortage' : 'OK'}
                      </span>
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
              <h1 className="text-2xl font-bold text-gray-900">{t('factory.dashboardTitle', 'Factory Dashboard')}</h1>
              <p className="text-gray-600 mt-1">{t('factory.manageProduction', 'Manage production, inventory, and shipping')}</p>
            </div>
            <button 
              onClick={() => {
                setShowChat(true);
              }}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <MessageCircle className="h-4 w-4" />
              {t('factory.messages', 'Messages')}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setFactoryActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    factoryActiveTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {t('nav.overview', 'Overview')}
                  </div>
                </button>
                <button
                  onClick={() => setFactoryActiveTab('mto-management')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    factoryActiveTab === 'mto-management'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {t('nav.mtoManagement', 'MTO Management')}
                    {factoryMTOs.filter(m => m.progress < 4).length > 0 && (
                      <span className="bg-blue-100 text-blue-600 rounded-full text-xs px-2 py-1">
                        {factoryMTOs.filter(m => m.progress < 4).length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setFactoryActiveTab('shipping')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    factoryActiveTab === 'shipping'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    {t('nav.shipping', 'Shipping')}
                    {factoryMTOs.filter(m => m.progress === 3).length > 0 && (
                      <span className="bg-green-100 text-green-600 rounded-full text-xs px-2 py-1">
                        {factoryMTOs.filter(m => m.progress === 3).length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setFactoryActiveTab('inventory')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    factoryActiveTab === 'inventory'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {t('nav.inventory', 'Inventory')}
                    {inventoryData.filter(i => i.status === 'short').length > 0 && (
                      <span className="bg-red-100 text-red-600 rounded-full text-xs px-2 py-1">
                        {inventoryData.filter(i => i.status === 'short').length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setFactoryActiveTab('messages')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    factoryActiveTab === 'messages'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {t('nav.messages', 'Messages')}
                  </div>
                </button>
                <button
                  onClick={() => setFactoryActiveTab('defects')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    factoryActiveTab === 'defects'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {t('nav.defects', 'Defects')}
                    {brandPOs.flatMap(po => po.mtos || []).filter(m => m.defectTag).length > 0 && (
                      <span className="bg-red-100 text-red-600 rounded-full text-xs px-2 py-1">
                        {brandPOs.flatMap(po => po.mtos || []).filter(m => m.defectTag).length}
                      </span>
                    )}
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

      {/* Tab Content */}
      {factoryActiveTab === 'overview' && (
        <FactoryOverview mtoData={brandPOs.flatMap(po => po.mtos || [])} />
      )}

      {/* MTO Management Tab */}
      {factoryActiveTab === 'mto-management' && (
        <FactoryMTOManager mtoData={brandPOs.flatMap(po => po.mtos || [])} />
      )}

      {/* Shipping Tab */}
      {factoryActiveTab === 'shipping' && (
        <div className="space-y-6">
          <ShippingTab />
        </div>
      )}

      {/* Inventory Tab */}
      {factoryActiveTab === 'inventory' && (
        <div className="space-y-6">
          <InventoryTab />
        </div>
      )}

      {/* Messages Tab */}
      {factoryActiveTab === 'messages' && (
        <div className="space-y-6">
          {/* Factory Messages Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('factory.factoryMessages', 'Factory Messages')}</h2>
                <p className="text-gray-600 mt-1">{t('factory.communicateWithBrands', 'Communicate with brands and manage production updates')}</p>
              </div>
              <button 
                onClick={() => setShowChat(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <MessageCircle className="h-4 w-4" />
                {t('factory.newMessage', 'New Message')}
              </button>
            </div>

            {/* Message Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Messages</p>
                    <p className="text-2xl font-bold text-blue-700">{chatMessages.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending Responses</p>
                    <p className="text-2xl font-bold text-yellow-700">{chatMessages.filter(m => m.sender === 'Factory' && !m.read).length}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Files Shared</p>
                    <p className="text-2xl font-bold text-purple-700">{chatMessages.reduce((sum, m) => sum + m.files.length, 0)}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                    <Paperclip className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Conversations</h3>
                <div className="space-y-3">
                  {chatTabs.slice(0, 5).map((tab) => (
                    <div 
                      key={tab.id} 
                      className="border rounded-lg p-3 hover:bg-white cursor-pointer transition-colors"
                      onClick={() => {
                        setActiveChatTab(tab.id);
                        setShowChat(true);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{tab.title}</div>
                          <div className="text-sm text-gray-600">{tab.type === 'general' ? t('factory.generalDiscussion', 'General Discussion') : `PO: ${tab.po} Line: ${tab.mto}`}</div>
                        </div>
                        <div className="text-xs text-gray-500">2m ago</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Priority Issues</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-red-500 pl-3 py-2">
                    <div className="font-medium text-gray-900">Material Shortage - PO124</div>
                    <div className="text-sm text-gray-600">Patch 129559 out of stock</div>
                    <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3 py-2">
                    <div className="font-medium text-gray-900">Quality Issue - PO123</div>
                    <div className="text-sm text-gray-600">QC photos need review</div>
                    <div className="text-xs text-gray-500 mt-1">4 hours ago</div>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-3 py-2">
                    <div className="font-medium text-gray-900">Shipping Delay - PO125</div>
                    <div className="text-sm text-gray-600">Carrier pickup delayed</div>
                    <div className="text-xs text-gray-500 mt-1">6 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Defects Tab */}
      {factoryActiveTab === 'defects' && (
        <div className="space-y-6">
          <FactoryDefectManagement 
            mtoData={brandPOs.flatMap(po => po.mtos || [])} 
            onOpenChat={(chatContext) => {
              setShowChat(true);
              setChatContext(chatContext);
            }}
            onCreateReproductionMTO={(reproductionData) => {
              // Create reproduction MTO in the MTO management system
              console.log('Creating reproduction MTO:', reproductionData);
              // Add the reproduction MTO to the MTO management with defect tag
              const newMTO = {
                ...reproductionData,
                id: `MTO-REP-${Date.now()}`,
                status: 'pending',
                priority: 'urgent',
                defectTag: true,
                reproductionFor: reproductionData.originalDefectId
              };
              // In a real app, you would update the MTO list here
              alert(`Reproduction MTO created: ${newMTO.id}\nThis will appear in MTO Management with a DEFECT tag.`);
            }}
          />
        </div>
      )}
      
      </div>
    );
  };

  // ADMIN VIEW - Complete management features
  const AdminView = () => (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('nav.adminDashboard', 'Admin Dashboard')}</h1>
        
        {/* New Component Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => navigate('/analytics')}
            className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
          >
            <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="font-semibold text-blue-900">{t('nav.analyticsDashboard', 'Analytics Dashboard')}</div>
            <div className="text-sm text-blue-700">{t('nav.awbSpotsAnalysis', 'AWB & Spots Analysis')}</div>
          </button>
          
          <button 
            onClick={() => navigate('/defects')}
            className="p-6 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-center"
          >
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="font-semibold text-red-900">{t('nav.defectManagement', 'Defect Management')}</div>
            <div className="text-sm text-red-700">{t('nav.painPointsNetSuite', 'Pain Points & NetSuite')}</div>
          </button>
          
          <button 
            onClick={() => navigate('/sync')}
            className="p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <RefreshCw className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="font-semibold text-green-900">{t('nav.erpSync', 'ERP Sync')}</div>
            <div className="text-sm text-green-700">{t('nav.factoryBrandSync', 'Factory & Brand Sync')}</div>
          </button>
          
          <button 
            onClick={() => navigate('/factory')}
            className="p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
          >
            <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="font-semibold text-orange-900">{t('nav.factoryManager', 'Factory Manager')}</div>
            <div className="text-sm text-orange-700">{t('nav.enhancedMTOSystem', 'Enhanced MTO System')}</div>
          </button>
        </div>
        
        {/* System Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{brandPOs.length}</div>
            <div className="text-gray-600">{t('nav.activePOs', 'Active POs')}</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">8</div>
            <div className="text-gray-600">{t('nav.activeUsers', 'Active Users')}</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {inventoryData.filter(m => m.status === 'short').length}
            </div>
            <div className="text-gray-600">{t('nav.materialAlerts', 'Material Alerts')}</div>
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
                            className="bg-blue-600 h-2 rounded-full transition-all"
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
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Type message for ${currentChatTarget.title}...`}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title={t('descriptions.attachFile', 'Attach file')}
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
    { value: 'Cancelled', label: 'Cancelled', icon: <X className="h-4 w-4" /> },
    { value: 'Rush Replacement', label: 'Rush Replacement', icon: <Zap className="h-4 w-4" /> },
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
                  <option value="">{t('common.allStatus', 'All')}</option>
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
            <button onClick={() => setShow(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t('common.apply', 'Apply')}</button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced MTO Detail Modal with complete raw data
  function MtoDetailModal({ mto, po, onClose }) {
    if (!mto) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl border border-blue-200 relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600"><X className="h-5 w-5" /></button>
          <h2 className="text-xl font-bold text-blue-700 mb-4">🧵 MTO Details View - Complete Raw Data</h2>
          
          {/* Basic Info Header */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-gray-600">Unique MTO ID</span>
                <div className="font-mono font-bold text-blue-600">{mto.uniqueId || `MTO-${mto.internalId || mto.lineId}`}</div>
              </div>
              <div>
                <span className="text-xs text-gray-600">PO #</span>
                <div className="font-semibold">{po.po}</div>
              </div>
              <div>
                <span className="text-xs text-gray-600">Line ID</span>
                <div className="font-semibold">{mto.lineId || mto.poLineId}</div>
              </div>
              <div>
                <span className="text-xs text-gray-600">Internal ID</span>
                <div className="font-semibold">{mto.internalId || '37483586'}</div>
              </div>
            </div>
          </div>
          
          {/* Complete Raw Data Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700 w-1/3">Internal ID</td>
                  <td className="px-4 py-3">{mto.internalId || '37483586'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">PO Line ID</td>
                  <td className="px-4 py-3">{mto.poLineId || mto.lineId}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Expected Ship Date</td>
                  <td className="px-4 py-3">{mto.expectedShipDate || mto.eta}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Actual Ship Date</td>
                  <td className="px-4 py-3">{mto.actualShipDate || '-'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">PO Line Tracking #</td>
                  <td className="px-4 py-3">{mto.poLineTrackingNumber || '-'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">AWB</td>
                  <td className="px-4 py-3">{mto.awb || '-'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Master Carton</td>
                  <td className="px-4 py-3">{mto.masterCarton || '-'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Vendor PO Status</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mto.vendorPoStatus || mto.status)}`}>
                      {mto.vendorPoStatus || mto.status}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Order Submit Date</td>
                  <td className="px-4 py-3">{mto.orderSubmitDate || '16/07/2025'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">SO Date</td>
                  <td className="px-4 py-3">{mto.soDate || '16/07/2025'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Shopify Order Date/Time</td>
                  <td className="px-4 py-3">{mto.shopifyOrderDateTime || '07/16/25 02:15 PM'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Sales Order #</td>
                  <td className="px-4 py-3">{mto.salesOrderNumber || 'SO2508459'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">CPSD</td>
                  <td className="px-4 py-3">{mto.cpsd || '06/08/2025'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Display Name</td>
                  <td className="px-4 py-3">{mto.displayName || mto.style}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Reference #</td>
                  <td className="px-4 py-3">{mto.referenceNumber || 'md6a4z3j45we9'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Quantity</td>
                  <td className="px-4 py-3 font-semibold">{mto.quantity || mto.qty}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Bag Base PID</td>
                  <td className="px-4 py-3">{mto.bagBasePid || '133938'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">XF Date</td>
                  <td className="px-4 py-3">{mto.xfDate || '01/07/2025'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Product Type</td>
                  <td className="px-4 py-3">{mto.productType || 'Initial Tote'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Spot Breakdown Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              🎯 Spot Breakdown
            </h3>
            <div className="grid grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((spot) => {
                const spotValue = mto[`spot${spot}`] || (spot === 1 ? '129559' : spot === 2 ? '137234' : spot === 3 ? '128687' : spot === 4 ? '128698' : spot === 5 ? '128954' : '');
                const spotRef = mto[`spot${spot}PatchRef`] || (spot === 1 ? '63 - Camera Icon' : spot === 2 ? '171 - Music Notes Icon' : spot === 3 ? '17 - Spicy Margarita Icon' : spot === 4 ? '30 - Airplane Icon' : spot === 5 ? '38 - H - Classic Letter' : '');
                const iconData = getIconFromPatchRef(spotRef);
                const patchPreview = spotValue ? generatePatchPreview(spotRef, spotValue) : null;
                
                return (
                  <div key={spot} className="text-center">
                    <div className="font-bold text-blue-600 mb-2">SPOT {spot}</div>
                    <div className={`bg-white rounded-lg p-4 border-2 ${spotValue ? 'border-blue-300' : 'border-gray-300'} flex flex-col items-center`}>
                      {/* Show actual icon/patch preview */}
                      {patchPreview ? (
                        <div className="mb-3">
                          <PatchPreview 
                            patchData={patchPreview} 
                            size="xlarge" 
                          />
                        </div>
                      ) : iconData ? (
                        <div className={`w-20 h-20 mb-3 rounded-full flex items-center justify-center ${iconData.bg} ${iconData.color}`}>
                          {React.createElement(iconData.icon, { 
                            size: 32, 
                            className: 'drop-shadow-sm' 
                          })}
                        </div>
                      ) : (
                        <div className="w-20 h-20 mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl text-gray-400">{spot}</span>
                        </div>
                      )}
                      
                      <div className="font-mono text-sm mb-1">{spotValue || '—'}</div>
                      <div className="text-xs text-gray-600">{spotRef || '—'}</div>
                      {spotValue && (
                        <button
                          onClick={() => setQrSpot({ mto, spot: `spot${spot}`, value: spotValue })}
                          className="mt-2 p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700"
                          title={t('descriptions.generateQRCode', 'Generate QR')}
                        >
                          <Scan className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => setQrMto(mto)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Scan className="h-4 w-4" />
                Generate MTO QR Code
              </button>
              <button
                onClick={() => setAutoGenerateQr(mto)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Layers className="h-4 w-4" />
                Auto Generate All Spot QRs
              </button>
            </div>
          </div>
          
          {/* Production Progress */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Production Progress</h4>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${mto.progress}%` }}></div>
              </div>
              <span className="text-sm font-medium">{mto.progress}%</span>
            </div>
          </div>
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
          <img src={qrUrl} alt={t('descriptions.qrCodeAlt', 'QR Code')} className="mb-4 border rounded" />
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
          <img src={qrUrl} alt={t('descriptions.qrCodeAlt', 'QR Code')} className="mb-4 border rounded" />
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

  // CUSTOMIZATION VIEW - Next-Gen Product Builder
  const CustomizationView = () => {
    const handleCustomizeProduct = (product) => {
      setSelectedCustomizationProduct(product);
    };

    return (
      <div className="max-w-7xl mx-auto">
        <ProductCatalog onCustomize={handleCustomizeProduct} />
      </div>
    );
  };

  // Location Map Modal
  const LocationMapModal = ({ onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl border border-blue-200 relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t('common.brandSalesByLocation', 'Brand Sales by Location')}
        </h2>
        <p className="text-sm text-gray-600 mb-6">Sales data recognized by shipping zip codes and product categories</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 h-80 flex items-center justify-center">
            <div className="text-center text-gray-700">
              <Globe className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <p className="text-lg font-medium mb-2">Sales Distribution Map</p>
              <p className="text-sm text-gray-600 mb-2">Interactive visualization showing:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Regional sales performance by zip codes</p>
                <p>• Top-selling products per location</p>
                <p>• Growth trends and demographics</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Sales Regions Overview</h3>
              <div className="text-sm text-gray-500">
                Total: ${brandSalesLocationData.reduce((sum, region) => sum + region.totalSales, 0).toLocaleString()}
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-3">
              {brandSalesLocationData.map((region) => (
                <div key={region.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-lg">{region.region}</h4>
                      <p className="text-sm text-gray-600">{region.city}, {region.state}</p>
                      <p className="text-xs text-gray-500">Zip Codes: {region.zipCodes.join(', ')}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {region.growth > 0 ? `+${region.growth}%` : `${region.growth}%`}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-bold text-blue-600">${region.totalSales.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Total Sales</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-600">{region.totalOrders}</div>
                      <div className="text-xs text-gray-600">Orders</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-bold text-purple-600">${Math.round(region.totalSales / region.totalOrders)}</div>
                      <div className="text-xs text-gray-600">Avg Order</div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2 font-medium">Top Products:</p>
                    <div className="space-y-1">
                      {region.topProducts.slice(0, 3).map((product, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-gray-700 truncate">{product.name}</span>
                          <div className="flex gap-2 text-gray-500 ml-2">
                            <span>${product.revenue.toLocaleString()}</span>
                            <span>({product.orders} orders)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Demographics:</span>
                      <span className="text-gray-700">
                        {region.demographics.age} • {region.demographics.income} • {region.demographics.interests.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Sales Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {brandSalesLocationData.reduce((sum, region) => sum + region.totalOrders, 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {Math.round(brandSalesLocationData.reduce((sum, region) => sum + region.growth, 0) / brandSalesLocationData.length)}%
              </div>
              <div className="text-gray-600">Avg Growth</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {brandSalesLocationData.length}
              </div>
              <div className="text-gray-600">Active Regions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Product Detail Modal
  const ProductDetailModal = ({ product, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg border border-blue-200 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600">
          <X className="h-5 w-5" />
        </button>
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{product.icon}</div>
          <h2 className="text-xl font-bold text-blue-700">{product.name}</h2>
          <p className="text-gray-600">{product.type}</p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{product.orderVolume}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-2xl font-bold text-yellow-600">{product.rating}</span>
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Delay Frequency</span>
              <span className={`font-medium ${product.delayFreq > 10 ? 'text-red-600' : 'text-green-600'}`}>
                {product.delayFreq}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${product.delayFreq > 10 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${product.delayFreq}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Performance Trend</h4>
            <div className={`flex items-center gap-2 ${
              product.trend === 'up' ? 'text-green-600' :
              product.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {product.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
               product.trend === 'down' ? <AlertTriangle className="h-4 w-4" /> :
               <BarChart3 className="h-4 w-4" />}
              <span className="capitalize font-medium">{product.trend}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Audit Logs Modal
  const AuditLogsModal = ({ onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl border border-blue-200 relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Audit Logs - SKU to Carton Mapping
        </h2>
        
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">Missing Product Alert</span>
          </div>
          <p className="text-sm text-yellow-700">
            Detected {auditLogs.filter(log => log.status === 'shortage').length} instances of 10-15% missing products in recent shipments
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carton ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className={`hover:bg-gray-50 ${log.status === 'shortage' ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-4 text-sm font-mono">{log.timestamp}</td>
                  <td className="px-4 py-4 font-medium">{log.sku}</td>
                  <td className="px-4 py-4">{log.cartonId}</td>
                  <td className="px-4 py-4 text-sm">{log.action}</td>
                  <td className="px-4 py-4">{log.expectedQty}</td>
                  <td className="px-4 py-4">{log.actualQty}</td>
                  <td className="px-4 py-4">
                    <span className={`font-medium ${log.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {log.variance}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'shortage' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {log.status === 'shortage' ? 'Shortage' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Next-Gen Customization Modal (2D/3D Product Builder)
  const CustomizationModal = ({ onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl border border-blue-200 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Next-Gen Product Customization Builder
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-lg p-8 h-96 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <Box className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">3D Product Preview</h3>
                <p className="text-sm">Interactive 3D model would be rendered here</p>
                <p className="text-xs text-gray-500 mt-2">Real-time customization preview with spot placement</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                3D View
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
                <Minimize2 className="h-4 w-4" />
                2D View
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Product Selection</h3>
              <div className="grid grid-cols-2 gap-2">
                {bestProducts.map((product) => (
                  <div key={product.sku} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <div className="text-center">
                      <div className="text-xl mb-1">{product.icon}</div>
                      <div className="text-xs font-medium">{product.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Customization Spots</h3>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((spot) => (
                  <div key={spot} className="flex items-center gap-3 p-2 border rounded">
                    <span className="text-sm font-medium w-12">Spot {spot}</span>
                    <select className="flex-1 border rounded px-2 py-1 text-sm">
                      <option value="">Select Icon</option>
                      <option value="129559">Camera Icon</option>
                      <option value="137234">Music Notes Icon</option>
                      <option value="128687">Spicy Margarita Icon</option>
                      <option value="128698">Airplane Icon</option>
                      <option value="128954">Letter Icon</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                Submit to Factory
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Save Design
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Customization Gallery Modal - Shows all available icons and patches
  const CustomizationGalleryModal = ({ onClose }) => {
    const categories = [...new Set(Object.values(CUSTOMIZATION_ICONS).map(icon => icon.category))];
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const filteredIcons = selectedCategory === 'All' 
      ? Object.entries(CUSTOMIZATION_ICONS)
      : Object.entries(CUSTOMIZATION_ICONS).filter(([name, data]) => data.category === selectedCategory);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] border relative flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Customization Gallery</h2>
                <p className="text-sm text-gray-600">Browse all available patch icons and designs</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Category Filter Bar */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 mr-2">Categories:</span>
              {['All', ...categories].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                  }`}
                >
                  {category}
                  <span className="ml-1 text-xs opacity-75">
                    ({category === 'All' 
                      ? Object.keys(CUSTOMIZATION_ICONS).length 
                      : Object.values(CUSTOMIZATION_ICONS).filter(icon => icon.category === category).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Icons Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredIcons.map(([iconName, iconData]) => (
                <div 
                  key={iconName}
                  className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  {/* Icon Display */}
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center ${iconData.bg} ${iconData.color} shadow-sm group-hover:shadow-md transition-shadow`}>
                    {React.createElement(iconData.icon, { 
                      size: 24,
                      className: 'drop-shadow-sm'
                    })}
                  </div>
                  
                  {/* Icon Details */}
                  <div className="text-center">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                      {iconName}
                    </h3>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${iconData.bg} ${iconData.color}`}>
                        {iconData.category}
                      </span>
                    </div>
                    
                    {/* Example Usage */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Example SKU: <span className="font-mono text-blue-600">#{Math.floor(Math.random() * 900000) + 100000}</span></div>
                      <div>Usage: <span className="text-green-600">Active</span></div>
                    </div>
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button className="px-2 py-1 bg-white shadow-sm rounded text-xs font-medium text-gray-700 hover:bg-gray-50">
                        Preview
                      </button>
                      <button className="px-2 py-1 bg-blue-500 text-white shadow-sm rounded text-xs font-medium hover:bg-blue-600">
                        Use
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty State */}
            {filteredIcons.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No icons found</h3>
                <p className="text-gray-500">Try selecting a different category to see more options.</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {filteredIcons.length} of {Object.keys(CUSTOMIZATION_ICONS).length} customization options
              </div>
              <div className="flex items-center gap-4">
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Request Custom Icon
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  {t('common.applyToMTO', 'Apply to MTO')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Advanced Search Modal
  const AdvancedSearchModal = ({ onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl border border-blue-200 relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Search
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PO #</label>
            <input 
              type="text"
              value={searchFilters.po}
              onChange={(e) => setSearchFilters(f => ({ ...f, po: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('forms.enterPONumber', 'Enter PO number')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input 
              type="text"
              value={searchFilters.sku}
              onChange={(e) => setSearchFilters(f => ({ ...f, sku: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('forms.enterSKU', 'Enter SKU')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input 
              type="text"
              value={searchFilters.brand}
              onChange={(e) => setSearchFilters(f => ({ ...f, brand: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('forms.enterBrandName', 'Enter brand name')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Factory</label>
            <select 
              value={searchFilters.factory}
              onChange={(e) => setSearchFilters(f => ({ ...f, factory: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('common.allFactories', 'All Factories')}</option>
              <option value="GZ Totes">GZ Totes</option>
              <option value="EcoManufacturing Inc">EcoManufacturing Inc</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">XF Date</label>
            <input 
              type="date"
              value={searchFilters.xfDate}
              onChange={(e) => setSearchFilters(f => ({ ...f, xfDate: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AWB #</label>
            <input 
              type="text"
              value={searchFilters.awb}
              onChange={(e) => setSearchFilters(f => ({ ...f, awb: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('forms.enterAWBNumber', 'Enter AWB number')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              value={searchFilters.status}
              onChange={(e) => setSearchFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('common.allStatuses', 'All Statuses')}</option>
              {allStatusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
            <select 
              value={searchFilters.productType}
              onChange={(e) => setSearchFilters(f => ({ ...f, productType: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('common.allProducts', 'All Products')}</option>
              <option value="Initial Tote">{t('products.initialTote', 'Initial Tote')}</option>
              <option value="Icon Tote">{t('products.iconTote', 'Icon Tote')}</option>
              <option value="Blanket">{t('products.blanket', 'Blanket')}</option>
              <option value="Tote Bag">{t('products.toteBag', 'Tote Bag')}</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={() => {
              setSearchFilters({
                po: '', sku: '', brand: '', factory: '', xfDate: '', awb: '', status: '', productType: ''
              });
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('common.clearAll', 'Clear All')}
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('common.applySearch', 'Apply Search')}
          </button>
        </div>
      </div>
    </div>
  );



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
                  {t('nav.brand', 'Brand Dashboard')}
                </button>
                <button
                  onClick={() => setCurrentView('factory')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    currentView === 'factory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('nav.factory', 'Factory Dashboard')}
                </button>
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    currentView === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('nav.admin', 'Admin Panel')}
                </button>
                <button
                  onClick={() => setCurrentView('customization')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    currentView === 'customization' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('nav.customization', 'Customization')}
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
                      <h3 className="font-semibold">{t('common.notifications', 'Notifications')}</h3>
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
              <LanguageToggle compact={true} />
              <div className="flex items-center gap-4">
                {currentView === 'brand' && (
                  <button
                    onClick={() => setShowNetSuiteLogin(true)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      netsuiteAuth 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <Database className="h-4 w-4" />
                    {netsuiteAuth ? t('common.netSuiteConnected', 'NetSuite Connected') : t('common.connectToNetSuite', 'Connect to NetSuite')}
                  </button>
                )}
                <div className="text-sm text-gray-600">
                  {currentView === 'brand' ? 'Alice Chen (BaubleBar)' : 
                   currentView === 'factory' ? 'John Kim (GZ Totes)' : t('common.systemAdmin', 'System Admin')}
                </div>
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
        {currentView === 'customization' && <CustomizationView />}
      </div>

      {/* Chat Overlay */}
      {showChat && <ChatOverlay />}
      {qrMto && <QrModal mto={qrMto} onClose={() => setQrMto(null)} />}
      {qrSpot && <QrSpotModal mto={qrSpot.mto} spot={qrSpot.spot} value={qrSpot.value} onClose={() => setQrSpot(null)} />}
      {autoGenerateQr && <AutoGenerateQrModal mto={autoGenerateQr} onClose={() => setAutoGenerateQr(null)} />}
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {showAuditLogs && <AuditLogsModal onClose={() => setShowAuditLogs(false)} />}
      {showAdvancedSearch && <AdvancedSearchModal onClose={() => setShowAdvancedSearch(false)} />}
      {showCustomizationGallery && <CustomizationGalleryModal onClose={() => setShowCustomizationGallery(false)} />}
      {showNetSuiteLogin && (
        <NetSuiteLogin 
          onLogin={(authData) => {
            setNetsuiteAuth(authData);
            setShowNetSuiteLogin(false);
            console.log('NetSuite authenticated:', authData);
          }}
          onClose={() => setShowNetSuiteLogin(false)}
        />
      )}
      {selectedCustomizationProduct && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="h-full w-full">
            <CustomizationRouter 
              initialProduct={selectedCustomizationProduct} 
              onClose={() => setSelectedCustomizationProduct(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<BaubleBarDemo />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/customize" element={<CustomizationRouter />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/defects" element={<DefectManagement />} />
          <Route path="/sync" element={<ERPSyncDashboard />} />
          <Route path="/factory" element={<FactoryMTOManager />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;