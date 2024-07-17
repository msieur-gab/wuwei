import { CONFIG } from './config.js';

export class SoundComposer {
    constructor() {
        this.sounds = {
            slow: ['slow1.mp3', 'slow2.mp3'],
            medium: ['medium1.mp3', 'medium2.mp3'],
            fast: ['fast1.mp3', 'fast2.mp3']
        };
        this.currentSounds = [];
        this.audioElements = [];
        this.isPlaying = false;
    }

    updateSounds(bpm) {
        let category;
        if (bpm < 60) category = 'slow';
        else if (bpm < 100) category = 'medium';
        else category = 'fast';

        this.currentSounds = this.sounds[category];
        this.loadSounds();
    }

    loadSounds() {
        this.audioElements = this.currentSounds.map(sound => {
            const audio = new Audio(CONFIG.SOUNDS_PATH + sound);
            audio.loop = true;
            return audio;
        });
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.playSounds();
        } else {
            this.pauseSounds();
        }
        return this.isPlaying;
    }

    playSounds() {
        this.audioElements.forEach(audio => audio.play());
    }

    pauseSounds() {
        this.audioElements.forEach(audio => audio.pause());
    }

    stopAllSounds() {
        this.audioElements.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.audioElements = [];
        this.currentSounds = [];
    }
}
