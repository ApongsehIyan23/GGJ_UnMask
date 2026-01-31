/**
 * Input.js
 * Manages keyboard input state.
 */

const keys = {};
const justPressed = {};
const justReleased = {};

const KEY_MAP = {
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    a: 'LEFT',
    d: 'RIGHT',
    w: 'UP',
    s: 'DOWN',
    ' ': 'JUMP',
    Shift: 'DASH',
    '1': 'MASK_1',
    '2': 'MASK_2',
    '3': 'MASK_3',
    Enter: 'CONFIRM',
    i: 'INTERROGATE',
};

window.addEventListener('keydown', (e) => {
    const action = KEY_MAP[e.key];
    if (action) {
        if (!keys[action]) {
            justPressed[action] = true;
        }
        keys[action] = true;
    }
});

window.addEventListener('keyup', (e) => {
    const action = KEY_MAP[e.key];
    if (action) {
        keys[action] = false;
        justReleased[action] = true;
    }
});

export const Input = {
    isDown: (action) => !!keys[action],
    isJustPressed: (action) => {
        const result = !!justPressed[action];
        justPressed[action] = false; // Consume inputs
        return result;
    },
    isJustReleased: (action) => {
        const result = !!justReleased[action];
        justReleased[action] = false;
        return result;
    },
    update: () => {
        // Clear 'just' states if we wanted strict frame alignment, 
        // but consuming them on read is often safer for variable FPS.
    },
    // Debug
    getKeys: () => keys
};
