/**
 * GameState.js
 * Central store for shared game state to avoid circular dependencies.
 */
import { createClues } from './Clues';

export const gameState = {
    phase: 'MENU', // 'MENU' | 'PREP' | 'RUNNING' | 'INTERROGATION'
    player: null,  // Player object
    cameraYaw: 0,
    shake: 0,
    fps: 0,
    clues: createClues(),
    _clueBoxes: []
};

// Phase Listeners
const phaseListeners = new Set();

export function onPhaseChange(cb) {
    phaseListeners.add(cb);
    return () => phaseListeners.delete(cb);
}

export function setPhase(newPhase) {
    gameState.phase = newPhase;
    phaseListeners.forEach(cb => cb(newPhase));
}

export function setScreenShake(amount) {
    gameState.shake = amount;
}

// Debug
let debugCallback = null;
export function setDebugCallback(cb) {
    debugCallback = cb;
}
export function getDebugCallback() {
    return debugCallback;
}
