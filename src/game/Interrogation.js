/**
 * Interrogation.js
 * Logic Core for "The Ghost in Room 404" (Spiced Edition)
 */

import { setPhase } from './GameState';

// --- GAME STATE ---
export const interrogationState = {
    currentSuspectId: null,
    maskIntegrity: 100,
    suspectStress: 0,
    stage: 'PRISTINE',
    strikes: 0, // 3 Strikes = Game Over

    // Inventory
    evidence: [
        { id: 'key_log', name: "Master Key Log", desc: "Access: 2PM (Maid), 3PM (Manager), 4:15PM (Guest)." },
        { id: 'wrapper', name: "Choco Wrapper", desc: "Lobby exclusive brand. Fingerprints on foil." },
        { id: 'photo', name: "Family Photo", desc: "Marcus with his real sister. She's blonde." }
    ],

    knowledge: {
        knows_red_coat: false,
        knows_cctv: false,
        knows_bribery: false
    },

    currentDialogueId: 'root',
    isGameOver: false,
    gameResult: null
};

export const SUSPECTS = {
    'beatrice': { name: "Beatrice (Maid)", role: "Theft Mask", difficulty: "Easy" },
    'jean': { name: "Officer Jean", role: "Laziness Mask", difficulty: "Medium" },
    'bizimana': { name: "Mr. Bizimana", role: "Reputation Mask", difficulty: "Medium" },
    'elena': { name: "Elena Vance", role: "The Sister?", difficulty: "Hard" }
};

// --- SCRIPTS WITH DETECTIVE QUERIES ---
const SCRIPTS = {
    'beatrice': {
        'root': {
            text: "I... I just changed the towels, sir. I didn't see anything! I'm a good worker!",
            approaches: {
                'probe': {
                    query: "We checked the logs. You entered at 2 PM. Why so nervous?",
                    text: "I'm not nervous! I just... I don't like police. Please let me go.",
                    damage: 10, stress: 10, next: 'beatrice_nerves'
                },
                'pry': {
                    query: "You're shaking, Beatrice. Tell me what you took.",
                    text: "I... I needed the money! But I didn't kill him! I swear!",
                    damage: 30, stress: 30, next: 'beatrice_theft'
                }
            }
        },
        'beatrice_nerves': {
            text: "I'm not nervous! I just... I don't like police. Please let me go.",
            approaches: {
                'pry': {
                    query: "We checked your pockets. $50 cash. The victim's wallet is empty.",
                    text: "Okay! I took the money! But I was hiding in the closet when SHE came in!",
                    damage: 50, stress: 50, next: 'beatrice_break'
                }
            },
            evidence: {
                'key_log': {
                    query: "The log says you were there for 20 minutes. That's a long time for towels.",
                    text: "I... I needed the money! But I didn't kill him! I swear!",
                    damage: 20, stress: 20, next: 'beatrice_theft'
                }
            }
        },
        'beatrice_theft': {
            text: "I... I needed the money! But I didn't kill him! I swear!",
            approaches: {
                'probe': {
                    query: "If you didn't kill him, give me a name. Who else was there?",
                    text: "I saw a woman! In a red coat! She went in after I left the closet. I ran away!",
                    damage: 100, stress: 0, next: 'beatrice_confess'
                },
                'provoke': {
                    query: "You're a thief and a liar. Why should I believe you?",
                    text: "I don't have to listen to this! I want a lawyer!",
                    stress: 100, next: 'shutdown' // Trap
                }
            }
        },
        'beatrice_break': {
            text: "Okay! I took the money! But I was hiding in the closet when SHE came in! A woman in a Red Coat!",
            isEnd: true, unlock: 'knows_red_coat', rewardText: "INTEL: 'Woman in Red Coat' seen entering at 4PM."
        },
        'beatrice_confess': {
            text: "I saw a woman! In a red coat! She went in after I left the closet. I ran away!",
            isEnd: true, unlock: 'knows_red_coat', rewardText: "INTEL: 'Woman in Red Coat' seen entering at 4PM."
        }
    },

    'jean': {
        'root': {
            text: "I was on my rounds. 4th floor patrol. Security is airtight here.",
            evidence: {
                'key_log': {
                    query: "The Key Log shows no badge scans on the 4th floor between 3 and 5 PM.",
                    text: "Look, the game was on! Manchester vs Liverpool! I... I might have sat down for a bit.",
                    damage: 60, stress: 20, next: 'jean_caught'
                }
            },
            approaches: {
                'pry': {
                    query: "We checked the breakroom cameras, Jean. We know.",
                    text: "Look, the game was on! Manchester vs Liverpool! I... I might have sat down for a bit.",
                    damage: 40, stress: 10, next: 'jean_caught'
                }
            }
        },
        'jean_caught': {
            text: "Look, the game was on! Manchester vs Liverpool! I... I might have sat down for a bit.",
            approaches: {
                'provoke': {
                    query: "A man died while you watched soccer. Give me something or you're fired.",
                    text: "Alright! I checked the lobby tapes to cover my tracks. A woman bought that specific chocolate at 4:05.",
                    damage: 100, stress: 50, next: 'jean_confess'
                }
            }
        },
        'jean_confess': {
            text: "Alright! I checked the lobby tapes to cover my tracks. A woman bought that specific chocolate at 4:05.",
            isEnd: true, unlock: 'knows_cctv', rewardText: "EVIDENCE: 'Lobby CCTV Transcript'"
        }
    },

    'bizimana': {
        'root': {
            text: "Mr. Thorne was a valued guest. I only visited to check on a noise complaint.",
            approaches: {
                'provoke': {
                    query: "A noise complaint? At 3 PM? He was alone.",
                    text: "He was... loud on the phone. Shouting about tax records. Bad for business.",
                    damage: 30, stress: 20, next: 'bizimana_defensive'
                }
            }
        },
        'bizimana_defensive': {
            text: "He was... loud on the phone. Shouting about tax records. Bad for business.",
            approaches: {
                'probe': {
                    query: "Tax records? He was a whistleblower. Were you bribing him to leave?",
                    text: "I offered him a refund to go elsewhere! He was bringing heat on us! But I didn't poison him!",
                    damage: 80, stress: 40, next: 'bizimana_break'
                }
            }
        },
        'bizimana_break': {
            text: "I offered him a refund to go elsewhere! He was bringing heat on us! But I didn't poison him!",
            isEnd: true, unlock: 'knows_bribery', rewardText: "INTEL: Motive established (Bribery), but alibi checks out."
        }
    },

    'elena': {
        'root': {
            text: "I'm his sister... I just came to say goodbye. Why are you doing this to me?",
            evidence: {
                'photo': {
                    query: "This is Marcus and his real sister. She's blonde. You aren't.",
                    text: "I left my purse in the taxi! Have some respect!",
                    damage: 50, stress: 60, next: 'elena_Lie1'
                }
            },
            approaches: {
                'probe': {
                    query: "You two seem close. Do you have ID?",
                    text: "I left my purse in the taxi! Have some respect!",
                    damage: 10, stress: 0, next: 'elena_deflect'
                }
            }
        },
        'elena_deflect': {
            text: "I left my purse in the taxi! Have some respect!",
            evidence: {
                'photo': {
                    query: "Respect facts. This is his real sister.",
                    text: "Fine! I'm a... close friend. An ex. Is it a crime to visit an ex?",
                    damage: 60, stress: 80, next: 'elena_Lie1'
                }
            }
        },
        'elena_Lie1': {
            text: "Fine! I'm a... close friend. An ex. Is it a crime to visit an ex?",
            approaches: {
                'probe': {
                    query: "Manager saw you in the lobby at 4:00. Why didn't you go up?",
                    text: "I was... admiring the architecture.",
                    damage: 20, stress: 10, next: 'elena_structure'
                },
            }
        },
        'elena_structure': {
            text: "I was... admiring the architecture.",
            evidence: {
                'cctv_log': {
                    query: "CCTV shows you in the Gift Shop. Buying chocolate.",
                    text: "Plenty of people buy chocolate! You can't pin this on me!",
                    damage: 80, stress: 50, next: 'elena_cornered'
                }
            },
            approaches: {
                'provoke': {
                    query: "Buying snacks? Like chocolate?",
                    text: "Plenty of people buy chocolate! You can't pin this on me!",
                    damage: 40, stress: 40, next: 'elena_cornered'
                }
            }
        },
        'elena_cornered': {
            text: "Plenty of people buy chocolate! You can't pin this on me!",
            evidence: {
                'wrapper': {
                    query: "This brand. Only sold there. And your fingerprints are inside the foil.",
                    text: "[MASK SHATTERED] He should have taken the deal. It was just business.",
                    damage: 100, stress: 100, next: 'elena_finale'
                }
            }
        },
        'elena_finale': {
            text: "[MASK SHATTERED] He should have taken the deal. It was just business.",
            isEnd: true, result: "VICTORY"
        },
        'shutdown': {
            text: "[SUSPECT HAS SHUT DOWN. LAWYER REQUESTED.]",
            isEnd: true, result: "STRIKE"
        }
    }
};

// --- LOGIC ---

export function startInterrogation() {
    interrogationState.currentSuspectId = null;
    interrogationState.strikes = 0;
    interrogationState.isGameOver = false;
    interrogationState.gameResult = null;
    console.log("LOGIC: Mystery Started");
}

export function selectSuspect(id) {
    if (!SUSPECTS[id]) return;
    interrogationState.currentSuspectId = id;
    interrogationState.maskIntegrity = 100;
    interrogationState.suspectStress = 0;
    interrogationState.stage = 'PRISTINE';
    interrogationState.currentDialogueId = 'root';
    console.log("LOGIC: Selected " + id);
}

export function returnToHub() {
    interrogationState.currentSuspectId = null;
}

export function performAction(type, id) {
    const script = SCRIPTS[interrogationState.currentSuspectId];
    if (!script) return;

    const node = script[interrogationState.currentDialogueId];
    if (!node) return;

    let outcome = null;
    if (type === 'approach') {
        outcome = node.approaches ? node.approaches[id] : null;
    } else if (type === 'evidence') {
        outcome = node.evidence ? node.evidence[id] : null;
    }

    if (!outcome) {
        console.log("LOGIC: Weak Action");
        // Weak actions increase stress slightly without damage?
        interrogationState.suspectStress += 5;
        return;
    }

    // Apply Effects
    interrogationState.maskIntegrity -= outcome.damage || 0;
    interrogationState.suspectStress += outcome.stress || 0;

    // Store last query for UI
    interrogationState.lastQuery = outcome.query || "...";

    // STRIKE LOGIC: Over-stressing triggers shutdown
    if (interrogationState.suspectStress >= 100 && !outcome.isSafe) {
        // If the outcome didn't explicitly lead to safe node, checking context...
        // Actually, let's use the 'next' node to see if it is 'shutdown'
        if (outcome.next === 'shutdown') {
            interrogationState.strikes++;
            interrogationState.suspectStress = 0; // Reset for next attempt? Or Lock suspect?
            // For Jam simplicity: Reset Suspect, kick to Hub, add Strike.
            interrogationState.currentSuspectId = null;
            if (interrogationState.strikes >= 3) {
                endGame("GAME OVER: TOO MANY MISTAKES");
                return;
            }
        }
    }

    // Clamp
    if (interrogationState.maskIntegrity < 0) interrogationState.maskIntegrity = 0;
    if (interrogationState.suspectStress > 100) interrogationState.suspectStress = 100;
    if (interrogationState.suspectStress < 0) interrogationState.suspectStress = 0;

    // Check Stages
    if (interrogationState.maskIntegrity < 30) interrogationState.stage = 'SHATTERED';
    else if (interrogationState.maskIntegrity < 70) interrogationState.stage = 'CRACKED';

    // Unlocks
    if (outcome.unlock) {
        interrogationState.knowledge[outcome.unlock] = true;
        if (outcome.unlock === 'knows_cctv') {
            addEvidence('cctv_log', "Lobby CCTV", "Shows Elena verifying choco purchase.");
        }
    }

    // Move Next
    if (outcome.next) {
        interrogationState.currentDialogueId = outcome.next;
    }

    // Immediate Victory/Defeat Checks
    const nextNode = script[interrogationState.currentDialogueId];
    if (nextNode && nextNode.isEnd) {
        if (nextNode.result === "VICTORY") {
            interrogationState.gameResult = "VICTORY";
            interrogationState.isGameOver = true;
        } else if (nextNode.result === "STRIKE") {
            // Already handled above, but just to be safe
            interrogationState.strikes++;
            returnToHub();
        } else {
            // Standard node end (Intel Gained)
            setTimeout(() => {
                returnToHub();
            }, 4000);
        }
    }
}

function addEvidence(id, name, desc) {
    if (!interrogationState.evidence.find(e => e.id === id)) {
        interrogationState.evidence.push({ id, name, desc });
    }
}

function endGame(result) {
    interrogationState.isGameOver = true;
    interrogationState.gameResult = result;
}

export function getState() {
    if (!interrogationState.currentSuspectId) {
        return { isHub: true, ...interrogationState };
    }
    const script = SCRIPTS[interrogationState.currentSuspectId];
    const node = script[interrogationState.currentDialogueId];
    return {
        isHub: false,
        ...interrogationState,
        text: node ? node.text : "...",
        lastQuery: interrogationState.lastQuery, // Send query to UI
        rewardText: node ? node.rewardText : null
    };
}
