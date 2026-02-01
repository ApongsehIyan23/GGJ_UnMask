import { useState, useEffect } from 'react';
import { getState, performAction } from '../game/Interrogation';

export function InterrogationUI() {
    const [data, setData] = useState(() => {
        try {
            const s = getState();
            console.log("InterrogationUI: Initial State:", s);
            return s;
        } catch (e) {
            console.error("InterrogationUI: Init Error", e);
            return null;
        }
    });

    useEffect(() => {
        console.log("InterrogationUI: MOUNTED");
        document.exitPointerLock();

        const interval = setInterval(() => {
            const newState = getState();
            setData({ ...newState });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const handleApproach = (type) => {
        console.log("UI: Approach", type);
        performAction('approach', type);
    };

    const handleEvidence = (id) => {
        console.log("UI: Evidence", id);
        performAction('evidence', id);
    };

    // Safety Rendering
    if (!data) return <div style={{ position: 'absolute', top: 50, left: 50, color: 'red', zIndex: 999, fontSize: 30 }}>ERROR: No Data</div>;
    if (!data.text) return <div style={{ position: 'absolute', top: 50, left: 50, color: 'red', zIndex: 999, fontSize: 30 }}>ERROR: No Text</div>;

    return (
        <div className="unmask-ui">
            {/* TOP BAR: STATUS */}
            <div className="status-bar">
                <div className="integrity-monitor">
                    <label>MASK INTEGRITY</label>
                    <div className="bar-frame">
                        <div
                            className="bar-fill integrity"
                            style={{ width: `${data.maskIntegrity}%` }}
                        />
                    </div>
                </div>
                <div className="stress-monitor">
                    <label>SUSPECT STRESS</label>
                    <div className="bar-frame">
                        <div
                            className="bar-fill stress"
                            style={{ width: `${data.suspectStress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* CENTER: SILAS */}
            <div className="transcript-overlay">
                <div className="npc-speech">
                    <span className="speaker">SILAS:</span>
                    <p className={`speech-text stage-${data.stage ? data.stage.toLowerCase() : 'pristine'}`}>
                        "{data.text}"
                    </p>
                </div>
            </div>

            {/* BOTTOM: CONTROLS */}
            <div className="control-deck">
                {/* APPROACHES */}
                <div className="approaches">
                    <h3>APPROACH</h3>
                    <button className="btn-approach probe" onClick={() => handleApproach('probe')}>
                        PROBE (Logic)
                    </button>
                    <button className="btn-approach pry" onClick={() => handleApproach('pry')}>
                        PRY (Aggressive)
                    </button>
                    <button className="btn-approach provoke" onClick={() => handleApproach('provoke')}>
                        PROVOKE (Risk)
                    </button>
                </div>

                {/* EVIDENCE SATCHEL */}
                <div className="evidence-satchel">
                    <h3>EVIDENCE</h3>
                    <div className="evidence-grid">
                        {data.evidence && data.evidence.map(item => (
                            <button key={item.id} className="btn-evidence" onClick={() => handleEvidence(item.id)}>
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .unmask-ui {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    pointer-events: auto;
                    font-family: 'Courier New', monospace;
                    color: white;
                    display: flex; flex-direction: column; justify-content: space-between;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, black);
                }
                .status-bar {
                    display: flex; gap: 40px; padding: 20px;
                    background: black; border-bottom: 2px solid #444;
                }
                .integrity-monitor, .stress-monitor { flex: 1; }
                .label { font-size: 14px; color: #888; }
                .bar-frame { height: 10px; background: #222; border: 1px solid #555; margin-top: 5px; }
                .bar-fill { height: 100%; transition: width 0.5s; }
                .integrity { background: white; box-shadow: 0 0 10px white; }
                .stress { background: red; opacity: 0.8; }

                .transcript-overlay {
                    text-align: center;
                    margin-top: 100px;
                    text-shadow: 0 2px 4px black;
                }
                .npc-speech { 
                    background: rgba(0,0,0,0.7); 
                    display: inline-block; 
                    padding: 20px 40px; 
                    border-radius: 4px; 
                }
                .speaker { color: #aaa; font-size: 14px; display: block; margin-bottom: 10px; }
                .speech-text { font-size: 24px; color: #fff; max-width: 600px; margin: 0; }
                .stage-cracked { color: #fec; font-style: italic; letter-spacing: 1px; }
                .stage-shattered { color: #f00; font-weight: bold; transform: rotate(-1deg); }

                .control-deck {
                    display: flex; height: 300px; background: #0a0a0a; border-top: 2px solid #333;
                }
                .approaches, .evidence-satchel {
                    flex: 1; padding: 20px;
                }
                .approaches { border-right: 1px solid #333; }
                h3 { font-size: 12px; letter-spacing: 2px; color: #666; margin-bottom: 20px; }

                .btn-approach {
                    display: block; width: 100%; padding: 15px; margin-bottom: 10px;
                    background: transparent; border: 1px solid #444; color: #ccc;
                    cursor: pointer; text-align: left; font-family: inherit;
                    transition: all 0.2s;
                }
                .btn-approach:hover { background: #222; padding-left: 20px; color: white; border-color: white;}
                
                .evidence-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .btn-evidence {
                    padding: 20px; background: #111; border: 1px dashed #444; color: #888;
                    cursor: pointer;
                }
                .btn-evidence:hover { border-color: #f00; color: #f00; background: #1a0000; }
            `}</style>
        </div>
    );
}
