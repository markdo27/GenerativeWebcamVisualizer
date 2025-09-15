
import React from 'react';

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  description?: string;
}

export const ControlSlider: React.FC<ControlSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  description
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-gray-300 font-medium">{label}</label>
        <span className="text-sm font-mono text-cyan-300">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-cyan-400"
      />
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
};
