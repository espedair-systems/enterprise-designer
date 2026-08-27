import React from 'react';
import { useStore } from '../../store/useStore';
import { Download, X, FileJson, FileCode, FileSpreadsheet, FileText } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { modal, closeModal } = useStore();

  if (!modal.isOpen || modal.type !== 'export') return null;

  const handleDownload = (format: string) => {
    window.open(`/api/v1/export/${format}?workspace_id=ws-default`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />

      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border p-6 shadow-2xl space-y-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Export Architecture Models</h2>
              <p className="text-xs text-muted-foreground">Canonical Architecture, ArchiMate 3.2 & Spreadsheet formats</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => handleDownload('bizbok')}
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-all space-y-1.5 cursor-pointer shadow-xs"
          >
            <FileJson className="w-5 h-5 text-indigo-500" />
            <strong className="block text-foreground">Architecture JSON Model</strong>
            <p className="text-[11px] text-muted-foreground">Complete canonical architecture schema</p>
          </button>

          <button
            onClick={() => handleDownload('archimate')}
            className="p-4 rounded-xl bg-card border border-border hover:border-cyan-500/50 hover:bg-cyan-500/5 text-left transition-all space-y-1.5 cursor-pointer shadow-xs"
          >
            <FileCode className="w-5 h-5 text-cyan-500" />
            <strong className="block text-foreground">ArchiMate 3.2 XML</strong>
            <p className="text-[11px] text-muted-foreground">Open Group canonical exchange format</p>
          </button>

          <button
            onClick={() => handleDownload('csv')}
            className="p-4 rounded-xl bg-card border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 text-left transition-all space-y-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            <strong className="block text-foreground">Capabilities CSV</strong>
            <p className="text-[11px] text-muted-foreground">Spreadsheet table for maturity & PACE scoring</p>
          </button>

          <button
            onClick={() => handleDownload('bizbok')}
            className="p-4 rounded-xl bg-card border border-border hover:border-amber-500/50 hover:bg-amber-500/5 text-left transition-all space-y-1.5 cursor-pointer shadow-xs"
          >
            <FileText className="w-5 h-5 text-amber-500" />
            <strong className="block text-foreground">Executive Markdown</strong>
            <p className="text-[11px] text-muted-foreground">Executive strategy & program summary</p>
          </button>
        </div>
      </div>
    </div>
  );
};
