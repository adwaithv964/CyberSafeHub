import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const ShieldMesh = () => {
    const meshRef = useRef();

    useFrame((state, delta) => {
        // Slowly rotate to look high-tech
        meshRef.current.rotation.y += delta * 0.5;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
    });

    return (
        <group ref={meshRef}>
            <mesh position={[0, 0, 0]}>
                <icosahedronGeometry args={[2, 0]} />
                <meshStandardMaterial 
                    color="#00a8e8" 
                    wireframe 
                    transparent 
                    opacity={0.8}
                />
            </mesh>
            <mesh position={[0, 0, 0]} scale={0.8}>
                <icosahedronGeometry args={[2, 1]} />
                <meshStandardMaterial 
                    color="#00a8e8" 
                    transparent 
                    opacity={0.2}
                    emissive="#00a8e8"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </group>
    );
};

export default function Shield3D({ className }) {
    return (
        <div className={`relative ${className}`}>
            {/* The pointLight creates the glow effect on the geometric shapes */}
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00a8e8" />
                <ShieldMesh />
            </Canvas>
        </div>
    );
}
