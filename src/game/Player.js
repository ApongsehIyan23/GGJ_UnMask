/**
 * Player.js
 * Handles player state, physics, and mask mechanics.
 */

import { Input } from './Input';
import { applyGravity, resolveFloorCollision, GRAVITY } from './Physics';
import { spawnExplosion, spawnDust } from './Particles';
import { setScreenShake } from './GameLoop';

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

export function updatePlayer(player, dt) {
    // Mask Switching
    if (Input.isJustPressed('MASK_1')) switchMask(player, MASKS.STANDARD);
    if (Input.isJustPressed('MASK_2')) switchMask(player, MASKS.HEAVY);
    if (Input.isJustPressed('MASK_3')) switchMask(player, MASKS.FLOAT);

    // X-Axis Movement
    player.vx = 0;
    if (Input.isDown('LEFT')) player.vx = -player.speed;
    if (Input.isDown('RIGHT')) player.vx = player.speed;

    // Z-Axis Movement (Forward/Backward)
    player.vz = 0;
    if (Input.isDown('UP')) player.vz = -player.speed;
    if (Input.isDown('DOWN')) player.vz = player.speed;

    // Jump
    if (Input.isDown('JUMP') && player.isGrounded) {
        player.vy = player.jumpForce;
        player.isGrounded = false;
        spawnDust(player.x + player.width / 2, player.y + player.height); // Jump dust
    }

    // Physics Integration
    player.x += player.vx * dt;
    player.z += player.vz * dt;
    player.y += player.vy * dt;

    // Custom Gravity per Mask
    // We need to modify the shared applyGravity or just do it here manually/override
    // Since applyGravity is simple, let's just do logic here or pass scale

    // Re-implementing gravity locally to support scale for now
    // OR export a flexible gravity function. 
    // For now:
    player.vy += (GRAVITY * player.gravityScale) * dt;

    // Terminal velocity clamp (optional but good)
    if (player.vy > 1000) player.vy = 1000;

    const wasGrounded = player.isGrounded;
    resolveFloorCollision(player);

    // Land Dust
    if (!wasGrounded && player.isGrounded) {
        if (player.currentMask.id === 'HEAVY') {
            spawnExplosion(player.x + player.width / 2, player.y + player.height, '#aaaaaa', 20);
            setScreenShake(20); // Heavy impact
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

    // Optional: Visual effect triggers would go here
    console.log(`Switched to ${maskDef.id} Mask`);
}


