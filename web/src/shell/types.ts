export type CanvasMode =
  | 'executive_dashboard'
  | 'dashboard_projects'
  | 'recent_activity'
  | 'global_search'
  | 'page_registry'
  | 'entity_registry'
  // Behavioral Diagrams (7)
  | 'use_case'
  | 'activity_diagram'
  | 'state_machine'
  | 'sequence_diagram'
  | 'communication_diagram'
  | 'interaction_overview_diagram'
  | 'timing_diagram'
  // Structural Diagrams (7)
  | 'class_diagram'
  | 'object_diagram'
  | 'component_diagram'
  | 'deployment_diagram'
  | 'package_diagram'
  | 'composite_structure_diagram'
  | 'profile_diagram'
  // Visual Studio & Modeler
  | 'visual_canvas'
  | 'ui_sketch'
  | 'er_modeler'
  | 'lineage_dag'
  | 'sql_editor'
  | 'workflow_graph'
  | 'project_scaffold'
  | 'form_designer'
  // Q Designer Subsystem (DES_BASE.quest_*)
  | 'q_registry'
  | 'q_designer'
  | 'q_bank'
  | 'q_reference'
  | 'q_responses'
  | 'q_guidance'
  // Schema & OpenAPI Designer Subsystem (DES_BASE.schema_*)
  | 'schema_registry'
  | 'schema_designer'
  | 'schema_graph'
  | 'openapi_manager'
  | 'api_console'
  | 'dialect_catalog';

export type DesignerDomainMode =
  | 'dashboard'
  | 'projects'
  | 'ui_designer'
  | 'data_designer'
  | 'agent_designer'
  | 'q_designer'
  | 'schema_designer';

export interface RailItem {
  id: string;
  icon: string;
  label: string;
  description?: string;
  category?: string;
  section?: string;
  targetSidebar?: string;
  targetCanvas?: CanvasMode;
  badge?: number | string;
  alignRight?: boolean;
  isContextual?: boolean;
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
