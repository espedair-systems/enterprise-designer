import React, { useState } from 'react';
import { ShellSlotType, SlotToolAssignment } from './types';
import { Sidebar, Menu, PanelLeft, PanelRight, Layout, Terminal, Plus, Trash2, CheckCircle } from 'lucide-react';

interface SlotToolPlacerProps {
  assignments: SlotToolAssignment[];
  onUpdateAssignments: (assignments: SlotToolAssignment[]) => void;
}

const AVAILABLE_TOOLS = [
  { id: 'explorer', name: 'Model & Entity Explorer', icon: 'Folder', slots: ['rail', 'sidebar_left'] },
  { id: 'visual_canvas', name: 'Visual Low-Code Canvas', icon: 'Layout', slots: ['rail', 'canvas'] },
  { id: 'er_modeler', name: 'Schematics ER Diagram', icon: 'Database', slots: ['rail', 'canvas'] },
  { id: 'lineage_dag', name: 'Column-Level Lineage DAG', icon: 'GitMerge', slots: ['rail', 'canvas'] },
  { id: 'agent_graph', name: 'Agent Workflow Graph', icon: 'Bot', slots: ['rail', 'canvas'] },
  { id: 'prop_inspector', name: 'Property & Schema Inspector', icon: 'Sliders', slots: ['sidebar_right'] },
  { id: 'sql_terminal', name: 'Live SQL Query Terminal', icon: 'Terminal', slots: ['bottom_tray'] },
  { id: 'audit_log', name: 'Audit & Governance Ledger', icon: 'Shield', slots: ['bottom_tray'] },
  { id: 'git_sync', name: 'Git Environment Sync', icon: 'GitBranch', slots: ['menu_bar', 'rail'] }
];

export const SlotToolPlacer: React.FC<SlotToolPlacerProps> = ({ assignments, onUpdateAssignments }) => {
  const [selectedSlot, setSelectedSlot] = useState<ShellSlotType>('rail');

  const slotIcons: Record<ShellSlotType, React.ReactNode> = {
    rail: <Sidebar className="w-4 h-4" />,
    menu_bar: <Menu className="w-4 h-4" />,
    sidebar_left: <PanelLeft className="w-4 h-4" />,
    canvas: <Layout className="w-4 h-4" />,
    sidebar_right: <PanelRight className="w-4 h-4" />,
    bottom_tray: <Terminal className="w-4 h-4" />
  };

  const slotLabels: Record<ShellSlotType, string> = {
    rail: '1. Activity Rail (Left-most)',
    menu_bar: '2. Top Menu Bar (Header)',
    sidebar_left: '3. Primary Sidebar (Left)',
    canvas: '4. Multi-Mode Canvas (Center)',
    sidebar_right: '5. Property Inspector (Right)',
    bottom_tray: '6. Console Tray (Bottom)'
  };

  const currentSlotAssignments = assignments.filter((a) => a.slot === selectedSlot);

  const addToolToSlot = (tool: (typeof AVAILABLE_TOOLS)[0]) => {
    if (assignments.some((a) => a.slot === selectedSlot && a.toolId === tool.id)) return;
    const next = [
      ...assignments,
      {
        slot: selectedSlot,
        toolId: tool.id,
        toolName: tool.name,
        icon: tool.icon
      }
    ];
    onUpdateAssignments(next);
  };

  const removeToolFromSlot = (toolId: string) => {
    const next = assignments.filter((a) => !(a.slot === selectedSlot && a.toolId === toolId));
    onUpdateAssignments(next);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4 text-foreground shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
          <Layout className="w-4 h-4" /> Standard Shell Slot & Tool Placer
        </h3>
        <span className="text-xs text-muted-foreground">Map tools to layout regions</span>
      </div>

      {/* Slot Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {(Object.keys(slotLabels) as ShellSlotType[]).map((slot) => {
          const count = assignments.filter((a) => a.slot === slot).length;
          const isActive = selectedSlot === slot;
          return (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium border transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                  : 'bg-muted/60 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span className="flex items-center gap-2">
                {slotIcons[slot]}
                {slotLabels[slot].split(' ')[1]}
              </span>
              <span className="bg-background px-1.5 py-0.5 rounded text-[10px] text-foreground font-mono border border-border">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Active Slot Contents & Add Tools */}
      <div className="bg-muted/30 border border-border rounded-lg p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Active Tools in <span className="text-primary">{slotLabels[selectedSlot]}</span>:
          </span>
          <span className="text-[11px] text-muted-foreground">{currentSlotAssignments.length} assigned</span>
        </div>

        {currentSlotAssignments.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No tools assigned to this slot yet. Pick from available tools below.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentSlotAssignments.map((a) => (
              <div
                key={a.toolId}
                className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-md text-xs font-medium"
              >
                <CheckCircle className="w-3 h-3 text-primary" />
                <span>{a.toolName}</span>
                <button
                  onClick={() => removeToolFromSlot(a.toolId)}
                  className="text-muted-foreground hover:text-destructive ml-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Available Tools to Add */}
        <div className="border-t border-border pt-2.5 mt-1">
          <span className="text-[11px] font-medium text-muted-foreground block mb-2">Available Tools:</span>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_TOOLS.map((tool) => {
              const isAssigned = currentSlotAssignments.some((a) => a.toolId === tool.id);
              return (
                <button
                  key={tool.id}
                  disabled={isAssigned}
                  onClick={() => addToolToSlot(tool)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all border ${
                    isAssigned
                      ? 'opacity-40 bg-muted border-border cursor-not-allowed text-muted-foreground'
                      : 'bg-card hover:bg-primary/10 border-border hover:border-primary text-foreground'
                  }`}
                >
                  <Plus className="w-3 h-3 text-primary" />
                  <span>{tool.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
