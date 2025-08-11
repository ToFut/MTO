import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChromePicker } from 'react-color';
import { useLocation } from 'react-router-dom';
import { FaPalette, FaGem, FaFont, FaImage, FaRuler, FaPaintBrush, FaDownload, FaShare, FaShoppingCart, FaExpand, FaCompress, FaCamera, FaUndo, FaRedo, FaMagic, FaHeart, FaTimes, FaBars, FaCircle, FaSquare, FaStar } from 'react-icons/fa';
import NikeStyleCustomizer from './NikeStyleCustomizer';
import './ResponsiveCustomization.css';

const BaubleBarCustomizer = () => {
  const location = useLocation();
  const selectedProduct = location.state?.product;
  const [currentStep, setCurrentStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [showSavedDesigns, setShowSavedDesigns] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const getInitialConfig = () => {
    if (selectedProduct) {
      // Set initial config based on selected product
      const category = selectedProduct.category;
      let type = 'bracelet';
      
      if (category === 'necklaces') type = 'necklace';
      else if (category === 'earrings') type = 'earrings';
      else if (category === 'accessories' && selectedProduct.name.includes('Phone')) type = 'phone-case';
      else if (category === 'bracelets') type = 'bracelet';
      
      return {
        type,
        productName: selectedProduct.name,
        productId: selectedProduct.id,
        basePrice: selectedProduct.price,
        size: 'medium',
        material: 'gold',
        color: '#FFD700',
        chainColor: '#FFD700',
        beadColors: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98'],
        text: '',
        textColor: '#000000',
        font: 'Inter',
        pattern: null,
        style: 'beaded',
        pendantShape: 'circle',
        hookColor: '#FFD700',
        charmColor: '#FFD700',
        autoRotate: true
      };
    }
    
    return {
      type: 'bracelet',
      size: 'medium',
      material: 'gold',
      color: '#FFD700',
      chainColor: '#FFD700',
      beadColors: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98'],
      text: '',
      textColor: '#000000',
      font: 'Inter',
      pattern: null,
      style: 'beaded',
      pendantShape: 'circle',
      hookColor: '#FFD700',
      charmColor: '#FFD700',
      autoRotate: true
    };
  };

  const [productConfig, setProductConfig] = useState(getInitialConfig());
  
  const customizationSteps = [
    { id: 'type', name: 'Product', icon: FaGem },
    { id: 'style', name: 'Style', icon: FaPaintBrush },
    { id: 'material', name: 'Material', icon: FaPalette },
    { id: 'colors', name: 'Colors', icon: FaPalette },
    { id: 'personalize', name: 'Personalize', icon: FaFont }
  ];
  
  const productTypes = [
    { id: 'bracelet', name: 'Bracelet', price: 48, icon: '⭕' },
    { id: 'necklace', name: 'Necklace', price: 68, icon: '📿' },
    { id: 'earrings', name: 'Earrings', price: 38, icon: '💎' },
    { id: 'phone-case', name: 'Phone Case', price: 45, icon: '📱' }
  ];
  
  const braceletStyles = [
    { id: 'beaded', name: 'Beaded', description: 'Classic beaded design' },
    { id: 'chain', name: 'Chain', description: 'Delicate chain style' },
    { id: 'cuff', name: 'Cuff', description: 'Statement cuff bracelet' },
    { id: 'charm', name: 'Charm', description: 'With custom charms' }
  ];
  
  const necklaceStyles = [
    { id: 'pendant', name: 'Pendant', description: 'With custom pendant' },
    { id: 'layered', name: 'Layered', description: 'Multiple chains' },
    { id: 'choker', name: 'Choker', description: 'Close-fitting style' },
    { id: 'statement', name: 'Statement', description: 'Bold design' }
  ];
  
  const earringStyles = [
    { id: 'stud', name: 'Stud', description: 'Classic studs' },
    { id: 'drop', name: 'Drop', description: 'Elegant drops' },
    { id: 'hoop', name: 'Hoop', description: 'Timeless hoops' },
    { id: 'chandelier', name: 'Chandelier', description: 'Statement style' }
  ];
  
  const materials = [
    { id: 'gold', name: 'Gold Plated', color: '#FFD700', priceModifier: 0 },
    { id: 'silver', name: 'Silver', color: '#C0C0C0', priceModifier: -5 },
    { id: 'rose-gold', name: 'Rose Gold', color: '#B76E79', priceModifier: 5 },
    { id: 'mixed', name: 'Mixed Metals', color: '#FFD700', priceModifier: 10 }
  ];
  
  const beadColorPalettes = [
    { id: 'rainbow', name: 'Rainbow', colors: ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'] },
    { id: 'pastel', name: 'Pastel Dream', colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'] },
    { id: 'ocean', name: 'Ocean Blues', colors: ['#00CED1', '#4682B4', '#1E90FF', '#000080', '#87CEEB'] },
    { id: 'sunset', name: 'Sunset', colors: ['#FF6B6B', '#FF8E53', '#FE6B8B', '#FF8E53', '#FFD93D'] },
    { id: 'monochrome', name: 'Monochrome', colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'] }
  ];
  
  const pendantShapes = [
    { id: 'circle', name: 'Circle', icon: FaCircle },
    { id: 'heart', name: 'Heart', icon: FaHeart },
    { id: 'square', name: 'Square', icon: FaSquare },
    { id: 'star', name: 'Star', icon: FaStar }
  ];
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  
  const updateConfig = (updates) => {
    const newConfig = { ...productConfig, ...updates };
    setProductConfig(newConfig);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newConfig);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setProductConfig(history[historyIndex - 1]);
    }
  };
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setProductConfig(history[historyIndex + 1]);
    }
  };
  
  const calculatePrice = () => {
    const basePrice = productConfig.basePrice || productTypes.find(p => p.id === productConfig.type)?.price || 48;
    const materialModifier = materials.find(m => m.id === productConfig.material)?.priceModifier || 0;
    const textModifier = productConfig.text ? 10 : 0;
    return basePrice + materialModifier + textModifier;
  };
  
  const saveDesign = () => {
    const design = {
      id: Date.now(),
      name: `${productConfig.type} Design ${savedDesigns.length + 1}`,
      config: productConfig,
      timestamp: new Date().toISOString()
    };
    setSavedDesigns([...savedDesigns, design]);
  };
  
  const takeScreenshot = () => {
    const canvas = document.querySelector('canvas');
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `baublebar-${productConfig.type}-${Date.now()}.png`;
      a.click();
    });
  };
  
  const getStyleOptions = () => {
    switch (productConfig.type) {
      case 'bracelet':
        return braceletStyles;
      case 'necklace':
        return necklaceStyles;
      case 'earrings':
        return earringStyles;
      default:
        return [];
    }
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 ${isMobile ? 'overflow-hidden' : ''}`}>
      <div className={`customization-container flex ${isFullscreen ? 'h-screen' : 'min-h-screen'} ${isMobile ? 'flex-col' : ''}`}>
        <div className={`product-viewer ${isFullscreen ? 'w-full' : isMobile ? 'w-full h-1/2' : 'w-3/5'} relative bg-gradient-to-br from-pink-100 to-purple-100`}>
          <div className="absolute top-4 left-4 z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4"
            >
              <h1 className="text-2xl font-bold mb-2 text-purple-800">{selectedProduct ? `Customize ${selectedProduct.name}` : 'BaubleBar Custom Studio'}</h1>
              <p className="text-gray-600">{selectedProduct ? selectedProduct.description : 'Design your unique jewelry'}</p>
            </motion.div>
          </div>
          
          <div className={`absolute top-4 right-4 z-10 flex gap-2 ${isMobile ? 'scale-90' : ''}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-3 bg-white rounded-full shadow-lg transition-all ${
                historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
              }`}
            >
              <FaUndo className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-3 bg-white rounded-full shadow-lg transition-all ${
                historyIndex >= history.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
              }`}
            >
              <FaRedo className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateConfig({ autoRotate: !productConfig.autoRotate })}
              className={`p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all ${
                productConfig.autoRotate ? 'bg-purple-600 text-white' : ''
              }`}
            >
              <FaMagic className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={takeScreenshot}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <FaCamera className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
            </motion.button>
          </div>
          
          <div className={`h-full flex items-center justify-center ${isMobile ? 'p-4' : 'p-8'}`}>
            <div className={`w-full h-full ${isMobile ? '' : 'max-w-4xl max-h-[80vh]'}`}>
              <Basic3DViewer config={productConfig} selectedProduct={selectedProduct} />
            </div>
          </div>
          
          {!isMobile && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4"
              >
                <div className="flex justify-between items-center">
                  <div className={`customization-steps flex ${isTablet ? 'gap-3' : 'gap-6'}`}>
                    {customizationSteps.map((step, index) => (
                      <motion.button
                        key={step.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentStep(index)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          currentStep === index
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <step.icon size={16} />
                        <span className="font-medium">{step.name}</span>
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveDesign}
                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
                  >
                    <FaHeart className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
        
        {!isFullscreen && (
          <motion.div
            initial={{ x: isMobile ? 0 : 400, y: isMobile ? 100 : 0 }}
            animate={{ x: 0, y: 0 }}
            transition={{ type: 'spring', damping: 30 }}
            className={`customization-panel ${isMobile ? 'fixed bottom-0 left-0 right-0 h-1/2 rounded-t-3xl' : isTablet ? 'w-full' : 'w-2/5'} bg-white shadow-2xl overflow-hidden ${isMobileMenuOpen ? 'expanded' : ''}`}
          >
            {isMobile && (
              <div className="drag-handle cursor-grab active:cursor-grabbing" onTouchStart={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            )}
            <div className={`h-full overflow-y-auto ${isMobile ? 'p-4' : 'p-8'}`}>
              <div className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
                <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold mb-2 text-purple-800`}>{productConfig.productName || `Customize Your ${productConfig.type}`}</h2>
                {!isMobile && <p className="text-gray-600">Create your perfect piece</p>}
              </div>
              
              {isMobile && (
                <div className="customization-steps flex gap-2 mb-4 overflow-x-auto pb-2">
                  {customizationSteps.map((step, index) => (
                    <motion.button
                      key={step.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(index)}
                      className={`step-button touch-target flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                        currentStep === index
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <step.icon size={14} />
                      <span className="text-sm font-medium">{step.name}</span>
                    </motion.button>
                  ))}
                </div>
              )}
              
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key="type"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Choose Product Type</h3>
                    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-4`}>
                      {productTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateConfig({ type: type.id })}
                          className={`${isMobile ? 'p-4' : 'p-6'} rounded-xl border-2 transition-all ${
                            productConfig.type === type.id
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-3xl mb-2">{type.icon}</div>
                          <h4 className="font-semibold">{type.name}</h4>
                          <p className="text-sm mt-1">${type.price}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {currentStep === 1 && (
                  <motion.div
                    key="style"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Select Style</h3>
                    {getStyleOptions().map((style) => (
                      <motion.button
                        key={style.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateConfig({ style: style.id })}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          productConfig.style === style.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h4 className="font-semibold">{style.name}</h4>
                        <p className="text-sm text-gray-500">{style.description}</p>
                      </motion.button>
                    ))}
                    
                    {productConfig.type === 'necklace' && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3">Pendant Shape</h4>
                        <div className="grid grid-cols-4 gap-3">
                          {pendantShapes.map((shape) => (
                            <motion.button
                              key={shape.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateConfig({ pendantShape: shape.id })}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                productConfig.pendantShape === shape.id
                                  ? 'border-purple-600 bg-purple-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <shape.icon className="w-6 h-6 mx-auto" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {currentStep === 2 && (
                  <motion.div
                    key="material"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Choose Material</h3>
                    {materials.map((material) => (
                      <motion.button
                        key={material.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateConfig({ 
                          material: material.id,
                          color: material.color,
                          chainColor: material.color,
                          hookColor: material.color
                        })}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${
                          productConfig.material === material.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: material.color }}
                          />
                          <div className="text-left">
                            <h4 className="font-semibold">{material.name}</h4>
                            <p className="text-sm text-gray-500">
                              {material.priceModifier > 0 ? `+$${material.priceModifier}` : 
                               material.priceModifier < 0 ? `-$${Math.abs(material.priceModifier)}` : 'Standard price'}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
                
                {currentStep === 3 && (
                  <motion.div
                    key="colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {productConfig.type === 'bracelet' && (
                      <div>
                        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Bead Colors</h3>
                        <div className="space-y-3">
                          {beadColorPalettes.map((palette) => (
                            <motion.button
                              key={palette.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateConfig({ beadColors: palette.colors })}
                              className={`w-full p-4 rounded-xl border-2 transition-all ${
                                JSON.stringify(productConfig.beadColors) === JSON.stringify(palette.colors)
                                  ? 'border-purple-600 bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <h4 className="font-semibold text-left mb-2">{palette.name}</h4>
                              <div className="flex gap-1">
                                {palette.colors.map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="flex-1 h-6 rounded"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold mb-3">Accent Color</h4>
                      <div className={`grid ${isMobile ? 'grid-cols-6' : 'grid-cols-8'} gap-2 mb-4`}>
                        {['#FFD700', '#C0C0C0', '#B76E79', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C'].map((color) => (
                          <motion.button
                            key={color}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateConfig({ charmColor: color })}
                            className={`aspect-square rounded-lg border-4 transition-all ${
                              productConfig.charmColor === color ? 'border-purple-600' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-full py-3 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-all"
                      >
                        Custom Color
                      </motion.button>
                      {showColorPicker && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 flex justify-center"
                        >
                          <ChromePicker
                            color={productConfig.charmColor}
                            onChange={(color) => updateConfig({ charmColor: color.hex })}
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {currentStep === 4 && (
                  <motion.div
                    key="personalize"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Add Personalization</h3>
                      <input
                        type="text"
                        value={productConfig.text}
                        onChange={(e) => updateConfig({ text: e.target.value })}
                        placeholder="Enter initials, name, or date"
                        maxLength={15}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 transition-all"
                      />
                      <p className="text-sm text-gray-500 mt-2">{productConfig.text.length}/15 characters (+$10)</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Engraving Style</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['Classic', 'Script', 'Modern', 'Bold'].map((style) => (
                          <motion.button
                            key={style}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateConfig({ font: style })}
                            className={`p-3 rounded-xl border-2 ${
                              productConfig.font === style
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200'
                            }`}
                          >
                            {style}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Text Color</h4>
                      <div className="flex gap-2">
                        {['#000000', '#FFFFFF', '#FFD700'].map((color) => (
                          <motion.button
                            key={color}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateConfig({ textColor: color })}
                            className={`w-12 h-12 rounded-lg border-4 ${
                              productConfig.textColor === color ? 'border-purple-600' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${isMobile ? 'price-section mt-6 pt-4' : 'mt-12 pt-8'} border-t`}
              >
                <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
                  <div>
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-purple-800`}>${calculatePrice()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Free shipping over $75</p>
                    <p className="text-sm font-medium">Ships in 3-5 days</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${isMobile ? 'py-3' : 'py-4'} bg-purple-600 text-white rounded-xl font-semibold ${isMobile ? 'text-base' : 'text-lg'} hover:bg-purple-700 transition-all flex items-center justify-center gap-2`}
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </motion.button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowSavedDesigns(true)}
                      className={`${isMobile ? 'py-2 text-sm' : 'py-3'} bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-all`}
                    >
                      My Designs ({savedDesigns.length})
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${isMobile ? 'py-2 text-sm' : 'py-3'} bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2`}
                    >
                      <FaShare />
                      Share
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {showSavedDesigns && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSavedDesigns(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-purple-800">My Saved Designs</h3>
                <button
                  onClick={() => setShowSavedDesigns(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <FaTimes />
                </button>
              </div>
              
              {savedDesigns.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved designs yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {savedDesigns.map((design) => (
                    <motion.button
                      key={design.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        updateConfig(design.config);
                        setShowSavedDesigns(false);
                      }}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 transition-all text-left"
                    >
                      <h4 className="font-semibold">{design.name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(design.timestamp).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex gap-2 text-sm">
                        <span className="capitalize">{design.config.type}</span>
                        <span>•</span>
                        <span>{design.config.material}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BaubleBarCustomizer;