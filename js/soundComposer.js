import { CONFIG } from './config.js';

export class SoundComposer {
    constructor(logFunction) {
        this.log = logFunction; // Utilisez la fonction log passée en paramètre
        this.sounds = {
            slow: ['slow1.mp3', 'slow2.mp3', 'slow3.mp3'],
            medium: ['medium1.mp3', 'medium2.mp3', 'medium3.mp3'],
            fast: ['fast1.mp3', 'fast2.mp3', 'fast3.mp3']
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
        this.log(`Sound category selected: ${category}`);
        this.loadSounds();
    }

    loadSounds() {
        this.audioElements = this.currentSounds.map(sound => {
            const audio = new Audio(CONFIG.SOUNDS_PATH + sound);
            audio.loop = true;
            audio.onerror = () => this.log(`Error loading sound: ${sound}`);
            audio.onloadeddata = () => this.log(`Sound loaded: ${sound}`);
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
        this.audioElements.forEach(audio => {
            audio.play()
                .then(() => this.log(`Playback started: ${audio.src.split('/').pop()}`))
                .catch(err => this.log(`Playback error: ${audio.src.split('/').pop()} - ${err.message}`));
        });
    }

    pauseSounds() {
        this.audioElements.forEach(audio => {
            audio.pause();
            this.log(`Sound paused: ${audio.src.split('/').pop()}`);
        });
    }

    stopAllSounds() {
        this.audioElements.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.audioElements = [];
        this.currentSounds = [];
        this.log("All sounds stopped");
    }
}
