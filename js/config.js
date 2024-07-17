export const CONFIG = {
    VERSION: '1.0.0',
    DEBUG: true,
    DETECTION_DURATION: 15000, // 30 seconds
    SOUNDS_PATH: './sounds/',
    FPS: 30,
    USE_FLASH: false,
    BPM_ANALYZER: {
        MIN_VARIATION_THRESHOLD: 0.3,
        PEAK_THRESHOLD: 0.15,
        LOW_PASS_ALPHA: 0.3
    }
};
