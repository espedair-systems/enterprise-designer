import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  LayoutSlotGroup,
  CanvasMode,
  DesignerDomainMode,
  RailItem,
  DesignerApp,
} from './types';
import { api } from '../services/api';

export const DOMAIN_MODE_RAIL_CONFIGS: Record<DesignerDomainMode, RailItem[]> = {
  dashboard: [
    {
      id: 'dashboard_overview',
      icon: 'LayoutDashboardIcon',
      label: 'Dashboard',
      description: 'Executive KPIs & System Metrics',
      targetCanvas: 'executive_dashboard',
    },
    {
      id: 'recent_activity',
      icon: 'ActivityIcon',
      label: 'Recent Activity',
      description: 'Audit Logs & Change Requests in DES_BASE',
      targetCanvas: 'recent_activity',
    },
    {
      id: 'global_search',
      icon: 'SearchIcon',
      label: 'Search',
      description: 'Artifacts, Schemas & Entity Explorer',
      targetCanvas: 'global_search',
    },
  ],
  projects: [
    // 0. Primary Registry
    {
      id: 'projects_table',
      icon: 'FolderCodeIcon',
      label: 'Project Registry',
      description: 'Enterprise Project List & Active Studio App',
      targetCanvas: 'dashboard_projects',
    },

    // 1. BEHAVIORAL DIAGRAMS (7)
    {
      id: 'use_case',
      icon: 'WorkflowIcon',
      label: 'Use Case',
      description: 'High-Level Requirements & Boundaries',
      section: 'Behavioral Diagrams',
      targetCanvas: 'use_case',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'activity_diagram',
      icon: 'ActivityIcon',
      label: 'Activity Diagram',
      description: 'Control Flow, Actions & Decision Nodes',
      section: 'Behavioral Diagrams',
      targetCanvas: 'activity_diagram',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'state_machine',
      icon: 'SlidersIcon',
      label: 'State Machine',
      description: 'States, Transitions, Guards & Triggers',
      section: 'Behavioral Diagrams',
      targetCanvas: 'state_machine',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'sequence_diagram',
      icon: 'GitBranchIcon',
      label: 'Sequence Diagram',
      description: 'Lifelines, Messages & Interaction Flows',
      section: 'Behavioral Diagrams',
      targetCanvas: 'sequence_diagram',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'communication_diagram',
      icon: 'Share2Icon',
      label: 'Communication',
      description: 'Object Collaboration & Numbered Messages',
      section: 'Behavioral Diagrams',
      targetCanvas: 'communication_diagram',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'interaction_overview_diagram',
      icon: 'LayersIcon',
      label: 'Interaction Overview',
      description: 'Macro Activity Frames & Sequence Flow',
      section: 'Behavioral Diagrams',
      targetCanvas: 'interaction_overview_diagram',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'timing_diagram',
      icon: 'CompassIcon',
      label: 'Timing Diagram',
      description: 'Linear Timeline Constraints & Waveforms',
      section: 'Behavioral Diagrams',
      targetCanvas: 'timing_diagram',
      targetSidebar: 'uml_toolbox',
    },

    // 2. STRUCTURAL DIAGRAMS (7)
    {
      id: 'class_diagram',
      icon: 'LayoutIcon',
      label: 'Class Diagram',
      description: 'Classes, Attributes, Methods & Inheritance',
      section: 'Structural Diagrams',
      targetCanvas: 'class_diagram',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'object_diagram',
      icon: 'DatabaseIcon',
      label: 'Object Diagram',
      description: 'Runtime Instance Snapshots & Slots',
      section: 'Structural Diagrams',
      targetCanvas: 'object_diagram',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'component_diagram',
      icon: 'BoxesIcon',
      label: 'Component Diagram',
      description: 'Software Modules, Interfaces & Ports',
      section: 'Structural Diagrams',
      targetCanvas: 'component_diagram',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'deployment_diagram',
      icon: 'NetworkIcon',
      label: 'Deployment Diagram',
      description: 'Physical Nodes, Devices & Artifacts',
      section: 'Structural Diagrams',
      targetCanvas: 'deployment_diagram',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'package_diagram',
      icon: 'FolderCodeIcon',
      label: 'Package Diagram',
      description: 'Namespaces & Package Dependencies',
      section: 'Structural Diagrams',
      targetCanvas: 'package_diagram',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'composite_structure_diagram',
      icon: 'LayoutDashboardIcon',
      label: 'Composite Structure',
      description: 'Internal Parts, Ports & Connectors',
      section: 'Structural Diagrams',
      targetCanvas: 'composite_structure_diagram',
      targetSidebar: 'uml_toolbox',
    },
    {
      id: 'profile_diagram',
      icon: 'SlidersIcon',
      label: 'Profile Diagram',
      description: 'Custom Stereotypes & Metaclasses',
      section: 'Structural Diagrams',
      targetCanvas: 'profile_diagram',
      targetSidebar: 'uml_toolbox',
    },

    // 3. Generator
    {
      id: 'project_scaffold',
      icon: 'BoxesIcon',
      label: 'Scaffold & Build',
      description: 'Hexagonal Generator & Single Executable',
      targetCanvas: 'project_scaffold',
    },
  ],
  ui_designer: [
    {
      id: 'page_registry',
      icon: 'LayersIcon',
      label: 'Page Registry',
      description: 'Enterprise Page Catalog & Route Management',
      targetCanvas: 'page_registry',
    },
    {
      id: 'ui_sketch',
      icon: 'PenToolIcon',
      label: 'Wireframe & Sketch',
      description: 'Penpot / Figma UI Mockup Canvas',
      targetCanvas: 'ui_sketch',
      targetSidebar: 'widget_toolbox',
    },
    {
      id: 'ui_designer',
      icon: 'LayoutIcon',
      label: 'UI Designer',
      description: 'App Builder & Visual Grid Layout',
      targetCanvas: 'visual_canvas',
      targetSidebar: 'widget_toolbox',
    },
  ],
  data_designer: [
    {
      id: 'entity_registry',
      icon: 'DatabaseIcon',
      label: 'Entity Registry',
      description: 'Authoritative Relational Entities in DES_BASE',
      targetCanvas: 'entity_registry',
    },
    {
      id: 'schematics',
      icon: 'WorkflowIcon',
      label: 'ER Modeler',
      description: 'Relational Schemas & DDL in DES_BASE',
      targetCanvas: 'er_modeler',
      targetSidebar: 'data_dictionary',
    },
    {
      id: 'lineage',
      icon: 'GitBranchIcon',
      label: 'Lineage',
      description: 'Column-Level Lineage & Flow Graphs',
      targetCanvas: 'lineage_dag',
      targetSidebar: 'lineage_stages',
    },
    {
      id: 'sql',
      icon: 'TerminalIcon',
      label: 'SQL Console',
      description: 'AST SQL Query Workspace',
      targetCanvas: 'sql_editor',
      targetSidebar: 'sql_catalog',
    },
  ],
  agent_designer: [
    {
      id: 'agent',
      icon: 'BotIcon',
      label: 'Agent Workflows',
      description: 'Autonomous Agent Decision Graphs',
      targetCanvas: 'workflow_graph',
      targetSidebar: 'agent_library',
    },
  ],
  q_designer: [
    {
      id: 'q_registry',
      icon: 'FolderCodeIcon',
      label: 'Q Registry',
      description: 'Enterprise Survey & Questionnaire Manager',
      targetCanvas: 'q_registry',
    },
    {
      id: 'q_designer',
      icon: 'LayoutIcon',
      label: 'Survey Designer',
      description: 'Visual Questionnaire Canvas & Logic Rules',
      targetCanvas: 'q_designer',
      targetSidebar: 'q_toolbox',
    },
    {
      id: 'q_bank',
      icon: 'DatabaseIcon',
      label: 'Question Bank',
      description: 'Reusable Enterprise Question Templates',
      targetCanvas: 'q_bank',
    },
    {
      id: 'q_reference',
      icon: 'LayersIcon',
      label: 'Reference Data',
      description: 'Lookup Datasets, Scales & Choice Lists',
      targetCanvas: 'q_reference',
    },
    {
      id: 'q_responses',
      icon: 'ActivityIcon',
      label: 'Audit Submissions',
      description: 'Response Answers, Metrics & Audit Logs',
      targetCanvas: 'q_responses',
    },
    {
      id: 'q_guidance',
      icon: 'FileTextIcon',
      label: 'Guidance & Docs',
      description: 'Best Practices & Survey Logic Architecture',
      targetCanvas: 'q_guidance',
    },
  ],
  schema_designer: [
    {
      id: 'schema_registry',
      icon: 'FolderCodeIcon',
      label: 'Schema Registry',
      description: 'Enterprise JSON Schemas & OpenAPI Registry',
      targetCanvas: 'schema_registry',
    },
    {
      id: 'schema_designer',
      icon: 'LayoutIcon',
      label: 'Visual Schema Builder',
      description: 'Interactive Property Tree & Constraints GUI',
      targetCanvas: 'schema_designer',
      targetSidebar: 'schema_toolbox',
    },
    {
      id: 'schema_graph',
      icon: 'WorkflowIcon',
      label: 'Schema Graph AST',
      description: '2D Node-and-Wire AST Canvas Visualizer',
      targetCanvas: 'schema_graph',
      targetSidebar: 'schema_toolbox',
    },
    {
      id: 'openapi_manager',
      icon: 'LayersIcon',
      label: 'OpenAPI Route Manager',
      description: 'Endpoints, HTTP Operations, Request & Response Matrix',
      targetCanvas: 'openapi_manager',
      targetSidebar: 'openapi_toolbox',
    },
    {
      id: 'api_console',
      icon: 'ActivityIcon',
      label: 'Interactive API Console',
      description: 'Stoplight Elements Three-Panel Live Docs & Runner',
      targetCanvas: 'api_console',
      targetSidebar: 'openapi_toolbox',
    },
    {
      id: 'dialect_catalog',
      icon: 'DatabaseIcon',
      label: 'Dialect & Vocabularies',
      description: 'Metaschemas (Draft 2020-12, OAS 3.1) & Custom Dialects',
      targetCanvas: 'dialect_catalog',
    },
  ],
};

export const DEFAULT_SLOT_GROUP: LayoutSlotGroup = {
  rail: {
    items: DOMAIN_MODE_RAIL_CONFIGS.dashboard,
  },
  menu_bar: {
    menus: [],
    actions: ['Save DSL', 'Sync Schematics', 'Test Run'],
  },
  sidebar_left: {
    defaultPanel: 'dashboard_summary',
    panels: [
      'dashboard_summary',
      'widget_toolbox',
      'q_toolbox',
      'data_dictionary',
      'lineage_stages',
      'sql_catalog',
      'agent_library',
      'model_tree',
    ],
  },
  sidebar_right: {
    defaultPanel: 'properties_inspector',
    panels: ['properties_inspector', 'data_bindings', 'validation_rules', 'event_handlers'],
  },
  canvas: {
    mode: 'dashboard_projects',
    widgets: [
      {
        id: 'widget-header',
        type: 'HeaderCard',
        x: 20,
        y: 20,
        width: 800,
        height: 120,
        title: 'Fleet Operational Metrics',
        props: { metric: '99.98% SLA', status: 'Optimal' },
      },
      {
        id: 'widget-table',
        type: 'DataTable',
        x: 20,
        y: 160,
        width: 800,
        height: 320,
        title: 'Active Autonomous Agents',
        props: { dataSource: 'postgres.public.designer_apps', rows: 8 },
      },
    ],
  },
  bottom_tray: {
    panels: ['query_runner', 'sql_logs', 'test_runner', 'terminal'],
    activePanel: 'query_runner',
  },
};

interface LayoutContextType {
  slots: LayoutSlotGroup;
  domainMode: DesignerDomainMode;
  setDomainMode: (mode: DesignerDomainMode) => void;
  activeRailId: string;
  activeLeftPanel: string;
  activeRightPanel: string;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  bottomTrayOpen: boolean;
  bottomTrayHeight: number;
  activeBottomTab: string;
  canvasMode: CanvasMode;
  currentApp: DesignerApp | null;
  appsList: DesignerApp[];
  isSaving: boolean;
  isConfigModalOpen: boolean;
  environment: 'DEV' | 'TEST' | 'STAGING' | 'PROD';
  selectedWidgetId: string | null;
  autosaveEnabled: boolean;
  autosaveInterval: number; // in seconds
  lastSavedTime: Date | null;
  setAutosaveEnabled: (enabled: boolean) => void;
  setAutosaveInterval: (seconds: number) => void;
  setSelectedWidgetId: (id: string | null) => void;
  setEnvironment: (env: 'DEV' | 'TEST' | 'STAGING' | 'PROD') => void;
  setActiveRailId: (id: string) => void;
  selectRailItem: (item: RailItem) => void;
  setActiveLeftPanel: (panel: string) => void;
  setActiveRightPanel: (panel: string) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleBottomTray: () => void;
  setBottomTrayHeight: (h: number) => void;
  setActiveBottomTab: (tab: string) => void;
  setCanvasMode: (mode: CanvasMode) => void;
  setIsConfigModalOpen: (open: boolean) => void;
  updateSlots: (newSlots: Partial<LayoutSlotGroup>) => void;
  addRailItem: (item: RailItem) => void;
  removeRailItem: (id: string) => void;
  saveLayoutToBackend: () => Promise<void>;
  selectApp: (app: DesignerApp) => void;
  activateProject: (app: DesignerApp) => void;
  refreshApps: () => Promise<void>;
  createApp: (appData: { name: string; slug: string; app_type: string; description?: string }) => Promise<DesignerApp>;
  updateApp: (id: string, appData: Partial<DesignerApp>) => Promise<DesignerApp>;
  deleteApp: (id: string) => Promise<void>;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode; initialAppId?: string }> = ({
  children,
  initialAppId,
}) => {
  const [domainMode, setDomainModeState] = useState<DesignerDomainMode>('dashboard');
  const [slots, setSlots] = useState<LayoutSlotGroup>(DEFAULT_SLOT_GROUP);
  const [activeRailId, setActiveRailId] = useState<string>('dashboard');
  const [activeLeftPanel, setActiveLeftPanel] = useState<string>('dashboard_summary');
  const [activeRightPanel, setActiveRightPanel] = useState<string>('properties_inspector');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);
  const [bottomTrayOpen, setBottomTrayOpen] = useState<boolean>(true);
  const [bottomTrayHeight, setBottomTrayHeight] = useState<number>(220);
  const [activeBottomTab, setActiveBottomTab] = useState<string>('query_runner');
  const [canvasMode, setCanvasModeState] = useState<CanvasMode>('executive_dashboard');
  const [currentApp, setCurrentApp] = useState<DesignerApp | null>(null);
  const [appsList, setAppsList] = useState<DesignerApp[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>('widget-table');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [environment, setEnvironment] = useState<'DEV' | 'TEST' | 'STAGING' | 'PROD'>('DEV');

  // Autosave to PostgreSQL DES_BASE
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(true);
  const [autosaveInterval, setAutosaveInterval] = useState<number>(10);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const isInitialMount = useRef(true);

  const setCanvasMode = (mode: CanvasMode) => {
    setCanvasModeState(mode);

    // Find the matching rail item in current domain or across all domain configs
    let matchedItem: RailItem | undefined = slots.rail.items.find((i) => i.targetCanvas === mode);
    let matchedDomain: DesignerDomainMode | undefined = undefined;

    if (!matchedItem) {
      for (const [dom, items] of Object.entries(DOMAIN_MODE_RAIL_CONFIGS)) {
        const found = items.find((i) => i.targetCanvas === mode);
        if (found) {
          matchedItem = found;
          matchedDomain = dom as DesignerDomainMode;
          break;
        }
      }
    }

    if (matchedDomain && matchedDomain !== domainMode) {
      setDomainModeState(matchedDomain);
      const railItems = DOMAIN_MODE_RAIL_CONFIGS[matchedDomain] || [];
      setSlots((prev) => ({
        ...prev,
        rail: { items: railItems },
      }));
    }

    if (matchedItem) {
      setActiveRailId(matchedItem.id);
      if (matchedItem.targetSidebar) {
        setActiveLeftPanel(matchedItem.targetSidebar);
        setLeftSidebarOpen(true);
      } else {
        setLeftSidebarOpen(false);
      }
    }
  };

  const setDomainMode = (mode: DesignerDomainMode) => {
    setDomainModeState(mode);
    const railItems = DOMAIN_MODE_RAIL_CONFIGS[mode] || DOMAIN_MODE_RAIL_CONFIGS.dashboard;
    setSlots((prev) => ({
      ...prev,
      rail: { items: railItems },
    }));

    if (railItems.length > 0) {
      selectRailItem(railItems[0]);
    }
  };

  const refreshApps = async () => {
    try {
      const res = await api.getDesignerApps();
      if (res && res.data) {
        setAppsList(res.data);
        if (!currentApp && res.data.length > 0) {
          const target = initialAppId
            ? res.data.find((a: DesignerApp) => a.id === initialAppId) || res.data[0]
            : res.data[0];
          selectApp(target);
        }
      }
    } catch (err) {
      console.warn('Could not fetch designer apps list, using default layout.', err);
    }
  };

  const selectApp = async (app: DesignerApp) => {
    setCurrentApp(app);
    try {
      const res = await api.getDesignerApp(app.id);
      if (res && res.layout && res.layout.slots) {
        setSlots(res.layout.slots);
        if (res.layout.slots.canvas?.mode) {
          setCanvasMode(res.layout.slots.canvas.mode);
        }
      }
    } catch (err) {
      console.warn(`No custom layout found for app ${app.id}, maintaining active layout.`, err);
    }
  };

  const selectRailItem = (item: RailItem) => {
    setActiveRailId(item.id);
    if (item.targetCanvas) {
      setCanvasMode(item.targetCanvas);
    }
    if (item.targetSidebar) {
      setActiveLeftPanel(item.targetSidebar);
      setLeftSidebarOpen(true);
    } else {
      setLeftSidebarOpen(false);
    }
  };

  useEffect(() => {
    refreshApps();
  }, []);

  const toggleLeftSidebar = () => setLeftSidebarOpen((prev) => !prev);
  const toggleRightSidebar = () => setRightSidebarOpen((prev) => !prev);
  const toggleBottomTray = () => setBottomTrayOpen((prev) => !prev);

  const updateSlots = (newSlots: Partial<LayoutSlotGroup>) => {
    setSlots((prev) => ({ ...prev, ...newSlots }));
  };

  const addRailItem = (item: RailItem) => {
    setSlots((prev) => ({
      ...prev,
      rail: {
        ...prev.rail,
        items: [...prev.rail.items, item],
      },
    }));
  };

  const removeRailItem = (id: string) => {
    setSlots((prev) => ({
      ...prev,
      rail: {
        ...prev.rail,
        items: prev.rail.items.filter((i) => i.id !== id),
      },
    }));
  };

  const saveLayoutToBackend = async () => {
    if (!currentApp) return;
    setIsSaving(true);
    try {
      await api.updateDesignerLayout(currentApp.id, {
        layout_version: '1.0.0',
        theme: 'dark_modern',
        slots: {
          ...slots,
          canvas: {
            ...slots.canvas,
            mode: canvasMode,
          },
        },
      });
      setLastSavedTime(new Date());
    } catch (err) {
      console.error('Failed to save layout to backend:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced Autosave Effect
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!autosaveEnabled || !currentApp) return;

    const timer = setTimeout(() => {
      saveLayoutToBackend();
    }, autosaveInterval * 1000);

    return () => clearTimeout(timer);
  }, [slots, canvasMode, autosaveEnabled, autosaveInterval, currentApp?.id]);

  const createApp = async (appData: {
    name: string;
    slug: string;
    app_type: string;
    description?: string;
  }): Promise<DesignerApp> => {
    const res = await api.createDesignerApp({
      ...appData,
      status: 'draft',
    });
    await refreshApps();
    if (res && res.data) {
      selectApp(res.data);
      return res.data;
    }
    throw new Error('Failed to create designer app');
  };

  const activateProject = (app: DesignerApp) => {
    setCurrentApp(app);
    setCanvasMode('use_case');
    setActiveLeftPanel('uml_toolbox');
    setLeftSidebarOpen(true);
  };

  const updateApp = async (id: string, appData: Partial<DesignerApp>): Promise<DesignerApp> => {
    const res = await api.updateDesignerApp(id, appData);
    await refreshApps();
    if (currentApp?.id === id) {
      setCurrentApp((prev) => (prev ? { ...prev, ...appData } : null));
    }
    return res.data;
  };

  const deleteApp = async (id: string): Promise<void> => {
    await api.deleteDesignerApp(id);
    if (currentApp?.id === id) {
      setCurrentApp(null);
    }
    await refreshApps();
  };

  return (
    <LayoutContext.Provider
      value={{
        slots,
        domainMode,
        setDomainMode,
        activeRailId,
        activeLeftPanel,
        activeRightPanel,
        leftSidebarOpen,
        rightSidebarOpen,
        bottomTrayOpen,
        bottomTrayHeight,
        activeBottomTab,
        canvasMode,
        currentApp,
        appsList,
        isSaving,
        isConfigModalOpen,
        environment,
        selectedWidgetId,
        autosaveEnabled,
        autosaveInterval,
        lastSavedTime,
        setAutosaveEnabled,
        setAutosaveInterval,
        setSelectedWidgetId,
        setEnvironment,
        setActiveRailId,
        selectRailItem,
        setActiveLeftPanel,
        setActiveRightPanel,
        toggleLeftSidebar,
        toggleRightSidebar,
        toggleBottomTray,
        setBottomTrayHeight,
        setActiveBottomTab,
        setCanvasMode,
        setIsConfigModalOpen,
        updateSlots,
        addRailItem,
        removeRailItem,
        saveLayoutToBackend,
        selectApp,
        activateProject,
        refreshApps,
        createApp,
        updateApp,
        deleteApp,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const useSafeLayout = (): LayoutContextType | undefined => {
  return useContext(LayoutContext);
};
