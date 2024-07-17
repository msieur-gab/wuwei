import { CONFIG } from './config.js';

export class SoundComposer {
    constructor(logFunction) {
        this.log = logFunction;
        this.sounds = {
            slow: [
                { file: 'slow1.mp3', volume: 0.7, delay: 0 },
                { file: 'slow2.mp3', volume: 0.5, delay: 2000 },
                { file: 'slow2.mp3', volume: 0.5, delay: 2000 }
            ],
            medium: [
                { file: 'medium1.mp3', volume: 0.9, delay: 0 },
                { file: 'medium2.mp3', volume: 0.8, delay: 0 },
                { file: 'medium3.mp3', volume: 0.1, delay: 20000 }
            ],
            fast: [
                { file: 'fast1.mp3', volume: 0.8, delay: 0 },
                { file: 'fast2.mp3', volume: 0.6, delay: 1000 },
                { file: 'fast3.mp3', volume: 0.5, delay: 2000 }
            ]
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
            const audio = new Audio(CONFIG.SOUNDS_PATH + sound.file);
            audio.loop = true;
            audio.volume = sound.volume;
            audio.onerror = () => this.log(`Error loading sound: ${sound.file}`);
            audio.onloadeddata = () => this.log(`Sound loaded: ${sound.file}`);
            return { audio, delay: sound.delay };
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
        this.audioElements.forEach(({ audio, delay }, index) => {
            setTimeout(() => {
                audio.play()
                    .then(() => this.log(`Playback started: ${audio.src.split('/').pop()} (Volume: ${audio.volume}, Delay: ${delay}ms)`))
                    .catch(err => this.log(`Playback error: ${audio.src.split('/').pop()} - ${err.message}`));
            }, delay);
        });
    }

    pauseSounds() {
        this.audioElements.forEach(({ audio }) => {
            audio.pause();
            this.log(`Sound paused: ${audio.src.split('/').pop()}`);
        });
    }

    stopAllSounds() {
        this.audioElements.forEach(({ audio }) => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.audioElements = [];
        this.currentSounds = [];
        this.log("All sounds stopped");
    }

    // Nouvelle méthode pour ajuster le volume d'un son spécifique
    adjustVolume(index, newVolume) {
        if (index >= 0 && index < this.audioElements.length) {
            this.audioElements[index].audio.volume = Math.max(0, Math.min(1, newVolume));
            this.log(`Volume adjusted for sound ${index}: ${newVolume}`);
        }
    }

    // Nouvelle méthode pour ajuster le délai d'un son spécifique
    adjustDelay(index, newDelay) {
        if (index >= 0 && index < this.audioElements.length) {
            this.audioElements[index].delay = Math.max(0, newDelay);
            this.log(`Delay adjusted for sound ${index}: ${newDelay}ms`);
        }
    }
}
