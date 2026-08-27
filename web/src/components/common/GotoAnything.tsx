import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Box, Workflow, Layers, Users, Activity, FileText, Database, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

export interface SearchableEntity {
  id: string;
  name: string;
  type: 'capability' | 'valuestream' | 'process' | 'organization' | 'strategy' | 'service';
  description?: string;
  category?: string;
  status?: string;
}

interface GotoAnythingProps {
  isOpen: boolean;
  onClose: () => void;
  customEntities?: SearchableEntity[];
}

export const GotoAnything: React.FC<GotoAnythingProps> = ({
  isOpen,
  onClose,
  customEntities = [],
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setActiveView, setAppMode, openModal } = useStore();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Default seed fact sheets for quick search if none passed
  const defaultEntities: SearchableEntity[] = useMemo(
    () => [
      {
        id: 'CAP-001',
        name: 'Enterprise Customer Relationship Management (CRM)',
        type: 'capability',
        category: 'Customer Facing',
        status: 'Strategic / Differentiating',
      },
      {
        id: 'CAP-002',
        name: 'Core Payment Gateway & Settlement Engine',
        type: 'capability',
        category: 'Financial Operations',
        status: 'Operational',
      },
      {
        id: 'VS-001',
        name: 'Quote to Cash (Q2C) Value Stream',
        type: 'valuestream',
        category: 'Core Revenue',
        status: 'Active',
      },
      {
        id: 'VS-002',
        name: 'Customer Onboarding & Verification (KYC)',
        type: 'valuestream',
        category: 'Compliance',
        status: 'Optimizing',
      },
      {
        id: 'PROC-001',
        name: 'Merchant Account Onboarding & Underwriting',
        type: 'process',
        category: 'Operations',
        status: 'Documented',
      },
      {
        id: 'ORG-001',
        name: 'Enterprise Architecture & Technology Strategy',
        type: 'organization',
        category: 'Governance',
        status: 'Active',
      },
    ],
    []
  );

  const allEntities = customEntities.length > 0 ? customEntities : defaultEntities;

  const filteredEntities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allEntities;
    return allEntities.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q))
    );
  }, [allEntities, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredEntities.length]);

  const selectEntity = (entity: SearchableEntity) => {
    onClose();
    if (entity.type === 'capability') {
      setAppMode('architect');
      setActiveView('arch-capabilities');
      openModal('capability', entity);
    } else if (entity.type === 'valuestream') {
      setAppMode('architect');
      setActiveView('arch-valuestreams');
      openModal('valuestream', entity);
    } else if (entity.type === 'process') {
      setAppMode('ba');
      setActiveView('ba-processes');
      openModal('process', entity);
    } else if (entity.type === 'organization') {
      setAppMode('hr');
      setActiveView('hr-organization');
    }
  };

  const getEntityIcon = (type: SearchableEntity['type']) => {
    switch (type) {
      case 'capability':
        return Box;
      case 'valuestream':
        return Workflow;
      case 'process':
        return Layers;
      case 'organization':
        return Users;
      case 'strategy':
        return Activity;
      default:
        return FileText;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx + 1) % Math.max(1, filteredEntities.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx - 1 + filteredEntities.length) % Math.max(1, filteredEntities.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const ent = filteredEntities[selectedIndex];
      if (ent) selectEntity(ent);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/20">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Goto anything: Search capabilities, value streams, processes, teams... (Esc to exit)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <span className="text-xs text-muted-foreground font-mono">
            {filteredEntities.length} {filteredEntities.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredEntities.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No matching architecture entities found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredEntities.map((ent, idx) => {
              const Icon = getEntityIcon(ent.type);
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={ent.id}
                  onClick={() => selectEntity(ent)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground shadow-xs' : 'hover:bg-muted/70 text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'p-2 rounded-lg border shrink-0',
                        isSelected ? 'bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground' : 'bg-muted border-border text-primary'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">{ent.name}</span>
                        <span
                          className={cn(
                            'text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border',
                            isSelected
                              ? 'border-primary-foreground/30 text-primary-foreground'
                              : 'border-border bg-muted/60 text-muted-foreground'
                          )}
                        >
                          {ent.id}
                        </span>
                      </div>
                      {ent.category && (
                        <p
                          className={cn(
                            'text-[11px] truncate mt-0.5',
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          )}
                        >
                          {ent.category} • {ent.status || ent.type}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform',
                      isSelected ? 'text-primary-foreground translate-x-1' : 'text-muted-foreground/40'
                    )}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-muted/10 text-[11px] font-mono text-muted-foreground">
          <span>Navigate: <kbd className="px-1 bg-muted rounded">↑</kbd> <kbd className="px-1 bg-muted rounded">↓</kbd></span>
          <span>Select: <kbd className="px-1 bg-muted rounded">↵</kbd></span>
          <span>Close: <kbd className="px-1 bg-muted rounded">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
