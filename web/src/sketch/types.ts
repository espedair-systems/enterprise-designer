export type ShellSlotType = 'rail' | 'menu_bar' | 'sidebar_left' | 'sidebar_right' | 'canvas' | 'bottom_tray';

export type StencilCategory = 'shell' | 'widget' | 'data' | 'annotation';

export interface StencilDefinition {
  id: string;
  name: string;
  category: StencilCategory;
  defaultWidth: number;
  defaultHeight: number;
  icon: string;
  defaultProps: Record<string, any>;
  slotAffinity?: ShellSlotType;
}

export interface SketchElement {
  id: string;
  stencilId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  category: StencilCategory;
  slotTarget?: ShellSlotType;
  props: Record<string, any>;
  connections?: string[]; // IDs of connected elements
}

export interface SlotToolAssignment {
  slot: ShellSlotType;
  toolId: string;
  toolName: string;
  icon: string;
  panelType?: string;
  config?: Record<string, any>;
}

export interface SketchDocument {
  version: string;
  appName: string;
  appType: 'studio' | 'agent' | 'datamodeler';
  description: string;
  elements: SketchElement[];
  slotAssignments: SlotToolAssignment[];
  created_at: string;
  updated_at: string;
}

export interface GeneratedLayoutDSL {
  layout_version: string;
  app_name: string;
  app_type: string;
  theme: string;
  slots: {
    rail: {
      items: Array<{ id: string; icon: string; label: string; target_sidebar?: string; target_canvas?: string }>;
    };
    menu_bar: {
      menus: string[];
      actions: string[];
    };
    sidebar_left: {
      default_panel: string;
      panels: string[];
    };
    sidebar_right: {
      default_panel: string;
      panels: string[];
    };
    canvas: {
      mode: string;
      widgets: Array<{ id: string; type: string; x: number; y: number; width: number; height: number; title: string }>;
    };
    bottom_tray: {
      panels: string[];
    };
  };
}
