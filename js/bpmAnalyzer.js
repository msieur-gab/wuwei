import { CONFIG } from './config.js';

export class BPMAnalyzer {
    constructor() {
        this.heartRateData = [];
        this.minValidBPM = 30;
        this.maxValidBPM = 220;
        this.minVariationThreshold = 5; // Adjust based on your tests
    }

    addDataPoint(value) {
        this.heartRateData.push({ time: Date.now(), value: value });
        if (this.heartRateData.length > 20 * CONFIG.FPS) {
            this.heartRateData.shift();
        }
    }

    calculateBPM() {
        if (!this.isSignalValid()) {
            return { bpm: -1, isValid: false, message: "Invalid signal. Please try again." };
        }

        const windowSize = Math.min(this.heartRateData.length, 10 * CONFIG.FPS);
        const recentData = this.heartRateData.slice(-windowSize);
        
        const filteredData = this.lowPassFilter(recentData.map(d => d.value));
        const peaks = this.findPeaks(filteredData);
        
        if (peaks.length < 2) {
            return { bpm: -1, isValid: false, message: "Not enough peaks detected. Please try again." };
        }

        const averageInterval = this.calculateAverageInterval(peaks);
        const bpm = 60 / (averageInterval / CONFIG.FPS);

        if (bpm < this.minValidBPM || bpm > this.maxValidBPM) {
            return { bpm: -1, isValid: false, message: "BPM out of valid range. Please try again." };
        }

        return { bpm: Math.round(bpm), isValid: true, message: "Valid measurement." };
    }

    isSignalValid() {
        if (this.heartRateData.length < 5 * CONFIG.FPS) return false; // Not enough data

        const values = this.heartRateData.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Check if there's sufficient variation
        return (max - min) > this.minVariationThreshold;
    }

    lowPassFilter(data, alpha = 0.1) {
        return data.reduce((filtered, value, index) => {
            if (index === 0) return [value];
            return [...filtered, alpha * value + (1 - alpha) * filtered[index - 1]];
        }, []);
    }

    findPeaks(data) {
        const peaks = [];
        for (let i = 1; i < data.length - 1; i++) {
            if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
                peaks.push(i);
            }
        }
        return peaks;
    }

    calculateAverageInterval(peaks) {
        const intervals = peaks.slice(1).map((peak, index) => peak - peaks[index]);
        return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }
}
