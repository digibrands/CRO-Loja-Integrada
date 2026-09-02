import React from 'react';
import { StoreAuditData } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  Layers
} from 'lucide-react';

interface DashboardOverviewProps {
  store: StoreAuditData;
  onNavigateTab: (tab: 'overview' | 'checklist' | 'actionplan' | 'pdf' | 'python' | 'delivery' | 'whatsapp') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ store, onNavigateTab }) => {
  const totalItems = store.areas.reduce((acc, a) => acc + a.items.length, 0);
  const conformeCount = store.areas.reduce((acc, a) => acc + a.items.filter(i => i.status === 'conforme').length, 0);
  const ajustarCount = store.areas.reduce((acc, a) => acc + a.items.filter(i => i.status === 'ajustar').length, 0);
  const criticoCount = store.areas.reduce((acc, a) => acc + a.items.filter(i => i.status === 'critico').length, 0);

  const potentialUpsellValue = (store.top2?.estimatedPrice || 0) + (store.top3?.estimatedPrice || 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with SLA Status and Campaign Summary */}
      <div className="bg-gradient-to-br from-[#3d2749] via-[#4d315c] to-[#5b3a6b] text-white rounded-2xl p-6 shadow-sm border border-[#5b3a6b]/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#e0663f] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Diagnóstico Oficial Concluído
              </span>
              <span className="bg-white/10 text-white/90 text-xs px-3 py-1 rounded-full font-medium">
                11 Áreas Avaliadas · 46 Critérios
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-3 py-1 rounded-full font-semibold">
                Top 1 Gratuito Alocado
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white">
              {store.storeName} — Diagnóstico de Performance & Oportunidades
            </h2>

            <p className="text-sm text-[#faf8f5]/85 leading-relaxed max-w-3xl">
              {store.executiveSummary}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-white/90">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-[#e0663f]" />
                <span>Primeiro Contato: <b>Em até 24h úteis</b></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <Layers className="w-4 h-4 text-[#5c7a63]" />
                <span>Janela de Coleta: <b>7 dias corridos</b></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <Award className="w-4 h-4 text-amber-300" />
                <span>Prazo de Entrega: <b>5 dias úteis</b> após envio</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15">
            <div className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
              Score Geral de Maturidade
            </div>
            <div className="text-5xl font-black text-white tracking-tight my-1 flex items-baseline">
              {store.overallScore}
              <span className="text-xl text-white/60 font-medium">/100</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden my-2">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  store.overallScore >= 75 ? 'bg-emerald-400' : store.overallScore >= 50 ? 'bg-amber-400' : 'bg-red-400'
                }`}
                style={{ width: `${store.overallScore}%` }}
              />
            </div>
            <p className="text-[11px] text-white/70 text-center">
              {store.overallScore >= 75 ? 'Loja com boa estrutura' : store.overallScore >= 50 ? 'Maturidade média com gargalos de conversão' : 'Loja crítica, necessita intervenção imediata'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Checklist Items Card */}
        <div className="bg-white rounded-xl p-5 border border-[#e4dfd6] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7a7568] uppercase tracking-wider">
              Total de Critérios
            </span>
            <span className="w-8 h-8 rounded-lg bg-[#faf8f5] flex items-center justify-center text-[#5b3a6b]">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1f2430]">{totalItems}</span>
            <span className="text-xs text-[#7a7568]">em 11 áreas</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span><b>{conformeCount}</b> conformes ({Math.round((conformeCount / totalItems) * 100)}%)</span>
          </div>
        </div>

        {/* Needs Adjustments Card */}
        <div className="bg-white rounded-xl p-5 border border-[#e4dfd6] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Necessitam Ajustes
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-900">{ajustarCount}</span>
            <span className="text-xs text-amber-800">itens mapeados</span>
          </div>
          <p className="mt-3 text-xs text-[#7a7568]">
            Alvos ideais para o plano de ação
          </p>
        </div>

        {/* Critical Bottlenecks Card */}
        <div className="bg-white rounded-xl p-5 border border-[#e4dfd6] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
              Gargalos Críticos
            </span>
            <span className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-900">{criticoCount}</span>
            <span className="text-xs text-rose-800">bloqueadores de venda</span>
          </div>
          <p className="mt-3 text-xs text-rose-700 font-medium">
            3 incluídos no Banho de Loja grátis
          </p>
        </div>

        {/* Upsell Revenue Potential Card */}
        <div className="bg-white rounded-xl p-5 border border-[#e4dfd6] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5b3a6b] uppercase tracking-wider">
              Potencial de Upsell
            </span>
            <span className="w-8 h-8 rounded-lg bg-[#f6f1f8] flex items-center justify-center text-[#5b3a6b]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#5b3a6b]">
              R$ {potentialUpsellValue.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[#7a7568]">Top 2 + Top 3</span>
            <span className="font-semibold text-[#e0663f] hover:underline cursor-pointer" onClick={() => onNavigateTab('actionplan')}>
              Ver propostas →
            </span>
          </div>
        </div>
      </div>

      {/* Main Dual Columns: TOP 1 Banho de Loja + TOP 2/3 UPSELL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top 1 Banho de Loja (Obligatory & Free) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border-2 border-emerald-500/40 shadow-xs space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                01
              </span>
              <div>
                <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase block">
                  Entregável Obrigatório da Campanha
                </span>
                <h3 className="text-base font-bold text-[#1f2430]">
                  Top 1 — Banho de Loja (100% Gratuito p/ Lojista)
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              R$ 0,00 (Grátis)
            </span>
          </div>

          <p className="text-xs text-[#7a7568] leading-relaxed">
            {store.top1.details}
          </p>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#faf8f5] border border-[#e4dfd6]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <b className="text-[#1f2430] block">Adequação do Layout Padrão + 1 Banner Promocional</b>
                <span className="text-[#7a7568]">{store.top1.bannerSpecs || '1 banner principal de alta conversão + paleta harmônica'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#faf8f5] border border-[#e4dfd6]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <b className="text-[#1f2430] block">SEO dos 20 Produtos Principais</b>
                <span className="text-[#7a7568]">Títulos comerciais e descrições ricas otimizadas para o Google</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#faf8f5] border border-[#e4dfd6]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <b className="text-[#1f2430] block">Configuração e Apontamento de Domínio</b>
                <span className="text-[#7a7568]">Domínio próprio ({store.top1.domainName || 'www.sualoja.com.br'}) + Certificado SSL</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#e4dfd6]">
            <span className="text-xs text-[#7a7568]">
              Remuneração da Agência: <b>R$ 100,00</b> pago pela Loja Integrada
            </span>
            <button
              onClick={() => onNavigateTab('actionplan')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
            >
              Gerenciar Execução <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Top 2 & Top 3 UPSELL Proposals */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#e4dfd6] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#f6f1f8] text-[#5b3a6b] flex items-center justify-center font-bold text-sm">
                02/3
              </span>
              <div>
                <span className="text-[11px] font-bold text-[#e0663f] tracking-wider uppercase block">
                  Oportunidades Comerciais da Agência
                </span>
                <h3 className="text-base font-bold text-[#1f2430]">
                  Top 2 e Top 3 — Propostas de Upsell (Cobrados)
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-[#5b3a6b] border border-purple-200">
              Receita Extra Agência
            </span>
          </div>

          <p className="text-xs text-[#7a7568] leading-relaxed">
            Estes pontos identificados na auditoria não estão no escopo gratuito e servem como propostas sob medida para alavancar os resultados do seller.
          </p>

          <div className="space-y-3 pt-1">
            {/* Top 2 Item */}
            <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5b3a6b]">
                  {store.top2.title}
                </span>
                <span className="text-xs font-extrabold text-[#e0663f]">
                  R$ {store.top2.estimatedPrice.toLocaleString('pt-BR')},00
                </span>
              </div>
              <p className="text-xs text-[#7a7568]">
                {store.top2.hookDiagnostico}
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#7a7568] pt-1">
                <span>Prazo: <b>{store.top2.estimatedDays} dias</b></span>
                <span className="font-semibold text-emerald-700">{store.top2.expectedImpact}</span>
              </div>
            </div>

            {/* Top 3 Item */}
            <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5b3a6b]">
                  {store.top3.title}
                </span>
                <span className="text-xs font-extrabold text-[#e0663f]">
                  R$ {store.top3.estimatedPrice.toLocaleString('pt-BR')},00
                </span>
              </div>
              <p className="text-xs text-[#7a7568]">
                {store.top3.hookDiagnostico}
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#7a7568] pt-1">
                <span>Prazo: <b>{store.top3.estimatedDays} dias</b></span>
                <span className="font-semibold text-emerald-700">{store.top3.expectedImpact}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#e4dfd6]">
            <span className="text-xs text-[#7a7568]">
              Proposta pronta para envio no PDF e WhatsApp
            </span>
            <button
              onClick={() => onNavigateTab('actionplan')}
              className="text-xs font-semibold text-[#5b3a6b] hover:text-[#3d2749] inline-flex items-center gap-1 cursor-pointer"
            >
              Ver Detalhes do Upsell <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 11 Areas Matrix Snapshot */}
      <div className="bg-white rounded-2xl p-6 border border-[#e4dfd6] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#1f2430]">
              Mapeamento Rápido das 11 Áreas de Diagnóstico
            </h3>
            <p className="text-xs text-[#7a7568]">
              Desempenho da loja conforme o roteiro oficial do Checklist Padrão
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('checklist')}
            className="text-xs font-semibold text-[#5b3a6b] hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            Abrir Checklist Completo ({totalItems} itens) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {store.areas.map(area => {
            const areaConforme = area.items.filter(i => i.status === 'conforme').length;
            const areaAjustar = area.items.filter(i => i.status === 'ajustar').length;
            const areaCritico = area.items.filter(i => i.status === 'critico').length;
            const scorePct = Math.round((areaConforme / area.items.length) * 100);

            return (
              <div 
                key={area.id}
                onClick={() => onNavigateTab('checklist')}
                className="p-3.5 rounded-xl border border-[#e4dfd6] hover:border-[#5b3a6b] bg-[#faf8f5]/50 hover:bg-white transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-white bg-[#5b3a6b] px-1.5 py-0.5 rounded">
                      {area.num}
                    </span>
                    <span className="text-xs font-bold text-[#1f2430] group-hover:text-[#5b3a6b] transition-colors line-clamp-1">
                      {area.title}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#7a7568]">
                    {scorePct}%
                  </span>
                </div>

                <div className="w-full bg-[#e4dfd6] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${scorePct >= 70 ? 'bg-emerald-500' : scorePct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${scorePct}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#7a7568]">
                  <span className="text-emerald-700 font-medium">{areaConforme} ok</span>
                  <span>•</span>
                  <span className="text-amber-700 font-medium">{areaAjustar} ajustar</span>
                  <span>•</span>
                  <span className="text-rose-700 font-medium">{areaCritico} crítico</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
