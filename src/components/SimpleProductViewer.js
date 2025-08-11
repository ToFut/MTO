import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Text, 
  Sphere, 
  Torus, 
  RoundedBox,
  Float,
  Center
} from '@react-three/drei';
import * as THREE from 'three';

// Simple Bracelet Component
const SimpleBracelet = ({ config }) => {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current && config.autoRotate) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  const beadCount = 12;
  const radius = 1.2;
  
  return (
    <group ref={groupRef}>
      {/* Main band */}
      <Torus args={[radius, 0.05, 16, 100]}>
        <meshStandardMaterial 
          color={config.color || '#FFD700'}
          metalness={0.8}
          roughness={0.2}
        />
      </Torus>
      
      {/* Beads */}
      {Array.from({ length: beadCount }).map((_, i) => {
        const angle = (i / beadCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const beadColor = config.beadColors?.[i % config.beadColors.length] || config.color;
        
        return (
          <Sphere 
            key={i}
            args={[0.15, 32, 32]} 
            position={[x, 0, z]}
          >
            <meshStandardMaterial
              color={beadColor}
              metalness={0.7}
              roughness={0.3}
            />
          </Sphere>
        );
      })}
      
      {/* Custom charm */}
      {config.text && (
        <group position={[0, -radius - 0.4, 0]}>
          <RoundedBox args={[0.6, 0.4, 0.1]} radius={0.05}>
            <meshStandardMaterial 
              color={config.charmColor || config.color}
              metalness={0.8}
              roughness={0.2}
            />
          </RoundedBox>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.15}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {config.text}
          </Text>
        </group>
      )}
    </group>
  );
};

// Simple Necklace Component
const SimpleNecklace = ({ config }) => {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current && config.autoRotate) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  // Create chain
  const chainLinks = [];
  const linkCount = 30;
  for (let i = 0; i < linkCount; i++) {
    const t = i / (linkCount - 1);
    const angle = Math.PI * t - Math.PI / 2;
    const x = Math.sin(angle) * 1.5;
    const y = -Math.cos(angle) * 1.5 + 1.5;
    
    chainLinks.push(
      <Torus 
        key={i}
        args={[0.04, 0.01, 8, 16]} 
        position={[x, y, 0]} 
        rotation={[0, 0, i % 2 === 0 ? 0 : Math.PI / 2]}
      >
        <meshStandardMaterial
          color={config.chainColor || '#FFD700'}
          metalness={0.9}
          roughness={0.1}
        />
      </Torus>
    );
  }

  return (
    <group ref={groupRef}>
      {/* Chain */}
      <group>{chainLinks}</group>
      
      {/* Pendant */}
      <group position={[0, -1.8, 0]}>
        {config.pendantShape === 'heart' ? (
          <Sphere args={[0.3, 32, 32]}>
            <meshStandardMaterial 
              color={config.color || '#FFD700'}
              metalness={0.8}
              roughness={0.2}
            />
          </Sphere>
        ) : config.pendantShape === 'square' ? (
          <RoundedBox args={[0.5, 0.5, 0.1]} radius={0.05}>
            <meshStandardMaterial 
              color={config.color || '#FFD700'}
              metalness={0.8}
              roughness={0.2}
            />
          </RoundedBox>
        ) : (
          <Sphere args={[0.3, 32, 32]}>
            <meshStandardMaterial 
              color={config.color || '#FFD700'}
              metalness={0.8}
              roughness={0.2}
            />
          </Sphere>
        )}
        
        {/* Text on pendant */}
        {config.text && (
          <Text
            position={[0, 0, 0.16]}
            fontSize={0.1}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {config.text}
          </Text>
        )}
      </group>
    </group>
  );
};

// Simple Earrings Component
const SimpleEarrings = ({ config }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((earring, i) => {
        if (config.autoRotate) {
          earring.rotation.y = Math.sin(state.clock.elapsedTime + i * Math.PI) * 0.2;
        }
      });
    }
  });

  const EarringPiece = ({ position }) => (
    <group position={position}>
      {/* Hook */}
      <Torus args={[0.1, 0.01, 16, 32]} rotation={[0, 0, Math.PI / 4]} position={[0, 0.1, 0]}>
        <meshStandardMaterial 
          color={config.hookColor || '#FFD700'} 
          metalness={0.9} 
          roughness={0.1} 
        />
      </Torus>
      
      {/* Main element */}
      {config.style === 'hoop' ? (
        <Torus args={[0.3, 0.02, 16, 100]}>
          <meshStandardMaterial 
            color={config.color || '#FFD700'}
            metalness={0.8}
            roughness={0.2}
          />
        </Torus>
      ) : (
        <Sphere args={[0.15, 32, 32]} position={[0, -0.2, 0]}>
          <meshStandardMaterial 
            color={config.color || '#FFD700'}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
      )}
    </group>
  );

  return (
    <group ref={groupRef}>
      <EarringPiece position={[-0.6, 0, 0]} />
      <EarringPiece position={[0.6, 0, 0]} />
    </group>
  );
};

// Simple Phone Case Component
const SimplePhoneCase = ({ config }) => {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current && config.autoRotate) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Case body */}
      <RoundedBox args={[1.5, 3, 0.2]} radius={0.1}>
        <meshStandardMaterial
          color={config.color || '#FFB6C1'}
          roughness={0.4}
        />
      </RoundedBox>
      
      {/* Camera cutout */}
      <RoundedBox args={[0.3, 0.3, 0.25]} radius={0.05} position={[0.4, 1.2, 0]}>
        <meshStandardMaterial color="#000000" />
      </RoundedBox>
      
      {/* Custom text */}
      {config.text && (
        <Text
          position={[0, -0.5, 0.11]}
          fontSize={0.2}
          color={config.textColor || "#FFFFFF"}
          anchorX="center"
          anchorY="middle"
        >
          {config.text}
        </Text>
      )}
    </group>
  );
};

// Main Product Selector
const ProductModel = ({ config, selectedProduct }) => {
  const getProductType = () => {
    if (selectedProduct) {
      if (selectedProduct.category === 'bracelets') return 'bracelet';
      if (selectedProduct.category === 'necklaces') return 'necklace';
      if (selectedProduct.category === 'earrings') return 'earrings';
      if (selectedProduct.category === 'accessories') return 'phone-case';
    }
    return config.type || 'bracelet';
  };

  const productType = getProductType();

  switch (productType) {
    case 'necklace':
      return <SimpleNecklace config={config} />;
    case 'earrings':
      return <SimpleEarrings config={config} />;
    case 'phone-case':
      return <SimplePhoneCase config={config} />;
    default:
      return <SimpleBracelet config={config} />;
  }
};

// Main Viewer Component
const SimpleProductViewer = ({ config, selectedProduct }) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-purple-100 to-pink-100">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 50 }}
      >
        <color attach="background" args={['#f8f9fa']} />
        
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          
          {/* Product */}
          <Center>
            <Float speed={1} floatIntensity={0.2}>
              <ProductModel config={config} selectedProduct={selectedProduct} />
            </Float>
          </Center>
          
          {/* Environment */}
          <Environment preset="studio" />
          
          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={8}
            autoRotate={config.autoRotate}
            autoRotateSpeed={1}
          />
        </Suspense>
      </Canvas>
      
      {/* Product Info */}
      {selectedProduct && (
        <div className="absolute top-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h3 className="font-semibold text-lg text-gray-800">
              {selectedProduct.name}
            </h3>
            <p className="text-sm text-gray-600">
              ${selectedProduct.price}
            </p>
          </div>
        </div>
      )}
      
      {/* Controls hint */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <p className="text-xs text-gray-600">
            Drag to rotate • Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleProductViewer;