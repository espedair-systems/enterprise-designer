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
      <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans select-none">
        {/* Slot 1: Left-most Full-Height Activity Rail */}
        <ActivityRail />

        {/* Slot 2: Left Tool Panel (Extends all the way to the top of the screen) */}
        <SidebarSlot position="left" />

        {/* Slot 3: Right Workspace Main Column */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Menu Bar (Mode badges align directly to left edge of Canvas) */}
          <TopMenuBar />

          {/* Workbench Middle Row: Canvas, Right Inspector */}
          <div className="flex-1 flex min-h-0 relative overflow-hidden">
            {/* Center Multi-Mode Canvas */}
            <CanvasSlot />

            {/* Right Properties Inspector */}
            <SidebarSlot position="right" />
          </div>

          {/* Bottom Tray Console */}
          <BottomTray />
        </div>

        {/* Centered Modal Slot Customizer */}
        <SlotConfigModal />
      </div>
    </LayoutProvider>
  );
};

export default StudioShell;
