/**
 * InterrogationRenderer.js
 * Direct DOM manipulation for Interrogation UI.
 */
import { getState, performAction } from './Interrogation';
import { setPhase } from './GameState';

let container = null;

export function initRenderer() {
    if (container) return; // Already initialized

    // Create container
    container = document.createElement('div');
    container.id = 'interrogation-ui';
    container.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85);
        display: none;
        flex-direction: column;
        justify-content: space-between;
        color: white;
        font-family: 'Courier New', monospace;
        z-index: 1000;
        pointer-events: auto;
    `;

    // Inner HTML Structure
    container.innerHTML = `
        <div style="display: flex; padding: 20px; border-bottom: 2px solid #555;">
            <div style="flex: 1; margin-right: 20px;">
                <label>MASK INTEGRITY</label>
                <div style="height: 10px; background: #333; margin-top: 5px;">
                    <div id="bar-integrity" style="height: 100%; width: 100%; background: white; transition: width 0.3s;"></div>
                </div>
            </div>
            <div style="flex: 1;">
                <label>STRESS</label>
                <div style="height: 10px; background: #333; margin-top: 5px;">
                    <div id="bar-stress" style="height: 100%; width: 0%; background: red; transition: width 0.3s;"></div>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 50px;">
            <div style="font-size: 14px; color: #aaa;">SILAS:</div>
            <p id="npc-text" style="font-size: 24px; max-width: 800px; margin: 20px auto; padding: 20px; background: rgba(0,0,0,0.5);">
                ...
            </p>
        </div>

        <div style="background: #111; padding: 20px; display: flex; height: 250px; border-top: 2px solid #555;">
            <div style="flex: 1; border-right: 1px solid #333; padding-right: 20px;">
                <h3 style="color:#666; font-size: 12px; letter-spacing: 2px;">APPROACH</h3>
                <button class="btn-int" data-type="probe" style="display:block; width:100%; padding:10px; margin:5px 0; background:#222; color:white; border:1px solid #444; cursor:pointer;">PROBE (Logic)</button>
                <button class="btn-int" data-type="pry" style="display:block; width:100%; padding:10px; margin:5px 0; background:#222; color:white; border:1px solid #444; cursor:pointer;">PRY (Aggressive)</button>
                <button class="btn-int" data-type="provoke" style="display:block; width:100%; padding:10px; margin:5px 0; background:#222; color:white; border:1px solid #444; cursor:pointer;">PROVOKE (Risk)</button>
            </div>
            <div style="flex: 1; padding-left: 20px;">
                <h3 style="color:#666; font-size: 12px; letter-spacing: 2px;">EVIDENCE</h3>
                <div id="evidence-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <!-- Evidence Buttons -->
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(container);

    // Event Listeners
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-int')) {
            const type = e.target.getAttribute('data-type');
            if (type) performAction('approach', type);
            render();
        }
        if (e.target.classList.contains('btn-ev')) {
            const id = e.target.getAttribute('data-id');
            if (id) performAction('evidence', id);
            render();
        }
    });
}

function render() {
    if (!container) return;

    const state = getState();

    // Bars
    document.getElementById('bar-integrity').style.width = state.maskIntegrity + '%';
    document.getElementById('bar-stress').style.width = state.suspectStress + '%';

    // Text
    const textEl = document.getElementById('npc-text');
    textEl.textContent = `"${state.text}"`;
    textEl.style.color = state.stage === 'SHATTERED' ? '#ff4444' : 'white';

    // Evidence
    const evList = document.getElementById('evidence-list');
    evList.innerHTML = '';

    if (state.evidence) {
        state.evidence.forEach(ev => {
            const btn = document.createElement('button');
            btn.className = 'btn-ev';
            btn.setAttribute('data-id', ev.id);
            btn.textContent = ev.name;
            btn.style.cssText = "padding:15px; background:#222; color:#aaa; border:1px dashed #444; cursor:pointer;";
            evList.appendChild(btn);
        });
    }

    if (state.isGameOver) {
        textEl.textContent += " (CLOSING...)";
        setTimeout(() => {
            hideRenderer();
        }, 3000);
    }
}

export function showRenderer() {
    if (!container) initRenderer();
    container.style.display = 'flex';
    document.exitPointerLock();
    render();
}

export function hideRenderer() {
    if (container) container.style.display = 'none';
}
