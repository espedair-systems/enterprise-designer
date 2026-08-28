import React from 'react';

export type WidgetCategory = 'layouts' | 'display' | 'input' | 'visual' | 'container' | 'action';

export interface WidgetPropField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'code' | 'color';
  defaultValue: any;
  options?: Array<{ label: string; value: string }>;
  description?: string;
}

export interface WidgetDefinition {
  type: string;
  label: string;
  category: WidgetCategory;
  icon: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultProps: Record<string, any>;
  schema: WidgetPropField[];
  render: React.FC<WidgetRenderProps>;
}

export interface WidgetRenderProps {
  id: string;
  title: string;
  props: Record<string, any>;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdateProps?: (newProps: Record<string, any>) => void;
  onTriggerEvent?: (eventName: string, payload?: any) => void;
}

export interface WidgetInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  props: Record<string, any>;
  styles?: {
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    textColor?: string;
  };
  events?: {
    onClick?: string;
    onRowSelect?: string;
    onValueChange?: string;
  };
}
