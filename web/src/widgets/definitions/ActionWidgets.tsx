import React from 'react';
import { Play, Sparkles, Plus, MoreHorizontal } from 'lucide-react';
import { WidgetRenderProps } from '../types';

// 1. Action Button Widget
export const ActionButtonWidget: React.FC<WidgetRenderProps> = ({ title, props, onTriggerEvent }) => {
  const variant = props.variant || 'primary';

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs',
    secondary: 'bg-muted hover:bg-muted/80 text-foreground border border-border',
    danger: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs',
  }[variant as 'primary' | 'secondary' | 'danger' | 'emerald'] || 'bg-primary text-primary-foreground';

  return (
    <div className="flex items-center justify-center h-full p-2">
      <button
        type="button"
        onClick={() => onTriggerEvent && onTriggerEvent('onClick')}
        className={`w-full h-full min-h-[36px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all transform active:scale-95 ${variantStyles}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{title || props.label || 'Execute Action'}</span>
      </button>
    </div>
  );
};

// 2. Icon Button Widget
export const IconButtonWidget: React.FC<WidgetRenderProps> = ({ title, props, onTriggerEvent }) => {
  return (
    <div className="flex items-center justify-center h-full p-2">
      <button
        type="button"
        onClick={() => onTriggerEvent && onTriggerEvent('onClick')}
        className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 text-primary border border-border flex items-center justify-center transition-all shadow-xs"
        title={title || 'Quick Action'}
      >
        <Play className="w-4 h-4" />
      </button>
    </div>
  );
};

// 3. Dropdown Button Widget
export const DropdownButtonWidget: React.FC<WidgetRenderProps> = ({ title, props, onTriggerEvent }) => {
  return (
    <div className="flex items-center justify-center h-full p-2">
      <button
        type="button"
        onClick={() => onTriggerEvent && onTriggerEvent('onClick')}
        className="w-full h-full min-h-[36px] flex items-center justify-between px-3 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-semibold"
      >
        <span>{title || 'Select Workflow'}</span>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
};
