import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Center } from '@react-three/drei';
import { useLocation } from 'react-router-dom';
import { 
  FaShoppingCart, FaExpand, FaCompress, FaMagic
} from 'react-icons/fa';

// EXACT PRODUCT MODELS - Each matches the real product selected

// 1. Custom Initial Bracelet Model
const CustomInitialBraceletModel = ({ config }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current && config.autoRotate) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={1} floatIntensity={0.2}>
      <group ref={meshRef}>
        {/* Chain band */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[1.2, 0.05, 16, 100]} />
          <meshStandardMaterial 
            color={config.color}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Initial charm */}
        <group position={[0, -1.5, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.6, 0.1]} />
            <meshStandardMaterial 
              color={config.charmColor || config.color}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Initial letter */}
          {config.text && (
            <mesh position={[0, 0, 0.06]}>
              <planeGeometry args={[0.4, 0.4]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          )}
        </group>
      </group>
    </Float>
  );
};

// 2. Beaded Charm Bracelet Model
const BeadedCharmBraceletModel = ({ config }) => {
  const meshRef = useRef();
  const beadCount = 12;
  const radius = 1.3;
  
  useFrame(() => {
    if (meshRef.current && config.autoRotate) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.3}>
      <group ref={meshRef}>
        {/* Elastic band */}
        <mesh>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Beads with actual colors from config */}
        {Array.from({ length: beadCount }).map((_, i) => {
          const angle = (i / beadCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const beadColor = config.beadColors?.[i % config.beadColors.length] || config.color;
          
          return (
            <mesh key={i} position={[x, 0, z]} castShadow receiveShadow>
              <sphereGeometry args={[0.12, 32, 32]} />
              <meshStandardMaterial 
                color={beadColor}
                metalness={config.material === 'metal' ? 0.8 : 0.1}
                roughness={config.material === 'metal' ? 0.2 : 0.5}
              />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
};

// 3. Layered Initial Necklace Model
const LayeredInitialNecklaceModel = ({ config }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current && config.autoRotate) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  const createChain = (length, yOffset) => {
    const links = [];
    const linkCount = Math.floor(length * 10);
    
    for (let i = 0; i < linkCount; i++) {
      const t = i / (linkCount - 1);
      const angle = Math.PI * t - Math.PI / 2;
      const x = Math.sin(angle) * length;
      const y = -Math.cos(angle) * length + length + yOffset;
      
      links.push(
        <mesh key={i} position={[x, y, 0]} rotation={[0, 0, i % 2 === 0 ? 0 : Math.PI / 2]}>
          <torusGeometry args={[0.03, 0.008, 8, 16]} />
          <meshStandardMaterial 
            color={config.chainColor || config.color}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      );
    }
    return links;
  };

  return (
    <Float speed={1} floatIntensity={0.1}>
      <group ref={meshRef}>
        {/* Three layered chains */}
        <group>{createChain(1.2, 0.5)}</group>
        <group>{createChain(1.5, 0.2)}</group>
        <group>{createChain(1.8, -0.1)}</group>
        
        {/* Initial pendants */}
        {config.text && config.text.split('').slice(0, 3).map((letter, i) => (
          <group key={i} position={[0, -1.2 - i * 0.3, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
              <meshStandardMaterial 
                color={config.color}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </group>
        ))}
      </group>
    </Float>
  );
};

// 4. Custom Name Necklace Model
const CustomNameNecklaceModel = ({ config }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current && config.autoRotate) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  // Chain links
  const chainLinks = [];
  const linkCount = 40;
  for (let i = 0; i < linkCount; i++) {
    const t = i / (linkCount - 1);
    const angle = Math.PI * t - Math.PI / 2;
    const x = Math.sin(angle) * 2;
    const y = -Math.cos(angle) * 2 + 2;
    
    chainLinks.push(
      <mesh key={i} position={[x, y, 0]} rotation={[0, 0, i % 2 === 0 ? 0 : Math.PI / 2]}>
        <torusGeometry args={[0.025, 0.008, 8, 16]} />
        <meshStandardMaterial 
          color={config.chainColor || config.color}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
    );
  }

  return (
    <Float speed={2} floatIntensity={0.1}>
      <group ref={meshRef}>
        {/* Chain */}
        <group>{chainLinks}</group>
        
        {/* Name plate */}
        <group position={[0, -1.8, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[Math.max(1.5, (config.text?.length || 4) * 0.25), 0.3, 0.08]} />
            <meshStandardMaterial 
              color={config.color}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
};

// 5. Custom Hoop Earrings Model
const CustomHoopEarringsModel = ({ config }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.children.forEach((earring, i) => {
        earring.rotation.y = Math.sin(state.clock.elapsedTime + i * Math.PI) * 0.1;
      });
    }
  });

  const HoopEarring = ({ position }) => (
    <group position={position}>
      {/* Hook */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.08, 0.01, 16, 32]} />
        <meshStandardMaterial 
          color={config.hookColor || config.color}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Hoop */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[0.3, 0.02, 16, 100]} />
        <meshStandardMaterial 
          color={config.color}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Charm if text exists */}
      {config.text && (
        <group position={[0, -0.4, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.15, 0.15, 0.03]} />
            <meshStandardMaterial 
              color={config.charmColor || config.color}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      )}
    </group>
  );

  return (
    <Float speed={2} floatIntensity={0.1}>
      <group ref={meshRef}>
        <HoopEarring position={[-0.5, 0, 0]} />
        <HoopEarring position={[0.5, 0, 0]} />
      </group>
    </Float>
  );
};

// 6. Birthstone Studs Model
const BirthstoneStudsModel = ({ config }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && config.autoRotate) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  const StudEarring = ({ position }) => (
    <group position={position}>
      {/* Stud base */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.06, 32]} />
        <meshStandardMaterial 
          color={config.color}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Birthstone */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial 
          color={config.birthstoneColor || '#FFFFFF'}
          metalness={0}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );

  return (
    <Float speed={3} floatIntensity={0.2}>
      <group ref={meshRef}>
        <StudEarring position={[-0.3, 0, 0]} />
        <StudEarring position={[0.3, 0, 0]} />
      </group>
    </Float>
  );
};

// 7. Personalized Phone Case Model
const PersonalizedPhoneCaseModel = ({ config }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current && config.autoRotate) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={1} floatIntensity={0.3}>
      <group ref={meshRef}>
        {/* Phone case */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 3, 0.2]} />
          <meshStandardMaterial 
            color={config.color}
            roughness={0.4}
          />
        </mesh>
        
        {/* Camera cutout */}
        <mesh position={[0.4, 1.2, 0.1]}>
          <boxGeometry args={[0.3, 0.3, 0.1]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Text/Pattern area */}
        {config.text && (
          <mesh position={[0, -0.5, 0.11]}>
            <planeGeometry args={[1.2, 0.4]} />
            <meshBasicMaterial color={config.textColor || "#FFFFFF"} />
          </mesh>
        )}
      </group>
    </Float>
  );
};

// PRODUCT SELECTOR - Maps exact product names to 3D models
const ProductModelSelector = ({ config, selectedProduct }) => {
  if (!selectedProduct) {
    return <CustomInitialBraceletModel config={config} />;
  }

  const productName = selectedProduct.name.toLowerCase();
  
  // Exact product name matching
  if (productName.includes('initial bracelet')) {
    return <CustomInitialBraceletModel config={config} />;
  } else if (productName.includes('beaded') && productName.includes('bracelet')) {
    return <BeadedCharmBraceletModel config={config} />;
  } else if (productName.includes('layered') && productName.includes('necklace')) {
    return <LayeredInitialNecklaceModel config={config} />;
  } else if (productName.includes('name necklace')) {
    return <CustomNameNecklaceModel config={config} />;
  } else if (productName.includes('hoop earrings')) {
    return <CustomHoopEarringsModel config={config} />;
  } else if (productName.includes('birthstone') && productName.includes('studs')) {
    return <BirthstoneStudsModel config={config} />;
  } else if (productName.includes('phone case')) {
    return <PersonalizedPhoneCaseModel config={config} />;
  }
  
  // Fallback to category
  switch (selectedProduct.category) {
    case 'bracelets':
      return <CustomInitialBraceletModel config={config} />;
    case 'necklaces':
      return <CustomNameNecklaceModel config={config} />;
    case 'earrings':
      return <CustomHoopEarringsModel config={config} />;
    case 'accessories':
      return <PersonalizedPhoneCaseModel config={config} />;
    default:
      return <CustomInitialBraceletModel config={config} />;
  }
};

// MAIN CUSTOMIZER COMPONENT
const FixedProductCustomizer = () => {
  const location = useLocation();
  const selectedProduct = location.state?.product;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // PRODUCT-SPECIFIC INITIAL CONFIG
  const getInitialConfig = () => {
    const baseConfig = {
      color: '#FFD700',
      chainColor: '#FFD700',
      hookColor: '#FFD700',
      charmColor: '#FFD700',
      textColor: '#000000',
      text: '',
      material: 'gold',
      autoRotate: true,
      birthstoneColor: '#FFFFFF'
    };

    if (selectedProduct?.category === 'bracelets') {
      return {
        ...baseConfig,
        beadColors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
      };
    }
    
    return baseConfig;
  };

  const [productConfig, setProductConfig] = useState(getInitialConfig());

  // REAL-TIME CONFIG UPDATE FUNCTION
  const updateConfig = (updates) => {
    console.log('Updating config with:', updates); // Debug log
    setProductConfig(prev => {
      const newConfig = { ...prev, ...updates };
      console.log('New config:', newConfig); // Debug log
      return newConfig;
    });
  };

  // GET CUSTOMIZATION OPTIONS BASED ON SELECTED PRODUCT
  const getCustomizationOptions = () => {
    if (!selectedProduct) return {};

    const productName = selectedProduct.name.toLowerCase();
    const category = selectedProduct.category;

    if (productName.includes('beaded') || category === 'bracelets') {
      return {
        showBeadColors: true,
        showMaterials: true,
        showText: true,
        showChainColor: false
      };
    } else if (category === 'necklaces') {
      return {
        showBeadColors: false,
        showMaterials: true,
        showText: true,
        showChainColor: true
      };
    } else if (category === 'earrings') {
      return {
        showBeadColors: false,
        showMaterials: true,
        showText: productName.includes('hoop'),
        showChainColor: false,
        showBirthstone: productName.includes('birthstone')
      };
    } else if (category === 'accessories') {
      return {
        showBeadColors: false,
        showMaterials: false,
        showText: true,
        showChainColor: false,
        showPattern: true
      };
    }

    return {
      showMaterials: true,
      showText: true
    };
  };

  const options = getCustomizationOptions();

  const materialOptions = [
    { id: 'gold', name: 'Gold', color: '#FFD700' },
    { id: 'silver', name: 'Silver', color: '#C0C0C0' },
    { id: 'rose-gold', name: 'Rose Gold', color: '#B76E79' },
    { id: 'metal', name: 'Metal', color: '#888888' }
  ];

  const beadColorPalettes = [
    { name: 'Rainbow', colors: ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#4B0082'] },
    { name: 'Ocean', colors: ['#00CED1', '#4682B4', '#1E90FF', '#000080', '#87CEEB', '#48D1CC'] },
    { name: 'Sunset', colors: ['#FF6B6B', '#FF8E53', '#FE6B8B', '#FF8E53', '#FFD93D', '#FF6B9D'] },
    { name: 'Pastels', colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#FFBABA'] }
  ];

  const birthstoneColors = [
    { month: 'January', color: '#8B0000', name: 'Garnet' },
    { month: 'February', color: '#9370DB', name: 'Amethyst' },
    { month: 'March', color: '#40E0D0', name: 'Aquamarine' },
    { month: 'April', color: '#FFFFFF', name: 'Diamond' },
    { month: 'May', color: '#50C878', name: 'Emerald' },
    { month: 'June', color: '#F0F8FF', name: 'Pearl' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className={`flex ${isFullscreen ? 'h-screen' : 'min-h-screen'}`}>
        {/* 3D VIEWER */}
        <div className={`${isFullscreen ? 'w-full' : 'w-3/5'} relative bg-gradient-to-br from-gray-100 to-gray-200`}>
          {/* Header */}
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4">
            <h1 className="text-xl font-bold text-purple-800">
              {selectedProduct?.name || 'Product Customizer'}
            </h1>
            <p className="text-sm text-gray-600">${selectedProduct?.price || 48}</p>
          </div>

          {/* Controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => updateConfig({ autoRotate: !productConfig.autoRotate })}
              className={`p-3 rounded-full shadow-lg transition-all ${
                productConfig.autoRotate ? 'bg-purple-600 text-white' : 'bg-white'
              }`}
            >
              <FaMagic />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>

          {/* 3D Canvas */}
          <div className="h-full">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              shadows
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
              <pointLight position={[-10, -10, -5]} intensity={0.5} />
              
              <Center>
                <ProductModelSelector config={productConfig} selectedProduct={selectedProduct} />
              </Center>
              
              <Environment preset="studio" />
              
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={8}
                autoRotate={productConfig.autoRotate}
                autoRotateSpeed={1}
              />
            </Canvas>
          </div>
        </div>

        {/* CUSTOMIZATION PANEL */}
        {!isFullscreen && (
          <div className="w-2/5 bg-white shadow-2xl p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">
              Customize {selectedProduct?.name || 'Product'}
            </h2>

            {/* MATERIALS */}
            {options.showMaterials && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Material</h3>
                <div className="grid grid-cols-2 gap-3">
                  {materialOptions.map(material => (
                    <button
                      key={material.id}
                      onClick={() => updateConfig({ 
                        material: material.id,
                        color: material.color,
                        chainColor: material.color,
                        hookColor: material.color,
                        charmColor: material.color
                      })}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        productConfig.material === material.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: material.color }}
                      />
                      <p className="text-sm font-medium">{material.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BEAD COLORS */}
            {options.showBeadColors && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Bead Colors</h3>
                {beadColorPalettes.map(palette => (
                  <button
                    key={palette.name}
                    onClick={() => updateConfig({ beadColors: palette.colors })}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg mb-2 hover:border-purple-600 transition-all"
                  >
                    <p className="font-medium mb-2">{palette.name}</p>
                    <div className="flex gap-1">
                      {palette.colors.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 h-4 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* BIRTHSTONE SELECTION */}
            {options.showBirthstone && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Birthstone</h3>
                <div className="grid grid-cols-2 gap-2">
                  {birthstoneColors.map(stone => (
                    <button
                      key={stone.month}
                      onClick={() => updateConfig({ birthstoneColor: stone.color })}
                      className={`p-2 border-2 rounded-lg transition-all ${
                        productConfig.birthstoneColor === stone.color
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: stone.color }}
                      />
                      <p className="text-xs">{stone.month}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TEXT PERSONALIZATION */}
            {options.showText && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Personalization</h3>
                <input
                  type="text"
                  value={productConfig.text}
                  onChange={(e) => updateConfig({ text: e.target.value })}
                  placeholder="Enter text..."
                  maxLength={15}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 transition-all"
                />
                <p className="text-sm text-gray-500 mt-1">{productConfig.text.length}/15 characters</p>
              </div>
            )}

            {/* ADD TO CART */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-purple-800">
                  ${(selectedProduct?.price || 48) + (productConfig.text ? 10 : 0)}
                </span>
                <span className="text-sm text-gray-500">Free shipping</span>
              </div>
              <button className="w-full py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
                <FaShoppingCart />
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixedProductCustomizer;