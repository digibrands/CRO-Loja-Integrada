import React, { useRef, useState } from 'react';
import { StoreAuditData } from '../types';
import { Download, Printer, CheckCircle2, Sparkles, AlertCircle, FileText, ArrowLeft, FileCode, Check, ShieldAlert, Zap, Clock } from 'lucide-react';
import { downloadDirectPdf, downloadHtmlReport } from '../utils/pdfExport';
import { getItemDeadline, getRiskAndBenefit, generateDefaultSeoProducts } from '../utils/auditHelpers';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface PdfPreviewReportProps {
  store: StoreAuditData;
  onNavigateTab: (tab: 'overview' | 'checklist' | 'actionplan' | 'pdf' | 'python' | 'delivery' | 'whatsapp') => void;
}

export const PdfPreviewReport: React.FC<PdfPreviewReportProps> = ({ store, onNavigateTab }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Primary Ultra-Reliable Vector PDF Download
  const handleDownloadDirectPdf = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const success = await downloadDirectPdf(store);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } else {
        await handleFallbackCanvasPdf();
      }
    } catch (err) {
      console.error('Direct PDF error, attempting canvas fallback:', err);
      await handleFallbackCanvasPdf();
    } finally {
      setIsGenerating(false);
    }
  };

  // Secondary Canvas Snapshot PDF Fallback
  const handleFallbackCanvasPdf = async () => {
    if (!reportRef.current) return;
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#faf8f5',
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl && htmlEl.style) {
              const bg = htmlEl.style.backgroundColor;
              const color = htmlEl.style.color;
              const border = htmlEl.style.borderColor;

              if (bg && (bg.includes('oklch') || bg.includes('color('))) {
                htmlEl.style.backgroundColor = '#ffffff';
              }
              if (color && (color.includes('oklch') || color.includes('color('))) {
                htmlEl.style.color = '#1f2430';
              }
              if (border && (border.includes('oklch') || border.includes('color('))) {
                htmlEl.style.borderColor = '#e4dfd6';
              }
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeName = (store.storeName || 'loja').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `diagnostico_${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error('Fallback canvas error:', e);
      alert('Não foi possível gerar o PDF gráfico. Utilize a opção "Imprimir / Salvar PDF" do navegador.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    downloadHtmlReport(store);
  };

  // Sanitized executive summary
  let sanitizedSummary = store.executiveSummary || 'Auditoria técnica e comercial concluída com sucesso.';
  sanitizedSummary = sanitizedSummary
    .replace(/banho de loja/gi, 'Escopo do Benefício Loja Integrada')
    .replace(/Top 1 gratuito/gi, 'Top 1 - (ESCOPO BENEFICIO LOJA INTEGRADA)')
    .replace(/oportunidades de upsell no Top 2 e 3/gi, 'Top 2 e 3 (execução opcional seller mediante orçamento)')
    .replace(/Top 2 e 3 upsell/gi, 'Top 2 e 3 (execução opcional seller mediante orçamento)')
    .replace(/upsell no Top 2 e 3/gi, 'Top 2 e 3 (execução opcional seller mediante orçamento)');

  const seoProducts = (store.seoProducts && store.seoProducts.length >= 5)
    ? store.seoProducts
    : generateDefaultSeoProducts(store.storeName, store.segment, store.top1?.seoProductsList);

  return (
    <div className="space-y-6">
      {/* Download Success Banner */}
      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-medium shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><b>PDF baixado com sucesso!</b> O arquivo com tabela de status colorida, impactos e 20 produtos de SEO foi salvo.</span>
          </div>
          <button 
            onClick={() => setDownloadSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#e4dfd6] shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#5b3a6b]/10 text-[#5b3a6b] flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-[#1f2430]">
              Visualização do Documento PDF do Diagnóstico
            </h2>
            <p className="text-[11px] text-[#7a7568]">
              Pronto para download vetorial em alta resolução ou envio por WhatsApp/E-mail
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadHtml}
            title="Baixar versão HTML compacta do relatório"
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#faf8f5] hover:bg-[#e4dfd6] text-[#1f2430] border border-[#e4dfd6] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-[#5b3a6b]" />
            Baixar HTML
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#faf8f5] hover:bg-[#e4dfd6] text-[#1f2430] border border-[#e4dfd6] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / Salvar PDF
          </button>

          <button
            onClick={handleDownloadDirectPdf}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#5b3a6b] hover:bg-[#3d2749] text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isGenerating ? 'Baixando PDF...' : 'Baixar PDF Oficial'}
          </button>
        </div>
      </div>

      {/* The Styled Document Canvas matching checklist_diagnostico */}
      <div className="flex justify-center p-2 sm:p-6 bg-[#e4dfd6]/40 rounded-3xl overflow-x-auto print:p-0 print:bg-white">
        <div 
          ref={reportRef}
          className="w-full max-w-[920px] bg-[#faf8f5] text-[#1f2430] p-8 sm:p-12 shadow-md rounded-lg border border-[#e4dfd6] space-y-8 print:shadow-none print:border-none print:p-4"
          style={{ fontFamily: '"Newsreader", "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif' }}
        >
          {/* Header of the Document */}
          <header className="border-b-[3px] border-[#3d2749] pb-6 relative">
            <div className="font-sans uppercase tracking-[0.14em] text-[11.5px] text-[#e0663f] font-bold mb-2.5">
              Loja Integrada · Ecossistema Oficial de Parcerias
            </div>
            <h1 className="text-3xl sm:text-4xl leading-tight font-semibold text-[#3d2749] tracking-tight mb-2">
              Checklist Padrão de Diagnóstico & Plano de Ação
            </h1>
            <div className="font-sans text-[14px] text-[#5b3a6b] font-bold max-w-2xl leading-relaxed">
              AGÊNCIA PARCEIRA DIGIBRANDS - (51) 2165-6224 | www.digibrands.com.br
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-3 font-sans text-xs text-[#7a7568] bg-white p-3.5 rounded border border-[#e4dfd6]">
              <div><b>Loja:</b> <span className="text-[#1f2430]">{store.storeName}</span></div>
              <div><b>Segmento:</b> <span className="text-[#1f2430]">{store.segment}</span></div>
              <div><b>Data do Diagnóstico:</b> <span className="text-[#1f2430]">{new Date().toLocaleDateString('pt-BR')}</span></div>
              <div><b>PONTUAÇÃO GERAL:</b> <b className="text-emerald-700 text-sm">{store.overallScore}/100</b></div>
              <div className="sm:col-span-4"><b>URL:</b> <span className="text-[#5b3a6b] font-mono">{store.storeUrl}</span></div>
            </div>
          </header>

          {/* Resumo Executivo */}
          <div className="bg-white p-5 rounded border border-[#e4dfd6] space-y-2">
            <h3 className="font-sans text-xs font-bold text-[#3d2749] uppercase tracking-wider">
              1. Resumo Executivo do Diagnóstico
            </h3>
            <p className="font-sans text-xs text-[#1f2430] leading-relaxed">
              {sanitizedSummary}
            </p>
          </div>

          {/* ACTION PLAN: TOP 1 + TOP 2/3 */}
          <div className="space-y-4">
            <div className="font-sans font-bold text-xs uppercase tracking-wider text-[#3d2749] border-b border-[#e4dfd6] pb-2">
              2. Plano de Ação: Prioridades Identificadas (Top 1, Top 2, Top 3)
            </div>

            {/* TOP 1 ESSENCIAL (BENEFICIO LOJA INTEGRADA) */}
            <div className="border-2 border-[#16a34a] bg-[#f0fdf4] rounded-lg p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#16a34a]/30 pb-2">
                <div className="font-sans text-xs font-extrabold text-[#166534] uppercase tracking-wider">
                  Top 1 — Essencial (BENEFICIO LOJA INTEGRADA)
                </div>
                <span className="font-sans text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#166534] text-white self-start sm:self-auto">
                  ESCOPO BENEFICIO LOJA INTEGRADA
                </span>
              </div>

              <div className="font-sans text-xs text-[#1f2430] space-y-2 leading-relaxed">
                <p><b>Escopo Oficial Garantido (Prazo: Imediato):</b></p>
                <ul className="list-disc pl-5 space-y-1 text-[#1f2430]">
                  <li><b>Adequação do layout padrão da Loja Integrada + 1 Banner Promocional</b> profissional com CTA;</li>
                  <li><b>SEO Estratégico dos 20 produtos principais</b> com títulos otimizados e descrições ricas;</li>
                  <li><b>Configuração e apontamento de Domínio Próprio (.com.br)</b> com certificado de segurança SSL.</li>
                </ul>
                <p className="text-[#166534] font-bold pt-1">Executado 100% pela Agência Parceira DigiBrands sem custos ao lojista.</p>
              </div>
            </div>

            {/* TOP 2 & TOP 3 SEM VALORES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top 2 */}
              <div className="border border-[#e4dfd6] bg-white rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] font-bold text-[#5b3a6b] uppercase">
                    Top 2 — {store.top2.title}
                  </span>
                  <span className="font-sans text-[10px] font-bold text-[#5b3a6b] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Oportunidade de Escala
                  </span>
                </div>
                <p className="font-sans text-xs text-[#7a7568]">
                  <b className="text-[#1f2430]">Diagnóstico Detalhado:</b> {store.top2.hookDiagnostico}
                </p>
                <p className="font-sans text-xs text-[#1f2430]">
                  <b>Solução Recomendada:</b> {store.top2.proposedSolution}
                </p>
                <div className="font-sans text-[11px] text-[#1f2430] pt-2 border-t border-[#e4dfd6]">
                  <span className="text-emerald-700 font-bold">Impacto Esperado nos Resultados: </span>
                  <span className="text-[#1f2430]">{store.top2.expectedImpact}</span>
                </div>
              </div>

              {/* Top 3 */}
              <div className="border border-[#e4dfd6] bg-white rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] font-bold text-[#5b3a6b] uppercase">
                    Top 3 — {store.top3.title}
                  </span>
                  <span className="font-sans text-[10px] font-bold text-[#5b3a6b] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Oportunidade de Escala
                  </span>
                </div>
                <p className="font-sans text-xs text-[#7a7568]">
                  <b className="text-[#1f2430]">Diagnóstico Detalhado:</b> {store.top3.hookDiagnostico}
                </p>
                <p className="font-sans text-xs text-[#1f2430]">
                  <b>Solução Recomendada:</b> {store.top3.proposedSolution}
                </p>
                <div className="font-sans text-[11px] text-[#1f2430] pt-2 border-t border-[#e4dfd6]">
                  <span className="text-emerald-700 font-bold">Impacto Esperado nos Resultados: </span>
                  <span className="text-[#1f2430]">{store.top3.expectedImpact}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 11 AREAS OF CHECKLIST */}
          <div className="space-y-4">
            <div className="font-sans font-bold text-xs uppercase tracking-wider text-[#3d2749] border-b border-[#e4dfd6] pb-2">
              3. Matriz Completa de Auditoria — 11 Áreas Vitais do E-commerce (Inspeção Real)
            </div>

            {store.areas.map(area => (
              <div key={area.id} className="border border-[#e4dfd6] bg-white rounded-lg overflow-hidden">
                <div className="flex items-baseline gap-3 px-4 py-3 bg-gradient-to-r from-[#3d2749] to-[#5b3a6b] text-[#f6f1f8]">
                  <span className="font-sans text-xs tracking-wider opacity-75 min-w-[20px]">
                    {area.num}
                  </span>
                  <span className="text-base font-semibold tracking-tight">
                    {area.title}
                  </span>
                </div>

                <ul className="list-none m-0 p-3 sm:p-4 divide-y divide-[#e4dfd6]/60">
                  {area.items.map(item => {
                    const isBenefit = item.isBanhoDeLojaCandidate;
                    const deadline = item.deadlineText || getItemDeadline(item);
                    const riskBenefit = getRiskAndBenefit(item);

                    return (
                      <li 
                        key={item.id} 
                        className={`py-3.5 first:pt-1 last:pb-1 font-sans text-xs leading-relaxed space-y-1.5 transition-colors rounded ${
                          isBenefit 
                            ? 'bg-[#f0fdf4] border-l-4 border-[#16a34a] p-3 my-1.5 shadow-2xs' 
                            : 'p-1.5'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`w-5 h-5 rounded mt-0.5 shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${
                            item.status === 'conforme' ? 'bg-[#16a34a]' :
                            item.status === 'critico' ? 'bg-[#dc2626]' :
                            item.status === 'ajustar' ? 'bg-[#ea580c]' : 'bg-gray-400'
                          }`}>
                            {item.status === 'conforme' ? '✓' : item.status === 'critico' ? '!' : item.status === 'ajustar' ? '△' : '-'}
                          </span>

                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-[#5b3a6b]">
                                {item.id}
                              </span>
                              <span className="font-bold text-[#1f2430]">
                                {item.title}
                              </span>
                              
                              {/* Status Badge with bold white font and specific background color */}
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider text-white ${
                                item.status === 'conforme' ? 'bg-[#16a34a]' :
                                item.status === 'critico' ? 'bg-[#dc2626]' :
                                item.status === 'ajustar' ? 'bg-[#ea580c]' : 'bg-gray-500'
                              }`}>
                                {item.status.toUpperCase()}
                              </span>

                              {isBenefit && (
                                <span className="text-[10px] font-extrabold text-[#166534] bg-white border border-[#166534]/40 rounded-full px-2.5 py-0.5 shadow-2xs">
                                  ★ [Item contemplado no escopo do benefício Loja Integrada]
                                </span>
                              )}
                            </div>

                            <p className="text-[12px] text-[#4a463c] mt-1">
                              <b className="text-[#5b3a6b]">Diagnóstico:</b> {
                                (item.id === 'item-11-1' || item.id === '11.1') && store.item11_1SalesData
                                  ? `${store.item11_1SalesData} (Dados informados pela agência). ${item.diagnosticFindings}`
                                  : item.diagnosticFindings
                              }
                            </p>
                            <p className="text-[12px] text-[#4a463c]">
                              <b className="text-[#166534]">Recomendação:</b> {item.recommendedAction}
                            </p>

                            {(item.status === 'ajustar' || item.status === 'critico') && (
                              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded text-[11.5px] mt-1.5 space-y-1">
                                <div><b className="text-red-700">Impacto se não for ajustado:</b> <span className="text-red-950">{item.riskIfNotFixed || riskBenefit.risk}</span></div>
                                <div><b className="text-green-800">Benefício em caso de correção:</b> <span className="text-green-950">{item.benefitIfFixed || riskBenefit.benefit}</span></div>
                              </div>
                            )}

                            <div className="text-[11px] font-semibold text-[#3d2749] pt-1">
                              ⏱️ <b>Prazo para correção:</b> <span className="text-[#1f2430]">{deadline}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* 4. TABELA DE 20 PRODUTOS DE SEO */}
          <div className="space-y-4">
            <div className="font-sans font-bold text-xs uppercase tracking-wider text-[#3d2749] border-b border-[#e4dfd6] pb-2">
              4. Plano de Otimização de SEO para os 20 Produtos Estratégicos (Google Search)
            </div>

            <div className="border border-[#e4dfd6] bg-white rounded-lg overflow-hidden">
              <div className="p-3.5 bg-gradient-to-r from-[#3d2749] to-[#5b3a6b] text-white">
                <h4 className="text-sm font-bold">20 Produtos com Maior Potencial de Venda no Segmento</h4>
                <p className="text-[11px] text-white/80">Otimizações completas de H1, palavras-chave e descrições para indexação no Google</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#faf8f5] border-b border-[#e4dfd6] text-[#3d2749]">
                      <th className="p-2.5 text-center w-10">#</th>
                      <th className="p-2.5">Produto & Categoria</th>
                      <th className="p-2.5 text-center w-28">Demanda</th>
                      <th className="p-2.5">Diretrizes de SEO (Palavra-Chave, Title & Meta Tag)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4dfd6]/70">
                    {seoProducts.slice(0, 20).map((prod, idx) => {
                      const baseUrl = store.storeUrl 
                        ? (store.storeUrl.startsWith('http') ? store.storeUrl.replace(/\/$/, '') : `https://${store.storeUrl.replace(/\/$/, '')}`)
                        : `https://${(store.storeName || 'loja').toLowerCase().replace(/[^a-z0-9]/g, '')}.lojaintegrada.com.br`;
                      const itemSlug = prod.productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      const exactUrl = prod.productUrl || `${baseUrl}/${itemSlug}`;

                      return (
                        <tr key={prod.id || idx} className="hover:bg-[#faf8f5]/60">
                          <td className="p-2.5 text-center font-bold text-[#5b3a6b]">{idx + 1}</td>
                          <td className="p-2.5">
                            <span className="font-bold text-[#1f2430] block">{prod.productName}</span>
                            <span className="block text-[10px] font-medium text-[#7a7568]">[Categoria: {prod.category || 'Geral'}]</span>
                            <a 
                              href={exactUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10.5px] text-[#5b3a6b] font-mono hover:underline block break-all mt-0.5"
                            >
                              URL: {exactUrl}
                            </a>
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              prod.searchVolumeDemand === 'Muito Alta' ? 'bg-red-100 text-red-800' :
                              prod.searchVolumeDemand === 'Alta' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {prod.searchVolumeDemand || 'Alta'}
                            </span>
                          </td>
                          <td className="p-2.5 space-y-0.5 text-[11px] text-[#4a463c]">
                            <div><b className="text-[#5b3a6b]">Palavra-Chave:</b> {prod.focusKeyword}</div>
                            <div><b className="text-[#1f2430]">Título Otimizado:</b> {prod.optimizedTitle}</div>
                            <div><b className="text-[#7a7568]">Meta Description:</b> {prod.metaDescription}</div>
                            <div><b className="text-[#166534]">Ajustes Recomendados:</b> {prod.seoAdjustments}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <footer className="mt-8 pt-6 border-t border-[#e4dfd6] font-sans text-xs text-[#7a7568] leading-relaxed space-y-2">
            <p>
              <b>Regras Operacionais:</b> O benefício possui validade de 30 dias corridos a partir do primeiro contato. A agência executa o Top 1 (Escopo do Benefício Loja Integrada) com prazo imediato de entrega.
            </p>
            <p className="text-[11px] text-[#7a7568]">
              Emitido por <b>AGÊNCIA PARCEIRA DIGIBRANDS</b> · (51) 2165-6224 | www.digibrands.com.br · Comprovante oficial do Diagnóstico com Especialista.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};
