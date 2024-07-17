import { CONFIG } from './config.js';
import { BPMAnalyzer } from './bpmAnalyzer.js';
import { SoundComposer } from './soundComposer.js';

let bpmAnalyzer, soundComposer, stream, track;
let detectionStartTime, detectionInterval;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const startButton = document.getElementById('startButton');
const playPauseButton = document.getElementById('playPauseButton');
const progressBar = document.getElementById('progressBar');
const bpmDisplay = document.getElementById('bpmDisplay');
const userFeedback = document.getElementById('userFeedback');
const logDisplay = document.getElementById('logDisplay');

// Set canvas size
canvas.width = 320;
canvas.height = 240;

function log(message) {
    if (CONFIG.DEBUG) {
        const logEntry = document.createElement('p');
        logEntry.textContent = message;
        logDisplay.appendChild(logEntry);
        logDisplay.scrollTop = logDisplay.scrollHeight;
        console.log(message);
    }
}

async function startDetection() {
    soundComposer.stopAllSounds();
    
    playPauseButton.disabled = true;
    playPauseButton.textContent = "Play";
    bpmDisplay.textContent = "BPM: --";
    userFeedback.textContent = "";

    try {
        log("Starting detection...");
        log(`USE_FLASH setting: ${CONFIG.USE_FLASH}`);

        stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'environment',
                advanced: CONFIG.USE_FLASH ? [{ torch: true }] : []
            },
            audio: false
        });
        
        video.srcObject = stream;
        video.play();

        track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        const settings = track.getSettings();

        if (CONFIG.USE_FLASH) {
            if (capabilities.torch) {
                if (settings.torch) {
                    log("Flash successfully activated");
                } else {
                    log("Flash activation failed. It might not be supported on this device.");
                }
            } else {
                log("Flash is not available on this device.");
            }
        } else {
            log("Flash usage is disabled in config.");
        }

        startButton.disabled = true;
        bpmAnalyzer = new BPMAnalyzer();
        detectionStartTime = Date.now();
        detectionInterval = setInterval(processFrame, 1000 / CONFIG.FPS);
        updateProgress();

        log("Detection started");
    } catch (err) {
        log("Camera access error: " + err.message);
    }
}

function processFrame() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const redAverage = getRedAverage(imageData.data);
    bpmAnalyzer.addDataPoint(redAverage);

    if (bpmAnalyzer.heartRateData.length > 5 * CONFIG.FPS) {
        const result = bpmAnalyzer.calculateBPM();
        updateBPMDisplay(result);
    }

    if (Date.now() - detectionStartTime >= CONFIG.DETECTION_DURATION) {
        stopDetection();
    }
}

function updateBPMDisplay(result) {
    if (result.bpm !== null) {
        bpmDisplay.textContent = `BPM: ${result.bpm}`;
    }
    userFeedback.textContent = result.message;
}

function stopDetection() {
    clearInterval(detectionInterval);
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    const result = bpmAnalyzer.calculateBPM();
    updateBPMDisplay(result);

    if (result.isValid) {
        soundComposer.updateSounds(result.bpm);  
    }
    
    startButton.disabled = false;
    playPauseButton.disabled = false;
    progressBar.value = 100;
    
    log("Detection completed");
}

function updateProgress() {
    const updateProgressInterval = setInterval(() => {
        const elapsed = Date.now() - detectionStartTime;
        const progress = (elapsed / CONFIG.DETECTION_DURATION) * 100;
        progressBar.value = Math.min(progress, 100);

        if (elapsed >= CONFIG.DETECTION_DURATION) {
            clearInterval(updateProgressInterval);
        }
    }, 100);
}

function getRedAverage(data) {
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
        total += data[i];
    }
    return total / (data.length / 4);
}

function togglePlayPause() {
    const isPlaying = soundComposer.togglePlayPause();
    playPauseButton.textContent = isPlaying ? "Pause" : "Play";
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    soundComposer = new SoundComposer(log);
    startButton.addEventListener('click', startDetection);
    playPauseButton.addEventListener('click', togglePlayPause);
});
