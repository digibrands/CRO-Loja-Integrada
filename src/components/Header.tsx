import React, { useState } from 'react';
import { StoreAuditData } from '../types';
import { 
  ShoppingBag, 
  Sparkles, 
  FileText, 
  Code2, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Download,
  Building2,
  Check
} from 'lucide-react';
import { downloadDirectPdf } from '../utils/pdfExport';

interface HeaderProps {
  store: StoreAuditData;
  activeTab: 'stores' | 'overview' | 'checklist' | 'actionplan' | 'pdf' | 'python' | 'delivery' | 'whatsapp';
  setActiveTab: (tab: 'stores' | 'overview' | 'checklist' | 'actionplan' | 'pdf' | 'python' | 'delivery' | 'whatsapp') => void;
  onNewAuditClick: () => void;
  onExportPdf: () => void;
  storeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  store,
  activeTab,
  setActiveTab,
  onNewAuditClick,
  onExportPdf,
  storeCount
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const storeData = store || {
    storeName: 'Carregando Loja...',
    sellerName: 'Lojista',
    storeUrl: 'https://lojaintegrada.com.br',
    overallScore: 0,
    areas: []
  };

  const totalChecklistItems = storeData.areas?.reduce((acc, a) => acc + (a.items?.length || 0), 0) || 0;

  const handleHeaderPdfClick = async () => {
    if (store && store.areas && store.areas.length > 0) {
      setIsDownloading(true);
      try {
        await downloadDirectPdf(store);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 3000);
      } catch (e) {
        console.error('Error downloading PDF from header:', e);
        onExportPdf();
      } finally {
        setIsDownloading(false);
      }
    } else {
      onExportPdf();
    }
  };

  return (
    <header className="bg-white border-b border-[#e4dfd6] sticky top-0 z-40 shadow-xs">
      {/* Top Partner Branding Bar */}
      <div className="bg-gradient-to-r from-[#3d2749] via-[#5b3a6b] to-[#3d2749] text-white px-4 py-2 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#e0663f] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Parceiro Oficial
            </span>
            <span className="text-white/90">
              <b>AGÊNCIA PARCEIRA DIGIBRANDS</b> - (51) 2165-6224 | www.digibrands.com.br · Ecossistema Loja Integrada
            </span>
          </div>

          <div className="flex items-center gap-4 text-white/80 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#e0663f]" />
              SLA 1º Contato: <b>24h úteis</b>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5c7a63]" />
              Remuneração LI: <b>R$ 100,00 / loja validada</b>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Action Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b3a6b] to-[#3d2749] flex items-center justify-center text-white shadow-sm">
            <ShoppingBag className="w-5 h-5 text-[#f6f1f8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1f2430] tracking-tight">
                {storeData.storeName}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                PONTUAÇÃO GERAL: {storeData.overallScore}/100
              </span>
            </div>
            <p className="text-xs text-[#7a7568] flex items-center gap-2">
              <span>Lojista: <b>{storeData.sellerName}</b></span>
              <span>•</span>
              <a 
                href={storeData.storeUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#5b3a6b] hover:underline font-mono"
              >
                {storeData.storeUrl?.replace(/^https?:\/\//, '') || 'loja.com.br'}
              </a>
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNewAuditClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#faf8f5] hover:bg-[#e4dfd6] text-[#1f2430] border border-[#e4dfd6] transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e0663f]" />
            Novo Diagnóstico com IA
          </button>

          <button
            onClick={handleHeaderPdfClick}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#5b3a6b] hover:bg-[#3d2749] text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>PDF Baixado!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'Gerando PDF...' : 'Baixar PDF do Diagnóstico'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto border-t border-[#e4dfd6]/60 scrollbar-none">
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'stores'
              ? 'border-[#5b3a6b] text-[#5b3a6b] bg-[#faf8f5]/60'
              : 'border-transparent text-[#7a7568] hover:text-[#1f2430]'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#e0663f]" />
          <span>Painel de Lojas</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#5b3a6b]/10 text-[#5b3a6b] font-bold">
            {storeCount}
          </span>
        </button>

        <div className="h-4 w-px bg-[#e4dfd6] mx-1"></div>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#5b3a6b] text-[#5b3a6b] bg-[#faf8f5]/60'
              : 'border-transparent text-[#7a7568] hover:text-[#1f2430]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Visão Geral & Metas
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'checklist'
              ? 'border-[#5b3a6b] text-[#5b3a6b] bg-[#faf8f5]/60'
              : 'border-transparent text-[#7a7568] hover:text-[#1f2430]'
          }`}
        >
          <FileText className="w-4 h-4" />
          Checklist (11 Áreas)
        </button>

        <button
          onClick={() => setActiveTab('actionplan')}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'actionplan'
              ? 'border-[#5b3a6b] text-[#5b3a6b] bg-[#faf8f5]/60'
              : 'border-transparent text-[#7a7568] hover:text-[#1f2430]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#e0663f]" />
          Top 1 + Top 2/3
        </button>

        <button
          onClick={() => setActiveTab('pdf')}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'pdf'
              ? 'border-[#5b3a6b] text-[#5b3a6b] bg-[#faf8f5]/60'
              : 'border-transparent text-[#7a7568] hover:text-[#1f2430]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#5c7a63]" />
          Visualizador do Relatório
        </button>

        <div className="h-4 w-px bg-[#e4dfd6] mx-1"></div>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'border-[#5b3a6b] text-[#5b3a6b] bg-[#faf8f5]/60'
              : 'border-transparent text-[#7a7568] hover:text-[#1f2430]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          Atendimento WhatsApp
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'delivery'
              ? 'border-[#5b3a6b] text-[#5b3a6b] bg-[#faf8f5]/60'
              : 'border-transparent text-[#7a7568] hover:text-[#1f2430]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-[#e0663f]" />
          Comprovação & Validação LI
        </button>

        <button
          onClick={() => setActiveTab('python')}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'python'
              ? 'border-[#5b3a6b] text-[#5b3a6b] bg-[#faf8f5]/60'
              : 'border-transparent text-[#7a7568] hover:text-[#1f2430]'
          }`}
        >
          <Code2 className="w-4 h-4 text-indigo-600" />
          Automação Python
        </button>
      </div>
    </header>
  );
};
