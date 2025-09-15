import React, { useState } from 'react';
import { Preset } from '../types';

interface PresetPanelProps {
    presets: Preset[];
    onSave: (name: string) => void;
    onLoad: (preset: Preset) => void;
    onDelete: (name: string) => void;
}

export const PresetPanel: React.FC<PresetPanelProps> = ({ presets, onSave, onLoad, onDelete }) => {
    const [presetName, setPresetName] = useState('');

    const handleSaveClick = () => {
        onSave(presetName);
        setPresetName('');
    };

    return (
        <div className="pt-6 space-y-4 border-t border-gray-700">
            <h2 className="text-lg font-semibold text-cyan-300">Presets</h2>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="New preset name..."
                    className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                    onClick={handleSaveClick}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 text-sm rounded-md transition-colors"
                >
                    Save
                </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {presets.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">No presets saved yet.</p>
                )}
                {presets.map(preset => (
                    <div
                        key={preset.name}
                        className="flex items-center justify-between p-2 rounded-md bg-gray-800"
                    >
                        <span className="text-gray-300 truncate">{preset.name}</span>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                                onClick={() => onLoad(preset)}
                                className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-2 py-1"
                                aria-label={`Load preset ${preset.name}`}
                            >
                                Load
                            </button>
                            <button
                                onClick={() => onDelete(preset.name)}
                                className="text-gray-500 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                                aria-label={`Delete preset ${preset.name}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
