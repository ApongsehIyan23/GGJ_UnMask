import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { update, gameState } from '../game/GameLoop';
import { Player3D } from './Player3D';
import { Environment3D } from './Environment3D';
import { Characters } from './Characters';
import { PointerLockControls } from '@react-three/drei';

export function GameScene() {
    const { camera } = useThree();

    useEffect(() => {
        // Initial Camera Pos
        camera.position.set(400, -300, 400);
    }, [camera]);

    useFrame((state, delta) => {
        update(delta);

        // Sync camera position to player (FPS/Over-Shoulder)
        // Camera stays at player position + height offset
        // We do NOT touch rotation here, PointerLock handles it.
        camera.position.x = gameState.player.x + 25; // Center X
        camera.position.y = -(gameState.player.y + 25) + 60; // Eye level (above center)
        camera.position.z = gameState.player.z;
    });

    return (
        <>
            <PointerLockControls />

            <color attach="background" args={['#222']} />

            <ambientLight intensity={1.0} />
            <directionalLight position={[100, 100, 200]} intensity={1.5} />

            <Environment3D />
            <Characters />
            <Player3D />
        </>
    );
}
