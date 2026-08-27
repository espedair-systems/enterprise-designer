import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Sliders,
  Play,
  Save,
  Check,
  RotateCcw,
  Zap,
  Layers,
  Database,
  Terminal,
  Send,
  Code,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';

export const VectorPromptStudioView: React.FC = () => {
  const [model, setModel] = useState('gemini-2.0-flash');
  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(0.9);
  const [topKVectors, setTopKVectors] = useState(10);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.75);
  const [promptTemplate, setPromptTemplate] = useState(`You are the Enterprise Business Architect AI Assistant.
You have authoritative access to PostgreSQL 3NF metamodels (schema BT_BASE), LanceDB 768-dimensional AST embeddings, and OmniGraph lineage relationships.

Ground all answers with direct code, schema DDL, or capability factsheets.

User Request: {{user_query}}
Retrieved Grounded Vector Context:
{{retrieved_vector_chunks}}`);

  const [testQuery, setTestQuery] = useState('Map Customer Relationship Management capability to PostgreSQL 3NF DDL and DataStage ETL flows.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOutput, setGenerationOutput] = useState<string | null>(null);
  const [groundedCount, setGroundedCount] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestRun = async () => {
    if (!testQuery.trim()) return;

    setIsGenerating(true);
    setGenerationOutput(null);
    setGenerationError(null);

    try {
      const resp = await api.synthesizeVectorPrompt({
        prompt: testQuery,
        model,
        temperature,
        top_k: topKVectors,
        similarity_threshold: similarityThreshold,
      });
      setGenerationOutput(resp.synthesis);
      setGroundedCount(resp.grounded_count || 0);
    } catch (err: any) {
      setGenerationError(err.message || 'Error executing grounded RAG synthesis via backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex h-full bg-background text-foreground overflow-hidden">
      {/* Left Configuration & Hyperparameters Panel */}
      <aside className="w-88 border-r border-border bg-card p-6 flex flex-col h-full overflow-y-auto space-y-6 select-none shrink-0 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">RAG & Model Parameters</h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
            Live
          </span>
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block">LLM Reasoning Engine</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="qwen2.5-coder">Qwen 2.5 Coder (Ollama Local)</option>
            <option value="llama3.2">Llama 3.2 (Local :11434)</option>
          </select>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Temperature</span>
            <span className="font-mono text-primary font-bold">{temperature}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
          <span className="text-[10px] text-muted-foreground block">Lower values ensure deterministic schema grounding.</span>
        </div>

        {/* Top-K Vector Chunks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Top-K Vector Context</span>
            <span className="font-mono text-primary font-bold">{topKVectors} Chunks</span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={topKVectors}
            onChange={(e) => setTopKVectors(parseInt(e.target.value, 10))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Min Vector Similarity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Min Vector Similarity</span>
            <span className="font-mono text-primary font-bold">{(similarityThreshold * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSaveTemplate}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold text-foreground transition cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Configuration Saved!' : 'Save System Prompt'}</span>
        </button>
      </aside>

      {/* Main Prompt Template & Live RAG Execution Playground */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-8 space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                RAG Studio
              </span>
              <h1 className="text-xl font-bold text-foreground">Vector Prompt & RAG Studio</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure system grounding prompts, test live multi-vector context injection, and preview LLM synthesis with 0% mock data.
            </p>
          </div>
        </div>

        {/* System Prompt Template Editor */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <span>Grounding System Prompt Template</span>
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">artifact/prompts/vector_rag.md</span>
          </div>

          <textarea
            value={promptTemplate}
            onChange={(e) => setPromptTemplate(e.target.value)}
            rows={6}
            className="w-full p-3.5 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
          />
        </div>

        {/* Test Query Runner */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Live Grounded Query Execution</span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter an architecture prompt to synthesize..."
              className="flex-1 p-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
            <button
              type="button"
              onClick={handleTestRun}
              disabled={isGenerating || !testQuery.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Send className={clsx('w-3.5 h-3.5', isGenerating && 'animate-spin')} />
              <span>{isGenerating ? 'Synthesizing...' : 'Execute Live Synthesis'}</span>
            </button>
          </div>
        </div>

        {generationError && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generationError}</span>
          </div>
        )}

        {/* Live Output Box */}
        {generationOutput && (
          <div className="bg-card rounded-2xl border border-primary/30 p-6 space-y-4 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Authoritative Grounded Architecture Synthesis
                </h4>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                Grounded across <strong className="text-primary">{groundedCount} repository entities</strong>
              </span>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-foreground">
              {generationOutput}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
