import { useState, useEffect, Suspense } from 'react';
import Spline from '@splinetool/react-spline';
import './App.css';
import { setDebugCallback, onPhaseChange, gameState } from './game/GameState';
import { MainMenu } from './components/MainMenu';
import { InterrogationScene } from './components/InterrogationScene';

function App() {
  const [debugInfo, setDebugInfo] = useState("Loading...");
  const [phase, setPhaseState] = useState(gameState.phase);

  useEffect(() => {
    setDebugCallback(setDebugInfo);
    // Subscribe to phase changes to trigger UI re-renders
    const cleanup = onPhaseChange((newPhase) => {
      console.log("App: Phase Changed to", newPhase);
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

      {/* Visual Novel Interrogation Scene */}
      {phase === 'INTERROGATION' && <InterrogationScene />}

      {/* Debug Panel */}
      {phase !== 'MENU' && (
        <div className="debug-panel" style={{ position: 'absolute', top: 10, left: 10, opacity: 0.5 }}>
          <pre>{debugInfo}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
