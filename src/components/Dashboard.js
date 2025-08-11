import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MessageCircle, Bell, Package, Truck, CheckCircle2, AlertTriangle, Paperclip, Edit, Building2, FileText, Download, X, ChevronDown, ChevronRight, BarChart3, Clock, Play, Filter, Calendar, TrendingUp, MapPin, Layers, Star, Palette, Box, Search, Zap, Award, Target, Globe, Scan, PieChart, Activity, Camera, Music, Coffee, Plane, Flower, Heart, Sparkles, Baby, Cat, Dog, Home, Car, Utensils, Palette as PaletteIcon, Trophy, Gift, Sun, Moon, CloudRain, Zap as Lightning, Anchor, Mountain, Leaf, Diamond, Crown, Flame, Snowflake, Feather, Circle, Bug, Fish, Bird, TreePine, Apple, Pizza, IceCream, Cake, Cookie } from 'lucide-react';

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
      backgroundColor: iconData.bg,
      color: iconData.color,
      shape: 'circle', // or 'square', 'hexagon'
      size: 'medium' // or 'small', 'large'
    }
  };
};

// Patch Preview Component
const PatchPreview = ({ patchRef, sku, size = 'md' }) => {
  const patchData = generatePatchPreview(patchRef, sku);
  
  if (!patchData) return null;
  
  const { iconData, iconName } = patchData;
  const IconComponent = iconData.icon;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} ${iconData.bg} ${iconData.color} rounded-full flex items-center justify-center border-2 border-white shadow-sm`}
      title={iconName}
    >
      <IconComponent className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-5 h-5' : 'w-7 h-7'} />
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('brand');
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedPOs, setExpandedPOs] = useState(new Set());
  const [activeChatTab, setActiveChatTab] = useState('general');
  const [chatTabs, setChatTabs] = useState([
    { id: 'general', title: 'General', type: 'general', po: '', mto: '' }
  ]);
  const [viewMtoDetail, setViewMtoDetail] = useState(null);
  const fileInputRef = useRef(null);

  // Sample data structure mimicking real Peak Order MTO system
  const [allMTOs] = useState([
    {
      id: 'MTO-001',
      poNumber: 'PO-2024-001',
      customer: 'BaubleBar Inc.',
      product: 'Custom Initial Bracelet - Gold',
      sku: 'BB-001-G',
      customizations: {
        text: 'SARAH',
        color: 'Gold',
        gems: ['Diamond', 'Pearl'],
        patchRef: '63 - Camera Icon'
      },
      quantity: 50,
      unitPrice: 48.00,
      totalValue: 2400.00,
      status: 'In Production',
      priority: 'High',
      dueDate: '2024-02-15',
      createdDate: '2024-01-15',
      estimatedCompletion: '2024-02-10',
      assignedTo: 'Production Team A',
      notes: 'Rush order for Valentine\'s Day collection',
      attachments: ['design_specs.pdf', 'reference_image.jpg'],
      timeline: [
        { status: 'Order Received', date: '2024-01-15', completed: true },
        { status: 'Design Approved', date: '2024-01-18', completed: true },
        { status: 'Materials Sourced', date: '2024-01-22', completed: true },
        { status: 'Production Started', date: '2024-01-25', completed: true },
        { status: 'Quality Check', date: '2024-02-08', completed: false },
        { status: 'Packaging', date: '2024-02-12', completed: false },
        { status: 'Shipping', date: '2024-02-15', completed: false }
      ]
    },
    // ... more MTO data
  ]);

  // Rest of the original BaubleBarDemo component logic...
  // (I'll include the essential parts to keep it functional)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Peak Order MTO</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setCurrentView('brand')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'brand'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Brand Dashboard
              </button>
              <button
                onClick={() => setCurrentView('orders')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'orders'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'analytics'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                className="p-2 text-gray-400 hover:text-gray-500"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-6 w-6" />
              </button>
              <button 
                className="p-2 text-gray-400 hover:text-gray-500"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentView === 'brand' && (
          <div className="px-4 py-6 sm:px-0">
            {/* Customization Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Palette className="h-8 w-8 text-purple-200" />
                    Premium 3D Jewelry Studio
                  </h1>
                  <p className="text-purple-100 mt-2 text-lg">
                    Design and customize jewelry with real-time 3D preview and professional materials
                  </p>
                  <div className="flex gap-4 mt-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">Ultra HD Rendering</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">Real-time Materials</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">Professional Lighting</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Diamond className="h-6 w-6" />
                  Launch 3D Studio
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Premium Materials</h3>
                </div>
                <p className="text-gray-600">18K Gold, Sterling Silver, genuine gemstones with realistic PBR materials</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Camera className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="font-semibold">Studio Photography</h3>
                </div>
                <p className="text-gray-600">Professional lighting setups and camera angles for perfect product shots</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Real-time Rendering</h3>
                </div>
                <p className="text-gray-600">Instant preview of customizations with high-quality 3D rendering</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;