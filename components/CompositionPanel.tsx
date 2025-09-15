import React from 'react';
import { CompositionParams } from '../types';
import { ControlSlider } from './ControlSlider';

interface CompositionPanelProps {
    params: CompositionParams;
    setParams: React.Dispatch<React.SetStateAction<CompositionParams>>;
    onEnterCaptureMode: () => void;
}

export const CompositionPanel: React.FC<CompositionPanelProps> = ({ params, setParams, onEnterCaptureMode }) => {

    const handleParamChange = <K extends keyof CompositionParams>(
        param: K,
        value: CompositionParams[K]
    ) => {
        setParams(prev => ({ ...prev, [param]: value }));
    };

    const handleColorTintChange = (channel: 'r' | 'g' | 'b', value: number) => {
        setParams(prev => ({
            ...prev,
            colorTint: {
                ...prev.colorTint,
                [channel]: value,
            },
        }));
    };

    return (
        <div className="pt-6 space-y-6">
            <h2 className="text-lg font-semibold text-cyan-300">Composition</h2>

             <div className="pt-4 border-t border-gray-700 space-y-4">
                 <h3 className="text-md font-semibold text-gray-300">Master Color Tint</h3>
                 <ControlSlider
                    label="Red"
                    value={params.colorTint.r}
                    min={0}
                    max={255}
                    step={1}
                    onChange={value => handleColorTintChange('r', value)}
                 />
                 <ControlSlider
                    label="Green"
                    value={params.colorTint.g}
                    min={0}
                    max={255}
                    step={1}
                    onChange={value => handleColorTintChange('g', value)}
                 />
                 <ControlSlider
                    label="Blue"
                    value={params.colorTint.b}
                    min={0}
                    max={255}
                    step={1}
                    onChange={value => handleColorTintChange('b', value)}
                 />
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <label htmlFor="showVideo" className="text-gray-300">Show Source Video</label>
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
