import { useState } from 'react';
import { gameState, setPhase, setScreenShake } from '../game/GameLoop';
import { empathize, pressure, presentEvidence } from '../game/Interrogation';

export function InterrogationUI() {
    const [_, setTick] = useState(0);
    const iq = gameState.interrogation;
    const [showEvidence, setShowEvidence] = useState(false);

    if (!iq) return null;

    const forceUpdate = () => setTick(t => t + 1);

    const handleAction = (action) => {
        if (action === 'EMPATHIZE') {
            empathize(gameState);
        } else if (action === 'PRESSURE') {
            pressure(gameState);
        }
        forceUpdate();
    };

    const handleEvidence = (clue) => {
        const res = presentEvidence(gameState, clue);
        setShowEvidence(false);
        if (res.success) {
            // Confession!
            setTimeout(() => {
                gameState.player.foundConfession = true;
                setPhase('RUNNING');
            }, 2000); // Wait a bit to see result
        }
        forceUpdate();
    };

    return (
        <div className="interrogation-overlay" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
            zIndex: 100, color: 'white'
        }}>
            <div style={{
                display: 'flex', width: '800px', height: '400px', background: '#111',
                border: '1px solid #333', boxShadow: '0 0 50px rgba(0,0,0,0.8)'
            }}>
                {/* Left: Suspect */}
                <div style={{ width: '250px', padding: '20px', background: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '180px', height: '220px', backgroundColor: iq.suspect.color,
                        marginBottom: '10px', filter: iq.masked ? 'brightness(0.5) blur(2px)' : 'none'
                    }} />
                    <h3>{iq.suspect.name}</h3>
                    <div style={{ color: '#aaa' }}>Guard Level: {iq.guard}</div>
                </div>

                {/* Right: Dialogue & Actions */}
                <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, background: '#0f0f0f', padding: '15px', fontFamily: 'monospace', fontSize: '16px', lineHeight: '1.5', border: '1px solid #333' }}>
                        "{iq.lastResponse}"
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <Button onClick={() => handleAction('EMPATHIZE')}>Empathize</Button>
                        <Button onClick={() => handleAction('PRESSURE')}>Pressure</Button>
                        <Button onClick={() => setShowEvidence(!showEvidence)}>
                            {showEvidence ? 'Cancel' : 'Present Evidence'}
                        </Button>
                    </div>

                    {/* Evidence Picker */}
                    {showEvidence && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                            {gameState.player.clues.map(c => (
                                <div key={c.id} onClick={() => handleEvidence(c)} style={{
                                    background: '#222', padding: '8px', fontSize: '12px', cursor: 'pointer',
                                    border: '1px solid #444', minWidth: '100px'
                                }}>
                                    {c.title}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Button({ children, onClick }) {
    return (
        <button onClick={onClick} style={{
            flex: 1, padding: '15px', background: '#222', color: 'white',
            border: '1px solid #555', cursor: 'pointer', textTransform: 'uppercase',
            fontWeight: 'bold', fontSize: '14px'
        }}>
            {children}
        </button>
    );
}
