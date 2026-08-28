import React, { useState } from 'react';
import {
  Terminal,
  Send,
  Globe,
  Copy,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  Code2,
  Lock,
  Search,
} from 'lucide-react';

interface MockRoute {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  parameters: Array<{ name: string; in: string; required: boolean; schema: string; description: string }>;
  sampleBody?: any;
  sampleResponse: any;
}

const MOCK_ROUTES: MockRoute[] = [
  {
    id: 'get-vehicles',
    method: 'GET',
    path: '/api/v1/vehicles',
    summary: 'List All Monitored Fleet Vehicles',
    description: 'Retrieve real-time telemetry, driver safety scoring, and diagnostic fault codes for all active fleet assets.',
    parameters: [
      { name: 'limit', in: 'query', required: false, schema: 'integer (default: 50)', description: 'Pagination limit' },
      { name: 'status', in: 'query', required: false, schema: 'string', description: 'Filter by operational status' },
    ],
    sampleResponse: {
      total: 142,
      page: 1,
      items: [
        {
          vin: '1HGCR2F83HA000123',
          unit_number: 'TRK-9021',
          driver_name: 'Marcus Vance',
          speed_kmh: 84.5,
          battery_soc_pct: 92,
          safety_score: 98.4,
          status: 'operational',
        },
        {
          vin: '1HGCR2F83HA000456',
          unit_number: 'VAN-1104',
          driver_name: 'Elena Rostova',
          speed_kmh: 0.0,
          battery_soc_pct: 64,
          safety_score: 95.0,
          status: 'charging',
        },
      ],
    },
  },
  {
    id: 'post-events',
    method: 'POST',
    path: '/api/v1/events/telematics',
    summary: 'Ingest High-Frequency Telemetry Packet',
    description: 'Push raw sensor streams, GPS traces, and CAN-bus telemetry packets into the edge stream pipeline.',
    parameters: [
      { name: 'X-Sensor-Token', in: 'header', required: true, schema: 'string', description: 'Hardware sensor cryptographic token' },
    ],
    sampleBody: {
      event_id: 'd3b07384-d113-46fb-96c2-40c2d3a39e3a',
      vin: '1HGCR2F83HA000123',
      timestamp: '2026-08-28T14:32:00Z',
      latitude: 37.7749,
      longitude: -122.4194,
      odometer_km: 42150.8,
      active_dtc_codes: [],
    },
    sampleResponse: {
      status: 'ingested',
      partition: 'telematics-us-west-1',
      offset: 1984210,
      timestamp: '2026-08-28T14:32:01.002Z',
    },
  },
  {
    id: 'get-scorecard',
    method: 'GET',
    path: '/api/v1/audit/scorecards/{id}',
    summary: 'Get Completed Safety Audit Scorecard',
    description: 'Fetch detailed questionnaire responses, compliance grading, and AI risk analysis for an audit submission.',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: 'string (uuid)', description: 'Unique audit submission identifier' },
    ],
    sampleResponse: {
      submission_id: 'sub-soc2-001',
      audit_title: 'SOC2 Type II Annual Security & Access Review',
      overall_grade: 'A',
      compliance_percentage: 97.4,
      findings_count: 1,
      certified_by: 'Grant Thornton LLP',
    },
  },
];

export const InteractiveAPIConsoleCanvas: React.FC = () => {
  const [routes] = useState<MockRoute[]>(MOCK_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<MockRoute>(MOCK_ROUTES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'request' | 'response'>('response');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(MOCK_ROUTES[0].sampleResponse);
  const [copied, setCopied] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setExecutionResult(selectedRoute.sampleResponse);
      setIsExecuting(false);
      setActiveConsoleTab('response');
    }, 450);
  };

  const getMethodBadgeClass = (m: string) => {
    switch (m.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'POST':
        return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none overflow-hidden">
      {/* Top Header */}
      <div className="p-3 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground flex items-center gap-2">
              Interactive API Documentation & Runner
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Stoplight Elements Console
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Live three-panel API documentation with interactive request simulation and dynamic schema inspection.
            </p>
          </div>
        </div>
      </div>

      {/* Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: Route Navigation Tree */}
        <div className="w-64 border-r border-border bg-card/40 flex flex-col">
          <div className="p-2.5 border-b border-border">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints..."
                className="w-full bg-background border border-border rounded-xl pl-8 pr-3 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {routes
              .filter(
                (r) =>
                  r.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.summary.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((r) => {
                const isSelected = selectedRoute.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRoute(r);
                      setExecutionResult(r.sampleResponse);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition flex flex-col gap-1 border ${
                      isSelected
                        ? 'bg-card border-primary ring-1 ring-primary/20 text-foreground shadow-sm'
                        : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${getMethodBadgeClass(r.method)}`}>
                        {r.method}
                      </span>
                      <span className="font-mono text-xs font-semibold text-foreground truncate">{r.path}</span>
                    </div>
                    <div className="text-[11px] truncate text-muted-foreground">{r.summary}</div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Panel 2: Endpoint Documentation Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-border bg-card/20">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border ${getMethodBadgeClass(selectedRoute.method)}`}>
                {selectedRoute.method}
              </span>
              <span className="font-mono text-base font-bold text-foreground">
                {selectedRoute.path}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">{selectedRoute.summary}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{selectedRoute.description}</p>
          </div>

          {/* Parameters */}
          {selectedRoute.parameters.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Parameters
              </h3>
              <div className="rounded-2xl border border-border overflow-hidden bg-card/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-[10px] text-muted-foreground font-semibold uppercase">
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Required</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedRoute.parameters.map((p, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">{p.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">{p.in}</td>
                        <td className="py-2.5 px-3">
                          {p.required ? (
                            <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/20">
                              Required
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Optional</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-primary">{p.schema}</td>
                        <td className="py-2.5 px-3 text-muted-foreground text-[11px]">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sample Request Body */}
          {selectedRoute.sampleBody && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Request Body (application/json)
              </h3>
              <pre className="bg-background p-3 rounded-2xl border border-border text-xs font-mono text-muted-foreground overflow-auto">
                {JSON.stringify(selectedRoute.sampleBody, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Panel 3: "Try-It" HTTP Live Execution Console */}
        <div className="w-96 flex flex-col bg-card/30 overflow-hidden">
          <div className="p-3 border-b border-border bg-card/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">API Runner</span>
            </div>
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition"
            >
              <Send className="w-3 h-3" />
              <span>{isExecuting ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-2.5 rounded-xl bg-background border border-border text-[11px] text-muted-foreground space-y-1">
              <div className="text-foreground font-bold">Base URL:</div>
              <div className="font-mono text-primary">http://localhost:8088</div>
            </div>

            {/* Response Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground">Response (200 OK)</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(executionResult, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {executionResult ? (
                <pre className="bg-background p-3 rounded-2xl border border-border text-emerald-500 text-xs overflow-auto max-h-96 shadow-inner font-mono">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  Click 'Send Request' to execute this endpoint.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
