import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Text, 
  Sphere, 
  Torus, 
  RoundedBox,
  MeshReflectorMaterial,
  Float,
  SpotLight,
  Center,
  Backdrop,
  Lightformer,
  Cylinder,
  Ring
} from '@react-three/drei';
import * as THREE from 'three';

// Real Product Models based on actual BaubleBar products
const CustomInitialBracelet = ({ config }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={1} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Main chain band */}
        <Torus args={[1.2, 0.04, 16, 100]}>
          <meshStandardMaterial 
            color={config.color || '#FFD700'}
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1.5}
          />
        </Torus>
        
        {/* Initial charm plate */}
        <group position={[0, -1.4, 0]}>
          <RoundedBox args={[0.6, 0.6, 0.08]} radius={0.05} castShadow>
            <meshStandardMaterial
              color={config.color || '#FFD700'}
              metalness={0.9}
              roughness={0.1}
            />
          </RoundedBox>
          
          {/* Engraved initial */}
          {config.text && (
            <Text
              position={[0, 0, 0.05]}
              fontSize={0.3}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              font="/fonts/Inter-Bold.ttf"
            >
              {config.text.charAt(0).toUpperCase()}
            </Text>
          )}
          
          {/* Connecting ring */}
          <Torus args={[0.08, 0.02, 16, 32]} position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color={config.color || '#FFD700'} metalness={0.9} roughness={0.1} />
          </Torus>
        </group>
      </group>
    </Float>
  );
};

const BeadedCharmBracelet = ({ config }) => {
  const groupRef = useRef();
  const beadCount = 14;
  const radius = 1.3;
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Elastic band */}
        <Torus args={[radius, 0.02, 16, 100]}>
          <meshStandardMaterial color="#333333" roughness={0.8} />
        </Torus>
        
        {/* Mixed beads */}
        {Array.from({ length: beadCount }).map((_, i) => {
          const angle = (i / beadCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const beadColor = config.beadColors?.[i % config.beadColors.length] || '#FFD700';
          const isCharm = i % 4 === 0; // Every 4th bead is a charm
          
          return (
            <group key={i} position={[x, 0, z]}>
              {isCharm ? (
                // Charm bead
                <RoundedBox args={[0.25, 0.25, 0.25]} radius={0.05} castShadow>
                  <meshStandardMaterial
                    color={beadColor}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </RoundedBox>
              ) : (
                // Regular bead
                <Sphere args={[0.15, 32, 32]} castShadow>
                  <meshPhysicalMaterial
                    color={beadColor}
                    metalness={0.1}
                    roughness={0.3}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                  />
                </Sphere>
              )}
            </group>
          );
        })}
      </group>
    </Float>
  );
};

const LayeredInitialNecklace = ({ config }) => {
  const chainRef = useRef();
  
  useFrame((state) => {
    if (chainRef.current) {
      chainRef.current.children.forEach((chain, i) => {
        chain.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.1;
      });
    }
  });

  const createChain = (length, yOffset, initialLetter) => {
    const links = [];
    const linkCount = Math.floor(length * 8);
    
    for (let i = 0; i < linkCount; i++) {
      const t = i / (linkCount - 1);
      const angle = Math.PI * t - Math.PI / 2;
      const x = Math.sin(angle) * length;
      const y = -Math.cos(angle) * length + length + yOffset;
      
      links.push(
        <Torus 
          key={i}
          args={[0.03, 0.01, 8, 16]} 
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
      <group>
        {links}
        {/* Initial pendant */}
        <group position={[0, yOffset - length, 0]}>
          <Cylinder args={[0.25, 0.25, 0.05, 32]} castShadow>
            <meshStandardMaterial
              color={config.color || '#FFD700'}
              metalness={0.9}
              roughness={0.1}
            />
          </Cylinder>
          <Text
            position={[0, 0, 0.03]}
            fontSize={0.2}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {initialLetter}
          </Text>
        </group>
      </group>
    );
  };

  return (
    <group ref={chainRef}>
      {/* Three layered chains */}
      {createChain(1.2, 0.5, config.text?.[0] || 'A')}
      {createChain(1.5, 0.2, config.text?.[1] || 'B')}
      {createChain(1.8, -0.1, config.text?.[2] || 'C')}
    </group>
  );
};

const CustomNameNecklace = ({ config }) => {
  const nameRef = useRef();
  
  useFrame((state) => {
    if (nameRef.current) {
      nameRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 - 1.5;
    }
  });

  // Create delicate chain
  const chainLinks = [];
  const linkCount = 50;
  for (let i = 0; i < linkCount; i++) {
    const t = i / (linkCount - 1);
    const angle = Math.PI * t - Math.PI / 2;
    const x = Math.sin(angle) * 2;
    const y = -Math.cos(angle) * 2 + 2;
    
    chainLinks.push(
      <Torus 
        key={i}
        args={[0.025, 0.008, 8, 16]} 
        position={[x, y, 0]} 
        rotation={[0, 0, i % 2 === 0 ? 0 : Math.PI / 2]}
      >
        <meshStandardMaterial
          color={config.chainColor || '#FFD700'}
          metalness={0.95}
          roughness={0.05}
        />
      </Torus>
    );
  }

  return (
    <group>
      {/* Delicate chain */}
      <group>{chainLinks}</group>
      
      {/* Name plate */}
      <Float speed={2} floatIntensity={0.1}>
        <group ref={nameRef} position={[0, -1.5, 0]}>
          <RoundedBox 
            args={[Math.max(2, (config.text?.length || 4) * 0.3), 0.4, 0.08]} 
            radius={0.04} 
            castShadow
          >
            <meshStandardMaterial
              color={config.color || '#FFD700'}
              metalness={0.9}
              roughness={0.1}
            />
          </RoundedBox>
          
          {/* Custom name */}
          {config.text && (
            <Text
              position={[0, 0, 0.05]}
              fontSize={0.15}
              color={config.textColor || "#000000"}
              anchorX="center"
              anchorY="middle"
              font="/fonts/Inter-Bold.ttf"
            >
              {config.text}
            </Text>
          )}
        </group>
      </Float>
    </group>
  );
};

const MonogramPendant = ({ config }) => {
  const pendantRef = useRef();
  
  useFrame((state) => {
    if (pendantRef.current) {
      pendantRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      pendantRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.08 - 1.8;
    }
  });

  // Chain
  const chainLinks = [];
  const linkCount = 40;
  for (let i = 0; i < linkCount; i++) {
    const t = i / (linkCount - 1);
    const angle = Math.PI * t - Math.PI / 2;
    const x = Math.sin(angle) * 1.8;
    const y = -Math.cos(angle) * 1.8 + 1.8;
    
    chainLinks.push(
      <Torus 
        key={i}
        args={[0.04, 0.012, 8, 16]} 
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
    <group>
      {/* Chain */}
      <group>{chainLinks}</group>
      
      {/* Monogram pendant */}
      <Float speed={1.5} floatIntensity={0.2}>
        <group ref={pendantRef} position={[0, -1.8, 0]}>
          {/* Ornate frame */}
          <Ring args={[0.4, 0.6, 32]} castShadow>
            <meshStandardMaterial
              color={config.color || '#FFD700'}
              metalness={0.9}
              roughness={0.1}
            />
          </Ring>
          
          {/* Center monogram */}
          <Cylinder args={[0.35, 0.35, 0.08, 32]} castShadow>
            <meshStandardMaterial
              color={config.color || '#FFD700'}
              metalness={0.85}
              roughness={0.15}
            />
          </Cylinder>
          
          {/* Monogram letter */}
          {config.text && (
            <Text
              position={[0, 0, 0.05]}
              fontSize={0.25}
              color={config.textColor || "#000000"}
              anchorX="center"
              anchorY="middle"
              font="/fonts/Inter-Bold.ttf"
            >
              {config.text.charAt(0).toUpperCase()}
            </Text>
          )}
        </group>
      </Float>
    </group>
  );
};

const CustomHoopEarrings = ({ config }) => {
  const earringsRef = useRef();
  
  useFrame((state) => {
    if (earringsRef.current) {
      earringsRef.current.children.forEach((earring, i) => {
        earring.rotation.y = Math.sin(state.clock.elapsedTime * 0.8 + i * Math.PI) * 0.2;
        earring.position.y = Math.sin(state.clock.elapsedTime * 1.5 + i * Math.PI) * 0.03;
      });
    }
  });

  const HoopEarring = ({ position }) => (
    <Float speed={2} floatIntensity={0.1}>
      <group position={position}>
        {/* Hook */}
        <Torus args={[0.08, 0.01, 16, 32]} rotation={[0, 0, Math.PI / 4]} position={[0, 0.1, 0]}>
          <meshStandardMaterial color={config.hookColor || '#FFD700'} metalness={0.9} roughness={0.1} />
        </Torus>
        
        {/* Main hoop */}
        <Torus args={[0.4, 0.025, 16, 100]} castShadow>
          <meshStandardMaterial
            color={config.color || '#FFD700'}
            metalness={0.9}
            roughness={0.1}
          />
        </Torus>
        
        {/* Charm attachment */}
        {config.text && (
          <group position={[0, -0.5, 0]}>
            <RoundedBox args={[0.2, 0.2, 0.05]} radius={0.02} castShadow>
              <meshStandardMaterial color={config.charmColor || '#FFD700'} metalness={0.9} roughness={0.1} />
            </RoundedBox>
            <Text
              position={[0, 0, 0.03]}
              fontSize={0.08}
              color="#000000"
              anchorX="center"
              anchorY="middle"
            >
              {config.text.charAt(0)}
            </Text>
          </group>
        )}
      </group>
    </Float>
  );

  return (
    <group ref={earringsRef}>
      <HoopEarring position={[-0.6, 0, 0]} />
      <HoopEarring position={[0.6, 0, 0]} />
    </group>
  );
};

const BirthstoneStuds = ({ config }) => {
  const studsRef = useRef();
  
  useFrame((state) => {
    if (studsRef.current) {
      studsRef.current.children.forEach((stud, i) => {
        stud.rotation.y = state.clock.elapsedTime + i * Math.PI;
      });
    }
  });

  // Birthstone colors
  const birthstoneColors = {
    'January': '#8B0000',    // Garnet
    'February': '#9370DB',   // Amethyst
    'March': '#40E0D0',      // Aquamarine
    'April': '#FFFFFF',      // Diamond
    'May': '#50C878',        // Emerald
    'June': '#F0F8FF',       // Pearl
    'July': '#DC143C',       // Ruby
    'August': '#9ACD32',     // Peridot
    'September': '#0047AB',  // Sapphire
    'October': '#FF4500',    // Opal
    'November': '#FFD700',   // Topaz
    'December': '#4169E1'    // Tanzanite
  };

  const StudEarring = ({ position }) => (
    <Float speed={3} floatIntensity={0.2}>
      <group position={position}>
        {/* Stud back */}
        <Cylinder args={[0.15, 0.12, 0.08, 32]} castShadow>
          <meshStandardMaterial
            color={config.color || '#FFD700'}
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>
        
        {/* Birthstone */}
        <Sphere args={[0.18, 64, 64]} position={[0, 0.05, 0]} castShadow>
          <meshPhysicalMaterial
            color={config.birthstoneColor || birthstoneColors['April']}
            metalness={0}
            roughness={0.1}
            transmission={0.8}
            thickness={0.5}
            clearcoat={1}
            clearcoatRoughness={0}
            envMapIntensity={2}
          />
        </Sphere>
        
        {/* Prong setting */}
        {[0, Math.PI/2, Math.PI, 3*Math.PI/2].map((angle, i) => (
          <Cylinder 
            key={i}
            args={[0.01, 0.015, 0.15, 8]} 
            position={[Math.cos(angle) * 0.16, 0.08, Math.sin(angle) * 0.16]}
          >
            <meshStandardMaterial color={config.color || '#FFD700'} metalness={0.9} roughness={0.1} />
          </Cylinder>
        ))}
      </group>
    </Float>
  );

  return (
    <group ref={studsRef}>
      <StudEarring position={[-0.4, 0, 0]} />
      <StudEarring position={[0.4, 0, 0]} />
    </group>
  );
};

const PersonalizedPhoneCase = ({ config }) => {
  const caseRef = useRef();
  
  useFrame((state) => {
    if (caseRef.current) {
      caseRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <Float speed={1} floatIntensity={0.3}>
      <group ref={caseRef}>
        {/* Phone case body */}
        <RoundedBox args={[1.6, 3.2, 0.25]} radius={0.15} castShadow>
          <meshStandardMaterial
            color={config.color || '#FFB6C1'}
            roughness={0.4}
            metalness={0.1}
          />
        </RoundedBox>
        
        {/* Camera cutout */}
        <RoundedBox args={[0.4, 0.4, 0.3]} radius={0.05} position={[0.5, 1.3, -0.1]}>
          <meshStandardMaterial color="#000000" />
        </RoundedBox>
        
        {/* Pattern/Design overlay */}
        {config.pattern && (
          <mesh position={[0, 0, 0.13]}>
            <planeGeometry args={[1.5, 3.1]} />
            <meshBasicMaterial 
              color={config.patternColor || "#FFFFFF"} 
              transparent 
              opacity={0.3}
            />
          </mesh>
        )}
        
        {/* Custom text/initials */}
        {config.text && (
          <Text
            position={[0, -0.5, 0.13]}
            fontSize={0.25}
            color={config.textColor || "#FFFFFF"}
            anchorX="center"
            anchorY="middle"
            font="/fonts/Inter-Bold.ttf"
          >
            {config.text}
          </Text>
        )}
        
        {/* Decorative elements */}
        <Sphere args={[0.08, 32, 32]} position={[-0.6, -1.2, 0.13]}>
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
        </Sphere>
        <Sphere args={[0.06, 32, 32]} position={[0.7, -1.4, 0.13]}>
          <meshStandardMaterial color="#FF69B4" metalness={0.1} roughness={0.3} />
        </Sphere>
      </group>
    </Float>
  );
};

const CustomToteBag = ({ config }) => {
  const bagRef = useRef();
  
  useFrame((state) => {
    if (bagRef.current) {
      bagRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Float speed={0.8} floatIntensity={0.4}>
      <group ref={bagRef}>
        {/* Main bag body */}
        <RoundedBox args={[2.5, 3, 1]} radius={0.1} castShadow>
          <meshStandardMaterial
            color={config.color || '#8B4513'}
            roughness={config.material === 'leather' ? 0.7 : 0.9}
            metalness={config.material === 'leather' ? 0.1 : 0}
          />
        </RoundedBox>
        
        {/* Handles */}
        <Torus args={[0.8, 0.08, 16, 32]} position={[-0.6, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={config.handleColor || config.color} />
        </Torus>
        <Torus args={[0.8, 0.08, 16, 32]} position={[0.6, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={config.handleColor || config.color} />
        </Torus>
        
        {/* Monogram */}
        {config.text && (
          <group position={[0, 0, 0.51]}>
            <RoundedBox args={[1, 1, 0.05]} radius={0.1}>
              <meshStandardMaterial color="#FFFFFF" opacity={0.9} transparent />
            </RoundedBox>
            <Text
              position={[0, 0, 0.03]}
              fontSize={0.4}
              color={config.textColor || "#8B4513"}
              anchorX="center"
              anchorY="middle"
              font="/fonts/Inter-Bold.ttf"
            >
              {config.text}
            </Text>
          </group>
        )}
        
        {/* Bottom gusset */}
        <RoundedBox args={[2.5, 0.2, 1]} radius={0.05} position={[0, -1.6, 0]}>
          <meshStandardMaterial color={new THREE.Color(config.color).multiplyScalar(0.8)} />
        </RoundedBox>
      </group>
    </Float>
  );
};

const InitialRingSet = ({ config }) => {
  const ringsRef = useRef();
  
  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.y = state.clock.elapsedTime * (1 + i * 0.2);
        ring.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.05;
      });
    }
  });

  const RingBand = ({ position, initial, size = 1 }) => (
    <Float speed={2 + size} floatIntensity={0.1}>
      <group position={position} scale={[size, size, size]}>
        {/* Ring band */}
        <Torus args={[0.35, 0.08, 16, 32]} castShadow>
          <meshStandardMaterial
            color={config.color || '#FFD700'}
            metalness={0.9}
            roughness={0.1}
          />
        </Torus>
        
        {/* Initial plate */}
        <Cylinder args={[0.15, 0.15, 0.05, 32]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial
            color={config.color || '#FFD700'}
            metalness={0.85}
            roughness={0.15}
          />
        </Cylinder>
        
        {/* Initial letter */}
        {initial && (
          <Text
            position={[0, 0, 0.03]}
            fontSize={0.12}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {initial}
          </Text>
        )}
      </group>
    </Float>
  );

  const initials = (config.text || 'ABC').split('').slice(0, 3);

  return (
    <group ref={ringsRef}>
      <RingBand position={[-0.8, 0, 0]} initial={initials[0]} size={1.1} />
      <RingBand position={[0, 0, 0]} initial={initials[1]} size={1.0} />
      <RingBand position={[0.8, 0, 0]} initial={initials[2]} size={0.9} />
    </group>
  );
};

// Product mapping based on real products
const RealProductModel = ({ config, selectedProduct }) => {
  const getProductModel = () => {
    if (!selectedProduct) {
      return <CustomInitialBracelet config={config} />;
    }

    // Map actual product names to 3D models
    const productName = selectedProduct.name.toLowerCase();
    
    if (productName.includes('initial bracelet')) {
      return <CustomInitialBracelet config={config} />;
    } else if (productName.includes('beaded') && productName.includes('bracelet')) {
      return <BeadedCharmBracelet config={config} />;
    } else if (productName.includes('layered') && productName.includes('necklace')) {
      return <LayeredInitialNecklace config={config} />;
    } else if (productName.includes('name necklace')) {
      return <CustomNameNecklace config={config} />;
    } else if (productName.includes('monogram pendant')) {
      return <MonogramPendant config={config} />;
    } else if (productName.includes('hoop earrings')) {
      return <CustomHoopEarrings config={config} />;
    } else if (productName.includes('birthstone') && productName.includes('studs')) {
      return <BirthstoneStuds config={config} />;
    } else if (productName.includes('phone case')) {
      return <PersonalizedPhoneCase config={config} />;
    } else if (productName.includes('tote bag')) {
      return <CustomToteBag config={config} />;
    } else if (productName.includes('ring set')) {
      return <InitialRingSet config={config} />;
    }
    
    // Default fallback based on category
    switch (selectedProduct.category) {
      case 'bracelets':
        return <CustomInitialBracelet config={config} />;
      case 'necklaces':
        return <CustomNameNecklace config={config} />;
      case 'earrings':
        return <CustomHoopEarrings config={config} />;
      case 'accessories':
        return <PersonalizedPhoneCase config={config} />;
      case 'bags':
        return <CustomToteBag config={config} />;
      case 'rings':
        return <InitialRingSet config={config} />;
      default:
        return <CustomInitialBracelet config={config} />;
    }
  };

  return (
    <Center>
      {getProductModel()}
    </Center>
  );
};

// Main Viewer Component
const RealProductViewer = ({ config, selectedProduct }) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <Canvas
        shadows
        gl={{ 
          preserveDrawingBuffer: true, 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        camera={{ position: [0, 0, 6], fov: 35 }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 8, 25]} />
        
        <Suspense fallback={null}>
          {/* Professional Lighting */}
          <ambientLight intensity={0.3} />
          <SpotLight
            position={[5, 8, 5]}
            angle={0.4}
            penumbra={1}
            intensity={2}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <SpotLight
            position={[-5, 8, -5]}
            angle={0.4}
            penumbra={1}
            intensity={1.5}
            color="#4080ff"
          />
          <pointLight position={[8, 0, -8]} intensity={0.8} color="#ff0080" />
          <pointLight position={[-8, 0, 8]} intensity={0.8} color="#0080ff" />
          
          {/* Display Platform */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
            <circleGeometry args={[4, 64]} />
            <MeshReflectorMaterial
              blur={[400, 100]}
              resolution={1024}
              mixBlur={1}
              mixStrength={50}
              roughness={0.2}
              depthScale={1}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#111111"
              metalness={0.6}
            />
          </mesh>
          
          {/* Backdrop */}
          <Backdrop
            receiveShadow
            scale={[25, 15, 8]}
            floor={8}
            position={[0, -2, -10]}
          >
            <meshStandardMaterial color="#0f0f0f" roughness={0.9} />
          </Backdrop>
          
          {/* Product Model */}
          <RealProductModel config={config} selectedProduct={selectedProduct} />
          
          {/* Environment */}
          <Environment preset="night" resolution={256}>
            <Lightformer
              intensity={3}
              rotation-x={Math.PI / 2}
              position={[0, 5, -9]}
              scale={[10, 10, 1]}
            />
            <Lightformer
              intensity={1}
              rotation-y={Math.PI / 2}
              position={[-5, 1, -1]}
              scale={[20, 0.1, 1]}
            />
            <Lightformer
              intensity={1}
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
            maxDistance={12}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            autoRotate={config.autoRotate}
            autoRotateSpeed={0.8}
          />
        </Suspense>
      </Canvas>
      
      {/* Product Info Overlay */}
      <div className="absolute top-4 left-4 text-white">
        <div className="bg-black/60 backdrop-blur-md rounded-lg p-4">
          <h3 className="font-semibold text-lg">
            {selectedProduct?.name || 'Custom Product'}
          </h3>
          <p className="text-sm opacity-80">
            {selectedProduct?.description || 'Personalized just for you'}
          </p>
        </div>
      </div>
      
      {/* Controls Hint */}
      <div className="absolute bottom-4 right-4 text-white">
        <div className="bg-black/60 backdrop-blur-md rounded-lg p-3">
          <p className="text-xs opacity-70">Drag to rotate • Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
};

export default RealProductViewer;