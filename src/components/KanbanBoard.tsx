import React, { useState } from 'react';
import { StoreAuditData, KanbanStatus, KanbanHistoryEntry } from '../types';
import { KANBAN_STAGES, getKanbanStage, updateStoreKanbanStatus, ensureStoreKanban } from '../utils/kanbanHelpers';
import { downloadDirectPdf } from '../utils/pdfExport';
import { downloadProposalPdf } from '../utils/proposalPdfExport';
import { 
  Store, 
  ExternalLink, 
  Download, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  FileCheck2,
  Sparkles,
  Phone,
  User,
  History
} from 'lucide-react';

interface KanbanBoardProps {
  stores: StoreAuditData[];
  onSelectStore: (storeId: string, targetTab?: 'overview' | 'checklist' | 'actionplan' | 'pdf') => void;
  onUpdateStore: (store: StoreAuditData) => void;
  onEditStore: (store: StoreAuditData) => void;
  onDeleteStore: (storeId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  stores,
  onSelectStore,
  onUpdateStore,
  onEditStore,
  onDeleteStore
}) => {
  const [downloadingDiagId, setDownloadingDiagId] = useState<string | null>(null);
  const [downloadingPropId, setDownloadingPropId] = useState<string | null>(null);
  const [draggedStoreId, setDraggedStoreId] = useState<string | null>(null);
  const [historyModalStore, setHistoryModalStore] = useState<StoreAuditData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Normalized stores with guaranteed Kanban status & history
  const normalizedStores = stores.map(ensureStoreKanban);

  const handleDragStart = (e: React.DragEvent, storeId: string) => {
    e.dataTransfer.setData('text/plain', storeId);
    setDraggedStoreId(storeId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: KanbanStatus) => {
    e.preventDefault();
    const storeId = e.dataTransfer.getData('text/plain') || draggedStoreId;
    if (!storeId) return;

    const storeToMove = normalizedStores.find(s => s.id === storeId);
    if (!storeToMove) return;

    if (storeToMove.kanbanStatus === targetStatus) return;

    const updated = updateStoreKanbanStatus(storeToMove, targetStatus);
    onUpdateStore(updated);
    setDraggedStoreId(null);
  };

  const handleStatusChange = (store: StoreAuditData, targetStatus: KanbanStatus) => {
    if (store.kanbanStatus === targetStatus) return;
    const updated = updateStoreKanbanStatus(store, targetStatus);
    onUpdateStore(updated);
  };

  const handleDownloadDiagPdf = async (e: React.MouseEvent, store: StoreAuditData) => {
    e.stopPropagation();
    setDownloadingDiagId(store.id);
    try {
      await downloadDirectPdf(store);
    } catch (err) {
      console.error('Error downloading diagnostic PDF:', err);
    } finally {
      setDownloadingDiagId(null);
    }
  };

  const handleDownloadProposal = async (e: React.MouseEvent, store: StoreAuditData) => {
    e.stopPropagation();
    setDownloadingPropId(store.id);
    try {
      await downloadProposalPdf(store);
    } catch (err) {
      console.error('Error downloading proposal PDF:', err);
    } finally {
      setDownloadingPropId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Kanban Header info banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3.5 rounded-xl border border-[#e4dfd6]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c6024e] animate-pulse"></span>
          <span className="font-bold text-[#1f2430]">Pipeline de Atendimento das Lojas</span>
          <span className="text-[#7a7568]">· Arraste os cards ou use o seletor para mover as lojas pelas etapas do funil</span>
        </div>
        <div className="text-[#7a7568] font-medium">
          Total: <b className="text-[#1f2430]">{stores.length}</b> lojas ativas no Kanban
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
        {KANBAN_STAGES.map(stage => {
          const stageStores = normalizedStores.filter(s => (s.kanbanStatus || 'loja_analisada') === stage.id);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="bg-[#f8f7f5] rounded-xl border border-[#e4dfd6] flex flex-col min-h-[520px] transition-colors"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-[#e4dfd6] bg-white rounded-t-xl">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span 
                    className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase border ${stage.badgeBg} ${stage.badgeText} ${stage.border}`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gray-100 text-[#1f2430]">
                    {stageStores.length}
                  </span>
                </div>
                <p className="text-[10.5px] text-[#7a7568] leading-tight mt-1 line-clamp-2">
                  {stage.description}
                </p>
              </div>

              {/* Column Body / Cards List */}
              <div className="p-2.5 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                {stageStores.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[#e4dfd6] rounded-xl bg-white/50 text-[#7a7568] text-xs">
                    <p className="text-[11px]">Nenhuma loja nesta etapa</p>
                    <p className="text-[9.5px] text-gray-400 mt-0.5">Arraste uma loja para cá</p>
                  </div>
                ) : (
                  stageStores.map(store => {
                    const isDeleting = deleteConfirmId === store.id;
                    const history = store.statusHistory || [];
                    const lastEntry = history[history.length - 1];

                    return (
                      <div
                        key={store.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, store.id)}
                        className="bg-white rounded-xl border border-[#e4dfd6] hover:border-[#5b3a6b]/50 p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing space-y-3 group"
                      >
                        {/* Card Top: Store Name & Score */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-[#1f2430] group-hover:text-[#5b3a6b] transition-colors truncate">
                              {store.storeName}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] text-[#7a7568]">
                              <span className="truncate">{store.segment || 'Varejo'}</span>
                              <span>•</span>
                              <a
                                href={store.storeUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="text-[#5b3a6b] hover:underline inline-flex items-center gap-0.5"
                                title={store.storeUrl}
                              >
                                <span className="max-w-[100px] truncate">{store.storeUrl?.replace(/^https?:\/\//, '') || 'url'}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          </div>

                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0">
                            {store.overallScore} pts
                          </span>
                        </div>

                        {/* Seller Contact Info */}
                        <div className="text-[11px] text-[#1f2430] bg-[#faf8f5] p-2 rounded-lg border border-[#e4dfd6]/70 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[#7a7568] text-[10px]">Lojista:</span>
                            <span className="font-semibold truncate max-w-[130px]">{store.sellerName || 'Não informado'}</span>
                          </div>
                          {store.sellerWhatsapp && (
                            <div className="flex items-center justify-between gap-1 text-[10px]">
                              <span className="text-[#7a7568]">WhatsApp:</span>
                              <span className="font-mono text-[#059669] font-medium">{store.sellerWhatsapp}</span>
                            </div>
                          )}
                        </div>

                        {/* Stage Progression & History Snippet (DATAS DE CADA ETAPA) */}
                        <div className="bg-gradient-to-r from-gray-50 to-[#faf8f5] p-2 rounded-lg border border-gray-200/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#1f2430] flex items-center gap-1">
                              <History className="w-3 h-3 text-[#5b3a6b]" />
                              Histórico de Etapas:
                            </span>
                            <button
                              onClick={() => setHistoryModalStore(store)}
                              className="text-[9.5px] font-bold text-[#5b3a6b] hover:underline cursor-pointer"
                              title="Ver histórico detalhado de datas"
                            >
                              Ver todos ({history.length})
                            </button>
                          </div>

                          {/* Render Mini History Timeline */}
                          <div className="space-y-1 pt-0.5">
                            {history.slice(-2).map((item, idx) => {
                              const s = getKanbanStage(item.status);
                              return (
                                <div key={idx} className="flex items-center justify-between text-[10px] gap-1">
                                  <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${s.badgeBg} ${s.badgeText} truncate max-w-[120px]`}>
                                    {s.shortLabel}
                                  </span>
                                  <span className="text-[9.5px] text-[#7a7568] font-mono shrink-0">
                                    {item.date}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Move Stage Quick Selector */}
                        <div className="pt-1">
                          <label className="text-[9.5px] font-semibold text-[#7a7568] block mb-1">
                            Alterar Status:
                          </label>
                          <select
                            value={store.kanbanStatus || 'loja_analisada'}
                            onChange={(e) => handleStatusChange(store, e.target.value as KanbanStatus)}
                            className="w-full text-[11px] font-bold py-1 px-2 rounded-lg border border-[#e4dfd6] bg-white cursor-pointer hover:border-[#5b3a6b] focus:outline-none"
                          >
                            {KANBAN_STAGES.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Action Buttons Bar */}
                        <div className="pt-2 border-t border-[#e4dfd6] flex flex-col gap-1.5">
                          {/* Primary: Go to Diagnostic */}
                          <button
                            onClick={() => onSelectStore(store.id, 'overview')}
                            className="w-full py-1.5 px-2 bg-[#5b3a6b] hover:bg-[#3d2749] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <span>Acessar Diagnóstico</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          {/* Second Row: PDF Downloads */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={(e) => handleDownloadDiagPdf(e, store)}
                              disabled={downloadingDiagId === store.id}
                              className="py-1 px-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Baixar Relatório de Diagnóstico PDF"
                            >
                              <Download className="w-3 h-3 text-emerald-700 shrink-0" />
                              <span className="truncate">{downloadingDiagId === store.id ? 'Gerando...' : 'PDF Diagnóstico'}</span>
                            </button>

                            <button
                              onClick={(e) => handleDownloadProposal(e, store)}
                              disabled={downloadingPropId === store.id}
                              className="py-1 px-1.5 bg-[#c6024e]/10 hover:bg-[#c6024e]/20 text-[#c6024e] border border-[#c6024e]/30 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Baixar Proposta de Orçamento TOP 2 e TOP 3 em PDF com cores DigiBrands"
                            >
                              <Sparkles className="w-3 h-3 text-[#c6024e] shrink-0" />
                              <span className="truncate">{downloadingPropId === store.id ? 'Gerando...' : 'Proposta TOP 2/3'}</span>
                            </button>
                          </div>

                          {/* Third Row: Edit & Delete Tools */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => onEditStore(store)}
                              className="text-[10.5px] text-[#7a7568] hover:text-[#5b3a6b] flex items-center gap-1 cursor-pointer font-medium"
                              title="Editar Dados da Loja"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>

                            {isDeleting ? (
                              <div className="flex items-center gap-1">
                                <span className="text-[9.5px] font-bold text-rose-700">Excluir?</span>
                                <button
                                  onClick={() => {
                                    onDeleteStore(store.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-bold hover:bg-rose-700 cursor-pointer"
                                >
                                  Sim
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded text-[9px] hover:bg-gray-300 cursor-pointer"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(store.id)}
                                className="text-[10.5px] text-gray-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                                title="Excluir Loja"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* History Modal (Histórico com as datas de cada etapa que o cliente passou) */}
      {historyModalStore && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#e4dfd6] shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#e4dfd6] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#e0663f] uppercase tracking-wider">
                  Histórico de Etapas & Datas
                </span>
                <h3 className="text-base font-bold text-[#1f2430]">
                  {historyModalStore.storeName}
                </h3>
                <p className="text-xs text-[#7a7568]">
                  Linha do tempo de todas as fases percorridas no pipeline
                </p>
              </div>
              <button
                onClick={() => setHistoryModalStore(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Timeline View */}
            <div className="relative pl-6 space-y-4 border-l-2 border-[#e4dfd6] ml-3 py-1">
              {(historyModalStore.statusHistory || []).map((entry, idx) => {
                const stage = getKanbanStage(entry.status);
                const isLatest = idx === (historyModalStore.statusHistory?.length || 1) - 1;

                return (
                  <div key={idx} className="relative group">
                    {/* Timeline Node Dot */}
                    <div 
                      className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        isLatest ? 'bg-[#c6024e] ring-4 ring-[#c6024e]/20' : 'bg-gray-400'
                      }`}
                    />

                    <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e4dfd6] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${stage.badgeBg} ${stage.badgeText}`}>
                          {entry.statusLabel || stage.label}
                        </span>
                        <span className="text-[10px] font-mono text-[#7a7568] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#5b3a6b]" />
                          {entry.date}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-[11px] text-[#1f2430] font-medium pt-0.5">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#e4dfd6] flex justify-end">
              <button
                onClick={() => setHistoryModalStore(null)}
                className="px-4 py-2 bg-[#5b3a6b] text-white text-xs font-bold rounded-xl hover:bg-[#3d2749] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
