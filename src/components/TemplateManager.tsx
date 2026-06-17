import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import {
  BookMarked,
  Save,
  Trash2,
  FolderOpen,
  CheckSquare,
  Square,
  FileText,
  Files,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
} from 'lucide-react';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useCopybookStore } from '@/store/useCopybookStore';
import {
  exportTemplatesToMergedPdf,
  exportTemplatesSeparately,
} from '@/utils/pdfExport';
import type { CopybookConfig, CopybookTemplate } from '@/types';
import { getFontById } from '@/utils/fonts';

interface TemplateManagerProps {
  className?: string;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTemplateConfigSnapshot(): CopybookConfig {
  const state = useCopybookStore.getState();
  return {
    textType: state.textType,
    text: state.text,
    fontId: state.fontId,
    gridType: state.gridType,
    cellSize: state.cellSize,
    colsPerRow: state.colsPerRow,
    rows: state.rows,
    writingDirection: state.writingDirection,
    fontColor: state.fontColor,
    gridColor: state.gridColor,
    showDashed: state.showDashed,
    showTrace: state.showTrace,
    traceOpacity: state.traceOpacity,
    traceDisplayMode: state.traceDisplayMode,
    title: state.title,
    subtitle: state.subtitle,
    nameField: state.nameField,
    dateField: state.dateField,
    classField: state.classField,
    headerPosition: state.headerPosition,
    showLineNumbers: state.showLineNumbers,
    paperTexture: state.paperTexture,
    watermark: state.watermark,
  };
}

function applyConfigToStore(config: CopybookConfig): void {
  useCopybookStore.setState({
    ...config,
    pagePaths: {},
    pageRedoStack: {},
    completedCells: {},
  });
}

export default function TemplateManager({ className }: TemplateManagerProps) {
  const {
    templates,
    selectedTemplateIds,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    deleteTemplates,
    toggleSelectTemplate,
    selectAllTemplates,
    clearSelection,
    loadTemplateToConfig,
  } = useTemplateStore(
    useShallow((s) => ({
      templates: s.templates,
      selectedTemplateIds: s.selectedTemplateIds,
      saveTemplate: s.saveTemplate,
      updateTemplate: s.updateTemplate,
      deleteTemplate: s.deleteTemplate,
      deleteTemplates: s.deleteTemplates,
      toggleSelectTemplate: s.toggleSelectTemplate,
      selectAllTemplates: s.selectAllTemplates,
      clearSelection: s.clearSelection,
      loadTemplateToConfig: s.loadTemplateToConfig,
    }))
  );

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const [exportError, setExportError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedTemplates = useMemo(
    () => templates.filter((t) => selectedTemplateIds.includes(t.id)),
    [templates, selectedTemplateIds]
  );

  const allSelected =
    templates.length > 0 && selectedTemplateIds.length === templates.length;

  const handleOpenSaveModal = () => {
    const state = useCopybookStore.getState();
    const suggested = state.title || state.text.slice(0, 15) || '字帖模板';
    setSaveName(suggested);
    setShowSaveModal(true);
    setSaveSuccess(false);
  };

  const handleSaveTemplate = () => {
    const name = saveName.trim();
    if (!name) return;
    const config = getTemplateConfigSnapshot();
    saveTemplate(name, config);
    setSaveSuccess(true);
    setTimeout(() => {
      setShowSaveModal(false);
      setSaveSuccess(false);
    }, 600);
  };

  const handleLoadTemplate = (id: string) => {
    loadTemplateToConfig(id, applyConfigToStore);
  };

  const handleDeleteSelected = () => {
    if (selectedTemplateIds.length === 0) return;
    const msg =
      selectedTemplateIds.length === 1
        ? '确定要删除选中的字帖模板吗？'
        : `确定要删除选中的 ${selectedTemplateIds.length} 个模板吗？`;
    if (confirm(msg)) {
      deleteTemplates(selectedTemplateIds);
    }
  };

  const handleDeleteOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除此模板吗？')) {
      deleteTemplate(id);
    }
  };

  const handleStartEdit = (tpl: CopybookTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(tpl.id);
    setEditingName(tpl.name);
  };

  const handleFinishEdit = () => {
    if (editingId && editingName.trim()) {
      updateTemplate(editingId, { name: editingName.trim() });
    }
    setEditingId(null);
  };

  const handleExportMerged = async () => {
    if (selectedTemplates.length === 0 || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      await exportTemplatesToMergedPdf(selectedTemplates, {
        filename: `字帖合集_${selectedTemplates.length}份.pdf`,
        progressCallback: (current, total) => {
          setExportProgress({ current, total });
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      setExportError(`导出失败：${msg}`);
    } finally {
      setExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  const handleExportSeparately = async () => {
    if (selectedTemplates.length === 0 || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      await exportTemplatesSeparately(selectedTemplates, {
        progressCallback: (current, total) => {
          setExportProgress({ current, total });
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      setExportError(`导出失败：${msg}`);
    } finally {
      setExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-stone-200/70 overflow-hidden shadow-sm ${
        className || ''
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-stone-50 to-white hover:from-stone-100/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-[#8B2E20]">
          <BookMarked size={16} strokeWidth={2} />
          <span className="font-semibold text-sm">字帖模板库</span>
          {templates.length > 0 && (
            <span className="px-2 py-0.5 bg-[#8B2E20]/10 rounded-full text-xs font-medium">
              {templates.length}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-stone-400" />
        ) : (
          <ChevronDown size={18} className="text-stone-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 py-4 border-t border-stone-100/70 space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenSaveModal}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#8B2E20] rounded-lg hover:bg-[#7a281c] transition-colors shadow-sm"
            >
              <Save size={16} />
              保存当前配置
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-sm">
              <BookMarked
                size={40}
                className="mx-auto mb-2 opacity-40"
                strokeWidth={1.5}
              />
              <p>暂无保存的模板</p>
              <p className="text-xs mt-1 opacity-70">配置好字帖后点击「保存当前配置」</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() =>
                    allSelected ? clearSelection() : selectAllTemplates()
                  }
                  className="flex items-center gap-1.5 text-stone-600 hover:text-stone-800 transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare size={14} className="text-[#8B2E20]" />
                  ) : (
                    <Square size={14} />
                  )}
                  {allSelected ? '取消全选' : '全选'}
                </button>
                {selectedTemplateIds.length > 0 && (
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <span>
                      已选 <b className="text-[#8B2E20]">{selectedTemplateIds.length}</b> 个
                    </span>
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-1 px-2 py-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="删除选中"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {selectedTemplateIds.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleExportMerged}
                    disabled={exporting}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#8B2E20] rounded-lg hover:bg-[#7a281c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <FileText size={14} />
                    合并导出
                  </button>
                  <button
                    onClick={handleExportSeparately}
                    disabled={exporting}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#8B2E20] bg-[#8B2E20]/10 rounded-lg hover:bg-[#8B2E20]/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Files size={14} />
                    分别导出
                  </button>
                </div>
              )}

              {exporting && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  <Loader2 size={14} className="animate-spin" />
                  <span>
                    正在导出... {exportProgress.current}/{exportProgress.total}
                  </span>
                </div>
              )}

              {exportError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                  {exportError}
                </div>
              )}

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplateIds.includes(tpl.id);
                  const isEditing = editingId === tpl.id;
                  const font = getFontById(tpl.config.fontId);
                  const charCount = Array.from(tpl.config.text).filter(
                    (ch) =>
                      ch !== '\n' && ch !== '\r' && ch !== '\t' && ch !== ' '
                  ).length;

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => toggleSelectTemplate(tpl.id)}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#8B2E20] bg-[#8B2E20]/5 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                      }`}
                    >
                      <div className="absolute top-2 left-2">
                        {isSelected ? (
                          <CheckSquare
                            size={16}
                            className="text-[#8B2E20]"
                            fill="currentColor"
                            stroke="white"
                            strokeWidth={2.5}
                          />
                        ) : (
                          <Square
                            size={16}
                            className="text-stone-300"
                          />
                        )}
                      </div>

                      <div className="pl-7 pr-14">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleFinishEdit();
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              onBlur={handleFinishEdit}
                              autoFocus
                              className="flex-1 px-2 py-1 text-sm font-medium text-stone-800 bg-white border border-[#8B2E20] rounded focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFinishEdit();
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span
                              className="text-sm font-medium text-stone-800 truncate"
                              title={tpl.name}
                            >
                              {tpl.name}
                            </span>
                            <button
                              onClick={(e) => handleStartEdit(tpl, e)}
                              className="p-0.5 text-stone-300 hover:text-stone-500 rounded transition-colors shrink-0"
                              title="重命名"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                        )}
                        {tpl.previewText && (
                          <div
                            className="mt-1 text-[11px] text-stone-500 truncate font-mono"
                            title={tpl.previewText}
                          >
                            {tpl.previewText}
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-stone-400">
                          <span>{font.name}</span>
                          <span>
                            {tpl.config.colsPerRow}×{tpl.config.rows}
                          </span>
                          <span>{charCount}字</span>
                          <span className="ml-auto">
                            {formatDate(tpl.updatedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadTemplate(tpl.id);
                          }}
                          className="p-1.5 text-stone-400 hover:text-[#8B2E20] hover:bg-[#8B2E20]/10 rounded-md transition-colors"
                          title="加载此模板"
                        >
                          <FolderOpen size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteOne(tpl.id, e)}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {showSaveModal &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-black/40 z-[9999] backdrop-blur-sm"
              onClick={() => !saveSuccess && setShowSaveModal(false)}
            />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8B2E20]/10 flex items-center justify-center">
                    <Save size={16} className="text-[#8B2E20]" />
                  </div>
                  <span className="font-semibold text-stone-800">
                    保存字帖模板
                  </span>
                </div>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    模板名称
                  </label>
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTemplate();
                    }}
                    autoFocus
                    placeholder="请输入模板名称"
                    className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B2E20]/30 focus:border-[#8B2E20] transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!saveName.trim() || saveSuccess}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#8B2E20] rounded-lg hover:bg-[#7a281c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >
                    {saveSuccess ? (
                      <>
                        <Check size={16} />
                        已保存
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        保存
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
        ,
        document.body
      )}
    </div>
  );
}
