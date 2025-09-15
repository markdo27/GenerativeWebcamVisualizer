import { useState, useEffect } from 'react';

export const useAudio = () => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let stream: MediaStream | null = null;

    const setupAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const source = audioContext.createMediaStreamSource(stream);
        const analyserNode = audioContext.createAnalyser();
        
        analyserNode.fftSize = 256; // Controls the detail of frequency analysis
        
        source.connect(analyserNode);
        
        setAnalyser(analyserNode);
        setIsReady(true);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred while accessing the microphone.");
        }
        setIsReady(false);
      }
    };

    setupAudio();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      audioContext?.close();
    };
  }, []);

  return { analyser, error, isReady };
};
