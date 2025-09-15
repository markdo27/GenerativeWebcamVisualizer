import React from 'react';
import { Layer, LayerParams, ColorMode } from '../types';
import { ControlSlider } from './ControlSlider';

interface ParameterPanelProps {
  layer: Layer;
  onUpdateParams: <K extends keyof LayerParams>(id: string, param: K, value: LayerParams[K]) => void;
}

const ColorModeButton: React.FC<{
    label: string;
    mode: ColorMode;
    currentMode: ColorMode;
    onClick: (mode: ColorMode) => void;
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

export const ParameterPanel: React.FC<ParameterPanelProps> = ({ layer, onUpdateParams }) => {
  const { id, name, params } = layer;

  const handleParamChange = <K extends keyof LayerParams,>(
    param: K,
    value: LayerParams[K]
  ) => {
    onUpdateParams(id, param, value);
  };

  return (
    <div className="flex-grow space-y-6 overflow-y-auto border-t border-b border-gray-700 py-6 pr-2 -mr-2">
      <h2 className="text-lg font-semibold text-cyan-300">Parameters: <span className="text-white font-bold">{name}</span></h2>
      
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
        <h3 className="text-md font-semibold text-cyan-300 mb-4">Color</h3>
        <div className="grid grid-cols-3 gap-2">
            <ColorModeButton label="Source" mode="source" currentMode={params.colorMode} onClick={(mode) => handleParamChange('colorMode', mode)} />
            <ColorModeButton label="Rainbow" mode="rainbow" currentMode={params.colorMode} onClick={(mode) => handleParamChange('colorMode', mode)} />
            <ColorModeButton label="Monochrome" mode="monochrome" currentMode={params.colorMode} onClick={(mode) => handleParamChange('colorMode', mode)} />
            <ColorModeButton label="Audio Hue" mode="audio-hue" currentMode={params.colorMode} onClick={(mode) => handleParamChange('colorMode', mode)} />
            <ColorModeButton label="Audio Pulse" mode="audio-pulse" currentMode={params.colorMode} onClick={(mode) => handleParamChange('colorMode', mode)} />
        </div>
      </div>


      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-md font-semibold text-cyan-300 mb-4">Feedback Effect</h3>
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
          <h3 className="text-md font-semibold text-cyan-300 mb-4">Post-Processing</h3>
          <ControlSlider
              label="Kaleidoscope Slices"
              value={params.kaleidoscopeSlices}
              min={1}
              max={16}
              step={1}
              onChange={value => handleParamChange('kaleidoscopeSlices', value)}
              description="Mirrors and repeats the output."
          />
          <div className="mt-4" />
          <ControlSlider
              label="Audio Intensity"
              value={params.audioIntensity}
              min={0}
              max={2}
              step={0.05}
              onChange={value => handleParamChange('audioIntensity', value)}
              description="Strength of audio-reactive effects."
          />
          <div className="mt-4" />
          <ControlSlider
            label="Hue Shift"
            value={params.hueShift}
            min={0}
            max={360}
            step={1}
            onChange={value => handleParamChange('hueShift', value)}
            description="Rotates the color of the final image."
        />
      </div>

    </div>
  );
};
