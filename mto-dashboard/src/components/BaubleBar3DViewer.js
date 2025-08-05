import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text, Box, Sphere, Torus, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// Jewelry Chain Component
const JewelryChain = ({ length = 2, color = "#FFD700" }) => {
  const chainRef = useRef();
  
  return (
    <group ref={chainRef}>
      {Array.from({ length: 20 }).map((_, i) => (
        <Torus
          key={i}
          args={[0.03, 0.01, 8, 16]}
          position={[0, -i * 0.08, 0]}
          rotation={[Math.PI / 2, 0, i % 2 === 0 ? 0 : Math.PI / 2]}
        >
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </Torus>
      ))}
    </group>
  );
};

// Bracelet Component
const Bracelet = ({ config }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  const beadCount = config.size === 'small' ? 8 : config.size === 'large' ? 12 : 10;
  const radius = config.size === 'small' ? 0.8 : config.size === 'large' ? 1.2 : 1;
  
  return (
    <group ref={meshRef}>
      {/* Elastic/Chain Base */}
      <Torus args={[radius, 0.02, 16, 100]}>
        <meshStandardMaterial color={config.chainColor || "#333333"} />
      </Torus>
      
      {/* Beads */}
      {Array.from({ length: beadCount }).map((_, i) => {
        const angle = (i / beadCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <Sphere
            key={i}
            args={[0.15, 32, 32]}
            position={[x, 0, z]}
          >
            <meshStandardMaterial
              color={config.beadColors?.[i % config.beadColors.length] || config.color}
              metalness={config.material === 'metal' ? 0.8 : 0.2}
              roughness={config.material === 'metal' ? 0.2 : 0.5}
            />
          </Sphere>
        );
      })}
      
      {/* Custom Text Charm */}
      {config.text && (
        <group position={[0, -radius - 0.3, 0]}>
          <RoundedBox args={[0.6, 0.3, 0.1]} radius={0.05}>
            <meshStandardMaterial color={config.charmColor || "#FFD700"} metalness={0.8} roughness={0.2} />
          </RoundedBox>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.12}
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

// Necklace Component
const Necklace = ({ config }) => {
  const meshRef = useRef();
  
  return (
    <group ref={meshRef}>
      {/* Chain */}
      <JewelryChain length={2} color={config.chainColor || "#FFD700"} />
      
      {/* Pendant */}
      <group position={[0, -1.8, 0]}>
        {config.pendantShape === 'heart' && (
          <mesh>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color={config.color} metalness={0.8} roughness={0.2} />
          </mesh>
        )}
        {config.pendantShape === 'circle' && (
          <Sphere args={[0.25, 32, 32]}>
            <meshStandardMaterial color={config.color} metalness={0.8} roughness={0.2} />
          </Sphere>
        )}
        {config.pendantShape === 'square' && (
          <RoundedBox args={[0.4, 0.4, 0.1]} radius={0.05}>
            <meshStandardMaterial color={config.color} metalness={0.8} roughness={0.2} />
          </RoundedBox>
        )}
        
        {/* Engraving */}
        {config.text && (
          <Text
            position={[0, 0, 0.11]}
            fontSize={0.08}
            color={config.textColor || "#000000"}
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

// Earrings Component
const Earrings = ({ config }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });
  
  const EarringPiece = ({ position }) => (
    <group position={position}>
      {/* Hook */}
      <Torus args={[0.1, 0.01, 8, 16]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color={config.hookColor || "#FFD700"} metalness={0.9} roughness={0.1} />
      </Torus>
      
      {/* Main element */}
      {config.style === 'stud' && (
        <Sphere args={[0.15, 32, 32]} position={[0, -0.2, 0]}>
          <meshStandardMaterial color={config.color} metalness={0.8} roughness={0.2} />
        </Sphere>
      )}
      {config.style === 'drop' && (
        <>
          <Sphere args={[0.1, 32, 32]} position={[0, -0.3, 0]}>
            <meshStandardMaterial color={config.color} metalness={0.8} roughness={0.2} />
          </Sphere>
          <Sphere args={[0.15, 32, 32]} position={[0, -0.6, 0]}>
            <meshStandardMaterial color={config.color} metalness={0.8} roughness={0.2} />
          </Sphere>
        </>
      )}
      {config.style === 'hoop' && (
        <Torus args={[0.3, 0.02, 16, 100]} position={[0, -0.3, 0]}>
          <meshStandardMaterial color={config.color} metalness={0.8} roughness={0.2} />
        </Torus>
      )}
    </group>
  );
  
  return (
    <group ref={meshRef}>
      <EarringPiece position={[-0.6, 0, 0]} />
      <EarringPiece position={[0.6, 0, 0]} />
    </group>
  );
};

// Phone Case Component
const PhoneCase = ({ config }) => {
  const meshRef = useRef();
  
  return (
    <group ref={meshRef}>
      {/* Case body */}
      <RoundedBox args={[1.5, 3, 0.2]} radius={0.1}>
        <meshStandardMaterial color={config.color} />
      </RoundedBox>
      
      {/* Camera cutout */}
      <Box args={[0.3, 0.3, 0.3]} position={[0.4, 1.2, -0.1]}>
        <meshStandardMaterial color="#000000" />
      </Box>
      
      {/* Pattern/Design */}
      {config.pattern && (
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[1.4, 2.9]} />
          <meshBasicMaterial color={config.patternColor || "#FFFFFF"} transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Custom Text */}
      {config.text && (
        <Text
          position={[0, 0, 0.11]}
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

// Main Product Component Selector
const BaubleBarProduct = ({ config }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current && hovered && config.autoRotate) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });
  
  const renderProduct = () => {
    switch (config.type) {
      case 'bracelet':
        return <Bracelet config={config} />;
      case 'necklace':
        return <Necklace config={config} />;
      case 'earrings':
        return <Earrings config={config} />;
      case 'phone-case':
        return <PhoneCase config={config} />;
      default:
        return <Bracelet config={config} />;
    }
  };
  
  return (
    <group 
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {renderProduct()}
    </group>
  );
};

const BaubleBar3DViewer = ({ config, cameraPosition = [0, 0, 5], enableZoom = true, enableRotate = true, enablePan = false }) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-pink-50 to-purple-50">
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#fdf2f8');
        }}
      >
        <PerspectiveCamera makeDefault position={cameraPosition} fov={40} />
        <ambientLight intensity={0.6} />
        <directionalLight
          castShadow
          position={[10, 10, 5]}
          intensity={0.8}
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        <spotLight
          position={[0, 5, 0]}
          intensity={0.4}
          angle={0.5}
          penumbra={1}
        />
        
        <Suspense fallback={
          <Box args={[1, 1, 1]}>
            <meshStandardMaterial color="#ff69b4" />
          </Box>
        }>
          <BaubleBarProduct config={config} />
        </Suspense>
        
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.3}
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
          minDistance={2}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2}
          autoRotate={config.autoRotate}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
};

export default BaubleBar3DViewer;