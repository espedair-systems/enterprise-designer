import React from 'react';
import {
  FileText,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const GuidanceDocsCanvas: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Survey Guidance & Best Practices</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                Architecture Standard
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enterprise Survey Architecture, Cognitive Load Reduction & Branching Logic Rules
            </p>
          </div>
        </div>
      </div>

      {/* Docs Body */}
      <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Card 1: Core Principles */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>1. Survey Design Principles for Mission-Critical Telematics</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In industrial fleet telematics and mission-critical audit workflows, questionnaires must
            be concise, unambiguous, and resilient to intermittent connectivity. Every question should
            have a clear operational purpose.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-border/80 bg-background space-y-1">
              <div className="font-bold text-xs text-foreground">Clear Single Objectives</div>
              <p className="text-[11px] text-muted-foreground">
                Avoid compound questions ("Was the braking good and the oil filled?"). Split into atomic items.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-border/80 bg-background space-y-1">
              <div className="font-bold text-xs text-foreground">Balanced Rating Scales</div>
              <p className="text-[11px] text-muted-foreground">
                Use 5-point Likert scales with explicit anchor labels (1=Defective, 5=Optimal).
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-border/80 bg-background space-y-1">
              <div className="font-bold text-xs text-foreground">Progressive Disclosure</div>
              <p className="text-[11px] text-muted-foreground">
                Only show secondary follow-up remark fields if a failure or exception score is recorded.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Branching Rules */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>2. Conditional Logic & Dynamic Branching Architecture</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Q Designer compiles surveys into a structured declarative DSL stored in PostgreSQL
            schema <code className="text-primary font-mono font-bold">DES_BASE.quest_surveys</code>.
          </p>

          <div className="p-4 rounded-xl bg-background border border-border font-mono text-[11px] text-foreground space-y-2">
            <div className="text-primary font-bold">// Example Question DSL Representation</div>
            <pre className="text-cyan-400">
{`{
  "code": "SF-01",
  "question_type": "rating",
  "required": true,
  "logic_rules": [
    {
      "condition": "less_than",
      "value": "3",
      "action": "jump_to_section",
      "target_id": "sec-incident-escalation"
    }
  ]
}`}
            </pre>
          </div>
        </div>

        {/* Card 3: Security & Compliance */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>3. Audit Integrity & Authoritative PostgreSQL Persistence</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All submitted survey answers and checklist certifications are signed with the respondent's
            authenticated session and persisted with millisecond timestamps into{' '}
            <strong className="text-foreground">DES_BASE.quest_submissions</strong> for compliance auditing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuidanceDocsCanvas;
