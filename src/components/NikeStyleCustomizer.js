import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  Text3D,
  Center,
  Float,
  MeshReflectorMaterial,
  SpotLight,
  useTexture,
  Backdrop,
  Stage,
  PresentationControls,
  AccumulativeShadows,
  RandomizedLight,
  softShadows,
  BakeShadows,
  meshBounds,
  useCursor,
  Html,
  Preload
} from '@react-three/drei';
import { useSpring, animated, config } from '@react-spring/three';
import { useGesture } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ChromePicker, HuePicker, AlphaPicker } from 'react-color';
import { 
  FaPalette, FaGem, FaFont, FaImage, FaRuler, FaPaintBrush, 
  FaDownload, FaShare, FaShoppingCart, FaExpand, FaCompress, 
  FaCamera, FaUndo, FaRedo, FaMagic, FaHeart, FaTimes, 
  FaBars, FaCircle, FaSquare, FaStar, FaPlay, FaPause,
  FaVolumeUp, FaVolumeMute, FaEye, FaEyeSlash, FaCog,
  FaRocket, FaLightbulb, FaGlobe, FaLayerGroup
} from 'react-icons/fa';
import * as THREE from 'three';
import { create } from 'zustand';

// Enable soft shadows
softShadows();

// Zustand store for global state
const useStore = create((set, get) => ({
  // Camera states
  cameraPosition: [0, 0, 6],
  cameraTarget: [0, 0, 0],
  
  // Animation states
  isAnimating: false,
  animationSpeed: 1,
  
  // UI states
  showExplodedView: false,
  showWireframe: false,
  showMaterials: true,
  showEnvironment: true,
  
  // Interaction states
  selectedPart: null,
  hoverPart: null,
  
  // Actions
  setCameraPosition: (pos) => set({ cameraPosition: pos }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setIsAnimating: (animating) => set({ isAnimating: animating }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  toggleExplodedView: () => set((state) => ({ showExplodedView: !state.showExplodedView })),
  toggleWireframe: () => set((state) => ({ showWireframe: !state.showWireframe })),
  toggleMaterials: () => set((state) => ({ showMaterials: !state.showMaterials })),
  toggleEnvironment: () => set((state) => ({ showEnvironment: !state.showEnvironment })),
  setSelectedPart: (part) => set({ selectedPart: part }),
  setHoverPart: (part) => set({ hoverPart: part }),
}));

// Advanced Material System
const AdvancedMaterial = ({ 
  color = '#FFD700', 
  material = 'gold', 
  roughness = 0.1, 
  metalness = 0.9,
  clearcoat = 0,
  transmission = 0,
  thickness = 0,
  ior = 1.5,
  envMapIntensity = 1,
  animated = false
}) => {
  const materialRef = useRef();
  const { showWireframe, showMaterials } = useStore();
  
  // Animate material properties
  const { animatedRoughness, animatedMetalness } = useSpring({
    animatedRoughness: animated ? roughness + Math.sin(Date.now() * 0.001) * 0.1 : roughness,
    animatedMetalness: animated ? metalness + Math.sin(Date.now() * 0.001) * 0.05 : metalness,
    config: config.gentle,
  });

  const materialProps = {
    gold: { color: '#FFD700', metalness: 0.9, roughness: 0.1, envMapIntensity: 1.5 },
    silver: { color: '#C0C0C0', metalness: 0.95, roughness: 0.05, envMapIntensity: 2 },
    'rose-gold': { color: '#B76E79', metalness: 0.85, roughness: 0.15, envMapIntensity: 1.3 },
    platinum: { color: '#E5E4E2', metalness: 0.98, roughness: 0.02, envMapIntensity: 2.2 },
    titanium: { color: '#878681', metalness: 0.8, roughness: 0.3, envMapIntensity: 1.2 },
    ceramic: { color: '#FFFFFF', metalness: 0.1, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0 },
    crystal: { transmission: 0.9, thickness: 0.5, roughness: 0, metalness: 0, ior: 2.4 },
    pearl: { color: '#F8F6F0', metalness: 0.1, roughness: 0.1, clearcoat: 0.8, iridescence: 1 },
  };

  const props = materialProps[material] || materialProps.gold;

  if (showWireframe) {
    return <meshBasicMaterial color={color} wireframe />;
  }

  if (!showMaterials) {
    return <meshBasicMaterial color={color} />;
  }

  if (props.transmission > 0) {
    return (
      <meshPhysicalMaterial
        ref={materialRef}
        color={color}
        transmission={props.transmission}
        thickness={props.thickness}
        roughness={roughness}
        metalness={0}
        ior={props.ior}
        envMapIntensity={envMapIntensity}
        clearcoat={clearcoat}
        clearcoatRoughness={0.1}
      />
    );
  }

  return (
    <animated.meshStandardMaterial
      ref={materialRef}
      color={color}
      metalness={animatedMetalness}
      roughness={animatedRoughness}
      envMapIntensity={envMapIntensity}
      clearcoat={clearcoat}
      clearcoatRoughness={0.1}
    />
  );
};

// Interactive Part Component
const InteractivePart = ({ 
  children, 
  partName, 
  position = [0, 0, 0], 
  scale = 1,
  onClick,
  explodedOffset = [0, 0, 0],
  ...props 
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { showExplodedView, selectedPart, hoverPart, setSelectedPart, setHoverPart } = useStore();
  
  useCursor(hovered);

  // Spring animation for position and scale
  const { animatedPosition, animatedScale } = useSpring({
    animatedPosition: showExplodedView 
      ? [position[0] + explodedOffset[0], position[1] + explodedOffset[1], position[2] + explodedOffset[2]]
      : position,
    animatedScale: hovered ? scale * 1.05 : selectedPart === partName ? scale * 1.1 : scale,
    config: config.wobbly,
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedPart(selectedPart === partName ? null : partName);
    onClick?.(partName);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    setHoverPart(partName);
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoverPart(null);
  };

  return (
    <animated.group
      ref={meshRef}
      position={animatedPosition}
      scale={animatedScale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      {...props}
    >
      {children}
      
      {/* Part label */}
      {hovered && (
        <Html position={[0, 1, 0]} center>
          <div className="bg-black text-white px-2 py-1 rounded text-sm pointer-events-none">
            {partName}
          </div>
        </Html>
      )}
    </animated.group>
  );
};

// Advanced Nike-Style Bracelet
const NikeBracelet = ({ config }) => {
  const groupRef = useRef();
  const { isAnimating, animationSpeed } = useStore();
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      if (config.autoRotate || isAnimating) {
        groupRef.current.rotation.y += delta * animationSpeed;
      }
      
      // Floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const beadCount = config.size === 'small' ? 10 : config.size === 'large' ? 16 : 12;
  const radius = config.size === 'small' ? 1.1 : config.size === 'large' ? 1.5 : 1.3;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Main band with segments */}
        <InteractivePart 
          partName="Band" 
          explodedOffset={[0, 0, -0.5]}
          onClick={() => console.log('Band clicked')}
        >
          <mesh castShadow receiveShadow>
            <torusGeometry args={[radius, 0.08, 32, 100]} />
            <AdvancedMaterial 
              color={config.color} 
              material={config.material}
              animated={isAnimating}
            />
          </mesh>
        </InteractivePart>

        {/* Individual beads */}
        {Array.from({ length: beadCount }).map((_, i) => {
          const angle = (i / beadCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const beadColor = config.beadColors?.[i % config.beadColors.length] || config.color;
          
          return (
            <InteractivePart
              key={i}
              partName={`Bead ${i + 1}`}
              position={[x, 0, z]}
              explodedOffset={[Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5]}
              onClick={(part) => console.log(`${part} clicked`)}
            >
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.15, 64, 64]} />
                <AdvancedMaterial 
                  color={beadColor}
                  material={config.beadMaterial || 'crystal'}
                  roughness={0.1}
                  transmission={0.8}
                  thickness={0.5}
                />
              </mesh>
              
              {/* Inner glow */}
              <mesh scale={0.8}>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshBasicMaterial 
                  color={beadColor} 
                  transparent 
                  opacity={0.3}
                />
              </mesh>
            </InteractivePart>
          );
        })}

        {/* Custom charm with 3D text */}
        {config.text && (
          <InteractivePart
            partName="Charm"
            position={[0, -radius - 0.6, 0]}
            explodedOffset={[0, -1, 0]}
            onClick={() => console.log('Charm clicked')}
          >
            <group>
              {/* Charm base */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1, 0.6, 0.15]} />
                <AdvancedMaterial 
                  color={config.charmColor || config.color}
                  material={config.material}
                  clearcoat={1}
                />
              </mesh>
              
              {/* 3D Text */}
              <Suspense fallback={null}>
                <Center>
                  <Text3D
                    font="/fonts/Inter_Bold.json"
                    size={0.15}
                    height={0.05}
                    curveSegments={32}
                    bevelEnabled
                    bevelThickness={0.01}
                    bevelSize={0.01}
                    bevelOffset={0}
                    bevelSegments={8}
                    position={[0, 0, 0.1]}
                  >
                    {config.text}
                    <AdvancedMaterial 
                      color={config.textColor || '#000000'}
                      material="ceramic"
                    />
                  </Text3D>
                </Center>
              </Suspense>
              
              {/* Connecting ring */}
              <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.1, 0.02, 16, 32]} />
                <AdvancedMaterial 
                  color={config.color}
                  material={config.material}
                />
              </mesh>
            </group>
          </InteractivePart>
        )}
      </group>
    </Float>
  );
};

// Advanced Nike-Style Necklace
const NikeNecklace = ({ config }) => {
  const groupRef = useRef();
  const { isAnimating, animationSpeed } = useStore();
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      if (config.autoRotate || isAnimating) {
        groupRef.current.rotation.y += delta * animationSpeed * 0.5;
      }
    }
  });

  // Advanced chain generation
  const createChainSegments = () => {
    const segments = [];
    const linkCount = 50;
    
    for (let i = 0; i < linkCount; i++) {
      const t = i / (linkCount - 1);
      const angle = Math.PI * t - Math.PI / 2;
      const x = Math.sin(angle) * 2.2;
      const y = -Math.cos(angle) * 2.2 + 2.2;
      const rotation = [0, 0, i % 2 === 0 ? 0 : Math.PI / 2];
      
      segments.push(
        <InteractivePart
          key={i}
          partName={`Chain Link ${i + 1}`}
          position={[x, y, 0]}
          explodedOffset={[Math.sin(angle) * 0.3, -Math.cos(angle) * 0.3, 0]}
          scale={0.8}
        >
          <mesh rotation={rotation} castShadow receiveShadow>
            <torusGeometry args={[0.06, 0.02, 16, 32]} />
            <AdvancedMaterial 
              color={config.chainColor || config.color}
              material={config.material}
            />
          </mesh>
        </InteractivePart>
      );
    }
    
    return segments;
  };

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Chain segments */}
        {createChainSegments()}
        
        {/* Advanced pendant */}
        <InteractivePart
          partName="Pendant"
          position={[0, -2.5, 0]}
          explodedOffset={[0, -1, 0]}
          onClick={() => console.log('Pendant clicked')}
        >
          <group>
            {/* Pendant body */}
            <mesh castShadow receiveShadow>
              {config.pendantShape === 'heart' ? (
                <sphereGeometry args={[0.4, 64, 64]} />
              ) : config.pendantShape === 'square' ? (
                <boxGeometry args={[0.7, 0.7, 0.2]} />
              ) : config.pendantShape === 'star' ? (
                <sphereGeometry args={[0.4, 64, 64]} />
              ) : (
                <sphereGeometry args={[0.4, 64, 64]} />
              )}
              <AdvancedMaterial 
                color={config.color}
                material={config.material}
                clearcoat={1}
                envMapIntensity={2}
              />
            </mesh>
            
            {/* Pendant inner light */}
            <mesh scale={0.8}>
              <sphereGeometry args={[0.4, 32, 32]} />
              <meshBasicMaterial 
                color={config.color} 
                transparent 
                opacity={0.2}
              />
            </mesh>
            
            {/* 3D engraved text */}
            {config.text && (
              <Suspense fallback={null}>
                <Center>
                  <Text3D
                    font="/fonts/Inter_Bold.json"
                    size={0.1}
                    height={0.02}
                    position={[0, 0, 0.21]}
                  >
                    {config.text}
                    <AdvancedMaterial 
                      color={config.textColor || '#000000'}
                      material="ceramic"
                    />
                  </Text3D>
                </Center>
              </Suspense>
            )}
          </group>
        </InteractivePart>
      </group>
    </Float>
  );
};

// Professional Lighting System
const ProfessionalLighting = () => {
  const { showEnvironment } = useStore();
  
  return (
    <Suspense fallback={null}>
      {/* Key Light */}
      <SpotLight
        position={[10, 10, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0001}
      />
      
      {/* Fill Light */}
      <SpotLight
        position={[-10, 5, 5]}
        angle={0.4}
        penumbra={1}
        intensity={1}
        color="#4080ff"
      />
      
      {/* Rim Light */}
      <SpotLight
        position={[0, 10, -10]}
        angle={0.5}
        penumbra={1}
        intensity={1.5}
        color="#ff6040"
      />
      
      {/* Ambient Light */}
      <ambientLight intensity={0.2} />
      
      {/* Environment Map */}
      {showEnvironment && (
        <Environment 
          preset="studio" 
          resolution={512}
          background
          blur={0.8}
        />
      )}
    </Suspense>
  );
};

// Advanced Stage Setup
const NikeStage = ({ children }) => {
  return (
    <Suspense fallback={null}>
      {/* Reflective Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <circleGeometry args={[5, 128]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={0.1}
          depthScale={1}
          minDepthThreshold={0.9}
          maxDepthThreshold={1}
          color="#050505"
          metalness={0.8}
        />
      </mesh>
      
      {/* Backdrop */}
      <Backdrop
        receiveShadow
        scale={[30, 20, 10]}
        floor={10}
        position={[0, -3, -15]}
      >
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </Backdrop>
      
      {/* Volumetric Lighting */}
      <AccumulativeShadows
        temporal
        frames={60}
        alphaTest={0.9}
        scale={25}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -2.99, 0]}
      >
        <RandomizedLight
          amount={8}
          radius={10}
          intensity={1}
          ambient={0.5}
          position={[5, 10, 5]}
        />
      </AccumulativeShadows>
      
      {children}
    </Suspense>
  );
};

// Main Product Renderer
const NikeStyleProduct = ({ config, selectedProduct }) => {
  const productType = selectedProduct?.category === 'necklaces' ? 'necklace' : 'bracelet';
  
  return (
    <Center>
      <group>
        {productType === 'necklace' ? (
          <NikeNecklace config={config} />
        ) : (
          <NikeBracelet config={config} />
        )}
      </group>
    </Center>
  );
};

// Advanced Controls Panel
const AdvancedControls = () => {
  const {
    isAnimating, setIsAnimating,
    animationSpeed, setAnimationSpeed,
    showExplodedView, toggleExplodedView,
    showWireframe, toggleWireframe,
    showMaterials, toggleMaterials,
    showEnvironment, toggleEnvironment,
    selectedPart, hoverPart
  } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white rounded-2xl p-4 space-y-3 min-w-[200px]"
    >
      <h3 className="text-lg font-bold flex items-center gap-2">
        <FaCog /> Advanced Controls
      </h3>
      
      {/* Animation Controls */}
      <div className="space-y-2">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            isAnimating ? 'bg-green-600' : 'bg-gray-700'
          }`}
        >
          {isAnimating ? <FaPause /> : <FaPlay />}
          {isAnimating ? 'Pause' : 'Animate'}
        </button>
        
        <div>
          <label className="text-xs opacity-70">Speed: {animationSpeed.toFixed(1)}x</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* View Controls */}
      <div className="space-y-2 border-t border-gray-600 pt-3">
        <button
          onClick={toggleExplodedView}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            showExplodedView ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          <FaLayerGroup />
          Exploded View
        </button>
        
        <button
          onClick={toggleWireframe}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            showWireframe ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          <FaGlobe />
          Wireframe
        </button>
        
        <button
          onClick={toggleMaterials}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            showMaterials ? 'bg-yellow-600' : 'bg-gray-700'
          }`}
        >
          <FaLightbulb />
          Materials
        </button>
        
        <button
          onClick={toggleEnvironment}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            showEnvironment ? 'bg-cyan-600' : 'bg-gray-700'
          }`}
        >
          <FaGlobe />
          Environment
        </button>
      </div>

      {/* Selection Info */}
      {(selectedPart || hoverPart) && (
        <div className="border-t border-gray-600 pt-3">
          <h4 className="text-sm font-semibold mb-1">
            {selectedPart ? 'Selected:' : 'Hovering:'}
          </h4>
          <p className="text-sm opacity-80">
            {selectedPart || hoverPart}
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Main Nike-Style Customizer
const NikeStyleCustomizer = () => {
  const location = useLocation();
  const selectedProduct = location.state?.product;
  const [currentStep, setCurrentStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  const [productConfig, setProductConfig] = useState({
    type: selectedProduct?.category === 'necklaces' ? 'necklace' : 'bracelet',
    productName: selectedProduct?.name,
    basePrice: selectedProduct?.price || 48,
    size: 'medium',
    material: 'gold',
    color: '#FFD700',
    chainColor: '#FFD700',
    beadColors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    beadMaterial: 'crystal',
    text: '',
    textColor: '#000000',
    charmColor: '#FFD700',
    pendantShape: 'circle',
    autoRotate: true
  });

  const updateConfig = (updates) => {
    setProductConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 flex ${isFullscreen ? 'h-screen' : 'min-h-screen'}`}>
        {/* 3D Viewer */}
        <div className={`${isFullscreen ? 'w-full' : 'w-4/5'} relative`}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white"
          >
            <h1 className="text-2xl font-bold mb-1">
              {selectedProduct?.name || 'Nike-Style Customizer'}
            </h1>
            <p className="text-sm opacity-80">
              Professional 3D Jewelry Designer
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 right-6 z-20 flex gap-2"
          >
            <button
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
            >
              <FaRocket />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </motion.div>

          {/* 3D Canvas */}
          <Canvas
            shadows
            gl={{ 
              preserveDrawingBuffer: true, 
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.25,
              outputEncoding: THREE.sRGBEncoding
            }}
            camera={{ position: [0, 0, 6], fov: 35 }}
            onCreated={({ gl, scene }) => {
              gl.physicallyCorrectLights = true;
              scene.fog = new THREE.Fog('#000000', 10, 50);
            }}
          >
            <color attach="background" args={['#000000']} />
            
            <Suspense 
              fallback={
                <Html center>
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading Nike-Style Experience...</p>
                  </div>
                </Html>
              }
            >
              <NikeStage>
                <ProfessionalLighting />
                <NikeStyleProduct config={productConfig} selectedProduct={selectedProduct} />
              </NikeStage>
            </Suspense>

            <PresentationControls
              enabled={true}
              global={false}
              cursor={true}
              snap={false}
              speed={2}
              zoom={1.2}
              rotation={[0, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
            >
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={12}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2}
                autoRotate={productConfig.autoRotate}
                autoRotateSpeed={1}
              />
            </PresentationControls>
            
            <Preload all />
          </Canvas>

          {/* Advanced Controls */}
          {showAdvancedControls && <AdvancedControls />}
        </div>

        {/* Customization Panel */}
        {!isFullscreen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 30 }}
            className="w-1/5 min-w-[300px] bg-black/80 backdrop-blur-md text-white p-6 overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">Customize</h2>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => updateConfig({ autoRotate: !productConfig.autoRotate })}
                className={`p-3 rounded-lg transition-all ${
                  productConfig.autoRotate ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <FaMagic className="mx-auto mb-1" />
                <div className="text-xs">Auto Spin</div>
              </button>
              <button className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all">
                <FaCamera className="mx-auto mb-1" />
                <div className="text-xs">Screenshot</div>
              </button>
            </div>

            {/* Material Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FaGem /> Material
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['gold', 'silver', 'rose-gold', 'platinum'].map(material => (
                  <button
                    key={material}
                    onClick={() => updateConfig({ 
                      material, 
                      color: material === 'gold' ? '#FFD700' : 
                             material === 'silver' ? '#C0C0C0' :
                             material === 'rose-gold' ? '#B76E79' : '#E5E4E2',
                      chainColor: material === 'gold' ? '#FFD700' : 
                                 material === 'silver' ? '#C0C0C0' :
                                 material === 'rose-gold' ? '#B76E79' : '#E5E4E2'
                    })}
                    className={`p-2 text-xs rounded-lg capitalize transition-all ${
                      productConfig.material === material ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  >
                    {material.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Bead Colors */}
            {productConfig.type === 'bracelet' && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FaPalette /> Bead Colors
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {productConfig.beadColors.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Text Customization */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FaFont /> Personalization
              </h3>
              <input
                type="text"
                value={productConfig.text}
                onChange={(e) => updateConfig({ text: e.target.value })}
                placeholder="Enter text..."
                maxLength={10}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-600 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">{productConfig.text.length}/10</p>
            </div>

            {/* Add to Cart */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <FaShoppingCart />
              Add to Cart - ${productConfig.basePrice + (productConfig.text ? 15 : 0)}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NikeStyleCustomizer;