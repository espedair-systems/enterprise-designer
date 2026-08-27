import React from 'react';
import { useStore } from '../../store/useStore';
import {
  User,
  X,
  Briefcase,
  ShieldCheck,
  Building,
  Mail,
  MapPin,
  Award,
  CheckCircle2,
  LogOut,
  Settings
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const { modal, closeModal, currentUser, setIsLoggedIn, setAppMode, setActiveView } = useStore();

  if (!modal.isOpen || modal.type !== 'profile') return null;

  const handleSignOut = () => {
    closeModal();
    setIsLoggedIn(false);
  };

  const handleGoToSettings = () => {
    closeModal();
    setAppMode('settings');
    setActiveView('settings');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />

      {/* Centered Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border p-6 shadow-2xl space-y-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-600/30">
              {currentUser.initials || 'BA'}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                {currentUser.name}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                  {currentUser.employeeId}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enterprise Verified Identity */}
        <div className="space-y-3 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Enterprise Directory Active Session
          </span>

          <div className="grid grid-cols-1 gap-2.5 p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-2 text-foreground">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Building className="w-3.5 h-3.5 text-cyan-500" />
              <span>{currentUser.department}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>{currentUser.location}</span>
            </div>
          </div>
        </div>

        {/* Architecture Permissions */}
        <div className="space-y-2.5 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Authoritative Entitlements
          </span>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Architecture Editor</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <Award className="w-4 h-4 text-cyan-500" />
              <span>Value Stream Lead</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Maturity Assessor</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
              <Briefcase className="w-4 h-4 text-purple-500" />
              <span>Architecture Governance</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Persona / Sign Out</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToSettings}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium transition-colors cursor-pointer border border-border"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <button
              onClick={closeModal}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
