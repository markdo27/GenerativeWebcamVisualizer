export interface VisualizerParams {
  particleCount: number;
  particleSpeed: number;
  brightnessThreshold: number;
  showVideo: boolean;
  resolution: number;
  feedbackAmount: number;
  feedbackScale: number;
  feedbackRotate: number;
  feedbackTranslateX: number;
  feedbackTranslateY: number;
  kaleidoscopeSlices: number;
  colorMode: 'source' | 'rainbow' | 'monochrome';
}
