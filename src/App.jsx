import { Canvas } from '@react-three/fiber';
import { useState, useEffect, Suspense } from 'react';
import Spline from '@splinetool/react-spline';
import './App.css';
import { GameScene } from './components/GameScene';
import { setDebugCallback, onPhaseChange, gameState } from './game/GameLoop';
import { PrepUI } from './components/PrepUI';
import { InterrogationUI } from './components/InterrogationUI';
import { MainMenu } from './components/MainMenu';

function App() {
  const [debugInfo, setDebugInfo] = useState("Loading...");
  const [phase, setPhaseState] = useState(gameState.phase);

  useEffect(() => {
    setDebugCallback(setDebugInfo);
    // Subscribe to phase changes to trigger UI re-renders
    const cleanup = onPhaseChange((newPhase) => {
      setPhaseState(newPhase);
    });
    return cleanup;
  }, []);

  return (
    <div className="game-container">
      {/* Background Layer: Spline Scene - Only Visible in MENU */}
      {phase === 'MENU' && (
        <div className="spline-wrapper" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <Suspense fallback={<div style={{ color: 'white', padding: 20 }}>Loading 3D Environment...</div>}>
            <Spline scene="https://prod.spline.design/uWqAH3Min8fmlmZd/scene.splinecode" />
          </Suspense>
        </div>
      )}

      {/* Main Menu Layer */}
      {phase === 'MENU' && <MainMenu />}

      {/* Gameplay Layer: R3F Canvas - Only visible during gameplay phases */}
      {phase !== 'MENU' && (
        <div className="canvas-wrapper" style={{ zIndex: 5, background: '#222' }}>
          <Canvas shadows>
            <GameScene />
          </Canvas>
        </div>
      )}

      {/* Game Phase UIs */}
      {phase === 'PREP' && <PrepUI />}
      {phase === 'INTERROGATION' && <InterrogationUI />}

      {/* HUD Overlay - Only visible during gameplay */}
      {phase !== 'MENU' && phase !== 'INTERROGATION' && (
        <div className="ui-overlay">
          <div className="file-header">
            <h1>GGJ: UnMask</h1>
            <div className="status-badge">CASE #4022</div>
          </div>

          <div className="debug-panel">
            <pre>{debugInfo}</pre>
          </div>

          <div className="controls-hint">
            ARROWS to move | SPACE to jump | 1, 2, 3 to Mask
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
