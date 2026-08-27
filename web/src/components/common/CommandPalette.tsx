import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  Box,
  Layers,
  Activity,
  Users,
  Settings,
  Database,
  Download,
  Upload,
  HelpCircle,
  Moon,
  Sun,
  Shield,
  FileCode2,
  Workflow,
  Sparkles,
  Command,
} from 'lucide-react';
import { useStore, NavView } from '../../store/useStore';
import { cn } from '../../lib/utils';

interface CommandItem {
  id: string;
  label: string;
  category: 'Navigation' | 'Actions' | 'Theme' | 'Settings';
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setActiveView, setAppMode, openModal, currentUser, setCurrentUser } = useStore();

  // Toggle with Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-dashboard',
        label: 'Go to Executive Dashboard',
        category: 'Navigation',
        icon: LayoutDashboard,
        action: () => {
          setAppMode('dashboard');
          setActiveView('dashboard');
        },
        shortcut: 'G D',
      },
      {
        id: 'nav-capabilities',
        label: 'Go to Capability Studio',
        category: 'Navigation',
        icon: Box,
        action: () => {
          setAppMode('architect');
          setActiveView('arch-capabilities');
        },
        shortcut: 'G C',
      },
      {
        id: 'nav-valuestreams',
        label: 'Go to Value Streams & Stages',
        category: 'Navigation',
        icon: Workflow,
        action: () => {
          setAppMode('architect');
          setActiveView('arch-valuestreams');
        },
        shortcut: 'G V',
      },
      {
        id: 'nav-strategy',
        label: 'Go to Strategy & OKR Studio',
        category: 'Navigation',
        icon: Activity,
        action: () => {
          setAppMode('architect');
          setActiveView('arch-strategy');
        },
        shortcut: 'G S',
      },
      {
        id: 'nav-processes',
        label: 'Go to Process Architecture (BPMN / SIPOC)',
        category: 'Navigation',
        icon: Layers,
        action: () => {
          setAppMode('ba');
          setActiveView('ba-processes');
        },
        shortcut: 'G P',
      },
      {
        id: 'nav-org',
        label: 'Go to Organization & RACI Matrix',
        category: 'Navigation',
        icon: Users,
        action: () => {
          setAppMode('hr');
          setActiveView('hr-organization');
        },
        shortcut: 'G O',
      },

      // Actions
      {
        id: 'act-new-cap',
        label: 'Create New Capability Fact Sheet',
        category: 'Actions',
        icon: Box,
        action: () => openModal('capability'),
        shortcut: 'N C',
      },
      {
        id: 'act-new-vs',
        label: 'Create New Value Stream',
        category: 'Actions',
        icon: Workflow,
        action: () => openModal('valuestream'),
        shortcut: 'N V',
      },
      {
        id: 'act-export',
        label: 'Export Architecture Models (JSON / Excel / ArchiMate)',
        category: 'Actions',
        icon: Download,
        action: () => openModal('export'),
      },
      {
        id: 'act-database',
        label: 'Inspect PostgreSQL Authoritative Database',
        category: 'Actions',
        icon: Database,
        action: () => {
          setAppMode('settings');
          setActiveView('database');
        },
      },

      // Themes
      {
        id: 'theme-dark',
        label: 'Switch to Dark Theme',
        category: 'Theme',
        icon: Moon,
        action: () => setCurrentUser({ theme: 'dark' }),
      },
      {
        id: 'theme-light',
        label: 'Switch to Light Theme',
        category: 'Theme',
        icon: Sun,
        action: () => setCurrentUser({ theme: 'light' }),
      },
      {
        id: 'theme-midnight',
        label: 'Switch to Midnight Slate Theme',
        category: 'Theme',
        icon: Sparkles,
        action: () => setCurrentUser({ theme: 'midnight' }),
      },

      // Settings
      {
        id: 'set-profile',
        label: 'User Profile & Security Settings',
        category: 'Settings',
        icon: Shield,
        action: () => openModal('profile'),
      },
      {
        id: 'set-help',
        label: 'View Enterprise Architecture Reference Guide',
        category: 'Settings',
        icon: HelpCircle,
        action: () => {
          setAppMode('help');
          setActiveView('help-ea');
        },
      },
    ],
    [setAppMode, setActiveView, openModal, setCurrentUser]
  );

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  const execute = (cmd: CommandItem) => {
    setIsOpen(false);
    cmd.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) execute(cmd);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh] bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-muted/20">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search architecture models... (Esc to exit)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-muted border border-border rounded text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* List of Commands */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No matching commands or architecture components found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'hover:bg-muted/70 text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-4 h-4 shrink-0', isSelected ? 'text-primary-foreground' : 'text-primary')} />
                    <span>{cmd.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-mono uppercase px-1.5 py-0.5 rounded',
                        isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        className={cn(
                          'text-[9px] font-mono px-1.5 py-0.5 rounded border',
                          isSelected ? 'border-primary-foreground/30 text-primary-foreground' : 'border-border text-muted-foreground'
                        )}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/10 text-[11px] font-mono text-muted-foreground">
          <span>Navigate: <kbd className="px-1 bg-muted rounded">↑</kbd> <kbd className="px-1 bg-muted rounded">↓</kbd></span>
          <span>Select: <kbd className="px-1 bg-muted rounded">↵</kbd></span>
          <span>Close: <kbd className="px-1 bg-muted rounded">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
