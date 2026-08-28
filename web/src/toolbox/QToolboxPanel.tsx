import React, { useState } from 'react';
import {
  Type,
  AlignLeft,
  CheckCircle,
  CheckSquare,
  Star,
  Calendar,
  Upload,
  Layers,
  Search,
  Plus,
  GripVertical,
  HelpCircle,
  Sliders,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  Sparkles,
  Hash,
  Mail,
  PenTool,
  GitBranch,
} from 'lucide-react';

export interface QComponentDef {
  id: string;
  type: string;
  label: string;
  category: 'input' | 'choice' | 'rating' | 'media' | 'structure';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  defaultProps: Record<string, any>;
}

export interface QSectionDef {
  id: string;
  title: string;
  category: 'input' | 'choice' | 'rating' | 'media' | 'structure';
  components: QComponentDef[];
}

export const Q_SECTIONS: QSectionDef[] = [
  {
    id: 'sec-inputs',
    title: 'Inputs & Text',
    category: 'input',
    components: [
      {
        id: 'q-text',
        type: 'text',
        label: 'Single Line Text',
        category: 'input',
        description: 'Short alphanumeric response (e.g. Name, VIN, Plate)',
        icon: Type,
        color: 'text-primary border-primary/40 bg-primary/10',
        defaultProps: { placeholder: 'Enter your answer...' },
      },
      {
        id: 'q-textarea',
        type: 'textarea',
        label: 'Long Text / Remarks',
        category: 'input',
        description: 'Multiline paragraph text for incident remarks',
        icon: AlignLeft,
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
        defaultProps: { rows: 3, placeholder: 'Enter detailed remarks...' },
      },
      {
        id: 'q-number',
        type: 'number',
        label: 'Number / Quantity',
        category: 'input',
        description: 'Numeric input with min/max validation (e.g. Odometer)',
        icon: Hash,
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
        defaultProps: { min: 0, max: 999999, placeholder: '0' },
      },
      {
        id: 'q-email',
        type: 'email',
        label: 'Email & Contact',
        category: 'input',
        description: 'Formatted email address or phone contact',
        icon: Mail,
        color: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
        defaultProps: { placeholder: 'driver@fleet.com' },
      },
    ],
  },
  {
    id: 'sec-choices',
    title: 'Choice & Selection',
    category: 'choice',
    components: [
      {
        id: 'q-single-choice',
        type: 'single_choice',
        label: 'Single Choice (Radio)',
        category: 'choice',
        description: 'Mutually exclusive single option selection',
        icon: CheckCircle,
        color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
        defaultProps: {
          options: [
            { id: 'opt-1', label: 'Option A', value: 'opt_a' },
            { id: 'opt-2', label: 'Option B', value: 'opt_b' },
          ],
        },
      },
      {
        id: 'q-multiple-choice',
        type: 'multiple_choice',
        label: 'Multiple Choice (Checkbox)',
        category: 'choice',
        description: 'Select one or more items from a checklist',
        icon: CheckSquare,
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
        defaultProps: {
          options: [
            { id: 'chk-1', label: 'Safety Item 1', value: 'item_1' },
            { id: 'chk-2', label: 'Safety Item 2', value: 'item_2' },
          ],
        },
      },
      {
        id: 'q-dropdown',
        type: 'dropdown',
        label: 'Dropdown Selector',
        category: 'choice',
        description: 'Compact single selection list from reference data',
        icon: Sliders,
        color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
        defaultProps: {
          options: [
            { id: 'd-1', label: 'Option 1', value: 'opt_1' },
            { id: 'd-2', label: 'Option 2', value: 'opt_2' },
          ],
        },
      },
    ],
  },
  {
    id: 'sec-ratings',
    title: 'Rating & Scales',
    category: 'rating',
    components: [
      {
        id: 'q-rating',
        type: 'rating',
        label: 'Likert Rating Scale',
        category: 'rating',
        description: '1 to 5 or 1 to 10 discrete score evaluation',
        icon: Star,
        color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
        defaultProps: { maxRating: 5, lowLabel: 'Defective', highLabel: 'Optimal' },
      },
      {
        id: 'q-nps',
        type: 'nps',
        label: 'Net Promoter Score (NPS 0-10)',
        category: 'rating',
        description: 'Standard 0-10 scale for sentiment and satisfaction audits',
        icon: Sparkles,
        color: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
        defaultProps: { min: 0, max: 10 },
      },
    ],
  },
  {
    id: 'sec-media',
    title: 'Date & Media',
    category: 'media',
    components: [
      {
        id: 'q-date',
        type: 'date',
        label: 'Date & Time',
        category: 'media',
        description: 'Timestamp or calendar selection',
        icon: Calendar,
        color: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
        defaultProps: { includeTime: false },
      },
      {
        id: 'q-file',
        type: 'file_upload',
        label: 'File & Image Upload',
        category: 'media',
        description: 'Attach photo evidence, logs, or diagnostic PDF',
        icon: Upload,
        color: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
        defaultProps: { allowedExtensions: ['.jpg', '.png', '.pdf', '.json'] },
      },
      {
        id: 'q-signature',
        type: 'signature',
        label: 'Digital Signature Pad',
        category: 'media',
        description: 'Driver or inspector sign-off certification',
        icon: PenTool,
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
        defaultProps: { required: true },
      },
    ],
  },
  {
    id: 'sec-structure',
    title: 'Structure & Flow',
    category: 'structure',
    components: [
      {
        id: 'q-section',
        type: 'section_break',
        label: 'Section Container',
        category: 'structure',
        description: 'Group questions into a distinct logical block',
        icon: Layers,
        color: 'text-foreground border-border bg-card/60',
        defaultProps: { title: 'New Question Section', description: 'Section guidelines' },
      },
      {
        id: 'q-logic',
        type: 'logic_jump',
        label: 'Conditional Logic Jump',
        category: 'structure',
        description: 'Branch to specific page based on answer condition',
        icon: GitBranch,
        color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
        defaultProps: { condition: 'equals', targetPage: 'next' },
      },
    ],
  },
];

interface QToolboxPanelProps {
  searchQuery?: string;
  onSelectComponent?: (comp: QComponentDef) => void;
}

export const QToolboxPanel: React.FC<QToolboxPanelProps> = ({
  searchQuery: externalSearchQuery = '',
  onSelectComponent,
}) => {
  const [internalSearch, setInternalSearch] = useState<string>('');
  // Concertina state: only one expanded section at a time, or null if all collapsed
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('sec-inputs');

  const query = externalSearchQuery || internalSearch;

  const handleToggleSection = (sectionId: string) => {
    setExpandedSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  const handleCollapseAll = () => {
    setExpandedSectionId(null);
  };

  const handleDragStart = (e: React.DragEvent, comp: QComponentDef) => {
    e.dataTransfer.setData('application/json', JSON.stringify(comp));
    e.dataTransfer.setData('text/plain', comp.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full space-y-3 select-none">
      {/* ── 1. Search Bar & Collapse All Control ── */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questionnaire items..."
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold">
            Components ({Q_SECTIONS.reduce((acc, s) => acc + s.components.length, 0)})
          </span>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="text-[10px] font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer transition-colors"
            title="Collapse all sections"
          >
            <ChevronsDownUp className="w-3 h-3" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* ── 2. Concertina Accordion Hierarchy ── */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[calc(100vh-250px)]">
        {Q_SECTIONS.map((sec) => {
          const isExpanded = expandedSectionId === sec.id || query.trim().length > 0;
          const filteredComponents = sec.components.filter((c) => {
            if (!query.trim()) return true;
            const q = query.toLowerCase();
            return (
              c.label.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q) ||
              c.type.toLowerCase().includes(q)
            );
          });

          if (query.trim() && filteredComponents.length === 0) return null;

          return (
            <div
              key={sec.id}
              className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs transition-all"
            >
              {/* Concertina Section Header */}
              <button
                type="button"
                onClick={() => handleToggleSection(sec.id)}
                className="w-full p-2.5 bg-muted/40 hover:bg-muted/70 flex items-center justify-between border-b border-border/50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="font-bold text-xs text-foreground">{sec.title}</span>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground bg-background px-1.5 py-0.2 rounded border border-border">
                  {filteredComponents.length}
                </span>
              </button>

              {/* Concertina Section Body */}
              {isExpanded && (
                <div className="p-2 space-y-1.5 bg-card/60 animate-in fade-in-50 duration-150">
                  {filteredComponents.map((comp) => {
                    const Icon = comp.icon;
                    return (
                      <div
                        key={comp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, comp)}
                        onClick={() => onSelectComponent?.(comp)}
                        className="p-2 bg-background border border-border/70 hover:border-primary/60 rounded-xl flex items-center justify-between gap-2 group transition-all cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-xs"
                        title="Drag onto questionnaire canvas or click to add"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0" />
                          <div
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center ${comp.color} shrink-0`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-foreground truncate">
                              {comp.label}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {comp.description}
                            </div>
                          </div>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QToolboxPanel;
