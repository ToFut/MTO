import React, { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment, ContactShadows, useTexture, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ChromePicker } from 'react-color';
import { FaCube, FaPalette, FaFont, FaImage, FaUndo, FaRedo, FaExpand, FaCompress, FaDownload, FaShare } from 'react-icons/fa';
import * as THREE from 'three';

const ToteBag3D = ({ color, material, text, logo, selectedView }) => {
  const meshRef = useRef();
  const textRef = useRef();
  
  const canvasTexture = useTexture('/textures/canvas.jpg');
  const leatherTexture = useTexture('/textures/leather.jpg');
  const denimTexture = useTexture('/textures/denim.jpg');
  
  const textures = {
    canvas: canvasTexture,
    leather: leatherTexture,
    denim: denimTexture
  };
  
  const currentTexture = textures[material] || canvasTexture;
  
  return (
    <group ref={meshRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 4, 0.8]} />
        <meshStandardMaterial 
          color={color}
          map={currentTexture}
          roughness={material === 'leather' ? 0.8 : 0.9}
          metalness={material === 'leather' ? 0.1 : 0}
        />
      </mesh>
      
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[1.2, 2.2, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-1.2, 2.2, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {text && (
        <Text
          ref={textRef}
          position={[0, 0, 0.41]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.ttf"
        >
          {text}
        </Text>
      )}
    </group>
  );
};

const ProductCustomizer = () => {
  const [selectedColor, setSelectedColor] = useState('#8B4513');
  const [selectedMaterial, setSelectedMaterial] = useState('canvas');
  const [customText, setCustomText] = useState('');
  const [selectedView, setSelectedView] = useState('3d');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedTab, setSelectedTab] = useState('color');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const materials = [
    { id: 'canvas', name: 'Canvas', preview: '#F5E6D3' },
    { id: 'leather', name: 'Leather', preview: '#8B4513' },
    { id: 'denim', name: 'Denim', preview: '#1E3A8A' }
  ];
  
  const presetColors = [
    '#8B4513', '#000000', '#FFFFFF', '#DC143C', 
    '#4169E1', '#228B22', '#FFD700', '#FF69B4'
  ];
  
  const customizationTabs = [
    { id: 'color', name: 'Color', icon: FaPalette },
    { id: 'material', name: 'Material', icon: FaCube },
    { id: 'text', name: 'Text', icon: FaFont },
    { id: 'design', name: 'Design', icon: FaImage }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen">
        <div className={`${isFullscreen ? 'w-full' : 'w-2/3'} relative bg-white`}>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <FaDownload />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <FaShare />
            </motion.button>
          </div>
          
          <Canvas
            shadows
            camera={{ position: [0, 0, 8], fov: 50 }}
            className="h-full"
          >
            <ambientLight intensity={0.5} />
            <directionalLight
              castShadow
              position={[10, 10, 5]}
              intensity={1}
              shadow-mapSize={[1024, 1024]}
            />
            <Suspense fallback={null}>
              <Center>
                <ToteBag3D 
                  color={selectedColor}
                  material={selectedMaterial}
                  text={customText}
                  selectedView={selectedView}
                />
              </Center>
              <ContactShadows
                position={[0, -2.5, 0]}
                opacity={0.5}
                scale={10}
                blur={2}
                far={10}
              />
              <Environment preset="studio" />
            </Suspense>
            <OrbitControls
              enablePan={false}
              maxPolarAngle={Math.PI / 2}
              minDistance={5}
              maxDistance={15}
            />
          </Canvas>
        </div>
        
        {!isFullscreen && (
          <motion.div 
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            className="w-1/3 bg-white shadow-2xl p-6 overflow-y-auto"
          >
            <h2 className="text-3xl font-bold mb-6">Customize Your Tote</h2>
            
            <div className="flex gap-2 mb-6">
              {customizationTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                    ${selectedTab === tab.id 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <tab.icon size={16} />
                  {tab.name}
                </motion.button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              {selectedTab === 'color' && (
                <motion.div
                  key="color"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-3">Choose Color</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {presetColors.map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(color)}
                        className={`w-full aspect-square rounded-lg border-4 transition-all ${
                          selectedColor === color ? 'border-black' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full py-3 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-all"
                  >
                    Custom Color
                  </motion.button>
                  {showColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex justify-center"
                    >
                      <ChromePicker
                        color={selectedColor}
                        onChange={(color) => setSelectedColor(color.hex)}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
              
              {selectedTab === 'material' && (
                <motion.div
                  key="material"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-3">Select Material</h3>
                  {materials.map((material) => (
                    <motion.button
                      key={material.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMaterial(material.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                        selectedMaterial === material.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: material.preview }}
                      />
                      <div className="text-left">
                        <h4 className="font-semibold">{material.name}</h4>
                        <p className="text-sm text-gray-500">Premium quality</p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
              
              {selectedTab === 'text' && (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-3">Add Text</h3>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter your text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black transition-all"
                    maxLength={20}
                  />
                  <p className="text-sm text-gray-500">{customText.length}/20 characters</p>
                </motion.div>
              )}
              
              {selectedTab === 'design' && (
                <motion.div
                  key="design"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-3">Upload Design</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FaImage size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Drop your design here</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-black text-white rounded-lg font-medium"
                    >
                      Browse Files
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold">$45.00</span>
                <span className="text-sm text-gray-500">Free shipping</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-black text-white rounded-lg font-semibold text-lg hover:bg-gray-900 transition-all"
              >
                Add to Cart
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductCustomizer;