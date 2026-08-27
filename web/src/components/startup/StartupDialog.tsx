import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Database,
  ArrowRight,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface PersonaPreset {
  name: string;
  email: string;
  role: string;
  tenancy: string;
  employeeId: string;
  badge: string;
}

const PERSONA_PRESETS: PersonaPreset[] = [
  {
    name: 'Lead Enterprise Architect',
    email: 'lead.architect@enterprise.internal',
    role: 'Principal Enterprise Architect (TOGAF / ArchiMate)',
    tenancy: 'BT_BASE',
    employeeId: 'EMP-892401',
    badge: 'Admin',
  },
  {
    name: 'Value Stream & Flow Lead',
    email: 'valuestream.lead@enterprise.internal',
    role: 'Senior Value Stream Architect',
    tenancy: 'BT_BASE',
    employeeId: 'EMP-774120',
    badge: 'Flow Architect',
  },
  {
    name: 'Strategy & Transformation Director',
    email: 'strategy.director@enterprise.internal',
    role: 'Head of Enterprise Strategy & OKRs',
    tenancy: 'BT_BASE',
    employeeId: 'EMP-339801',
    badge: 'Executive',
  },
];

export const StartupDialog: React.FC = () => {
  const { isLoggedIn, setIsLoggedIn, setCurrentUser } = useStore();
  const [email, setEmail] = useState('lead.architect@enterprise.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [tenancy, setTenancy] = useState('BT_BASE');
  const [role, setRole] = useState('Principal Enterprise Architect (TOGAF / ArchiMate)');
  const [employeeId, setEmployeeId] = useState('EMP-892401');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoggedIn) return null;

  const handleSelectPreset = (preset: PersonaPreset) => {
    setEmail(preset.email);
    setRole(preset.role);
    setTenancy(preset.tenancy);
    setEmployeeId(preset.employeeId);
    setError(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide corporate email and authentication credentials');
      return;
    }
    setIsLoading(true);

    const matched = PERSONA_PRESETS.find((p) => p.email.toLowerCase() === email.toLowerCase());
    const resolvedName = matched
      ? matched.name
      : email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Enterprise Architect';

    setTimeout(() => {
      setCurrentUser({
        name: resolvedName,
        email,
        role,
        tenancy,
        employeeId,
      });
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-8 shadow-2xl space-y-6 z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/30">
              EA
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
                Architecture OS
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  TOGAF / ArchiMate
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">Enterprise Architecture Operating System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            <span>IAM Single Sign-On</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Persona Quick Select */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Select Architect Persona Preset
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PERSONA_PRESETS.map((p) => {
              const isSelected = email.toLowerCase() === p.email.toLowerCase();
              return (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3 rounded-xl border text-left transition-all space-y-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border-primary ring-1 ring-primary/40'
                      : 'bg-card border-border hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold">
                      {p.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <strong className="block text-xs text-foreground truncate">{p.name}</strong>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{p.employeeId}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-foreground font-medium mb-1">Corporate Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground font-medium mb-1">SSO Password / Token</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-10 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-foreground font-medium mb-1">PostgreSQL Tenancy Schema</label>
              <div className="relative">
                <Database className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={tenancy}
                  onChange={(e) => setTenancy(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="public">public (Authoritative Global Schema)</option>
                  <option value="BA-RETAIL-BANKING">BA-RETAIL-BANKING (Commercial Banking)</option>
                  <option value="BA-SUPPLY-CHAIN">BA-SUPPLY-CHAIN (Supply Chain Logistics)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-foreground font-medium mb-1">Assigned Entitlement Role</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  value={role}
                  className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-3 py-2 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PostgreSQL authoritative storage active</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Enter Business Architecture OS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
