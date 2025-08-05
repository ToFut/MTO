import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPalette, FaGem, FaFont, FaCamera, FaDownload, FaShare, 
  FaUndo, FaRedo, FaSave, FaEye, FaMagic, FaCrown, FaHeart,
  FaShoppingCart, FaChevronDown, FaChevronRight, FaStar
} from 'react-icons/fa';

const CustomizationPanel = ({ config, updateConfig, onCameraPreset, onScreenshot }) => {
  const [activeSection, setActiveSection] = useState('materials');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [favoriteConfigs, setFavoriteConfigs] = useState([]);

  const sections = {
    materials: { icon: FaGem, title: 'Materials & Metals', color: 'purple' },
    gems: { icon: FaStar, title: 'Gems & Beads', color: 'pink' },
    text: { icon: FaFont, title: 'Engraving', color: 'blue' },
    camera: { icon: FaCamera, title: 'View & Capture', color: 'green' },
    advanced: { icon: FaMagic, title: 'Advanced Settings', color: 'orange' }
  };

  const materials = [
    { id: 'gold', name: '18K Gold', color: '#FFD700', price: 0, premium: false },
    { id: 'silver', name: 'Sterling Silver', color: '#E5E5E5', price: -20, premium: false },
    { id: 'rosegold', name: 'Rose Gold', color: '#E8B4B8', price: 15, premium: true }
  ];

  const gemTypes = [
    { id: 'diamond', name: 'Diamond', color: '#FFFFFF', price: 50, rarity: 'legendary' },
    { id: 'emerald', name: 'Emerald', color: '#50C878', price: 35, rarity: 'rare' },
    { id: 'ruby', name: 'Ruby', color: '#E0115F', price: 40, rarity: 'rare' },
    { id: 'sapphire', name: 'Sapphire', color: '#0F52BA', price: 38, rarity: 'rare' },
    { id: 'amethyst', name: 'Amethyst', color: '#9966CC', price: 20, rarity: 'common' },
    { id: 'topaz', name: 'Blue Topaz', color: '#4682B4', price: 15, rarity: 'common' }
  ];

  const beadPatterns = [
    { id: 'classic', name: 'Classic Mix', gems: ['diamond', 'diamond', 'emerald', 'diamond'], price: 0 },
    { id: 'luxury', name: 'All Diamond', gems: ['diamond', 'diamond', 'diamond', 'diamond'], price: 120 },
    { id: 'rainbow', name: 'Rainbow Mix', gems: ['ruby', 'emerald', 'sapphire', 'amethyst'], price: 60 },
    { id: 'sunset', name: 'Sunset Glow', gems: ['ruby', 'topaz'], price: 30 },
    { id: 'ocean', name: 'Ocean Breeze', gems: ['sapphire', 'topaz'], price: 25 }
  ];

  const cameraPresets = [
    { id: 'hero', name: 'Hero Shot', icon: FaCrown, description: 'Perfect for showcasing' },
    { id: 'detail', name: 'Detail View', icon: FaEye, description: 'Close-up inspection' },
    { id: 'social', name: 'Social Media', icon: FaHeart, description: 'Instagram ready' },
    { id: 'catalog', name: 'Product Catalog', icon: FaCamera, description: 'Professional listing' }
  ];

  const calculatePrice = () => {
    const basePrice = 48;
    const materialPrice = materials.find(m => m.id === config.material)?.price || 0;
    const patternPrice = beadPatterns.find(p => p.id === config.beadPattern)?.price || 0;
    const textPrice = config.text ? 15 : 0;
    return basePrice + materialPrice + patternPrice + textPrice;
  };

  const saveToFavorites = () => {
    const newConfig = { ...config, id: Date.now(), name: `Design ${Date.now()}` };
    setFavoriteConfigs([...favoriteConfigs, newConfig]);
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
        <h2 className="text-2xl font-bold mb-2">Design Studio</h2>
        <p className="text-purple-100">Create your perfect piece</p>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveToFavorites}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg text-sm"
          >
            <FaHeart />
            Save Design
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onScreenshot}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg text-sm"
          >
            <FaCamera />
            Capture
          </motion.button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Materials Section */}
        <SectionHeader sectionId="materials" section={sections.materials} />
        <AnimatePresence>
          {activeSection === 'materials' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-3">
                {materials.map((material) => (
                  <motion.button
                    key={material.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateConfig({ material: material.id })}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      config.material === material.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: material.color }}
                        />
                        <div className="text-left">
                          <div className="font-semibold flex items-center gap-2">
                            {material.name}
                            {material.premium && <FaCrown className="text-yellow-500 text-xs" />}
                          </div>
                          <div className="text-sm text-gray-500">
                            {material.price > 0 ? `+$${material.price}` : 
                             material.price < 0 ? `$${material.price}` : 'Included'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gems Section */}
        <SectionHeader sectionId="gems" section={sections.gems} />
        <AnimatePresence>
          {activeSection === 'gems' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Bead Patterns</h4>
                {beadPatterns.map((pattern) => (
                  <motion.button
                    key={pattern.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateConfig({ 
                      beadPattern: pattern.id,
                      gemTypes: pattern.gems 
                    })}
                    className={`w-full p-4 border-2 rounded-xl transition-all ${
                      config.beadPattern === pattern.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {pattern.gems.slice(0, 4).map((gem, i) => {
                            const gemData = gemTypes.find(g => g.id === gem);
                            return (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: gemData?.color }}
                              />
                            );
                          })}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{pattern.name}</div>
                          <div className="text-sm text-gray-500">
                            {pattern.price > 0 ? `+$${pattern.price}` : 'Included'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700">Bead Count</h4>
                  <span className="text-sm text-gray-500">{config.beadCount || 16} beads</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="24"
                  value={config.beadCount || 16}
                  onChange={(e) => updateConfig({ beadCount: parseInt(e.target.value) })}
                  className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
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
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Custom Engraving (+$15)
                </label>
                <input
                  type="text"
                  value={config.text || ''}
                  onChange={(e) => updateConfig({ text: e.target.value.toUpperCase() })}
                  maxLength={8}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="Enter text (max 8 chars)"
                />
                <div className="text-xs text-gray-500">
                  Characters remaining: {8 - (config.text?.length || 0)}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Charm Material</h4>
                <div className="grid grid-cols-3 gap-2">
                  {materials.map((material) => (
                    <motion.button
                      key={material.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateConfig({ charmMaterial: material.id })}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        config.charmMaterial === material.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="w-full h-6 rounded mb-2"
                        style={{ backgroundColor: material.color }}
                      />
                      <div className="text-xs font-medium">{material.name.split(' ')[0]}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
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
                {cameraPresets.map((preset) => (
                  <motion.button
                    key={preset.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCameraPreset(preset.id)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all text-left"
                  >
                    <preset.icon className="text-green-600 mb-2" />
                    <div className="font-semibold text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.description}</div>
                  </motion.button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.autoRotate}
                    onChange={(e) => updateConfig({ autoRotate: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm font-medium">Auto-rotate display</span>
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
                <span>Base Price</span>
                <span>$48</span>
              </div>
              {config.text && (
                <div className="flex justify-between">
                  <span>Custom Engraving</span>
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

export default CustomizationPanel;