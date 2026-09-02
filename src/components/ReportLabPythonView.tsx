import React, { useState, useEffect } from 'react';
import { StoreAuditData } from '../types';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Play, 
  FileCode, 
  Sparkles,
  Layers,
  BookOpen,
  Cpu
} from 'lucide-react';

interface ReportLabPythonViewProps {
  store: StoreAuditData;
}

export const ReportLabPythonView: React.FC<ReportLabPythonViewProps> = ({ store }) => {
  const [copied, setCopied] = useState(false);
  const [pythonScript, setPythonScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [runLog, setRunLog] = useState<string | null>(null);

  useEffect(() => {
    fetchPythonCode();
  }, [store]);

  const fetchPythonCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-python-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store)
      });
      const data = await res.json();
      if (data.success && data.pythonCode) {
        setPythonScript(data.pythonCode);
      }
    } catch (err) {
      console.error('Error loading Python script:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPy = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = store.storeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.href = url;
    link.download = `gerar_diagnostico_${safeName}.py`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulateExecution = () => {
    setRunLog('Iniciando pipeline de processamento em Python 3 + ReportLab...');
    setTimeout(() => {
      setRunLog(prev => prev + '\n[1/4] Carregando estilos oficiais Loja Integrada (Plum, Coral, Sage)...');
    }, 400);
    setTimeout(() => {
      setRunLog(prev => prev + '\n[2/4] Mapeando 11 áreas de auditoria e alocando Top 1 (Banho de Loja)...');
    }, 800);
    setTimeout(() => {
      setRunLog(prev => prev + '\n[3/4] Formatando tabelas com TableStyle e NumberedCanvas (Página X de Y)...');
    }, 1200);
    setTimeout(() => {
      setRunLog(prev => prev + `\n[4/4] ✅ PDF gerado com sucesso: relatorio_diagnostico_${store.storeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);
    }, 1600);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-[#3d2749] text-white rounded-2xl p-6 shadow-sm border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Motor de Automação Python & APIs
              </span>
              <span className="text-indigo-200 text-xs font-mono">
                ReportLab 3.x+ / 4.x Compatible
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Script Python de Processamento e Geração Estruturada de Documentos
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Código Python production-ready que utiliza o motor <b>ReportLab</b> (Platypus Flowables, NumberedCanvas, TableStyles e paleta de cores corporativa) para compilar relatórios PDF padronizados da campanha Loja Integrada automaticamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Script'}
            </button>

            <button
              onClick={handleDownloadPy}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar .py
            </button>
          </div>
        </div>
      </div>

      {/* Integration Guide & Terminal CLI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-[#e4dfd6] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#5b3a6b]">
            <BookOpen className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              1. Instalação das Bibliotecas
            </h3>
          </div>
          <p className="text-xs text-[#7a7568]">
            Instale o ReportLab e dependências no seu ambiente Python local ou servidor:
          </p>
          <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] select-all">
            pip install reportlab requests google-genai
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#e4dfd6] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#5b3a6b]">
            <Terminal className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              2. Execução Direta / CLI
            </h3>
          </div>
          <p className="text-xs text-[#7a7568]">
            Rode o script gerado para compilar o PDF instantaneamente na máquina:
          </p>
          <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] select-all">
            python3 gerar_diagnostico_{store.storeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.py
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#e4dfd6] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#5b3a6b]">
            <Cpu className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              3. Pipeline em Lote / Webhook
            </h3>
          </div>
          <p className="text-xs text-[#7a7568]">
            Pode ser integrado ao webhook de novos cadastros de lojistas para geração automática de relatórios em segundos.
          </p>
          <button
            onClick={handleSimulateExecution}
            className="w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" /> Testar Execução do Pipeline
          </button>
        </div>
      </div>

      {/* Terminal Output if Simulated */}
      {runLog && (
        <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs border border-emerald-900/60 shadow-inner whitespace-pre-wrap">
          <div className="flex items-center justify-between text-slate-400 text-[10px] pb-2 border-b border-slate-800 mb-2">
            <span>Terminal Execution Log — Python 3.10 + ReportLab Platypus Engine</span>
            <button onClick={() => setRunLog(null)} className="text-slate-400 hover:text-white">Fechar [X]</button>
          </div>
          {runLog}
        </div>
      )}

      {/* Code Editor / Viewer */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-slate-950 text-slate-300 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-xs font-semibold text-slate-200">
              gerar_diagnostico_{store.storeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.py
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <div className="p-4 overflow-x-auto max-h-[600px] text-xs font-mono text-slate-200 bg-slate-900 leading-relaxed scrollbar-thin">
          <pre>
            <code>{pythonScript || '# Carregando script Python...'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
