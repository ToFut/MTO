import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  Text, 
  Box, 
  Sphere, 
  Torus, 
  RoundedBox,
  MeshReflectorMaterial,
  Float,
  SpotLight,
  Center,
  useTexture,
  Backdrop,
  Lightformer
} from '@react-three/drei';
import * as THREE from 'three';
// Post-processing effects will be added later

// Jewelry Materials
const JewelryMaterial = ({ color, material }) => {
  const materialProps = {
    gold: {
      color: '#FFD700',
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.5
    },
    silver: {
      color: '#C0C0C0',
      metalness: 0.95,
      roughness: 0.05,
      envMapIntensity: 2
    },
    'rose-gold': {
      color: '#B76E79',
      metalness: 0.85,
      roughness: 0.15,
      envMapIntensity: 1.3
    }
  };

  const props = materialProps[material] || materialProps.gold;
  
  return (
    <meshStandardMaterial
      {...props}
      color={color || props.color}
    />
  );
};

// Enhanced Bracelet with realistic beads
const EnhancedBracelet = ({ config }) => {
  const groupRef = useRef();
  const beadsRef = useRef([]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      
      // Animate beads
      beadsRef.current.forEach((bead, i) => {
        if (bead) {
          bead.position.y = Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.02;
        }
      });
    }
  });
  
  const beadCount = config.size === 'small' ? 12 : config.size === 'large' ? 20 : 16;
  const radius = config.size === 'small' ? 1 : config.size === 'large' ? 1.4 : 1.2;
  
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Elastic band */}
        <Torus args={[radius, 0.03, 16, 100]}>
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.8}
            metalness={0.1}
          />
        </Torus>
        
        {/* Beads with realistic materials */}
        {Array.from({ length: beadCount }).map((_, i) => {
          const angle = (i / beadCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const beadColor = config.beadColors?.[i % config.beadColors.length] || config.color;
          
          return (
            <group key={i} position={[x, 0, z]}>
              {/* Main bead */}
              <Sphere 
                ref={el => beadsRef.current[i] = el}
                args={[0.18, 64, 64]}
                castShadow
              >
                <meshPhysicalMaterial
                  color={beadColor}
                  metalness={config.material === 'metal' ? 0.9 : 0.1}
                  roughness={config.material === 'metal' ? 0.1 : 0.3}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  transmission={config.material === 'glass' ? 0.9 : 0}
                  thickness={0.5}
                  envMapIntensity={1.5}
                />
              </Sphere>
              
              {/* Metallic caps */}
              <Sphere args={[0.06, 32, 32]} position={[0, 0.18, 0]}>
                <JewelryMaterial material={config.material} />
              </Sphere>
              <Sphere args={[0.06, 32, 32]} position={[0, -0.18, 0]}>
                <JewelryMaterial material={config.material} />
              </Sphere>
            </group>
          );
        })}
        
        {/* Custom charm */}
        {config.text && (
          <Float speed={3} floatIntensity={0.3}>
            <group position={[0, -radius - 0.5, 0]}>
              <RoundedBox args={[0.8, 0.4, 0.15]} radius={0.08} castShadow>
                <JewelryMaterial material={config.material} color={config.charmColor} />
              </RoundedBox>
              <Text
                position={[0, 0, 0.08]}
                fontSize={0.15}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                font="/fonts/Inter-Bold.ttf"
              >
                {config.text}
              </Text>
            </group>
          </Float>
        )}
      </group>
    </Float>
  );
};

// Enhanced Necklace with realistic chain
const EnhancedNecklace = ({ config }) => {
  const chainRef = useRef();
  const pendantRef = useRef();
  
  useFrame((state) => {
    if (pendantRef.current) {
      pendantRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      pendantRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 - 2;
    }
  });
  
  // Create chain links
  const ChainLink = ({ position, rotation }) => (
    <Torus 
      args={[0.05, 0.015, 8, 16]} 
      position={position} 
      rotation={rotation}
      castShadow
    >
      <JewelryMaterial material={config.material} color={config.chainColor} />
    </Torus>
  );
  
  // Generate chain curve
  const chainLinks = [];
  const linkCount = 40;
  for (let i = 0; i < linkCount; i++) {
    const t = i / (linkCount - 1);
    const angle = Math.PI * t - Math.PI / 2;
    const x = Math.sin(angle) * 1.5;
    const y = -Math.cos(angle) * 1.5 + 1.5;
    const rotation = [0, 0, i % 2 === 0 ? 0 : Math.PI / 2];
    
    chainLinks.push(
      <ChainLink 
        key={i} 
        position={[x, y, 0]} 
        rotation={rotation}
      />
    );
  }
  
  // Pendant shapes
  const renderPendant = () => {
    const size = 0.5;
    
    switch (config.pendantShape) {
      case 'heart':
        return (
          <group scale={[size, size, size * 0.3]}>
            <Sphere args={[1, 64, 64]} position={[-0.25, 0, 0]}>
              <JewelryMaterial material={config.material} color={config.color} />
            </Sphere>
            <Sphere args={[1, 64, 64]} position={[0.25, 0, 0]}>
              <JewelryMaterial material={config.material} color={config.color} />
            </Sphere>
            <Box args={[1.2, 1.2, 1]} position={[0, -0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
              <JewelryMaterial material={config.material} color={config.color} />
            </Box>
          </group>
        );
      case 'circle':
        return (
          <Sphere args={[size, 64, 64]} castShadow>
            <meshPhysicalMaterial
              color={config.color}
              metalness={0.9}
              roughness={0.1}
              clearcoat={1}
              clearcoatRoughness={0}
              envMapIntensity={2}
            />
          </Sphere>
        );
      case 'square':
        return (
          <RoundedBox args={[size * 1.5, size * 1.5, size * 0.3]} radius={0.1} castShadow>
            <JewelryMaterial material={config.material} color={config.color} />
          </RoundedBox>
        );
      default:
        return (
          <Sphere args={[size, 64, 64]} castShadow>
            <JewelryMaterial material={config.material} color={config.color} />
          </Sphere>
        );
    }
  };
  
  return (
    <group ref={chainRef}>
      {/* Chain */}
      <group>{chainLinks}</group>
      
      {/* Pendant */}
      <group ref={pendantRef} position={[0, -2, 0]}>
        <Float speed={2} floatIntensity={0.2}>
          {renderPendant()}
          
          {/* Engraving */}
          {config.text && (
            <Text
              position={[0, 0, 0.26]}
              fontSize={0.12}
              color={config.textColor || "#000000"}
              anchorX="center"
              anchorY="middle"
              font="/fonts/Inter-Bold.ttf"
            >
              {config.text}
            </Text>
          )}
          
          {/* Pendant loop */}
          <Torus args={[0.1, 0.02, 16, 32]} position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <JewelryMaterial material={config.material} color={config.chainColor} />
          </Torus>
        </Float>
      </group>
    </group>
  );
};

// Enhanced Earrings with realistic details
const EnhancedEarrings = ({ config }) => {
  const earringsRef = useRef();
  
  useFrame((state) => {
    if (earringsRef.current) {
      earringsRef.current.children.forEach((earring, i) => {
        earring.rotation.y = Math.sin(state.clock.elapsedTime + i * Math.PI) * 0.3;
        earring.position.y = Math.sin(state.clock.elapsedTime * 2 + i * Math.PI) * 0.05;
      });
    }
  });
  
  const EarringPiece = ({ position }) => {
    const renderStyle = () => {
      switch (config.style) {
        case 'stud':
          return (
            <Sphere args={[0.2, 64, 64]} castShadow>
              <meshPhysicalMaterial
                color={config.color}
                metalness={0.9}
                roughness={0.1}
                clearcoat={1}
                clearcoatRoughness={0}
                envMapIntensity={2}
              />
            </Sphere>
          );
        case 'drop':
          return (
            <group>
              <Sphere args={[0.15, 32, 32]} position={[0, 0, 0]} castShadow>
                <JewelryMaterial material={config.material} color={config.color} />
              </Sphere>
              <Box args={[0.05, 0.3, 0.05]} position={[0, -0.25, 0]}>
                <JewelryMaterial material={config.material} color={config.hookColor} />
              </Box>
              <Sphere args={[0.25, 64, 64]} position={[0, -0.6, 0]} castShadow>
                <meshPhysicalMaterial
                  color={config.color}
                  metalness={0.85}
                  roughness={0.15}
                  transmission={0.1}
                  thickness={0.5}
                  clearcoat={1}
                  clearcoatRoughness={0}
                />
              </Sphere>
            </group>
          );
        case 'hoop':
          return (
            <Torus args={[0.4, 0.03, 16, 100]} castShadow>
              <JewelryMaterial material={config.material} color={config.color} />
            </Torus>
          );
        default:
          return (
            <Sphere args={[0.2, 64, 64]} castShadow>
              <JewelryMaterial material={config.material} color={config.color} />
            </Sphere>
          );
      }
    };
    
    return (
      <Float speed={3} floatIntensity={0.3}>
        <group position={position}>
          {/* Hook */}
          <Torus 
            args={[0.12, 0.015, 16, 32]} 
            rotation={[0, 0, Math.PI / 4]}
            position={[0, 0.15, 0]}
          >
            <JewelryMaterial material={config.material} color={config.hookColor} />
          </Torus>
          
          {/* Main element */}
          <group position={[0, -0.1, 0]}>
            {renderStyle()}
          </group>
        </group>
      </Float>
    );
  };
  
  return (
    <group ref={earringsRef}>
      <EarringPiece position={[-0.8, 0, 0]} />
      <EarringPiece position={[0.8, 0, 0]} />
    </group>
  );
};

// Main Enhanced Product Component
const EnhancedProduct = ({ config }) => {
  const renderProduct = () => {
    switch (config.type) {
      case 'bracelet':
        return <EnhancedBracelet config={config} />;
      case 'necklace':
        return <EnhancedNecklace config={config} />;
      case 'earrings':
        return <EnhancedEarrings config={config} />;
      default:
        return <EnhancedBracelet config={config} />;
    }
  };
  
  return (
    <Center>
      {renderProduct()}
    </Center>
  );
};

// Dramatic 3D Stage
const DramaticStage = ({ children }) => {
  return (
    <>
      {/* Main lighting */}
      <ambientLight intensity={0.2} />
      <SpotLight
        position={[5, 10, 5]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <SpotLight
        position={[-5, 10, -5]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
        color="#4080ff"
      />
      
      {/* Rim lights */}
      <pointLight position={[10, 0, -10]} intensity={0.5} color="#ff0080" />
      <pointLight position={[-10, 0, 10]} intensity={0.5} color="#0080ff" />
      
      {/* Display platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <circleGeometry args={[3, 64]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={80}
          roughness={0.1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.8}
        />
      </mesh>
      
      {/* Backdrop */}
      <Backdrop
        receiveShadow
        scale={[20, 10, 5]}
        floor={5}
        position={[0, -2, -8]}
      >
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </Backdrop>
      
      {children}
    </>
  );
};

const Enhanced3DViewer = ({ config }) => {
  return (
    <div className="w-full h-full relative bg-black">
      <Canvas
        shadows
        gl={{ 
          preserveDrawingBuffer: true, 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25
        }}
        camera={{ position: [0, 0, 6], fov: 35 }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 10, 30]} />
        
        <Suspense fallback={null}>
          <DramaticStage>
            <EnhancedProduct config={config} />
          </DramaticStage>
          
          <Environment preset="studio" resolution={256}>
            <Lightformer
              intensity={4}
              rotation-x={Math.PI / 2}
              position={[0, 5, -9]}
              scale={[10, 10, 1]}
            />
            <Lightformer
              intensity={2}
              rotation-y={Math.PI / 2}
              position={[-5, 1, -1]}
              scale={[20, 0.1, 1]}
            />
            <Lightformer
              intensity={2}
              rotation-y={-Math.PI / 2}
              position={[5, 1, -1]}
              scale={[20, 0.1, 1]}
            />
          </Environment>
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate={config.autoRotate}
            autoRotateSpeed={1}
          />
        </Suspense>
        
{/* Post-processing effects will be added later */}
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 text-white">
        <div className="bg-black/50 backdrop-blur-md rounded-lg p-3">
          <p className="text-xs opacity-70">Drag to rotate • Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DViewer;