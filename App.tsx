import React, { useState, useRef, useEffect } from 'react';
import { Controls } from './components/Controls';
import { Visualizer } from './components/Visualizer';
import { useWebcam } from './hooks/useWebcam';
import { VisualizerParams } from './types';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, error, isReady } = useWebcam(videoRef);
  const [isCaptureMode, setCaptureMode] = useState(false);
  const [params, setParams] = useState<VisualizerParams>({
    particleCount: 7000,
    particleSpeed: 0.5,
    brightnessThreshold: 40,
    showVideo: false,
    resolution: 8,
    feedbackAmount: 0.95,
    feedbackScale: 1.0,
    feedbackRotate: 0.0,
    feedbackTranslateX: 0,
    feedbackTranslateY: 0,
  });

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row bg-gray-900 font-sans">
      <main className="flex-grow w-full h-screen relative">
        {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="text-center">
                {error ? (
                  <>
                    <p className="text-red-400 text-lg">Error accessing webcam:</p>
                    <p className="text-red-300 font-mono text-sm max-w-md">{error}</p>
                  </>
                ) : (
                  <p className="text-xl animate-pulse">Initializing Webcam...</p>
                )}
              </div>
            </div>
        )}
        {isCaptureMode && (
          <button
            onClick={() => setCaptureMode(false)}
            className="absolute top-4 right-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg z-30 transition-colors animate-pulse"
            aria-label="Exit Capture Mode"
          >
            Exit Capture Mode
          </button>
        )}
        <video ref={videoRef} className="absolute hidden" playsInline autoPlay muted />
        {isReady && videoRef.current && (
          <Visualizer videoElement={videoRef.current} params={params} />
        )}
      </main>
      {!isCaptureMode && (
        <aside className="w-full md:w-80 bg-gray-900 bg-opacity-80 backdrop-blur-sm border-l border-gray-700 p-6 z-10 overflow-y-auto">
          <Controls params={params} setParams={setParams} onEnterCaptureMode={() => setCaptureMode(true)} />
        </aside>
      )}
    </div>
  );
};

export default App;