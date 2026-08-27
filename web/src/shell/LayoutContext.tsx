import React, { createContext, useContext, useState, useEffect } from 'react';
import { LayoutSlotGroup, CanvasMode, RailItem, DesignerApp } from './types';
import { api } from '../services/api';

export const DEFAULT_SLOT_GROUP: LayoutSlotGroup = {
  rail: {
    items: [
      { id: 'explorer', icon: 'FolderIcon', label: 'Object Explorer', targetSidebar: 'model_tree', targetCanvas: 'visual_canvas' },
      { id: 'designer', icon: 'LayoutIcon', label: 'App Builder', targetSidebar: 'widget_toolbox', targetCanvas: 'visual_canvas' },
      { id: 'schematics', icon: 'DatabaseIcon', label: 'ER Modeler', targetSidebar: 'datasource_catalog', targetCanvas: 'er_modeler' },
      { id: 'lineage', icon: 'GitBranchIcon', label: 'Lineage DAG', targetSidebar: 'model_tree', targetCanvas: 'lineage_dag' },
      { id: 'sql', icon: 'TerminalIcon', label: 'SQL Console', targetSidebar: 'datasource_catalog', targetCanvas: 'sql_editor' },
      { id: 'agent', icon: 'BotIcon', label: 'Agent Workflows', targetSidebar: 'model_tree', targetCanvas: 'workflow_graph' },
    ],
  },
  menu_bar: {
    menus: ['File', 'Edit', 'Schema', 'Tools', 'Help'],
    actions: ['Save DSL', 'Sync Schematics', 'Test Run', 'Export Go Binary'],
  },
  sidebar_left: {
    defaultPanel: 'model_tree',
    panels: ['model_tree', 'widget_toolbox', 'datasource_catalog', 'git_status'],
  },
  sidebar_right: {
    defaultPanel: 'properties_inspector',
    panels: ['properties_inspector', 'data_bindings', 'validation_rules', 'event_handlers'],
  },
  canvas: {
    mode: 'visual_canvas',
    widgets: [
      { id: 'widget-header', type: 'HeaderCard', x: 20, y: 20, width: 800, height: 120, title: 'Fleet Operational Metrics', props: { metric: '99.98% SLA', status: 'Optimal' } },
      { id: 'widget-table', type: 'DataTable', x: 20, y: 160, width: 800, height: 320, title: 'Active Autonomous Agents', props: { dataSource: 'postgres.public.designer_apps', rows: 8 } },
    ],
  },
  bottom_tray: {
    panels: ['query_runner', 'sql_logs', 'test_runner', 'terminal'],
    activePanel: 'query_runner',
  },
};

interface LayoutContextType {
  slots: LayoutSlotGroup;
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
  setSelectedWidgetId: (id: string | null) => void;
  setEnvironment: (env: 'DEV' | 'TEST' | 'STAGING' | 'PROD') => void;
  setActiveRailId: (id: string) => void;
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
  refreshApps: () => Promise<void>;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode; initialAppId?: string }> = ({ children, initialAppId }) => {
  const [slots, setSlots] = useState<LayoutSlotGroup>(DEFAULT_SLOT_GROUP);
  const [activeRailId, setActiveRailId] = useState<string>('designer');
  const [activeLeftPanel, setActiveLeftPanel] = useState<string>('widget_toolbox');
  const [activeRightPanel, setActiveRightPanel] = useState<string>('properties_inspector');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);
  const [bottomTrayOpen, setBottomTrayOpen] = useState<boolean>(true);
  const [bottomTrayHeight, setBottomTrayHeight] = useState<number>(220);
  const [activeBottomTab, setActiveBottomTab] = useState<string>('query_runner');
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('visual_canvas');
  const [currentApp, setCurrentApp] = useState<DesignerApp | null>(null);
  const [appsList, setAppsList] = useState<DesignerApp[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>('widget-table');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [environment, setEnvironment] = useState<'DEV' | 'TEST' | 'STAGING' | 'PROD'>('DEV');

  const refreshApps = async () => {
    try {
      const res = await api.getDesignerApps();
      if (res && res.data) {
        setAppsList(res.data);
        if (!currentApp && res.data.length > 0) {
          const target = initialAppId ? res.data.find((a: DesignerApp) => a.id === initialAppId) || res.data[0] : res.data[0];
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
    } catch (err) {
      console.error('Failed to save layout to backend:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LayoutContext.Provider
      value={{
        slots,
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
        setSelectedWidgetId,
        setEnvironment,
        setActiveRailId,
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
        refreshApps,
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
