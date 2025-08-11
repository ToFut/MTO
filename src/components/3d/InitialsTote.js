import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

const InitialsTote = ({ config }) => {
  const groupRef = useRef();
  const meshRef = useRef();
  
  // Animation
  useFrame((state) => {
    if (groupRef.current && config.autoRotate) {
      groupRef.current.rotation.y += 0.003;
    }
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  // Tote dimensions
  const width = 2.2;
  const height = 2.6;
  const depth = 0.7;

  // Get initials from config
  const initials = (config.initials || 'AB').toUpperCase().slice(0, 3);

  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={groupRef}>
        <group ref={meshRef}>
          {/* Main tote body */}
          <Box args={[width, height, depth]} castShadow receiveShadow>
            <meshPhysicalMaterial 
              color={config.bagColor || '#000000'}
              roughness={0.6}
              metalness={0}
              clearcoat={0.2}
              clearcoatRoughness={0.8}
            />
          </Box>

          {/* Side gussets */}
          <Box 
            args={[depth/2, height, depth]} 
            position={[-width/2 + depth/4, 0, 0]}
            castShadow receiveShadow
          >
            <meshPhysicalMaterial 
              color={config.bagColor || '#000000'}
              roughness={0.6}
              metalness={0}
            />
          </Box>
          <Box 
            args={[depth/2, height, depth]} 
            position={[width/2 - depth/4, 0, 0]}
            castShadow receiveShadow
          >
            <meshPhysicalMaterial 
              color={config.bagColor || '#000000'}
              roughness={0.6}
              metalness={0}
            />
          </Box>

          {/* Leather handles */}
          <group position={[0, height/2, 0]}>
            <mesh position={[-width/3, 0.7, 0]} castShadow>
              <torusGeometry args={[0.45, 0.06, 10, 20, Math.PI]} />
              <meshPhysicalMaterial 
                color={config.handleColor || '#4A2C17'}
                roughness={0.5}
                metalness={0.1}
                clearcoat={0.3}
              />
            </mesh>
            <mesh position={[width/3, 0.7, 0]} castShadow>
              <torusGeometry args={[0.45, 0.06, 10, 20, Math.PI]} />
              <meshPhysicalMaterial 
                color={config.handleColor || '#4A2C17'}
                roughness={0.5}
                metalness={0.1}
                clearcoat={0.3}
              />
            </mesh>
          </group>

          {/* Large initials in center */}
          <Text
            position={[0, 0.2, depth/2 + 0.01]}
            fontSize={0.8}
            color={config.initialsColor || '#FFFFFF'}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.1}
            font={undefined}
          >
            {initials}
          </Text>

          {/* Optional monogram circle */}
          {config.showMonogramCircle && (
            <mesh position={[0, 0.2, depth/2 + 0.005]}>
              <ringGeometry args={[0.7, 0.75, 64]} />
              <meshBasicMaterial color={config.initialsColor || '#FFFFFF'} />
            </mesh>
          )}

          {/* Optional name below initials */}
          {config.fullName && (
            <Text
              position={[0, -0.3, depth/2 + 0.01]}
              fontSize={0.15}
              color={config.initialsColor || '#FFFFFF'}
              anchorX="center"
              anchorY="middle"
              font={undefined}
            >
              {config.fullName}
            </Text>
          )}

          {/* Premium tag */}
          {config.showPremiumTag && (
            <Box 
              args={[0.5, 0.2, 0.02]} 
              position={[width/2 - 0.3, height/2 - 0.2, depth/2 + 0.01]}
            >
              <meshPhysicalMaterial 
                color="#FFD700"
                metalness={0.8}
                roughness={0.2}
              />
            </Box>
          )}

          {/* Bottom reinforcement */}
          <Box 
            args={[width - 0.1, 0.12, depth - 0.1]} 
            position={[0, -height/2 + 0.06, 0]}
            castShadow
          >
            <meshPhysicalMaterial 
              color="#4A2C17"
              roughness={0.6}
              metalness={0.1}
            />
          </Box>

          {/* Interior pocket indicator */}
          <Box
            args={[width * 0.7, 0.3, 0.01]}
            position={[0, height/2 - 0.4, -depth/2 + 0.01]}
          >
            <meshBasicMaterial color="#333333" opacity={0.3} transparent />
          </Box>
        </group>
      </group>
    </Float>
  );
};

export default InitialsTote;