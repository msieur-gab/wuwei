import { CONFIG } from './config.js';

export class BPMAnalyzer {
    constructor() {
        this.heartRateData = [];
    }

    addDataPoint(value) {
        this.heartRateData.push({ time: Date.now(), value: value });
        if (this.heartRateData.length > 20 * CONFIG.FPS) {
            this.heartRateData.shift();
        }
    }

    calculateBPM() {
        const windowSize = Math.min(this.heartRateData.length, 10 * CONFIG.FPS);
        const recentData = this.heartRateData.slice(-windowSize);
        
        const filteredData = this.lowPassFilter(recentData.map(d => d.value));
        const peaks = this.findPeaks(filteredData);
        
        if (peaks.length < 2) return 60;

        const averageInterval = this.calculateAverageInterval(peaks);
        const bpm = 60 / (averageInterval / CONFIG.FPS);

        return Math.round(Math.max(40, Math.min(200, bpm)));
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
