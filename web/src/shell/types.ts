export type CanvasMode = 'visual_canvas' | 'er_modeler' | 'lineage_dag' | 'sql_editor' | 'workflow_graph' | 'form_designer';

export interface RailItem {
  id: string;
  icon: string;
  label: string;
  targetSidebar?: string;
  targetCanvas?: CanvasMode;
  badge?: number | string;
}

export interface RailSlotConfig {
  items: RailItem[];
}

export interface MenuBarSlotConfig {
  menus: string[];
  actions: string[];
}

export interface SidebarSlotConfig {
  defaultPanel: string;
  panels: string[];
}

export interface CanvasWidgetInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  props?: Record<string, any>;
}

export interface CanvasSlotConfig {
  mode: CanvasMode;
  widgets: CanvasWidgetInstance[];
}

export interface BottomTraySlotConfig {
  panels: string[];
  activePanel?: string;
}

export interface LayoutSlotGroup {
  rail: RailSlotConfig;
  menu_bar: MenuBarSlotConfig;
  sidebar_left: SidebarSlotConfig;
  sidebar_right: SidebarSlotConfig;
  canvas: CanvasSlotConfig;
  bottom_tray: BottomTraySlotConfig;
}

export interface DesignerApp {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  app_type: 'studio' | 'agent' | 'datamodeler';
  description: string;
  status: 'draft' | 'scaffolded' | 'published';
  scaffold_path?: string;
  created_at: string;
  updated_at: string;
}

export interface DesignerLayout {
  id: string;
  app_id: string;
  layout_version: string;
  theme: string;
  slots: LayoutSlotGroup;
  created_at: string;
  updated_at: string;
}
