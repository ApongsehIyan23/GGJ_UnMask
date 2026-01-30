/**
 * GameLoop.js
 * Handles the main game loop, resizing, and initialization of the game engine.
 */

let animationFrameId;
let lastTime = 0;
let isRunning = false;
let canvas = null;
let ctx = null;
let debugCallback = null;

import { Input } from './Input';
import { createPlayer, updatePlayer, drawPlayer } from './Player';
import { FLOOR_Y } from './Physics';
import { updateParticles, drawParticles } from './Particles';

// Game State
const gameState = {
    player: createPlayer(100, 100),
    shake: 0,
    fps: 0,
};

export function setScreenShake(amount) {
    gameState.shake = amount;
}

export function startGame(canvasElement, callbacks = {}) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    debugCallback = callbacks.onDebugUpdate;

    // Resize handling
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    isRunning = true;
    lastTime = performance.now();
    loop(lastTime);

    return () => {
        window.removeEventListener('resize', resize);
    };
}

export function stopGame() {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
}

function loop(timestamp) {
    if (!isRunning) return;

    const dt = (timestamp - lastTime) / 1000; // Delta time in seconds
    lastTime = timestamp;

    update(dt);
    render();

    // Basic FPS calculation
    gameState.fps = Math.round(1 / dt);
    if (debugCallback && Math.random() < 0.1) { // Throttle updates
        debugCallback(`FPS: ${gameState.fps}
Mask: ${gameState.player.currentMask.id}
Pos: ${Math.round(gameState.player.x)}, ${Math.round(gameState.player.y)}`);
    }

    animationFrameId = requestAnimationFrame(loop);
}

function update(dt) {
    updatePlayer(gameState.player, dt);
    updateParticles(dt);

    if (gameState.shake > 0) {
        gameState.shake -= 100 * dt; // Decay shake
        if (gameState.shake < 0) gameState.shake = 0;
    }
}

function render() {
    // Clear screen
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply Screen Shake
    if (gameState.shake > 0) {
        const rx = (Math.random() - 0.5) * gameState.shake;
        const ry = (Math.random() - 0.5) * gameState.shake;
        ctx.translate(rx, ry);
    }

    // Draw Floor
    ctx.fillStyle = '#333';
    ctx.fillRect(0, FLOOR_Y, canvas.width, 50);

    // Draw Player
    drawPlayer(ctx, gameState.player);

    // Draw Particles
    drawParticles(ctx);

    // Draw Lighting Overlay
    drawLighting(ctx);

    ctx.restore();
}

function drawLighting(ctx) {
    ctx.save();
    // ambient darkness
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#444444'; // Ambient light level
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Light source around player
    ctx.globalCompositeOperation = 'destination-in';

    // Determine light properties based on mask
    let lightRadius = 150;

    const maskId = gameState.player.currentMask.id;
    if (maskId === 'FLOAT') {
        lightRadius = 200; // Ghost mask is brighter
    } else if (maskId === 'HEAVY') {
        lightRadius = 100; // Heavy mask is dim
    }

    const g = ctx.createRadialGradient(
        gameState.player.x + 25, gameState.player.y + 25, 0,
        gameState.player.x + 25, gameState.player.y + 25, lightRadius
    );
    g.addColorStop(0, 'rgba(255, 255, 255, 1)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(gameState.player.x + 25, gameState.player.y + 25, lightRadius, 0, Math.PI * 2);
    ctx.fill();

    // Reset
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
}
