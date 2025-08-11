import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

const ToteBagModel = ({ config }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  
  const bagGeometry = {
    width: config.size === 'small' ? 2.5 : config.size === 'large' ? 3.5 : 3,
    height: config.size === 'small' ? 3.5 : config.size === 'large' ? 4.5 : 4,
    depth: config.size === 'small' ? 0.6 : config.size === 'large' ? 1 : 0.8
  };
  
  const getMaterialProps = () => {
    const baseProps = {
      color: config.color,
      roughness: 0.9,
      metalness: 0
    };
    
    switch (config.material) {
      case 'leather':
        return { ...baseProps, roughness: 0.7, metalness: 0.1 };
      case 'denim':
        return { ...baseProps, roughness: 0.95 };
      case 'organic':
        return { ...baseProps, roughness: 0.85 };
      default:
        return baseProps;
    }
  };
  
  return (
    <group 
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main bag body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[bagGeometry.width, bagGeometry.height, bagGeometry.depth]} />
        <meshStandardMaterial {...getMaterialProps()} />
      </mesh>
      
      {/* Handle */}
      <mesh position={[0, bagGeometry.height/2 + 0.4, 0]} castShadow>
        <torusGeometry args={[bagGeometry.width * 0.4, 0.1, 8, 32, Math.PI]} />
        <meshStandardMaterial color={config.handleColor || config.color} />
      </mesh>
      
      {/* Side panels for depth effect */}
      <mesh position={[bagGeometry.width/2 - 0.05, 0, 0]} castShadow>
        <boxGeometry args={[0.1, bagGeometry.height * 0.9, bagGeometry.depth * 0.9]} />
        <meshStandardMaterial color={new THREE.Color(config.color).multiplyScalar(0.8)} />
      </mesh>
      <mesh position={[-bagGeometry.width/2 + 0.05, 0, 0]} castShadow>
        <boxGeometry args={[0.1, bagGeometry.height * 0.9, bagGeometry.depth * 0.9]} />
        <meshStandardMaterial color={new THREE.Color(config.color).multiplyScalar(0.8)} />
      </mesh>
      
      {/* Text */}
      {config.text && (
        <Text
          position={[0, 0, bagGeometry.depth/2 + 0.01]}
          fontSize={0.3}
          color={config.textColor || '#FFFFFF'}
          anchorX="center"
          anchorY="middle"
        >
          {config.text}
        </Text>
      )}
      
      {/* Logo placeholder */}
      {config.logo && (
        <mesh position={[0, bagGeometry.height * 0.2, bagGeometry.depth/2 + 0.01]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#666666"
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      
      {/* Pattern overlay */}
      {config.pattern && (
        <mesh position={[0, 0, bagGeometry.depth/2 + 0.005]}>
          <planeGeometry args={[bagGeometry.width * 0.9, bagGeometry.height * 0.9]} />
          <meshBasicMaterial
            color="#999999"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};

const Product3DViewer = ({ config, cameraPosition = [5, 5, 5], enableZoom = true, enableRotate = true, enablePan = false }) => {
  const [error, setError] = useState(false);
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#f3f4f6');
        }}
      >
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[10, 10, 5]}
          intensity={1}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={<Box args={[1, 1, 1]} />}>
          <ToteBagModel config={config} />
        </Suspense>
        
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.4}
          scale={10}
          blur={2.5}
          far={10}
          resolution={256}
          color="#000000"
        />
        
        <Environment preset="studio" />
        
        <OrbitControls
          enableZoom={enableZoom}
          enablePan={enablePan}
          enableRotate={enableRotate}
          minDistance={3}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2}
          autoRotate={config.autoRotate}
          autoRotateSpeed={1}
        />
      </Canvas>
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-red-600">Error loading 3D model</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-black text-white rounded"
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product3DViewer;