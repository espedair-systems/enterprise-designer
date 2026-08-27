import React, { useState } from 'react';
import {
  Database,
  Table,
  Plus,
  Key,
  Link,
  FileCode,
  Sparkles,
  Layers,
  CheckCircle2,
  Trash2,
  X,
  Code2,
} from 'lucide-react';
import { api } from '../services/api';

export interface ERColumnDef {
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isNullable: boolean;
  defaultVal?: string;
  foreignKey?: string;
}

export interface ERTableDef {
  id: string;
  name: string;
  schema: string;
  description: string;
  x: number;
  y: number;
  columns: ERColumnDef[];
}

const INITIAL_TABLES: ERTableDef[] = [
  {
    id: 't-1',
    name: 'designer_workspaces',
    schema: 'DES_BASE',
    description: 'Multi-tenant workspaces',
    x: 40,
    y: 40,
    columns: [
      { name: 'id', dataType: 'VARCHAR(64)', isPrimaryKey: true, isNullable: false },
      { name: 'slug', dataType: 'VARCHAR(64)', isPrimaryKey: false, isNullable: false },
      { name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNullable: false },
      { name: 'created_at', dataType: 'TIMESTAMPTZ', isPrimaryKey: false, isNullable: false, defaultVal: 'NOW()' },
    ],
  },
  {
    id: 't-2',
    name: 'designer_apps',
    schema: 'DES_BASE',
    description: 'Scaffolded Studio and Agent applications',
    x: 420,
    y: 40,
    columns: [
      { name: 'id', dataType: 'VARCHAR(64)', isPrimaryKey: true, isNullable: false },
      { name: 'workspace_id', dataType: 'VARCHAR(64)', isPrimaryKey: false, isNullable: false, foreignKey: 'designer_workspaces.id' },
      { name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNullable: false },
      { name: 'slug', dataType: 'VARCHAR(64)', isPrimaryKey: false, isNullable: false },
      { name: 'app_type', dataType: 'VARCHAR(32)', isPrimaryKey: false, isNullable: false },
      { name: 'status', dataType: 'VARCHAR(32)', isPrimaryKey: false, isNullable: false, defaultVal: "'scaffolded'" },
    ],
  },
  {
    id: 't-3',
    name: 'designer_layouts',
    schema: 'DES_BASE',
    description: 'Dynamic 5-slot layout DSL',
    x: 420,
    y: 340,
    columns: [
      { name: 'id', dataType: 'VARCHAR(64)', isPrimaryKey: true, isNullable: false },
      { name: 'app_id', dataType: 'VARCHAR(64)', isPrimaryKey: false, isNullable: false, foreignKey: 'designer_apps.id' },
      { name: 'layout_version', dataType: 'VARCHAR(32)', isPrimaryKey: false, isNullable: false, defaultVal: "'1.0.0'" },
      { name: 'theme', dataType: 'VARCHAR(32)', isPrimaryKey: false, isNullable: false, defaultVal: "'dark_modern'" },
      { name: 'slots_json', dataType: 'JSONB', isPrimaryKey: false, isNullable: false, defaultVal: "'{}'::jsonb" },
    ],
  },
];

interface ERModelerCanvasProps {
  onOpenMigrationPlanner?: (tables: ERTableDef[], ddl: string) => void;
}

export const ERModelerCanvas: React.FC<ERModelerCanvasProps> = ({ onOpenMigrationPlanner }) => {
  const [tables, setTables] = useState<ERTableDef[]>(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<string | null>('t-2');
  const [ddlPreview, setDdlPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showAddTableModal, setShowAddTableModal] = useState<boolean>(false);
  const [newTableName, setNewTableName] = useState<string>('');
  const [newTableSchema, setNewTableSchema] = useState<string>('DES_BASE');

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const handleGenerateDDL = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateSchemaDiff({
        tables: tables.map((t) => ({
          name: t.name,
          schema: t.schema,
          description: t.description,
          columns: t.columns.map((c) => ({
            name: c.name,
            data_type: c.dataType,
            is_primary_key: c.isPrimaryKey,
            is_nullable: c.isNullable,
            default_val: c.defaultVal,
            foreign_key: c.foreignKey,
          })),
        })),
        dialect: 'postgres',
      });
      setDdlPreview(res.ddl_script);
    } catch (err) {
      console.error('Failed to generate schema diff:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    const newTbl: ERTableDef = {
      id: `t-${Date.now().toString().slice(-4)}`,
      name: newTableName.trim(),
      schema: newTableSchema.trim() || 'DES_BASE',
      description: 'Custom entity table',
      x: 100 + (tables.length % 3) * 60,
      y: 100 + Math.floor(tables.length / 3) * 80,
      columns: [
        { name: 'id', dataType: 'VARCHAR(64)', isPrimaryKey: true, isNullable: false },
        { name: 'created_at', dataType: 'TIMESTAMPTZ', isPrimaryKey: false, isNullable: false, defaultVal: 'NOW()' },
      ],
    };
    setTables([...tables, newTbl]);
    setSelectedTableId(newTbl.id);
    setNewTableName('');
    setShowAddTableModal(false);
  };

  const handleAddColumn = () => {
    if (!selectedTable) return;
    const colName = prompt('Enter new column name:');
    if (!colName) return;
    const colType = prompt('Enter SQL Data Type (e.g. VARCHAR(255), JSONB, INT, BOOLEAN):', 'VARCHAR(255)');
    if (!colType) return;

    const updated = tables.map((t) => {
      if (t.id === selectedTable.id) {
        return {
          ...t,
          columns: [
            ...t.columns,
            { name: colName.trim(), dataType: colType.trim(), isPrimaryKey: false, isNullable: true },
          ],
        };
      }
      return t;
    });
    setTables(updated);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="p-3 bg-card border-b border-border flex items-center justify-between z-10 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Designer Schematics ER Modeler</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
            PostgreSQL • Schema: DES_BASE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddTableModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-semibold border border-border transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Table</span>
          </button>

          <button
            type="button"
            onClick={handleAddColumn}
            disabled={!selectedTable}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 disabled:opacity-40 text-foreground rounded-lg text-xs font-semibold border border-border transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Column</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateDDL}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generating...' : 'Diff PostgreSQL DDL'}</span>
          </button>

          {onOpenMigrationPlanner && (
            <button
              type="button"
              onClick={() => onOpenMigrationPlanner(tables, ddlPreview || '')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plan Migration</span>
            </button>
          )}
        </div>
      </div>

      {/* ER Canvas Body */}
      <div className="flex-1 overflow-auto p-6 relative bg-background bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:20px_20px] min-w-[1200px] min-h-[800px]">
        {/* Render Table Cards */}
        {tables.map((table) => {
          const isSelected = selectedTableId === table.id;
          return (
            <div
              key={table.id}
              onClick={() => setSelectedTableId(table.id)}
              style={{
                position: 'absolute',
                left: `${table.x}px`,
                top: `${table.y}px`,
                width: '320px',
              }}
              className={`bg-card border rounded-xl shadow-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/40 shadow-primary/10 z-20'
                  : 'border-border hover:border-primary/50 z-10'
              }`}
            >
              {/* Card Header */}
              <div className="px-3 py-2 bg-primary/10 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-primary" />
                  <span className="font-mono text-xs font-bold text-foreground">{table.name}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-card text-muted-foreground border border-border">
                  {table.schema}
                </span>
              </div>

              {/* Columns List */}
              <div className="divide-y divide-border/60 text-xs">
                {table.columns.map((col) => (
                  <div key={col.name} className="px-3 py-1.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2">
                      {col.isPrimaryKey ? (
                        <span title="Primary Key"><Key className="w-3 h-3 text-amber-500 shrink-0" /></span>
                      ) : col.foreignKey ? (
                        <span title={`Foreign Key -> ${col.foreignKey}`}><Link className="w-3 h-3 text-primary shrink-0" /></span>
                      ) : (
                        <div className="w-3 h-3" />
                      )}
                      <span className={`font-mono text-[11px] ${col.isPrimaryKey ? 'font-bold text-foreground' : 'text-foreground/90'}`}>
                        {col.name}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-muted-foreground">{col.dataType}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* DDL Preview Bottom Panel */}
      {ddlPreview && (
        <div className="absolute bottom-4 left-4 right-4 max-h-56 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-4 z-30 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">PostgreSQL DDL Migration Diff Script</span>
            </div>
            <button
              type="button"
              onClick={() => setDdlPreview(null)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <pre className="mt-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 overflow-auto bg-background p-3 rounded-lg border border-border">
            {ddlPreview}
          </pre>
        </div>
      )}

      {/* Add Table Centered Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Add New Relational Table</h3>
              <button
                type="button"
                onClick={() => setShowAddTableModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Table Name</label>
                <input
                  type="text"
                  placeholder="e.g. designer_datasources"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Schema</label>
                <input
                  type="text"
                  value={newTableSchema}
                  onChange={(e) => setNewTableSchema(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTableModal(false)}
                className="px-3 py-1.5 bg-muted text-muted-foreground hover:text-foreground rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTable}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold shadow-xs"
              >
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
