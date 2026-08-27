import { SketchDocument, GeneratedLayoutDSL } from './types';

export class SketchPromoter {
  /**
   * Promotes a freeform conceptual SketchDocument into a strict Layout DSL
   */
  static promoteToLayoutDSL(doc: SketchDocument): GeneratedLayoutDSL {
    const railItems: Array<{ id: string; icon: string; label: string; target_sidebar?: string; target_canvas?: string }> = [];
    const leftPanels: Set<string> = new Set();
    const rightPanels: Set<string> = new Set();
    const bottomPanels: Set<string> = new Set();
    const canvasWidgets: Array<{ id: string; type: string; x: number; y: number; width: number; height: number; title: string }> = [];

    // Extract slot assignments
    for (const assign of doc.slotAssignments) {
      if (assign.slot === 'rail') {
        railItems.push({
          id: assign.toolId,
          icon: assign.icon || 'Folder',
          label: assign.toolName,
          target_sidebar: `${assign.toolId}_panel`,
          target_canvas: `${assign.toolId}_view`
        });
      } else if (assign.slot === 'sidebar_left') {
        leftPanels.add(assign.toolName);
      } else if (assign.slot === 'sidebar_right') {
        rightPanels.add(assign.toolName);
      } else if (assign.slot === 'bottom_tray') {
        bottomPanels.add(assign.toolName);
      }
    }

    // Default fallbacks if empty
    if (railItems.length === 0) {
      railItems.push(
        { id: 'explorer', icon: 'Folder', label: 'Explorer', target_sidebar: 'tree_panel' },
        { id: 'designer', icon: 'Layout', label: 'Canvas', target_canvas: 'app_view' },
        { id: 'schematics', icon: 'Database', label: 'Data Architect', target_canvas: 'er_view' }
      );
    }
    if (leftPanels.size === 0) leftPanels.add('Navigator Tree');
    if (rightPanels.size === 0) rightPanels.add('Properties Inspector');
    if (bottomPanels.size === 0) bottomPanels.add('SQL Logs');

    // Extract widgets placed on canvas
    for (const el of doc.elements) {
      if (el.category === 'widget' || el.category === 'data') {
        canvasWidgets.push({
          id: el.id,
          type: el.stencilId.replace('widget-', '').replace('frame-', ''),
          x: Math.round(el.x),
          y: Math.round(el.y),
          width: Math.round(el.width),
          height: Math.round(el.height),
          title: el.label || el.name
        });
      }
    }

    return {
      layout_version: '1.0.0',
      app_name: doc.appName.toLowerCase().replace(/\s+/g, '_'),
      app_type: doc.appType,
      theme: 'dark_modern',
      slots: {
        rail: {
          items: railItems
        },
        menu_bar: {
          menus: ['File', 'Edit', 'Schema', 'Deploy', 'Help'],
          actions: ['SaveDSL', 'SyncSchematics', 'ExportBinary']
        },
        sidebar_left: {
          default_panel: Array.from(leftPanels)[0],
          panels: Array.from(leftPanels)
        },
        sidebar_right: {
          default_panel: Array.from(rightPanels)[0],
          panels: Array.from(rightPanels)
        },
        canvas: {
          mode: doc.appType === 'agent' ? 'workflow_graph' : doc.appType === 'datamodeler' ? 'er_diagram' : 'visual_builder',
          widgets: canvasWidgets
        },
        bottom_tray: {
          panels: Array.from(bottomPanels)
        }
      }
    };
  }

  /**
   * Generates a sample Schematics SQL schema draft based on data entities in the sketch
   */
  static generateSchematicsDraft(doc: SketchDocument): string {
    let sql = `-- Schematics Draft generated from Conceptual Sketch: ${doc.appName}\n`;
    sql += `-- Dialect: PostgreSQL / Snowflake\n\n`;

    const dataElements = doc.elements.filter((e) => e.category === 'data' || e.stencilId === 'widget-er-table');
    if (dataElements.length === 0) {
      sql += `CREATE TABLE public.sample_records (\n`;
      sql += `    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
      sql += `    name VARCHAR(255) NOT NULL,\n`;
      sql += `    status VARCHAR(50) DEFAULT 'active',\n`;
      sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n`;
      sql += `);\n`;
    } else {
      for (const el of dataElements) {
        const tableName = el.name.toLowerCase().replace(/\s+/g, '_');
        sql += `CREATE TABLE public.${tableName} (\n`;
        sql += `    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
        sql += `    name VARCHAR(255) NOT NULL,\n`;
        sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n`;
        sql += `);\n\n`;
      }
    }

    return sql;
  }
}
