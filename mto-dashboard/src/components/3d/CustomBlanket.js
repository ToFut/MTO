import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

const CustomBlanket = ({ config }) => {
  const groupRef = useRef();
  const meshRef = useRef();
  
  // Animation - gentle waving motion
  useFrame((state) => {
    if (groupRef.current && config.autoRotate) {
      groupRef.current.rotation.y += 0.002;
    }
    if (meshRef.current) {
      // Wave effect
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.05;
      meshRef.current.position.y = Math.sin(time * 0.3) * 0.03;
    }
  });

  // Blanket dimensions
  const width = 3;
  const height = 2.5;
  const thickness = 0.15;

  // Create pattern texture
  const patternTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = config.blanketColor || '#F5F5DC';
    ctx.fillRect(0, 0, 512, 512);
    
    // Pattern based on config
    if (config.pattern === 'stripes') {
      ctx.fillStyle = config.patternColor || '#8B4513';
      for (let i = 0; i < 512; i += 64) {
        ctx.fillRect(0, i, 512, 32);
      }
    } else if (config.pattern === 'plaid') {
      ctx.fillStyle = config.patternColor || '#8B4513';
      for (let i = 0; i < 512; i += 64) {
        ctx.fillRect(i, 0, 32, 512);
        ctx.fillRect(0, i, 512, 32);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }, [config.blanketColor, config.pattern, config.patternColor]);

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.05}>
      <group ref={groupRef}>
        <group ref={meshRef}>
          {/* Main blanket body with rounded corners */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, thickness, 10, 10, 2]} />
            <meshPhysicalMaterial 
              map={patternTexture}
              roughness={0.9}
              metalness={0}
              clearcoat={0.05}
              clearcoatRoughness={1}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Folded corner effect */}
          <mesh 
            position={[width/2 - 0.3, height/2 - 0.3, thickness/2 + 0.05]}
            rotation={[0, 0, Math.PI/4]}
            castShadow
          >
            <planeGeometry args={[0.6, 0.6]} />
            <meshPhysicalMaterial 
              color={config.blanketColor || '#F5F5DC'}
              roughness={0.9}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Center monogram/text area */}
          {config.centerDesign === 'monogram' && config.monogram && (
            <group position={[0, 0, thickness/2 + 0.01]}>
              {/* Monogram background circle */}
              <mesh>
                <circleGeometry args={[0.5, 64]} />
                <meshBasicMaterial 
                  color={config.monogramBgColor || '#FFFFFF'}
                  opacity={0.9}
                  transparent
                />
              </mesh>
              {/* Monogram text */}
              <Text
                position={[0, 0, 0.01]}
                fontSize={0.4}
                color={config.monogramColor || '#000000'}
                anchorX="center"
                anchorY="middle"
                font={undefined}
              >
                {config.monogram.toUpperCase()}
              </Text>
            </group>
          )}

          {/* Custom text design */}
          {config.centerDesign === 'text' && config.customText && (
            <Text
              position={[0, 0, thickness/2 + 0.01]}
              fontSize={0.25}
              color={config.textColor || '#000000'}
              anchorX="center"
              anchorY="middle"
              maxWidth={width * 0.7}
              textAlign="center"
              font={undefined}
            >
              {config.customText}
            </Text>
          )}

          {/* Corner embroidery */}
          {config.cornerText && (
            <Text
              position={[width/2 - 0.4, -height/2 + 0.3, thickness/2 + 0.01]}
              fontSize={0.12}
              color={config.cornerTextColor || '#8B4513'}
              anchorX="right"
              anchorY="bottom"
              font={undefined}
            >
              {config.cornerText}
            </Text>
          )}

          {/* Fringe/tassels on edges */}
          {config.hasFringe && (
            <>
              {/* Top fringe */}
              {[...Array(20)].map((_, i) => (
                <mesh 
                  key={`fringe-top-${i}`}
                  position={[
                    -width/2 + (i * width/19), 
                    height/2 + 0.15, 
                    0
                  ]}
                >
                  <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
                  <meshPhysicalMaterial 
                    color={config.fringeColor || '#8B4513'}
                    roughness={0.9}
                  />
                </mesh>
              ))}
              {/* Bottom fringe */}
              {[...Array(20)].map((_, i) => (
                <mesh 
                  key={`fringe-bottom-${i}`}
                  position={[
                    -width/2 + (i * width/19), 
                    -height/2 - 0.15, 
                    0
                  ]}
                >
                  <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
                  <meshPhysicalMaterial 
                    color={config.fringeColor || '#8B4513'}
                    roughness={0.9}
                  />
                </mesh>
              ))}
            </>
          )}

          {/* Care label */}
          <Box
            args={[0.3, 0.15, 0.01]}
            position={[-width/2 + 0.2, -height/2 + 0.1, -thickness/2 - 0.005]}
          >
            <meshBasicMaterial color="#FFFFFF" />
          </Box>
        </group>
      </group>
    </Float>
  );
};

export default CustomBlanket;