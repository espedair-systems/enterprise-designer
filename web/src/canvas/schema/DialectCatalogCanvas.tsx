import React from 'react';
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Layers,
  Code2,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

interface DialectItem {
  id: string;
  name: string;
  uri: string;
  specification: 'JSON Schema' | 'OpenAPI';
  status: 'Authoritative Standard' | 'Supported Legacy' | 'Draft Evolution';
  description: string;
  features: string[];
}

const DIALECTS: DialectItem[] = [
  {
    id: 'draft-2020-12',
    name: 'JSON Schema Draft 2020-12',
    uri: 'https://json-schema.org/draft/2020-12/schema',
    specification: 'JSON Schema',
    status: 'Authoritative Standard',
    description: 'Current authoritative JSON Schema dialect supporting dynamic referencing ($dynamicAnchor, $dynamicRef), vocabularies, and full format-assertion decoupling.',
    features: ['$defs reusability', 'prefixItems array validation', 'unevaluatedProperties keyword', 'Vocabularies & meta-schemas'],
  },
  {
    id: 'openapi-3-1',
    name: 'OpenAPI Specification 3.1.0',
    uri: 'https://spec.openapis.org/oas/3.1/schema/2022-10-07',
    specification: 'OpenAPI',
    status: 'Authoritative Standard',
    description: 'First OpenAPI specification version featuring 100% full compatibility and alignment with JSON Schema Draft 2020-12 dialects.',
    features: ['Full JSON Schema Draft 2020-12 alignment', 'Webhooks top-level keyword', 'Summary fields for Path Items', 'Mutual TLS (mTLS) security schemes'],
  },
  {
    id: 'draft-2019-09',
    name: 'JSON Schema Draft 2019-09',
    uri: 'https://json-schema.org/draft/2019-09/schema',
    specification: 'JSON Schema',
    status: 'Supported Legacy',
    description: 'Introduced vocabulary extensibility, $recursiveAnchor, $anchor, and separated core keywords from applicator vocabularies.',
    features: ['$anchor and $defs keywords', 'contentMediaType & contentEncoding', 'minContains & maxContains', 'Vocabulary meta-schema assertions'],
  },
  {
    id: 'openapi-3-0',
    name: 'OpenAPI Specification 3.0.3',
    uri: 'https://spec.openapis.org/oas/3.0/schema/2021-09-28',
    specification: 'OpenAPI',
    status: 'Supported Legacy',
    description: 'Widely adopted REST API specification standard with extended JSON Schema Draft 4 dialect variants.',
    features: ['Components object reusability', 'Callbacks and Links support', 'Cookie parameters', 'OneOf / AnyOf polymorphism'],
  },
  {
    id: 'draft-07',
    name: 'JSON Schema Draft 7',
    uri: 'http://json-schema.org/draft-07/schema#',
    specification: 'JSON Schema',
    status: 'Supported Legacy',
    description: 'Traditional standard JSON Schema version featuring if / then / else conditional validation and readOnly/writeOnly flags.',
    features: ['if-then-else conditionals', 'readOnly / writeOnly properties', 'comment ($comment) keyword', 'format keywords (iri, date, time)'],
  },
];

export const DialectCatalogCanvas: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 border-b border-border bg-card/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground flex items-center gap-2">
              Schema Metaschema & Dialect Catalog
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Draft 2020-12 & OAS 3.1
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Authoritative validation vocabularies, meta-schema URIs, and structural compatibility matrices.
            </p>
          </div>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {DIALECTS.map((d) => (
          <div
            key={d.id}
            className="p-5 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    d.specification === 'JSON Schema'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  {d.specification}
                </span>
                <h2 className="text-sm font-bold text-foreground mt-1.5">{d.name}</h2>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  d.status === 'Authoritative Standard'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {d.status}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{d.description}</p>

            <div className="p-2 rounded-xl bg-background border border-border flex items-center justify-between">
              <span className="font-mono text-[10px] text-primary truncate max-w-xs">{d.uri}</span>
              <a
                href={d.uri}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground p-1 transition"
                title="View Official Dialect Metaschema"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Key Metaschema Capabilities:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {d.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
