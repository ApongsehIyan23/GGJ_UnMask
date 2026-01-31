/**
 * GameLoop.js
 * Handles the main game loop logic, decoupled from rendering.
 */

import { Input } from './Input';
import { createPlayer, updatePlayer } from './Player';
import { updateParticles } from './Particles';
import { createClues, getSelectedClues } from './Clues';
import { startInterrogation, updateInterrogation } from './Interrogation';

// Game State
export const gameState = {
    phase: 'MENU', // 'MENU' | 'PREP' | 'RUNNING' | 'INTERROGATION'
    player: createPlayer(100, 100),
    shake: 0,
    fps: 0,
    clues: createClues(),
    _clueBoxes: [] // Kept for logic, though might need 3D raycasting later
};

let debugCallback = null;

export function setScreenShake(amount) {
    gameState.shake = amount;
}

export function setDebugCallback(cb) {
    debugCallback = cb;
}

export function update(dt) {
    // PREP Logic is handled by React UI now
    // We just update particles/shake
    if (gameState.phase === 'PREP') {
        updateParticles(dt);
        if (gameState.shake > 0) {
            gameState.shake -= 100 * dt;
            if (gameState.shake < 0) gameState.shake = 0;
        }
        return;
    }

    // Quick debug key to start interrogation (optional, or move to React)
    if (Input.isJustPressed('INTERROGATE')) {
        triggerInterrogation('taxi');
    }

    if (gameState.phase === 'INTERROGATION') {
        // updates for animations?
        updateParticles(dt);
        if (gameState.shake > 0) {
            gameState.shake -= 100 * dt;
            if (gameState.shake < 0) gameState.shake = 0;
        }
        return;
    }

    updatePlayer(gameState.player, dt);
    updateParticles(dt);

    if (gameState.shake > 0) {
        gameState.shake -= 100 * dt; // Decay shake
        if (gameState.shake < 0) gameState.shake = 0;
    }

    // Basic FPS/Debug info update
    if (debugCallback && Math.random() < 0.05) {
        debugCallback(`Phase: ${gameState.phase}
Mask: ${gameState.player.currentMask.id}
Pos: ${Math.round(gameState.player.x)}, ${Math.round(gameState.player.y)}`);
    }
}

// Listeners
const phaseListeners = new Set();
export function onPhaseChange(cb) {
    phaseListeners.add(cb);
    return () => phaseListeners.delete(cb);
}

export function setPhase(newPhase) {
    gameState.phase = newPhase;
    phaseListeners.forEach(cb => cb(newPhase));
}

export function triggerInterrogation(suspectId) {
    if (gameState.player.clues && gameState.player.clues.length > 0) {
        startInterrogation(gameState, suspectId);
        setPhase('INTERROGATION');
        if (debugCallback) debugCallback('Starting interrogation with ' + suspectId);
    } else {
        setScreenShake(8);
        if (debugCallback) debugCallback('No clues: complete prep first');
    }
}


