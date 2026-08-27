import { SketchDocument } from '../types';

export const PRESET_ANALYTICS_STUDIO: SketchDocument = {
  version: '1.0.0',
  appName: 'Fleet Analytics Studio',
  appType: 'studio',
  description: 'Enterprise fleet metrics, real-time driver tracking, and maintenance schedules',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  slotAssignments: [
    { slot: 'rail', toolId: 'explorer', toolName: 'Fleet Explorer', icon: 'Folder' },
    { slot: 'rail', toolId: 'designer', toolName: 'Dashboard Canvas', icon: 'Layout' },
    { slot: 'rail', toolId: 'schematics', toolName: 'Data Architect', icon: 'Database' },
    { slot: 'rail', toolId: 'settings', toolName: 'App Settings', icon: 'Settings' },
    { slot: 'menu_bar', toolId: 'env_switch', toolName: 'Environment Switcher', icon: 'Globe' },
    { slot: 'menu_bar', toolId: 'export_bin', toolName: 'Export Go Binary', icon: 'Download' },
    { slot: 'sidebar_left', toolId: 'nav_tree', toolName: 'Vehicle Fleet Hierarchy', icon: 'Truck' },
    { slot: 'sidebar_right', toolId: 'prop_inspect', toolName: 'Metric & Column Inspector', icon: 'Sliders' },
    { slot: 'bottom_tray', toolId: 'sql_terminal', toolName: 'PostgreSQL Live Terminal', icon: 'Terminal' }
  ],
  elements: [
    // Shell Layout Frame
    {
      id: 'rail-1',
      stencilId: 'frame-activity-rail',
      name: 'Activity Rail',
      x: 20,
      y: 70,
      width: 60,
      height: 540,
      label: 'Activity Rail',
      category: 'shell',
      slotTarget: 'rail',
      props: {}
    },
    {
      id: 'menu-1',
      stencilId: 'frame-menu-bar',
      name: 'Header Menu Bar',
      x: 20,
      y: 20,
      width: 960,
      height: 44,
      label: 'Top Header Bar (Fleet Studio | DEV | Schematics Sync)',
      category: 'shell',
      slotTarget: 'menu_bar',
      props: {}
    },
    {
      id: 'sidebar-left-1',
      stencilId: 'frame-sidebar-left',
      name: 'Primary Sidebar',
      x: 84,
      y: 70,
      width: 200,
      height: 410,
      label: 'Fleet Navigator',
      category: 'shell',
      slotTarget: 'sidebar_left',
      props: {}
    },
    {
      id: 'metric-1',
      stencilId: 'widget-metric-card',
      name: 'Active Trucks',
      x: 290,
      y: 70,
      width: 220,
      height: 90,
      label: '🚚 Active Vehicles: 142',
      category: 'widget',
      slotTarget: 'canvas',
      props: { value: '142 / 150', change: '+94.6% utilization' }
    },
    {
      id: 'metric-2',
      stencilId: 'widget-metric-card',
      name: 'Fuel Efficiency',
      x: 520,
      y: 70,
      width: 220,
      height: 90,
      label: '⛽ Avg MPG: 8.4',
      category: 'widget',
      slotTarget: 'canvas',
      props: { value: '8.4 MPG', change: '+3.1% YoY' }
    },
    {
      id: 'table-1',
      stencilId: 'widget-data-table',
      name: 'Vehicles Table',
      x: 290,
      y: 170,
      width: 450,
      height: 310,
      label: 'Fleet Dispatches (PostgreSQL fct_dispatches)',
      category: 'widget',
      slotTarget: 'canvas',
      props: { columns: ['vin', 'driver_name', 'status', 'eta', 'destination'] }
    },
    {
      id: 'sidebar-right-1',
      stencilId: 'frame-sidebar-right',
      name: 'Property Inspector',
      x: 750,
      y: 70,
      width: 230,
      height: 410,
      label: 'Property Inspector',
      category: 'shell',
      slotTarget: 'sidebar_right',
      props: {}
    },
    {
      id: 'bottom-1',
      stencilId: 'frame-bottom-tray',
      name: 'Bottom Console Tray',
      x: 84,
      y: 486,
      width: 896,
      height: 124,
      label: 'Bottom Console (SQL Queries | Logs | Audit Trail)',
      category: 'shell',
      slotTarget: 'bottom_tray',
      props: {}
    }
  ]
};

export const PRESET_AGENT_STUDIO: SketchDocument = {
  version: '1.0.0',
  appName: 'Customer Concierge Agent',
  appType: 'agent',
  description: 'Autonomous multi-modal customer support agent with tool calling and human-in-the-loop review',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  slotAssignments: [
    { slot: 'rail', toolId: 'agent_graph', toolName: 'Workflow Graph', icon: 'GitBranch' },
    { slot: 'rail', toolId: 'memory', toolName: 'Agent Memory', icon: 'Brain' },
    { slot: 'rail', toolId: 'tools', toolName: 'Tool Registry', icon: 'Tool' },
    { slot: 'sidebar_left', toolId: 'prompt_tree', toolName: 'System Prompts & Skills', icon: 'FileText' },
    { slot: 'sidebar_right', toolId: 'params', toolName: 'Model & Temperature Inspector', icon: 'Sliders' },
    { slot: 'bottom_tray', toolId: 'log_stream', toolName: 'Live Execution Trace Stream', icon: 'Activity' }
  ],
  elements: [
    {
      id: 'rail-1',
      stencilId: 'frame-activity-rail',
      name: 'Activity Rail',
      x: 20,
      y: 70,
      width: 60,
      height: 540,
      label: 'Activity Rail',
      category: 'shell',
      slotTarget: 'rail',
      props: {}
    },
    {
      id: 'menu-1',
      stencilId: 'frame-menu-bar',
      name: 'Header Menu Bar',
      x: 20,
      y: 20,
      width: 960,
      height: 44,
      label: 'Top Header Bar (Customer Concierge Agent | Model: Gemini 2.5 Pro)',
      category: 'shell',
      slotTarget: 'menu_bar',
      props: {}
    },
    {
      id: 'sidebar-left-1',
      stencilId: 'frame-sidebar-left',
      name: 'Skills & Tools',
      x: 84,
      y: 70,
      width: 200,
      height: 410,
      label: 'Agent Skills Tree',
      category: 'shell',
      slotTarget: 'sidebar_left',
      props: {}
    },
    {
      id: 'chart-1',
      stencilId: 'widget-chart-view',
      name: 'Agent Workflow DAG',
      x: 290,
      y: 70,
      width: 450,
      height: 410,
      label: 'Interactive Agent Workflow DAG (Input -> Router -> Tool Call -> Response)',
      category: 'widget',
      slotTarget: 'canvas',
      props: {}
    },
    {
      id: 'sidebar-right-1',
      stencilId: 'frame-sidebar-right',
      name: 'Property Inspector',
      x: 750,
      y: 70,
      width: 230,
      height: 410,
      label: 'Agent Tuning & Guards',
      category: 'shell',
      slotTarget: 'sidebar_right',
      props: {}
    },
    {
      id: 'bottom-1',
      stencilId: 'frame-bottom-tray',
      name: 'Execution Logs',
      x: 84,
      y: 486,
      width: 896,
      height: 124,
      label: 'Live Agent Execution & Tool Invocation Stream',
      category: 'shell',
      slotTarget: 'bottom_tray',
      props: {}
    }
  ]
};

export const PRESET_DATA_MODELER: SketchDocument = {
  version: '1.0.0',
  appName: 'Enterprise Lakehouse Modeler',
  appType: 'datamodeler',
  description: 'Visual Entity-Relationship schema designer with column lineage and Schematics sync',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  slotAssignments: [
    { slot: 'rail', toolId: 'er_canvas', toolName: 'ER Diagram', icon: 'Database' },
    { slot: 'rail', toolId: 'lineage', toolName: 'Lineage DAG', icon: 'GitMerge' },
    { slot: 'rail', toolId: 'diff', toolName: 'Schema Diff', icon: 'FileDiff' },
    { slot: 'sidebar_left', toolId: 'schema_tree', toolName: 'Schemas & Tables', icon: 'Layers' },
    { slot: 'sidebar_right', toolId: 'column_inspect', toolName: 'Column Type & Constraints', icon: 'Key' },
    { slot: 'bottom_tray', toolId: 'ddl_preview', toolName: 'Live Generated SQL DDL', icon: 'Code' }
  ],
  elements: [
    {
      id: 'rail-1',
      stencilId: 'frame-activity-rail',
      name: 'Activity Rail',
      x: 20,
      y: 70,
      width: 60,
      height: 540,
      label: 'Activity Rail',
      category: 'shell',
      slotTarget: 'rail',
      props: {}
    },
    {
      id: 'menu-1',
      stencilId: 'frame-menu-bar',
      name: 'Header Menu Bar',
      x: 20,
      y: 20,
      width: 960,
      height: 44,
      label: 'Top Header Bar (Lakehouse Modeler | Dialect: Snowflake / Postgres | Schematics Sync)',
      category: 'shell',
      slotTarget: 'menu_bar',
      props: {}
    },
    {
      id: 'sidebar-left-1',
      stencilId: 'frame-sidebar-left',
      name: 'Schema Catalog',
      x: 84,
      y: 70,
      width: 200,
      height: 410,
      label: 'Database Catalog',
      category: 'shell',
      slotTarget: 'sidebar_left',
      props: {}
    },
    {
      id: 'er-table-1',
      stencilId: 'widget-er-table',
      name: 'fct_orders',
      x: 290,
      y: 90,
      width: 210,
      height: 180,
      label: '📊 fct_orders (Fact Table)',
      category: 'data',
      slotTarget: 'canvas',
      props: {}
    },
    {
      id: 'er-table-2',
      stencilId: 'widget-er-table',
      name: 'dim_customers',
      x: 530,
      y: 90,
      width: 210,
      height: 180,
      label: '👤 dim_customers (Dimension)',
      category: 'data',
      slotTarget: 'canvas',
      props: {}
    },
    {
      id: 'sidebar-right-1',
      stencilId: 'frame-sidebar-right',
      name: 'Column Inspector',
      x: 750,
      y: 70,
      width: 230,
      height: 410,
      label: 'Column & Constraint Inspector',
      category: 'shell',
      slotTarget: 'sidebar_right',
      props: {}
    },
    {
      id: 'bottom-1',
      stencilId: 'frame-bottom-tray',
      name: 'SQL DDL Preview',
      x: 84,
      y: 486,
      width: 896,
      height: 124,
      label: 'Generated Multi-Dialect DDL & Migration Scripts (V1__init.sql)',
      category: 'shell',
      slotTarget: 'bottom_tray',
      props: {}
    }
  ]
};
