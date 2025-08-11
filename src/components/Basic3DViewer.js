import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Basic rotating cube as fallback
function RotatingCube({ color = '#FFD700' }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Simple bracelet model
function SimpleBracelet({ config }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current && config.autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main ring */}
      <mesh>
        <torusGeometry args={[2, 0.3, 16, 100]} />
        <meshStandardMaterial 
          color={config.color || '#FFD700'} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Beads */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 2;
        const z = Math.sin(angle) * 2;
        const beadColor = config.beadColors?.[i] || config.color || '#FFD700';
        
        return (
          <mesh key={i} position={[x, 0, z]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={beadColor} />
          </mesh>
        );
      })}
      
      {/* Text charm */}
      {config.text && (
        <mesh position={[0, -2.5, 0]}>
          <boxGeometry args={[1, 0.6, 0.2]} />
          <meshStandardMaterial color={config.charmColor || config.color || '#FFD700'} />
        </mesh>
      )}
    </group>
  );
}

// Simple necklace model  
function SimpleNecklace({ config }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current && config.autoRotate) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Chain segments */}
      {Array.from({ length: 20 }).map((_, i) => {
        const t = i / 19;
        const angle = Math.PI * t - Math.PI / 2;
        const x = Math.sin(angle) * 3;
        const y = -Math.cos(angle) * 3 + 3;
        
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, i % 2 === 0 ? 0 : Math.PI / 2]}>
            <torusGeometry args={[0.1, 0.03, 8, 16]} />
            <meshStandardMaterial 
              color={config.chainColor || '#FFD700'} 
              metalness={0.9} 
              roughness={0.1} 
            />
          </mesh>
        );
      })}
      
      {/* Pendant */}
      <mesh position={[0, -3, 0]}>
        {config.pendantShape === 'square' ? (
          <boxGeometry args={[0.8, 0.8, 0.2]} />
        ) : (
          <sphereGeometry args={[0.4, 32, 32]} />
        )}
        <meshStandardMaterial 
          color={config.color || '#FFD700'} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
    </group>
  );
}

// Simple earrings model
function SimpleEarrings({ config }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.children.forEach((earring, i) => {
        earring.rotation.y = Math.sin(state.clock.elapsedTime + i * Math.PI) * 0.2;
      });
    }
  });

  const EarringPiece = ({ position }) => (
    <group position={position}>
      {/* Hook */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        <meshStandardMaterial color={config.hookColor || '#FFD700'} />
      </mesh>
      
      {/* Main part */}
      <mesh position={[0, -0.3, 0]}>
        {config.style === 'hoop' ? (
          <torusGeometry args={[0.5, 0.05, 16, 32]} />
        ) : (
          <sphereGeometry args={[0.2, 16, 16]} />
        )}
        <meshStandardMaterial 
          color={config.color || '#FFD700'} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
    </group>
  );

  return (
    <group ref={meshRef}>
      <EarringPiece position={[-1, 0, 0]} />
      <EarringPiece position={[1, 0, 0]} />
    </group>
  );
}

// Simple phone case model
function SimplePhoneCase({ config }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current && config.autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Case body */}
      <mesh>
        <boxGeometry args={[3, 5, 0.4]} />
        <meshStandardMaterial color={config.color || '#FFB6C1'} />
      </mesh>
      
      {/* Camera hole */}
      <mesh position={[1, 2, 0.1]}>
        <boxGeometry args={[0.6, 0.6, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

// Main product component
function ProductModel({ config, selectedProduct }) {
  if (!config) {
    return <RotatingCube color="#FFD700" />;
  }

  // Determine product type
  let productType = config.type;
  if (selectedProduct) {
    if (selectedProduct.category === 'bracelets') productType = 'bracelet';
    else if (selectedProduct.category === 'necklaces') productType = 'necklace';
    else if (selectedProduct.category === 'earrings') productType = 'earrings';
    else if (selectedProduct.category === 'accessories') productType = 'phone-case';
  }

  switch (productType) {
    case 'necklace':
      return <SimpleNecklace config={config} />;
    case 'earrings':
      return <SimpleEarrings config={config} />;
    case 'phone-case':
      return <SimplePhoneCase config={config} />;
    case 'bracelet':
    default:
      return <SimpleBracelet config={config} />;
  }
}

// Main 3D Viewer Component
const Basic3DViewer = ({ config, selectedProduct }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Product */}
        <ProductModel config={config} selectedProduct={selectedProduct} />
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={15}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-white/80 rounded-lg p-3">
        <h3 className="font-semibold">
          {selectedProduct?.name || 'Custom Product'}
        </h3>
        <p className="text-sm text-gray-600">
          ${selectedProduct?.price || 48}
        </p>
      </div>
      
      <div className="absolute bottom-4 right-4 bg-white/80 rounded-lg p-2">
        <p className="text-xs text-gray-600">
          Drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  );
};

export default Basic3DViewer;