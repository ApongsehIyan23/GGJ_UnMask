import { useLoader } from '@react-three/fiber';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader';
import { OrbitControls } from '@react-three/drei';
import { useEffect } from 'react';

export function ImportedLevel() {
    const usdz = useLoader(USDZLoader, '/models/interior.usdz');

    useEffect(() => {
        if (usdz) {
            console.log("USDZ Loaded:", usdz);
        }
    }, [usdz]);

    return (
        <group>
            <gridHelper args={[2000, 20]} position={[0, -500, 0]} />
            <axesHelper args={[500]} />

            {/* Reference Box */}
            <mesh position={[0, -200, 0]}>
                <boxGeometry args={[50, 50, 50]} />
                <meshStandardMaterial color="red" />
            </mesh>

            <primitive
                object={usdz}
                scale={[100, 100, 100]}
                position={[0, -500, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            />
            <OrbitControls makeDefault />
        </group>
    );
}
