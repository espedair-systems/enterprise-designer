import React from 'react';
import { BarChart3, TrendingUp, PieChart, Grid } from 'lucide-react';
import { WidgetRenderProps } from '../types';

// 1. Bar Chart Widget
export const BarChartWidget: React.FC<WidgetRenderProps> = ({ title, props }) => {
  const bars = props.data || [
    { label: 'Capabilities', value: 85, color: 'from-indigo-500 to-purple-600' },
    { label: 'Value Streams', value: 60, color: 'from-purple-500 to-pink-600' },
    { label: 'Processes', value: 92, color: 'from-pink-500 to-rose-600' },
    { label: 'Agents', value: 45, color: 'from-emerald-500 to-teal-600' },
    { label: 'Models', value: 78, color: 'from-blue-500 to-indigo-600' },
  ];

  return (
    <div className="flex flex-col justify-between h-full bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">{title || 'Architectural Maturity Distribution'}</h4>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">AVG 72%</span>
      </div>

      <div className="flex-1 flex items-end justify-between gap-3 pt-4 px-2">
        {bars.map((bar: any, idx: number) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
            <span className="text-[10px] font-mono text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {bar.value}%
            </span>
            <div className="w-full bg-muted rounded-t-md h-32 flex items-end overflow-hidden">
              <div
                style={{ height: `${bar.value}%` }}
                className={`w-full bg-gradient-to-t ${bar.color || 'from-primary to-purple-600'} rounded-t-md transition-all duration-500`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Line Chart Widget
export const LineChartWidget: React.FC<WidgetRenderProps> = ({ title, props }) => {
  return (
    <div className="flex flex-col justify-between h-full bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs font-bold text-foreground">{title || 'Throughput (Req / sec)'}</h4>
        </div>
        <span className="text-[10px] text-emerald-500 font-mono font-bold">+18.4%</span>
      </div>

      <div className="flex-1 relative flex items-center justify-center pt-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 80 Q 50 20, 100 50 T 200 30 T 300 10 L 300 100 L 0 100 Z"
            fill="url(#lineGrad)"
          />
          <path
            d="M 0 80 Q 50 20, 100 50 T 200 30 T 300 10"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
          />
          <circle cx="100" cy="50" r="4" fill="hsl(var(--primary))" />
          <circle cx="200" cy="30" r="4" fill="hsl(var(--primary))" />
          <circle cx="300" cy="10" r="4" fill="hsl(var(--primary))" />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border mt-1 font-mono">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>Now</span>
      </div>
    </div>
  );
};

// 3. Donut / Pie Chart Widget
export const DonutChartWidget: React.FC<WidgetRenderProps> = ({ title, props }) => {
  return (
    <div className="flex flex-col justify-between h-full bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">{title || 'Pace Layer Distribution'}</h4>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-4">
        {/* SVG Donut */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-muted"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-primary"
              strokeDasharray="50, 100"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-purple-500"
              strokeDasharray="30, 100"
              strokeDashoffset="-50"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-pink-500"
              strokeDasharray="20, 100"
              strokeDashoffset="-80"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-xs font-bold text-foreground">100%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="text-[11px] space-y-1.5 text-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>Record (50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Differentiation (30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span>Innovation (20%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Heatmap Grid Widget
export const HeatmapGridWidget: React.FC<WidgetRenderProps> = ({ title, props }) => {
  const cells = [
    { name: 'Core Logistics', score: 'HIGH', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { name: 'Fleet Telemetry', score: 'HIGH', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { name: 'Predictive Maint.', score: 'MED', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    { name: 'Autonomous Dispatch', score: 'LOW', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  ];

  return (
    <div className="flex flex-col justify-between h-full bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">{title || 'Capability Heatmap'}</h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1 pt-1">
        {cells.map((cell, idx) => (
          <div key={idx} className={`p-2.5 rounded-lg border flex flex-col justify-between ${cell.bg}`}>
            <span className="text-[11px] font-semibold">{cell.name}</span>
            <span className="text-[10px] font-mono font-bold self-end">{cell.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
