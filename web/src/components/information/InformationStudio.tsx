import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { BusinessInformationConcept, BusinessTerm } from '../../types';
import { useStore } from '../../store/useStore';
import {
  Database,
  BookOpen,
  Plus,
  Tag,
  Key,
  Lock,
  Layers
} from 'lucide-react';

export const InformationStudio: React.FC = () => {
  const { searchQuery, openModal, setActiveView } = useStore();
  const [concepts, setConcepts] = useState<BusinessInformationConcept[]>([]);
  const [terms, setTerms] = useState<BusinessTerm[]>([]);
  const [activeTab, setActiveTab] = useState<'concepts' | 'glossary'>('concepts');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [c, t] = await Promise.all([
        api.listConcepts(),
        api.listTerms(),
      ]);
      setConcepts(c);
      setTerms(t);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTerms = terms.filter(
    (t) =>
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.domain_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Database className="w-6 h-6 text-indigo-500" />
            Information Architecture & Glossary Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Canonical business information concepts, domain attributes, and enterprise business glossary taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-card border border-border p-1 rounded-xl shadow-xs">
            <button
              onClick={() => setActiveTab('concepts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'concepts' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Information Concepts
            </button>
            <button
              onClick={() => setActiveTab('glossary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'glossary' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Business Glossary
            </button>
          </div>

          <button
            onClick={() => openModal(activeTab === 'concepts' ? 'concept' : 'term')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add {activeTab === 'concepts' ? 'Concept' : 'Glossary Term'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">Loading data models from PostgreSQL...</div>
      ) : activeTab === 'concepts' && concepts.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-foreground">No Information Concepts in Schema</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No business information entities or concepts exist in the active schema.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openModal('concept')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Concept</span>
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
      ) : activeTab === 'concepts' ? (
        /* Information Concepts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {concepts.map((concept) => (
            <div key={concept.id} className="rounded-2xl p-6 bg-card border border-border space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-500">{concept.code}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-muted text-muted-foreground">
                  {concept.classification}
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground">{concept.name}</h3>
              <p className="text-xs text-muted-foreground">{concept.description}</p>

              {/* Attributes Table */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">Core Attributes</span>
                <div className="space-y-1.5">
                  {concept.attributes?.map((attr, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/60 text-xs">
                      <div className="flex items-center gap-2">
                        {attr.is_key && <Key className="w-3 h-3 text-amber-500" />}
                        {attr.is_pii && <Lock className="w-3 h-3 text-rose-500" />}
                        <strong className="text-foreground">{attr.name}</strong>
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground">{attr.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono border-t border-border pt-3">
                <span>Steward: <strong className="text-foreground">{concept.domain_owner_role}</strong></span>
                <span>Source: <strong className="text-foreground">{concept.authoritative_source}</strong></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Business Glossary View */
        <div className="rounded-2xl p-6 bg-card border border-border space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-500" />
              <span>Authoritative Business Glossary Dictionary</span>
            </h2>
            <span className="text-xs text-muted-foreground font-mono">{filteredTerms.length} Definitions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTerms.map((term) => (
              <div key={term.id} className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">{term.term}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-mono border border-primary/20">
                    {term.domain_category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{term.definition}</p>
                <div className="text-[11px] text-muted-foreground font-mono border-t border-border pt-2">
                  Data Steward: <strong className="text-foreground">{term.steward}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
