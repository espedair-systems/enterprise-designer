import {
  Capability,
  CapabilityHeatmapCell,
  CapabilityGap,
  ValueStream,
  BusinessProcess,
  OrgUnit,
  BusinessFunction,
  BusinessRole,
  BusinessService,
  Product,
  StrategicDriver,
  StrategicGoal,
  StrategicObjective,
  BusinessModelCanvas,
  StrategyTraceabilityItem,
  BusinessInformationConcept,
  BusinessTerm,
  Initiative,
  ExecutiveDashboardKPIs,
  ArtistHealthStatus,
} from '../types';

const BASE_URL = '/api/v1';

export interface VectorSearchResultItem {
  id: string;
  file_path: string;
  artifact_type: string;
  chunk_name: string;
  content: string;
  start_line: number;
  end_line: number;
  metadata_json?: string;
  score: number;
}

export interface VectorStatusResponse {
  status: string;
  service: string;
  version?: string;
  storage_engine?: string;
  model_name: string;
  dimension: number;
  indexed_chunks: number;
  indexed_files?: number;
  active_watchers?: number;
  lancedb_path?: string;
  db_path?: string;
  watch_paths?: string[];
  counts?: {
    capabilities: number;
    valuestreams: number;
    processes: number;
  };
  collections?: Array<{
    name: string;
    count: number;
    dim: number;
    format: string;
    size: string;
  }>;
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Analytics
  getDashboard: (ws = 'ws-default') =>
    fetchJSON<ExecutiveDashboardKPIs>(`${BASE_URL}/analytics/dashboard?workspace_id=${ws}`),
  getHeatmap: (ws = 'ws-default') =>
    fetchJSON<CapabilityHeatmapCell[]>(`${BASE_URL}/analytics/heatmap?workspace_id=${ws}`),
  getGaps: (ws = 'ws-default') =>
    fetchJSON<CapabilityGap[]>(`${BASE_URL}/analytics/gaps?workspace_id=${ws}`),
  getStrategyTraceability: (ws = 'ws-default') =>
    fetchJSON<StrategyTraceabilityItem[]>(`${BASE_URL}/strategy/traceability?workspace_id=${ws}`),

  // Capabilities
  listCapabilities: (ws = 'ws-default') =>
    fetchJSON<Capability[]>(`${BASE_URL}/capabilities?workspace_id=${ws}`),
  saveCapability: (data: Partial<Capability>, ws = 'ws-default') =>
    fetchJSON<Capability>(`${BASE_URL}/capabilities?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteCapability: (id: string, ws = 'ws-default') =>
    fetchJSON<{ message: string }>(`${BASE_URL}/capabilities/${id}?workspace_id=${ws}`, {
      method: 'DELETE',
    }),

  // Value Streams
  listValueStreams: (ws = 'ws-default') =>
    fetchJSON<ValueStream[]>(`${BASE_URL}/valuestreams?workspace_id=${ws}`),
  saveValueStream: (data: Partial<ValueStream>, ws = 'ws-default') =>
    fetchJSON<ValueStream>(`${BASE_URL}/valuestreams?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteValueStream: (id: string, ws = 'ws-default') =>
    fetchJSON<{ message: string }>(`${BASE_URL}/valuestreams/${id}?workspace_id=${ws}`, {
      method: 'DELETE',
    }),

  // Processes
  listProcesses: (ws = 'ws-default') =>
    fetchJSON<BusinessProcess[]>(`${BASE_URL}/processes?workspace_id=${ws}`),
  saveProcess: (data: Partial<BusinessProcess>, ws = 'ws-default') =>
    fetchJSON<BusinessProcess>(`${BASE_URL}/processes?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteProcess: (id: string, ws = 'ws-default') =>
    fetchJSON<{ message: string }>(`${BASE_URL}/processes/${id}?workspace_id=${ws}`, {
      method: 'DELETE',
    }),

  // Organization, Functions & Roles
  listOrgUnits: (ws = 'ws-default') =>
    fetchJSON<OrgUnit[]>(`${BASE_URL}/org/units?workspace_id=${ws}`),
  saveOrgUnit: (data: Partial<OrgUnit>, ws = 'ws-default') =>
    fetchJSON<OrgUnit>(`${BASE_URL}/org/units?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listBusinessFunctions: (ws = 'ws-default') =>
    fetchJSON<BusinessFunction[]>(`${BASE_URL}/org/functions?workspace_id=${ws}`),
  saveBusinessFunction: (data: Partial<BusinessFunction>, ws = 'ws-default') =>
    fetchJSON<BusinessFunction>(`${BASE_URL}/org/functions?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listBusinessRoles: (ws = 'ws-default') =>
    fetchJSON<BusinessRole[]>(`${BASE_URL}/org/roles?workspace_id=${ws}`),
  saveBusinessRole: (data: Partial<BusinessRole>, ws = 'ws-default') =>
    fetchJSON<BusinessRole>(`${BASE_URL}/org/roles?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Services & Products
  listServices: (ws = 'ws-default') =>
    fetchJSON<BusinessService[]>(`${BASE_URL}/services?workspace_id=${ws}`),
  saveService: (data: Partial<BusinessService>, ws = 'ws-default') =>
    fetchJSON<BusinessService>(`${BASE_URL}/services?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listProducts: (ws = 'ws-default') =>
    fetchJSON<Product[]>(`${BASE_URL}/products?workspace_id=${ws}`),
  saveProduct: (data: Partial<Product>, ws = 'ws-default') =>
    fetchJSON<Product>(`${BASE_URL}/products?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Strategy & OKRs
  listDrivers: (ws = 'ws-default') =>
    fetchJSON<StrategicDriver[]>(`${BASE_URL}/strategy/drivers?workspace_id=${ws}`),
  listGoals: (ws = 'ws-default') =>
    fetchJSON<StrategicGoal[]>(`${BASE_URL}/strategy/goals?workspace_id=${ws}`),
  saveGoal: (data: Partial<StrategicGoal>, ws = 'ws-default') =>
    fetchJSON<StrategicGoal>(`${BASE_URL}/strategy/goals?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listObjectives: (ws = 'ws-default') =>
    fetchJSON<StrategicObjective[]>(`${BASE_URL}/strategy/objectives?workspace_id=${ws}`),
  saveObjective: (data: Partial<StrategicObjective>, ws = 'ws-default') =>
    fetchJSON<StrategicObjective>(`${BASE_URL}/strategy/objectives?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCanvas: (ws = 'ws-default') =>
    fetchJSON<BusinessModelCanvas>(`${BASE_URL}/strategy/canvas?workspace_id=${ws}`),
  saveCanvas: (data: Partial<BusinessModelCanvas>, ws = 'ws-default') =>
    fetchJSON<BusinessModelCanvas>(`${BASE_URL}/strategy/canvas?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Information Concepts & Glossary
  listConcepts: (ws = 'ws-default') =>
    fetchJSON<BusinessInformationConcept[]>(`${BASE_URL}/information/concepts?workspace_id=${ws}`),
  saveConcept: (data: Partial<BusinessInformationConcept>, ws = 'ws-default') =>
    fetchJSON<BusinessInformationConcept>(`${BASE_URL}/information/concepts?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listTerms: (ws = 'ws-default') =>
    fetchJSON<BusinessTerm[]>(`${BASE_URL}/information/terms?workspace_id=${ws}`),
  saveTerm: (data: Partial<BusinessTerm>, ws = 'ws-default') =>
    fetchJSON<BusinessTerm>(`${BASE_URL}/information/terms?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Initiatives & Roadmap
  listInitiatives: (ws = 'ws-default') =>
    fetchJSON<Initiative[]>(`${BASE_URL}/initiatives?workspace_id=${ws}`),
  saveInitiative: (data: Partial<Initiative>, ws = 'ws-default') =>
    fetchJSON<Initiative>(`${BASE_URL}/initiatives?workspace_id=${ws}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteInitiative: (id: string, ws = 'ws-default') =>
    fetchJSON<{ message: string }>(`${BASE_URL}/initiatives/${id}?workspace_id=${ws}`, {
      method: 'DELETE',
    }),

  // Architecture OS Artists Health
  checkArtistsHealth: () =>
    fetchJSON<{ artists: ArtistHealthStatus[]; timestamp: string }>(`${BASE_URL}/artists/health`),
  checkSingleArtistHealth: (id: string) =>
    fetchJSON<ArtistHealthStatus>(`${BASE_URL}/artists/${id}/health`),

  // Autonomous Agents & Knowledge Services Health
  checkAgentsHealth: () =>
    fetchJSON<{ agents: ArtistHealthStatus[]; timestamp: string }>(`${BASE_URL}/agents/health`),
  checkSingleAgentHealth: (id: string) =>
    fetchJSON<ArtistHealthStatus>(`${BASE_URL}/agents/${id}/health`),

  // LanceDB Vector Search & Telemetry
  searchVectors: (payload: { query: string; limit?: number; artifact_type?: string; min_score?: number }) =>
    fetchJSON<{
      query: string;
      total: number;
      results: Array<{
        id: string;
        file_path: string;
        artifact_type: string;
        chunk_name: string;
        content: string;
        start_line: number;
        end_line: number;
        metadata_json: string;
        score: number;
      }>;
      duration_ms: number;
      service: string;
      storage_engine: string;
      model_name?: string;
      dimension?: number;
    }>(`${BASE_URL}/vector/search`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  searchHybridVectors: (payload: { query: string; limit?: number; artifact_type?: string; depth?: number }) =>
    fetchJSON<{
      query: string;
      total: number;
      vector_matches: Array<{
        id: string;
        file_path: string;
        artifact_type: string;
        chunk_name: string;
        content: string;
        start_line: number;
        end_line: number;
        metadata_json: string;
        score: number;
      }>;
      connected_graph: {
        total_nodes: number;
        total_edges: number;
        nodes: Array<{ id: string; label: string; category: string; degree: number }>;
        edges: Array<{ id: string; source: string; target: string; relation: string; stage: string }>;
      };
      duration_ms: number;
    }>(`${BASE_URL}/vector/hybrid`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getVectorStatus: () =>
    fetchJSON<VectorStatusResponse>(`${BASE_URL}/vector/status`),
  synthesizeVectorPrompt: (payload: {
    prompt: string;
    model?: string;
    temperature?: number;
    top_k?: number;
    similarity_threshold?: number;
    workspace_id?: string;
  }) =>
    fetchJSON<{
      prompt: string;
      model: string;
      temperature: number;
      synthesis: string;
      grounded_count: number;
      service: string;
    }>(`${BASE_URL}/vector/synthesize`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getVectorGraph: (workspaceId = 'ws-default') =>
    fetchJSON<{
      status: string;
      engine: string;
      workspace_id: string;
      nodes: Array<{
        id: string;
        label: string;
        category: string;
        color: string;
        bgColor: string;
        borderColor: string;
        x: number;
        y: number;
        score?: number;
        details: Record<string, any>;
      }>;
      edges: Array<{
        id: string;
        source: string;
        target: string;
        type: string;
        color: string;
      }>;
      stats: {
        total_nodes: number;
        total_edges: number;
        density: string;
        source: string;
      };
    }>(`${BASE_URL}/vector/graph?workspace_id=${workspaceId}`),

  // ESPEDAIR Designer: Applications & Dynamic Slot Layouts
  getDesignerApps: (workspaceId = 'ws-designer-default') =>
    fetchJSON<{ data: any[] }>(`${BASE_URL}/designer/apps?workspace_id=${workspaceId}`),

  createDesignerApp: (payload: {
    name: string;
    slug?: string;
    app_type?: string;
    description?: string;
    workspace_id?: string;
  }) =>
    fetchJSON<{ message: string; data: any }>(`${BASE_URL}/designer/apps`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getDesignerApp: (id: string) =>
    fetchJSON<{ app: any; layout: any }>(`${BASE_URL}/designer/apps/${id}`),

  updateDesignerLayout: (id: string, layout: { layout_version?: string; theme?: string; slots: any }) =>
    fetchJSON<{ message: string; data: any }>(`${BASE_URL}/designer/apps/${id}/layout`, {
      method: 'PUT',
      body: JSON.stringify(layout),
    }),

  deleteDesignerApp: (id: string) =>
    fetchJSON<{ message: string }>(`${BASE_URL}/designer/apps/${id}`, {
      method: 'DELETE',
    }),

  exportAppSource: (id: string) =>
    fetchJSON<{ app_id: string; app_name: string; slug: string; project_dir: string; zip_path: string; status: string }>(
      `${BASE_URL}/designer/apps/${id}/export/source`,
      { method: 'POST' }
    ),

  exportAppBinary: (id: string) =>
    fetchJSON<{ app_id: string; app_name: string; slug: string; binary_path: string; status: string; instructions: string }>(
      `${BASE_URL}/designer/apps/${id}/export/binary`,
      { method: 'POST' }
    ),

  // ESPEDAIR Schematics Bridge
  generateSchemaDiff: (payload: { workspace_id?: string; tables: any[]; dialect?: string }) =>
    fetchJSON<{ dialect: string; tables_count: number; ddl_script: string; has_changes: boolean }>(
      `${BASE_URL}/schematics/diff`,
      { method: 'POST', body: JSON.stringify(payload) }
    ),

  planMigration: (payload: { version?: string; description?: string; tables: any[] }) =>
    fetchJSON<{ filename: string; version: string; description: string; migration_script: string; checksum: string }>(
      `${BASE_URL}/schematics/migrations/plan`,
      { method: 'POST', body: JSON.stringify(payload) }
    ),

  lintSQL: (payload: { sql: string; dialect?: string }) =>
    fetchJSON<{ sql: string; dialect: string; violations: any[]; valid: boolean }>(
      `${BASE_URL}/schematics/lint`,
      { method: 'POST', body: JSON.stringify(payload) }
    ),

  getColumnLineage: () =>
    fetchJSON<{ nodes: any[]; edges: any[]; blast_radius_enabled: boolean }>(
      `${BASE_URL}/schematics/lineage`
    ),
};

