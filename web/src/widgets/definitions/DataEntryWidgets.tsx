import React, { useState } from 'react';
import { FormInput, CheckSquare, ToggleLeft, Calendar, Hash } from 'lucide-react';
import { WidgetRenderProps } from '../types';

// 1. Text Input Widget
export const TextInputWidget: React.FC<WidgetRenderProps> = ({ title, props, onTriggerEvent }) => {
  const [val, setVal] = useState<string>(props.defaultValue || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
    if (onTriggerEvent) {
      onTriggerEvent('onValueChange', e.target.value);
    }
  };

  return (
    <div className="flex flex-col justify-center h-full bg-card border border-border rounded-xl p-3 shadow-xs">
      <label className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
        <FormInput className="w-3.5 h-3.5 text-primary" />
        <span>{title || 'Text Input'}</span>
        {props.required && <span className="text-destructive">*</span>}
      </label>
      <input
        type="text"
        value={val}
        onChange={handleChange}
        placeholder={props.placeholder || 'Enter value...'}
        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
};

// 2. Select Dropdown Widget
export const SelectInputWidget: React.FC<WidgetRenderProps> = ({ title, props, onTriggerEvent }) => {
  const options = props.options || [
    { label: 'PostgreSQL Database (DES_BASE)', value: 'postgres' },
    { label: 'Snowflake Warehouse', value: 'snowflake' },
    { label: 'Google BigQuery', value: 'bigquery' },
  ];
  const [selected, setSelected] = useState<string>(props.defaultValue || options[0]?.value || '');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
    if (onTriggerEvent) {
      onTriggerEvent('onValueChange', e.target.value);
    }
  };

  return (
    <div className="flex flex-col justify-center h-full bg-card border border-border rounded-xl p-3 shadow-xs">
      <label className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
        <CheckSquare className="w-3.5 h-3.5 text-primary" />
        <span>{title || 'Select Dropdown'}</span>
      </label>
      <select
        value={selected}
        onChange={handleChange}
        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
      >
        {options.map((opt: any, idx: number) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// 3. Switch Toggle Widget
export const SwitchToggleWidget: React.FC<WidgetRenderProps> = ({ title, props, onTriggerEvent }) => {
  const [enabled, setEnabled] = useState<boolean>(props.defaultChecked ?? true);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (onTriggerEvent) {
      onTriggerEvent('onValueChange', next);
    }
  };

  return (
    <div className="flex items-center justify-between h-full bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex items-center gap-2">
        <ToggleLeft className="w-4 h-4 text-emerald-500" />
        <div>
          <h4 className="text-xs font-semibold text-foreground">{title || 'Enable Persistence'}</h4>
          <p className="text-[10px] text-muted-foreground">{props.description || 'Persist all operations to PostgreSQL schema (DES_BASE)'}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

// 4. Date Picker Widget
export const DatePickerWidget: React.FC<WidgetRenderProps> = ({ title, props }) => {
  return (
    <div className="flex flex-col justify-center h-full bg-card border border-border rounded-xl p-3 shadow-xs">
      <label className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-primary" />
        <span>{title || 'Target Release Date'}</span>
      </label>
      <input
        type="date"
        defaultValue={props.defaultValue || '2026-08-28'}
        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
};

// 5. Number Stepper Widget
export const NumberInputWidget: React.FC<WidgetRenderProps> = ({ title, props, onTriggerEvent }) => {
  const [val, setVal] = useState<number>(props.defaultValue || 10);

  return (
    <div className="flex flex-col justify-center h-full bg-card border border-border rounded-xl p-3 shadow-xs">
      <label className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
        <Hash className="w-3.5 h-3.5 text-primary" />
        <span>{title || 'Max Open Connections'}</span>
      </label>
      <input
        type="number"
        value={val}
        min={props.min || 1}
        max={props.max || 100}
        onChange={(e) => {
          const num = Number(e.target.value);
          setVal(num);
          if (onTriggerEvent) onTriggerEvent('onValueChange', num);
        }}
        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
};
