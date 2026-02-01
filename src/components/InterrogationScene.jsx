import { useState, useEffect, useRef } from 'react';
import { getState, performAction, startInterrogation, selectSuspect, SUSPECTS, returnToHub } from '../game/Interrogation';
import hubAudioSrc from '../assets/sfx/loading-screen.wav';
import gameAudioSrc from '../assets/sfx/questioning.wav';

export function InterrogationScene() {
    const [data, setData] = useState(getState());
    const [typedText, setTypedText] = useState("");
    const [isLoading, setIsLoading] = useState(false); // New loading state
    const typeIndex = useRef(0);

    // Audio Refs
    const hubAudio = useRef(new Audio(hubAudioSrc));
    const gameAudio = useRef(new Audio(gameAudioSrc));


    // Asset Preloading
    useEffect(() => {
        const ASSETS = [
            '/textures/sprites/maid.png',
            '/textures/sprites/security-guard.png',
            '/textures/sprites/manager.png',
            '/textures/sprites/elenavance.png',
            '/textures/sprites/detective.png',
            '/textures/bgs/Beatrice-bg.jpeg',
            '/textures/bgs/officer-jean-bg.jpg',
            '/textures/bgs/mr-bizimana-bg.jpeg',
            '/textures/bgs/elanavance-bg.webp'
        ];

        ASSETS.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    // Audio Initialization & State Management
    useEffect(() => {
        // Setup initial audio properties
        // We play BOTH tracks simultaneously and just toggle volume to avoid loading lag
        hubAudio.current.loop = true;
        hubAudio.current.volume = 0; // Start muted
        hubAudio.current.preload = 'auto';

        gameAudio.current.loop = true;
        gameAudio.current.volume = 0; // Start muted
        gameAudio.current.preload = 'auto';

        // Attempt early load
        hubAudio.current.load();
        gameAudio.current.load();

        const stopAll = () => {
            hubAudio.current.pause();
            gameAudio.current.pause();
        };

        return () => stopAll();
    }, []);

    // Handle Volume Switching (Zero Latency)
    useEffect(() => {
        const targetHubVolume = data.isHub ? 0.5 : 0;
        const targetGameVolume = data.isHub ? 0 : 0.5;

        // Instant switch (can be faded if desired, but instant is snappier for now)
        hubAudio.current.volume = targetHubVolume;
        gameAudio.current.volume = targetGameVolume;

        // Ensure they are playing (in case one was paused or never started)
        const ensurePlaying = async () => {
            try {
                if (hubAudio.current.paused) await hubAudio.current.play();
                if (gameAudio.current.paused) await gameAudio.current.play();
            } catch (err) {
                console.warn("Audio autoplay blocked. Waiting for interaction.");

                const forceStart = () => {
                    hubAudio.current.play();
                    gameAudio.current.play();
                    // Re-apply volumes after forced start
                    hubAudio.current.volume = targetHubVolume;
                    gameAudio.current.volume = targetGameVolume;

                    window.removeEventListener('click', forceStart);
                    window.removeEventListener('keydown', forceStart);
                };

                window.addEventListener('click', forceStart);
                window.addEventListener('keydown', forceStart);
            }
        };

        ensurePlaying();
    }, [data.isHub]);

    // Initial Start
    useEffect(() => {
        const update = () => setData({ ...getState() });
        const interval = setInterval(update, 100);
        return () => clearInterval(interval);
    }, []);

    // Typewriter Effect
    useEffect(() => {
        setTypedText("");
        typeIndex.current = 0;

        if (data.isHub) return;

        const fullText = data.text || "...";
        const typing = setInterval(() => {
            if (typeIndex.current < fullText.length) {
                setTypedText(prev => prev + fullText.charAt(typeIndex.current));
                typeIndex.current++;
            } else {
                clearInterval(typing);
            }
        }, 20);

        return () => clearInterval(typing);
    }, [data.text, data.isHub, data.currentDialogueId]);

    // Handlers
    const handleAction = (type, id) => {
        performAction(type, id);
    };

    const handleSelectSuspect = (id) => {

        setIsLoading(true);

        // Simulate loading to allow audio buffer and avoid visual hitch
        setTimeout(() => {
            selectSuspect(id);
            setIsLoading(false);
        }, 1500);
    };

    const handleBack = () => {
        returnToHub();
    };

    // LOADING SCREEN
    if (isLoading) {
        return (
            <div className="vn-container" style={{
                background: '#000', color: '#fff', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', zIndex: 999
            }}>
                <h2 style={{ letterSpacing: '5px', animation: 'blink 1s infinite' }}>LOADING CASE FILE...</h2>
                <style>{`@keyframes blink { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
            </div>
        );
    }

    // HUB VIEW
    if (data.isHub) {
        return (
            <div className="vn-container hub">
                <div className="strikes-panel">
                    STRIKES: <span className="x-mark">{'X '.repeat(data.strikes)}</span>
                </div>
                <div className="hub-header">
                    <h2>SUSPECT LIST</h2>
                    <p>Select a suspect to interrogate.</p>
                </div>
                <div className="suspect-grid">
                    {Object.entries(SUSPECTS).map(([id, info]) => {
                        let sprite = '';
                        if (id === 'beatrice') sprite = '/textures/sprites/maid.png';
                        if (id === 'jean') sprite = '/textures/sprites/security-guard.png';
                        if (id === 'bizimana') sprite = '/textures/sprites/manager.png';
                        if (id === 'elena') sprite = '/textures/sprites/elenavance.png';

                        return (
                            <div key={id} className="suspect-card" onClick={() => handleSelectSuspect(id)}>
                                <div className="mugshot" style={{ backgroundImage: `url(${sprite})` }}></div>
                                <h3>{info.name}</h3>
                                <span className="sc-role">{info.role}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="hub-synopsis">
                    <h4>CASE FILE: 404</h4>
                    <p>Murder at Norresken Resorts. A guest, Silas, was found dead. Only FOUR people had access to the crime scene.</p>
                    <p className="instruction">
                        <span className="keyword">PROBE</span> for information.
                        <span className="keyword">PRY</span> into secrets.
                        <span className="keyword">PROVOKE</span> a reaction.
                    </p>
                    <p className="goal">WATCH FOR STRESS. FIND THE LIE. UNMASK THE KILLER.</p>
                </div>

                <style>{`
                    .hub { flex-direction: column; justify-content: start; padding-top: 50px; }
                    .hub-header { text-align: center; color: white; margin-bottom: 30px; }
                    .hub-header h2 { font-size: 40px; letter-spacing: 5px; margin: 0; }
                    
                    .suspect-grid { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; z-index: 10; margin-bottom: 40px; }
                    .suspect-card {
                        width: 200px; height: 350px; background: rgba(0,0,0,0.8); border: 1px solid #444;
                        display: flex; flex-direction: column; align-items: center; padding: 10px;
                        cursor: pointer; transition: all 0.2s;
                    }
                    .suspect-card:hover { transform: scale(1.05); border-color: white; background: #333; }
                    .mugshot { 
                        width: 100%; height: 250px; 
                        background-color: #111; 
                        background-size: cover; 
                        background-position: top center;
                        margin-bottom: 10px; 
                        border-bottom: 1px solid #333;
                    }
                    .suspect-card h3 { margin: 10px 0 5px 0; color: #fff; text-transform: uppercase; letter-spacing: 2px; }
                    .sc-role { color: #888; font-size: 12px; font-style: italic; }

                    .hub-synopsis {
                        background: rgba(0,0,0,0.7);
                        border-top: 2px solid #555;
                        border-bottom: 2px solid #555;
                        padding: 20px;
                        text-align: center;
                        color: #ccc;
                        max-width: 800px;
                        margin: 20px auto;
                        backdrop-filter: blur(5px);
                    }
                    .hub-synopsis h4 { color: #888; letter-spacing: 3px; margin: 0 0 10px 0; }
                    .hub-synopsis p { margin: 5px 0; font-size: 16px; }
                    .hub-synopsis .instruction { color: #aaa; font-style: italic; margin-top: 15px; }
                    .hub-synopsis .keyword { color: #4ecdc4; font-weight: bold; margin: 0 5px; }
                    .hub-synopsis .goal { color: #fff; font-weight: bold; margin-top: 15px; letter-spacing: 2px; }

                    .strikes-panel { position: absolute; top: 20px; right: 20px; color: white; font-size: 20px; letter-spacing: 2px; }
                    .x-mark { color: red; font-weight: bold; }
                `}</style>
            </div>
        );
    }

    // INTERROGATION VIEW
    const currentSuspect = SUSPECTS[data.currentSuspectId];

    // Styles for specific suspects
    // Dynamic Sprite Logic
    const getSuspectSprite = () => {
        const suspectId = data.currentSuspectId;
        if (suspectId === 'beatrice') return '/textures/sprites/maid.png';
        if (suspectId === 'jean') return '/textures/sprites/security-guard.png';
        if (suspectId === 'bizimana') return '/textures/sprites/manager.png';
        if (suspectId === 'elena') return '/textures/sprites/elenavance.png';
        return null;
    };

    const getSpritePosition = () => {
        // Assuming static images for now
        return 'center bottom';
    };

    const getBackground = () => {
        if (!data.currentSuspectId) return 'linear-gradient(to bottom, #1a1a1a, #000)';
        switch (data.currentSuspectId) {
            case 'beatrice': return 'url(/textures/bgs/Beatrice-bg.jpeg)';
            case 'jean': return 'url(/textures/bgs/officer-jean-bg.jpg)';
            case 'bizimana': return 'url(/textures/bgs/mr-bizimana-bg.jpeg)';
            case 'elena': return 'url(/textures/bgs/elanavance-bg.webp)';
            default: return 'linear-gradient(to bottom, #050505ff, #000)';
        }
    };

    const getSuspectStyle = () => {
        const baseStyle = {
            position: 'absolute', bottom: 0,
            backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center bottom',
            backgroundColor: 'transparent',
            zIndex: 1,
            transition: 'filter 0.5s',
            // Apply subtle 'breathing' animation or filter based on stress
            filter: data.suspectStress > 50 ? 'contrast(1.2) drop-shadow(0 0 10px rgba(255,0,0,0.3))' : 'none'
        };

        switch (data.currentSuspectId) {
            case 'beatrice':
                return { ...baseStyle, height: '95%', width: '900px', right: '10%' };
            case 'jean':
                return { ...baseStyle, height: '85%', width: '760px', right: '5%' };
            case 'bizimana':
                return { ...baseStyle, height: '100%', width: '1300px', right: '-10%' };
            case 'elena':
                return { ...baseStyle, height: '90%', width: '1000px', right: '12%' };
            default:
                return { ...baseStyle, height: '95%', width: '800px', right: '15%' };
        }
    };

    // Check for Game Over / Victory Screens
    if (data.isGameOver) {
        return (
            <div className="vn-container" style={{ flexDirection: 'column', color: 'white', textAlign: 'center' }}>
                <div className="vn-bg" style={{
                    backgroundImage: getBackground(),
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    filter: 'grayscale(100%) brightness(0.3)',
                    position: 'absolute', zIndex: -1, width: '100%', height: '100%'
                }}></div>
                <h1 style={{ fontSize: 60, color: data.gameResult.includes('VICTORY') ? 'gold' : 'red' }}>
                    {data.gameResult}
                </h1>
                <button onClick={() => window.location.reload()} style={{
                    padding: '15px 30px', marginTop: 30, cursor: 'pointer',
                    background: 'transparent', border: '2px solid white', color: 'white',
                    fontSize: '20px', letterSpacing: '2px'
                }}>PLAY AGAIN</button>
            </div>
        );
    }

    const containerStyle = {
        animation: data.lastActionType === 'approach' && data.suspectStress > 50 ? 'shake 0.5s' : 'none',
        backgroundColor: '#000'
    };

    const spriteUrl = getSuspectSprite();

    return (
        <div className="vn-container" style={containerStyle}>
            {/* BACKGROUND */}
            <div className="vn-bg" style={{
                backgroundImage: getBackground(),
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                filter: 'brightness(0.6)',
                transition: 'background-image 0.5s ease-in-out',
                width: '100%', height: '100%', position: 'absolute', zIndex: 0
            }}></div>

            {/* DETECTIVE SPRITE (LEFT - MOVED INWARD) */}
            <div className="detective-sprite" style={{
                position: 'absolute', bottom: 0, left: '10%', height: '100%', width: '6000px',
                backgroundImage: 'url(/textures/sprites/detective.png)',
                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
                zIndex: 2, filter: 'brightness(0.5)'
            }}></div>

            {/* SUSPECT SPRITE (RIGHT-CENTER) */}
            <div className="suspect-sprite" style={{
                ...getSuspectStyle(),
                backgroundImage: spriteUrl ? `url(${spriteUrl})` : 'none',
            }}></div>

            <button onClick={handleBack} style={{
                position: 'absolute', top: 20, left: 20, zIndex: 100,
                background: 'rgba(0,0,0,0.5)', border: '1px solid #444', color: '#fff', padding: '10px 20px',
                cursor: 'pointer', fontFamily: 'Courier New'
            }}>
                &larr; BACK TO HUB
            </button>

            <div className="strikes-panel" style={{ position: 'absolute', top: 20, right: 20, color: 'white', fontSize: '24px', textShadow: '0 0 5px black', zIndex: 100 }}>
                STRIKES: <span className="x-mark" style={{ color: 'red' }}>{'X '.repeat(data.strikes)}</span>
            </div>

            {/* REWARD TEXT OVERLAY */}
            {data.rewardText && (
                <div className="reward-overlay">
                    <h1>{data.rewardText}</h1>
                </div>
            )}

            {/* UI LAYER */}
            <div className="vn-ui local-font" style={{ zIndex: 10 }}>
                {/* Stats */}
                <div className="vn-stats">
                    <div className="stat-box">
                        <label style={{ textShadow: '0 0 3px black' }}>MASK INTEGRITY ({currentSuspect?.name})</label>
                        <div className="bar"><div style={{ width: `${data.maskIntegrity}%` }} className="fill white"></div></div>
                    </div>
                    <div className="stat-box">
                        <label style={{ textShadow: '0 0 3px black' }}>STRESS</label>
                        <div className="bar"><div style={{ width: `${data.suspectStress}%` }} className="fill red"></div></div>
                    </div>
                </div>

                {/* Question & Dialogue Wrapper */}
                <div className="vn-dialogue-wrapper" style={{ marginBottom: 20 }}>
                    {/* Detective Query Bubble */}
                    {data.lastQuery && (
                        <div className="detective-query" style={{
                            color: '#4ecdc4', borderLeft: '4px solid #4ecdc4',
                            marginBottom: 10, fontStyle: 'italic', background: 'transparent', padding: '15px 0',
                            maxWidth: '80%', textShadow: '0 0 5px black, 0 0 10px black'
                        }}>
                            <span style={{ fontWeight: 'bold', marginRight: 10, textTransform: 'uppercase' }}>YOU:</span>
                            "{data.lastQuery}"
                        </div>
                    )}

                    {/* Suspect Response */}
                    <div className="vn-dialogue-box">
                        <div className="speaker-name">{currentSuspect?.name}</div>
                        <div className="dialogue-text">{typedText}</div>
                    </div>
                </div>

                {/* Interaction Deck */}
                <div className="vn-deck">
                    <div className="actions-column">
                        <button onClick={() => { handleAction('approach', 'probe'); }} className="btn-vn probe">
                            <span className="icon">🔍</span> PROBE
                        </button>
                        <button onClick={() => { handleAction('approach', 'pry'); }} className="btn-vn pry">
                            <span className="icon">🔨</span> PRY
                        </button>
                        <button onClick={() => { handleAction('approach', 'provoke'); }} className="btn-vn provoke">
                            <span className="icon">💥</span> PROVOKE
                        </button>
                    </div>

                    <div className="evidence-column">
                        <h4>EVIDENCE SATCHEL</h4>
                        <div className="grid">
                            {data.evidence.map(ev => (
                                <button key={ev.id} onClick={() => { handleAction('evidence', ev.id); }} className="btn-ev" title={ev.desc}>
                                    {ev.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .vn-container {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: #000;
                    display: flex; justify-content: center; align-items: center;
                    overflow: hidden;
                }
                .vn-bg {
                    position: absolute; width: 100%; height: 100%;
                    background: linear-gradient(to bottom, #1a1a1a, #000);
                    opacity: 0.5;
                }
                .vn-sprite {
                    position: absolute; bottom: 0; height: 90%;
                    transition: transform 0.3s;
                    display: flex; align-items: flex-end; justify-content: center;
                }
                .vn-ui {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    display: flex; flex-direction: column; justify-content: flex-end;
                    padding: 40px; box-sizing: border-box;
                    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
                }

                .vn-stats {
                    position: absolute; top: 20px; left: 20px; right: 20px;
                    display: flex; gap: 40px;
                }
                .stat-box { flex: 1; }
                .stat-box label { display: block; color: #fff; font-size: 14px; letter-spacing: 2px; margin-bottom: 5px; font-weight: bold; text-shadow: 0 0 3px black; }
                .bar { height: 8px; background: rgba(0,0,0,0.5); border: 1px solid #777; }
                .fill { height: 100%; transition: width 0.5s ease-out; }
                .fill.white { background: #fff; box-shadow: 0 0 10px rgba(255,255,255,0.8); }
                .fill.red { background: #f00; box-shadow: 0 0 10px rgba(255,0,0,0.8); }

                .vn-dialogue-box {
                    background: transparent;
                    padding: 20px 0;
                    min-height: 100px;
                    text-shadow: 0 0 5px black, 0 0 10px black;
                }
                .speaker-name {
                    color: #fff; font-size: 18px; letter-spacing: 3px; margin-bottom: 10px;
                    border-bottom: 2px solid rgba(255,255,255,0.5); display: inline-block; padding-bottom: 5px;
                    text-transform: uppercase;
                }
                .dialogue-text {
                    color: #fff; font-size: 24px; line-height: 1.4; font-family: 'Courier New', monospace;
                }

                .vn-deck {
                    display: flex; height: 200px; gap: 20px; margin-top: 20px;
                }
                .actions-column { width: 300px; display: flex; flex-direction: column; gap: 10px; }
                .evidence-column { flex: 1; background: transparent; border-top: 1px solid rgba(255,255,255,0.3); padding: 15px; }
                .evidence-column h4 { margin: 0 0 10px 0; color: #aaa; font-size: 14px; letter-spacing: 2px; text-shadow: 0 0 3px black; }

                .btn-vn {
                    flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.3); color: #ddd;
                    display: flex; align-items: center; padding: 0 20px;
                    cursor: pointer; transition: all 0.2s;
                    text-align: left; text-shadow: 0 0 3px black;
                }
                .btn-vn:hover { background: rgba(255,255,255,0.1); border-color: #fff; color: #fff; transform: translateX(10px); }
                .btn-vn .icon { margin-right: 15px; font-size: 20px; }
                
                .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .btn-ev {
                    padding: 15px; background: rgba(0,0,0,0.4); border: 1px dashed rgba(255,255,255,0.3); color: #ccc; cursor: pointer; text-shadow: 0 0 3px black;
                }
                .btn-ev:hover { border-color: #f00; color: #f00; background: rgba(50,0,0,0.5); }

                .reward-overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.9);
                    display: flex; justify-content: center; align-items: center;
                    color: gold; text-align: center; z-index: 200;
                    animation: fadeIn 0.5s;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}
