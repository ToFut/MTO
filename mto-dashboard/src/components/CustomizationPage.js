import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChromePicker } from 'react-color';
import { FaPalette, FaCube, FaFont, FaImage, FaRuler, FaPaintBrush, FaDownload, FaShare, FaShoppingCart, FaExpand, FaCompress, FaCamera, FaUndo, FaRedo, FaMagic, FaHeart, FaTimes, FaBars } from 'react-icons/fa';
import Product3DViewer from './Product3DViewer';
import './ResponsiveCustomization.css';

const CustomizationPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [showSavedDesigns, setShowSavedDesigns] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const [productConfig, setProductConfig] = useState({
    type: 'tote',
    size: 'medium',
    material: 'canvas',
    color: '#8B4513',
    handleColor: '#8B4513',
    text: '',
    textColor: '#FFFFFF',
    textPosition: 'center',
    font: 'Inter',
    logo: null,
    pattern: null,
    autoRotate: false
  });
  
  const customizationSteps = [
    { id: 'type', name: 'Product Type', icon: FaCube },
    { id: 'size', name: 'Size', icon: FaRuler },
    { id: 'material', name: 'Material', icon: FaCube },
    { id: 'color', name: 'Colors', icon: FaPalette },
    { id: 'design', name: 'Design', icon: FaPaintBrush },
    { id: 'text', name: 'Text', icon: FaFont }
  ];
  
  const productTypes = [
    { id: 'tote', name: 'Tote Bag', price: 45 },
    { id: 'messenger', name: 'Messenger Bag', price: 65 },
    { id: 'backpack', name: 'Backpack', price: 85 },
    { id: 'pouch', name: 'Pouch', price: 25 }
  ];
  
  const sizes = [
    { id: 'small', name: 'Small', dimensions: '12" x 14"', priceModifier: -5 },
    { id: 'medium', name: 'Medium', dimensions: '14" x 16"', priceModifier: 0 },
    { id: 'large', name: 'Large', dimensions: '16" x 18"', priceModifier: 10 }
  ];
  
  const materials = [
    { id: 'canvas', name: 'Canvas', description: 'Durable cotton canvas', priceModifier: 0 },
    { id: 'leather', name: 'Vegan Leather', description: 'Premium eco-friendly', priceModifier: 20 },
    { id: 'denim', name: 'Denim', description: 'Recycled denim fabric', priceModifier: 15 },
    { id: 'organic', name: 'Organic Cotton', description: '100% organic materials', priceModifier: 10 }
  ];
  
  const presetColors = [
    '#8B4513', '#000000', '#FFFFFF', '#DC143C',
    '#4169E1', '#228B22', '#FFD700', '#FF69B4',
    '#4B0082', '#FF6347', '#20B2AA', '#F0E68C'
  ];
  
  const patterns = [
    { id: 'stripes', name: 'Stripes' },
    { id: 'dots', name: 'Polka Dots' },
    { id: 'geometric', name: 'Geometric' },
    { id: 'floral', name: 'Floral' },
    { id: 'abstract', name: 'Abstract' }
  ];
  
  const fonts = [
    { id: 'Inter', name: 'Modern' },
    { id: 'Playfair', name: 'Elegant' },
    { id: 'Roboto', name: 'Clean' },
    { id: 'Pacifico', name: 'Script' },
    { id: 'Bebas', name: 'Bold' }
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
    const basePrice = productTypes.find(p => p.id === productConfig.type)?.price || 45;
    const sizeModifier = sizes.find(s => s.id === productConfig.size)?.priceModifier || 0;
    const materialModifier = materials.find(m => m.id === productConfig.material)?.priceModifier || 0;
    return basePrice + sizeModifier + materialModifier;
  };
  
  const saveDesign = () => {
    const design = {
      id: Date.now(),
      name: `Design ${savedDesigns.length + 1}`,
      config: productConfig,
      timestamp: new Date().toISOString()
    };
    setSavedDesigns([...savedDesigns, design]);
  };
  
  const loadDesign = (design) => {
    updateConfig(design.config);
    setShowSavedDesigns(false);
  };
  
  const takeScreenshot = () => {
    const canvas = document.querySelector('canvas');
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-${productConfig.type}-${Date.now()}.png`;
      a.click();
    });
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 ${isMobile ? 'overflow-hidden' : ''}`}>
      <div className={`customization-container flex ${isFullscreen ? 'h-screen' : 'min-h-screen'} ${isMobile ? 'flex-col' : ''}`}>
        <div className={`product-viewer ${isFullscreen ? 'w-full' : isMobile ? 'w-full h-1/2' : 'w-3/5'} relative bg-gradient-to-br from-gray-100 to-gray-200`}>
          <div className="absolute top-4 left-4 z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4"
            >
              <h1 className="text-2xl font-bold mb-2">Custom {productConfig.type.charAt(0).toUpperCase() + productConfig.type.slice(1)}</h1>
              <p className="text-gray-600">Design your perfect bag</p>
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
              onClick={() => setProductConfig({...productConfig, autoRotate: !productConfig.autoRotate})}
              className={`p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all ${
                productConfig.autoRotate ? 'bg-black text-white' : ''
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
              <Product3DViewer config={productConfig} />
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
                          ? 'bg-black text-white'
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
                <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold mb-2`}>Customize Your Design</h2>
                {!isMobile && <p className="text-gray-600">Create something unique and personal</p>}
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
                          ? 'bg-black text-white'
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
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                      {productTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateConfig({ type: type.id })}
                          className={`${isMobile ? 'p-4' : 'p-6'} rounded-xl border-2 transition-all ${
                            productConfig.type === type.id
                              ? 'border-black bg-black text-white'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <FaCube size={32} className="mx-auto mb-3" />
                          <h4 className="font-semibold">{type.name}</h4>
                          <p className="text-sm mt-1">${type.price}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {currentStep === 1 && (
                  <motion.div
                    key="size"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Select Size</h3>
                    {sizes.map((size) => (
                      <motion.button
                        key={size.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateConfig({ size: size.id })}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                          productConfig.size === size.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-left">
                          <h4 className="font-semibold">{size.name}</h4>
                          <p className="text-sm text-gray-500">{size.dimensions}</p>
                        </div>
                        <span className="font-medium">
                          {size.priceModifier > 0 ? `+$${size.priceModifier}` : size.priceModifier < 0 ? `-$${Math.abs(size.priceModifier)}` : 'Standard'}
                        </span>
                      </motion.button>
                    ))}
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
                        onClick={() => updateConfig({ material: material.id })}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${
                          productConfig.material === material.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-left">
                            <h4 className="font-semibold">{material.name}</h4>
                            <p className="text-sm text-gray-500">{material.description}</p>
                          </div>
                          <span className="font-medium">
                            {material.priceModifier > 0 ? `+$${material.priceModifier}` : 'Standard'}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
                
                {currentStep === 3 && (
                  <motion.div
                    key="color"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Main Color</h3>
                      <div className={`grid ${isMobile ? 'grid-cols-6' : 'grid-cols-4'} gap-3 mb-4`}>
                        {presetColors.map((color) => (
                          <motion.button
                            key={color}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateConfig({ color })}
                            className={`aspect-square rounded-xl border-4 transition-all ${
                              productConfig.color === color ? 'border-black' : 'border-gray-200'
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
                            color={productConfig.color}
                            onChange={(color) => updateConfig({ color: color.hex })}
                          />
                        </motion.div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Handle Color</h4>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateConfig({ handleColor: productConfig.color })}
                          className={`flex-1 py-2 rounded-lg border-2 ${
                            productConfig.handleColor === productConfig.color
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200'
                          }`}
                        >
                          Match Main
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateConfig({ handleColor: '#000000' })}
                          className={`flex-1 py-2 rounded-lg border-2 ${
                            productConfig.handleColor === '#000000'
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200'
                          }`}
                        >
                          Black
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateConfig({ handleColor: '#8B4513' })}
                          className={`flex-1 py-2 rounded-lg border-2 ${
                            productConfig.handleColor === '#8B4513'
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200'
                          }`}
                        >
                          Brown
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {currentStep === 4 && (
                  <motion.div
                    key="design"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Add Pattern</h3>
                      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateConfig({ pattern: null })}
                          className={`p-4 rounded-xl border-2 ${
                            !productConfig.pattern
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200'
                          }`}
                        >
                          None
                        </motion.button>
                        {patterns.map((pattern) => (
                          <motion.button
                            key={pattern.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateConfig({ pattern: pattern.id })}
                            className={`p-4 rounded-xl border-2 ${
                              productConfig.pattern === pattern.id
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200'
                            }`}
                          >
                            {pattern.name}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Upload Logo</h4>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 transition-all"
                      >
                        <FaImage size={40} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 mb-2">Drop your logo here</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-black text-white rounded-lg font-medium"
                        >
                          Browse Files
                        </motion.button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                
                {currentStep === 5 && (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Add Text</h3>
                      <input
                        type="text"
                        value={productConfig.text}
                        onChange={(e) => updateConfig({ text: e.target.value })}
                        placeholder="Enter your text"
                        maxLength={30}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-all"
                      />
                      <p className="text-sm text-gray-500 mt-2">{productConfig.text.length}/30 characters</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Font Style</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {fonts.map((font) => (
                          <motion.button
                            key={font.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateConfig({ font: font.id })}
                            className={`p-3 rounded-xl border-2 ${
                              productConfig.font === font.id
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200'
                            }`}
                          >
                            {font.name}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Text Color</h4>
                      <div className="flex gap-2">
                        {['#FFFFFF', '#000000', productConfig.color].map((color) => (
                          <motion.button
                            key={color}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateConfig({ textColor: color })}
                            className={`w-12 h-12 rounded-lg border-4 ${
                              productConfig.textColor === color ? 'border-black' : 'border-gray-200'
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
                    <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>${calculatePrice()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Free shipping</p>
                    <p className="text-sm font-medium">Delivery in 7-10 days</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${isMobile ? 'py-3' : 'py-4'} bg-black text-white rounded-xl font-semibold ${isMobile ? 'text-base' : 'text-lg'} hover:bg-gray-900 transition-all flex items-center justify-center gap-2`}
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
                      View Saved ({savedDesigns.length})
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
                <h3 className="text-2xl font-bold">Saved Designs</h3>
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
                      onClick={() => loadDesign(design)}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-black transition-all text-left"
                    >
                      <h4 className="font-semibold">{design.name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(design.timestamp).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: design.config.color }}
                        />
                        <span className="text-sm">{design.config.material}</span>
                        <span className="text-sm">{design.config.size}</span>
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

export default CustomizationPage;