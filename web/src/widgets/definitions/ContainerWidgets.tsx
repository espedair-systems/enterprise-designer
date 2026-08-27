import React, { useState } from 'react';
import { Layers, CreditCard, ExternalLink } from 'lucide-react';
import { WidgetRenderProps } from '../types';

// 1. Tabs Container Widget
export const TabsContainerWidget: React.FC<WidgetRenderProps> = ({ title, props }) => {
  const tabs = props.tabs || ['Overview', 'Lineage DAG', 'PostgreSQL Logs'];
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-xs">
      <div className="flex items-center border-b border-border bg-muted/40 px-2">
        {tabs.map((tab: string, idx: number) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === idx
                ? 'border-primary text-primary bg-card/60'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 p-4 text-xs text-foreground">
        <p className="font-semibold text-foreground mb-1">{tabs[activeTab]} Content Region</p>
        <p className="text-[11px] text-muted-foreground">
          This container supports dynamic slot placement for nested components and views.
        </p>
      </div>
    </div>
  );
};

// 2. Card Container Widget
export const CardContainerWidget: React.FC<WidgetRenderProps> = ({ title, props }) => {
  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">{title || 'Card Container'}</h4>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-lg p-3 text-muted-foreground text-xs">
        <span>Nested Component Slot Region</span>
      </div>
    </div>
  );
};

// 3. Modal Trigger Widget
export const ModalContainerWidget: React.FC<WidgetRenderProps> = ({ title, props, onTriggerEvent }) => {
  return (
    <div className="flex items-center justify-between h-full bg-card border border-border rounded-xl p-4 shadow-xs">
      <div>
        <h4 className="text-xs font-bold text-foreground">{title || 'Entity Inspector Modal'}</h4>
        <p className="text-[10px] text-muted-foreground">Centered modal with backdrop blur</p>
      </div>
      <button
        type="button"
        onClick={() => onTriggerEvent && onTriggerEvent('onClick')}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold shadow-xs"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>Open Modal</span>
      </button>
    </div>
  );
};
