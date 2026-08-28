import { WidgetDefinition } from './types';
import {
  DataTableWidget,
  MetricCardWidget,
  JsonTreeWidget,
  KeyValueListWidget,
} from './definitions/DataDisplayWidgets';
import {
  TextInputWidget,
  SelectInputWidget,
  SwitchToggleWidget,
  DatePickerWidget,
  NumberInputWidget,
} from './definitions/DataEntryWidgets';
import {
  BarChartWidget,
  LineChartWidget,
  DonutChartWidget,
  HeatmapGridWidget,
} from './definitions/VisualizationWidgets';
import {
  TabsContainerWidget,
  CardContainerWidget,
  ModalContainerWidget,
} from './definitions/ContainerWidgets';
import {
  ActionButtonWidget,
  IconButtonWidget,
  DropdownButtonWidget,
} from './definitions/ActionWidgets';

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  // APPLICATION LAYOUTS
  DesignerSPALayout: {
    type: 'DesignerSPALayout',
    label: 'Designer SPA',
    category: 'layouts',
    icon: 'Monitor',
    description: '5-Slot React Web Workbench (Activity Rail, Toolbox, Top Bar, Canvas, Inspector, Bottom Tray)',
    defaultWidth: 920,
    defaultHeight: 560,
    defaultProps: { layoutTarget: 'react_web' },
    schema: [
      { name: 'title', label: 'Layout Title', type: 'string', defaultValue: 'Enterprise Designer SPA' },
    ],
    render: CardContainerWidget,
  },
  WorkerTUILayout: {
    type: 'WorkerTUILayout',
    label: 'Worker TUI',
    category: 'layouts',
    icon: 'Terminal',
    description: 'Bubbletea Terminal User Interface (base tui navigation, ASCII tables, live telemetry stream)',
    defaultWidth: 880,
    defaultHeight: 500,
    defaultProps: { layoutTarget: 'bubbletea_tui' },
    schema: [
      { name: 'title', label: 'Layout Title', type: 'string', defaultValue: 'Enterprise Designer Worker TUI' },
    ],
    render: CardContainerWidget,
  },

  // DATA DISPLAY
  DataTable: {
    type: 'DataTable',
    label: 'Data Table',
    category: 'display',
    icon: 'Table',
    description: 'Paginated SQL data grid with sorting and status pills',
    defaultWidth: 780,
    defaultHeight: 280,
    defaultProps: { rowsPerPage: 5 },
    schema: [
      { name: 'title', label: 'Table Title', type: 'string', defaultValue: 'Active Studio Applications' },
      { name: 'rowsPerPage', label: 'Rows per Page', type: 'number', defaultValue: 5 },
    ],
    render: DataTableWidget,
  },
  MetricCard: {
    type: 'MetricCard',
    label: 'Metric / KPI Card',
    category: 'display',
    icon: 'BarChart3',
    description: 'Key performance metric with trend indicator and sparkline',
    defaultWidth: 280,
    defaultHeight: 140,
    defaultProps: { metric: '99.98%', subtitle: 'PostgreSQL Authoritative Persistence', trend: '+4.2%' },
    schema: [
      { name: 'metric', label: 'Metric Value', type: 'string', defaultValue: '99.98%' },
      { name: 'subtitle', label: 'Subtitle', type: 'string', defaultValue: 'PostgreSQL Active' },
      { name: 'trend', label: 'Trend Delta', type: 'string', defaultValue: '+4.2%' },
    ],
    render: MetricCardWidget,
  },
  JsonTree: {
    type: 'JsonTree',
    label: 'JSON Tree Viewer',
    category: 'display',
    icon: 'Code',
    description: 'Formatted interactive JSON inspector with copy action',
    defaultWidth: 380,
    defaultHeight: 220,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Inspector Title', type: 'string', defaultValue: 'Layout DSL Inspector' },
    ],
    render: JsonTreeWidget,
  },
  KeyValueList: {
    type: 'KeyValueList',
    label: 'Key-Value List',
    category: 'display',
    icon: 'List',
    description: 'Key-value property list for metadata and status pairs',
    defaultWidth: 320,
    defaultHeight: 180,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'List Title', type: 'string', defaultValue: 'Application Metadata' },
    ],
    render: KeyValueListWidget,
  },

  // DATA ENTRY
  TextInput: {
    type: 'TextInput',
    label: 'Text Input',
    category: 'input',
    icon: 'FormInput',
    description: 'Single-line text input with validation',
    defaultWidth: 280,
    defaultHeight: 70,
    defaultProps: { placeholder: 'Enter application slug...' },
    schema: [
      { name: 'title', label: 'Field Label', type: 'string', defaultValue: 'Application Slug' },
      { name: 'placeholder', label: 'Placeholder', type: 'string', defaultValue: 'fleet-logistics' },
      { name: 'required', label: 'Required Field', type: 'boolean', defaultValue: true },
    ],
    render: TextInputWidget,
  },
  SelectInput: {
    type: 'SelectInput',
    label: 'Select Dropdown',
    category: 'input',
    icon: 'CheckSquare',
    description: 'Dropdown selection for datasources and schemas',
    defaultWidth: 280,
    defaultHeight: 70,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Select Label', type: 'string', defaultValue: 'Target Database' },
    ],
    render: SelectInputWidget,
  },
  SwitchToggle: {
    type: 'SwitchToggle',
    label: 'Switch Toggle',
    category: 'input',
    icon: 'ToggleLeft',
    description: 'Boolean toggle switch with status indicator',
    defaultWidth: 280,
    defaultHeight: 70,
    defaultProps: { defaultChecked: true },
    schema: [
      { name: 'title', label: 'Setting Name', type: 'string', defaultValue: 'PostgreSQL Persistence' },
    ],
    render: SwitchToggleWidget,
  },
  DatePicker: {
    type: 'DatePicker',
    label: 'Date Picker',
    category: 'input',
    icon: 'Calendar',
    description: 'Calendar date picker for release scheduling',
    defaultWidth: 240,
    defaultHeight: 70,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Date Label', type: 'string', defaultValue: 'Target Release Date' },
    ],
    render: DatePickerWidget,
  },
  NumberInput: {
    type: 'NumberInput',
    label: 'Number Stepper',
    category: 'input',
    icon: 'Hash',
    description: 'Numeric input with min/max validation',
    defaultWidth: 220,
    defaultHeight: 70,
    defaultProps: { defaultValue: 25 },
    schema: [
      { name: 'title', label: 'Number Label', type: 'string', defaultValue: 'Connection Pool Size' },
    ],
    render: NumberInputWidget,
  },

  // VISUALIZATIONS
  BarChart: {
    type: 'BarChart',
    label: 'Bar Chart',
    category: 'visual',
    icon: 'BarChart3',
    description: 'Multi-bar comparative chart with gradient fills',
    defaultWidth: 420,
    defaultHeight: 220,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Chart Title', type: 'string', defaultValue: 'Capability Maturity Breakdown' },
    ],
    render: BarChartWidget,
  },
  LineChart: {
    type: 'LineChart',
    label: 'Line Chart',
    category: 'visual',
    icon: 'TrendingUp',
    description: 'Time-series area line chart with gradient',
    defaultWidth: 420,
    defaultHeight: 220,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Chart Title', type: 'string', defaultValue: 'Request Throughput' },
    ],
    render: LineChartWidget,
  },
  DonutChart: {
    type: 'DonutChart',
    label: 'Donut Chart',
    category: 'visual',
    icon: 'PieChart',
    description: 'Percentage distribution donut chart',
    defaultWidth: 320,
    defaultHeight: 200,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Chart Title', type: 'string', defaultValue: 'Pace Layer Distribution' },
    ],
    render: DonutChartWidget,
  },
  HeatmapGrid: {
    type: 'HeatmapGrid',
    label: 'Heatmap Grid',
    category: 'visual',
    icon: 'Grid',
    description: '2D capability and health maturity heatmap',
    defaultWidth: 340,
    defaultHeight: 200,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Heatmap Title', type: 'string', defaultValue: 'Domain Heatmap' },
    ],
    render: HeatmapGridWidget,
  },

  // CONTAINERS
  TabsContainer: {
    type: 'TabsContainer',
    label: 'Tabs Container',
    category: 'container',
    icon: 'Layers',
    description: 'Multi-tab container for organizing views and panels',
    defaultWidth: 480,
    defaultHeight: 200,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Container Title', type: 'string', defaultValue: 'Tabbed View' },
    ],
    render: TabsContainerWidget,
  },
  CardContainer: {
    type: 'CardContainer',
    label: 'Card Container',
    category: 'container',
    icon: 'CreditCard',
    description: 'Glassmorphism card layout container',
    defaultWidth: 340,
    defaultHeight: 180,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Card Title', type: 'string', defaultValue: 'Overview Card' },
    ],
    render: CardContainerWidget,
  },
  ModalContainer: {
    type: 'ModalContainer',
    label: 'Modal Dialog Trigger',
    category: 'container',
    icon: 'ExternalLink',
    description: 'Centered dialog trigger with backdrop blur',
    defaultWidth: 340,
    defaultHeight: 90,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Modal Trigger Title', type: 'string', defaultValue: 'Entity Inspector' },
    ],
    render: ModalContainerWidget,
  },

  // ACTIONS
  ActionButton: {
    type: 'ActionButton',
    label: 'Action Button',
    category: 'action',
    icon: 'Play',
    description: 'Primary/secondary trigger button for executing queries and workflows',
    defaultWidth: 200,
    defaultHeight: 60,
    defaultProps: { label: 'Scaffold Application', variant: 'primary' },
    schema: [
      { name: 'title', label: 'Button Label', type: 'string', defaultValue: 'Execute Scaffold' },
      {
        name: 'variant',
        label: 'Button Style',
        type: 'select',
        defaultValue: 'primary',
        options: [
          { label: 'Primary Indigo', value: 'primary' },
          { label: 'Secondary Slate', value: 'secondary' },
          { label: 'Success Emerald', value: 'emerald' },
          { label: 'Danger Rose', value: 'danger' },
        ],
      },
    ],
    render: ActionButtonWidget,
  },
  IconButton: {
    type: 'IconButton',
    label: 'Icon Action Button',
    category: 'action',
    icon: 'Play',
    description: 'Compact round/square icon button',
    defaultWidth: 60,
    defaultHeight: 60,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Tooltip Title', type: 'string', defaultValue: 'Quick Run' },
    ],
    render: IconButtonWidget,
  },
  DropdownButton: {
    type: 'DropdownButton',
    label: 'Dropdown Button',
    category: 'action',
    icon: 'MoreHorizontal',
    description: 'Action trigger with options popover',
    defaultWidth: 220,
    defaultHeight: 60,
    defaultProps: {},
    schema: [
      { name: 'title', label: 'Dropdown Label', type: 'string', defaultValue: 'Actions Menu' },
    ],
    render: DropdownButtonWidget,
  },
};

export const getWidgetsByCategory = (category: string) => {
  return Object.values(WIDGET_REGISTRY).filter((w) => w.category === category);
};
