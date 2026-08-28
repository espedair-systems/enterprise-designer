import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Play,
  Save,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  CheckCircle2,
  CheckSquare,
  Type,
  AlignLeft,
  Star,
  Calendar,
  Upload,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Copy,
  ArrowUp,
  ArrowDown,
  Settings,
  ListPlus,
  Radio,
  Sliders,
  FileText,
  Eye,
  Columns,
  Hash,
  PenTool,
  SlidersHorizontal,
  GitBranch,
  ArrowRightCircle,
  AlertTriangle,
  Workflow,
  CornerDownRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useLayout } from '../../shell/LayoutContext';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  score?: number;
}

export interface LogicJumpConfig {
  sourceQuestionId: string;
  sourceQuestionCode?: string;
  operator: 'equals' | 'not_equals' | 'less' | 'greater' | 'contains' | 'empty' | 'not_empty';
  matchValue: string;
  action: 'jump_page' | 'complete_survey' | 'skip_next';
  targetPageIndex?: number;
  targetPageTitle?: string;
}

export interface SurveyQuestion {
  id: string;
  code: string;
  text: string;
  question_type: string; // 'text' | 'textarea' | 'number' | 'single_choice' | 'multiple_choice' | 'dropdown' | 'rating' | 'slider' | 'date' | 'file_upload' | 'signature' | 'logic_jump'
  required: boolean;
  options?: QuestionOption[];
  help_text?: string;
  guidance_markdown?: string;
  rating_config?: {
    scaleType: '1-5' | '1-10' | 'slider';
    min?: number;
    max?: number;
    step?: number;
    lowLabel?: string;
    highLabel?: string;
  };
  logic_jump?: LogicJumpConfig;
  reference_data_key?: string;
  sort_order: number;
}

export interface SurveySection {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  questions: SurveyQuestion[];
}

export const VisualSurveyDesignerCanvas: React.FC = () => {
  const { currentApp, selectedWidgetId, setSelectedWidgetId } = useLayout();
  const [surveyTitle, setSurveyTitle] = useState<string>(
    'Enterprise Fleet Driver Safety & Incident Audit 2026'
  );
  const [surveySlug, setSurveySlug] = useState<string>('fleet-safety-audit');
  const [surveyVersion, setSurveyVersion] = useState<string>('1.2.0');
  const [sections, setSections] = useState<SurveySection[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [referenceDatasets, setReferenceDatasets] = useState<any[]>([]);

  // Drag-and-drop state
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Centered Page Edit/Add Modal State
  const [isPageModalOpen, setIsPageModalOpen] = useState<boolean>(false);
  const [isNewPageMode, setIsNewPageMode] = useState<boolean>(false);
  const [pageModalTitle, setPageModalTitle] = useState<string>('');
  const [pageModalDesc, setPageModalDesc] = useState<string>('');

  // Centered Question Edit Modal State (Extra Large max-w-5xl with dedicated Logic Jump UI)
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [qModalCode, setQModalCode] = useState<string>('');
  const [qModalText, setQModalText] = useState<string>('');
  const [qModalType, setQModalType] = useState<string>('text');
  const [qModalRequired, setQModalRequired] = useState<boolean>(false);
  const [qModalHelp, setQModalHelp] = useState<string>('');
  const [qModalGuidance, setQModalGuidance] = useState<string>('');
  const [qModalOptions, setQModalOptions] = useState<QuestionOption[]>([]);
  const [qModalRatingScale, setQModalRatingScale] = useState<'1-5' | '1-10' | 'slider'>('1-5');
  const [qModalSliderMin, setQModalSliderMin] = useState<number>(0);
  const [qModalSliderMax, setQModalSliderMax] = useState<number>(100);
  const [qModalSliderStep, setQModalSliderStep] = useState<number>(5);
  const [qModalLowLabel, setQModalLowLabel] = useState<string>('Defective');
  const [qModalHighLabel, setQModalHighLabel] = useState<string>('Optimal');
  const [qMarkdownTab, setQMarkdownTab] = useState<'edit' | 'preview' | 'split'>('edit');

  // Logic Jump Specific State
  const [logicSourceQId, setLogicSourceQId] = useState<string>('');
  const [logicOperator, setLogicOperator] = useState<LogicJumpConfig['operator']>('equals');
  const [logicMatchValue, setLogicMatchValue] = useState<string>('');
  const [logicAction, setLogicAction] = useState<LogicJumpConfig['action']>('jump_page');
  const [logicTargetPageIndex, setLogicTargetPageIndex] = useState<number>(1);

  // Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    question: SurveyQuestion | null;
  }>({ visible: false, x: 0, y: 0, question: null });

  // Step-by-Step Live Preview Runner Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [runnerStepIndex, setRunnerStepIndex] = useState<number>(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState<boolean>(false);
  const [jumpBanner, setJumpBanner] = useState<string | null>(null);

  useEffect(() => {
    loadSurvey();
    loadReferenceData();
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible]);

  const loadReferenceData = async () => {
    try {
      const res = await api.listQuestReferenceData();
      if (res) setReferenceDatasets(res);
    } catch (err) {
      console.warn('Failed to fetch reference datasets', err);
    }
  };

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const res = await api.listQuestSurveys();
      if (res && res.length > 0) {
        const active = res[0];
        setSurveyTitle(active.title);
        setSurveySlug(active.slug);
        setSurveyVersion(active.version || '1.0.0');
        if (active.sections && active.sections.length > 0) {
          setSections(active.sections);
        } else {
          initDefaultSections();
        }
      } else {
        initDefaultSections();
      }
    } catch (err) {
      console.warn('Failed to fetch active survey, initializing defaults', err);
      initDefaultSections();
    } finally {
      setLoading(false);
    }
  };

  const initDefaultSections = () => {
    setSections([
      {
        id: 'sec-1',
        title: 'Operator Identity & Vehicle Assignment',
        description: 'Verify driver credentials, license endorsements, and assigned CAN bus unit.',
        sort_order: 1,
        questions: [
          {
            id: 'q-101',
            code: 'OP-01',
            text: 'Select Assigned Commercial Vehicle Unit (VIN / Fleet ID)',
            question_type: 'single_choice',
            required: true,
            sort_order: 1,
            guidance_markdown: '### Vehicle Selection Protocol\nEnsure the selected vehicle matches the physical unit VIN located on the door pillar plate.',
            options: [
              { id: 'opt-1', label: 'Volvo FH Electric (VIN: 1HGCR2F83HA001294)', value: 'vin_volvo_1294' },
              { id: 'opt-2', label: 'Scania R500 Long-Haul (VIN: 2SCNR5F99KA004412)', value: 'vin_scania_4412' },
              { id: 'opt-3', label: 'Mercedes-Benz eActros (VIN: 3MBEA7F11LA008891)', value: 'vin_mercedes_8891' },
            ],
          },
          {
            id: 'q-102',
            code: 'OP-02',
            text: 'Current Vehicle Odometer Reading (km)',
            question_type: 'number',
            required: true,
            sort_order: 2,
            help_text: 'Enter total kilometers displayed on the primary digital cluster.',
          },
          {
            id: 'q-103',
            code: 'JUMP-01',
            text: 'Conditional Branch: Skip to Certification if Volvo Electric selected',
            question_type: 'logic_jump',
            required: false,
            sort_order: 3,
            logic_jump: {
              sourceQuestionId: 'q-101',
              sourceQuestionCode: 'OP-01',
              operator: 'equals',
              matchValue: 'vin_volvo_1294',
              action: 'jump_page',
              targetPageIndex: 2,
              targetPageTitle: 'Sign-off Certification & Dispatch Authorization',
            },
          },
        ],
      },
      {
        id: 'sec-2',
        title: 'Pre-Trip Telematics & Mechanical Health',
        description: 'Physical inspection of tire pressure, emergency braking, and CAN bus sensors.',
        sort_order: 2,
        questions: [
          {
            id: 'q-201',
            code: 'SF-01',
            text: 'Pre-Trip Brake System & Pneumatic Pressure Rating',
            question_type: 'rating',
            required: true,
            sort_order: 1,
            rating_config: { scaleType: '1-5', lowLabel: 'Defective', highLabel: 'Optimal' },
            help_text: 'Scale: 1 (Defective / Ground Vehicle) to 5 (Optimal / Calibrated)',
          },
          {
            id: 'q-202',
            code: 'SF-02',
            text: 'Safety Critical Inspection Checklist',
            question_type: 'multiple_choice',
            required: true,
            sort_order: 2,
            options: [
              { id: 'chk-1', label: 'Emergency Stop Switch Functional', value: 'estop_ok' },
              { id: 'chk-2', label: 'GPS & GSM Telematics Antenna Active', value: 'telematics_ok' },
              { id: 'chk-3', label: 'First Aid & Hazmat Kit Verified', value: 'firstaid_ok' },
              { id: 'chk-4', label: 'Tire Tread Depth > 4.5mm', value: 'tires_ok' },
            ],
          },
          {
            id: 'q-203',
            code: 'SF-03',
            text: 'CAN-Bus Telemetry Ingestion Quality Slider (0 - 100%)',
            question_type: 'slider',
            required: true,
            sort_order: 3,
            rating_config: { scaleType: 'slider', min: 0, max: 100, step: 5, lowLabel: '0% Packet Loss', highLabel: '100% Ingested' },
          },
        ],
      },
      {
        id: 'sec-3',
        title: 'Sign-off Certification & Dispatch Authorization',
        description: 'Digital signature verification and route confirmation.',
        sort_order: 3,
        questions: [
          {
            id: 'q-301',
            code: 'SG-01',
            text: 'I certify that all inspection items above have been physically verified.',
            question_type: 'single_choice',
            required: true,
            sort_order: 1,
            options: [
              { id: 'opt-agree', label: 'I Certify and Accept Compliance Responsibility', value: 'certified' },
            ],
          },
        ],
      },
    ]);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Active section based on single-page view
  const activeSection = sections[activePageIndex] || sections[0];

  // Flattened questions list for step-by-step runner and source question lookups
  const allSurveyQuestions: SurveyQuestion[] = sections.flatMap((s) => s.questions);
  const eligibleSourceQuestions = allSurveyQuestions.filter((q) => q.question_type !== 'logic_jump');

  // Autosave to PostgreSQL DES_BASE.quest_surveys
  const handleSaveToBackend = async () => {
    setIsSaving(true);
    try {
      const payload = {
        app_id: currentApp ? currentApp.id : 'fleet-logistics',
        title: surveyTitle,
        slug: surveySlug,
        version: surveyVersion,
        status: 'published',
        sections: sections,
        description: 'Visual Survey Designer Questionnaire DSL with Dynamic Jump Logic & Markdown Guidance',
      };
      await api.updateQuestSurvey('survey-fleet-safety-2026', payload);
      setLastSaved(new Date());
      showToast('Autosaved questionnaire to PostgreSQL DES_BASE.quest_surveys');
    } catch (err) {
      console.warn('Autosave error', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── PAGE MANAGEMENT MODALS & CONTROLS ──
  const handleOpenAddPage = () => {
    setIsNewPageMode(true);
    setPageModalTitle(`Page ${sections.length + 1}: New Section`);
    setPageModalDesc('Configure requirements and scope for this page.');
    setIsPageModalOpen(true);
  };

  const handleOpenEditPage = () => {
    if (!activeSection) return;
    setIsNewPageMode(false);
    setPageModalTitle(activeSection.title);
    setPageModalDesc(activeSection.description);
    setIsPageModalOpen(true);
  };

  const handleSavePageModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageModalTitle.trim()) return;

    if (isNewPageMode) {
      const newSec: SurveySection = {
        id: `sec-${Date.now().toString().slice(-4)}`,
        title: pageModalTitle.trim(),
        description: pageModalDesc.trim(),
        sort_order: sections.length + 1,
        questions: [],
      };
      setSections((prev) => [...prev, newSec]);
      setActivePageIndex(sections.length);
      showToast(`Added "${newSec.title}".`);
    } else {
      setSections((prev) =>
        prev.map((s, idx) =>
          idx === activePageIndex
            ? { ...s, title: pageModalTitle.trim(), description: pageModalDesc.trim() }
            : s
        )
      );
      showToast(`Page details updated.`);
    }
    setIsPageModalOpen(false);
  };

  const handleDeleteActivePage = () => {
    if (sections.length <= 1) {
      alert('Cannot delete the only page in the questionnaire.');
      return;
    }
    if (!window.confirm(`Delete page "${activeSection.title}" and all its questions?`)) return;

    setSections((prev) => prev.filter((_, idx) => idx !== activePageIndex));
    setActivePageIndex((prev) => Math.max(0, prev - 1));
    showToast('Page deleted.');
  };

  // ── QUESTION MANAGEMENT & EDIT MODAL (Spacious max-w-5xl) ──
  const handleOpenQuestionModal = (q: SurveyQuestion) => {
    setEditingQuestion(q);
    setSelectedWidgetId(q.id);
    setQModalCode(q.code);
    setQModalText(q.text);
    setQModalType(q.question_type);
    setQModalRequired(q.required);
    setQModalHelp(q.help_text || '');
    setQModalGuidance(q.guidance_markdown || '');
    setQModalOptions(q.options ? [...q.options] : []);
    setQModalRatingScale(q.rating_config?.scaleType || '1-5');
    setQModalSliderMin(q.rating_config?.min ?? 0);
    setQModalSliderMax(q.rating_config?.max ?? 100);
    setQModalSliderStep(q.rating_config?.step ?? 5);
    setQModalLowLabel(q.rating_config?.lowLabel || 'Low');
    setQModalHighLabel(q.rating_config?.highLabel || 'High');
    setQMarkdownTab('edit');

    // Init Logic Jump State
    if (q.logic_jump) {
      setLogicSourceQId(q.logic_jump.sourceQuestionId);
      setLogicOperator(q.logic_jump.operator);
      setLogicMatchValue(q.logic_jump.matchValue);
      setLogicAction(q.logic_jump.action);
      setLogicTargetPageIndex(q.logic_jump.targetPageIndex ?? 0);
    } else {
      const defaultSrc = eligibleSourceQuestions[0]?.id || '';
      setLogicSourceQId(defaultSrc);
      setLogicOperator('equals');
      setLogicMatchValue('');
      setLogicAction('jump_page');
      setLogicTargetPageIndex(Math.min(activePageIndex + 1, sections.length - 1));
    }
  };

  const handleAddOptionItem = () => {
    const newOpt: QuestionOption = {
      id: `opt-${Date.now().toString().slice(-4)}`,
      label: `Choice ${qModalOptions.length + 1}`,
      value: `choice_${qModalOptions.length + 1}`,
      score: 1,
    };
    setQModalOptions((prev) => [...prev, newOpt]);
  };

  const handleRemoveOptionItem = (id: string) => {
    setQModalOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleUpdateOptionItem = (id: string, field: keyof QuestionOption, val: any) => {
    setQModalOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: val } : o))
    );
  };

  const handleBindReferenceDataset = (listKey: string) => {
    const ds = referenceDatasets.find((d) => d.list_key === listKey);
    if (!ds) return;
    setQModalOptions(
      ds.items.map((i: any, idx: number) => ({
        id: `opt-ref-${idx + 1}`,
        label: i.label,
        value: i.value,
        score: i.score || 1,
      }))
    );
    showToast(`Loaded options from Reference List "${ds.list_name}".`);
  };

  const handleSaveQuestionModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !qModalText.trim()) return;

    const sourceObj = allSurveyQuestions.find((q) => q.id === logicSourceQId);
    const targetPageObj = sections[logicTargetPageIndex];

    const updated: SurveyQuestion = {
      ...editingQuestion,
      code: qModalCode.trim() || editingQuestion.code,
      text: qModalText.trim(),
      question_type: qModalType,
      required: qModalType === 'logic_jump' ? false : qModalRequired,
      help_text: qModalHelp.trim() || undefined,
      guidance_markdown: qModalGuidance.trim() || undefined,
      options:
        qModalType === 'single_choice' ||
        qModalType === 'multiple_choice' ||
        qModalType === 'dropdown'
          ? qModalOptions
          : undefined,
      rating_config:
        qModalType === 'rating' || qModalType === 'slider'
          ? {
              scaleType: qModalRatingScale,
              min: qModalSliderMin,
              max: qModalSliderMax,
              step: qModalSliderStep,
              lowLabel: qModalLowLabel,
              highLabel: qModalHighLabel,
            }
          : undefined,
      logic_jump:
        qModalType === 'logic_jump'
          ? {
              sourceQuestionId: logicSourceQId,
              sourceQuestionCode: sourceObj ? sourceObj.code : undefined,
              operator: logicOperator,
              matchValue: logicMatchValue.trim(),
              action: logicAction,
              targetPageIndex: logicTargetPageIndex,
              targetPageTitle: targetPageObj ? targetPageObj.title : undefined,
            }
          : undefined,
    };

    setSections((prev) =>
      prev.map((s, idx) =>
        idx === activePageIndex
          ? {
              ...s,
              questions: s.questions.map((q) => (q.id === updated.id ? updated : q)),
            }
          : s
      )
    );

    setEditingQuestion(null);
    showToast(`Saved question "${updated.code}" specifications.`);
  };

  const handleDuplicateQuestion = (q: SurveyQuestion) => {
    const duplicated: SurveyQuestion = {
      ...q,
      id: `q-${Date.now().toString().slice(-4)}`,
      code: `${q.code}-COPY`,
      text: `${q.text} (Copy)`,
    };
    setSections((prev) =>
      prev.map((s, idx) =>
        idx === activePageIndex ? { ...s, questions: [...s.questions, duplicated] } : s
      )
    );
    showToast(`Duplicated ${q.code}.`);
  };

  const handleMoveQuestion = (qId: string, direction: 'up' | 'down') => {
    if (!activeSection) return;
    const qList = [...activeSection.questions];
    const index = qList.findIndex((q) => q.id === qId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = qList[index];
      qList[index] = qList[index - 1];
      qList[index - 1] = temp;
    } else if (direction === 'down' && index < qList.length - 1) {
      const temp = qList[index];
      qList[index] = qList[index + 1];
      qList[index + 1] = temp;
    }

    setSections((prev) =>
      prev.map((s, idx) => (idx === activePageIndex ? { ...s, questions: qList } : s))
    );
  };

  const handleDeleteQuestion = (qId: string) => {
    setSections((prev) =>
      prev.map((s, idx) =>
        idx === activePageIndex
          ? { ...s, questions: s.questions.filter((q) => q.id !== qId) }
          : s
      )
    );
    showToast('Question deleted.');
  };

  // ── RIGHT-CLICK CONTEXT MENU ──
  const handleContextMenu = (e: React.MouseEvent, q: SurveyQuestion) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: Math.min(e.clientX, window.innerWidth - 220),
      y: Math.min(e.clientY, window.innerHeight - 200),
      question: q,
    });
  };

  // ── DRAG AND DROP ONTO CANVAS ──
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const comp = JSON.parse(rawData);

      const isLogicJump = comp.type === 'logic_jump';
      const firstSrc = eligibleSourceQuestions[0];

      const newQ: SurveyQuestion = {
        id: `q-${Date.now().toString().slice(-4)}`,
        code: isLogicJump
          ? `JUMP-${Math.floor(10 + Math.random() * 90)}`
          : `Q-${Math.floor(10 + Math.random() * 90)}`,
        text: isLogicJump
          ? `Conditional Branch: Jump to Page ${Math.min(activePageIndex + 2, sections.length)}`
          : `New ${comp.label || 'Question'} Item`,
        question_type: comp.type || 'text',
        required: false,
        sort_order: (activeSection?.questions.length || 0) + 1,
        options:
          comp.defaultProps?.options ||
          (comp.type === 'single_choice'
            ? [
                { id: 'opt-1', label: 'Option 1', value: 'opt_1' },
                { id: 'opt-2', label: 'Option 2', value: 'opt_2' },
              ]
            : undefined),
        logic_jump: isLogicJump
          ? {
              sourceQuestionId: firstSrc ? firstSrc.id : '',
              sourceQuestionCode: firstSrc ? firstSrc.code : 'Q-01',
              operator: 'equals',
              matchValue: '',
              action: 'jump_page',
              targetPageIndex: Math.min(activePageIndex + 1, sections.length - 1),
              targetPageTitle: sections[Math.min(activePageIndex + 1, sections.length - 1)]?.title,
            }
          : undefined,
      };

      setSections((prev) =>
        prev.map((s, idx) =>
          idx === activePageIndex ? { ...s, questions: [...s.questions, newQ] } : s
        )
      );
      showToast(`Added "${comp.label}" to Page ${activePageIndex + 1}.`);
    } catch (err) {
      console.warn('Drop error', err);
    }
  };

  // ── STEP-BY-STEP RUNNER WITH CONDITIONAL LOGIC EVALUATION ──
  const currentRunnerQuestion = allSurveyQuestions[runnerStepIndex];
  const progressPercent = Math.round(
    ((runnerStepIndex + 1) / Math.max(1, allSurveyQuestions.length)) * 100
  );

  const handleStartRunner = () => {
    setRunnerStepIndex(0);
    setPreviewAnswers({});
    setPreviewSubmitted(false);
    setJumpBanner(null);
    setIsPreviewOpen(true);
  };

  const evaluateJumpCondition = (jump: LogicJumpConfig): boolean => {
    const answer = previewAnswers[jump.sourceQuestionId];
    if (answer === undefined || answer === null || answer === '') {
      if (jump.operator === 'empty') return true;
      return false;
    }

    const valStr = String(answer).toLowerCase().trim();
    const matchStr = String(jump.matchValue || '').toLowerCase().trim();

    switch (jump.operator) {
      case 'equals':
        return valStr === matchStr;
      case 'not_equals':
        return valStr !== matchStr;
      case 'contains':
        if (Array.isArray(answer)) return answer.includes(jump.matchValue);
        return valStr.includes(matchStr);
      case 'greater':
        return Number(answer) > Number(jump.matchValue);
      case 'less':
        return Number(answer) < Number(jump.matchValue);
      case 'not_empty':
        return valStr !== '';
      case 'empty':
        return valStr === '';
      default:
        return false;
    }
  };

  const handleRunnerNext = () => {
    // If the current question has an attached logic jump, or is a logic jump node
    if (currentRunnerQuestion?.question_type === 'logic_jump' && currentRunnerQuestion.logic_jump) {
      const jump = currentRunnerQuestion.logic_jump;
      const isMet = evaluateJumpCondition(jump);

      if (isMet) {
        if (jump.action === 'complete_survey') {
          handleFinalSubmitRunner();
          return;
        }

        if (jump.action === 'jump_page' && jump.targetPageIndex !== undefined) {
          const targetPage = sections[jump.targetPageIndex];
          if (targetPage && targetPage.questions.length > 0) {
            // Find index of first question of target page in allSurveyQuestions
            const targetQ = targetPage.questions[0];
            const targetIndex = allSurveyQuestions.findIndex((q) => q.id === targetQ.id);
            if (targetIndex !== -1) {
              setJumpBanner(
                `🔀 Branching Triggered: Jumped directly to "${targetPage.title}"`
              );
              setRunnerStepIndex(targetIndex);
              return;
            }
          }
        }
      }
    }

    setJumpBanner(null);
    if (runnerStepIndex < allSurveyQuestions.length - 1) {
      setRunnerStepIndex((prev) => prev + 1);
    } else {
      handleFinalSubmitRunner();
    }
  };

  const handleRunnerBack = () => {
    setJumpBanner(null);
    if (runnerStepIndex > 0) {
      setRunnerStepIndex((prev) => prev - 1);
    }
  };

  const handleFinalSubmitRunner = async () => {
    try {
      await api.createQuestSubmission({
        survey_id: 'survey-fleet-safety-2026',
        respondent_id: 'driver-test-session',
        status: 'completed',
        answers: previewAnswers,
      });
      setPreviewSubmitted(true);
      showToast('Audit response committed to DES_BASE.quest_submissions');
    } catch (err) {
      console.error('Submission failed', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none overflow-hidden relative">
      {/* ── 1. Top Header Toolbar (Space Optimized) ── */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                className="font-bold text-sm text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-hidden px-1"
              />
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                v{surveyVersion}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                DES_BASE.quest_surveys
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Single-Page Visual Designer • Dedicated Conditional Jump Logic • Interactive Markdown & Options • Autosave
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {notification && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {notification}
            </span>
          )}

          {lastSaved && (
            <span className="text-[10px] font-mono text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveToBackend}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save to DES_BASE'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Page Navigation & Pagination Menu (Previous, Page Name, Dropdown with order numbering, Add Page, Edit, Delete, Play, Next) ── */}
      <div className="h-12 border-b border-border bg-card/60 px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          {/* Previous Page Control */}
          <button
            type="button"
            disabled={activePageIndex <= 0}
            onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
            className="p-1.5 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:pointer-events-none text-foreground transition-all cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Dropdown with Numbering */}
          <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2.5 py-1">
            <span className="text-[10px] font-mono font-bold text-primary">PAGE {activePageIndex + 1}:</span>
            <select
              value={activePageIndex}
              onChange={(e) => setActivePageIndex(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-hidden cursor-pointer"
            >
              {sections.map((sec, idx) => (
                <option key={sec.id} value={idx}>
                  {idx + 1}. {sec.title} ({idx + 1}/{sections.length})
                </option>
              ))}
            </select>
          </div>

          {/* Add Page Button */}
          <button
            type="button"
            onClick={handleOpenAddPage}
            className="p-1.5 rounded-xl border border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold px-2.5"
            title="Add New Page / Section"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Page</span>
          </button>

          {/* Edit Page Button */}
          <button
            type="button"
            onClick={handleOpenEditPage}
            className="p-1.5 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Edit Active Page Specifications"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Page Button */}
          <button
            type="button"
            onClick={handleDeleteActivePage}
            className="p-1.5 rounded-xl border border-border bg-background hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
            title="Delete Current Page"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Play / Live Preview Button */}
          <button
            type="button"
            onClick={handleStartRunner}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Play / Test Survey with Live Jump Logic Evaluation"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Survey ({allSurveyQuestions.length} Items)</span>
          </button>

          {/* Next Page Control */}
          <button
            type="button"
            disabled={activePageIndex >= sections.length - 1}
            onClick={() => setActivePageIndex((prev) => Math.min(sections.length - 1, prev + 1))}
            className="p-1.5 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:pointer-events-none text-foreground transition-all cursor-pointer flex items-center gap-1 text-xs font-bold px-2.5"
            title="Next Page"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 3. Full-Width Single-Page Questionnaire Canvas with Dedicated Jump Logic Cards ── */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 overflow-auto p-6 md:p-8 relative w-full transition-colors ${
          isDragOver ? 'bg-primary/5 ring-2 ring-dashed ring-primary ring-inset' : ''
        }`}
      >
        {activeSection ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-in fade-in-50 duration-200 w-full">
            {/* Page Header */}
            <div className="p-5 bg-muted/40 border-b border-border space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary text-primary-foreground">
                    PAGE {activePageIndex + 1} OF {sections.length}
                  </span>
                  <h3 className="font-bold text-sm text-foreground">{activeSection.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEditPage}
                  className="p-1 text-muted-foreground hover:text-primary rounded-lg transition-colors cursor-pointer"
                  title="Configure Page"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              {activeSection.description && (
                <p className="text-xs text-muted-foreground pl-1">{activeSection.description}</p>
              )}
            </div>

            {/* Questions Container (Full Width) */}
            <div className="p-6 space-y-3.5">
              {activeSection.questions.length === 0 ? (
                <div className="p-16 border border-dashed border-border rounded-xl text-center text-muted-foreground">
                  <ListPlus className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-sm text-foreground">Page is currently empty</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag components from the left <strong>Q Toolbox</strong> onto this canvas or click + to add questions.
                  </p>
                </div>
              ) : (
                activeSection.questions.map((q, qIdx) => {
                  const isSelected = selectedWidgetId === q.id;
                  const isLogicJump = q.question_type === 'logic_jump';

                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedWidgetId(q.id)}
                      onContextMenu={(e) => handleContextMenu(e, q)}
                      onDoubleClick={() => handleOpenQuestionModal(q)}
                      className={`p-4 rounded-xl border bg-background transition-all space-y-2 group shadow-2xs cursor-pointer relative ${
                        isLogicJump
                          ? 'border-purple-500/40 bg-purple-500/5 hover:border-purple-500/70'
                          : isSelected
                          ? 'border-primary ring-2 ring-primary/20 shadow-md'
                          : 'border-border/80 hover:border-primary/50'
                      }`}
                      title="Click to select, right-click for options, double-click to edit specifications"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Reordering Controls */}
                          <div
                            className="flex flex-col gap-0.5 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              disabled={qIdx === 0}
                              onClick={() => handleMoveQuestion(q.id, 'up')}
                              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer"
                              title="Move Item Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={qIdx === activeSection.questions.length - 1}
                              onClick={() => handleMoveQuestion(q.id, 'down')}
                              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer"
                              title="Move Item Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          {isLogicJump ? (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1 shrink-0">
                              <GitBranch className="w-3 h-3" />
                              {q.code}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-primary border border-border shrink-0">
                              {q.code}
                            </span>
                          )}

                          <div className="font-semibold text-xs text-foreground truncate">
                            {q.text} {q.required && <span className="text-rose-400">*</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                              isLogicJump
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {q.question_type}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenQuestionModal(q);
                            }}
                            className="p-1 text-muted-foreground hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Edit Specifications"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateQuestion(q);
                            }}
                            className="p-1 text-muted-foreground hover:text-cyan-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(q.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-rose-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 🔀 Dedicated Logic Jump Flow Visualizer */}
                      {isLogicJump && q.logic_jump && (
                        <div className="pl-6 pt-1">
                          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-purple-300 flex items-center gap-1">
                              <Workflow className="w-3.5 h-3.5 text-purple-400" />
                              IF
                            </span>
                            <span className="font-mono px-2 py-0.5 bg-background border border-border rounded-md text-foreground font-bold">
                              {`{${q.logic_jump.sourceQuestionCode || q.logic_jump.sourceQuestionId || 'Source'}}`}
                            </span>
                            <span className="font-mono text-purple-300 uppercase font-bold">
                              {q.logic_jump.operator}
                            </span>
                            <span className="font-mono px-2 py-0.5 bg-background border border-border rounded-md text-cyan-400 font-bold">
                              {`"${q.logic_jump.matchValue || '*'}"`}
                            </span>
                            <ArrowRight className="w-4 h-4 text-purple-400" />
                            <span className="font-semibold text-foreground">
                              {q.logic_jump.action === 'complete_survey'
                                ? 'Complete Audit & Terminate Immediately'
                                : `THEN Jump to Page ${
                                    (q.logic_jump.targetPageIndex ?? 0) + 1
                                  }: "${q.logic_jump.targetPageTitle || 'Target Page'}"`}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Options / Visual Mockup */}
                      {!isLogicJump && q.options && q.options.length > 0 && (
                        <div className="pl-6 pt-1 space-y-1.5">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              {q.question_type === 'multiple_choice' ? (
                                <CheckSquare className="w-3.5 h-3.5 text-primary/70" />
                              ) : (
                                <Radio className="w-3.5 h-3.5 text-purple-400/70" />
                              )}
                              <span className="font-medium text-foreground">{opt.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 1-5 or 1-10 Rating Preview */}
                      {!isLogicJump && q.question_type === 'rating' && (
                        <div className="pl-6 pt-1 flex items-center gap-2">
                          {(q.rating_config?.scaleType === '1-10'
                            ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                            : [1, 2, 3, 4, 5]
                          ).map((s) => (
                            <div
                              key={s}
                              className="w-8 h-8 rounded-xl border border-border bg-muted/30 flex items-center justify-center text-xs font-bold text-foreground"
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Continuous Slider Preview */}
                      {!isLogicJump && q.question_type === 'slider' && (
                        <div className="pl-6 pt-2 space-y-1 max-w-md">
                          <input
                            type="range"
                            min={q.rating_config?.min ?? 0}
                            max={q.rating_config?.max ?? 100}
                            step={q.rating_config?.step ?? 5}
                            disabled
                            className="w-full cursor-pointer accent-primary"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                            <span>{q.rating_config?.lowLabel || 'Min (0)'}</span>
                            <span>{q.rating_config?.highLabel || 'Max (100)'}</span>
                          </div>
                        </div>
                      )}

                      {q.help_text && (
                        <div className="pl-6 text-[10px] text-muted-foreground/80 italic">
                          💡 {q.help_text}
                        </div>
                      )}

                      {q.guidance_markdown && (
                        <div className="pl-6 text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Includes Guidance Documentation</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom DND Drop Target */}
            <div className="p-4 bg-muted/20 border-t border-dashed border-border text-center text-xs text-muted-foreground">
              <span className="font-mono text-[10px]">
                Drop additional component blocks or Conditional Logic Jump boxes here to append to Page {activePageIndex + 1}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 text-muted-foreground">
            <p>No pages configured.</p>
          </div>
        )}
      </div>

      {/* ── 4. Right-Click Context Menu ── */}
      {contextMenu.visible && contextMenu.question && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-card border border-border rounded-xl shadow-2xl py-1.5 w-52 text-xs animate-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] font-mono text-muted-foreground border-b border-border/50 uppercase font-bold">
            {contextMenu.question.code} Options
          </div>
          <button
            type="button"
            onClick={() => {
              if (contextMenu.question) handleOpenQuestionModal(contextMenu.question);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-primary" />
            <span>Edit Specifications</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (contextMenu.question) handleDuplicateQuestion(contextMenu.question);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Duplicate Item</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (contextMenu.question) handleMoveQuestion(contextMenu.question.id, 'up');
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Move Item Up</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (contextMenu.question) handleMoveQuestion(contextMenu.question.id, 'down');
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Move Item Down</span>
          </button>
          <div className="my-1 border-t border-border/50" />
          <button
            type="button"
            onClick={() => {
              if (contextMenu.question) handleDeleteQuestion(contextMenu.question.id);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full px-3 py-2 text-left hover:bg-rose-500/10 flex items-center gap-2 text-rose-400 font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Item</span>
          </button>
        </div>
      )}

      {/* ── 5. Centered Page Add / Edit Modal ── */}
      {isPageModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {isNewPageMode ? 'Add New Questionnaire Page' : 'Edit Page Specifications'}
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Authoritative PostgreSQL: <strong className="text-primary">DES_BASE.quest_surveys</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPageModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePageModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Page Title *</label>
                <input
                  type="text"
                  required
                  value={pageModalTitle}
                  onChange={(e) => setPageModalTitle(e.target.value)}
                  placeholder="e.g. Driver Fitness & Daily Fatigue Check"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Scope & Respondent Instructions
                </label>
                <textarea
                  value={pageModalDesc}
                  onChange={(e) => setPageModalDesc(e.target.value)}
                  rows={3}
                  placeholder="Describe guidelines for this page/section..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPageModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save to DES_BASE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. Extra Large Centered Question & Conditional Logic Jump Modal (max-w-5xl) ── */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  {qModalType === 'logic_jump' ? (
                    <GitBranch className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {qModalType === 'logic_jump'
                      ? `Conditional Logic Jump Configuration (${qModalCode})`
                      : `Question Specifications (${qModalCode})`}
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    PostgreSQL Persisted: <strong className="text-primary">DES_BASE.quest_questions</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveQuestionModal} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Row 1: Code & Component Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Code / Variable ID *</label>
                  <input
                    type="text"
                    required
                    value={qModalCode}
                    onChange={(e) => setQModalCode(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Component Category</label>
                  <select
                    value={qModalType}
                    onChange={(e) => setQModalType(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="textarea">Multiline Remarks</option>
                    <option value="number">Number / Quantity</option>
                    <option value="single_choice">Single Choice (Radio)</option>
                    <option value="multiple_choice">Multiple Choice (Checkbox)</option>
                    <option value="dropdown">Dropdown Selector</option>
                    <option value="rating">Likert Rating (1-5 / 1-10)</option>
                    <option value="slider">Continuous Range Slider</option>
                    <option value="date">Date & Time</option>
                    <option value="file_upload">File Upload</option>
                    <option value="signature">Digital Signature</option>
                    <option value="logic_jump">🔀 Conditional Logic Jump</option>
                  </select>
                </div>
                {qModalType !== 'logic_jump' && (
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-foreground font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qModalRequired}
                        onChange={(e) => setQModalRequired(e.target.checked)}
                        className="rounded text-primary focus:ring-0"
                      />
                      <span>Mandatory / Required Field</span>
                    </label>
                  </div>
                )}
              </div>

              {/* 🔀 DEDICATED CONDITIONAL LOGIC JUMP INTERACTIVE BUILDER 🔀 */}
              {qModalType === 'logic_jump' ? (
                <div className="p-5 rounded-2xl border border-purple-500/40 bg-purple-500/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                        <Workflow className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-foreground">
                        Conditional Jump Rules (If-This-Then-Jump)
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      Dynamic Branching Engine
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Define the condition under which the respondent will be automatically redirected to a specific page or action.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Source Trigger Question */}
                    <div>
                      <label className="block font-semibold text-foreground mb-1">
                        1. Source Question Trigger *
                      </label>
                      <select
                        value={logicSourceQId}
                        onChange={(e) => setLogicSourceQId(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden cursor-pointer"
                      >
                        {eligibleSourceQuestions.map((sq) => (
                          <option key={sq.id} value={sq.id}>
                            [{sq.code}] {sq.text.slice(0, 35)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator */}
                    <div>
                      <label className="block font-semibold text-foreground mb-1">2. Condition Operator *</label>
                      <select
                        value={logicOperator}
                        onChange={(e) => setLogicOperator(e.target.value as any)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden cursor-pointer"
                      >
                        <option value="equals">Equals (=)</option>
                        <option value="not_equals">Does Not Equal (!=)</option>
                        <option value="contains">Contains (Checklist / Text)</option>
                        <option value="greater">Greater Than (&gt;)</option>
                        <option value="less">Less Than (&lt;)</option>
                        <option value="not_empty">Is Answered / Not Empty</option>
                        <option value="empty">Is Blank / Empty</option>
                      </select>
                    </div>

                    {/* Match Value */}
                    <div>
                      <label className="block font-semibold text-foreground mb-1">3. Match Value / Answer *</label>
                      <input
                        type="text"
                        disabled={logicOperator === 'empty' || logicOperator === 'not_empty'}
                        value={logicMatchValue}
                        onChange={(e) => setLogicMatchValue(e.target.value)}
                        placeholder="e.g. vin_volvo_1294, optimal, 4"
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Action */}
                    <div>
                      <label className="block font-semibold text-foreground mb-1">4. Jump Action *</label>
                      <select
                        value={logicAction}
                        onChange={(e) => setLogicAction(e.target.value as any)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden cursor-pointer"
                      >
                        <option value="jump_page">Jump Directly to Page</option>
                        <option value="complete_survey">Complete Survey & Terminate Early</option>
                        <option value="skip_next">Skip Remaining Questions on Page</option>
                      </select>
                    </div>

                    {/* Target Page */}
                    {logicAction === 'jump_page' && (
                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          5. Target Destination Page *
                        </label>
                        <select
                          value={logicTargetPageIndex}
                          onChange={(e) => setLogicTargetPageIndex(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden cursor-pointer font-medium"
                        >
                          {sections.map((sec, sIdx) => (
                            <option key={sec.id} value={sIdx}>
                              Page {sIdx + 1}: {sec.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Visual Expression Pill */}
                  <div className="p-3 bg-background border border-purple-500/30 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                      Compiled Jump Expression Preview
                    </span>
                    <div className="font-mono text-xs text-purple-300 flex items-center gap-2 flex-wrap">
                      <code className="px-2 py-0.5 bg-muted rounded border border-border text-foreground font-bold">
                        {`{${
                          eligibleSourceQuestions.find((q) => q.id === logicSourceQId)?.code || 'SOURCE_CODE'
                        }}`}
                      </code>
                      <span className="text-purple-400 font-bold">{logicOperator}</span>
                      <code className="px-2 py-0.5 bg-muted rounded border border-border text-cyan-400 font-bold">
                        {`"${logicMatchValue || '*'}"`}
                      </code>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-emerald-400 font-bold">
                        {logicAction === 'complete_survey'
                          ? 'TERMINATE & SUBMIT AUDIT'
                          : `JUMP TO PAGE ${logicTargetPageIndex + 1} (${
                              sections[logicTargetPageIndex]?.title || 'Target'
                            })`}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Row 2: Prompt Text & Markdown Guidance with Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-foreground">
                    {qModalType === 'logic_jump' ? 'Branch Description / Note *' : 'Question Prompt Text *'}
                  </label>
                  <div className="flex items-center bg-muted/60 border border-border rounded-lg p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setQMarkdownTab('edit')}
                      className={`px-2.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                        qMarkdownTab === 'edit' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setQMarkdownTab('split')}
                      className={`px-2.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                        qMarkdownTab === 'split' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                      }`}
                    >
                      Split View
                    </button>
                    <button
                      type="button"
                      onClick={() => setQMarkdownTab('preview')}
                      className={`px-2.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                        qMarkdownTab === 'preview' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {qMarkdownTab === 'edit' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={qModalText}
                      onChange={(e) => setQModalText(e.target.value)}
                      placeholder="Enter the primary question prompt or branch description..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                    {qModalType !== 'logic_jump' && (
                      <textarea
                        value={qModalGuidance}
                        onChange={(e) => setQModalGuidance(e.target.value)}
                        rows={4}
                        placeholder="Add rich markdown guidance, audit references, checklists, or compliance notes (e.g. ### Protocol Checklist)..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl font-mono text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                      />
                    )}
                  </div>
                )}

                {qMarkdownTab === 'split' && (
                  <div className="grid grid-cols-2 gap-3">
                    <textarea
                      value={qModalGuidance}
                      onChange={(e) => setQModalGuidance(e.target.value)}
                      rows={6}
                      placeholder="Enter markdown..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl font-mono text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                    />
                    <div className="p-3 bg-muted/20 border border-border rounded-xl overflow-y-auto max-h-40 prose prose-sm dark:prose-invert">
                      <p className="font-bold text-xs">{qModalText}</p>
                      <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {qModalGuidance || 'No guidance text added.'}
                      </div>
                    </div>
                  </div>
                )}

                {qMarkdownTab === 'preview' && (
                  <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                    <p className="font-bold text-sm text-foreground">{qModalText}</p>
                    <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {qModalGuidance || 'No guidance text added.'}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 3: Interactive UI Options (for Choice Types) */}
              {(qModalType === 'single_choice' ||
                qModalType === 'multiple_choice' ||
                qModalType === 'dropdown') && (
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>Interactive Choice Options</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                        {qModalOptions.length} Items
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Reference Data Bind Dropdown */}
                      {referenceDatasets.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) handleBindReferenceDataset(e.target.value);
                          }}
                          className="px-2.5 py-1 bg-background border border-border rounded-lg text-[11px] text-foreground focus:outline-hidden cursor-pointer"
                        >
                          <option value="">-- Load from Reference Dataset --</option>
                          {referenceDatasets.map((ds) => (
                            <option key={ds.id} value={ds.list_key}>
                              {ds.list_name} ({ds.items?.length || 0} items)
                            </option>
                          ))}
                        </select>
                      )}

                      <button
                        type="button"
                        onClick={handleAddOptionItem}
                        className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-xs hover:bg-primary/90 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Option</span>
                      </button>
                    </div>
                  </div>

                  {/* Options Table UI */}
                  <div className="space-y-2">
                    {qModalOptions.map((opt, oIdx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground w-6 text-center">
                          #{oIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleUpdateOptionItem(opt.id, 'label', e.target.value)}
                          placeholder="Option Label (e.g. Scania R500)"
                          className="flex-1 px-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                        />
                        <input
                          type="text"
                          value={opt.value}
                          onChange={(e) => handleUpdateOptionItem(opt.id, 'value', e.target.value)}
                          placeholder="Value Key (e.g. vin_scania)"
                          className="w-48 px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionItem(opt.id)}
                          className="p-1.5 text-muted-foreground hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove Option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Row 4: Rating Scale & Range Slider Customizer */}
              {(qModalType === 'rating' || qModalType === 'slider') && (
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                  <div className="font-semibold text-foreground">Rating Scale & Slider Range Configuration</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Scale Type</label>
                      <select
                        value={qModalRatingScale}
                        onChange={(e) => setQModalRatingScale(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-foreground focus:outline-hidden cursor-pointer"
                      >
                        <option value="1-5">1 to 5 Star / Button Scale</option>
                        <option value="1-10">1 to 10 NPS Scale</option>
                        <option value="slider">Continuous Range Slider (0-100)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Low Anchor Label</label>
                      <input
                        type="text"
                        value={qModalLowLabel}
                        onChange={(e) => setQModalLowLabel(e.target.value)}
                        placeholder="e.g. Defective / Poor"
                        className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-foreground focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">High Anchor Label</label>
                      <input
                        type="text"
                        value={qModalHighLabel}
                        onChange={(e) => setQModalHighLabel(e.target.value)}
                        placeholder="e.g. Optimal / Excellent"
                        className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-foreground focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Row 5: Help Text */}
              {qModalType !== 'logic_jump' && (
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Field Guidance / Help Text
                  </label>
                  <input
                    type="text"
                    value={qModalHelp}
                    onChange={(e) => setQModalHelp(e.target.value)}
                    placeholder="e.g. Enter odometer value from dashboard cluster..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 font-semibold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save to DES_BASE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. Step-by-Step Question Playback Runner Modal with Live Logic Jump Evaluation ── */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Runner Header with Progress Bar */}
            <div className="p-4 border-b border-border bg-muted/40 shrink-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Interactive Survey Playback</h3>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Item {runnerStepIndex + 1} of {allSurveyQuestions.length} • {progressPercent}% Completed
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/60">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Jump Alert Banner */}
            {jumpBanner && (
              <div className="px-6 py-2.5 bg-purple-500/15 border-b border-purple-500/30 text-purple-300 font-medium text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
                <GitBranch className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{jumpBanner}</span>
              </div>
            )}

            {/* Runner Body: One Question at a Time */}
            {previewSubmitted ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Inspection Audit Submitted!</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your response payload was validated and securely stored into PostgreSQL schema DES_BASE.quest_submissions.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Close Runner
                </button>
              </div>
            ) : currentRunnerQuestion ? (
              <div className="p-8 space-y-6 overflow-y-auto flex-1 text-xs">
                {currentRunnerQuestion.question_type === 'logic_jump' ? (
                  <div className="p-6 rounded-2xl border border-purple-500/40 bg-purple-500/10 space-y-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                      <GitBranch className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">
                      Conditional Branch Point: {currentRunnerQuestion.code}
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      {currentRunnerQuestion.text}
                    </p>
                    {currentRunnerQuestion.logic_jump && (
                      <div className="p-3 bg-background border border-purple-500/30 rounded-xl font-mono text-xs text-purple-300 max-w-md mx-auto">
                        IF {`{${currentRunnerQuestion.logic_jump.sourceQuestionCode || 'Source'}}`} {currentRunnerQuestion.logic_jump.operator} "{currentRunnerQuestion.logic_jump.matchValue}" ➔ THEN Jump
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground/80 italic">
                      Click "Next Question" below to evaluate this branch dynamically.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {currentRunnerQuestion.code}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">
                          {currentRunnerQuestion.question_type}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-foreground pt-1">
                        {currentRunnerQuestion.text}{' '}
                        {currentRunnerQuestion.required && <span className="text-rose-400">*</span>}
                      </h4>
                      {currentRunnerQuestion.help_text && (
                        <p className="text-xs text-muted-foreground">{currentRunnerQuestion.help_text}</p>
                      )}
                      {currentRunnerQuestion.guidance_markdown && (
                        <div className="p-3 bg-muted/30 border border-border rounded-xl text-xs text-muted-foreground whitespace-pre-wrap mt-2">
                          {currentRunnerQuestion.guidance_markdown}
                        </div>
                      )}
                    </div>

                    {/* Input Fields based on Type */}
                    <div className="space-y-3 pt-2">
                      {currentRunnerQuestion.question_type === 'text' && (
                        <input
                          type="text"
                          value={previewAnswers[currentRunnerQuestion.id] || ''}
                          onChange={(e) =>
                            setPreviewAnswers((prev) => ({
                              ...prev,
                              [currentRunnerQuestion.id]: e.target.value,
                            }))
                          }
                          placeholder="Type your response..."
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                        />
                      )}

                      {currentRunnerQuestion.question_type === 'number' && (
                        <input
                          type="number"
                          value={previewAnswers[currentRunnerQuestion.id] || ''}
                          onChange={(e) =>
                            setPreviewAnswers((prev) => ({
                              ...prev,
                              [currentRunnerQuestion.id]: e.target.value,
                            }))
                          }
                          placeholder="0"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                        />
                      )}

                      {currentRunnerQuestion.question_type === 'textarea' && (
                        <textarea
                          rows={3}
                          value={previewAnswers[currentRunnerQuestion.id] || ''}
                          onChange={(e) =>
                            setPreviewAnswers((prev) => ({
                              ...prev,
                              [currentRunnerQuestion.id]: e.target.value,
                            }))
                          }
                          placeholder="Enter detailed observations..."
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                        />
                      )}

                      {(currentRunnerQuestion.question_type === 'single_choice' ||
                        currentRunnerQuestion.question_type === 'dropdown') &&
                        currentRunnerQuestion.options && (
                          <div className="space-y-2">
                            {currentRunnerQuestion.options.map((opt) => (
                              <label
                                key={opt.id}
                                className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/40 cursor-pointer text-xs transition-colors"
                              >
                                <input
                                  type="radio"
                                  name={currentRunnerQuestion.id}
                                  value={opt.value}
                                  checked={previewAnswers[currentRunnerQuestion.id] === opt.value}
                                  onChange={() =>
                                    setPreviewAnswers((prev) => ({
                                      ...prev,
                                      [currentRunnerQuestion.id]: opt.value,
                                    }))
                                  }
                                  className="text-primary focus:ring-0"
                                />
                                <span className="text-foreground font-semibold">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        )}

                      {currentRunnerQuestion.question_type === 'multiple_choice' &&
                        currentRunnerQuestion.options && (
                          <div className="space-y-2">
                            {currentRunnerQuestion.options.map((opt) => {
                              const curList: string[] = previewAnswers[currentRunnerQuestion.id] || [];
                              const isChecked = curList.includes(opt.value);
                              return (
                                <label
                                  key={opt.id}
                                  className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/40 cursor-pointer text-xs transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const next = e.target.checked
                                        ? [...curList, opt.value]
                                        : curList.filter((v) => v !== opt.value);
                                      setPreviewAnswers((prev) => ({
                                        ...prev,
                                        [currentRunnerQuestion.id]: next,
                                      }));
                                    }}
                                    className="rounded text-primary focus:ring-0"
                                  />
                                  <span className="text-foreground font-semibold">{opt.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                      {currentRunnerQuestion.question_type === 'rating' && (
                        <div className="flex items-center gap-2">
                          {(currentRunnerQuestion.rating_config?.scaleType === '1-10'
                            ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                            : [1, 2, 3, 4, 5]
                          ).map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() =>
                                setPreviewAnswers((prev) => ({
                                  ...prev,
                                  [currentRunnerQuestion.id]: score,
                                }))
                              }
                              className={`w-10 h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                previewAnswers[currentRunnerQuestion.id] === score
                                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                  : 'bg-background hover:bg-muted border-border text-foreground'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      )}

                      {currentRunnerQuestion.question_type === 'slider' && (
                        <div className="space-y-2">
                          <input
                            type="range"
                            min={currentRunnerQuestion.rating_config?.min ?? 0}
                            max={currentRunnerQuestion.rating_config?.max ?? 100}
                            step={currentRunnerQuestion.rating_config?.step ?? 5}
                            value={previewAnswers[currentRunnerQuestion.id] ?? 50}
                            onChange={(e) =>
                              setPreviewAnswers((prev) => ({
                                ...prev,
                                [currentRunnerQuestion.id]: Number(e.target.value),
                              }))
                            }
                            className="w-full accent-primary cursor-pointer"
                          />
                          <div className="flex justify-between font-mono text-xs text-muted-foreground">
                            <span>{currentRunnerQuestion.rating_config?.lowLabel || '0'}</span>
                            <span className="text-primary font-bold">
                              Value: {previewAnswers[currentRunnerQuestion.id] ?? 50}
                            </span>
                            <span>{currentRunnerQuestion.rating_config?.highLabel || '100'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Step Navigation Controls (Back / Next / Submit) */}
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <button
                    type="button"
                    disabled={runnerStepIndex === 0}
                    onClick={handleRunnerBack}
                    className="flex items-center gap-1.5 px-4 py-2 font-semibold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRunnerNext}
                    className="flex items-center gap-1.5 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <span>
                      {runnerStepIndex === allSurveyQuestions.length - 1
                        ? 'Submit Inspection Audit'
                        : 'Next Question'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualSurveyDesignerCanvas;
