import React, { useState } from 'react';
import {
  FileCode2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  Layers,
  Search,
  BookOpen,
  Link,
} from 'lucide-react';

interface SchemaToolboxCategory {
  id: string;
  name: string;
  items: Array<{
    id: string;
    label: string;
    type: string;
    description: string;
    icon: React.ReactNode;
    defaultAst: any;
  }>;
}

const TOOLBOX_CATEGORIES: SchemaToolboxCategory[] = [
  {
    id: 'primitives',
    name: 'Primitive Types',
    items: [
      {
        id: 'type-string',
        label: 'String',
        type: 'string',
        description: 'Text string value',
        icon: <Type className="w-4 h-4 text-primary" />,
        defaultAst: { type: 'string' },
      },
      {
        id: 'type-number',
        label: 'Number (Float)',
        type: 'number',
        description: 'Floating-point number',
        icon: <Hash className="w-4 h-4 text-primary" />,
        defaultAst: { type: 'number' },
      },
      {
        id: 'type-integer',
        label: 'Integer',
        type: 'integer',
        description: 'Whole integral number',
        icon: <Hash className="w-4 h-4 text-primary" />,
        defaultAst: { type: 'integer' },
      },
      {
        id: 'type-boolean',
        label: 'Boolean',
        type: 'boolean',
        description: 'True / False boolean toggle',
        icon: <ToggleLeft className="w-4 h-4 text-primary" />,
        defaultAst: { type: 'boolean' },
      },
      {
        id: 'type-null',
        label: 'Null',
        type: 'null',
        description: 'Explicit null value',
        icon: <Type className="w-4 h-4 text-primary" />,
        defaultAst: { type: 'null' },
      },
    ],
  },
  {
    id: 'complex',
    name: 'Complex Structures',
    items: [
      {
        id: 'type-object',
        label: 'Object',
        type: 'object',
        description: 'Key-value properties map',
        icon: <Layers className="w-4 h-4 text-cyan-500" />,
        defaultAst: { type: 'object', properties: {}, required: [] },
      },
      {
        id: 'type-array',
        label: 'Array (List)',
        type: 'array',
        description: 'Ordered sequence of items',
        icon: <Layers className="w-4 h-4 text-cyan-500" />,
        defaultAst: { type: 'array', items: { type: 'string' } },
      },
      {
        id: 'type-enum',
        label: 'Enum (Choices)',
        type: 'enum',
        description: 'Restricted enumeration set',
        icon: <BookOpen className="w-4 h-4 text-cyan-500" />,
        defaultAst: { type: 'string', enum: ['option1', 'option2'] },
      },
    ],
  },
  {
    id: 'polymorphism',
    name: 'Polymorphism & Logic',
    items: [
      {
        id: 'type-allof',
        label: 'allOf (Intersection)',
        type: 'allOf',
        description: 'Must match ALL subschemas',
        icon: <Layers className="w-4 h-4 text-amber-500" />,
        defaultAst: { allOf: [] },
      },
      {
        id: 'type-anyof',
        label: 'anyOf (Union)',
        type: 'anyOf',
        description: 'Must match AT LEAST ONE subschema',
        icon: <Layers className="w-4 h-4 text-amber-500" />,
        defaultAst: { anyOf: [] },
      },
      {
        id: 'type-oneof',
        label: 'oneOf (Exclusive)',
        type: 'oneOf',
        description: 'Must match EXACTLY ONE subschema',
        icon: <Layers className="w-4 h-4 text-amber-500" />,
        defaultAst: { oneOf: [] },
      },
    ],
  },
  {
    id: 'formats',
    name: 'String Formats',
    items: [
      {
        id: 'fmt-uuid',
        label: 'UUID (RFC 4122)',
        type: 'string:uuid',
        description: 'Universally unique identifier',
        icon: <Type className="w-4 h-4 text-purple-500" />,
        defaultAst: { type: 'string', format: 'uuid' },
      },
      {
        id: 'fmt-datetime',
        label: 'date-time (ISO 8601)',
        type: 'string:date-time',
        description: 'Timestamp representation',
        icon: <Calendar className="w-4 h-4 text-purple-500" />,
        defaultAst: { type: 'string', format: 'date-time' },
      },
      {
        id: 'fmt-email',
        label: 'email',
        type: 'string:email',
        description: 'RFC 5322 email address',
        icon: <Type className="w-4 h-4 text-purple-500" />,
        defaultAst: { type: 'string', format: 'email' },
      },
      {
        id: 'fmt-uri',
        label: 'URI / URL',
        type: 'string:uri',
        description: 'Uniform Resource Identifier',
        icon: <Link className="w-4 h-4 text-purple-500" />,
        defaultAst: { type: 'string', format: 'uri' },
      },
    ],
  },
  {
    id: 'definitions',
    name: 'Reusability ($defs)',
    items: [
      {
        id: 'def-ref',
        label: '$ref Pointer',
        type: '$ref',
        description: 'Reference a reusable $defs component',
        icon: <Link className="w-4 h-4 text-emerald-500" />,
        defaultAst: { $ref: '#/$defs/Component' },
      },
    ],
  },
];

export const SchemaToolboxPanel: React.FC = () => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    primitives: true,
    complex: true,
    polymorphism: true,
    formats: false,
    definitions: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragStart = (e: React.DragEvent, item: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-card text-foreground select-none">
      {/* Header */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Schema Components
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Draft 2020-12
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search primitives & formats..."
            className="w-full bg-background border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
          />
        </div>
      </div>

      {/* Concertina Categories */}
      <div className="flex-1 overflow-y-auto divide-y divide-border p-2 space-y-1.5">
        {TOOLBOX_CATEGORIES.map((cat) => {
          const isOpen = openCategories[cat.id] ?? false;
          const filteredItems = cat.items.filter(
            (it) =>
              it.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              it.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              it.type.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredItems.length === 0 && searchQuery) return null;

          return (
            <div key={cat.id} className="rounded-xl overflow-hidden bg-background/50 border border-border">
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground hover:text-primary hover:bg-muted transition"
              >
                <div className="flex items-center gap-2">
                  <span>{cat.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-muted text-muted-foreground rounded-full">
                    {filteredItems.length}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>

              {isOpen && (
                <div className="p-1.5 space-y-1 bg-card/60">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="group flex items-center justify-between p-2 rounded-xl bg-card hover:bg-muted border border-border hover:border-primary/50 cursor-grab active:cursor-grabbing transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="w-3 h-3 text-muted-foreground/60 group-hover:text-muted-foreground" />
                        <div className="p-1 rounded-lg bg-primary/10 text-primary">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground group-hover:text-primary truncate">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 bg-background text-primary rounded-md border border-border">
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
