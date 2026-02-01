/**
 * Player.js
 * Handles player state, logic, and physics.
 */

import { Input } from './Input';
import { applyGravity, resolveFloorCollision, resolveWallCollision, GRAVITY } from './Physics';
import { spawnExplosion, spawnDust } from './Particles';
import { setScreenShake } from './GameState';

const MASKS = {
    STANDARD: {
        id: 'STANDARD',
        color: '#ff4444', // Red
        speed: 400,
        jumpForce: -600,
        gravityScale: 1.0,
        width: 50,
        height: 50
    },
    HEAVY: {
        id: 'HEAVY',
        color: '#888888', // Gray
        speed: 200,
        jumpForce: -400,
        gravityScale: 2.0,
        width: 50,
        height: 50
    },
    FLOAT: {
        id: 'FLOAT',
        color: '#44ffff', // Cyan
        speed: 500,
        jumpForce: -500,
        gravityScale: 0.5,
        width: 50,
        height: 50
    }
};

export function createPlayer(x, y) {
    return {
        x,
        y,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        isGrounded: false,
        currentMask: MASKS.STANDARD,
        ...MASKS.STANDARD // Apply initial mask props
    };
}

export function updatePlayer(player, dt, cameraYaw = 0) {
    // Mask Switching
    if (Input.isJustPressed('MASK_1')) switchMask(player, MASKS.STANDARD);
    if (Input.isJustPressed('MASK_2')) switchMask(player, MASKS.HEAVY);
    if (Input.isJustPressed('MASK_3')) switchMask(player, MASKS.FLOAT);

    // --- MOVEMENT LOGIC (Camera Relative) ---

    let inputZ = 0; // Forward/Back
    let inputX = 0; // Left/Right

    if (Input.isDown('UP')) inputZ = -1; // Forward
    if (Input.isDown('DOWN')) inputZ = 1; // Backward
    if (Input.isDown('LEFT')) inputX = -1; // Left
    if (Input.isDown('RIGHT')) inputX = 1; // Right

    const yaw = cameraYaw;

    // Normalize input
    if (inputX !== 0 || inputZ !== 0) {
        const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
        inputX /= length;
        inputZ /= length;

        // Apply Player Speed
        inputX *= player.speed;
        inputZ *= player.speed;

        // Rotate by Camera Yaw
        const s = Math.sin(yaw);
        const c = Math.cos(yaw);

        // Rotated Vector
        player.vx = inputX * c - inputZ * s;
        player.vz = inputX * s + inputZ * c;
    } else {
        player.vx = 0;
        player.vz = 0;
    }

    // --- PHYSICS ---

    // Jump
    if (Input.isDown('JUMP') && player.isGrounded) {
        player.vy = player.jumpForce;
        player.isGrounded = false;
        spawnDust(player.x + player.width / 2, player.y + player.height);
    }

    // Gravity
    player.vy += (GRAVITY * player.gravityScale) * dt;

    // Terminal Velocity
    if (player.vy > 1000) player.vy = 1000;

    // Integration
    player.x += player.vx * dt;
    player.z += player.vz * dt;
    player.y += player.vy * dt;

    // Collisions
    const wasGrounded = player.isGrounded;
    resolveFloorCollision(player);
    resolveWallCollision(player);

    // Land Effects
    if (!wasGrounded && player.isGrounded) {
        if (player.currentMask.id === 'HEAVY') {
            spawnExplosion(player.x + player.width / 2, player.y + player.height, '#aaaaaa', 20);
            setScreenShake(20);
        } else {
            spawnDust(player.x + player.width / 2, player.y + player.height);
        }
    }
}

function switchMask(player, maskDef) {
    if (player.currentMask.id === maskDef.id) return;

    // Effects BEFORE switch (using old color)
    spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, player.color, 15);
    setScreenShake(5);

    player.currentMask = maskDef;
    player.color = maskDef.color;
    player.speed = maskDef.speed;
    player.jumpForce = maskDef.jumpForce;
    player.gravityScale = maskDef.gravityScale;

    console.log(`Switched to ${maskDef.id} Mask`);
}
