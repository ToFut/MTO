import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Environment, 
  ContactShadows, 
  Lightformer, 
  AccumulativeShadows, 
  RandomizedLight,
  BakeShadows
} from '@react-three/drei';
import * as THREE from 'three';

const StudioEnvironment = ({ preset = 'studio', quality = 'high' }) => {
  const lightRef = useRef();
  
  // Dynamic lighting animation
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 2;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 2;
    }
  });

  const environmentSettings = {
    studio: {
      environment: 'studio',
      lights: {
        key: { position: [10, 10, 5], intensity: 2, color: '#ffffff' },
        fill: { position: [-5, 5, 2], intensity: 0.8, color: '#f0f8ff' },
        rim: { position: [0, 5, -10], intensity: 1.2, color: '#fff5ee' },
        ambient: { intensity: 0.3 }
      }
    },
    jewelry: {
      environment: 'city',
      lights: {
        key: { position: [8, 12, 6], intensity: 2.5, color: '#ffffff' },
        fill: { position: [-8, 8, 4], intensity: 1.0, color: '#e6f3ff' },
        rim: { position: [0, 6, -12], intensity: 1.5, color: '#fffaf0' },
        ambient: { intensity: 0.4 }
      }
    },
    dramatic: {
      environment: 'sunset',
      lights: {
        key: { position: [12, 8, 8], intensity: 3, color: '#ffb366' },
        fill: { position: [-6, 6, 3], intensity: 0.6, color: '#4d79ff' },
        rim: { position: [0, 4, -8], intensity: 2, color: '#ff6b6b' },
        ambient: { intensity: 0.2 }
      }
    },
    luxury: {
      environment: 'warehouse',
      lights: {
        key: { position: [15, 15, 10], intensity: 2.8, color: '#fff8dc' },
        fill: { position: [-10, 10, 5], intensity: 1.2, color: '#f5f5dc' },
        rim: { position: [0, 8, -15], intensity: 1.8, color: '#ffd700' },
        ambient: { intensity: 0.35 }
      }
    }
  };

  const settings = environmentSettings[preset] || environmentSettings.studio;

  return (
    <>
      {/* HDR Environment */}
      <Environment 
        preset={settings.environment}
        background={false}
        blur={0.8}
      >
        {/* Custom light formers for jewelry photography */}
        <Lightformer
          intensity={2}
          color="white"
          position={[10, 10, 10]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          intensity={1}
          color="#f0f8ff"
          position={[-10, 5, 5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[10, 5, 1]}
        />
        <Lightformer
          intensity={1.5}
          color="#fff5ee"
          position={[0, 8, -10]}
          rotation={[Math.PI / 4, 0, 0]}
          scale={[15, 5, 1]}
        />
      </Environment>

      {/* Professional 3-point lighting setup */}
      <ambientLight 
        intensity={settings.lights.ambient.intensity} 
        color="#ffffff"
      />
      
      {/* Key light */}
      <directionalLight
        ref={lightRef}
        position={settings.lights.key.position}
        intensity={settings.lights.key.intensity}
        color={settings.lights.key.color}
        castShadow
        shadow-mapSize-width={quality === 'high' ? 4096 : 2048}
        shadow-mapSize-height={quality === 'high' ? 4096 : 2048}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light */}
      <directionalLight
        position={settings.lights.fill.position}
        intensity={settings.lights.fill.intensity}
        color={settings.lights.fill.color}
      />
      
      {/* Rim light */}
      <directionalLight
        position={settings.lights.rim.position}
        intensity={settings.lights.rim.intensity}
        color={settings.lights.rim.color}
      />

      {/* Accent lights for sparkle */}
      <pointLight
        position={[5, 5, 5]}
        intensity={0.8}
        color="#ffffff"
        distance={20}
        decay={2}
      />
      <pointLight
        position={[-5, 3, -3]}
        intensity={0.6}
        color="#f0f8ff"
        distance={15}
        decay={2}
      />

      {/* Volumetric lighting */}
      <spotLight
        position={[0, 10, 0]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={0.5}
        color="#ffffff"
        castShadow
      />

      {/* Professional ground setup */}
      {/* Reflective floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.1}
          reflectivity={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* High-quality contact shadows */}
      <ContactShadows
        opacity={0.6}
        scale={8}
        blur={2.5}
        far={4}
        resolution={quality === 'high' ? 1024 : 512}
        color="#000000"
        position={[0, -2.4, 0]}
      />

      {/* Accumulative shadows for realism */}
      <AccumulativeShadows
        position={[0, -2.45, 0]}
        frames={quality === 'high' ? 200 : 100}
        alphaTest={0.85}
        opacity={0.75}
        scale={8}
        size={2048}
      >
        <RandomizedLight
          amount={8}
          radius={4}
          ambient={0.5}
          intensity={1}
          position={[5, 5, -10]}
          bias={0.001}
        />
      </AccumulativeShadows>

      {/* Background gradient */}
      <mesh position={[0, 0, -20]} scale={[50, 30, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
    </>
  );
};

export default StudioEnvironment;