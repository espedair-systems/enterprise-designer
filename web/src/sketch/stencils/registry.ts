import { StencilDefinition } from '../types';

export const STENCIL_REGISTRY: StencilDefinition[] = [
  // 1. Shell Frames
  {
    id: 'frame-activity-rail',
    name: 'Activity Rail (Left)',
    category: 'shell',
    defaultWidth: 64,
    defaultHeight: 520,
    icon: 'Sidebar',
    slotAffinity: 'rail',
    defaultProps: {
      items: ['Explorer', 'Canvas', 'Schematics', 'Workflows', 'Settings']
    }
  },
  {
    id: 'frame-menu-bar',
    name: 'Top Menu Bar',
    category: 'shell',
    defaultWidth: 800,
    defaultHeight: 48,
    icon: 'Menu',
    slotAffinity: 'menu_bar',
    defaultProps: {
      menus: ['File', 'Edit', 'Schema', 'Deploy', 'Help'],
      environment: 'DEV'
    }
  },
  {
    id: 'frame-sidebar-left',
    name: 'Primary Sidebar',
    category: 'shell',
    defaultWidth: 240,
    defaultHeight: 520,
    icon: 'PanelLeft',
    slotAffinity: 'sidebar_left',
    defaultProps: {
      title: 'Model Explorer',
      panels: ['Tree', 'Toolbox', 'Data Sources']
    }
  },
  {
    id: 'frame-canvas-area',
    name: 'Main Canvas Slot',
    category: 'shell',
    defaultWidth: 500,
    defaultHeight: 380,
    icon: 'Layout',
    slotAffinity: 'canvas',
    defaultProps: {
      mode: 'visual_builder'
    }
  },
  {
    id: 'frame-sidebar-right',
    name: 'Property Inspector',
    category: 'shell',
    defaultWidth: 240,
    defaultHeight: 520,
    icon: 'PanelRight',
    slotAffinity: 'sidebar_right',
    defaultProps: {
      title: 'Properties & Schema',
      sections: ['General', 'Bindings', 'Events']
    }
  },
  {
    id: 'frame-bottom-tray',
    name: 'Bottom Console Tray',
    category: 'shell',
    defaultWidth: 800,
    defaultHeight: 140,
    icon: 'Terminal',
    slotAffinity: 'bottom_tray',
    defaultProps: {
      tabs: ['SQL Logs', 'Query Terminal', 'Test Results']
    }
  },

  // 2. Data & App Widgets
  {
    id: 'widget-data-table',
    name: 'Data Table',
    category: 'widget',
    defaultWidth: 460,
    defaultHeight: 200,
    icon: 'Table',
    slotAffinity: 'canvas',
    defaultProps: {
      columns: ['id', 'name', 'status', 'created_at'],
      pagination: true
    }
  },
  {
    id: 'widget-metric-card',
    name: 'Metric Card',
    category: 'widget',
    defaultWidth: 220,
    defaultHeight: 100,
    icon: 'TrendingUp',
    slotAffinity: 'canvas',
    defaultProps: {
      title: 'Monthly Revenue',
      value: '$284,500',
      change: '+14.2%'
    }
  },
  {
    id: 'widget-form-card',
    name: 'Form Card',
    category: 'widget',
    defaultWidth: 320,
    defaultHeight: 220,
    icon: 'FormInput',
    slotAffinity: 'canvas',
    defaultProps: {
      fields: ['Username', 'Email', 'Role'],
      submitLabel: 'Save Record'
    }
  },
  {
    id: 'widget-chart-view',
    name: 'Time Series Chart',
    category: 'widget',
    defaultWidth: 460,
    defaultHeight: 180,
    icon: 'BarChart2',
    slotAffinity: 'canvas',
    defaultProps: {
      type: 'area',
      series: 'Sales vs Target'
    }
  },
  {
    id: 'widget-er-table',
    name: 'ER Entity Table',
    category: 'data',
    defaultWidth: 240,
    defaultHeight: 160,
    icon: 'Database',
    slotAffinity: 'canvas',
    defaultProps: {
      tableName: 'fct_orders',
      columns: [
        { name: 'order_id', type: 'UUID', pk: true },
        { name: 'customer_id', type: 'UUID', fk: true },
        { name: 'amount', type: 'NUMERIC(12,2)' }
      ]
    }
  },
  {
    id: 'annotation-note',
    name: 'Sticky Note',
    category: 'annotation',
    defaultWidth: 180,
    defaultHeight: 120,
    icon: 'StickyNote',
    defaultProps: {
      text: 'TODO: Connect to PostgreSQL sales replica and bind to Table 1',
      color: '#fef08a'
    }
  }
];
