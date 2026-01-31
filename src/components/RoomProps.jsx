import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { FLOOR_Y } from '../game/Physics';

export function RoomProps() {
    const bloodMap = useLoader(TextureLoader, '/textures/blood_spatter.png');

    return (
        <group>
            {/* --- CRIME SCENE --- */}
            <group position={[100, -FLOOR_Y, 100]}>
                {/* Blood Spatter Decal */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2, 0]}>
                    <planeGeometry args={[150, 150]} />
                    <meshStandardMaterial
                        map={bloodMap}
                        transparent
                        depthWrite={false}
                        roughness={0.2}
                        color="#800" // Blood red tint
                    />
                </mesh>

                {/* The Murder Weapon: Knife */}
                <group position={[20, 5, 20]} rotation={[0, Math.PI / 4, Math.PI / 2]}>
                    {/* Blade */}
                    <mesh position={[0, 15, 0]}>
                        <boxGeometry args={[4, 30, 1]} />
                        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
                    </mesh>
                    {/* Handle */}
                    <mesh position={[0, -5, 0]}>
                        <boxGeometry args={[6, 15, 3]} />
                        <meshStandardMaterial color="#321" />
                    </mesh>
                </group>

                {/* Evidence Marker */}
                <mesh position={[60, 5, 60]}>
                    <coneGeometry args={[5, 15, 4]} />
                    <meshStandardMaterial color="yellow" />
                </mesh>
            </group>

            {/* --- BAR AREA --- */}
            <group position={[600, -FLOOR_Y, 0]}>
                <mesh position={[0, 50, 0]} receiveShadow castShadow>
                    <boxGeometry args={[150, 100, 600]} />
                    <meshStandardMaterial color="#421" />
                </mesh>
                {/* Stools */}
                {[-200, 0, 200].map((z, i) => (
                    <mesh key={i} position={[-100, 30, z]} castShadow>
                        <cylinderGeometry args={[15, 15, 60, 16]} />
                        <meshStandardMaterial color="#800" />
                    </mesh>
                ))}
            </group>

            {/* --- FURNITURE --- */}
            {/* Desk */}
            <group position={[-400, -FLOOR_Y, 150]} rotation={[0, 0.5, 0]}>
                <mesh position={[0, 35, 0]} receiveShadow castShadow>
                    <boxGeometry args={[200, 10, 100]} />
                    <meshStandardMaterial color="#532" />
                </mesh>
                {/* Legs */}
                <mesh position={[-90, 17, -40]}><boxGeometry args={[10, 35, 10]} /><meshStandardMaterial color="#321" /></mesh>
                <mesh position={[90, 17, -40]}><boxGeometry args={[10, 35, 10]} /><meshStandardMaterial color="#321" /></mesh>

                {/* Lamp */}
                <group position={[60, 40, 20]}>
                    <pointLight position={[0, 15, 0]} intensity={200} color="#ffaa00" distance={300} castShadow />
                    <mesh position={[0, 20, 0]}>
                        <coneGeometry args={[15, 20, 32, 1, true]} />
                        <meshStandardMaterial color="#0f0" emissive="#0a0" emissiveIntensity={0.5} side={2} />
                    </mesh>
                </group>

                {/* Clutter: Papers */}
                <mesh position={[0, 36, 10]} rotation={[0, 0.2, 0]}>
                    <planeGeometry args={[20, 30]} />
                    <meshStandardMaterial color="#fff" side={2} />
                </mesh>
                <mesh position={[-30, 36, -10]} rotation={[0, -0.4, 0]}>
                    <planeGeometry args={[20, 30]} />
                    <meshStandardMaterial color="#fff" side={2} />
                </mesh>
            </group>

            {/* Filing Cabinets */}
            <group position={[600, -425, -150]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[80, 150, 60]} />
                    <meshStandardMaterial color="#556" metalness={0.6} roughness={0.4} />
                </mesh>
            </group>

        </group>
    );
}
