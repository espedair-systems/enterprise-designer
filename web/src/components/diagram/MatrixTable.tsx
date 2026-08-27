import React, { useState, useMemo } from 'react';
import { Download, Check, AlertCircle, HelpCircle, Layers, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MatrixRowHeader {
  id: string;
  label: string;
  category?: string;
}

export interface MatrixColHeader {
  id: string;
  label: string;
  category?: string;
}

export interface MatrixCellData {
  rowId: string;
  colId: string;
  value?: string | number | boolean;
  status?: 'supported' | 'partial' | 'unsupported' | 'gap' | 'planned';
  notes?: string;
}

interface MatrixTableProps {
  title: string;
  subtitle?: string;
  rowLabel: string;
  colLabel: string;
  rows: MatrixRowHeader[];
  cols: MatrixColHeader[];
  cells: MatrixCellData[];
  onCellClick?: (cell: MatrixCellData | null, row: MatrixRowHeader, col: MatrixColHeader) => void;
  editable?: boolean;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({
  title,
  subtitle,
  rowLabel,
  colLabel,
  rows,
  cols,
  cells,
  onCellClick,
  editable = false,
}) => {
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);

  // Fast map for (rowId:colId) -> cell
  const cellMap = useMemo(() => {
    const m = new Map<string, MatrixCellData>();
    cells.forEach((c) => {
      m.set(`${c.rowId}:${c.colId}`, c);
    });
    return m;
  }, [cells]);

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'supported':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'partial':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'unsupported':
      case 'gap':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'planned':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default:
        return 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span>{title}</span>
          </h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground bg-card p-2 rounded-xl border border-border">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Check className="w-3 h-3" />
            <span>Supported</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3 h-3" />
            <span>Partial</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <HelpCircle className="w-3 h-3" />
            <span>Gap</span>
          </span>
        </div>
      </div>

      {/* 2D Matrix Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-mono text-[10px] text-muted-foreground">
              <th className="p-3.5 text-left border-r border-border font-bold uppercase min-w-[200px]">
                {rowLabel} ↓ \ {colLabel} →
              </th>
              {cols.map((col) => (
                <th key={col.id} className="p-3 border-r border-border font-bold uppercase min-w-[120px]">
                  <div className="truncate" title={col.label}>
                    {col.label}
                  </div>
                  {col.category && <span className="text-[9px] font-normal text-muted-foreground/60">{col.category}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/10 transition">
                <td className="p-3.5 text-left font-semibold text-xs text-foreground border-r border-border bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate" title={row.label}>{row.label}</span>
                    <span className="text-[9px] font-mono font-bold text-muted-foreground/70 px-1.5 py-0.2 rounded bg-muted">
                      {row.id}
                    </span>
                  </div>
                </td>
                {cols.map((col) => {
                  const key = `${row.id}:${col.id}`;
                  const cell = cellMap.get(key);
                  const isSelected = selectedCellKey === key;

                  return (
                    <td
                      key={col.id}
                      onClick={() => {
                        setSelectedCellKey(key);
                        onCellClick?.(cell || null, row, col);
                      }}
                      className={cn(
                        'p-2 border-r border-border transition cursor-pointer select-none',
                        isSelected ? 'ring-2 ring-primary ring-inset' : ''
                      )}
                    >
                      <div
                        className={cn(
                          'w-full py-2 px-1 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1 transition',
                          getStatusStyle(cell?.status)
                        )}
                      >
                        {cell?.status === 'supported' && <Check className="w-3.5 h-3.5" />}
                        {cell?.status === 'partial' && <AlertCircle className="w-3.5 h-3.5" />}
                        {cell?.status === 'gap' && <span className="text-[10px]">GAP</span>}
                        {cell?.status === 'planned' && <span className="text-[10px]">PLAN</span>}
                        {!cell?.status && <span className="text-muted-foreground/30">—</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
