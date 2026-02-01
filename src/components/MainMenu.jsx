import { setPhase } from '../game/GameLoop';

export function MainMenu() {

    const handleStart = () => {
        setPhase('INTERROGATION');
    };

    const handleLoad = () => {
        alert("Load Game feature coming soon!");
    };

    const handleOptions = () => {
        alert("Controls:\nArrows to Move\nSpace to Jump\n1,2,3 to switch Masks\nI to Interrogate");
    };

    const handleExit = () => {
        window.close(); // Might not work in browser, but good for intent
        alert("Thanks for playing!");
    };

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
            paddingLeft: '100px', zIndex: 100, pointerEvents: 'auto'
        }}>
            {/* Title / Logo */}
            <h1 style={{
                fontSize: '80px', color: '#fff', textTransform: 'uppercase',
                marginBottom: '40px', letterSpacing: '8px',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.4), 4px 4px 0 #000'
            }}>
                UN<span style={{ color: '#ff3333' }}>MASK</span>
            </h1>

            {/* Menu Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <MenuButton onClick={handleStart}>START CASE</MenuButton>
                <MenuButton onClick={handleLoad}>LOAD GAME</MenuButton>
                <MenuButton onClick={handleOptions}>CLASSIFIED ARCHIVE</MenuButton>
                <MenuButton onClick={handleExit}>EXIT</MenuButton>
            </div>

            <div style={{
                marginTop: '60px', color: '#666', fontSize: '14px',
                borderTop: '1px solid #333', paddingTop: '10px'
            }}>
                GGJ 2026 Build v0.1
            </div>
        </div>
    );
}

function MenuButton({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="menu-btn"
            style={{
                background: 'transparent', border: 'none', color: '#ccc',
                fontSize: '32px', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: '4px', textTransform: 'uppercase',
                transition: 'all 0.2s', padding: '10px 0', width: 'fit-content'
            }}
            onMouseOver={(e) => {
                e.target.style.color = '#fff';
                e.target.style.paddingLeft = '20px';
                e.target.style.textShadow = '0 0 10px #fff';
            }}
            onMouseOut={(e) => {
                e.target.style.color = '#ccc';
                e.target.style.paddingLeft = '0';
                e.target.style.textShadow = 'none';
            }}
        >
            {children}
        </button>
    );
}
