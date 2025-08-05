import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';

const SimpleTote = ({ config }) => {
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
  const width = 2;
  const height = 2.4;
  const depth = 0.6;

  // Draw icon paths - simplified icons that work well on canvas
  const drawIcon = (ctx, iconName, color) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.save();
    ctx.translate(128, 128);
    ctx.scale(3, 3);
    
    switch(iconName) {
      case 'Camera':
        // Camera body
        ctx.beginPath();
        ctx.moveTo(-17, -10);
        ctx.lineTo(17, -10);
        ctx.quadraticCurveTo(20, -10, 20, -7);
        ctx.lineTo(20, 12);
        ctx.quadraticCurveTo(20, 15, 17, 15);
        ctx.lineTo(-17, 15);
        ctx.quadraticCurveTo(-20, 15, -20, 12);
        ctx.lineTo(-20, -7);
        ctx.quadraticCurveTo(-20, -10, -17, -10);
        ctx.closePath();
        ctx.fill();
        // Lens
        ctx.beginPath();
        ctx.arc(0, 2, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.stroke();
        // Flash
        ctx.fillStyle = color;
        ctx.fillRect(12, -10, 6, 4);
        break;
        
      case 'Heart':
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.bezierCurveTo(-8, -16, -20, -12, -20, -4);
        ctx.bezierCurveTo(-20, 4, -12, 12, 0, 20);
        ctx.bezierCurveTo(12, 12, 20, 4, 20, -4);
        ctx.bezierCurveTo(20, -12, 8, -16, 0, -8);
        ctx.fill();
        break;
        
      case 'Star':
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * 15;
          const y = Math.sin(angle) * 15;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'Music':
        // Note stem
        ctx.fillRect(3, -15, 3, 20);
        // Note head
        ctx.beginPath();
        ctx.ellipse(-5, 5, 8, 6, -Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        // Flag
        ctx.beginPath();
        ctx.moveTo(6, -15);
        ctx.quadraticCurveTo(15, -10, 12, 0);
        ctx.lineTo(6, -5);
        ctx.fill();
        break;
        
      case 'Coffee':
        // Cup
        ctx.beginPath();
        ctx.moveTo(-12, -10);
        ctx.lineTo(-10, 10);
        ctx.lineTo(10, 10);
        ctx.lineTo(12, -10);
        ctx.closePath();
        ctx.fill();
        // Handle
        ctx.beginPath();
        ctx.arc(12, 0, 6, -Math.PI/2, Math.PI/2, false);
        ctx.stroke();
        // Steam
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(-5, -15);
        ctx.quadraticCurveTo(-3, -18, -5, -20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.quadraticCurveTo(2, -18, 0, -20);
        ctx.stroke();
        break;
        
      case 'Sun':
        // Center
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        // Rays
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          ctx.save();
          ctx.rotate(angle);
          ctx.fillRect(-2, 15, 4, 8);
          ctx.restore();
        }
        break;
        
      case 'Moon':
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(8, -5, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        break;
        
      case 'Gift':
        // Box
        ctx.fillRect(-12, -2, 24, 15);
        // Lid
        ctx.fillRect(-14, -5, 28, 4);
        // Ribbon vertical
        ctx.fillRect(-3, -15, 6, 28);
        // Bow
        ctx.beginPath();
        ctx.arc(-6, -12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6, -12, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'Home':
        // House body
        ctx.fillRect(-12, -2, 24, 15);
        // Roof
        ctx.beginPath();
        ctx.moveTo(-15, -2);
        ctx.lineTo(0, -15);
        ctx.lineTo(15, -2);
        ctx.closePath();
        ctx.fill();
        // Door
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-4, 3, 8, 10);
        break;
        
      case 'Crown':
        ctx.beginPath();
        ctx.moveTo(-15, 5);
        ctx.lineTo(-12, -8);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-4, -10);
        ctx.lineTo(0, -2);
        ctx.lineTo(4, -10);
        ctx.lineTo(8, 0);
        ctx.lineTo(12, -8);
        ctx.lineTo(15, 5);
        ctx.closePath();
        ctx.fill();
        // Jewels
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-8, -5, 2, 0, Math.PI * 2);
        ctx.arc(0, -7, 2, 0, Math.PI * 2);
        ctx.arc(8, -5, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'Diamond':
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(10, -5);
        ctx.lineTo(5, 15);
        ctx.lineTo(0, 18);
        ctx.lineTo(-5, 15);
        ctx.lineTo(-10, -5);
        ctx.closePath();
        ctx.fill();
        // Facets
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(0, 18);
        ctx.moveTo(-10, -5);
        ctx.lineTo(10, -5);
        ctx.stroke();
        break;
        
      case 'Plane':
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        ctx.fillRect(-20, -2, 40, 4);
        // Tail
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(18, -8);
        ctx.lineTo(18, -4);
        ctx.lineTo(14, 0);
        ctx.fill();
        break;
        
      case 'Lightning':
        ctx.beginPath();
        ctx.moveTo(-3, -15);
        ctx.lineTo(-8, -2);
        ctx.lineTo(-2, -2);
        ctx.lineTo(-5, 15);
        ctx.lineTo(3, -5);
        ctx.lineTo(-3, -5);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'Anchor':
        // Stem
        ctx.fillRect(-2, -15, 4, 25);
        // Ring
        ctx.beginPath();
        ctx.arc(0, -15, 5, 0, Math.PI * 2);
        ctx.stroke();
        // Crossbar
        ctx.fillRect(-10, -5, 20, 3);
        // Flukes
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.quadraticCurveTo(-15, 5, -8, 10);
        ctx.lineTo(-6, 8);
        ctx.quadraticCurveTo(-10, 3, -8, -5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, -5);
        ctx.quadraticCurveTo(15, 5, 8, 10);
        ctx.lineTo(6, 8);
        ctx.quadraticCurveTo(10, 3, 8, -5);
        ctx.fill();
        break;
        
      case 'Cat':
        // Head
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.beginPath();
        ctx.moveTo(-12, -8);
        ctx.lineTo(-8, -16);
        ctx.lineTo(-5, -10);
        ctx.moveTo(12, -8);
        ctx.lineTo(8, -16);
        ctx.lineTo(5, -10);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-4, -2, 2, 0, Math.PI * 2);
        ctx.arc(4, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        // Whiskers
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-18, -2);
        ctx.moveTo(-12, 2);
        ctx.lineTo(-18, 2);
        ctx.moveTo(12, 0);
        ctx.lineTo(18, -2);
        ctx.moveTo(12, 2);
        ctx.lineTo(18, 2);
        ctx.stroke();
        break;
        
      case 'Dog':
        // Head
        ctx.beginPath();
        ctx.ellipse(0, -2, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Snout
        ctx.beginPath();
        ctx.ellipse(0, 5, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.beginPath();
        ctx.ellipse(-8, -8, 4, 8, -Math.PI/6, 0, Math.PI * 2);
        ctx.ellipse(8, -8, 4, 8, Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        // Nose
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 8, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'Snowflake':
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        // Six branches
        for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI) / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -15);
          ctx.stroke();
          // Branch decorations
          ctx.beginPath();
          ctx.moveTo(-5, -8);
          ctx.lineTo(0, -10);
          ctx.lineTo(5, -8);
          ctx.moveTo(-3, -12);
          ctx.lineTo(0, -14);
          ctx.lineTo(3, -12);
          ctx.stroke();
          ctx.restore();
        }
        break;
        
      case 'TreePine':
        // Tree layers
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(-8, -8);
        ctx.lineTo(-6, -8);
        ctx.lineTo(-10, -2);
        ctx.lineTo(-8, -2);
        ctx.lineTo(-12, 5);
        ctx.lineTo(12, 5);
        ctx.lineTo(8, -2);
        ctx.lineTo(10, -2);
        ctx.lineTo(6, -8);
        ctx.lineTo(8, -8);
        ctx.closePath();
        ctx.fill();
        // Trunk
        ctx.fillRect(-3, 5, 6, 8);
        break;
        
      case 'Pizza':
        // Pizza slice
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-12, 10);
        ctx.quadraticCurveTo(0, 15, 12, 10);
        ctx.closePath();
        ctx.fill();
        // Crust
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-12, 10);
        ctx.quadraticCurveTo(0, 15, 12, 10);
        ctx.stroke();
        // Toppings
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-3, 0, 2, 0, Math.PI * 2);
        ctx.arc(3, -3, 2, 0, Math.PI * 2);
        ctx.arc(0, 5, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'Apple':
        // Apple body
        ctx.beginPath();
        ctx.arc(0, 2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-6, -5, 8, 0, Math.PI * 2);
        ctx.arc(6, -5, 8, 0, Math.PI * 2);
        ctx.fill();
        // Stem
        ctx.fillRect(-1, -12, 2, 6);
        // Leaf
        ctx.save();
        ctx.translate(2, -10);
        ctx.rotate(Math.PI/4);
        ctx.beginPath();
        ctx.ellipse(0, 0, 3, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
        
      case 'Baby':
        // Head
        ctx.beginPath();
        ctx.arc(0, -5, 10, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.beginPath();
        ctx.arc(0, 8, 8, 0, Math.PI * 2);
        ctx.fill();
        // Pacifier
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -2, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -2, 5, 0, Math.PI);
        ctx.stroke();
        break;
        
      case 'Fish':
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(18, -6);
        ctx.lineTo(16, 0);
        ctx.lineTo(18, 6);
        ctx.closePath();
        ctx.fill();
        // Eye
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-8, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(-8, -2, 1, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'Flame':
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.quadraticCurveTo(-8, 5, -8, -5);
        ctx.quadraticCurveTo(-8, -15, 0, -18);
        ctx.quadraticCurveTo(8, -15, 8, -5);
        ctx.quadraticCurveTo(8, 5, 0, 15);
        ctx.fill();
        // Inner flame
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.quadraticCurveTo(-4, 5, -4, 0);
        ctx.quadraticCurveTo(-4, -8, 0, -10);
        ctx.quadraticCurveTo(4, -8, 4, 0);
        ctx.quadraticCurveTo(4, 5, 0, 10);
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
        
      default:
        // Fallback circle with letter
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(iconName.charAt(0).toUpperCase(), 0, 0);
    }
    
    ctx.restore();
  };

  // Create icon textures
  const createIconCanvas = (iconName, color = '#000000') => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Background circle with gradient
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 100);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.8, '#FAFAFA');
    gradient.addColorStop(1, '#F0F0F0');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.stroke();
    
    // Inner shadow
    ctx.beginPath();
    ctx.arc(128, 128, 94, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw the icon
    drawIcon(ctx, iconName, color);
    
    return canvas;
  };

  // Create textures for each spot
  const spotTextures = useMemo(() => {
    const textures = [];
    for (let i = 1; i <= 6; i++) {
      const spot = config[`spot${i}`];
      if (spot && spot.enabled && spot.icon) {
        const canvas = createIconCanvas(spot.icon, spot.color || '#000000');
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        textures.push({ spot: i, texture, label: spot.label });
      }
    }
    return textures;
  }, [config]);

  // Spot positions on tote (3x2 grid)
  const spotPositions = [
    [-0.5, 0.6, depth/2 + 0.02],  // Top left
    [0, 0.6, depth/2 + 0.02],      // Top center
    [0.5, 0.6, depth/2 + 0.02],    // Top right
    [-0.5, 0, depth/2 + 0.02],     // Bottom left
    [0, 0, depth/2 + 0.02],        // Bottom center
    [0.5, 0, depth/2 + 0.02]       // Bottom right
  ];

  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={groupRef}>
        <group ref={meshRef}>
          {/* Main tote body */}
          <Box args={[width, height, depth]} castShadow receiveShadow>
            <meshPhysicalMaterial 
              color={config.bagColor || '#F5F5DC'}
              roughness={0.65}
              metalness={0}
              clearcoat={0.2}
              clearcoatRoughness={0.7}
              sheen={0.3}
              sheenRoughness={0.6}
              sheenColor={config.bagColor || '#F5F5DC'}
              envMapIntensity={1.2}
            />
          </Box>

          {/* Side panels for depth */}
          <Box 
            args={[depth/2, height, depth]} 
            position={[-width/2 + depth/4, 0, 0]}
            castShadow receiveShadow
          >
            <meshPhysicalMaterial 
              color={config.bagColor || '#F5F5DC'}
              roughness={0.65}
              metalness={0}
              clearcoat={0.2}
              clearcoatRoughness={0.7}
              sheen={0.3}
              sheenRoughness={0.6}
              sheenColor={config.bagColor || '#F5F5DC'}
              envMapIntensity={1.2}
            />
          </Box>
          <Box 
            args={[depth/2, height, depth]} 
            position={[width/2 - depth/4, 0, 0]}
            castShadow receiveShadow
          >
            <meshPhysicalMaterial 
              color={config.bagColor || '#F5F5DC'}
              roughness={0.65}
              metalness={0}
              clearcoat={0.2}
              clearcoatRoughness={0.7}
              sheen={0.3}
              sheenRoughness={0.6}
              sheenColor={config.bagColor || '#F5F5DC'}
              envMapIntensity={1.2}
            />
          </Box>

          {/* Handles */}
          <group position={[0, height/2, 0]}>
            {/* Left handle */}
            <mesh position={[-width/3, 0.6, 0]} castShadow>
              <torusGeometry args={[0.4, 0.06, 10, 20, Math.PI]} />
              <meshPhysicalMaterial 
                color={config.handleColor || '#8B4513'}
                roughness={0.4}
                metalness={0.2}
                clearcoat={0.5}
                clearcoatRoughness={0.3}
              />
            </mesh>
            {/* Right handle */}
            <mesh position={[width/3, 0.6, 0]} castShadow>
              <torusGeometry args={[0.4, 0.06, 10, 20, Math.PI]} />
              <meshPhysicalMaterial 
                color={config.handleColor || '#8B4513'}
                roughness={0.4}
                metalness={0.2}
                clearcoat={0.5}
                clearcoatRoughness={0.3}
              />
            </mesh>
          </group>

          {/* Icon spots */}
          {spotTextures.map((spotData, index) => {
            const position = spotPositions[spotData.spot - 1];
            return (
              <group key={`spot-${spotData.spot}`} position={position}>
                {/* Shadow for depth */}
                <Plane args={[0.42, 0.42]} position={[0, 0, -0.01]}>
                  <meshBasicMaterial color="#000000" opacity={0.2} transparent />
                </Plane>
                {/* Icon badge */}
                <Plane args={[0.4, 0.4]} castShadow>
                  <meshStandardMaterial 
                    map={spotData.texture}
                    transparent
                    alphaTest={0.5}
                    roughness={0.3}
                    metalness={0.1}
                  />
                </Plane>
                {spotData.label && (
                  <Text
                    position={[0, -0.25, 0.01]}
                    fontSize={0.08}
                    color="#000000"
                    anchorX="center"
                    anchorY="middle"
                    font={undefined}
                  >
                    {spotData.label}
                  </Text>
                )}
              </group>
            );
          })}

          {/* Main text */}
          {config.mainText && (
            <Text
              position={[0, -0.7, depth/2 + 0.01]}
              fontSize={0.2}
              color={config.textColor || '#000000'}
              anchorX="center"
              anchorY="middle"
              maxWidth={width * 0.8}
              font={undefined}
            >
              {config.mainText}
            </Text>
          )}

          {/* Bottom reinforcement */}
          <Box 
            args={[width - 0.1, 0.1, depth - 0.1]} 
            position={[0, -height/2 + 0.05, 0]}
            castShadow
          >
            <meshPhysicalMaterial 
              color={config.handleColor || '#8B4513'}
              roughness={0.5}
              metalness={0.15}
              clearcoat={0.3}
              clearcoatRoughness={0.5}
            />
          </Box>
        </group>
      </group>
    </Float>
  );
};

export default SimpleTote;