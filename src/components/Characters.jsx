import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Billboard, Text } from '@react-three/drei';
import { FLOOR_Y } from '../game/Physics';

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
    const texture = useLoader(TextureLoader, '/textures/silas_sprite.png');

    // Patrol Logic
    useFrame(({ clock }) => {
        if (!group.current) return;

        // Stationary for Interrogation
        group.current.position.set(200, -FLOOR_Y + 75, 100);

        // Always face player/camera
        group.current.scale.x = 1;
    });

    return (
        <group ref={group} position={[200, -FLOOR_Y + 75, 100]}>
            <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                <mesh castShadow receiveShadow>
                    <planeGeometry args={[100, 150]} /> {/* Aspect ratio approx 2:3 */}
                    <meshStandardMaterial map={texture} transparent alphaTest={0.5} roughness={0.8} />
                </mesh>
            </Billboard>
            {/* Name Tag */}
            <Billboard position={[0, 90, 0]}>
                <Text fontSize={20} color="white" outlineWidth={2} outlineColor="black">
                    Detective
                </Text>
            </Billboard>
        </group>
    );
}

function Witness() {
    const texture = useLoader(TextureLoader, '/textures/witness_sprite.png');
    const group = useRef();

    useFrame(({ clock }) => {
        if (!group.current) return;
        // Nervous jitter
        group.current.position.x = 600 + Math.random() * 2;
    });

    return (
        <group ref={group} position={[600, -FLOOR_Y + 60, 200]}>
            <Billboard follow={true}>
                <mesh castShadow receiveShadow>
                    <planeGeometry args={[90, 120]} />
                    <meshStandardMaterial map={texture} transparent alphaTest={0.5} roughness={0.8} />
                </mesh>
            </Billboard>
            <Billboard position={[0, 80, 0]}>
                <Text fontSize={20} color="#aaf" outlineWidth={2} outlineColor="black">
                    Witness
                </Text>
            </Billboard>
        </group>
    );
}
