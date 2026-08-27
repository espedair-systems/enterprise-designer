import React from 'react';
import {
  LayoutDashboard,
  Box,
  Workflow,
  Layers,
  Users,
  Activity,
  Briefcase,
  FileText,
  CheckSquare,
  Compass,
  Cpu,
  Settings,
  HelpCircle,
  Database,
  Download,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

export interface StudioDefinition {
  id: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  category: 'core' | 'architecture' | 'governance' | 'analytics' | 'platform' | 'settings' | 'help';
  roles?: string[];
  viewId: string;
  description?: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  badge: string;
  description: string;
  defaultView: string;
  studioIds: string[];
}

export const APP_ROLES: RoleDefinition[] = [
  {
    id: 'designer',
    name: 'Application Architect & Studio Designer',
    badge: 'DESIGNER',
    description: 'Visual layout conceptualization, slot tool assignment, and living studio scaffolding',
    defaultView: 'sketch-designer',
    studioIds: ['sketch-designer', 'dashboard', 'capabilities', 'valuestreams'],
  },
  {
    id: 'architect',
    name: 'Enterprise Architect (TOGAF / ArchiMate)',
    badge: 'ARCHITECT',
    description: 'Capability maps, value streams, strategy OKRs, and business services',
    defaultView: 'arch-capabilities',
    studioIds: ['dashboard', 'capabilities', 'valuestreams', 'strategy', 'services'],
  },
  {
    id: 'ba',
    name: 'Business Analyst (BPMN / Requirements)',
    badge: 'ANALYST',
    description: 'Process architecture, requirements management, and information concepts',
    defaultView: 'ba-processes',
    studioIds: ['dashboard', 'processes', 'requirements', 'information'],
  },
  {
    id: 'hr',
    name: 'Organization & Human Capital',
    badge: 'HR / ORG',
    description: 'Organization units, RACI matrix, and headcount allocation',
    defaultView: 'hr-organization',
    studioIds: ['dashboard', 'organization', 'raci'],
  },
  {
    id: 'executive',
    name: 'Executive & Portfolio Governance',
    badge: 'EXECUTIVE',
    description: 'High-level transformation dashboards, roadmap horizons, and portfolio metrics',
    defaultView: 'dashboard',
    studioIds: ['dashboard', 'roadmap', 'platform'],
  },
];

export const STUDIOS_REGISTRY: StudioDefinition[] = [
  // 0. Conceptual Sketch & Wireframe Designer (Phase 0)
  {
    id: 'sketch-designer',
    label: 'Conceptual Sketch Designer',
    shortLabel: 'Sketch Studio',
    icon: Sparkles,
    category: 'core',
    viewId: 'sketch-designer',
    description: 'Phase 0: Rapid freeform wireframing and shell slot tool placement (Open-Pencil / Penpot style)',
  },

  // 0.1 Dynamic Studio Shell (Phase 2)
  {
    id: 'studio-shell',
    label: 'Dynamic Studio Shell',
    shortLabel: 'Studio Shell',
    icon: Layers,
    category: 'core',
    viewId: 'studio-shell',
    description: 'Phase 2: Dynamic 5-slot application workbench (Rail, Top Menu, Sidebars, Canvas, Bottom Console)',
  },


  // 1. Executive Dashboard
  {
    id: 'dashboard',
    label: 'Executive Dashboard',
    shortLabel: 'Dashboard',
    icon: LayoutDashboard,
    category: 'core',
    viewId: 'dashboard',
    description: 'Real-time transformation KPIs, capability maturity heatmaps, and strategy alignment',
  },

  // 2. Architecture Studio
  {
    id: 'capabilities',
    label: 'Capability Studio',
    shortLabel: 'Capabilities',
    icon: Box,
    category: 'architecture',
    viewId: 'arch-capabilities',
    description: 'Multi-tiered business capability taxonomy, maturity scores, and PACE classification',
  },
  {
    id: 'valuestreams',
    label: 'Value Stream Studio',
    shortLabel: 'Value Streams',
    icon: Workflow,
    category: 'architecture',
    viewId: 'arch-valuestreams',
    description: 'Customer and internal value streams, stages, and enabling capabilities',
  },
  {
    id: 'strategy',
    label: 'Strategy & OKR Studio',
    shortLabel: 'Strategy',
    icon: Activity,
    category: 'architecture',
    viewId: 'arch-strategy',
    description: 'Strategic themes, OKRs, Horizon 1-3 planning, and initiative tracking',
  },
  {
    id: 'services',
    label: 'Business Service Catalog',
    shortLabel: 'Services',
    icon: Briefcase,
    category: 'architecture',
    viewId: 'arch-services',
    description: 'Catalog of business services, products, and customer offerings',
  },

  // 3. Business Analysis & Processes
  {
    id: 'processes',
    label: 'Process Architecture',
    shortLabel: 'Processes',
    icon: Layers,
    category: 'architecture',
    viewId: 'ba-processes',
    description: 'Hierarchical processes (Level 1-4), SIPOC matrices, and value stream linkages',
  },
  {
    id: 'requirements',
    label: 'Requirements & Initiatives',
    shortLabel: 'Requirements',
    icon: CheckSquare,
    category: 'architecture',
    viewId: 'ba-requirements',
    description: 'Business requirements traceability, functional specs, and epics',
  },
  {
    id: 'information',
    label: 'Information & Glossary',
    shortLabel: 'Information',
    icon: FileText,
    category: 'architecture',
    viewId: 'ba-glossary',
    description: 'Business information concepts, data entities, and standardized glossary',
  },

  // 4. Organization & People
  {
    id: 'organization',
    label: 'Organization Units',
    shortLabel: 'Organization',
    icon: Users,
    category: 'governance',
    viewId: 'hr-organization',
    description: 'Hierarchical org units, departments, and capability ownership',
  },
  {
    id: 'raci',
    label: 'RACI Matrix',
    shortLabel: 'RACI',
    icon: Users,
    category: 'governance',
    viewId: 'hr-raci',
    description: 'Responsible, Accountable, Consulted, and Informed mapping across processes',
  },

  // 5. Governance & Roadmap
  {
    id: 'roadmap',
    label: 'Transformation Roadmap',
    shortLabel: 'Roadmap',
    icon: Compass,
    category: 'governance',
    viewId: 'roadmap',
    description: 'Quarterly milestones, Horizon 1-2-3 investments, and capability transitions',
  },
  {
    id: 'platform',
    label: 'Enterprise Integrations',
    shortLabel: 'Platforms',
    icon: Cpu,
    category: 'platform',
    viewId: 'platforms-overview',
    description: 'Workday HCM, ServiceNow, Jira, Confluence, and Cloud integrations',
  },

  // 6. Settings & Administration
  {
    id: 'settings',
    label: 'Workspace Settings',
    shortLabel: 'Settings',
    icon: Settings,
    category: 'settings',
    viewId: 'settings',
    description: 'Multi-tenant configuration, PostgreSQL connection pooling, and preferences',
  },
  {
    id: 'database',
    label: 'PostgreSQL Database',
    shortLabel: 'Database',
    icon: Database,
    category: 'settings',
    viewId: 'database',
    description: 'Authoritative PostgreSQL schema, tables, and connection status',
  },
  {
    id: 'export',
    label: 'Export & Backup',
    shortLabel: 'Export',
    icon: Download,
    category: 'settings',
    viewId: 'export',
    description: 'Export architecture models to JSON, Excel, or ArchiMate',
  },
  {
    id: 'help',
    label: 'Reference Documentation',
    shortLabel: 'Help & Guides',
    icon: HelpCircle,
    category: 'help',
    viewId: 'help-ea',
    description: 'Enterprise Architecture Framework, TOGAF 10, SIPOC, and keyboard shortcuts',
  },
];
