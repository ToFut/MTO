import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { 
  FaArrowLeft, FaExpand, FaCompress, FaDownload, FaShare,
  FaSpinner, FaGem, FaMagic, FaCamera
} from 'react-icons/fa';

// Import our new components
import PremiumBracelet from './3d/PremiumBracelet';
import SimpleTote from './3d/SimpleTote';
import InitialsTote from './3d/InitialsTote';
import CustomBlanket from './3d/CustomBlanket';
import StudioEnvironment from './3d/StudioEnvironment';
import CameraController, { getCameraPresets } from './3d/CameraController';
import IconCustomizationPanel from './ui/IconCustomizationPanel';

// Professional loading screen
const PremiumLoadingScreen = () => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
    <div className="text-center">
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, 360, 720]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative mb-8"
      >
        <FaGem className="w-20 h-20 text-purple-400" />
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: [1.5, 2.5, 1.5], opacity: [0, 0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaGem className="w-20 h-20 text-pink-300" />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: [2, 3, 2], opacity: [0, 0.3, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        >
          <FaGem className="w-20 h-20 text-blue-300" />
        </motion.div>
      </motion.div>
      
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-light text-white mb-4 tracking-wider"
      >
        Crafting Your Perfect Piece
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-purple-200 mb-8"
      >
        Loading premium 3D experience...
      </motion.p>
      
      <motion.div 
        className="w-80 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  </div>
);

// 3D Scene Component
const Scene3D = ({ config, cameraPreset, lightingPreset, onCameraPreset }) => (
  <Canvas
    shadows
    camera={{ position: [3, 2, 3], fov: 35 }}
    gl={{ 
      antialias: true,
      toneMapping: THREE.ACESFilmicToneMapping,
      outputColorSpace: THREE.SRGBColorSpace,
      shadowMap: {
        enabled: true,
        type: THREE.PCFSoftShadowMap
      }
    }}
    dpr={[1, 2]}
  >
    <Suspense fallback={null}>
      {/* Environment and Lighting */}
      <StudioEnvironment preset={lightingPreset} quality="high" />
      
      {/* Render appropriate 3D model based on product type */}
      {config.productType === 'tote' ? (
        <SimpleTote config={config} />
      ) : config.productType === 'initialsTote' ? (
        <InitialsTote config={config} />
      ) : config.productType === 'blanket' ? (
        <CustomBlanket config={config} />
      ) : (
        <PremiumBracelet config={config} />
      )}
      
      {/* Camera Controls */}
      <CameraController 
        preset={cameraPreset}
        autoRotate={config.autoRotate}
        enableControls={true}
      />
    </Suspense>
  </Canvas>
);

const PremiumCustomizer = ({ initialProduct = null }) => {
  const location = useLocation();
  const selectedProduct = initialProduct || location.state?.product;
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('hero');
  const [lightingPreset, setLightingPreset] = useState('jewelry');
  
  // Customization State
  const [config, setConfig] = useState({
    // Product type
    productType: selectedProduct?.type || 'bracelet',
    
    // Bracelet specific
    material: 'gold',
    charmMaterial: 'gold',
    gemTypes: ['diamond', 'diamond', 'emerald', 'diamond'],
    beadPattern: 'classic',
    beadCount: 16,
    text: 'CUSTOM',
    
    // Tote specific
    bagColor: '#F5F5DC',
    handleColor: '#8B4513',
    bottomColor: '#8B4513',
    
    // Initials Tote specific
    initials: 'AB',
    fullName: '',
    showMonogramCircle: false,
    initialsColor: '#FFFFFF',
    
    // Blanket specific
    blanketColor: '#F5F5DC',
    pattern: 'solid',
    patternColor: '#8B4513',
    centerDesign: 'monogram',
    monogram: 'ABC',
    customText: 'Home Sweet Home',
    monogramColor: '#000000',
    monogramBgColor: '#FFFFFF',
    cornerText: '',
    cornerTextColor: '#8B4513',
    hasFringe: false,
    fringeColor: '#8B4513',
    
    // Icon spots (6 spots)
    spot1: { enabled: true, icon: 'Camera', label: 'Photo', color: '#000000' },
    spot2: { enabled: true, icon: 'Heart', label: 'Love', color: '#FF0000' },
    spot3: { enabled: true, icon: 'Star', label: '', color: '#FFD700' },
    spot4: { enabled: false, icon: null, label: '', color: '#000000' },
    spot5: { enabled: false, icon: null, label: '', color: '#000000' },
    spot6: { enabled: false, icon: null, label: '', color: '#000000' },
    
    // Common text
    mainText: '',
    textColor: '#000000',
    
    // Animation
    autoRotate: true,
    
    // Advanced
    quality: 'high',
    effects: true
  });

  const [productName] = useState(selectedProduct?.name || 'Premium Custom Bracelet');

  // Initialize loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Configuration updater
  const updateConfig = (newConfig) => {
    console.log('Updating config with:', newConfig);
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Screenshot functionality
  const takeScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `custom-bracelet-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    }
  };

  // Camera preset handler
  const handleCameraPreset = (preset) => {
    setCameraPreset(preset);
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Custom Bracelet Design',
          text: 'Check out my custom bracelet design!',
          url: window.location.href,
        });
      } catch (err) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            takeScreenshot();
            break;
          case 'f':
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
            break;
          default:
            break;
        }
      }
      
      // Camera shortcuts
      switch (e.key) {
        case '1':
          handleCameraPreset('hero');
          break;
        case '2':
          handleCameraPreset('detail');
          break;
        case '3':
          handleCameraPreset('front');
          break;
        case '4':
          handleCameraPreset('side');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  if (loading) return <PremiumLoadingScreen />;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex h-screen">
        {/* 3D Viewer Section */}
        <div className={`${isFullscreen ? 'w-full' : 'w-3/5'} relative`}>
          {/* Header Controls */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md rounded-2xl p-4 text-white"
          >
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <FaGem className="text-purple-400" />
              {productName}
            </h1>
            <p className="text-sm opacity-80">Premium 3D Customization Studio</p>
            <div className="flex gap-2 mt-3">
              <span className="px-2 py-1 bg-purple-600 rounded-full text-xs">Live Preview</span>
              <span className="px-2 py-1 bg-pink-600 rounded-full text-xs">Ultra HD</span>
            </div>
          </motion.div>

          {/* Camera & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 z-10 flex flex-col gap-3"
          >
            {/* Camera Presets */}
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3">
              <div className="text-white text-sm font-semibold mb-3">Camera Views</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(getCameraPresets()).slice(0, 4).map(([key, preset]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCameraPreset(key)}
                    className={`p-2 rounded-lg text-white transition-all text-xs ${
                      cameraPreset === key ? 'bg-purple-600' : 'hover:bg-white/20'
                    }`}
                    title={preset.description}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3 flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLightingPreset(lightingPreset === 'jewelry' ? 'dramatic' : 'jewelry')}
                className="p-2 rounded-lg text-white hover:bg-white/20 transition-all"
                title="Toggle Lighting"
              >
                <FaMagic />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={takeScreenshot}
                className="p-2 rounded-lg text-white hover:bg-white/20 transition-all"
                title="Screenshot (Ctrl+S)"
              >
                <FaCamera />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-2 rounded-lg text-white hover:bg-white/20 transition-all"
                title="Share Design"
              >
                <FaShare />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg text-white hover:bg-white/20 transition-all"
                title="Fullscreen (Ctrl+F)"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </motion.button>
            </div>
          </motion.div>

          {/* 3D Scene */}
          <Scene3D 
            config={config}
            cameraPreset={cameraPreset}
            lightingPreset={lightingPreset}
            onCameraPreset={handleCameraPreset}
          />

          {/* Keyboard Shortcuts Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md rounded-xl p-3 text-white text-xs"
          >
            <div className="font-semibold mb-2">Shortcuts</div>
            <div className="space-y-1 opacity-80">
              <div>1-4: Camera views</div>
              <div>Ctrl+S: Screenshot</div>
              <div>Ctrl+F: Fullscreen</div>
            </div>
          </motion.div>
        </div>

        {/* Customization Panel */}
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-2/5 bg-white shadow-2xl"
          >
            <IconCustomizationPanel
              config={config}
              updateConfig={updateConfig}
              onCameraPreset={handleCameraPreset}
              onScreenshot={takeScreenshot}
              productType={config.productType}
            />
          </motion.div>
        )}
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-2xl max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Share Your Design</h3>
              <p className="text-gray-600 mb-4">Copy the link to share your custom bracelet design:</p>
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumCustomizer;