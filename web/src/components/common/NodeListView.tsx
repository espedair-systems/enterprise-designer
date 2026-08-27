import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Grid, List, ArrowUpDown, ChevronRight, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BaseEntityItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  tags?: string[];
  attributes?: Record<string, string | number | boolean>;
  updatedAt?: string;
}

interface NodeListViewProps<T extends BaseEntityItem> {
  title: string;
  subtitle?: string;
  items: T[];
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  onSelectItem?: (item: T) => void;
  onCreateItem?: () => void;
  createLabel?: string;
  categories?: string[];
  statuses?: string[];
}

export function NodeListView<T extends BaseEntityItem>({
  title,
  subtitle,
  items,
  icon: Icon,
  iconColor = 'text-primary',
  onSelectItem,
  onCreateItem,
  createLabel = 'Create New',
  categories = [],
  statuses = [],
}: NodeListViewProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortOrder, setSortOrder] = useState<'name-asc' | 'name-desc' | 'id'>('name-asc');

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.tags && i.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((i) => i.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((i) => i.status === selectedStatus);
    }

    result.sort((a, b) => {
      if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
      return a.id.localeCompare(b.id);
    });

    return result;
  }, [items, searchQuery, selectedCategory, selectedStatus, sortOrder]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Icon className={cn('w-7 h-7', iconColor)} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onCreateItem && (
            <button
              onClick={onCreateItem}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{createLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border min-w-[260px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search across ${items.length} records...`}
            className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground font-medium outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {statuses.length > 0 && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground font-medium outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() =>
              setSortOrder((prev) => (prev === 'name-asc' ? 'name-desc' : 'name-asc'))
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground font-semibold hover:bg-muted/80 transition"
            title="Toggle sort"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{sortOrder === 'name-asc' ? 'A → Z' : 'Z → A'}</span>
          </button>

          <div className="flex items-center rounded-xl bg-muted p-0.5 border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition',
                viewMode === 'grid' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg transition',
                viewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content View */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <p className="text-sm font-semibold text-muted-foreground">No matching items found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try refining your search query or filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem?.(item)}
              className="bg-card hover:bg-muted/40 border border-border hover:border-primary/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                    {item.id}
                  </span>
                  {item.status && (
                    <span className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5 bg-muted rounded-md border border-border">
                      {item.status}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{item.category || 'General'}</span>
                <span className="flex items-center gap-1 text-primary font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
              <tr>
                <th className="px-6 py-3 font-bold">ID</th>
                <th className="px-6 py-3 font-bold">Name</th>
                <th className="px-6 py-3 font-bold">Category</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectItem?.(item)}
                  className="hover:bg-muted/30 transition cursor-pointer"
                >
                  <td className="px-6 py-3.5 font-mono font-bold text-primary">{item.id}</td>
                  <td className="px-6 py-3.5 font-semibold text-foreground">{item.name}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{item.category || '—'}</td>
                  <td className="px-6 py-3.5">
                    {item.status ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-muted border border-border font-medium">
                        {item.status}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem?.(item);
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Inspect"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
