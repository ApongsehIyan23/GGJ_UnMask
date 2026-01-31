/**
 * Clues.js
 * Responsible for generating and drawing the "Prep" clue selection UI.
 * Clues are simple JS objects (text/photo/item) and can be toggled by clicking.
 */

export function createClues() {
    return [
        {
            id: 'clue_note',
            type: 'text',
            title: 'Witness Note',
            content: '"I saw a figure in a red coat leaving at 2am."',
            picked: false
        },
        {
            id: 'clue_photo',
            type: 'photo',
            title: 'Security Photo',
            content: 'A blurred silhouette near the alley.',
            picked: false
        },
        {
            id: 'clue_glove',
            type: 'item',
            title: 'Leather Glove',
            content: 'Left-handed, medium, traces of mud.',
            picked: false
        },
        {
            id: 'clue_phone',
            type: 'text',
            title: 'Phone Log',
            content: 'Missed call from "Unknown" at 00:49',
            picked: false
        }
    ];
}

export function getSelectedClues(clues) {
    return clues.filter(c => c.picked);
}

function drawBox(ctx, x, y, w, h, isPicked) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = isPicked ? '#ffd56b' : '#666';
    ctx.fillStyle = '#222';
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
}

function drawPhotoIcon(ctx, x, y, size) {
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 3, y + 3, size - 6, size - 6);
    ctx.fillStyle = '#99a';
    ctx.fillRect(x + 6, y + 6, size - 12, size - 12);
}

export function drawPrep(ctx, canvas, clues, gameState) {
    // Simple centered panel
    const PAD = 20;
    const panelW = Math.min(900, canvas.width - PAD * 2);
    const panelH = 260;
    const panelX = (canvas.width - panelW) / 2;
    const panelY = (canvas.height - panelH) / 2;

    // Background dim
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Panel
    ctx.fillStyle = '#101010';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = '#444';
    ctx.strokeRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Prep — Choose up to 3 Clues (Click to toggle, press Enter to confirm)', panelX + 16, panelY + 32);

    // Layout clue boxes
    const boxCount = clues.length;
    const gap = 16;
    const totalGap = gap * (boxCount - 1);
    const boxW = Math.floor((panelW - 40 - totalGap) / boxCount);
    const boxH = 160;
    const boxY = panelY + 60;

    const boxes = [];
    for (let i = 0; i < clues.length; i++) {
        const x = panelX + 20 + i * (boxW + gap);
        const y = boxY;
        const clue = clues[i];
        drawBox(ctx, x, y, boxW, boxH, clue.picked);

        // Small thumbnail/icon
        drawPhotoIcon(ctx, x + 10, y + 10, 40);

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.fillText(`${i + 1}. ${clue.title}`, x + 60, y + 28);

        // Content (wrap/truncate)
        ctx.fillStyle = '#ccc';
        ctx.font = '12px monospace';
        const txt = clue.content;
        const maxLen = 48;
        const snippet = txt.length > maxLen ? txt.slice(0, maxLen - 3) + '...' : txt;
        ctx.fillText(snippet, x + 10, y + 58);

        // If picked, show badge
        if (clue.picked) {
            ctx.fillStyle = '#ffd56b';
            ctx.fillRect(x + boxW - 60, y + 10, 50, 22);
            ctx.fillStyle = '#000';
            ctx.font = '12px sans-serif';
            ctx.fillText('SELECTED', x + boxW - 56, y + 26);
        }

        // Save bounding box for click handling
        boxes.push({ x, y, w: boxW, h: boxH });
    }

    // Selected count
    const selectedCount = clues.filter(c => c.picked).length;
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Selected: ${selectedCount} / 3`, panelX + 18, panelY + panelH - 18);

    // Hint
    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.fillText('Signature: These clues will be used during the interview as your evidence (your ammo).', panelX + 160, panelY + panelH - 18);

    // Expose boxes for click handling
    gameState._clueBoxes = boxes;

    ctx.restore();
}
