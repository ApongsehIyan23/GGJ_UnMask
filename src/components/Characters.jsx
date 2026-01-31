import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

export function Characters() {
    return (
        <group>
            <Detective />
            <Witness />
        </group>
    );
}

function Detective() {
    const group = useRef();
    const patrolTime = useRef(0);

    useFrame((state, delta) => {
        if (!group.current) return;

        // Simple Patrol Logic: Pace back and forth
        patrolTime.current += delta * 0.5; // slow pace
        const patrolX = Math.sin(patrolTime.current) * 300; // Oscillate between -300 and 300

        // Walk towards the window (-Z) and back
        // Start: [0, -FLOOR_Y, 0]
        // Path: From Desk (200, 100) to Window (-200, -300) ??
        // Let's just walk along X for now near the desk

        group.current.position.set(200 + Math.sin(patrolTime.current) * 100, -450, 100 + Math.cos(patrolTime.current) * 50);
        group.current.rotation.y = Math.atan2(Math.cos(patrolTime.current), -Math.sin(patrolTime.current)); // Face direction
    });

    return (
        <group ref={group} position={[200, -450, 100]}>
            {/* Body (Trenchcoat) */}
            <mesh position={[0, 45, 0]} castShadow>
                <capsuleGeometry args={[15, 90, 4, 8]} />
                <meshStandardMaterial color="#3e2723" roughness={0.9} />
            </mesh>
            {/* Head (Fedora) */}
            <group position={[0, 90, 0]}>
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[12, 16, 16]} />
                    <meshStandardMaterial color="#ffccaa" />
                </mesh>
                {/* Hat */}
                <mesh position={[0, 8, 0]}>
                    <cylinderGeometry args={[14, 14, 2]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
                <mesh position={[0, 14, 0]}>
                    <cylinderGeometry args={[8, 8, 12]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            </group>
        </group>
    );
}

function Witness() {
    const group = useRef();

    useFrame(({ clock }) => {
        if (!group.current) return;
        // Nervous idle animation
        group.current.rotation.z = Math.sin(clock.elapsedTime * 5) * 0.02; // Shaking
    });

    return (
        <group ref={group} position={[700, -450, 200]} rotation={[0, -1, 0]}>
            {/* Chair is in prop, this is just person */}
            {/* Body */}
            <mesh position={[0, 35, 0]} castShadow>
                <boxGeometry args={[30, 70, 30]} />
                <meshStandardMaterial color="#556" />
            </mesh>
            {/* Head */}
            <mesh position={[0, 75, 0]}>
                <sphereGeometry args={[10, 16, 16]} />
                <meshStandardMaterial color="#aa8866" />
            </mesh>
            {/* Legs (Sitting) */}
            <mesh position={[0, 15, 20]}>
                <boxGeometry args={[30, 20, 30]} />
                <meshStandardMaterial color="#334" />
            </mesh>
        </group>
    );
}
