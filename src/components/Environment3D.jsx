import { useRef, useLayoutEffect, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping } from 'three';
import { FLOOR_Y } from '../game/Physics';
import { RoomProps } from './RoomProps';

export function Environment3D() {
    const [woodMap, wallMap, ceilingMap] = useLoader(TextureLoader, [
        '/textures/wood_floor.png',
        '/textures/wall_plaster.png',
        '/textures/ceiling_tile.png'
    ]);

    // Flicker Logic
    const lightRef = useRef();
    useFrame((state) => {
        if (lightRef.current) {
            // Random flickering effect (fluorescent hum)
            if (Math.random() > 0.95) {
                lightRef.current.intensity = 100 + Math.random() * 200;
            } else {
                lightRef.current.intensity = 300;
            }
        }
    });

    useLayoutEffect(() => {
        woodMap.wrapS = woodMap.wrapT = RepeatWrapping;
        woodMap.repeat.set(10, 10);

        wallMap.wrapS = wallMap.wrapT = RepeatWrapping;
        wallMap.repeat.set(4, 2);

        ceilingMap.wrapS = ceilingMap.wrapT = RepeatWrapping;
        ceilingMap.repeat.set(8, 8);
    }, [woodMap, wallMap, ceilingMap]);

    return (
        <group>
            {/* FLOOR - Dark Wood Texture */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -FLOOR_Y, 0]} receiveShadow>
                <planeGeometry args={[2000, 2000]} />
                <meshStandardMaterial
                    map={woodMap}
                    color="#666"
                    roughness={0.7}
                    metalness={0.1}
                />
            </mesh>

            {/* BASEBOARDS */}
            <group position={[0, -FLOOR_Y + 10, 0]}>
                <mesh position={[0, 0, -300]} receiveShadow>
                    <boxGeometry args={[2000, 20, 10]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
                <mesh position={[-800, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[1600, 20, 10]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
                <mesh position={[800, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[1600, 20, 10]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            </group>

            {/* CEILING - Acoustic Tile */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -FLOOR_Y + 1000, 0]}>
                <planeGeometry args={[2000, 2000]} />
                <meshStandardMaterial map={ceilingMap} color="#888" />
            </mesh>

            {/* LIGHT FIXTURE (Fluorescent) */}
            <group position={[0, -FLOOR_Y + 980, 0]}>
                <mesh>
                    <boxGeometry args={[400, 10, 100]} />
                    <meshStandardMaterial color="#ddd" emissive="#fff" emissiveIntensity={0.5} />
                </mesh>
                {/* The Flickering Light Source */}
                <pointLight
                    ref={lightRef}
                    position={[0, -20, 0]}
                    distance={1500}
                    color="#ccffff"
                    castShadow
                />
            </group>

            {/* WALLS */}
            <mesh position={[0, -FLOOR_Y + 500, -300]} receiveShadow>
                <planeGeometry args={[2000, 1000]} />
                <meshStandardMaterial map={wallMap} color="#888" roughness={0.9} />
            </mesh>
            <mesh position={[0, -FLOOR_Y + 500, 800]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[2000, 1000]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[-800, -FLOOR_Y + 500, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[1600, 1000]} />
                <meshStandardMaterial map={wallMap} color="#888" roughness={0.9} />
            </mesh>
            <mesh position={[800, -FLOOR_Y + 500, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[1600, 1000]} />
                <meshStandardMaterial map={wallMap} color="#888" roughness={0.9} />
            </mesh>

            <RoomProps />

            {/* ATMOSPHERE */}
            <ambientLight intensity={0.1} color="#000011" />
            <directionalLight position={[-500, 500, -600]} intensity={0.5} color="#445588" castShadow />
        </group>
    );
}
