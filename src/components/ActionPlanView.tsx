import React, { useState } from 'react';
import { StoreAuditData, TopUpsellProposal, UpsellServiceItem } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  FileText,
  Building,
  Globe,
  Palette,
  Search,
  Check,
  Zap,
  Download,
  Phone,
  Mail,
  PackagePlus
} from 'lucide-react';
import { downloadProposalPdf } from '../utils/proposalPdfExport';

interface ActionPlanViewProps {
  store: StoreAuditData;
  onUpdateStore: (updated: StoreAuditData) => void;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({ store, onUpdateStore }) => {
  const [newProduct, setNewProduct] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  
  // Custom services state
  const [isAddingCustomService, setIsAddingCustomService] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(350);
  const [newServiceDays, setNewServiceDays] = useState<number>(5);
  const [newServiceImpact, setNewServiceImpact] = useState('Aumento de conversão e ticket médio');

  const handleTop1StatusChange = (status: 'pendente' | 'em_andamento' | 'concluido') => {
    onUpdateStore({
      ...store,
      top1: {
        ...store.top1,
        executionStatus: status
      }
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.trim()) return;
    const currentList = store.top1.seoProductsList || [];
    onUpdateStore({
      ...store,
      top1: {
        ...store.top1,
        seoProductsList: [...currentList, newProduct.trim()]
      }
    });
    setNewProduct('');
  };

  const handleRemoveProduct = (index: number) => {
    const currentList = store.top1.seoProductsList || [];
    onUpdateStore({
      ...store,
      top1: {
        ...store.top1,
        seoProductsList: currentList.filter((_, i) => i !== index)
      }
    });
  };

  const handleUpsellChange = (target: 'top2' | 'top3', field: keyof TopUpsellProposal, value: any) => {
    onUpdateStore({
      ...store,
      [target]: {
        ...store[target],
        [field]: value
      }
    });
  };

  const handleAddCustomService = () => {
    if (!newServiceTitle.trim()) return;
    const newService: UpsellServiceItem = {
      id: 'srv_' + Date.now(),
      title: newServiceTitle.trim(),
      description: newServiceDesc.trim() || 'Implementação técnica estratégica recomendada pela DigiBrands.',
      estimatedPrice: Number(newServicePrice) || 0,
      estimatedDays: Number(newServiceDays) || 1,
      expectedImpact: newServiceImpact.trim() || 'Aumento de performance e retenção.',
      includedInProposal: true
    };

    const updatedServices = [...(store.customUpsellServices || []), newService];
    onUpdateStore({
      ...store,
      customUpsellServices: updatedServices
    });

    // Reset form
    setNewServiceTitle('');
    setNewServiceDesc('');
    setNewServicePrice(350);
    setNewServiceDays(5);
    setNewServiceImpact('Aumento de conversão e ticket médio');
    setIsAddingCustomService(false);
  };

  const handleRemoveCustomService = (serviceId: string) => {
    const updatedServices = (store.customUpsellServices || []).filter(s => s.id !== serviceId);
    onUpdateStore({
      ...store,
      customUpsellServices: updatedServices
    });
  };

  const handleDownloadProposal = async () => {
    setDownloadingPdf(true);
    try {
      await downloadProposalPdf(store);
    } catch (err) {
      console.error('Error generating proposal PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Calculate total investment
  const top2Price = Number(store.top2.estimatedPrice) || 0;
  const top3Price = Number(store.top3.estimatedPrice) || 0;
  const customServicesPrice = (store.customUpsellServices || [])
    .filter(s => s.includedInProposal !== false)
    .reduce((sum, s) => sum + (Number(s.estimatedPrice) || 0), 0);
  const totalInvestment = top2Price + top3Price + customServicesPrice;

  return (
    <div className="space-y-8">
      {/* Top Intro Alert */}
      <div className="bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-purple-900/10 border border-emerald-300/60 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1f2430]">
              Estratégia de Entregáveis: Top 1 - (ESCOPO BENEFICIO LOJA INTEGRADA) + Top 2 e 3 (execução opcional seller mediante orçamento)
            </h2>
            <p className="text-xs text-[#7a7568] leading-relaxed max-w-3xl">
              Conforme as regras da parceria Loja Integrada e DigiBrands, o <b>Top 1</b> é executado no escopo do benefício Loja Integrada. Os <b>Top 2 e Top 3</b> são oportunidades estratégicas de escala com contratação opcional pelo lojista.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-white border border-emerald-300 font-bold text-emerald-800">
            Remuneração LI: R$ 100,00
          </span>
        </div>
      </div>

      {/* TOP 1 — ESSENCIAL (BENEFICIO LOJA INTEGRADA) */}
      <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-sm overflow-hidden">
        {/* Top 1 Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center font-black text-base">
              01
            </span>
            <div>
              <span className="text-[11px] font-bold text-emerald-200 tracking-wider uppercase block">
                Entregável Garantido · ESCOPO BENEFICIO LOJA INTEGRADA
              </span>
              <h3 className="text-lg font-bold text-white">
                {store.top1.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-emerald-950">
              VALOR P/ LOJISTA: R$ 0,00
            </span>
            <select
              value={store.top1.executionStatus}
              onChange={e => handleTop1StatusChange(e.target.value as any)}
              className="bg-white text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-lg border-0 shadow-xs focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              <option value="pendente">Status: Pendente</option>
              <option value="em_andamento">Status: Em Execução</option>
              <option value="concluido">Status: Concluído ✓</option>
            </select>
          </div>
        </div>

        {/* Top 1 Content - The 3 Mandatory Pillars */}
        <div className="p-6 space-y-6">
          <div className="text-xs text-[#7a7568] bg-[#faf8f5] p-3.5 rounded-xl border border-[#e4dfd6]">
            <b>Diretriz Oficial Loja Integrada:</b> A agência parceira analisa a loja e obrigatoriamente implementa o Top 1 com os itens necessários do Escopo do Benefício Loja Integrada. Ao concluir, emite o comprovante de Antes & Depois para recebimento da comissão de R$ 100,00.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pillar 1: Layout & 1 Banner */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <Palette className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  1. Layout Padrão + 1 Banner
                </h4>
              </div>

              <p className="text-xs text-[#1f2430] leading-relaxed">
                Adequação visual da paleta de cores e cabeçalho + criação de 1 banner institucional/promocional de alta conversão.
              </p>

              <div>
                <label className="text-[11px] font-bold text-[#5b3a6b] block mb-1">
                  Especificações do Banner Criado:
                </label>
                <input
                  type="text"
                  value={store.top1.bannerSpecs || ''}
                  onChange={e => onUpdateStore({
                    ...store,
                    top1: { ...store.top1, bannerSpecs: e.target.value }
                  })}
                  placeholder="Ex: 1920x600px desktop com oferta de lançamento"
                  className="w-full text-xs p-2 rounded-lg border border-[#e4dfd6] bg-white"
                />
              </div>
            </div>

            {/* Pillar 2: SEO 20 Products */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <Search className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  2. SEO dos 20 Produtos
                </h4>
              </div>

              <p className="text-xs text-[#1f2430] leading-relaxed">
                Reescrita de títulos comerciais e descrições ricas otimizadas para busca orgânica do Google nos 20 principais itens.
              </p>

              <div className="text-xs font-bold text-emerald-700">
                {store.top1.seoProductsList?.length || 0} de 20 produtos cadastrados
              </div>
            </div>

            {/* Pillar 3: Domain Config */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <Globe className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  3. Configuração de Domínio
                </h4>
              </div>

              <p className="text-xs text-[#1f2430] leading-relaxed">
                Configuração e apontamento de DNS (CNAME e A record) do domínio próprio com certificado SSL seguro.
              </p>

              <div>
                <label className="text-[11px] font-bold text-[#5b3a6b] block mb-1">
                  Domínio Configurado:
                </label>
                <input
                  type="text"
                  value={store.top1.domainName || ''}
                  onChange={e => onUpdateStore({
                    ...store,
                    top1: { ...store.top1, domainName: e.target.value }
                  })}
                  placeholder="Ex: www.sualoja.com.br"
                  className="w-full text-xs p-2 rounded-lg border border-[#e4dfd6] bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* List of 20 Products for SEO Management */}
          <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e4dfd6] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#1f2430] flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                Lista dos 20 Produtos Principais Otimizados com SEO:
              </h4>
              <span className="text-[11px] text-[#7a7568]">
                {store.top1.seoProductsList?.length || 0} produtos
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newProduct}
                onChange={e => setNewProduct(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddProduct()}
                placeholder="Nome do produto para SEO (ex: Vestido Midi Floral...)"
                className="flex-1 text-xs p-2 rounded-lg border border-[#e4dfd6] bg-white"
              />
              <button
                onClick={handleAddProduct}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 max-h-48 overflow-y-auto">
              {store.top1.seoProductsList?.map((product, idx) => (
                <div 
                  key={idx} 
                  className="p-2 bg-white rounded-lg border border-[#e4dfd6] flex items-center justify-between gap-1 text-xs group"
                >
                  <span className="truncate text-[#1f2430]">
                    <b className="text-emerald-700 mr-1">{idx + 1}.</b> {product}
                  </span>
                  <button
                    onClick={() => handleRemoveProduct(idx)}
                    className="text-gray-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DIGIBRANDS PROPOSAL BUILDER & PDF GENERATOR FOR TOP 2 / TOP 3 & ADICIONAIS */}
      <div className="bg-white rounded-2xl border-2 border-[#c6024e] shadow-md overflow-hidden">
        {/* DigiBrands Header Bar with Official Colors */}
        <div className="bg-[#c6024e] text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#fde917]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#fde917] text-black px-2.5 py-0.5 rounded">
                DIGIBRANDS · PARCEIRA OFICIAL LOJA INTEGRADA
              </span>
              <span className="text-[11px] font-semibold text-white/90">
                Orçamento de Escala Comercial
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <span>Proposta Comercial Personalizada (TOP 2, TOP 3 & Adicionais)</span>
            </h3>
            <p className="text-xs text-white/80 max-w-2xl mt-0.5">
              Serviços, ganchos e valores preenchidos abaixo são puxados e sincronizados automaticamente na emissão do PDF oficial.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadProposal}
              disabled={downloadingPdf}
              className="px-5 py-2.5 rounded-xl bg-[#fde917] hover:bg-[#ffe600] text-black text-xs font-black shadow-md flex items-center gap-2 transition-all transform hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-black" />
              <span>{downloadingPdf ? 'Gerando Documento PDF...' : 'Baixar Proposta em PDF'}</span>
            </button>
          </div>
        </div>

        {/* DigiBrands Agency Contact Strip */}
        <div className="bg-black text-white p-4 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#fde917]" />
            <span>WhatsApp: <b className="text-[#fde917] font-mono">(51) 2165-6224</b></span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#fde917]" />
            <span>E-mail: <b className="text-white">atendimento@digibrands.com.br</b></span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#fde917]" />
            <span>Site: <b className="text-white">digibrands.com.br</b></span>
          </div>
        </div>

        {/* Body: TOP 2 and TOP 3 Cards */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 2 Proposal Card */}
            <div className="bg-[#faf8f5] rounded-2xl border-2 border-[#c6024e]/30 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#e4dfd6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#c6024e] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    02
                  </span>
                  <div>
                    <span className="text-[10px] font-black text-[#c6024e] uppercase">Prioridade Comercial #2</span>
                    <h4 className="text-sm font-bold text-[#1f2430]">
                      {store.top2.title}
                    </h4>
                  </div>
                </div>

                <select
                  value={store.top2.sellerDecision}
                  onChange={e => handleUpsellChange('top2', 'sellerDecision', e.target.value)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${
                    store.top2.sellerDecision === 'aceito' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    store.top2.sellerDecision === 'recusado' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                    'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  <option value="em_negociacao">Em Negociação</option>
                  <option value="aceito">Proposta Aceita ✓</option>
                  <option value="postergado">Postergado</option>
                  <option value="recusado">Recusado</option>
                </select>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#c6024e] block mb-1">Título do Serviço / Pacote:</label>
                  <input
                    type="text"
                    value={store.top2.title}
                    onChange={e => handleUpsellChange('top2', 'title', e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#7a7568] block mb-1">Gancho Identificado no Diagnóstico:</label>
                  <textarea
                    rows={2}
                    value={store.top2.hookDiagnostico}
                    onChange={e => handleUpsellChange('top2', 'hookDiagnostico', e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1f2430] block mb-1">Solução Proposta DigiBrands:</label>
                  <textarea
                    rows={2}
                    value={store.top2.proposedSolution}
                    onChange={e => handleUpsellChange('top2', 'proposedSolution', e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-[#c6024e] block mb-1">Investimento (R$):</label>
                    <input
                      type="number"
                      value={store.top2.estimatedPrice}
                      onChange={e => handleUpsellChange('top2', 'estimatedPrice', Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-[#c6024e]/50 bg-white font-black text-[#c6024e]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#7a7568] block mb-1">Prazo de Entrega (Dias):</label>
                    <input
                      type="number"
                      value={store.top2.estimatedDays}
                      onChange={e => handleUpsellChange('top2', 'estimatedDays', Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-emerald-800 block mb-1">Impacto Esperado no Faturamento:</label>
                  <input
                    type="text"
                    value={store.top2.expectedImpact}
                    onChange={e => handleUpsellChange('top2', 'expectedImpact', e.target.value)}
                    className="w-full p-2 rounded-lg border border-emerald-200 bg-emerald-50/60 text-emerald-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Top 3 Proposal Card */}
            <div className="bg-[#faf8f5] rounded-2xl border-2 border-[#c6024e]/30 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#e4dfd6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#c6024e] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    03
                  </span>
                  <div>
                    <span className="text-[10px] font-black text-[#c6024e] uppercase">Prioridade Comercial #3</span>
                    <h4 className="text-sm font-bold text-[#1f2430]">
                      {store.top3.title}
                    </h4>
                  </div>
                </div>

                <select
                  value={store.top3.sellerDecision}
                  onChange={e => handleUpsellChange('top3', 'sellerDecision', e.target.value)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${
                    store.top3.sellerDecision === 'aceito' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    store.top3.sellerDecision === 'recusado' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                    'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  <option value="em_negociacao">Em Negociação</option>
                  <option value="aceito">Proposta Aceita ✓</option>
                  <option value="postergado">Postergado</option>
                  <option value="recusado">Recusado</option>
                </select>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#c6024e] block mb-1">Título do Serviço / Pacote:</label>
                  <input
                    type="text"
                    value={store.top3.title}
                    onChange={e => handleUpsellChange('top3', 'title', e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#7a7568] block mb-1">Gancho Identificado no Diagnóstico:</label>
                  <textarea
                    rows={2}
                    value={store.top3.hookDiagnostico}
                    onChange={e => handleUpsellChange('top3', 'hookDiagnostico', e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1f2430] block mb-1">Solução Proposta DigiBrands:</label>
                  <textarea
                    rows={2}
                    value={store.top3.proposedSolution}
                    onChange={e => handleUpsellChange('top3', 'proposedSolution', e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-[#c6024e] block mb-1">Investimento (R$):</label>
                    <input
                      type="number"
                      value={store.top3.estimatedPrice}
                      onChange={e => handleUpsellChange('top3', 'estimatedPrice', Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-[#c6024e]/50 bg-white font-black text-[#c6024e]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#7a7568] block mb-1">Prazo de Entrega (Dias):</label>
                    <input
                      type="number"
                      value={store.top3.estimatedDays}
                      onChange={e => handleUpsellChange('top3', 'estimatedDays', Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-emerald-800 block mb-1">Impacto Esperado no Faturamento:</label>
                  <input
                    type="text"
                    value={store.top3.expectedImpact}
                    onChange={e => handleUpsellChange('top3', 'expectedImpact', e.target.value)}
                    className="w-full p-2 rounded-lg border border-emerald-200 bg-emerald-50/60 text-emerald-900 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOM UPSELL SERVICES MANAGER (ADIÇÃO DE NOVOS SERVIÇOS À PROPOSTA) */}
          <div className="bg-[#faf8f5] p-5 rounded-2xl border border-[#e4dfd6] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e4dfd6] pb-3">
              <div>
                <span className="text-[10px] font-black text-[#c6024e] uppercase">
                  Personalização de Proposta
                </span>
                <h4 className="text-sm font-bold text-[#1f2430]">
                  Serviços Adicionais Inclusos no Orçamento
                </h4>
                <p className="text-xs text-[#7a7568]">
                  Adicione outros serviços da DigiBrands como Tráfego Pago, E-mail Marketing, Automação ou Recuperação de Vendas.
                </p>
              </div>

              <button
                onClick={() => setIsAddingCustomService(!isAddingCustomService)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c6024e] text-white text-xs font-bold hover:bg-[#a50241] cursor-pointer shrink-0 transition-colors"
              >
                <PackagePlus className="w-4 h-4" />
                <span>{isAddingCustomService ? 'Cancelar Inclusão' : '+ Adicionar Novo Serviço'}</span>
              </button>
            </div>

            {/* Inline Form to Add Service */}
            {isAddingCustomService && (
              <div className="bg-white p-4 rounded-xl border border-[#c6024e]/30 shadow-xs space-y-3 animate-in fade-in">
                <div className="font-bold text-xs text-[#1f2430] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#c6024e]" />
                  <span>Cadastrar Novo Serviço de Upsell</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Título do Serviço:</label>
                    <input
                      type="text"
                      placeholder="Ex: Gestão de Anúncios no Meta Ads & Google Ads"
                      value={newServiceTitle}
                      onChange={e => setNewServiceTitle(e.target.value)}
                      className="w-full p-2 border border-[#e4dfd6] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Impacto Esperado:</label>
                    <input
                      type="text"
                      placeholder="Ex: Crescimento de 35% no tráfego qualificado"
                      value={newServiceImpact}
                      onChange={e => setNewServiceImpact(e.target.value)}
                      className="w-full p-2 border border-[#e4dfd6] rounded-lg text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Descrição / Escopo Técnico:</label>
                    <textarea
                      rows={2}
                      placeholder="Descreva as entregas do serviço..."
                      value={newServiceDesc}
                      onChange={e => setNewServiceDesc(e.target.value)}
                      className="w-full p-2 border border-[#e4dfd6] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#c6024e] block mb-1">Valor do Investimento (R$):</label>
                    <input
                      type="number"
                      value={newServicePrice}
                      onChange={e => setNewServicePrice(Number(e.target.value))}
                      className="w-full p-2 border border-[#c6024e]/40 rounded-lg text-xs font-bold text-[#c6024e]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Prazo de Implantação (Dias):</label>
                    <input
                      type="number"
                      value={newServiceDays}
                      onChange={e => setNewServiceDays(Number(e.target.value))}
                      className="w-full p-2 border border-[#e4dfd6] rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#e4dfd6]">
                  <button
                    onClick={() => setIsAddingCustomService(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddCustomService}
                    className="px-4 py-1.5 text-xs font-bold bg-[#c6024e] text-white rounded-lg hover:bg-[#a50241] cursor-pointer"
                  >
                    Incluir na Proposta
                  </button>
                </div>
              </div>
            )}

            {/* List of Custom Upsell Services */}
            {(!store.customUpsellServices || store.customUpsellServices.length === 0) ? (
              <div className="p-4 bg-white/70 rounded-xl border border-dashed border-[#e4dfd6] text-center text-xs text-[#7a7568]">
                Nenhum serviço adicional adicionado ainda. O PDF gerará a proposta com o <b>TOP 2</b> e <b>TOP 3</b>.
              </div>
            ) : (
              <div className="space-y-2">
                {store.customUpsellServices.map(service => (
                  <div 
                    key={service.id}
                    className="p-3 bg-white rounded-xl border border-[#e4dfd6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1f2430] truncate">{service.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-pink-50 text-[#c6024e] font-bold">
                          Personalizado
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7a7568] line-clamp-1 mt-0.5">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[11px] text-gray-500">{service.estimatedDays} dias úteis</span>
                      <span className="font-bold text-sm text-[#c6024e]">
                        R$ {Number(service.estimatedPrice).toFixed(2).replace('.', ',')}
                      </span>
                      <button
                        onClick={() => handleRemoveCustomService(service.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Remover serviço da proposta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposal Terms & Consolidated Total Bar */}
          <div className="bg-black text-white p-5 rounded-2xl border-t-4 border-[#fde917] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#fde917] block mb-1">
                  Condições de Pagamento da Proposta:
                </label>
                <input
                  type="text"
                  value={store.proposalPaymentTerms || 'Em até 3x sem juros ou 5% de desconto à vista via PIX.'}
                  onChange={e => onUpdateStore({ ...store, proposalPaymentTerms: e.target.value })}
                  placeholder="Ex: Até 3x sem juros ou 5% no PIX"
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs focus:border-[#fde917] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#fde917] block mb-1">
                  Validade da Proposta Comercial (Dias):
                </label>
                <input
                  type="number"
                  value={store.proposalValidityDays || 10}
                  onChange={e => onUpdateStore({ ...store, proposalValidityDays: Number(e.target.value) })}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs focus:border-[#fde917] focus:outline-none"
                />
              </div>
            </div>

            {/* Consolidated Summary & PDF CTA */}
            <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-gray-400 block">Investimento Total dos Serviços Propostos:</span>
                <span className="text-2xl font-black text-[#fde917]">
                  R$ {totalInvestment.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadProposal}
                  disabled={downloadingPdf}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#c6024e] hover:bg-[#a50241] text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-[#fde917]" />
                  <span>{downloadingPdf ? 'Processando...' : 'Baixar PDF da Proposta de Orçamento'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
