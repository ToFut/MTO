import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Camera, Music, Coffee, Plane, Flower, Heart, Star, Crown, Diamond,
  Sun, Moon, Mountain, Cat, Dog, Bird, Fish, Home, Anchor, Gift,
  Sparkles, Zap, Flame, Snowflake, TreePine, Pizza, Apple
} from 'lucide-react';

// Icon to 3D mapping
const ICON_COMPONENTS = {
  Camera, Music, Coffee, Plane, Flower, Heart, Star, Crown, Diamond,
  Sun, Moon, Mountain, Cat, Dog, Bird, Fish, Home, Anchor, Gift,
  Sparkles, Lightning: Zap, Flame, Snowflake, TreePine, Pizza, Apple
};

// Create icon texture from React icon
const createIconTexture = (IconComponent, color = '#000000', size = 256) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, size, size);
  
  // Create circle background
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 10, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = color;
  ctx.font = (size * 0.6) + 'px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const iconName = IconComponent.name || 'X';
  ctx.fillText(iconName[0], size/2, size/2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const IconTote = ({ config }) => {
  const groupRef = useRef();
  const meshRef = useRef();
  
  // Gentle animation
  useFrame((state) => {
    if (groupRef.current && config.autoRotate) {
      groupRef.current.rotation.y += 0.003;
    }
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  // Generate icon textures for each spot
  const spotTextures = useMemo(() => {
    const textures = {};
    for (let i = 1; i <= 6; i++) {
      const spotConfig = config[`spot${i}`];
      if (spotConfig && spotConfig.icon) {
        const IconComponent = ICON_COMPONENTS[spotConfig.icon];
        if (IconComponent) {
          textures[`spot${i}`] = createIconTexture(
            IconComponent,
            spotConfig.color || '#000000',
            256
          );
        }
      }
    }
    return textures;
  }, [config]);

  // Tote bag dimensions
  const width = 2.5;
  const height = 3;
  const depth = 0.8;
  const handleHeight = 1;

  // Define spot positions on the tote
  const spotPositions = {
    spot1: { position: [-0.6, 0.8, depth/2 + 0.01], scale: 0.5 },
    spot2: { position: [0, 0.8, depth/2 + 0.01], scale: 0.5 },
    spot3: { position: [0.6, 0.8, depth/2 + 0.01], scale: 0.5 },
    spot4: { position: [-0.6, 0, depth/2 + 0.01], scale: 0.5 },
    spot5: { position: [0, 0, depth/2 + 0.01], scale: 0.5 },
    spot6: { position: [0.6, 0, depth/2 + 0.01], scale: 0.5 }
  };

  // Material for the tote
  const toteMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.bagColor || '#F5F5DC'),
      roughness: 0.8,
      metalness: 0,
      clearcoat: 0.1,
      clearcoatRoughness: 0.8,
      side: THREE.DoubleSide
    });
  }, [config.bagColor]);

  // Handle material
  const handleMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.handleColor || '#8B4513'),
      roughness: 0.6,
      metalness: 0.2,
      clearcoat: 0.3,
      clearcoatRoughness: 0.5
    });
  }, [config.handleColor]);

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.15}>
      <group ref={groupRef}>
        <group ref={meshRef}>
          {/* Main tote body */}
          <RoundedBox
            args={[width, height, depth]}
            radius={0.05}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <primitive object={toteMaterial} attach="material" />
          </RoundedBox>

          {/* Icon spots */}
          {Object.entries(spotPositions).map(([spotKey, spotData]) => {
            const texture = spotTextures[spotKey];
            const spotConfig = config[spotKey];
            
            if (!texture || !spotConfig || !spotConfig.enabled) return null;
            
            return (
              <group key={spotKey} position={spotData.position}>
                <mesh>
                  <planeGeometry args={[spotData.scale, spotData.scale]} />
                  <meshBasicMaterial 
                    map={texture}
                    transparent
                    opacity={0.9}
                  />
                </mesh>
                
                {/* Spot label */}
                {spotConfig.label && (
                  <Text
                    position={[0, -spotData.scale * 0.7, 0.01]}
                    fontSize={0.08}
                    color={spotConfig.labelColor || '#000000'}
                    anchorX="center"
                    anchorY="middle"
                    font={undefined}
                  >
                    {spotConfig.label}
                  </Text>
                )}
              </group>
            );
          })}

          {/* Custom text on tote */}
          {config.mainText && (
            <Text
              position={[0, -0.8, depth/2 + 0.01]}
              fontSize={0.25}
              color={config.textColor || '#000000'}
              anchorX="center"
              anchorY="middle"
              font="/fonts/inter-bold.woff"
              maxWidth={width * 0.8}
              textAlign="center"
            >
              {config.mainText}
            </Text>
          )}

          {/* Handles */}
          <group position={[0, height/2, 0]}>
            {/* Left handle */}
            <mesh position={[-width/4, handleHeight/2, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, handleHeight, 16]} />
              <primitive object={handleMaterial} attach="material" />
            </mesh>
            <mesh position={[-width/4, handleHeight, 0]} castShadow>
              <torusGeometry args={[width/4, 0.06, 8, 16, Math.PI]} />
              <primitive object={handleMaterial} attach="material" />
            </mesh>
            
            {/* Right handle */}
            <mesh position={[width/4, handleHeight/2, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, handleHeight, 16]} />
              <primitive object={handleMaterial} attach="material" />
            </mesh>
            <mesh position={[width/4, handleHeight, 0]} castShadow>
              <torusGeometry args={[width/4, 0.06, 8, 16, Math.PI]} />
              <primitive object={handleMaterial} attach="material" />
            </mesh>
          </group>

          {/* Side gussets */}
          <mesh position={[-width/2 + depth/4, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[depth/2, height, depth]} />
            <primitive object={toteMaterial} attach="material" />
          </mesh>
          <mesh position={[width/2 - depth/4, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[depth/2, height, depth]} />
            <primitive object={toteMaterial} attach="material" />
          </mesh>

          {/* Bottom reinforcement */}
          <mesh position={[0, -height/2 + 0.05, 0]} castShadow>
            <boxGeometry args={[width - 0.1, 0.1, depth - 0.1]} />
            <meshPhysicalMaterial 
              color={config.bottomColor || '#8B4513'}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Interior pocket indicator */}
          <mesh position={[0, height/2 - 0.5, -depth/2 + 0.05]}>
            <planeGeometry args={[width * 0.6, 0.3]} />
            <meshBasicMaterial 
              color="#CCCCCC"
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
};

export default IconTote;