import { create } from 'zustand';
import {
  loadDatabaseDesignModel,
  saveDatabaseMetadata,
  explainPostgresSql,
  fetchDatabaseActivity,
  fetchTableStats,
  type DatabaseDesignModel,
  type DatabaseEntityKind,
  type DatabaseActivityInfo,
  type TableStorageStat,
  type ExplainPlanResult,
  type QueryHistoryItem,
  type QueryBookmark,
} from '../services/database/design';

function entityKey(schemaName: string, kind: DatabaseEntityKind, entityName: string): string {
  return `${schemaName}.${kind}.${entityName}`;
}

function columnKey(
  schemaName: string,
  kind: DatabaseEntityKind,
  entityName: string,
  columnName: string,
): string {
  return `${schemaName}.${kind}.${entityName}.${columnName}`;
}

export type DatabaseViewMode =
  | 'erd'
  | 'editor'
  | 'schema'
  | 'table'
  | 'column'
  | 'relationship'
  | 'activity'
  | 'stats';

interface DatabaseState {
  loaded: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  viewMode: DatabaseViewMode;
  model: DatabaseDesignModel;
  selectedSchemaName: string | null;
  selectedEntityKey: string | null;
  selectedRelationshipId: string | null;
  focusedEntityKey: string | null;
  selectedDomain: string;
  schemaDescriptions: Record<string, string>;
  entityDescriptions: Record<string, string>;
  columnDescriptions: Record<string, string>;
  relationshipDescriptions: Record<string, string>;
  filterQuery: string;
  dirty: boolean;

  // New Explain, History, Activity, and Stats States
  queryHistory: QueryHistoryItem[];
  bookmarks: QueryBookmark[];
  activity: DatabaseActivityInfo[];
  tableStats: TableStorageStat[];
  explainResult: ExplainPlanResult | null;
  loadingActivity: boolean;
  loadingStats: boolean;
  loadingExplain: boolean;

  setViewMode: (mode: DatabaseViewMode) => void;
  setSelectedSchemaName: (schemaName: string) => void;
  setSelectedDomain: (domain: string) => void;
  setFilterQuery: (query: string) => void;
  load: () => Promise<void>;
  selectEntity: (schemaName: string, kind: DatabaseEntityKind, entityName: string) => void;
  selectRelationship: (relationshipId: string | null) => void;
  setFocusedEntity: (schemaName: string, kind: DatabaseEntityKind, entityName: string) => void;
  clearFocusedEntity: () => void;
  updateSchemaDescription: (schemaName: string, value: string) => void;
  updateEntityDescription: (schemaName: string, kind: DatabaseEntityKind, entityName: string, value: string) => void;
  updateColumnDescription: (
    schemaName: string,
    kind: DatabaseEntityKind,
    entityName: string,
    columnName: string,
    value: string,
  ) => void;
  updateRelationshipDescription: (relationshipId: string, value: string) => void;
  save: () => Promise<boolean>;

  // Explain, History, Activity, and Stats Actions
  addHistoryItem: (item: Omit<QueryHistoryItem, 'id' | 'timestamp'>) => void;
  saveBookmark: (bookmark: Omit<QueryBookmark, 'id'>) => void;
  deleteBookmark: (id: string) => void;
  loadActivity: () => Promise<void>;
  loadTableStats: () => Promise<void>;
  runExplain: (sql: string, analyze: boolean) => Promise<ExplainPlanResult>;
  clearExplainResult: () => void;
}

const emptyModel: DatabaseDesignModel = { schemas: [], relationships: [] };

const DEFAULT_BOOKMARKS: QueryBookmark[] = [
  {
    id: 'bm-cap-gaps',
    title: 'Capabilities by Maturity Gap',
    category: 'Architecture Analytics',
    description: 'Finds capabilities where target maturity exceeds current maturity sorted by highest delta.',
    query: `SELECT code, name, current_maturity, target_maturity, 
       ROUND(target_maturity - current_maturity, 2) AS maturity_gap, 
       investment_priority, pace_layer 
FROM "BT_BASE".capabilities 
WHERE target_maturity > current_maturity 
ORDER BY maturity_gap DESC;`,
  },
  {
    id: 'bm-sipoc-steps',
    title: '5-Box SIPOC Process Breakdown',
    category: 'Process Architecture',
    description: 'Decomposes processes into Supplier, Input, Process Step, Output, and Customer.',
    query: `SELECT p.name AS process_name, ps.step_order, ps.supplier, ps.input_data, 
       ps.process_step, ps.output_data, ps.customer 
FROM "BT_BASE".process_sipoc_steps ps 
JOIN "BT_BASE".processes p ON ps.process_id = p.id 
ORDER BY p.name, ps.step_order;`,
  },
  {
    id: 'bm-fact-sheet-catalog',
    title: 'Fact Sheets by ArchiMate Aspect',
    category: 'Enterprise Metamodel',
    description: 'Summarizes fact sheet inventories by ArchiMate aspect and TOGAF classification.',
    query: `SELECT c.aspect, c.category, COUNT(fs.id) AS total_sheets, 
       AVG(fs.completion) AS avg_completion_pct 
FROM "EA_BASE".dba_fact_type_catalog c 
LEFT JOIN "EA_BASE".dba_fact_sheet fs ON c.code = fs.type 
GROUP BY c.aspect, c.category 
ORDER BY total_sheets DESC;`,
  },
  {
    id: 'bm-schema-storage',
    title: 'PostgreSQL Schema Storage Distribution',
    category: 'Database Diagnostics',
    description: 'Analyzes storage footprint, table sizes, and estimated row counts.',
    query: `SELECT schemaname, relname AS table_name, 
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size, 
       pg_size_pretty(pg_relation_size(relid)) AS data_size, 
       pg_size_pretty(pg_indexes_size(relid)) AS index_size, 
       n_live_tup AS row_estimate 
FROM pg_stat_user_tables 
ORDER BY pg_total_relation_size(relid) DESC;`,
  },
];

const INITIAL_HISTORY: QueryHistoryItem[] = [
  {
    id: 'hist-1',
    query: 'SELECT * FROM "BT_BASE".capabilities WHERE workspace_id = \'ws-default\';',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    durationMs: 14,
    rowsCount: 16,
    status: 'SUCCESS',
  },
  {
    id: 'hist-2',
    query: 'SELECT * FROM "BT_BASE".value_streams ORDER BY name ASC;',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    durationMs: 8,
    rowsCount: 4,
    status: 'SUCCESS',
  },
];

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  loaded: false,
  loading: false,
  saving: false,
  error: null,
  viewMode: 'erd',
  model: emptyModel,
  selectedSchemaName: 'BT_BASE',
  selectedEntityKey: null,
  selectedRelationshipId: null,
  focusedEntityKey: null,
  selectedDomain: 'all',
  schemaDescriptions: {},
  entityDescriptions: {},
  columnDescriptions: {},
  relationshipDescriptions: {},
  filterQuery: '',
  dirty: false,

  queryHistory: INITIAL_HISTORY,
  bookmarks: DEFAULT_BOOKMARKS,
  activity: [],
  tableStats: [],
  explainResult: null,
  loadingActivity: false,
  loadingStats: false,
  loadingExplain: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedSchemaName: (selectedSchemaName) => set({ selectedSchemaName, selectedEntityKey: null }),
  setSelectedDomain: (selectedDomain) => set({ selectedDomain }),
  setFilterQuery: (filterQuery) => set({ filterQuery }),

  load: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const model = await loadDatabaseDesignModel();

      const schemaDescriptions: Record<string, string> = {};
      const entityDescriptions: Record<string, string> = {};
      const columnDescriptions: Record<string, string> = {};
      const relationshipDescriptions: Record<string, string> = {};

      model.schemas.forEach((schema) => {
        schemaDescriptions[schema.schemaName] = schema.description || '';
        schema.entities.forEach((entity) => {
          entityDescriptions[entityKey(schema.schemaName, entity.kind, entity.name)] =
            entity.description || '';
          entity.columns.forEach((column) => {
            columnDescriptions[columnKey(schema.schemaName, entity.kind, entity.name, column.name)] =
              column.description || '';
          });
        });
      });

      model.relationships.forEach((relationship) => {
        relationshipDescriptions[relationship.id] = relationship.description || '';
      });

      set({
        loaded: true,
        loading: false,
        model,
        error: null,
        schemaDescriptions,
        entityDescriptions,
        columnDescriptions,
        relationshipDescriptions,
        dirty: false,
        selectedSchemaName: get().selectedSchemaName || model.schemas[0]?.schemaName || 'BT_BASE',
        focusedEntityKey: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  selectEntity: (schemaName, kind, entityName) =>
    set({
      selectedSchemaName: schemaName,
      selectedEntityKey: entityKey(schemaName, kind, entityName),
      selectedRelationshipId: null,
    }),

  selectRelationship: (relationshipId) => set({ selectedRelationshipId: relationshipId }),

  setFocusedEntity: (schemaName, kind, entityName) =>
    set({
      focusedEntityKey: entityKey(schemaName, kind, entityName),
      selectedSchemaName: schemaName,
      selectedEntityKey: entityKey(schemaName, kind, entityName),
    }),

  clearFocusedEntity: () => set({ focusedEntityKey: null }),

  updateSchemaDescription: (schemaName, value) =>
    set((state) => {
      const schemaDescriptions = { ...state.schemaDescriptions, [schemaName]: value };
      const schemas = state.model.schemas.map((s) =>
        s.schemaName === schemaName ? { ...s, description: value } : s,
      );
      return {
        schemaDescriptions,
        model: { ...state.model, schemas },
        dirty: true,
      };
    }),

  updateEntityDescription: (schemaName, kind, entityName, value) =>
    set((state) => {
      const key = entityKey(schemaName, kind, entityName);
      const entityDescriptions = { ...state.entityDescriptions, [key]: value };
      const schemas = state.model.schemas.map((s) => {
        if (s.schemaName !== schemaName) return s;
        return {
          ...s,
          entities: s.entities.map((e) =>
            e.name === entityName && e.kind === kind ? { ...e, description: value } : e,
          ),
        };
      });
      return {
        entityDescriptions,
        model: { ...state.model, schemas },
        dirty: true,
      };
    }),

  updateColumnDescription: (schemaName, kind, entityName, columnName, value) =>
    set((state) => {
      const key = columnKey(schemaName, kind, entityName, columnName);
      const columnDescriptions = { ...state.columnDescriptions, [key]: value };
      const schemas = state.model.schemas.map((s) => {
        if (s.schemaName !== schemaName) return s;
        return {
          ...s,
          entities: s.entities.map((e) => {
            if (e.name !== entityName || e.kind !== kind) return e;
            return {
              ...e,
              columns: e.columns.map((c) => (c.name === columnName ? { ...c, description: value } : c)),
            };
          }),
        };
      });
      return {
        columnDescriptions,
        model: { ...state.model, schemas },
        dirty: true,
      };
    }),

  updateRelationshipDescription: (relationshipId, value) =>
    set((state) => {
      const relationshipDescriptions = {
        ...state.relationshipDescriptions,
        [relationshipId]: value,
      };
      const relationships = state.model.relationships.map((r) =>
        r.id === relationshipId ? { ...r, description: value } : r,
      );
      return {
        relationshipDescriptions,
        model: { ...state.model, relationships },
        dirty: true,
      };
    }),

  save: async () => {
    const { schemaDescriptions, entityDescriptions, columnDescriptions, relationshipDescriptions } =
      get();
    set({ saving: true });
    try {
      const ok = await saveDatabaseMetadata({
        schemaDescriptions,
        entityDescriptions,
        columnDescriptions,
        relationshipDescriptions,
      });
      if (ok) {
        set({ dirty: false });
      }
      return ok;
    } finally {
      set({ saving: false });
    }
  },

  addHistoryItem: (item) => {
    const newItem: QueryHistoryItem = {
      ...item,
      id: 'hist-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      queryHistory: [newItem, ...state.queryHistory].slice(0, 50),
    }));
  },

  saveBookmark: (bookmark) => {
    const newBm: QueryBookmark = {
      ...bookmark,
      id: 'bm-' + Math.random().toString(36).substring(2, 9),
    };
    set((state) => ({
      bookmarks: [newBm, ...state.bookmarks],
    }));
  },

  deleteBookmark: (id) => {
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    }));
  },

  loadActivity: async () => {
    set({ loadingActivity: true });
    try {
      const activity = await fetchDatabaseActivity();
      set({ activity, loadingActivity: false });
    } catch {
      set({ loadingActivity: false });
    }
  },

  loadTableStats: async () => {
    set({ loadingStats: true });
    try {
      const tableStats = await fetchTableStats();
      set({ tableStats, loadingStats: false });
    } catch {
      set({ loadingStats: false });
    }
  },

  runExplain: async (sql, analyze) => {
    set({ loadingExplain: true });
    try {
      const result = await explainPostgresSql(sql, analyze);
      set({ explainResult: result, loadingExplain: false });
      return result;
    } catch (e: any) {
      set({ loadingExplain: false });
      throw e;
    }
  },

  clearExplainResult: () => set({ explainResult: null }),
}));
