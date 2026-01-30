import { useEffect, useRef, useState } from 'react';
import './App.css';
import { startGame, stopGame } from './game/GameLoop';

function App() {
  const canvasRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState("Loading...");

  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = startGame(canvasRef.current, {
        onDebugUpdate: setDebugInfo
      });
      return () => {
        stopGame();
        cleanup();
      };
    }
  }, []);

  return (
    <div className="game-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      
      {/* HUD Layer */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        pointerEvents: 'none',
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#0f0',
        textShadow: '1px 1px 2px #000'
      }}>
        <h1>GGJ: UnMask</h1>
        <pre>{debugInfo}</pre>
      </div>
    </div>
  );
}

export default App;
