import React from 'react';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { LayoutProvider } from './shell/LayoutContext';
import { StudioShell } from './shell/StudioShell';
import { CommandPalette } from './components/common/CommandPalette';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';

export const AppContent: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-background text-foreground flex overflow-hidden select-none font-sans antialiased">
      <AppErrorBoundary>
        <StudioShell />
      </AppErrorBoundary>
      <CommandPalette />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
