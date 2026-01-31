/**
 * Interrogation.js
 * Handles the UI and logic for the interrogation 'battle'.
 */

import { findSuspectById } from './Suspect';
import { spawnExplosion, spawnDust } from './Particles';
import { setScreenShake } from './GameLoop';

// Create initial interrogation state for a suspect
export function startInterrogation(gameState, suspectId) {
    const s = findSuspectById(suspectId);
    if (!s) return;

    gameState.phase = 'INTERROGATION';
    gameState.interrogation = {
        suspect: { ...s },
        guard: s.baseGuard,
        masked: true,
        lastResponse: pick(s.maskedResponses),
        ui: {}
    };
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Simple mechanic outcomes
export function empathize(gameState) {
    const iq = gameState.interrogation;
    iq.guard = Math.max(0, iq.guard - 15);
    iq.lastResponse = pick(iq.masked ? iq.suspect.maskedResponses : iq.suspect.unmaskedResponses);
    spawnDust(200, 200);
}

export function pressure(gameState) {
    const iq = gameState.interrogation;
    // Pressure may cause them to slip depending on guard
    const chance = Math.max(10, 40 - Math.round((100 - iq.guard) / 5));
    if (Math.random() * 100 < chance) {
        // slip
        iq.masked = false;
        iq.lastResponse = pick(iq.suspect.unmaskedResponses);
        spawnExplosion(300, 200, '#ffaaaa', 20);
        setScreenShake(12);
    } else {
        iq.guard = Math.min(120, iq.guard + 10);
        iq.lastResponse = "They're getting defensive...";
        spawnDust(250, 250);
    }
}

export function presentEvidence(gameState, clue) {
    const iq = gameState.interrogation;
    if (!clue) return { success: false, reason: 'No clue' };

    const match = iq.suspect.truthMatches.includes(clue.id);
    if (match) {
        iq.masked = false;
        iq.lastResponse = pick(iq.suspect.unmaskedResponses);
        spawnExplosion(320, 220, '#88ff88', 30);
        setScreenShake(18);
        return { success: true };
    } else {
        iq.guard = Math.min(120, iq.guard + 20);
        iq.lastResponse = "That's not relevant.";
        spawnDust(320, 220);
        return { success: false };
    }
}

export function updateInterrogation(gameState, dt) {
    // For now, nothing time-based is required; placeholder for animations
    // Possible future: timer-based choices, patience meter decay
}

export function drawInterrogation(ctx, canvas, gameState) {
    const iq = gameState.interrogation;
    if (!iq) return;

    const PAD = 16;
    const panelW = Math.min(900, canvas.width - PAD * 2);
    const panelH = 320;
    const panelX = (canvas.width - panelW) / 2;
    const panelY = (canvas.height - panelH) / 2;

    ctx.save();
    // Background dim
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Panel
    ctx.fillStyle = '#151515';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);

    // Portrait box (left)
    const px = panelX + 20;
    const py = panelY + 20;
    const pw = 180;
    const ph = 240;
    ctx.fillStyle = iq.suspect.color;
    ctx.fillRect(px, py, pw, ph);

    // Mask overlay
    ctx.fillStyle = iq.masked ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)';
    ctx.fillRect(px, py, pw, ph);

    // Suspect name + guard
    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.fillText(iq.suspect.name, px + pw + 20, py + 28);
    ctx.fillStyle = '#ddd';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Guard: ${iq.guard}`, px + pw + 20, py + 48);

    // Dialogue box
    const dx = px + pw + 20;
    const dy = py + 60;
    const dw = panelW - (pw + 60);
    const dh = 120;

    // Dialogue background
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(dx, dy, dw, dh);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(dx + 1, dy + 1, dw - 2, dh - 2);

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    // Mask effect: if masked, hide some words
    let text = iq.lastResponse;
    if (iq.masked) {
        text = maskText(text);
    }
    wrapText(ctx, text, dx + 10, dy + 24, dw - 20, 18);

    // Buttons: Empathize | Pressure | Present Evidence
    const btnY = dy + dh + 20;
    const btnW = 180;
    const gap = 16;
    const btnX = dx;

    const buttons = [
        { id: 'EMPATHIZE', label: 'Empathize', x: btnX, y: btnY, w: btnW, h: 40 },
        { id: 'PRESSURE', label: 'Pressure', x: btnX + (btnW + gap), y: btnY, w: btnW, h: 40 },
        { id: 'EVIDENCE', label: 'Present Evidence', x: btnX + 2 * (btnW + gap), y: btnY, w: btnW, h: 40 }
    ];

    for (const b of buttons) {
        ctx.fillStyle = '#222';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = '#444';
        ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText(b.label, b.x + 12, b.y + 26);
    }

    // If in evidence selection mode, draw clue boxes below portrait
    const clues = gameState.player.clues || [];
    const clueBoxes = [];
    if (gameState._showEvidencePicker) {
        const cx = px;
        const cy = py + ph + 12;
        const cw = 120;
        const ch = 44;
        for (let i = 0; i < clues.length; i++) {
            const x = cx + i * (cw + 8);
            const y = cy;
            ctx.fillStyle = '#111';
            ctx.fillRect(x, y, cw, ch);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
            ctx.fillStyle = '#fff';
            ctx.font = '12px sans-serif';
            ctx.fillText(clues[i].title, x + 8, y + 26);
            clueBoxes.push({ x, y, w: cw, h: ch, clue: clues[i] });
        }
    }

    // Save UI boxes for click handling
    iq.ui = { buttons, clueBoxes };

    ctx.restore();
}

function maskText(t) {
    // Simple masking: replace 30% of visible letters with *
    return t.split(' ').map(w => (Math.random() < 0.3 ? '*'.repeat(Math.max(3, Math.floor(w.length / 2))) : w)).join(' ');
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

export function handleInterrogationClick(gameState, x, y) {
    const iq = gameState.interrogation;
    if (!iq || !iq.ui) return false;

    // Check buttons
    for (const b of iq.ui.buttons) {
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            if (b.id === 'EMPATHIZE') {
                empathize(gameState);
            } else if (b.id === 'PRESSURE') {
                pressure(gameState);
            } else if (b.id === 'EVIDENCE') {
                // Toggle evidence picker
                gameState._showEvidencePicker = !gameState._showEvidencePicker;
            }
            return true;
        }
    }

    // If evidence picker is shown, check clue boxes
    if (gameState._showEvidencePicker) {
        for (const cb of iq.ui.clueBoxes) {
            if (x >= cb.x && x <= cb.x + cb.w && y >= cb.y && y <= cb.y + cb.h) {
                const res = presentEvidence(gameState, cb.clue);
                gameState._showEvidencePicker = false;
                // If success, we can end interrogation and return to RUNNING
                if (res.success) {
                    // store result for player
                    gameState.player.foundConfession = true;
                    gameState.phase = 'RUNNING';
                }
                return true;
            }
        }
    }

    return false;
}
