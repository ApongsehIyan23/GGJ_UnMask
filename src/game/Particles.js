/**
 * Particles.js
 * distinct logic for visual effects.
 */

const particles = [];

export function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha = p.life / p.maxLife;

        // Simple gravity for some particles
        if (p.gravity) {
            p.vy += 500 * dt;
        }
    }
}

export function drawParticles(ctx) {
    for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;
}

export function spawnExplosion(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 400,
            vy: (Math.random() - 0.5) * 400,
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1.0,
            color: color,
            size: 4 + Math.random() * 6,
            alpha: 1.0,
            gravity: false
        });
    }
}

export function spawnDust(x, y) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 100,
            vy: -50 - Math.random() * 50,
            life: 0.3 + Math.random() * 0.2,
            maxLife: 0.5,
            color: '#aaaaaa',
            size: 3,
            alpha: 1.0,
            gravity: false // float up
        });
    }
}
