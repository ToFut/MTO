import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPalette, FaGem, FaFont, FaCamera, FaDownload, FaShare, 
  FaUndo, FaRedo, FaSave, FaEye, FaMagic, FaCrown, FaHeart,
  FaShoppingCart, FaChevronDown, FaChevronRight, FaStar,
  FaCoffee, FaPlane, FaCat, FaDog, FaTree, FaPizzaSlice,
  FaAppleAlt, FaSun, FaMoon, FaMountain, FaAnchor, FaGift,
  FaBolt, FaFire, FaSnowflake, FaMusic, FaHome, FaFish,
  FaFeather, FaBaby, FaIceCream, FaCookie
} from 'react-icons/fa';

const IconCustomizationPanel = ({ config, updateConfig, onCameraPreset, onScreenshot, productType = 'bracelet' }) => {
  const [activeSection, setActiveSection] = useState('product');
  const [expandedSpot, setExpandedSpot] = useState(null);

  const sections = {
    product: { icon: FaGem, title: 'Product Type', color: 'purple' },
    spots: { icon: FaStar, title: 'Icon Spots (6)', color: 'pink' },
    colors: { icon: FaPalette, title: 'Colors & Materials', color: 'blue' },
    text: { icon: FaFont, title: 'Custom Text', color: 'green' },
    camera: { icon: FaCamera, title: 'View & Export', color: 'orange' }
  };

  // Available icons for customization
  const availableIcons = [
    { id: 'Camera', icon: FaCamera, name: 'Camera', category: 'Tech' },
    { id: 'Music', icon: FaMusic, name: 'Music', category: 'Entertainment' },
    { id: 'Coffee', icon: FaCoffee, name: 'Coffee', category: 'Food' },
    { id: 'Plane', icon: FaPlane, name: 'Travel', category: 'Travel' },
    { id: 'Flower', icon: FaGem, name: 'Flower', category: 'Nature' },
    { id: 'Heart', icon: FaHeart, name: 'Heart', category: 'Love' },
    { id: 'Star', icon: FaStar, name: 'Star', category: 'Special' },
    { id: 'Crown', icon: FaCrown, name: 'Crown', category: 'Luxury' },
    { id: 'Diamond', icon: FaGem, name: 'Diamond', category: 'Luxury' },
    { id: 'Sun', icon: FaSun, name: 'Sun', category: 'Weather' },
    { id: 'Moon', icon: FaMoon, name: 'Moon', category: 'Weather' },
    { id: 'Mountain', icon: FaMountain, name: 'Mountain', category: 'Nature' },
    { id: 'Cat', icon: FaCat, name: 'Cat', category: 'Animals' },
    { id: 'Dog', icon: FaDog, name: 'Dog', category: 'Animals' },
    { id: 'Bird', icon: FaFeather, name: 'Bird', category: 'Animals' },
    { id: 'Fish', icon: FaFish, name: 'Fish', category: 'Animals' },
    { id: 'Home', icon: FaHome, name: 'Home', category: 'Lifestyle' },
    { id: 'Anchor', icon: FaAnchor, name: 'Anchor', category: 'Ocean' },
    { id: 'Gift', icon: FaGift, name: 'Gift', category: 'Special' },
    { id: 'Lightning', icon: FaBolt, name: 'Lightning', category: 'Energy' },
    { id: 'Flame', icon: FaFire, name: 'Flame', category: 'Fire' },
    { id: 'Snowflake', icon: FaSnowflake, name: 'Snowflake', category: 'Weather' },
    { id: 'TreePine', icon: FaTree, name: 'Tree', category: 'Nature' },
    { id: 'Pizza', icon: FaPizzaSlice, name: 'Pizza', category: 'Food' },
    { id: 'Apple', icon: FaAppleAlt, name: 'Apple', category: 'Food' },
    { id: 'Baby', icon: FaBaby, name: 'Baby', category: 'Family' }
  ];

  // Product types
  const productTypes = [
    { id: 'bracelet', name: 'Custom Bracelet', icon: FaGem },
    { id: 'tote', name: 'Icon Tote Bag', icon: FaShoppingCart },
    { id: 'initialsTote', name: 'Initials Tote', icon: FaFont },
    { id: 'blanket', name: 'Custom Blanket', icon: FaHome }
  ];

  // Color options
  const colorOptions = {
    bracelet: {
      metals: [
        { id: 'gold', name: 'Gold', color: '#FFD700' },
        { id: 'silver', name: 'Silver', color: '#C0C0C0' },
        { id: 'rosegold', name: 'Rose Gold', color: '#E8B4B8' }
      ],
      gems: [
        { id: 'diamond', name: 'Diamond', color: '#FFFFFF' },
        { id: 'emerald', name: 'Emerald', color: '#50C878' },
        { id: 'ruby', name: 'Ruby', color: '#E0115F' },
        { id: 'sapphire', name: 'Sapphire', color: '#0F52BA' }
      ]
    },
    tote: {
      bagColors: [
        { id: 'natural', name: 'Natural Canvas', color: '#F5F5DC' },
        { id: 'black', name: 'Black', color: '#000000' },
        { id: 'navy', name: 'Navy', color: '#000080' },
        { id: 'burgundy', name: 'Burgundy', color: '#800020' }
      ],
      handleColors: [
        { id: 'brown', name: 'Brown Leather', color: '#8B4513' },
        { id: 'black', name: 'Black Leather', color: '#000000' },
        { id: 'tan', name: 'Tan', color: '#D2691E' }
      ]
    },
    initialsTote: {
      bagColors: [
        { id: 'black', name: 'Black', color: '#000000' },
        { id: 'navy', name: 'Navy', color: '#000080' },
        { id: 'gray', name: 'Charcoal', color: '#36454F' },
        { id: 'cream', name: 'Cream', color: '#F5F5DC' }
      ],
      handleColors: [
        { id: 'cognac', name: 'Cognac Leather', color: '#4A2C17' },
        { id: 'black', name: 'Black Leather', color: '#000000' },
        { id: 'brown', name: 'Dark Brown', color: '#654321' }
      ]
    },
    blanket: {
      blanketColors: [
        { id: 'cream', name: 'Cream', color: '#F5F5DC' },
        { id: 'gray', name: 'Gray', color: '#808080' },
        { id: 'navy', name: 'Navy', color: '#000080' },
        { id: 'burgundy', name: 'Burgundy', color: '#800020' }
      ],
      patterns: [
        { id: 'solid', name: 'Solid' },
        { id: 'stripes', name: 'Stripes' },
        { id: 'plaid', name: 'Plaid' }
      ]
    }
  };

  const calculatePrice = () => {
    let basePrice = 
      productType === 'bracelet' ? 48 : 
      productType === 'tote' ? 65 : 
      productType === 'initialsTote' ? 75 :
      productType === 'blanket' ? 120 : 58;
    let spotsPrice = 0;
    
    // Add price for each active spot
    for (let i = 1; i <= 6; i++) {
      if (config[`spot${i}`]?.enabled) {
        spotsPrice += 5; // $5 per icon spot
      }
    }
    
    const textPrice = config.mainText ? 10 : 0;
    const fringePrice = (config.hasFringe && config.productType === 'blanket') ? 15 : 0;
    return basePrice + spotsPrice + textPrice + fringePrice;
  };

  const updateSpot = (spotNumber, updates) => {
    updateConfig({
      [`spot${spotNumber}`]: {
        ...config[`spot${spotNumber}`],
        ...updates
      }
    });
  };

  const SectionHeader = ({ sectionId, section }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveSection(activeSection === sectionId ? null : sectionId)}
      className={`w-full p-4 rounded-xl border-2 transition-all ${
        activeSection === sectionId 
          ? `border-${section.color}-500 bg-${section.color}-50` 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <section.icon className={`text-${section.color}-600`} />
          <span className="font-semibold">{section.title}</span>
        </div>
        {activeSection === sectionId ? <FaChevronDown /> : <FaChevronRight />}
      </div>
    </motion.button>
  );

  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Design Studio Pro</h2>
        <p className="text-purple-100">Create your unique customized product</p>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg text-sm"
          >
            <FaSave />
            Save Design
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onScreenshot}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg text-sm"
          >
            <FaCamera />
            Screenshot
          </motion.button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Product Type Section */}
        <SectionHeader sectionId="product" section={sections.product} />
        <AnimatePresence>
          {activeSection === 'product' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {productTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateConfig({ productType: type.id })}
                  className={`w-full p-4 border-2 rounded-xl transition-all flex items-center gap-3 ${
                    config.productType === type.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <type.icon className="text-xl text-purple-600" />
                  <span className="font-semibold">{type.name}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon Spots Section - Only for regular tote */}
        {config.productType === 'tote' && (
          <>
            <SectionHeader sectionId="spots" section={sections.spots} />
            <AnimatePresence>
              {activeSection === 'spots' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* 6 Spot Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((spotNumber) => {
                  const spot = config[`spot${spotNumber}`] || {};
                  const isExpanded = expandedSpot === spotNumber;
                  
                  return (
                    <motion.div
                      key={spotNumber}
                      className={`border-2 rounded-xl p-4 transition-all ${
                        spot.enabled ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Spot {spotNumber}</h4>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={spot.enabled || false}
                            onChange={(e) => updateSpot(spotNumber, { enabled: e.target.checked })}
                            className="w-4 h-4 text-pink-600 rounded"
                          />
                          <span className="text-sm">Enable</span>
                        </label>
                      </div>
                      
                      {spot.enabled && (
                        <>
                          <button
                            onClick={() => setExpandedSpot(isExpanded ? null : spotNumber)}
                            className="w-full p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between mb-2"
                          >
                            {spot.icon ? (
                              <div className="flex items-center gap-2">
                                {React.createElement(
                                  availableIcons.find(i => i.id === spot.icon)?.icon || FaStar,
                                  { className: 'text-pink-600' }
                                )}
                                <span className="text-sm">{spot.icon}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Select Icon</span>
                            )}
                            <FaChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-3 gap-2 p-2 bg-white rounded-lg max-h-48 overflow-y-auto">
                                {availableIcons.map((icon) => (
                                  <button
                                    key={icon.id}
                                    onClick={() => {
                                      updateSpot(spotNumber, { icon: icon.id });
                                      setExpandedSpot(null);
                                    }}
                                    className="p-2 rounded hover:bg-pink-100 transition-colors flex flex-col items-center gap-1"
                                  >
                                    <icon.icon className="text-lg" />
                                    <span className="text-xs">{icon.name}</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Spot label */}
                          <input
                            type="text"
                            value={spot.label || ''}
                            onChange={(e) => updateSpot(spotNumber, { label: e.target.value })}
                            placeholder="Label (optional)"
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm mt-2"
                            maxLength={10}
                          />
                          
                          {/* Color picker */}
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="color"
                              value={spot.color || '#000000'}
                              onChange={(e) => updateSpot(spotNumber, { color: e.target.value })}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">Icon color</span>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="text-sm text-pink-700">
                  💡 Each icon spot adds $5 to the base price. Customize up to 6 spots!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}

        {/* Colors Section */}
        <SectionHeader sectionId="colors" section={sections.colors} />
        <AnimatePresence>
          {activeSection === 'colors' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {config.productType === 'bracelet' ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Metal Type</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.bracelet.metals.map((metal) => (
                        <button
                          key={metal.id}
                          onClick={() => updateConfig({ material: metal.id })}
                          className={`p-3 border-2 rounded-lg transition-all transform hover:scale-105 ${
                            config.material === metal.id
                              ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div 
                            className="w-full h-8 rounded mb-2"
                            style={{ backgroundColor: metal.color }}
                          />
                          <span className="text-xs">{metal.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Gem Type</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.bracelet.gems.map((gem) => (
                        <button
                          key={gem.id}
                          onClick={() => updateConfig({ gemTypes: [gem.id, gem.id, gem.id, gem.id] })}
                          className={`p-3 border-2 rounded-lg transition-all flex items-center gap-3 ${
                            config.gemTypes?.[0] === gem.id
                              ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: gem.color }}
                          />
                          <span className="text-sm">{gem.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : config.productType === 'tote' ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Bag Color</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.tote.bagColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => updateConfig({ bagColor: color.color })}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            config.bagColor === color.color
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className="w-full h-8 rounded mb-2"
                            style={{ backgroundColor: color.color }}
                          />
                          <span className="text-xs">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Handle Color</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.tote.handleColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => updateConfig({ handleColor: color.color })}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            config.handleColor === color.color
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className="w-full h-6 rounded mb-1"
                            style={{ backgroundColor: color.color }}
                          />
                          <span className="text-xs">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : config.productType === 'initialsTote' ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Bag Color</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.initialsTote.bagColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => updateConfig({ bagColor: color.color })}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            config.bagColor === color.color
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className="w-full h-8 rounded mb-2"
                            style={{ backgroundColor: color.color }}
                          />
                          <span className="text-xs">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Handle Color</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.initialsTote.handleColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => updateConfig({ handleColor: color.color })}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            config.handleColor === color.color
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className="w-full h-6 rounded mb-1"
                            style={{ backgroundColor: color.color }}
                          />
                          <span className="text-xs">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Initials Color</h4>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.initialsColor || '#FFFFFF'}
                        onChange={(e) => updateConfig({ initialsColor: e.target.value })}
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <span className="text-sm">Choose color for your initials</span>
                    </div>
                  </div>
                </>
              ) : config.productType === 'blanket' ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Blanket Color</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.blanket.blanketColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => updateConfig({ blanketColor: color.color })}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            config.blanketColor === color.color
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className="w-full h-8 rounded mb-2"
                            style={{ backgroundColor: color.color }}
                          />
                          <span className="text-xs">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Pattern</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.blanket.patterns.map((pattern) => (
                        <button
                          key={pattern.id}
                          onClick={() => updateConfig({ pattern: pattern.id })}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            config.pattern === pattern.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm">{pattern.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {(config.pattern === 'stripes' || config.pattern === 'plaid') && (
                    <div>
                      <h4 className="font-semibold mb-2">Pattern Color</h4>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={config.patternColor || '#8B4513'}
                          onChange={(e) => updateConfig({ patternColor: e.target.value })}
                          className="w-16 h-10 rounded cursor-pointer"
                        />
                        <span className="text-sm">Choose pattern color</span>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Section */}
        <SectionHeader sectionId="text" section={sections.text} />
        <AnimatePresence>
          {activeSection === 'text' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Main Text (+$10)
                </label>
                <input
                  type="text"
                  value={config.mainText || ''}
                  onChange={(e) => updateConfig({ mainText: e.target.value.toUpperCase() })}
                  maxLength={20}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                  placeholder="Enter custom text"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {20 - (config.mainText?.length || 0)} characters remaining
                </div>
              </div>
              
              {config.productType === 'bracelet' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Charm Text
                  </label>
                  <input
                    type="text"
                    value={config.text || ''}
                    onChange={(e) => updateConfig({ text: e.target.value.toUpperCase() })}
                    maxLength={8}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    placeholder="8 characters max"
                  />
                </div>
              )}
              
              {config.productType === 'initialsTote' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Initials (1-3 letters)
                    </label>
                    <input
                      type="text"
                      value={config.initials || ''}
                      onChange={(e) => updateConfig({ initials: e.target.value.toUpperCase() })}
                      maxLength={3}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-center text-2xl"
                      placeholder="ABC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name (optional)
                    </label>
                    <input
                      type="text"
                      value={config.fullName || ''}
                      onChange={(e) => updateConfig({ fullName: e.target.value })}
                      maxLength={30}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.showMonogramCircle || false}
                      onChange={(e) => updateConfig({ showMonogramCircle: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm font-medium">Add monogram circle</span>
                  </label>
                </>
              )}
              
              {config.productType === 'blanket' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Center Design
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => updateConfig({ centerDesign: 'monogram' })}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          config.centerDesign === 'monogram'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        Monogram
                      </button>
                      <button
                        onClick={() => updateConfig({ centerDesign: 'text' })}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          config.centerDesign === 'text'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        Custom Text
                      </button>
                    </div>
                  </div>
                  
                  {config.centerDesign === 'monogram' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Monogram (1-3 letters)
                      </label>
                      <input
                        type="text"
                        value={config.monogram || ''}
                        onChange={(e) => updateConfig({ monogram: e.target.value.toUpperCase() })}
                        maxLength={3}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-center text-2xl"
                        placeholder="ABC"
                      />
                    </div>
                  )}
                  
                  {config.centerDesign === 'text' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Custom Text
                      </label>
                      <input
                        type="text"
                        value={config.customText || ''}
                        onChange={(e) => updateConfig({ customText: e.target.value })}
                        maxLength={40}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                        placeholder="Home Sweet Home"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Corner Text
                    </label>
                    <input
                      type="text"
                      value={config.cornerText || ''}
                      onChange={(e) => updateConfig({ cornerText: e.target.value })}
                      maxLength={20}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      placeholder="Est. 2024"
                    />
                  </div>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.hasFringe || false}
                      onChange={(e) => updateConfig({ hasFringe: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm font-medium">Add fringe edges (+$15)</span>
                  </label>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera Section */}
        <SectionHeader sectionId="camera" section={sections.camera} />
        <AnimatePresence>
          {activeSection === 'camera' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3">
                {['hero', 'detail', 'front', 'side'].map((preset) => (
                  <motion.button
                    key={preset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCameraPreset(preset)}
                    className="p-3 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all"
                  >
                    <FaCamera className="text-orange-600 mb-1" />
                    <div className="text-sm font-medium capitalize">{preset} View</div>
                  </motion.button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.autoRotate}
                    onChange={(e) => updateConfig({ autoRotate: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span className="text-sm font-medium">Auto-rotate</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price Summary */}
        <div className="border-t pt-6 space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-gray-800">Total Price</span>
              <span className="text-2xl font-bold text-purple-600">
                ${calculatePrice()}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Base Price ({config.productType})</span>
                <span>${config.productType === 'bracelet' ? 48 : config.productType === 'tote' ? 65 : config.productType === 'initialsTote' ? 75 : config.productType === 'blanket' ? 120 : 58}</span>
              </div>
              {Object.keys(config).filter(k => k.startsWith('spot') && config[k]?.enabled).length > 0 && (
                <div className="flex justify-between">
                  <span>Icon Spots ({Object.keys(config).filter(k => k.startsWith('spot') && config[k]?.enabled).length}x)</span>
                  <span>+${Object.keys(config).filter(k => k.startsWith('spot') && config[k]?.enabled).length * 5}</span>
                </div>
              )}
              {config.mainText && (
                <div className="flex justify-between">
                  <span>Custom Text</span>
                  <span>+$10</span>
                </div>
              )}
              {config.hasFringe && config.productType === 'blanket' && (
                <div className="flex justify-between">
                  <span>Fringe Edges</span>
                  <span>+$15</span>
                </div>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
          >
            <FaShoppingCart />
            Add to Cart - ${calculatePrice()}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default IconCustomizationPanel;