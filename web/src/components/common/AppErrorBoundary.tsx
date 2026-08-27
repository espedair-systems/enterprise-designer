import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    });
  };

  private copyErrorToClipboard = () => {
    const errorDetails = [
      `[Base Artist Error Report]`,
      `Timestamp: ${new Date().toISOString()}`,
      `Error Message: ${this.state.error?.message || 'Unknown error'}`,
      `Error Name: ${this.state.error?.name || 'Error'}`,
      `Stack Trace:`,
      this.state.error?.stack || 'No stack trace available',
      `Component Stack:`,
      this.state.errorInfo?.componentStack || 'No component stack available',
      `User Agent: ${navigator.userAgent}`,
      `URL: ${window.location.href}`,
    ].join('\n\n');

    void navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2500);
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[55vh] p-8 text-center bg-card border border-destructive/30 rounded-2xl m-6 shadow-md animate-in fade-in duration-200">
          <div className="p-3 rounded-2xl bg-destructive/15 text-destructive mb-4 border border-destructive/20 shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-bold text-foreground mb-1.5">
            {this.props.fallbackTitle || 'A component encountered an unexpected error'}
          </h2>
          <p className="text-xs text-muted-foreground max-w-lg mb-4">
            An unhandled runtime exception occurred in the active view. You can copy the full diagnostics to your clipboard and reload the view.
          </p>

          <div className="w-full max-w-xl mb-5 text-left font-mono text-xs bg-muted/40 p-3.5 rounded-xl border border-border/80 text-destructive dark:text-red-400 overflow-x-auto shadow-inner">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-foreground">
              <Terminal className="w-3.5 h-3.5 text-destructive" />
              <span>Error Summary:</span>
            </div>
            <div className="text-[11px] leading-relaxed break-words">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <button
              type="button"
              onClick={this.copyErrorToClipboard}
              className="flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              {this.state.copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  <span>Copy Error Details</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload View</span>
            </button>
          </div>

          {/* Expandable Stack Trace */}
          {(this.state.error?.stack || this.state.errorInfo?.componentStack) && (
            <div className="w-full max-w-xl text-left mt-2">
              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors cursor-pointer"
              >
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{this.state.showDetails ? 'Hide Call Stack' : 'View Full Call Stack & Component Hierarchy'}</span>
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 bg-muted/60 rounded-xl border border-border/80 font-mono text-[10px] text-muted-foreground overflow-x-auto max-h-56 overflow-y-auto space-y-2">
                  {this.state.error?.stack && (
                    <div>
                      <div className="text-[10px] font-bold text-foreground mb-1">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap leading-tight">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="pt-2 border-t border-border/40">
                      <div className="text-[10px] font-bold text-foreground mb-1">Component Hierarchy:</div>
                      <pre className="whitespace-pre-wrap leading-tight">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
