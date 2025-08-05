import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const CameraController = ({ 
  preset = 'hero', 
  autoRotate = false, 
  enableControls = true,
  target = [0, 0, 0]
}) => {
  const { camera } = useThree();
  const controlsRef = useRef();
  const targetRef = useRef(new THREE.Vector3(...target));
  const isAnimating = useRef(false);

  // Professional camera presets for jewelry photography
  const cameraPresets = {
    hero: {
      position: [3, 2, 3],
      target: [0, -0.2, 0],
      fov: 35,
      description: 'Hero shot - Perfect for marketing'
    },
    detail: {
      position: [1.5, 0.5, 1.5],
      target: [0, 0, 0],
      fov: 25,
      description: 'Close-up detail view'
    },
    front: {
      position: [0, 0.5, 4],
      target: [0, 0, 0],
      fov: 30,
      description: 'Front view - Classic presentation'
    },
    side: {
      position: [4, 0.5, 0],
      target: [0, 0, 0],
      fov: 30,
      description: 'Side profile view'
    },
    top: {
      position: [0, 5, 0.5],
      target: [0, 0, 0],
      fov: 40,
      description: 'Top-down view'
    },
    dramatic: {
      position: [-3, 3, 3],
      target: [0, -0.5, 0],
      fov: 45,
      description: 'Dramatic angle'
    },
    macro: {
      position: [0.8, 0.2, 0.8],
      target: [0, 0, 0],
      fov: 20,
      description: 'Extreme close-up'
    },
    catalog: {
      position: [2, 1, 2],
      target: [0, 0, 0],
      fov: 35,
      description: 'Product catalog view'
    },
    social: {
      position: [2.5, 1.5, 2.5],
      target: [0, -0.3, 0],
      fov: 38,
      description: 'Social media optimized'
    }
  };

  // Smooth camera animation with easing
  const animateCamera = (targetPreset, duration = 1500) => {
    if (!cameraPresets[targetPreset] || isAnimating.current) return;
    
    const preset = cameraPresets[targetPreset];
    const startPosition = camera.position.clone();
    const startTarget = targetRef.current.clone();
    const startFov = camera.fov;
    
    const endPosition = new THREE.Vector3(...preset.position);
    const endTarget = new THREE.Vector3(...preset.target);
    const endFov = preset.fov;
    
    const startTime = performance.now();
    isAnimating.current = true;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      
      // Animate camera position
      camera.position.lerpVectors(startPosition, endPosition, eased);
      
      // Animate target
      targetRef.current.lerpVectors(startTarget, endTarget, eased);
      
      // Animate field of view
      camera.fov = THREE.MathUtils.lerp(startFov, endFov, eased);
      camera.updateProjectionMatrix();
      
      // Update controls target
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetRef.current);
        controlsRef.current.update();
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;
      }
    };
    
    animate();
  };

  // Initialize camera on preset change
  useEffect(() => {
    if (preset && cameraPresets[preset]) {
      animateCamera(preset);
    }
  }, [preset]);

  // Auto-rotation for hero shots
  useFrame(() => {
    if (autoRotate && !isAnimating.current && controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 0.5;
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={enableControls}
      target={targetRef.current}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={1.5}
      maxDistance={10}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI - Math.PI / 6}
      minAzimuthAngle={-Math.PI}
      maxAzimuthAngle={Math.PI}
      dampingFactor={0.05}
      enableDamping={true}
      rotateSpeed={0.8}
      zoomSpeed={0.8}
      panSpeed={0.8}
      screenSpacePanning={false}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
    />
  );
};

// Camera preset utilities
export const getCameraPresets = () => {
  return {
    hero: { position: [3, 2, 3], target: [0, -0.2, 0], fov: 35, description: 'Hero shot - Perfect for marketing' },
    detail: { position: [1.5, 0.5, 1.5], target: [0, 0, 0], fov: 25, description: 'Close-up detail view' },
    front: { position: [0, 0.5, 4], target: [0, 0, 0], fov: 30, description: 'Front view - Classic presentation' },
    side: { position: [4, 0.5, 0], target: [0, 0, 0], fov: 30, description: 'Side profile view' },
    top: { position: [0, 5, 0.5], target: [0, 0, 0], fov: 40, description: 'Top-down view' },
    dramatic: { position: [-3, 3, 3], target: [0, -0.5, 0], fov: 45, description: 'Dramatic angle' },
    macro: { position: [0.8, 0.2, 0.8], target: [0, 0, 0], fov: 20, description: 'Extreme close-up' },
    catalog: { position: [2, 1, 2], target: [0, 0, 0], fov: 35, description: 'Product catalog view' },
    social: { position: [2.5, 1.5, 2.5], target: [0, -0.3, 0], fov: 38, description: 'Social media optimized' }
  };
};

export default CameraController;