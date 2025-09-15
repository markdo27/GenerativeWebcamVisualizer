// FIX: Changed BlendMode to use values compatible with canvas globalCompositeOperation.
// 'normal' is now 'source-over', and 'add' is now 'lighter'.
export type BlendMode = 'source-over' | 'lighter' | 'screen' | 'multiply';

export type ColorMode = 'source' | 'rainbow' | 'monochrome' | 'audio-hue' | 'audio-pulse';

export interface LayerParams {
  particleCount: number;
  particleSpeed: number;
  brightnessThreshold: number;
  resolution: number;
  feedbackAmount: number;
  feedbackScale: number;
  feedbackRotate: number;
  feedbackTranslateX: number;
  feedbackTranslateY: number;
  kaleidoscopeSlices: number;
  colorMode: ColorMode;
  hueShift: number;
  audioIntensity: number;
}

export interface Layer {
    id: string;
    name: string;
    isVisible: boolean;
    blendMode: BlendMode;
    params: LayerParams;
}

export interface CompositionParams {
    showVideo: boolean;
    colorTint: {
        r: number;
        g: number;
        b: number;
    };
}

export interface Preset {
    name: string;
    data: {
        layers: Layer[];
        compositionParams: CompositionParams;
    };
}
