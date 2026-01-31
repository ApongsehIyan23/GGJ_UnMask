import { useState } from 'react';
import { gameState, setPhase, setScreenShake } from '../game/GameLoop';
import { getSelectedClues } from '../game/Clues';

export function PrepUI() {
    // We use a local force update or state to track selections because gameState is mutable
    const [_, setTick] = useState(0);
    const clues = gameState.clues;

    const toggleClue = (clue) => {
        // Toggle logic
        const selectedCount = getSelectedClues(clues).length;
        if (!clue.picked && selectedCount >= 3) {
            setScreenShake(5);
            return;
        }
        clue.picked = !clue.picked;
        setTick(t => t + 1); // Re-render
    };

    const handleConfirm = () => {
        const selected = getSelectedClues(clues);
        if (selected.length > 0) {
            gameState.player.clues = selected;
            setPhase('RUNNING');
        } else {
            setScreenShake(10);
        }
    };

    return (
        <div className="prep-overlay" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
            color: 'white', zIndex: 100
        }}>
            <h2 style={{ letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
                Prepare for the Interrogation
            </h2>
            <p>Select up to 3 clues to use as evidence.</p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80%', margin: '40px 0' }}>
                {clues.map(clue => (
                    <div key={clue.id} onClick={() => toggleClue(clue)} style={{
                        width: '200px', padding: '15px',
                        border: clue.picked ? '2px solid #ffd56b' : '1px solid #444',
                        background: clue.picked ? '#222' : '#111',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        <div style={{ width: '40px', height: '40px', background: '#333', marginBottom: '10px' }} />
                        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: clue.picked ? '#ffd56b' : '#fff' }}>
                            {clue.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#aaa' }}>{clue.content}</div>
                    </div>
                ))}
            </div>

            <button onClick={handleConfirm} style={{
                padding: '10px 40px', fontSize: '18px', background: '#ffd56b', border: 'none',
                cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px'
            }}>
                CONFIRM SELECTION
            </button>
        </div>
    );
}
