/**
 * Suspect.js
 * Data model for suspects used in the interrogation phase.
 */

export function createSuspects() {
    return [
        {
            id: 'taxi',
            name: 'Grizzled Taxi Driver',
            color: '#b5651d',
            baseGuard: 60,
            // Clues that prove the suspect's involvement if presented
            truthMatches: ['clue_photo', 'clue_glove'],
            maskedResponses: [
                "I don't know anything about that night.",
                "Look, I was just driving—can't remember faces.",
                "You got the wrong person, mister."
            ],
            unmaskedResponses: [
                "Alright. I saw someone in a red coat by the alley—I thought nothing of it.",
                "I picked up a passenger who left something behind—maybe that glove?"
            ]
        },
        {
            id: 'socialite',
            name: 'Polished Socialite',
            color: '#8a56b3',
            baseGuard: 40,
            truthMatches: ['clue_note', 'clue_phone'],
            maskedResponses: [
                "I'm sure those rumors are exaggerated.",
                "I was at home. My staff can confirm.",
            ],
            unmaskedResponses: [
                "Well, maybe I spoke to someone suspicious that night—briefly.",
            ]
        }
    ];
}

export function findSuspectById(id) {
    const all = createSuspects();
    return all.find(s => s.id === id);
}
