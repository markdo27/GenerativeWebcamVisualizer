import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Controls } from './components/Controls';
import { Visualizer } from './components/Visualizer';
import { useWebcam } from './hooks/useWebcam';
import { useAudio } from './hooks/useAudio';
import { Layer, CompositionParams, LayerParams, Preset } from './types';
import { getDefaultLayer, loadPresetsFromStorage, savePresetsToStorage } from './utils';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { error: webcamError, isReady: isWebcamReady } = useWebcam(videoRef);
  const { analyser, error: audioError, isReady: isAudioReady } = useAudio();

  const [layers, setLayers] = useState<Layer[]>([getDefaultLayer(1)]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(layers[0].id);
  const [compositionParams, setCompositionParams] = useState<CompositionParams>({
      showVideo: false,
      colorTint: { r: 255, g: 255, b: 255 },
  });
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isCaptureMode, setCaptureMode] = useState(false);
  
  useEffect(() => {
    setPresets(loadPresetsFromStorage());
  }, []);

  const isReady = isWebcamReady && isAudioReady;
  const anyError = webcamError || audioError;

  const selectedLayer = useMemo(() => {
    return layers.find(layer => layer.id === selectedLayerId);
  }, [layers, selectedLayerId]);

  const handleAddLayer = () => {
    const newLayer = getDefaultLayer(layers.length + 1);
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const handleRemoveLayer = (id: string) => {
    setLayers(prev => {
        const newLayers = prev.filter(layer => layer.id !== id);
        if (selectedLayerId === id) {
            setSelectedLayerId(newLayers.length > 0 ? newLayers[0].id : null);
        }
        return newLayers;
    });
  };

  const handleSelectLayer = (id: string) => {
    setSelectedLayerId(id);
  };

  const updateLayer = <K extends keyof Layer>(id: string, property: K, value: Layer[K]) => {
     setLayers(prev => prev.map(l => l.id === id ? { ...l, [property]: value } : l));
  };
  
  const updateLayerParams = <K extends keyof LayerParams>(id: string, param: K, value: LayerParams[K]) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, params: { ...l.params, [param]: value } } : l));
  };

  const handleSavePreset = (name: string) => {
    if (!name.trim()) {
        alert("Please enter a name for the preset.");
        return;
    }
    const newPreset: Preset = {
        name,
        data: {
            layers: JSON.parse(JSON.stringify(layers)), // Deep copy
            compositionParams: JSON.parse(JSON.stringify(compositionParams)),
        },
    };
    const newPresets = [...presets.filter(p => p.name !== name), newPreset];
    newPresets.sort((a,b) => a.name.localeCompare(b.name));
    setPresets(newPresets);
    savePresetsToStorage(newPresets);
  };

  const handleLoadPreset = (preset: Preset) => {
    setLayers(preset.data.layers);
    setCompositionParams(preset.data.compositionParams);
    setSelectedLayerId(preset.data.layers.length > 0 ? preset.data.layers[0].id : null);
  };

  const handleDeletePreset = (name: string) => {
    const newPresets = presets.filter(p => p.name !== name);
    setPresets(newPresets);
    savePresetsToStorage(newPresets);
  };


  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row bg-gray-900 font-sans">
      <main className="flex-grow w-full h-screen relative">
        {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="text-center p-4">
                {anyError ? (
                  <>
                    <p className="text-red-400 text-lg">Error Initializing Devices:</p>
                    {webcamError && <p className="text-red-300 font-mono text-sm max-w-md mt-2">Webcam: {webcamError}</p>}
                    {audioError && <p className="text-red-300 font-mono text-sm max-w-md mt-2">Microphone: {audioError}</p>}
                  </>
                ) : (
                  <div className="space-y-2">
                     <p className="text-xl animate-pulse">Initializing Devices...</p>
                     <p className="text-sm text-gray-400">Please allow webcam and microphone access.</p>
                     <p className="text-xs text-gray-500">{isWebcamReady ? '✅ Webcam Ready' : '...Waiting for Webcam'}</p>
                     <p className="text-xs text-gray-500">{isAudioReady ? '✅ Microphone Ready' : '...Waiting for Microphone'}</p>
                  </div>
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
          <Visualizer 
            videoElement={videoRef.current} 
            layers={layers} 
            compositionParams={compositionParams}
            analyser={analyser} 
          />
        )}
      </main>
      {!isCaptureMode && (
        <aside className="w-full md:w-96 bg-gray-900 bg-opacity-80 backdrop-blur-sm border-l border-gray-700 p-6 z-10 overflow-y-auto">
          <Controls 
            layers={layers}
            selectedLayer={selectedLayer}
            compositionParams={compositionParams}
            presets={presets}
            onAddLayer={handleAddLayer}
            onRemoveLayer={handleRemoveLayer}
            onSelectLayer={handleSelectLayer}
            onUpdateLayer={updateLayer}
            onUpdateLayerParams={updateLayerParams}
            onUpdateCompositionParams={setCompositionParams}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
            onEnterCaptureMode={() => setCaptureMode(true)} 
          />
        </aside>
      )}
    </div>
  );
};

export default App;
