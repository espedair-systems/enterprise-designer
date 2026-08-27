import { create } from 'zustand';

export type AppMode =
  | 'designer'
  | 'dashboard'
  | 'architect'
  | 'agents'
  | 'portfolio'
  | 'database'
  | 'vectordb'
  | 'integration'
  | 'hr'
  | 'ba'
  | 'platforms'
  | 'settings'
  | 'help'
  | 'profile';

export type NavView =
  // 0. Phase 0: Conceptual Sketch & Wireframe Designer
  | 'sketch-designer'
  // 0.1 Phase 2: Dynamic Studio Shell
  | 'studio-shell'
  // Executive Dashboard Mode
  | 'dashboard'
  // Business Architect Mode
  | 'arch-directory'
  | 'arch-dashboard'
  | 'arch-capabilities'
  | 'arch-valuestreams'
  | 'arch-strategy'
  | 'arch-services'
  | 'arch-products'
  // Agents Mode
  | 'agents-directory'
  // Portfolio Mode
  | 'portfolio-directory'
  // Database Mode
  | 'database-directory'
  | 'database-schema'
  // Vector DB Mode
  | 'vector-directory'
  | 'vector-dashboard'
  | 'vector-search'
  | 'vector-graph'
  | 'vector-prompt'
  // Integration Mode
  | 'integration-directory'
  | 'integration-schema'
  // HR Mode (Legacy)
  | 'hr-organization'
  | 'hr-raci'
  // Business Analyst (BA) Mode
  | 'ba-processes'
  | 'ba-requirements'
  | 'ba-glossary'
  // Platform Views
  | 'platforms-overview'
  | 'plat-hcm'
  | 'plat-servicenow'
  | 'plat-jira'
  | 'plat-confluence'
  | 'plat-cloud'
  // Settings Views (Matching Enterprise Artist Rail Sections)
  | 'admin-users'
  | 'admin-roles'
  | 'admin-sso'
  | 'admin-audit'
  | 'settings'
  | 'data-settings'
  | 'database'
  | 'imports'
  | 'export'
  // Help Views
  | 'help-ea'
  | 'help-togaf'
  | 'help-valuestreams'
  | 'help-sipoc'
  | 'help-pace'
  | 'help-horizons'
  | 'help-shortcuts'
  // Profile View
  | 'profile';

export interface UserSession {
  name: string;
  email: string;
  role: string;
  employeeId: string;
  department: string;
  location: string;
  tenancy: string;
  initials: string;
  theme: 'light' | 'dark' | 'midnight' | 'slate';
  accent: string;
  uiDensity: 'compact' | 'normal' | 'relaxed';
  autoRefreshSec: number;
}

interface ModalState {
  isOpen: boolean;
  type: string; // 'capability' | 'valuestream' | 'process' | 'goal' | 'initiative' | 'concept' | 'requirement' | 'export' | 'profile' | 'startup'
  data?: any;
}

interface AppStore {
  isLoggedIn: boolean;
  sidebarCollapsed: boolean;
  appMode: AppMode;
  activeView: NavView;
  activeWorkspaceID: string;
  selectedIntegrationApiId: string;
  searchQuery: string;
  currentUser: UserSession;
  modal: ModalState;

  setIsLoggedIn: (logged: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAppMode: (mode: AppMode) => void;
  setActiveView: (view: NavView) => void;
  setActiveWorkspaceID: (id: string) => void;
  setSelectedIntegrationApiId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setCurrentUser: (user: Partial<UserSession>) => void;
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
}

export const useStore = create<AppStore>((set) => ({
  isLoggedIn: true,
  sidebarCollapsed: false,
  appMode: 'designer',
  activeView: 'sketch-designer',
  activeWorkspaceID: 'ws-base-default',
  selectedIntegrationApiId: 'base-artist-api',
  searchQuery: '',
  currentUser: {
    name: 'Application Architect & Designer',
    email: 'designer@enterprise.internal',
    role: 'Studio & Agent Designer (ESPEDAIR Designer)',
    employeeId: 'EMP-771204',
    department: 'Platform Engineering & Architecture',
    location: 'Global Hub',
    tenancy: 'ESPEDAIR_DESIGNER',
    initials: 'AD',
    theme: 'dark',
    accent: 'indigo',
    uiDensity: 'normal',
    autoRefreshSec: 10,
  },
  modal: {
    isOpen: false,
    type: '',
    data: null,
  },

  setIsLoggedIn: (logged) => set({ isLoggedIn: logged }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setAppMode: (mode) => set({ appMode: mode }),
  setActiveView: (view) => set({ activeView: view }),
  setActiveWorkspaceID: (id) => set({ activeWorkspaceID: id }),
  setSelectedIntegrationApiId: (id) => set({ selectedIntegrationApiId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCurrentUser: (user) =>
    set((state) => {
      const updated = { ...state.currentUser, ...user };
      if (user.name) {
        updated.initials = user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      return { currentUser: updated };
    }),
  openModal: (type, data = null) => set({ modal: { isOpen: true, type, data } }),
  closeModal: () => set({ modal: { isOpen: false, type: '', data: null } }),
}));
