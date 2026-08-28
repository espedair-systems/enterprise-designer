import React, { useState } from 'react';
import {
  Globe,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Shield,
  Search,
  Zap,
} from 'lucide-react';

interface OpenAPICategory {
  id: string;
  name: string;
  items: Array<{
    id: string;
    label: string;
    method?: string;
    type: string;
    description: string;
    color: string;
  }>;
}

const OPENAPI_CATEGORIES: OpenAPICategory[] = [
  {
    id: 'operations',
    name: 'HTTP Operations',
    items: [
      {
        id: 'op-get',
        label: 'GET Request',
        method: 'GET',
        type: 'operation:get',
        description: 'Retrieve resource representation',
        color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      },
      {
        id: 'op-post',
        label: 'POST Request',
        method: 'POST',
        type: 'operation:post',
        description: 'Create new resource or dispatch action',
        color: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      },
      {
        id: 'op-put',
        label: 'PUT Request',
        method: 'PUT',
        type: 'operation:put',
        description: 'Replace complete resource payload',
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      },
      {
        id: 'op-patch',
        label: 'PATCH Request',
        method: 'PATCH',
        type: 'operation:patch',
        description: 'Partial resource update',
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      },
      {
        id: 'op-delete',
        label: 'DELETE Request',
        method: 'DELETE',
        type: 'operation:delete',
        description: 'Remove resource permanently',
        color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      },
    ],
  },
  {
    id: 'parameters',
    name: 'Parameters',
    items: [
      {
        id: 'param-path',
        label: 'Path Parameter',
        type: 'param:path',
        description: 'URL segment /items/{id}',
        color: 'bg-primary/10 text-primary border-primary/20',
      },
      {
        id: 'param-query',
        label: 'Query Parameter',
        type: 'param:query',
        description: 'Filter parameter ?limit=10',
        color: 'bg-primary/10 text-primary border-primary/20',
      },
      {
        id: 'param-header',
        label: 'Header Parameter',
        type: 'param:header',
        description: 'HTTP header like X-Tenant-Id',
        color: 'bg-primary/10 text-primary border-primary/20',
      },
    ],
  },
  {
    id: 'responses',
    name: 'Responses & Statuses',
    items: [
      {
        id: 'res-200',
        label: '200 OK',
        type: 'response:200',
        description: 'Successful retrieval response',
        color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      },
      {
        id: 'res-201',
        label: '201 Created',
        type: 'response:201',
        description: 'Resource successfully created',
        color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      },
      {
        id: 'res-400',
        label: '400 Bad Request',
        type: 'response:400',
        description: 'Invalid client payload schema',
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      },
      {
        id: 'res-401',
        label: '401 Unauthorized',
        type: 'response:401',
        description: 'Missing or expired authentication',
        color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      },
      {
        id: 'res-500',
        label: '500 Server Error',
        type: 'response:500',
        description: 'Internal backend exception',
        color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      },
    ],
  },
  {
    id: 'security',
    name: 'Security Schemes',
    items: [
      {
        id: 'sec-bearer',
        label: 'Bearer JWT',
        type: 'security:bearer',
        description: 'Authorization: Bearer <token>',
        color: 'bg-primary/10 text-primary border-primary/20',
      },
      {
        id: 'sec-apikey',
        label: 'API Key Header',
        type: 'security:apikey',
        description: 'Header X-API-Key',
        color: 'bg-primary/10 text-primary border-primary/20',
      },
      {
        id: 'sec-oauth2',
        label: 'OAuth 2.0 Flow',
        type: 'security:oauth2',
        description: 'Authorization Code / Client Credentials',
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      },
    ],
  },
];

export const OpenAPIToolboxPanel: React.FC = () => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    operations: true,
    parameters: true,
    responses: false,
    security: true,
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
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              OpenAPI Components
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            OAS 3.1.0
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operations, parameters & codes..."
            className="w-full bg-background border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
          />
        </div>
      </div>

      {/* Concertina Categories */}
      <div className="flex-1 overflow-y-auto divide-y divide-border p-2 space-y-1.5">
        {OPENAPI_CATEGORIES.map((cat) => {
          const isOpen = openCategories[cat.id] ?? false;
          const filteredItems = cat.items.filter(
            (it) =>
              it.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              it.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (it.method && it.method.toLowerCase().includes(searchQuery.toLowerCase()))
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
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground group-hover:text-primary truncate">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <span className={`ml-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${item.color}`}>
                        {item.method || item.type.split(':')[1]}
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
