import React from 'react';
import { VisualizerParams } from '../types';
import { ControlSlider } from './ControlSlider';

interface ControlsProps {
  params: VisualizerParams;
  setParams: React.Dispatch<React.SetStateAction<VisualizerParams>>;
  onEnterCaptureMode: () => void;
}

const ColorModeButton: React.FC<{
    label: string;
    mode: VisualizerParams['colorMode'];
    currentMode: VisualizerParams['colorMode'];
    onClick: (mode: VisualizerParams['colorMode']) => void;
}> = ({ label, mode, currentMode, onClick }) => {
    const isActive = mode === currentMode;
    return (
        <button
            onClick={() => onClick(mode)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 ${
                isActive
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
        >
            {label}
        </button>
    );
};


export const Controls: React.FC<ControlsProps> = ({ params, setParams, onEnterCaptureMode }) => {
  const handleParamChange = <K extends keyof VisualizerParams,>(
    param: K,
    value: VisualizerParams[K]
  ) => {
    setParams(prev => ({ ...prev, [param]: value }));
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="pb-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-cyan-300">Generative Visualizer</h1>
        <p className="text-sm text-gray-400 mt-1">Adjust parameters to shape the visuals.</p>
      </div>
      
      <ControlSlider
        label="Particle Count"
        value={params.particleCount}
        min={100}
        max={15000}
        step={100}
        onChange={value => handleParamChange('particleCount', value)}
      />

      <ControlSlider
        label="Particle Speed"
        value={params.particleSpeed}
        min={0.1}
        max={5}
        step={0.1}
        onChange={value => handleParamChange('particleSpeed', value)}
      />

      <ControlSlider
        label="Brightness Threshold"
        value={params.brightnessThreshold}
        min={0}
        max={255}
        step={1}
        onChange={value => handleParamChange('brightnessThreshold', value)}
      />

       <ControlSlider
        label="Pixel Resolution"
        value={params.resolution}
        min={2}
        max={20}
        step={1}
        onChange={value => handleParamChange('resolution', value)}
        description="Higher value = better performance."
      />
      
      <div className="pt-4 border-t border-gray-700">
        <h2 className="text-lg font-semibold text-cyan-300 mb-4">Color</h2>
        <div className="flex items-center space-x-2">
            <ColorModeButton label="Source" mode="source" currentMode={params.colorMode} onClick={(mode) => handleParamChange('colorMode', mode)} />
            <ColorModeButton label="Rainbow" mode="rainbow" currentMode={params.colorMode} onClick={(mode) => handleParamChange('colorMode', mode)} />
            <ColorModeButton label="Monochrome" mode="monochrome" currentMode={params.colorMode} onClick={(mode) => handleParamChange('colorMode', mode)} />
        </div>
      </div>


      <div className="pt-4 border-t border-gray-700">
        <h2 className="text-lg font-semibold text-cyan-300 mb-4">Feedback Effect</h2>
         <ControlSlider
            label="Feedback Amount"
            value={params.feedbackAmount}
            min={0}
            max={1}
            step={0.01}
            onChange={value => handleParamChange('feedbackAmount', value)}
            description="Opacity of the previous frame."
        />
        <div className="mt-4"/>
        <ControlSlider
            label="Feedback Scale"
            value={params.feedbackScale}
            min={0.9}
            max={1.1}
            step={0.001}
            onChange={value => handleParamChange('feedbackScale', value)}
            description="Zoom effect. 1 = no zoom."
        />
        <div className="mt-4"/>
        <ControlSlider
            label="Feedback Rotate"
            value={params.feedbackRotate}
            min={-0.05}
            max={0.05}
            step={0.001}
            onChange={value => handleParamChange('feedbackRotate', value)}
            description="Rotation effect."
        />
        <div className="mt-4"/>
        <ControlSlider
            label="Feedback Shift X"
            value={params.feedbackTranslateX}
            min={-20}
            max={20}
            step={1}
            onChange={value => handleParamChange('feedbackTranslateX', value)}
        />
        <div className="mt-4"/>
        <ControlSlider
            label="Feedback Shift Y"
            value={params.feedbackTranslateY}
            min={-20}
            max={20}
            step={1}
            onChange={value => handleParamChange('feedbackTranslateY', value)}
        />
      </div>

      <div className="pt-4 border-t border-gray-700">
          <h2 className="text-lg font-semibold text-cyan-300 mb-4">Post-Processing</h2>
          <ControlSlider
              label="Kaleidoscope Slices"
              value={params.kaleidoscopeSlices}
              min={1}
              max={16}
              step={1}
              onChange={value => handleParamChange('kaleidoscopeSlices', value)}
              description="Mirrors and repeats the output."
          />
      </div>


      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <label htmlFor="showVideo" className="text-gray-300">Show Webcam Feed</label>
        <button
          onClick={() => handleParamChange('showVideo', !params.showVideo)}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 ${
            params.showVideo ? 'bg-cyan-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
              params.showVideo ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="pt-4 border-t border-gray-700">
        <h2 className="text-lg font-semibold text-cyan-300 mb-3">Virtual Webcam Output</h2>
        <button 
            onClick={onEnterCaptureMode}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
            Enter Capture Mode
        </button>
        <div className="text-xs text-gray-400 mt-3 p-3 bg-gray-800 rounded-md border border-gray-700">
            <p className="font-bold mb-1 text-gray-300">How to use as a virtual webcam:</p>
            <ol className="list-decimal list-inside space-y-1">
                <li>Install & open OBS Studio (free).</li>
                <li>In OBS, add a "Window Capture" source & select this page.</li>
                <li>In OBS, click "Start Virtual Camera".</li>
                <li>Select "OBS Virtual Camera" in other apps (Zoom, etc).</li>
            </ol>
        </div>
      </div>

    </div>
  );
};
