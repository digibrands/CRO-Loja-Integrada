import React, { useState } from 'react';
import { StoreAuditData } from '../types';
import { 
  Building2, 
  Sparkles, 
  FileText, 
  Download, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Plus, 
  ArrowRight,
  Store,
  TrendingUp,
  Clock,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { downloadDirectPdf } from '../utils/pdfExport';

interface StoreListPanelProps {
  stores: StoreAuditData[];
  onSelectStore: (storeId: string, targetTab?: 'overview' | 'checklist' | 'actionplan' | 'pdf') => void;
  onNewAuditClick: () => void;
  onEditStore: (store: StoreAuditData) => void;
  onDeleteStore: (storeId: string) => void;
}

export const StoreListPanel: React.FC<StoreListPanelProps> = ({
  stores,
  onSelectStore,
  onNewAuditClick,
  onEditStore,
  onDeleteStore
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredStores = stores.filter(s => 
    (s.storeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.sellerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.segment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.storeUrl || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPdf = async (e: React.MouseEvent, store: StoreAuditData) => {
    e.stopPropagation();
    setDownloadingId(store.id);
    try {
      await downloadDirectPdf(store);
    } catch (err) {
      console.error('Error downloading PDF from list:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusCounts = (store: StoreAuditData) => {
    let conforme = 0;
    let ajustar = 0;
    let critico = 0;
    (store.areas || []).forEach(area => {
      (area.items || []).forEach(item => {
        if (item.status === 'conforme') conforme++;
        else if (item.status === 'ajustar') ajustar++;
        else if (item.status === 'critico') critico++;
      });
    });
    return { conforme, ajustar, critico, total: conforme + ajustar + critico };
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#e4dfd6] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#e0663f] uppercase tracking-wider bg-[#faf8f5] px-2.5 py-0.5 rounded-full border border-[#e4dfd6]">
              Painel de Gestão
            </span>
            <span className="text-xs font-semibold text-[#7a7568]">
              {stores.length} {stores.length === 1 ? 'Loja Analisada' : 'Lojas Analisadas'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#1f2430] tracking-tight">
            Lojas Auditadas & Diagnósticos Concluídos
          </h2>
          <p className="text-xs text-[#7a7568] mt-1 max-w-2xl">
            Acesse, edite os dados, baixe o PDF oficial com a identidade <b>DigiBrands</b> ou realize um novo diagnóstico assistido por inteligência artificial.
          </p>
        </div>

        <button
          onClick={onNewAuditClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5b3a6b] to-[#3d2749] text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#e0663f]" />
          <span>Novo Diagnóstico com IA</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e4dfd6]">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#7a7568] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por loja, lojista, segmento ou URL..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#faf8f5] border border-[#e4dfd6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b3a6b]/20 focus:border-[#5b3a6b]"
          />
        </div>

        <div className="text-xs text-[#7a7568] font-medium self-end sm:self-auto">
          Mostrando <b>{filteredStores.length}</b> de <b>{stores.length}</b> lojas
        </div>
      </div>

      {/* Stores List / Grid */}
      {filteredStores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#e4dfd6] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#faf8f5] text-[#7a7568] flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1f2430]">Nenhuma loja encontrada</h3>
            <p className="text-xs text-[#7a7568] mt-1">
              {searchTerm ? 'Nenhum resultado corresponde à sua pesquisa.' : 'Nenhuma loja foi cadastrada ainda.'}
            </p>
          </div>
          <button
            onClick={onNewAuditClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5b3a6b] text-white text-xs font-bold hover:bg-[#3d2749] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeira Loja
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredStores.map(store => {
            const counts = getStatusCounts(store);
            const isDeleting = deleteConfirmId === store.id;

            return (
              <div
                key={store.id}
                className="bg-white rounded-xl border border-[#e4dfd6] hover:border-[#5b3a6b]/50 p-5 shadow-2xs transition-all hover:shadow-xs group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Store Basic Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5b3a6b]/10 to-[#5b3a6b]/20 text-[#5b3a6b] flex items-center justify-center shrink-0 font-bold border border-[#5b3a6b]/20">
                      <Store className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#1f2430] truncate">
                          {store.storeName}
                        </h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#faf8f5] text-[#7a7568] border border-[#e4dfd6]">
                          {store.segment || 'Varejo'}
                        </span>
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                          {store.overallScore}/100 Pts
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#7a7568] mt-1.5">
                        <span>Lojista: <b className="text-[#1f2430]">{store.sellerName || 'Não informado'}</b></span>
                        <span>•</span>
                        <a
                          href={store.storeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#5b3a6b] hover:underline flex items-center gap-1 font-mono text-[11px]"
                          onClick={e => e.stopPropagation()}
                        >
                          <span>{store.storeUrl?.replace(/^https?:\/\//, '') || 'loja.com.br'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Status Badges summary */}
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#e4dfd6]/60">
                        <span className="text-[11px] text-[#7a7568] font-medium">Diagnóstico:</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#16a34a] text-white">
                          <CheckCircle2 className="w-3 h-3" /> {counts.conforme} Conformes
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#ea580c] text-white">
                          <AlertTriangle className="w-3 h-3" /> {counts.ajustar} Ajustar
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#dc2626] text-white">
                          <XCircle className="w-3 h-3" /> {counts.critico} Críticos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Right Column */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#e4dfd6] shrink-0 justify-end">
                    {/* Quick Access to Grouped Tabs */}
                    <button
                      onClick={() => onSelectStore(store.id, 'overview')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-[#5b3a6b] text-white hover:bg-[#3d2749] transition-colors cursor-pointer shadow-2xs"
                      title="Acessar painel completo da loja"
                    >
                      <span>Acessar Diagnóstico</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Download PDF button */}
                    <button
                      onClick={(e) => handleDownloadPdf(e, store)}
                      disabled={downloadingId === store.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                      title="Baixar Relatório PDF com design DigiBrands"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{downloadingId === store.id ? 'Gerando...' : 'Baixar PDF'}</span>
                    </button>

                    {/* Edit Store button */}
                    <button
                      onClick={() => onEditStore(store)}
                      className="p-2 text-xs font-semibold rounded-lg bg-[#faf8f5] text-[#1f2430] border border-[#e4dfd6] hover:bg-[#e4dfd6] transition-colors cursor-pointer"
                      title="Editar Informações da Loja"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#5b3a6b]" />
                    </button>

                    {/* Delete Store */}
                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 p-1 rounded-lg">
                        <span className="text-[10px] font-bold text-rose-800 px-1">Excluir?</span>
                        <button
                          onClick={() => {
                            onDeleteStore(store.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-[10px] font-semibold hover:bg-gray-300 cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(store.id)}
                        className="p-2 text-xs font-semibold rounded-lg bg-[#faf8f5] text-rose-600 border border-[#e4dfd6] hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                        title="Excluir Análise"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
