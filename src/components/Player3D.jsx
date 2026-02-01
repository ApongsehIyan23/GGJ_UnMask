import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { gameState } from '../game/GameState';
import { RoundedBox } from '@react-three/drei';

export function Player3D() {
    const meshRef = useRef();

    useFrame(() => {
        if (gameState.player && meshRef.current) {
            // Sync position (convert 2D pixels to 3D units)
            // Assuming 2D world is ~ 0,0 top-left (or whatever it was)
            // In 2D canvas, y increases downwards. In 3D, y increases upwards usually.
            // Let's invert Y or adjust camera.
            // For now, let's map pixel coordinates to 3D roughly 1:1 scale for simplicity, 
            // but maybe flip Y so up is up.
            // Canvas height is usually window.innerHeight. 
            // Let's assume (0,0) is center of screen for 3D?
            // Or we can keep coordinate system roughly same and position camera appropriately.

            const { x, y, z, width, height, currentMask } = gameState.player;

            // Position: Centered on the rect
            meshRef.current.position.x = x + width / 2;
            meshRef.current.position.y = -(y + height / 2); // Flip Y to match 2D screen coords
            meshRef.current.position.z = z;

            // Color
            if (meshRef.current.material.color.getHexString() !== currentMask.color.replace('#', '').toLowerCase()) {
                meshRef.current.material.color.set(currentMask.color);
            }

            // Scale/Model based on mask?
            // For now, just a box
        }
    });

    return (
        <group>
            {/* Player Object */}
            <RoundedBox
                ref={meshRef}
                args={[50, 50, 50]} // Width, Height, Depth
                radius={5}
                smoothness={4}
            >
                <meshStandardMaterial color="red" />
            </RoundedBox>
        </group>
    );
}
