import React from 'react';
import {
  Save,
  Share2,
  Database as DatabaseIcon,
  Grid3x3,
  Columns,
  GitBranch,
  Code,
  Activity,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { useDatabaseStore } from '../../store/database';

interface RibbonButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

export function RibbonButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  disabled = false,
}: RibbonButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
        active
          ? 'bg-primary text-primary-foreground shadow-xs'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

export function RibbonDivider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

export function DatabaseRibbon() {
  const viewMode = useDatabaseStore((s) => s.viewMode);
  const setViewMode = useDatabaseStore((s) => s.setViewMode);
  const save = useDatabaseStore((s) => s.save);
  const saving = useDatabaseStore((s) => s.saving);
  const dirty = useDatabaseStore((s) => s.dirty);

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4 w-full shadow-xs text-foreground">
      <div className="flex items-center gap-1">
        <RibbonButton
          icon={Share2}
          label="ERD Diagram"
          active={viewMode === 'erd'}
          onClick={() => setViewMode('erd')}
        />
        <RibbonButton
          icon={DatabaseIcon}
          label="Schema"
          active={viewMode === 'schema'}
          onClick={() => setViewMode('schema')}
        />
        <RibbonButton
          icon={Grid3x3}
          label="Tables"
          active={viewMode === 'table'}
          onClick={() => setViewMode('table')}
        />
        <RibbonButton
          icon={Columns}
          label="Columns"
          active={viewMode === 'column'}
          onClick={() => setViewMode('column')}
        />
        <RibbonButton
          icon={GitBranch}
          label="Relationships"
          active={viewMode === 'relationship'}
          onClick={() => setViewMode('relationship')}
        />
        <RibbonButton
          icon={Code}
          label="SQL Console"
          active={viewMode === 'editor'}
          onClick={() => setViewMode('editor')}
        />
        <RibbonDivider />
        <RibbonButton
          icon={Activity}
          label="Activity"
          active={viewMode === 'activity'}
          onClick={() => setViewMode('activity')}
        />
        <RibbonButton
          icon={BarChart3}
          label="Table Stats"
          active={viewMode === 'stats'}
          onClick={() => setViewMode('stats')}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !dirty}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer',
            dirty
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-muted text-muted-foreground cursor-not-allowed border border-border',
          )}
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : dirty ? 'Save Metadata' : 'Saved'}</span>
        </button>
      </div>
    </div>
  );
}
