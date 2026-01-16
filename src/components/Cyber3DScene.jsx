import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

const ParticleNetwork = (props) => {
    const ref = useRef();
    const sphere = useMemo(() => random.inSphere(new Float32Array(4500), { radius: 1.5 }), []);

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#06b6d4" // Cyan-500
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
};

const CyberShield = () => {
    const ref = useRef();

    useFrame((state, delta) => {
        ref.current.rotation.y += delta / 2;
    });

    return (
        <group ref={ref}>
            {/* Wireframe Shield */}
            <Sphere args={[1, 16, 16]} scale={1}>
                <meshBasicMaterial color="#0891b2" wireframe transparent opacity={0.3} />
            </Sphere>
            {/* Core */}
            <Sphere args={[0.5, 32, 32]} scale={0.5}>
                <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.8} transparent opacity={0.6} />
            </Sphere>
        </group>
    );
}

const Cyber3DScene = () => {
    return (
        <div className="absolute inset-0 -z-0 opacity-60">
            <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#00d2ff" />
                <group position={[0, 0, 0]}>
                    <ParticleNetwork />
                </group>
                <group position={[2, 1, 0]}>
                    <CyberShield /> {/* Add decoration to side */}
                </group>
            </Canvas>
        </div>
    );
};

export default Cyber3DScene;
