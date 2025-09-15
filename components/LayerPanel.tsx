import React from 'react';
import { Layer, BlendMode } from '../types';

interface LayerPanelProps {
    layers: Layer[];
    selectedLayerId: string | null | undefined;
    onAddLayer: () => void;
    onRemoveLayer: (id: string) => void;
    onSelectLayer: (id: string) => void;
    onUpdateLayer: <K extends keyof Layer>(id: string, property: K, value: Layer[K]) => void;
}

const BlendModeSelector: React.FC<{
    value: BlendMode;
    onChange: (value: BlendMode) => void;
}> = ({ value, onChange }) => {
    // FIX: Updated modes to valid globalCompositeOperation values and added labels for UI.
    const modes: BlendMode[] = ['source-over', 'lighter', 'screen', 'multiply'];
    const modeLabels: Record<BlendMode, string> = {
        'source-over': 'Normal',
        'lighter': 'Add',
        'screen': 'Screen',
        'multiply': 'Multiply',
    };
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as BlendMode)}
            onClick={(e) => e.stopPropagation()} // Prevent layer selection when clicking dropdown
            className="bg-gray-700 text-white text-xs rounded p-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
            {modes.map(mode => (
                <option key={mode} value={mode}>{modeLabels[mode]}</option>
            ))}
        </select>
    );
};

export const LayerPanel: React.FC<LayerPanelProps> = ({ layers, selectedLayerId, onAddLayer, onRemoveLayer, onSelectLayer, onUpdateLayer }) => {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-cyan-300">Layers</h2>
                <button
                    onClick={onAddLayer}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-3 text-sm rounded-md transition-colors"
                >
                    + Add Layer
                </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {layers.map(layer => {
                    const isSelected = layer.id === selectedLayerId;
                    return (
                        <div
                            key={layer.id}
                            onClick={() => onSelectLayer(layer.id)}
                            className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                                isSelected ? 'bg-cyan-500/30 ring-1 ring-cyan-400' : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateLayer(layer.id, 'isVisible', !layer.isVisible);
                                }}
                                className="focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
                                aria-label={layer.isVisible ? "Hide Layer" : "Show Layer"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${layer.isVisible ? 'text-cyan-400' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <span className="flex-grow text-gray-200">{layer.name}</span>
                            <BlendModeSelector
                                value={layer.blendMode}
                                onChange={(value) => onUpdateLayer(layer.id, 'blendMode', value)}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveLayer(layer.id);
                                }}
                                className="text-gray-500 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                                aria-label="Remove Layer"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
