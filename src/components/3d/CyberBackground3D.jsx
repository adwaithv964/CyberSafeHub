import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = () => {
  const pointsRef = useRef();

  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
       // Spread particles in a long tunnel along the Z axis
       pos[i * 3] = (Math.random() - 0.5) * 40; // X
       pos[i * 3 + 1] = (Math.random() - 0.5) * 40; // Y
       pos[i * 3 + 2] = (Math.random() - 0.5) * 100 - 50; // Z
    }
    return pos;
  }, [particleCount]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Move particles towards camera (positive Z)
      pointsRef.current.position.z += delta * 15;
      
      // Loop the tunnel
      if (pointsRef.current.position.z > 50) {
         pointsRef.current.position.z = 0;
      }

      // Smooth parallax effect based on mouse cursor
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, state.pointer.y * 0.2, 0.05);
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, state.pointer.x * 0.4, 0.05);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08}
        color="#00a8e8" // CyberSafeHub Accent Blue
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default function CyberBackground3D() {
  return (
    <div className="absolute inset-0 z-0 bg-[#02040a]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ antialias: false, alpha: false }}>
        <ParticleField />
        {/* Fog to fade out particles smoothly in the distance */}
        <fog attach="fog" args={['#02040a', 10, 50]} />
      </Canvas>
    </div>
  );
}
