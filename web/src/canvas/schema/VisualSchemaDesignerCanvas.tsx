import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCode2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Save,
  CheckCircle2,
  Layers,
  Code2,
  Eye,
  Sliders,
  Settings2,
  Tag,
  ToggleLeft,
  ToggleRight,
  X,
  Copy,
  Download,
  Link,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';

export interface PropertyNode {
  id: string;
  key: string;
  type: string; // 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'enum' | '$ref';
  format?: string;
  required: boolean;
  description?: string;
  refTarget?: string;
  enumValues?: string[];
  children?: PropertyNode[];
  itemSchema?: PropertyNode;
  constraints?: {
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    pattern?: string;
  };
}

export const VisualSchemaDesignerCanvas: React.FC = () => {
  const [schemaTitle, setSchemaTitle] = useState('Enterprise Telematics Event Schema');
  const [schemaDialect, setSchemaDialect] = useState('draft-2020-12');
  const [schemaId, setSchemaId] = useState('schema-questionnaire-v2');
  const [viewMode, setViewMode] = useState<'visual_tree' | 'split' | 'raw_json'>('visual_tree');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Property Tree State
  const [properties, setProperties] = useState<PropertyNode[]>([
    {
      id: 'prop-1',
      key: 'event_id',
      type: 'string',
      format: 'uuid',
      required: true,
      description: 'Unique RFC 4122 telematics event tracking identifier',
    },
    {
      id: 'prop-2',
      key: 'vin',
      type: 'string',
      required: true,
      description: 'Vehicle Identification Number (17-character ISO 3779 standard)',
      constraints: { minLength: 17, maxLength: 17, pattern: '^[A-HJ-NPR-Z0-9]{17}$' },
    },
    {
      id: 'prop-3',
      key: 'odometer_km',
      type: 'number',
      required: true,
      description: 'Current verified odometer reading in kilometers',
      constraints: { minimum: 0, maximum: 2000000 },
    },
    {
      id: 'prop-4',
      key: 'status',
      type: 'enum',
      required: true,
      description: 'Vehicle operational readiness status',
      enumValues: ['operational', 'maintenance_required', 'grounded_critical'],
    },
    {
      id: 'prop-5',
      key: 'telemetry_packet',
      type: 'object',
      required: false,
      description: 'High-frequency GPS and CAN-bus telemetry payload',
      children: [
        {
          id: 'prop-5-1',
          key: 'latitude',
          type: 'number',
          required: true,
          description: 'WGS84 latitude coordinate (-90 to +90)',
          constraints: { minimum: -90, maximum: 90 },
        },
        {
          id: 'prop-5-2',
          key: 'longitude',
          type: 'number',
          required: true,
          description: 'WGS84 longitude coordinate (-180 to +180)',
          constraints: { minimum: -180, maximum: 180 },
        },
        {
          id: 'prop-5-3',
          key: 'battery_soc_pct',
          type: 'integer',
          required: false,
          description: 'Battery state-of-charge percentage (0 to 100%)',
          constraints: { minimum: 0, maximum: 100 },
        },
      ],
    },
    {
      id: 'prop-6',
      key: 'active_dtc_codes',
      type: 'array',
      required: false,
      description: 'List of active OBD-II Diagnostic Trouble Codes',
      itemSchema: {
        id: 'prop-6-item',
        key: 'dtc_code',
        type: 'string',
        format: 'dtc-standard',
        required: true,
        constraints: { pattern: '^[PCBU][0-9A-F]{4}$' },
      },
    },
  ]);

  const [selectedProp, setSelectedProp] = useState<PropertyNode | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Compile Properties Tree into Draft 2020-12 AST Schema
  const compiledSchema = useMemo(() => {
    const compileNode = (nodes: PropertyNode[]): any => {
      const propsObj: Record<string, any> = {};
      const requiredList: string[] = [];

      nodes.forEach((node) => {
        if (node.required) {
          requiredList.push(node.key);
        }

        if (node.type === 'object') {
          propsObj[node.key] = {
            type: 'object',
            description: node.description,
            ...compileNode(node.children || []),
          };
        } else if (node.type === 'array') {
          propsObj[node.key] = {
            type: 'array',
            description: node.description,
            items: node.itemSchema
              ? {
                  type: node.itemSchema.type === 'enum' ? 'string' : node.itemSchema.type,
                  format: node.itemSchema.format,
                  enum: node.itemSchema.enumValues,
                  ...(node.itemSchema.constraints || {}),
                }
              : { type: 'string' },
          };
        } else if (node.type === 'enum') {
          propsObj[node.key] = {
            type: 'string',
            enum: node.enumValues || [],
            description: node.description,
          };
        } else if (node.type === '$ref') {
          propsObj[node.key] = {
            $ref: node.refTarget || '#/$defs/Component',
            description: node.description,
          };
        } else {
          propsObj[node.key] = {
            type: node.type,
            format: node.format,
            description: node.description,
            ...(node.constraints || {}),
          };
        }
      });

      return {
        properties: propsObj,
        ...(requiredList.length > 0 ? { required: requiredList } : {}),
      };
    };

    return {
      $schema:
        schemaDialect === 'draft-2020-12'
          ? 'https://json-schema.org/draft/2020-12/schema'
          : 'http://json-schema.org/draft-07/schema#',
      title: schemaTitle,
      type: 'object',
      ...compileNode(properties),
    };
  }, [schemaTitle, schemaDialect, properties]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateSchema(schemaId, {
        title: schemaTitle,
        dialect: schemaDialect,
        raw_payload_json: compiledSchema,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save schema:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTopProperty = () => {
    const newProp: PropertyNode = {
      id: `prop-${Date.now()}`,
      key: `field_${properties.length + 1}`,
      type: 'string',
      required: false,
      description: '',
    };
    setProperties([...properties, newProp]);
  };

  const handleAddChildProperty = (parentId: string) => {
    const newChild: PropertyNode = {
      id: `prop-${Date.now()}`,
      key: 'child_field',
      type: 'string',
      required: false,
    };

    const updateChildren = (nodes: PropertyNode[]): PropertyNode[] => {
      return nodes.map((n) => {
        if (n.id === parentId) {
          return {
            ...n,
            children: [...(n.children || []), newChild],
          };
        }
        if (n.children) {
          return { ...n, children: updateChildren(n.children) };
        }
        return n;
      });
    };

    setProperties(updateChildren(properties));
  };

  const handleDeleteProperty = (id: string) => {
    const deleteFromList = (nodes: PropertyNode[]): PropertyNode[] => {
      return nodes
        .filter((n) => n.id !== id)
        .map((n) => (n.children ? { ...n, children: deleteFromList(n.children) } : n));
    };
    setProperties(deleteFromList(properties));
  };

  const handleUpdateNode = (updated: PropertyNode) => {
    const updateInList = (nodes: PropertyNode[]): PropertyNode[] => {
      return nodes.map((n) => {
        if (n.id === updated.id) return updated;
        if (n.children) return { ...n, children: updateInList(n.children) };
        return n;
      });
    };
    setProperties(updateInList(properties));
    setIsEditModalOpen(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.type) {
        const isFmt = data.type.includes(':');
        const rawType = isFmt ? data.type.split(':')[0] : data.type;
        const rawFmt = isFmt ? data.type.split(':')[1] : undefined;

        const newProp: PropertyNode = {
          id: `prop-${Date.now()}`,
          key: `${rawType}_field_${properties.length + 1}`,
          type: rawType,
          format: rawFmt,
          required: false,
          description: `Dropped ${data.label}`,
          children: rawType === 'object' ? [] : undefined,
        };
        setProperties([...properties, newProp]);
      }
    } catch (err) {
      console.error('Failed to parse dropped tool:', err);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col h-full bg-background text-foreground select-none overflow-hidden"
    >
      {/* Top Action Toolbar */}
      <div className="p-3 border-b border-border bg-card/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={schemaTitle}
              onChange={(e) => setSchemaTitle(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-border focus:border-primary text-sm font-bold text-foreground px-1 py-0.5 focus:outline-none transition"
            />
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {schemaDialect}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-background rounded-xl border border-border text-xs">
            <button
              onClick={() => setViewMode('visual_tree')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'visual_tree'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tree View</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'split'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('raw_json')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'raw_json'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON AST</span>
            </button>
          </div>

          <button
            onClick={handleAddTopProperty}
            className="flex items-center gap-1 px-3 py-1.5 bg-card hover:bg-muted text-foreground rounded-xl text-xs font-semibold border border-border transition"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>Add Property</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition"
          >
            {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Schema'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Interactive Visual Property Tree */}
        {(viewMode === 'visual_tree' || viewMode === 'split') && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2 border-r border-border bg-card/20">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <span>Property Key & Type</span>
              <span>Constraints & Options</span>
            </div>

            <div className="space-y-1.5">
              {properties.map((node) => (
                <PropertyRow
                  key={node.id}
                  node={node}
                  onAddChild={() => handleAddChildProperty(node.id)}
                  onEdit={() => {
                    setSelectedProp(node);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={() => handleDeleteProperty(node.id)}
                  onToggleRequired={(req) => {
                    handleUpdateNode({ ...node, required: req });
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleAddTopProperty}
              className="w-full py-2.5 border border-dashed border-border hover:border-primary/50 rounded-2xl text-xs font-medium text-muted-foreground hover:text-primary flex items-center justify-center gap-2 transition bg-card/40 hover:bg-card"
            >
              <Plus className="w-4 h-4" />
              <span>Add Root Schema Property</span>
            </button>
          </div>
        )}

        {/* Right / Center: Synchronized Live JSON AST Code View */}
        {(viewMode === 'raw_json' || viewMode === 'split') && (
          <div className="flex-1 overflow-auto bg-background p-4 font-mono text-xs flex flex-col">
            <div className="flex items-center justify-between mb-2 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
              <span>Synchronized Metaschema Output (Draft 2020-12)</span>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(compiledSchema, null, 2))}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
              >
                <Copy className="w-3 h-3" />
                <span>Copy JSON</span>
              </button>
            </div>
            <pre className="flex-1 bg-card/60 p-4 rounded-2xl border border-border text-emerald-500 overflow-auto font-mono text-xs leading-relaxed shadow-inner">
              {JSON.stringify(compiledSchema, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Centered Modal: Property Inspector & Constraints */}
      {isEditModalOpen && selectedProp && (
        <PropertyDetailModal
          node={selectedProp}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateNode}
        />
      )}
    </div>
  );
};

// Recursive Property Row Component
const PropertyRow: React.FC<{
  node: PropertyNode;
  level?: number;
  onAddChild: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleRequired: (req: boolean) => void;
}> = ({ node, level = 0, onAddChild, onEdit, onDelete, onToggleRequired }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-1">
      <div
        style={{ marginLeft: `${level * 20}px` }}
        className="group flex items-center justify-between p-2.5 rounded-2xl bg-card border border-border hover:border-primary/40 transition shadow-sm"
      >
        <div className="flex items-center gap-2 min-w-0">
          {node.type === 'object' ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground transition"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-3.5 h-3.5 flex items-center justify-center text-muted-foreground/60">•</div>
          )}

          <span className="font-mono text-xs font-bold text-foreground">{node.key}</span>

          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-background text-primary border border-border font-semibold">
            {node.type}
            {node.format ? ` (${node.format})` : ''}
          </span>

          {node.required && (
            <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.2 rounded border border-destructive/20">
              REQUIRED
            </span>
          )}

          {node.description && (
            <span className="text-[11px] text-muted-foreground truncate max-w-xs">{node.description}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleRequired(!node.required)}
            title={node.required ? 'Make Optional' : 'Make Required'}
            className="p-1 text-muted-foreground hover:text-foreground transition"
          >
            {node.required ? (
              <ToggleRight className="w-4 h-4 text-emerald-500" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {node.type === 'object' && (
            <button
              onClick={onAddChild}
              title="Add Child Property"
              className="p-1 rounded-lg bg-background hover:bg-muted text-foreground text-[10px] flex items-center gap-1 border border-border transition"
            >
              <Plus className="w-3 h-3 text-primary" />
              <span>Child</span>
            </button>
          )}

          <button
            onClick={onEdit}
            title="Edit Constraints & Details"
            className="p-1.5 rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDelete}
            title="Delete Property"
            className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render Nested Children for Objects */}
      {node.type === 'object' && isExpanded && node.children && (
        <div className="space-y-1 pl-2 border-l border-border ml-3">
          {node.children.map((child) => (
            <PropertyRow
              key={child.id}
              node={child}
              level={level + 1}
              onAddChild={() => {}}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleRequired={(req) => onToggleRequired(req)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Centered Modal: Property Inspector
const PropertyDetailModal: React.FC<{
  node: PropertyNode;
  onClose: () => void;
  onSave: (updated: PropertyNode) => void;
}> = ({ node, onClose, onSave }) => {
  const [key, setKey] = useState(node.key);
  const [type, setType] = useState(node.type);
  const [format, setFormat] = useState(node.format || '');
  const [required, setRequired] = useState(node.required);
  const [description, setDescription] = useState(node.description || '');
  const [minLength, setMinLength] = useState(node.constraints?.minLength?.toString() || '');
  const [maxLength, setMaxLength] = useState(node.constraints?.maxLength?.toString() || '');
  const [minimum, setMinimum] = useState(node.constraints?.minimum?.toString() || '');
  const [maximum, setMaximum] = useState(node.constraints?.maximum?.toString() || '');
  const [pattern, setPattern] = useState(node.constraints?.pattern || '');
  const [enumString, setEnumString] = useState((node.enumValues || []).join(', '));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PropertyNode = {
      ...node,
      key: key.trim(),
      type,
      format: format || undefined,
      required,
      description: description.trim(),
      enumValues:
        type === 'enum'
          ? enumString.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
      constraints: {
        minLength: minLength ? parseInt(minLength, 10) : undefined,
        maxLength: maxLength ? parseInt(maxLength, 10) : undefined,
        minimum: minimum ? parseFloat(minimum) : undefined,
        maximum: maximum ? parseFloat(maximum) : undefined,
        pattern: pattern || undefined,
      },
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Property Specification & Constraints</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-foreground font-medium mb-1">Property Key Name</label>
              <input
                type="text"
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-foreground focus:outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-foreground font-medium mb-1">Data Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary transition"
              >
                <option value="string">String</option>
                <option value="integer">Integer</option>
                <option value="number">Number / Float</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object</option>
                <option value="array">Array</option>
                <option value="enum">Enum Choice Set</option>
                <option value="$ref">$ref Pointer</option>
              </select>
            </div>
          </div>

          {type === 'string' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-foreground font-medium mb-1">String Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary transition"
                >
                  <option value="">None (Plain String)</option>
                  <option value="uuid">UUID (RFC 4122)</option>
                  <option value="date-time">Date-Time (ISO 8601)</option>
                  <option value="email">Email Address</option>
                  <option value="uri">URI / URL</option>
                </select>
              </div>
              <div>
                <label className="block text-foreground font-medium mb-1">Regex Pattern</label>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="e.g. ^[A-Z0-9]+$"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-foreground focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>
          )}

          {type === 'enum' && (
            <div>
              <label className="block text-foreground font-medium mb-1">Comma-Separated Enum Values</label>
              <input
                type="text"
                value={enumString}
                onChange={(e) => setEnumString(e.target.value)}
                placeholder="operational, maintenance, grounded"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-foreground focus:outline-none focus:border-primary transition"
              />
            </div>
          )}

          {(type === 'number' || type === 'integer') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-foreground font-medium mb-1">Minimum Value</label>
                <input
                  type="number"
                  value={minimum}
                  onChange={(e) => setMinimum(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-foreground font-medium mb-1">Maximum Value</label>
                <input
                  type="number"
                  value={maximum}
                  onChange={(e) => setMaximum(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-foreground font-medium mb-1">Description & Semantics</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain this property's business meaning..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg transition"
            >
              Apply Constraints
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
