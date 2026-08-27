import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { BusinessService, Product } from '../../types';
import { useStore } from '../../store/useStore';
import {
  Briefcase,
  Package,
  Plus,
  Radio,
  CheckCircle2,
  Clock,
  Database,
  Layers
} from 'lucide-react';

export const BusinessServiceCatalog: React.FC = () => {
  const { openModal, setActiveView } = useStore();
  const [services, setServices] = useState<BusinessService[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [s, p] = await Promise.all([
        api.listServices(),
        api.listProducts(),
      ]);
      setServices(s);
      setProducts(p);
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
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Business Services & Product Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Standardized business service definitions, delivery channels, SLAs, and commercial product packages.
          </p>
        </div>

        <button
          onClick={() => openModal('service')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Business Service</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">Loading service catalog from PostgreSQL...</div>
      ) : services.length === 0 && products.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-foreground">No Services or Products in Schema</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No business service offerings or commercial products exist in the active schema.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openModal('service')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Service</span>
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
        <>
          {/* Business Services Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-500" />
              <span>Business Service Offerings</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((svc) => (
                <div key={svc.id} className="rounded-2xl p-5 bg-card border border-border space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-500">{svc.code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {svc.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{svc.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{svc.description}</p>
                  <div className="space-y-2 pt-2 border-t border-border text-xs">
                    <div className="flex items-center justify-between text-muted-foreground font-mono">
                      <span>SLA Availability:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{svc.sla_availability_pct}%</strong>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {svc.supported_channels?.map((ch, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              <span>Packaged Commercial Products</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {products.map((prod) => (
                <div key={prod.id} className="rounded-2xl p-5 bg-card border border-border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-500">{prod.code}</span>
                    <span className="text-xs font-mono font-bold text-foreground">{prod.pricing_model}</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{prod.name}</h3>
                  <p className="text-xs text-muted-foreground">{prod.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono border-t border-border pt-3">
                    <span>Segment: <strong className="text-foreground">{prod.market_segment}</strong></span>
                    <span>Manager: <strong className="text-foreground">{prod.product_manager}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
