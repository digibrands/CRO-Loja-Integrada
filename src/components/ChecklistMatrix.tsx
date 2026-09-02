import React, { useState } from 'react';
import { StoreAuditData, ChecklistItem, ItemStatus } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  MinusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Save, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { getItemDeadline, getRiskAndBenefit } from '../utils/auditHelpers';

interface ChecklistMatrixProps {
  store: StoreAuditData;
  onUpdateStore: (updated: StoreAuditData) => void;
}

export const ChecklistMatrix: React.FC<ChecklistMatrixProps> = ({ store, onUpdateStore }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ItemStatus>('all');
  const [collapsedAreas, setCollapsedAreas] = useState<Record<number, boolean>>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editFindings, setEditFindings] = useState('');
  const [editAction, setEditAction] = useState('');
  const [editRisk, setEditRisk] = useState('');
  const [editBenefit, setEditBenefit] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  const toggleArea = (areaId: number) => {
    setCollapsedAreas(prev => ({ ...prev, [areaId]: !prev[areaId] }));
  };

  const handleStatusChange = (areaId: number, itemId: string, newStatus: ItemStatus) => {
    const newAreas = store.areas.map(area => {
      if (area.id !== areaId) return area;
      return {
        ...area,
        items: area.items.map(item => {
          if (item.id !== itemId) return item;
          const updatedItem = { ...item, status: newStatus };
          // Automatically update default deadline for new status
          updatedItem.deadlineText = getItemDeadline(updatedItem);
          return updatedItem;
        })
      };
    });

    // Recompute score
    const allItems = newAreas.flatMap(a => a.items);
    const conforme = allItems.filter(i => i.status === 'conforme').length;
    const ajustar = allItems.filter(i => i.status === 'ajustar').length;
    const critico = allItems.filter(i => i.status === 'critico').length;
    const total = allItems.length;

    const newScore = Math.round((conforme / total) * 100);

    onUpdateStore({
      ...store,
      areas: newAreas,
      overallScore: newScore,
      totalConforme: conforme,
      totalAjustar: ajustar,
      totalCritico: critico,
    });
  };

  const startEdit = (item: ChecklistItem) => {
    const riskBenefit = getRiskAndBenefit(item);
    setEditingItemId(item.id);
    setEditFindings(item.diagnosticFindings);
    setEditAction(item.recommendedAction);
    setEditRisk(item.riskIfNotFixed || riskBenefit.risk);
    setEditBenefit(item.benefitIfFixed || riskBenefit.benefit);
    setEditDeadline(item.deadlineText || getItemDeadline(item));
  };

  const saveEdit = (areaId: number, itemId: string) => {
    const newAreas = store.areas.map(area => {
      if (area.id !== areaId) return area;
      return {
        ...area,
        items: area.items.map(item => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            diagnosticFindings: editFindings,
            recommendedAction: editAction,
            riskIfNotFixed: editRisk,
            benefitIfFixed: editBenefit,
            deadlineText: editDeadline
          };
        })
      };
    });

    onUpdateStore({
      ...store,
      areas: newAreas
    });
    setEditingItemId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Quick Filters */}
      <div className="bg-white rounded-2xl p-5 border border-[#e4dfd6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1f2430]">
            Checklist Oficial de Diagnóstico (11 Áreas · 46 Itens)
          </h2>
          <p className="text-xs text-[#7a7568]">
            Roteiro padrão de avaliação técnica da oferta Diagnóstico com Especialista + Plano de Ação
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#7a7568] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar critério..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#e4dfd6] bg-[#faf8f5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5b3a6b]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-lg border border-[#e4dfd6]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#5b3a6b] text-white shadow-2xs' : 'text-[#7a7568] hover:text-[#1f2430]'
              }`}
            >
              Todos ({store.areas.reduce((acc, a) => acc + a.items.length, 0)})
            </button>
            <button
              onClick={() => setStatusFilter('critico')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'critico' ? 'bg-red-600 text-white shadow-2xs' : 'text-red-700 hover:bg-red-50'
              }`}
            >
              Crítico
            </button>
            <button
              onClick={() => setStatusFilter('ajustar')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'ajustar' ? 'bg-orange-600 text-white shadow-2xs' : 'text-orange-700 hover:bg-orange-50'
              }`}
            >
              Ajustar
            </button>
            <button
              onClick={() => setStatusFilter('conforme')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'conforme' ? 'bg-green-600 text-white shadow-2xs' : 'text-green-700 hover:bg-green-50'
              }`}
            >
              Conforme
            </button>
          </div>
        </div>
      </div>

      {/* 11 Areas Accordion List */}
      <div className="space-y-4">
        {store.areas.map(area => {
          const isCollapsed = collapsedAreas[area.id] || false;
          
          const filteredItems = area.items.filter(item => {
            const matchesSearch = searchTerm === '' || 
              item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.diagnosticFindings.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.recommendedAction.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            return matchesSearch && matchesStatus;
          });

          if (filteredItems.length === 0 && (searchTerm || statusFilter !== 'all')) {
            return null;
          }

          const conformeCount = area.items.filter(i => i.status === 'conforme').length;
          const ajustarCount = area.items.filter(i => i.status === 'ajustar').length;
          const criticoCount = area.items.filter(i => i.status === 'critico').length;

          return (
            <div 
              key={area.id}
              className="bg-white rounded-xl border border-[#e4dfd6] overflow-hidden shadow-2xs transition-all"
            >
              {/* Area Header Bar */}
              <div 
                onClick={() => toggleArea(area.id)}
                className="px-5 py-3.5 bg-gradient-to-r from-[#3d2749] via-[#4d315c] to-[#5b3a6b] text-white flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    ÁREA {area.num}
                  </span>
                  <h3 className="text-base font-bold text-[#faf8f5]">
                    {area.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/90">
                    <span className="bg-green-600 text-white font-bold px-2 py-0.5 rounded">
                      {conformeCount} CONFORME
                    </span>
                    <span className="bg-orange-600 text-white font-bold px-2 py-0.5 rounded">
                      {ajustarCount} AJUSTAR
                    </span>
                    <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded">
                      {criticoCount} CRÍTICO
                    </span>
                  </div>

                  <span className="text-white/80">
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </span>
                </div>
              </div>

              {/* Items List */}
              {!isCollapsed && (
                <div className="divide-y divide-[#e4dfd6]">
                  {filteredItems.map(item => {
                    const isEditing = editingItemId === item.id;
                    const isBenefit = item.isBanhoDeLojaCandidate;
                    const deadline = item.deadlineText || getItemDeadline(item);
                    const riskBenefit = getRiskAndBenefit(item);

                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 transition-colors ${
                          isBenefit 
                            ? 'bg-emerald-50/40 border-l-4 border-emerald-500' 
                            : item.status === 'critico' 
                            ? 'bg-red-50/30' 
                            : item.status === 'ajustar' 
                            ? 'bg-orange-50/20' 
                            : 'hover:bg-[#faf8f5]/60'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          {/* Item Title & Badges */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#5b3a6b] bg-[#faf8f5] px-1.5 py-0.5 rounded border border-[#e4dfd6]">
                                {item.id}
                              </span>

                              <span className="text-sm font-bold text-[#1f2430]">
                                {item.title}
                              </span>

                              {/* Status Badge in Header */}
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-wider ${
                                item.status === 'conforme' ? 'bg-green-600' :
                                item.status === 'ajustar' ? 'bg-orange-600' :
                                item.status === 'critico' ? 'bg-red-600' : 'bg-gray-600'
                              }`}>
                                {item.status.toUpperCase()}
                              </span>

                              {isBenefit && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-green-100 text-green-900 border border-green-300 px-2.5 py-0.5 rounded-full">
                                  <Sparkles className="w-3 h-3 text-green-700" />
                                  Escopo do Benefício Loja Integrada
                                </span>
                              )}

                              {item.note && (
                                <span className="text-[11px] font-semibold text-[#5c7a63] italic bg-green-50 px-2 py-0.5 rounded">
                                  {item.note}
                                </span>
                              )}
                            </div>

                            {/* Diagnostic Findings & Actions */}
                            {!isEditing ? (
                              <div className="space-y-2.5 pt-2 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="p-3 rounded-lg bg-white border border-[#e4dfd6] shadow-2xs">
                                    <span className="font-bold text-[#5b3a6b] block mb-1">
                                      🔍 Constatação no Diagnóstico:
                                    </span>
                                    <p className="text-[#1f2430] leading-relaxed">
                                      {item.diagnosticFindings}
                                    </p>
                                  </div>

                                  <div className="p-3 rounded-lg bg-white border border-[#e4dfd6] shadow-2xs">
                                    <span className="font-bold text-[#166534] block mb-1">
                                      💡 Ação Recomendada:
                                    </span>
                                    <p className="text-[#1f2430] leading-relaxed">
                                      {item.recommendedAction}
                                    </p>
                                  </div>
                                </div>

                                {/* Risk, Benefit & Deadline Details */}
                                {(item.status === 'ajustar' || item.status === 'critico') && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
                                    <div>
                                      <span className="font-bold text-red-700 flex items-center gap-1 mb-0.5">
                                        <ShieldAlert className="w-3.5 h-3.5" /> Impacto se não for ajustado:
                                      </span>
                                      <p className="text-red-900/90">{item.riskIfNotFixed || riskBenefit.risk}</p>
                                    </div>
                                    <div>
                                      <span className="font-bold text-green-800 flex items-center gap-1 mb-0.5">
                                        <Zap className="w-3.5 h-3.5" /> Benefício em caso de correção:
                                      </span>
                                      <p className="text-green-950/90">{item.benefitIfFixed || riskBenefit.benefit}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#3d2749] bg-white px-3 py-1.5 rounded-md border border-[#e4dfd6] w-fit">
                                  <Clock className="w-3.5 h-3.5 text-[#e0663f]" />
                                  <span>Prazo para correção: <b className="text-[#1f2430]">{deadline}</b></span>
                                </div>
                              </div>
                            ) : (
                              /* Inline Editing Mode */
                              <div className="space-y-3 pt-2 bg-[#faf8f5] p-4 rounded-xl border border-[#5b3a6b]">
                                <div>
                                  <label className="text-[11px] font-bold text-[#5b3a6b] block mb-1">
                                    Constatação no Diagnóstico:
                                  </label>
                                  <textarea
                                    value={editFindings}
                                    onChange={e => setEditFindings(e.target.value)}
                                    rows={2}
                                    className="w-full text-xs p-2 rounded-lg border border-[#5b3a6b] bg-white focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-bold text-[#166534] block mb-1">
                                    Ação Recomendada:
                                  </label>
                                  <textarea
                                    value={editAction}
                                    onChange={e => setEditAction(e.target.value)}
                                    rows={2}
                                    className="w-full text-xs p-2 rounded-lg border border-[#166534] bg-white focus:outline-none"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[11px] font-bold text-red-700 block mb-1">
                                      Impacto se não for ajustado:
                                    </label>
                                    <textarea
                                      value={editRisk}
                                      onChange={e => setEditRisk(e.target.value)}
                                      rows={2}
                                      className="w-full text-xs p-2 rounded-lg border border-red-300 bg-white focus:outline-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[11px] font-bold text-green-700 block mb-1">
                                      Benefício em caso de correção:
                                    </label>
                                    <textarea
                                      value={editBenefit}
                                      onChange={e => setEditBenefit(e.target.value)}
                                      rows={2}
                                      className="w-full text-xs p-2 rounded-lg border border-green-300 bg-white focus:outline-none"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[11px] font-bold text-[#3d2749] block mb-1">
                                    Prazo para correção:
                                  </label>
                                  <input
                                    type="text"
                                    value={editDeadline}
                                    onChange={e => setEditDeadline(e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-[#e4dfd6] bg-white focus:outline-none"
                                  />
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => saveEdit(area.id, item.id)}
                                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#5b3a6b] text-white hover:bg-[#3d2749] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                                  >
                                    <Save className="w-3.5 h-3.5" /> Salvar Edição
                                  </button>
                                  <button
                                    onClick={() => setEditingItemId(null)}
                                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Status Toggle & Edit Buttons */}
                          <div className="flex flex-row lg:flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-lg border border-[#e4dfd6]">
                              <button
                                onClick={() => handleStatusChange(area.id, item.id, 'conforme')}
                                title="Conforme"
                                className={`px-2.5 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                                  item.status === 'conforme'
                                    ? 'bg-green-600 text-white shadow-xs'
                                    : 'text-green-800 hover:bg-green-100'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Conforme</span>
                              </button>

                              <button
                                onClick={() => handleStatusChange(area.id, item.id, 'ajustar')}
                                title="Necessita Ajuste"
                                className={`px-2.5 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                                  item.status === 'ajustar'
                                    ? 'bg-orange-600 text-white shadow-xs'
                                    : 'text-orange-800 hover:bg-orange-100'
                                }`}
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Ajustar</span>
                              </button>

                              <button
                                onClick={() => handleStatusChange(area.id, item.id, 'critico')}
                                title="Crítico"
                                className={`px-2.5 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                                  item.status === 'critico'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'text-red-800 hover:bg-red-100'
                                }`}
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Crítico</span>
                              </button>

                              <button
                                onClick={() => handleStatusChange(area.id, item.id, 'nao_aplicavel')}
                                title="Não Aplicável"
                                className={`px-2.5 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                                  item.status === 'nao_aplicavel'
                                    ? 'bg-gray-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <MinusCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">N/A</span>
                              </button>
                            </div>

                            {!isEditing && (
                              <button
                                onClick={() => startEdit(item)}
                                className="text-[11px] text-[#7a7568] hover:text-[#5b3a6b] inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-[#faf8f5] border border-transparent hover:border-[#e4dfd6] cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" /> Editar critério
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
        })}
      </div>
    </div>
  );
};
