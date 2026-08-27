import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { OrgUnit, BusinessFunction, BusinessRole } from '../../types';
import { useStore } from '../../store/useStore';
import {
  Users,
  Building,
  Briefcase,
  Plus,
  DollarSign,
  MapPin,
  Sparkles,
  Database,
  Layers
} from 'lucide-react';

export const OrgStudio: React.FC = () => {
  const { openModal, setActiveView } = useStore();
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [functions, setFunctions] = useState<BusinessFunction[]>([]);
  const [roles, setRoles] = useState<BusinessRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [orgs, funcs, rls] = await Promise.all([
        api.listOrgUnits(),
        api.listBusinessFunctions(),
        api.listBusinessRoles(),
      ]);
      setOrgUnits(orgs);
      setFunctions(funcs);
      setRoles(rls);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-500" />
            Organization & Function Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Structural org units, logical business functions, and Workday HCM role profiles with FTE allocations.
          </p>
        </div>

        <button
          onClick={() => openModal('org_unit')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Org Unit</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">Loading organizational units from PostgreSQL...</div>
      ) : orgUnits.length === 0 && functions.length === 0 && roles.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-foreground">No Organizational Data in Schema</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No org units, business functions, or Workday role profiles exist in the active schema.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openModal('org_unit')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Org Unit</span>
            </button>
            <button
              onClick={() => setActiveView('imports')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Import Metamodels</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3 Sections: Org Units, Functions, Workday Roles */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Org Units */}
          <div className="rounded-2xl p-6 bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-500" />
                <span>Organizational Units</span>
              </h2>
              <span className="text-xs text-muted-foreground font-mono">{orgUnits.length} Units</span>
            </div>

            <div className="space-y-3">
              {orgUnits.map((org) => (
                <div key={org.id} className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-500">{org.code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-muted text-muted-foreground">
                      {org.type}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-foreground">{org.name}</h3>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono border-t border-border pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" /> {org.location}
                    </span>
                    <strong className="text-foreground">{org.headcount_fte} FTE</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Functions */}
          <div className="rounded-2xl p-6 bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-500" />
                <span>Business Functions</span>
              </h2>
              <span className="text-xs text-muted-foreground font-mono">{functions.length} Functions</span>
            </div>

            <div className="space-y-3">
              {functions.map((bf) => (
                <div key={bf.id} className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-500">{bf.code}</span>
                    <span className="text-[10px] text-muted-foreground">Logical Function</span>
                  </div>
                  <h3 className="text-xs font-bold text-foreground">{bf.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{bf.description}</p>
                  <div className="text-[11px] font-mono text-muted-foreground border-t border-border pt-2">
                    Owner: <strong className="text-foreground">{bf.owner}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workday Roles */}
          <div className="rounded-2xl p-6 bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Workday Job Profiles & Roles</span>
              </h2>
              <span className="text-xs text-muted-foreground font-mono">{roles.length} Roles</span>
            </div>

            <div className="space-y-3">
              {roles.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-500">{r.code}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {r.workday_job_profile_id}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-foreground">{r.title}</h3>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border pt-2">
                    <span>${r.standard_rate_usd}/hr</span>
                    <strong className="text-foreground">{r.allocated_fte} FTE Allocated</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
