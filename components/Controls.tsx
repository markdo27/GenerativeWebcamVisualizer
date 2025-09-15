import React from 'react';
import { Layer, LayerParams, CompositionParams, Preset } from '../types';
import { LayerPanel } from './LayerPanel';
import { ParameterPanel } from './ParameterPanel';
import { CompositionPanel } from './CompositionPanel';
import { PresetPanel } from './PresetPanel';

interface ControlsProps {
  layers: Layer[];
  selectedLayer: Layer | undefined;
  compositionParams: CompositionParams;
  presets: Preset[];
  onAddLayer: () => void;
  onRemoveLayer: (id: string) => void;
  onSelectLayer: (id: string) => void;
  onUpdateLayer: <K extends keyof Layer>(id: string, property: K, value: Layer[K]) => void;
  onUpdateLayerParams: <K extends keyof LayerParams>(id: string, param: K, value: LayerParams[K]) => void;
  onUpdateCompositionParams: React.Dispatch<React.SetStateAction<CompositionParams>>;
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (name: string) => void;
  onEnterCaptureMode: () => void;
}

export const Controls: React.FC<ControlsProps> = (props) => {
  const {
      layers,
      selectedLayer,
      compositionParams,
      presets,
      onAddLayer,
      onRemoveLayer,
      onSelectLayer,
      onUpdateLayer,
      onUpdateLayerParams,
      onUpdateCompositionParams,
      onSavePreset,
      onLoadPreset,
      onDeletePreset,
      onEnterCaptureMode
  } = props;
  
  return (
    <div className="flex flex-col space-y-6 h-full">
       <div className="pb-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-cyan-300">Generative Visualizer</h1>
        <p className="text-sm text-gray-400 mt-1">Compose visuals by stacking layers.</p>
      </div>
      
      <LayerPanel 
        layers={layers}
        selectedLayerId={selectedLayer?.id}
        onAddLayer={onAddLayer}
        onRemoveLayer={onRemoveLayer}
        onSelectLayer={onSelectLayer}
        onUpdateLayer={onUpdateLayer}
      />
      
      {selectedLayer ? (
        <ParameterPanel 
            key={selectedLayer.id} // Re-mounts the component on layer change to reflect state
            layer={selectedLayer}
            onUpdateParams={onUpdateLayerParams}
        />
      ) : (
        <div className="flex-grow flex items-center justify-center text-gray-500">
            <p>No layer selected. Add a layer to begin.</p>
        </div>
      )}
      
      <PresetPanel 
        presets={presets}
        onSave={onSavePreset}
        onLoad={onLoadPreset}
        onDelete={onDeletePreset}
      />

      <CompositionPanel 
        params={compositionParams}
        setParams={onUpdateCompositionParams}
        onEnterCaptureMode={onEnterCaptureMode}
      />
    </div>
  );
};
