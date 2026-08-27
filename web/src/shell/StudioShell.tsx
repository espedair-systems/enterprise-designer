import React from 'react';
import { LayoutProvider } from './LayoutContext';
import { ActivityRail } from './ActivityRail';
import { TopMenuBar } from './TopMenuBar';
import { SidebarSlot } from './SidebarSlot';
import { CanvasSlot } from './CanvasSlot';
import { BottomTray } from './BottomTray';
import { SlotConfigModal } from './SlotConfigModal';

interface StudioShellProps {
  appId?: string;
}

export const StudioShell: React.FC<StudioShellProps> = ({ appId }) => {
  return (
    <LayoutProvider initialAppId={appId}>
      <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
        {/* Slot 1: Left-most Activity Rail */}
        <ActivityRail />

        {/* Right Workspace Main Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Slot 2: Top Menu Bar */}
          <TopMenuBar />

          {/* Workbench Middle Row: Left Sidebar, Canvas, Right Sidebar */}
          <div className="flex-1 flex min-h-0 relative overflow-hidden">
            {/* Slot 3: Left Sidebar */}
            <SidebarSlot position="left" />

            {/* Slot 4: Center Multi-Mode Canvas */}
            <CanvasSlot />

            {/* Slot 5: Right Sidebar */}
            <SidebarSlot position="right" />
          </div>

          {/* Slot 6: Bottom Tray Console */}
          <BottomTray />
        </div>

        {/* Centered Modal Slot Customizer */}
        <SlotConfigModal />
      </div>
    </LayoutProvider>
  );
};
