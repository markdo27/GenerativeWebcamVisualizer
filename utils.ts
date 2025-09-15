import { Layer, Preset } from './types';

const PRESETS_STORAGE_KEY = 'generative_visualizer_presets';

export const getDefaultLayer = (layerNumber: number): Layer => {
    return {
        id: `layer_${Date.now()}_${Math.random()}`,
        name: `Layer ${layerNumber}`,
        isVisible: true,
        // FIX: Changed default blendMode from 'add' to 'lighter' to match valid canvas values.
        blendMode: 'lighter',
        params: {
            particleCount: 5000,
            particleSpeed: 0.5,
            brightnessThreshold: 50,
            resolution: 10,
            feedbackAmount: 0.96,
            feedbackScale: 1.0,
            feedbackRotate: 0.0,
            feedbackTranslateX: 0,
            feedbackTranslateY: 0,
            kaleidoscopeSlices: 1,
            colorMode: 'source',
            hueShift: 0,
            audioIntensity: 0.4,
        }
    };
};

export const loadPresetsFromStorage = (): Preset[] => {
    try {
        const presetsJson = localStorage.getItem(PRESETS_STORAGE_KEY);
        if (presetsJson) {
            return JSON.parse(presetsJson);
        }
    } catch (error) {
        console.error("Failed to load presets from localStorage:", error);
    }
    return [];
};

export const savePresetsToStorage = (presets: Preset[]) => {
    try {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
        console.error("Failed to save presets to localStorage:", error);
    }
};
