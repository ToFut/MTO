import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  Center, 
  OrbitControls,
  Text,
  useTexture
} from '@react-three/drei';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { 
  FaMagic, FaCamera, FaEye, FaCube, FaGem, FaSun, FaMoon, FaRocket, FaShoppingCart, FaCompress, FaExpand
} from 'react-icons/fa';

// Professional loading screen
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
    <motion.div 
      className="absolute bottom-1/4 w-64 h-1 bg-purple-900 rounded-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  </div>
);

/*
// Camera controller with smooth animations
const CameraController = ({ preset }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const cameraPositions = {
      front: { pos: [0, 0, 5], target: [0, 0, 0] },
      side: { pos: [5, 0, 0], target: [0, 0, 0] },
      top: { pos: [0, 5, 1], target: [0, 0, 0] },
      detail: { pos: [0, 0, 2.5], target: [0, 0, 0] },
      hero: { pos: [3, 2, 3], target: [0, -0.5, 0] },
      dramatic: { pos: [-3, 3, -3], target: [0, 0, 0] }
    };

    if (preset && cameraPositions[preset]) {
      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(...cameraPositions[preset].pos);
      const startTime = Date.now();
      const duration = 1200;

      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        
        camera.position.lerpVectors(startPos, endPos, eased);
        camera.lookAt(...cameraPositions[preset].target);
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      };
      
      animateCamera();
    }
  }, [preset, camera]);

  return null;
};
*/

// Enhanced Bracelet Component
const EnhancedBracelet = ({ config }) => {
  const meshRef = useRef();
  
  console.log('EnhancedBracelet rendering with config:', config);
  
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
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.text, 128, 48);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [config.text]);

  const beadCount = 12;
  const radius = 1.3;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={meshRef}>
        {/* Main band with enhanced material */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[radius, 0.08, 32, 100]} />
          <meshPhysicalMaterial 
            color={config.color} 
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            reflectivity={1}
            envMapIntensity={2}
          />
        </mesh>

        {/* Enhanced beads with glow */}
        {Array.from({ length: beadCount }).map((_, i) => {
          const angle = (i / beadCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const beadColor = config.beadColors?.[i % config.beadColors.length] || config.color;
          
          return (
            <group key={i} position={[x, 0, z]}>
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.15, 64, 64]} />
                <meshPhysicalMaterial 
                  color={beadColor}
                  metalness={0.3}
                  roughness={0}
                  clearcoat={1}
                  clearcoatRoughness={0}
                  transmission={0.6}
                  thickness={0.5}
                  envMapIntensity={3}
                  emissive={beadColor}
                  emissiveIntensity={0.2}
                />
              </mesh>
              {/* Inner glow */}
              <mesh scale={0.9}>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshBasicMaterial 
                  color={beadColor} 
                  transparent 
                  opacity={0.3}
                />
              </mesh>
            </group>
          );
        })}

        {/* Enhanced charm with text */}
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
                envMapIntensity={2}
              />
            </mesh>
            {/* Text on charm */}
            <Center position={[0, 0, 0.21]}>
              <mesh>
                <planeGeometry args={[0.8, 0.3]} />
                <meshBasicMaterial transparent opacity={0} map={textTexture} />
              </mesh>
            </Center>
          </group>
        )}
      </group>
    </Float>
  );
};



// Main Enhanced Customizer Component
const EnhancedProductCustomizer = () => {
  const location = useLocation();
  const selectedProduct = location.state?.product;
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('hero');
  const [lightingMode, setLightingMode] = useState('studio');
  const [showEffects, setShowEffects] = useState(true);
  const [config, setConfig] = useState({
    color: '#FFD700',
    beadColors: ['#FFD700', '#FFF8DC', '#FFFACD', '#FFFFFF'],
    autoRotate: true,
    text: 'CUSTOM',
    charmColor: '#C0C0C0'
  });
  
  const [productName] = useState(selectedProduct?.name || 'Custom Bracelet');

  const updateConfig = (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 2000);
  }, []);





  const takeScreenshot = () => {
    // Use a more specific selector to get the Three.js canvas
    const canvas = document.querySelector('canvas[data-engine="three.js"]') || document.querySelector('canvas');
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

  if (loading) return <LoadingScreen />;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* 3D Viewer Section */}
      <div className="flex h-screen">
        <div className={`${isFullscreen ? 'w-full' : 'w-3/5'} relative`}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md rounded-2xl p-4 text-white"
          >
            <h1 className="text-2xl font-bold mb-1">{productName}</h1>
            <p className="text-sm opacity-80">Interactive 3D Customization</p>
          </motion.div>

          {/* Camera Presets */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 z-10 flex flex-col gap-2"
          >
            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-2 flex flex-col gap-2">
              <button
                onClick={() => setCameraPreset('front')}
                className={`p-2 rounded-lg text-white transition-all ${cameraPreset === 'front' ? 'bg-purple-600' : 'hover:bg-white/20'}`}
                title="Front View"
              >
                <FaEye />
              </button>
              <button
                onClick={() => setCameraPreset('side')}
                className={`p-2 rounded-lg text-white transition-all ${cameraPreset === 'side' ? 'bg-purple-600' : 'hover:bg-white/20'}`}
                title="Side View"
              >
                <FaCube />
              </button>
              <button
                onClick={() => setCameraPreset('top')}
                className={`p-2 rounded-lg text-white transition-all ${cameraPreset === 'top' ? 'bg-purple-600' : 'hover:bg-white/20'}`}
                title="Top View"
              >
                <FaGem />
              </button>
              <button
                onClick={() => setCameraPreset('detail')}
                className={`p-2 rounded-lg text-white transition-all ${cameraPreset === 'detail' ? 'bg-purple-600' : 'hover:bg-white/20'}`}
                title="Detail View"
              >
                <FaCamera />
              </button>
              <button
                onClick={() => setCameraPreset('hero')}
                className={`p-2 rounded-lg text-white transition-all ${cameraPreset === 'hero' ? 'bg-purple-600' : 'hover:bg-white/20'}`}
                title="Hero View"
              >
                <FaRocket />
              </button>
            </div>
            
            {/* Additional Controls */}
            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-2 flex flex-col gap-2 mt-2">
              <button
                onClick={() => setShowEffects(!showEffects)}
                className={`p-2 rounded-lg text-white transition-all ${showEffects ? 'bg-green-600' : 'hover:bg-white/20'}`}
                title="Toggle Effects"
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
                title="Take Screenshot"
              >
                <FaCamera />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg text-white hover:bg-white/20 transition-all"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </motion.div>

          {/* 3D Canvas */}
          <Canvas
            camera={{ position: [3, 2, 3], fov: 50 }}
          >
            <color attach="background" args={['#0a0a0a']} />
            
            {/* Basic lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {/* Test cube to verify canvas is working */}
            <mesh position={[2, 0, 0]}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="red" />
            </mesh>
            
            {/* The actual bracelet */}
            <Suspense fallback={
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="orange" />
              </mesh>
            }>
              <EnhancedBracelet config={config} />
            </Suspense>
            
            <OrbitControls />
          </Canvas>


        </div>

        {/* Customization Panel */}
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-2/5 bg-white p-6 overflow-y-auto"
          >
            {/* Bead Colors */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Bead Color Palette</h3>
              <div className="space-y-2">
                <button
                  onClick={() => updateConfig({ beadColors: ['#FFD700', '#FFF8DC', '#FFFACD', '#FFFFFF'] })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-purple-600 transition-all"
                >
                  <div className="flex gap-1 mb-2">
                    {['#FFD700', '#FFF8DC', '#FFFACD', '#FFFFFF'].map((color, i) => (
                      <div key={i} className="flex-1 h-4 rounded" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className="text-sm">Classic Gold</p>
                </button>
                <button
                  onClick={() => updateConfig({ beadColors: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFE4E1'] })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-purple-600 transition-all"
                >
                  <div className="flex gap-1 mb-2">
                    {['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFE4E1'].map((color, i) => (
                      <div key={i} className="flex-1 h-4 rounded" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className="text-sm">Rose Garden</p>
                </button>
                <button
                  onClick={() => updateConfig({ beadColors: ['#4169E1', '#87CEEB', '#B0E0E6', '#F0F8FF'] })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-purple-600 transition-all"
                >
                  <div className="flex gap-1 mb-2">
                    {['#4169E1', '#87CEEB', '#B0E0E6', '#F0F8FF'].map((color, i) => (
                      <div key={i} className="flex-1 h-4 rounded" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className="text-sm">Ocean Blue</p>
                </button>
              </div>
            </div>

            {/* Band Color */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Band Material</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateConfig({ color: '#FFD700' })}
                  className="p-3 border-2 border-gray-200 rounded-lg hover:border-purple-600 transition-all"
                >
                  <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: '#FFD700' }}></div>
                  <p className="text-xs">Gold</p>
                </button>
                <button
                  onClick={() => updateConfig({ color: '#C0C0C0' })}
                  className="p-3 border-2 border-gray-200 rounded-lg hover:border-purple-600 transition-all"
                >
                  <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: '#C0C0C0' }}></div>
                  <p className="text-xs">Silver</p>
                </button>
                <button
                  onClick={() => updateConfig({ color: '#B87333' })}
                  className="p-3 border-2 border-gray-200 rounded-lg hover:border-purple-600 transition-all"
                >
                  <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: '#B87333' }}></div>
                  <p className="text-xs">Bronze</p>
                </button>
              </div>
            </div>

            {/* Custom Text */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Custom Text</h3>
              <input
                type="text"
                value={config.text}
                onChange={(e) => updateConfig({ text: e.target.value.toUpperCase() })}
                maxLength={8}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                placeholder="Enter text (max 8 chars)"
              />
            </div>

            {/* Animation Control */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Animation</h3>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.autoRotate}
                  onChange={(e) => updateConfig({ autoRotate: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm">Auto-rotate bracelet</span>
              </label>
            </div>

            {/* Add to Cart */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-purple-800">
                  $48
                </span>
                <span className="text-sm text-gray-500">Free shipping</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
              >
                <FaShoppingCart />
                Add to Cart
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProductCustomizer;