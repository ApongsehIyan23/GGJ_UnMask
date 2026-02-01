/**
 * GameLoop.js
 * Handles the main game loop logic.
 */

import { Input } from './Input';
import { createPlayer, updatePlayer } from './Player';
import { updateParticles } from './Particles';
import { gameState, setScreenShake, getDebugCallback, setPhase, onPhaseChange } from './GameState';
import { startInterrogation } from './Interrogation';
import { showRenderer, hideRenderer } from './InterrogationRenderer';

export { setScreenShake, setPhase, onPhaseChange } from './GameState';
export { setDebugCallback } from './GameState';
export { gameState };

export function initGame() {
    if (!gameState.player) {
        gameState.player = createPlayer(100, 100);
        // Ensure renderer handles phase changes if needed
        onPhaseChange((p) => {
            if (p !== 'INTERROGATION') hideRenderer();
        });
    }
}

export function update(dt) {
    // Ensure player exists
    if (!gameState.player) initGame();

    // PREP Logic is handled by React UI now
    // We just update particles/shake
    if (gameState.phase === 'PREP') {
        updateParticles(dt);
        decayShake(dt);
        return;
    }

    // Proximity Check for Silas
    const SILAS_POS = { x: 200, z: 100 };
    const dx = gameState.player.x - SILAS_POS.x;
    const dz = gameState.player.z - SILAS_POS.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    gameState.canInterrogate = dist < 500;

    // Interaction Trigger
    const inputInt = Input.isJustPressed('INTERROGATE');
    const inputForce = Input.isJustPressed('FORCE_INT');

    if ((inputInt && gameState.canInterrogate) || inputForce) {
        console.log("[Loop] STARTING VANILLA INTERROGATION");
        triggerInterrogation('taxi');
    }

    if (gameState.phase === 'INTERROGATION') {
        updateParticles(dt);
        decayShake(dt);
        return;
    }

    updatePlayer(gameState.player, dt, gameState.cameraYaw || 0);
    updateParticles(dt);
    decayShake(dt);

    // Basic FPS/Debug info update
    const debugCallback = getDebugCallback();
    if (debugCallback && Math.random() < 0.05) {
        debugCallback(`Phase: ${gameState.phase}
Mask: ${gameState.player?.currentMask?.id}
Pos: ${Math.round(gameState.player?.x)}, ${Math.round(gameState.player?.y)}`);
    }
}

function decayShake(dt) {
    if (gameState.shake > 0) {
        gameState.shake -= 100 * dt;
        if (gameState.shake < 0) gameState.shake = 0;
    }
}

export function triggerInterrogation(suspectId) {
    startInterrogation();
    setPhase('INTERROGATION');
    showRenderer();
    console.log("VANILLA UI OPENED");
}






