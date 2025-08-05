import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Center, ContactShadows, PresentationControls } from '@react-three/drei';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
  FaShoppingCart, FaExpand, FaCompress, FaMagic, FaCamera,
  FaEye, FaCube, FaGem, FaSun, FaMoon, FaRocket, FaPalette,
  FaUndo, FaRedo, FaHeart, FaShare
} from 'react-icons/fa';

// Loading Screen Component
const LoadingScreen = () => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-purple-900">
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative"
    >
      <FaGem className="w-24 h-24 text-purple-400" />
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 2.5, opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <FaGem className="w-24 h-24 text-purple-300" />
      </motion.div>
    </motion.div>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="absolute bottom-1/3 text-white text-2xl font-light tracking-wider"
    >
      Crafting Your Vision
    </motion.h2>
  </div>
);

// Camera Controller
const CameraController = ({ preset }) => {
  const { camera } = useThree();
  
  const cameraPositions = {
    front: [0, 0, 5],
    side: [5, 0, 0],
    top: [0, 5, 1],
    detail: [0, 0, 2.5],
    hero: [3, 2, 3],
    dramatic: [-3, 3, -3]
  };

  useEffect(() => {
    if (preset && cameraPositions[preset]) {
      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(...cameraPositions[preset]);
      const startTime = Date.now();
      const duration = 1200;

      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        
        camera.position.lerpVectors(startPos, endPos, eased);
        camera.lookAt(0, 0, 0);
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      };
      
      animateCamera();
    }
  }, [preset, camera, cameraPositions]);

  return null;
};

// Nike-Style Bracelet Component
const NikeBracelet = ({ config }) => {
  const meshRef = useRef();
  const [introComplete, setIntroComplete] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      if (!introComplete) {
        meshRef.current.rotation.y += 0.02;
        if (meshRef.current.rotation.y > Math.PI * 2) {
          setIntroComplete(true);
        }
      } else if (config.autoRotate) {
        meshRef.current.rotation.y += 0.005;
      }
      
      // Subtle floating
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const beadCount = 12;
  const radius = 1.3;

  // Create text texture using useMemo
  const textTexture = useMemo(() => {
    if (!config.text) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = config.textColor || '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.text, 128, 48);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [config.text, config.textColor]);

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={meshRef}>
        {/* Main Band */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[radius, 0.08, 32, 100]} />
          <meshPhysicalMaterial 
            color={config.bandColor || config.color} 
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            reflectivity={1}
          />
        </mesh>

        {/* Beads */}
        {Array.from({ length: beadCount }).map((_, i) => {
          const angle = (i / beadCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const beadColor = config.beadColors?.[i % config.beadColors.length] || config.color;
          
          return (
            <group key={i} position={[x, 0, z]}>
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshPhysicalMaterial 
                  color={beadColor}
                  metalness={config.material === 'metal' ? 0.9 : 0.1}
                  roughness={config.material === 'metal' ? 0.1 : 0.3}
                  clearcoat={1}
                  clearcoatRoughness={0}
                  transmission={config.material === 'crystal' ? 0.8 : 0}
                  thickness={config.material === 'crystal' ? 0.5 : 0}
                />
              </mesh>
              
              {/* Inner glow for crystals */}
              {config.material === 'crystal' && (
                <mesh scale={0.9}>
                  <sphereGeometry args={[0.15, 16, 16]} />
                  <meshBasicMaterial 
                    color={beadColor} 
                    transparent 
                    opacity={0.3}
                  />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Charm */}
        {config.text && (
          <group position={[0, -radius - 0.6, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1, 0.6, 0.15]} />
              <meshPhysicalMaterial 
                color={config.charmColor || config.color}
                metalness={0.95}
                roughness={0.05}
                clearcoat={1}
                clearcoatRoughness={0}
              />
            </mesh>
            
            {/* Text Plane */}
            <mesh position={[0, 0, 0.08]}>
              <planeGeometry args={[0.8, 0.3]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            
            {/* Text */}
            <Center position={[0, 0, 0.081]}>
              <mesh>
                <planeGeometry args={[0.8, 0.3]} />
                <meshBasicMaterial transparent map={textTexture} />
              </mesh>
            </Center>
          </group>
        )}
      </group>
    </Float>
  );
};

// Nike-Style Necklace Component  
const NikeNecklace = ({ config }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && config.autoRotate) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  // Create text texture using useMemo
  const textTexture = useMemo(() => {
    if (!config.text) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = config.textColor || '#000000';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.text, 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [config.text, config.textColor]);

  // Chain segments
  const createChain = () => {
    const segments = [];
    const linkCount = 40;
    
    for (let i = 0; i < linkCount; i++) {
      const t = i / (linkCount - 1);
      const angle = Math.PI * t - Math.PI / 2;
      const x = Math.sin(angle) * 2.2;
      const y = -Math.cos(angle) * 2.2 + 2.2;
      
      segments.push(
        <mesh key={i} position={[x, y, 0]} rotation={[0, 0, i % 2 === 0 ? 0 : Math.PI / 2]} castShadow receiveShadow>
          <torusGeometry args={[0.06, 0.02, 16, 32]} />
          <meshPhysicalMaterial 
            color={config.chainColor || config.color}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
          />
        </mesh>
      );
    }
    
    return segments;
  };

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={meshRef}>
        {/* Chain */}
        {createChain()}
        
        {/* Pendant */}
        <group position={[0, -2.5, 0]}>
          <mesh castShadow receiveShadow>
            {config.pendantShape === 'heart' ? (
              <sphereGeometry args={[0.4, 32, 32]} />
            ) : config.pendantShape === 'square' ? (
              <boxGeometry args={[0.7, 0.7, 0.2]} />
            ) : (
              <sphereGeometry args={[0.4, 32, 32]} />
            )}
            <meshPhysicalMaterial 
              color={config.color}
              metalness={0.9}
              roughness={0.1}
              clearcoat={1}
            />
          </mesh>
          
          {/* Text on pendant */}
          {config.text && (
            <Center position={[0, 0, 0.21]}>
              <mesh>
                <planeGeometry args={[0.6, 0.2]} />
                <meshBasicMaterial transparent map={textTexture} />
              </mesh>
            </Center>
          )}
        </group>
      </group>
    </Float>
  );
};

// Product Model Selector
const ProductModel = ({ config, selectedProduct }) => {
  if (!selectedProduct) {
    return <NikeBracelet config={config} />;
  }

  const category = selectedProduct.category;
  
  if (category === 'necklaces') {
    return <NikeNecklace config={config} />;
  } else {
    return <NikeBracelet config={config} />;
  }
};

// Demo Presets
const demoPresets = {
  valentines: {
    name: "Valentine's Special",
    icon: "💝",
    config: {
      color: '#FF69B4',
      bandColor: '#FFB6C1',
      charmColor: '#FF69B4',
      textColor: '#FFFFFF',
      text: 'LOVE',
      material: 'metal',
      beadColors: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFE4E1']
    }
  },
  wedding: {
    name: "Bridal Collection",  
    icon: "💍",
    config: {
      color: '#FFD700',
      bandColor: '#FFD700',
      charmColor: '#FFF8DC',
      textColor: '#000000',
      text: 'BRIDE',
      material: 'metal',
      beadColors: ['#FFD700', '#FFF8DC', '#FFFACD', '#FFFFFF']
    }
  },
  ocean: {
    name: "Ocean Vibes",
    icon: "🌊", 
    config: {
      color: '#4682B4',
      bandColor: '#4682B4',
      charmColor: '#87CEEB',
      textColor: '#FFFFFF',
      text: 'OCEAN',
      material: 'crystal',
      beadColors: ['#4682B4', '#87CEEB', '#00CED1', '#40E0D0']
    }
  },
  sunset: {
    name: "Sunset Glow",
    icon: "🌅",
    config: {
      color: '#B76E79',
      bandColor: '#B76E79',
      charmColor: '#DDA0DD',
      textColor: '#FFFFFF',
      text: 'GLOW',
      material: 'metal',
      beadColors: ['#B76E79', '#DDA0DD', '#DA70D6', '#FF69B4']
    }
  }
};

// Main Customizer Component
const NikeStyleProductCustomizer = () => {
  const location = useLocation();
  const selectedProduct = location.state?.product;
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [cameraPreset, setCameraPreset] = useState('hero');
  const [lightingMode, setLightingMode] = useState('studio');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [productConfig, setProductConfig] = useState({
    type: selectedProduct?.category === 'necklaces' ? 'necklace' : 'bracelet',
    productName: selectedProduct?.name || 'Custom Bracelet',
    basePrice: selectedProduct?.price || 48,
    color: '#FFD700',
    bandColor: '#FFD700',
    chainColor: '#FFD700', 
    charmColor: '#FFD700',
    beadColors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'],
    text: '',
    textColor: '#000000',
    material: 'metal',
    pendantShape: 'circle',
    autoRotate: true
  });

  const customizationSteps = [
    { id: 'material', name: 'Material', icon: FaGem },
    { id: 'colors', name: 'Colors', icon: FaPalette },
    { id: 'personalize', name: 'Text', icon: FaPalette },
    { id: 'review', name: 'Review', icon: FaEye }
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  const updateConfig = (updates) => {
    setProductConfig(prev => ({ ...prev, ...updates }));
  };

  const applyDemoPreset = (presetKey) => {
    const preset = demoPresets[presetKey];
    updateConfig(preset.config);
    
    // Animate through camera views
    setCameraPreset('hero');
    setTimeout(() => setCameraPreset('front'), 500);
    setTimeout(() => setCameraPreset('side'), 1500);
    setTimeout(() => setCameraPreset('hero'), 2500);
  };

  const takeScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `baublebar-design-${Date.now()}.png`;
        a.click();
      });
    }
  };

  const materials = [
    { id: 'metal', name: 'Metal', color: '#C0C0C0', description: 'Premium metal finish' },
    { id: 'crystal', name: 'Crystal', color: '#FFFFFF', description: 'Sparkling crystal beads' }
  ];

  const colorPalettes = [
    { name: 'Classic Gold', colors: ['#FFD700', '#FFF8DC', '#FFFACD', '#FFFFFF'] },
    { name: 'Rose Garden', colors: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFE4E1'] },
    { name: 'Ocean Blues', colors: ['#4682B4', '#87CEEB', '#00CED1', '#40E0D0'] },
    { name: 'Sunset', colors: ['#B76E79', '#DDA0DD', '#DA70D6', '#FF69B4'] }
  ];

  if (loading) return <LoadingScreen />;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex h-screen">
        {/* 3D Viewer */}
        <div className={`${isFullscreen ? 'w-full' : 'w-3/5'} relative`}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md rounded-2xl p-4 text-white"
          >
            <h1 className="text-2xl font-bold mb-1">{productConfig.productName}</h1>
            <p className="text-sm opacity-80">Nike-Style 3D Customization</p>
          </motion.div>

          {/* Camera Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 z-10 flex flex-col gap-2"
          >
            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-2 flex flex-col gap-2">
              {[
                { key: 'front', icon: FaEye, title: 'Front View' },
                { key: 'side', icon: FaCube, title: 'Side View' },
                { key: 'top', icon: FaGem, title: 'Top View' },
                { key: 'detail', icon: FaCamera, title: 'Detail View' },
                { key: 'hero', icon: FaRocket, title: 'Hero View' }
              ].map(({ key, icon: Icon, title }) => (
                <button
                  key={key}
                  onClick={() => setCameraPreset(key)}
                  className={`p-2 rounded-lg text-white transition-all ${
                    cameraPreset === key ? 'bg-purple-600' : 'hover:bg-white/20'
                  }`}
                  title={title}
                >
                  <Icon />
                </button>
              ))}
            </div>
            
            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-2 flex flex-col gap-2">
              <button
                onClick={() => updateConfig({ autoRotate: !productConfig.autoRotate })}
                className={`p-2 rounded-lg text-white transition-all ${
                  productConfig.autoRotate ? 'bg-green-600' : 'hover:bg-white/20'
                }`}
                title="Auto Rotate"
              >
                <FaMagic />
              </button>
              <button
                onClick={() => setLightingMode(lightingMode === 'studio' ? 'dramatic' : 'studio')}
                className="p-2 rounded-lg text-white hover:bg-white/20 transition-all"
                title="Toggle Lighting"
              >
                {lightingMode === 'studio' ? <FaSun /> : <FaMoon />}
              </button>
              <button
                onClick={takeScreenshot}
                className="p-2 rounded-lg text-white hover:bg-white/20 transition-all"
                title="Screenshot"
              >
                <FaCamera />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg text-white hover:bg-white/20 transition-all"
                title="Fullscreen"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </motion.div>

          {/* 3D Canvas */}
          <Canvas
            shadows
            camera={{ position: [3, 2, 3], fov: 35 }}
            gl={{ 
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              outputColorSpace: THREE.SRGBColorSpace
            }}
          >
            <color attach="background" args={['#0a0a0a']} />
            <fog attach="fog" args={['#0a0a0a', 5, 20]} />
            
            <Suspense fallback={null}>
              <CameraController preset={cameraPreset} />
              
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <spotLight
                position={[10, 10, 10]}
                angle={0.3}
                penumbra={1}
                intensity={lightingMode === 'studio' ? 2 : 1}
                castShadow
                shadow-mapSize={[2048, 2048]}
              />
              <spotLight
                position={[-10, 5, 5]}
                angle={0.4}
                penumbra={1}
                intensity={1}
                color="#4080ff"
              />
              {lightingMode === 'dramatic' && (
                <spotLight
                  position={[0, 10, -10]}
                  angle={0.5}
                  penumbra={1}
                  intensity={1.5}
                  color="#ff6040"
                />
              )}
              
              <Environment preset={lightingMode === 'studio' ? 'studio' : 'sunset'} />
              
              {/* Ground */}
              <ContactShadows
                opacity={0.6}
                scale={10}
                blur={2}
                far={4}
                resolution={256}
                color="#000000"
              />
              
              {/* Product */}
              <Center>
                <ProductModel config={productConfig} selectedProduct={selectedProduct} />
              </Center>
              
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={!productConfig.autoRotate}
                minDistance={2}
                maxDistance={8}
                autoRotate={productConfig.autoRotate}
                autoRotateSpeed={0.5}
              />
            </Suspense>
          </Canvas>

          {/* Demo Presets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 z-10"
          >
            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4">
              <h3 className="text-white text-sm font-semibold mb-2">Quick Demos</h3>
              <div className="flex gap-2">
                {Object.entries(demoPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyDemoPreset(key)}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <span>{preset.icon}</span>
                    <span className="hidden sm:inline">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Nike-Style Customization Panel */}
        {!isFullscreen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            className="w-2/5 bg-white shadow-2xl overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <h2 className="text-2xl font-bold mb-2">Customize</h2>
                <p className="opacity-90">Design your perfect piece</p>
              </div>

              {/* Steps */}
              <div className="px-6 py-4 border-b">
                <div className="flex justify-between">
                  {customizationSteps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(index)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        currentStep === index
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <step.icon size={16} />
                      <span className="font-medium text-sm">{step.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key="material"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold">Choose Material</h3>
                      <div className="space-y-3">
                        {materials.map(material => (
                          <button
                            key={material.id}
                            onClick={() => updateConfig({ material: material.id })}
                            className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                              productConfig.material === material.id
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-full"
                                style={{ backgroundColor: material.color }}
                              />
                              <div>
                                <h4 className="font-semibold">{material.name}</h4>
                                <p className="text-sm text-gray-600">{material.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      key="colors"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold">Choose Colors</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3">Color Palettes</h4>
                          <div className="space-y-2">
                            {colorPalettes.map(palette => (
                              <button
                                key={palette.name}
                                onClick={() => updateConfig({ 
                                  beadColors: palette.colors,
                                  color: palette.colors[0],
                                  bandColor: palette.colors[0],
                                  charmColor: palette.colors[1]
                                })}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-purple-600 transition-all"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium">{palette.name}</h5>
                                </div>
                                <div className="flex gap-1">
                                  {palette.colors.map((color, i) => (
                                    <div
                                      key={i}
                                      className="flex-1 h-4 rounded"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="personalize"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold">Add Text</h3>
                      <div>
                        <label className="block font-medium mb-2">Personalization</label>
                        <input
                          type="text"
                          value={productConfig.text}
                          onChange={(e) => updateConfig({ text: e.target.value })}
                          placeholder="Enter text (e.g., LOVE, HOPE)"
                          maxLength={8}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 transition-all"
                        />
                        <p className="text-sm text-gray-500 mt-1">{productConfig.text.length}/8 characters</p>
                      </div>
                      
                      <div>
                        <label className="block font-medium mb-2">Text Color</label>
                        <div className="flex gap-2">
                          {['#000000', '#FFFFFF', '#FFD700'].map(color => (
                            <button
                              key={color}
                              onClick={() => updateConfig({ textColor: color })}
                              className={`w-12 h-12 rounded-lg border-4 transition-all ${
                                productConfig.textColor === color ? 'border-purple-600' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold">Review & Order</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold">Your Design</h4>
                          <p className="text-sm text-gray-600">Material: {productConfig.material}</p>
                          <p className="text-sm text-gray-600">Text: {productConfig.text || 'None'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-purple-800">
                    ${productConfig.basePrice + (productConfig.text ? 10 : 0)}
                  </span>
                  <span className="text-sm text-gray-500">Free shipping</span>
                </div>
                
                <div className="flex gap-3">
                  <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    <FaHeart />
                    Save
                  </button>
                  <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    <FaShare />
                    Share
                  </button>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-3 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                >
                  <FaShoppingCart />
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NikeStyleProductCustomizer;