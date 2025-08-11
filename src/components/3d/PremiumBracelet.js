import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text3D, Center, MeshReflectorMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const PremiumBracelet = ({ config }) => {
  const groupRef = useRef();
  const textRef = useRef();
  
  // Debug config
  useEffect(() => {
    console.log('PremiumBracelet config:', {
      material: config.material,
      charmMaterial: config.charmMaterial,
      gemTypes: config.gemTypes,
      text: config.text,
      mainText: config.mainText
    });
  }, [config]);
  
  // Advanced animation system
  useFrame((state) => {
    if (groupRef.current) {
      if (config.autoRotate) {
        groupRef.current.rotation.y += 0.005;
      }
      
      // Subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      
      // Dynamic lighting response
      groupRef.current.children.forEach((child, i) => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.05;
        }
      });
    }
  });


  // Dynamic bead generation
  const beads = useMemo(() => {
    const beadCount = config.beadCount || 16;
    const radius = 1.4;
    const beadArray = [];

    for (let i = 0; i < beadCount; i++) {
      const angle = (i / beadCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Vary bead sizes slightly for realism
      const size = 0.12 + Math.random() * 0.06;
      const gemType = config.gemTypes?.[i % (config.gemTypes?.length || 1)] || 'diamond';
      
      beadArray.push({
        position: [x, 0, z],
        size,
        gemType,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
      });
    }
    
    return beadArray;
  }, [config.beadCount, config.gemTypes]);

  // Premium text engraving
  const textTexture = useMemo(() => {
    const textToRender = config.text || config.mainText;
    if (!textToRender || textToRender.trim() === '') return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Premium text styling
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Add text with stroke for better visibility
    ctx.strokeText(textToRender, 256, 64);
    ctx.fillText(textToRender, 256, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.flipY = false;
    return texture;
  }, [config.text, config.mainText]);

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Sparkles for luxury effect */}
        <Sparkles 
          count={50} 
          scale={[4, 4, 4]} 
          size={2} 
          speed={0.3}
          opacity={0.6}
          color="#FFD700"
        />
        
        {/* Main bracelet band */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[1.38, 0.06, 24, 100]} />
          <meshPhysicalMaterial 
            color={config.material === 'gold' ? '#FFD700' : config.material === 'silver' ? '#E5E5E5' : '#E8B4B8'}
            metalness={1.0}
            roughness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            reflectivity={1.0}
            envMapIntensity={2.0}
          />
        </mesh>
        
        {/* Inner decorative band */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[1.32, 0.03, 16, 64]} />
          <meshPhysicalMaterial 
            color="#FFFFFF"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Premium beads/gems */}
        {beads.map((bead, i) => {
          const getGemColor = (gemType) => {
            switch(gemType) {
              case 'diamond': return '#FFFFFF';
              case 'emerald': return '#50C878';
              case 'ruby': return '#E0115F';
              case 'sapphire': return '#0F52BA';
              case 'amethyst': return '#9966CC';
              case 'topaz': return '#4682B4';
              default: return '#FFFFFF';
            }
          };
          
          const getMetalColor = (material) => {
            switch(material) {
              case 'gold': return '#FFD700';
              case 'silver': return '#E5E5E5';
              case 'rosegold': return '#E8B4B8';
              default: return '#FFD700';
            }
          };
          
          return (
            <group key={i} position={bead.position} rotation={bead.rotation}>
              {/* Main gem */}
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[bead.size, 32, 32]} />
                <meshPhysicalMaterial 
                  color={getGemColor(bead.gemType)}
                  transmission={0.8}
                  thickness={0.4}
                  roughness={0.05}
                  metalness={0}
                  clearcoat={1}
                  clearcoatRoughness={0.05}
                  ior={2.4}
                  envMapIntensity={2.5}
                />
              </mesh>
              
              {/* Gem setting */}
              <mesh castShadow receiveShadow scale={1.2} position={[0, -bead.size * 0.5, 0]}>
                <cylinderGeometry args={[bead.size * 0.8, bead.size * 0.9, 0.04, 16]} />
                <meshPhysicalMaterial 
                  color={getMetalColor(config.material)}
                  metalness={1.0}
                  roughness={0.1}
                  clearcoat={1.0}
                  clearcoatRoughness={0.1}
                  reflectivity={1.0}
                  envMapIntensity={2.0}
                />
              </mesh>
              
              {/* Inner glow */}
              <mesh scale={0.8}>
                <sphereGeometry args={[bead.size, 16, 16]} />
                <meshBasicMaterial 
                  color={getGemColor(bead.gemType)}
                  transparent 
                  opacity={0.3}
                />
              </mesh>
            </group>
          );
        })}

        {/* Premium charm with engraved text */}
        {(config.text || config.mainText) && (
          <group position={[0, -1.8, 0]}>
            {/* Main charm body */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.4, 0.45, 0.1, 16]} />
              <meshPhysicalMaterial 
                color={config.material === 'gold' ? '#FFD700' : config.material === 'silver' ? '#E5E5E5' : '#E8B4B8'}
                metalness={1.0}
                roughness={0.1}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                reflectivity={1.0}
                envMapIntensity={2.0}
              />
            </mesh>
            
            {/* Text engraving */}
            {textTexture && (
              <Center position={[0, 0, 0.06]}>
                <mesh>
                  <planeGeometry args={[0.7, 0.15]} />
                  <meshBasicMaterial 
                    map={textTexture}
                    transparent 
                    opacity={0.9}
                    alphaTest={0.1}
                  />
                </mesh>
              </Center>
            )}
            
            {/* Charm connector */}
            <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
              <torusGeometry args={[0.08, 0.02, 8, 16]} />
              <meshPhysicalMaterial 
                color={config.material === 'gold' ? '#FFD700' : config.material === 'silver' ? '#E5E5E5' : '#E8B4B8'}
                metalness={1.0}
                roughness={0.1}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                reflectivity={1.0}
                envMapIntensity={2.0}
              />
            </mesh>
          </group>
        )}

        {/* Clasp mechanism */}
        <group position={[0, 0, 1.38]} rotation={[0, 0, Math.PI / 4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.15, 0.08, 0.05]} />
            <meshPhysicalMaterial 
              color={config.material === 'gold' ? '#FFD700' : config.material === 'silver' ? '#E5E5E5' : '#E8B4B8'}
              metalness={1.0}
              roughness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              reflectivity={1.0}
              envMapIntensity={2.0}
            />
          </mesh>
          <mesh position={[0.1, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
            <meshPhysicalMaterial 
              color={config.material === 'gold' ? '#FFD700' : config.material === 'silver' ? '#E5E5E5' : '#E8B4B8'}
              metalness={1.0}
              roughness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              reflectivity={1.0}
              envMapIntensity={2.0}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
};

export default PremiumBracelet;