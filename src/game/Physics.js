/**
 * Physics.js
 * Basic AABB Physics.
 */

export const GRAVITY = 1500;
export const TERMINAL_VELOCITY = 1000;
export const FLOOR_Y = 500; // Temporary floor level

// Simple AABB Collision Check
export function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

export function applyGravity(entity, dt) {
    entity.vy += GRAVITY * dt;
    if (entity.vy > TERMINAL_VELOCITY) entity.vy = TERMINAL_VELOCITY;
}

export function resolveFloorCollision(entity) {
    // Temporary floor collision
    if (entity.y + entity.height > FLOOR_Y) {
        entity.y = FLOOR_Y - entity.height;
        entity.vy = 0;
        entity.isGrounded = true;
    } else {
        entity.isGrounded = false;
    }
}
