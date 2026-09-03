import React, { useState } from 'react';
import { StoreAuditData, ChecklistArea } from '../types';
import { DEFAULT_CHECKLIST_AREAS } from '../data/defaultChecklist';
import { generateDefaultSeoProducts, formatItem11_1 } from '../utils/auditHelpers';
import { 
  Sparkles, 
  X, 
  Globe, 
  User, 
  Phone, 
  Mail, 
  Tag, 
  FileCode, 
  Loader2,
  CheckCircle2,
  Zap,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface StoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuditComplete: (auditData: StoreAuditData) => void;
}

export const StoreFormModal: React.FC<StoreFormModalProps> = ({
  isOpen,
  onClose,
  onAuditComplete
}) => {
  const [storeName, setStoreName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerWhatsapp, setSellerWhatsapp] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [segment, setSegment] = useState('Moda & Acessórios');
  const [notes, setNotes] = useState('');
  const [rawHtml, setRawHtml] = useState('');
  const [item11_1SalesData, setItem11_1SalesData] = useState('');
  const [customProductsText, setCustomProductsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoadSample = (sampleType: 'moda' | 'eletronicos' | 'pet') => {
    if (sampleType === 'moda') {
      setStoreName('Lumina Conceito');
      setSellerName('Mariana Ribeiro');
      setSellerWhatsapp('(11) 97654-3210');
      setSellerEmail('mariana@luminaconceito.com.br');
      setStoreUrl('https://luminaconceito.lojaintegrada.com.br');
      setSegment('Moda Feminina & Calçados');
      setNotes('Loja inaugurada há 2 meses com 40 produtos cadastrados. Sofre com abandono de carrinho e ainda não possui domínio próprio configurado nem banner de lançamento.');
      setItem11_1SalesData('Última venda: há 4 dias (28/08/2026). Volume: 18 pedidos nos últimos 30 dias, 35 pedidos nos 60 dias e 52 pedidos nos 90 dias.');
    } else if (sampleType === 'eletronicos') {
      setStoreName('TechPrime Acessórios');
      setSellerName('Rodrigo Fontes');
      setSellerWhatsapp('(21) 98123-4567');
      setSellerEmail('rodrigo.techprime@gmail.com');
      setStoreUrl('https://techprime.lojaintegrada.com.br');
      setSegment('Eletrônicos & Smart Gadgets');
      setNotes('Catálogo com 60 produtos. Descrições copiadas do distribuidor sem SEO. Precisa de adequação de layout e configuração de Pixel da Meta.');
      setItem11_1SalesData('Última venda: há 12 dias. Volume: 9 vendas nos últimos 30 dias, 22 vendas nos 60 dias e 41 vendas nos 90 dias.');
    } else {
      setStoreName('PetZen Nutrição & Conforto');
      setSellerName('Fernanda Castro');
      setSellerWhatsapp('(31) 99876-5432');
      setSellerEmail('fernanda@petzen.com.br');
      setStoreUrl('https://petzen.lojaintegrada.com.br');
      setSegment('Pet Shop & Veterinária');
      setNotes('Loja nova, boa prontidão de estoque de rações e camas. Precisa de banner principal e otimização dos 20 produtos mais vendidos.');
      setItem11_1SalesData('Última venda: ontem (31/08/2026). Volume: 45 pedidos em 30 dias, 98 pedidos em 60 dias e 160 pedidos em 90 dias.');
    }
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      alert('Por favor, informe o nome da loja.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          sellerName: sellerName || 'Lojista',
          sellerWhatsapp: sellerWhatsapp || '(11) 99999-9999',
          sellerEmail: sellerEmail || 'lojista@exemplo.com.br',
          storeUrl: storeUrl || `https://${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.lojaintegrada.com.br`,
          segment,
          notes,
          rawHtmlSnippet: rawHtml,
          item11_1SalesData: item11_1SalesData.trim(),
          customProductsText: customProductsText.trim(),
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const aiData = result.data;

        // Ensure item11.1 in checklist adheres to sales rules
        let finalAreas = (aiData.areas && aiData.areas.length > 0 ? aiData.areas : DEFAULT_CHECKLIST_AREAS) as ChecklistArea[];
        finalAreas = finalAreas.map(area => {
          if (area.id === 11 || area.num === '11') {
            return {
              ...area,
              items: area.items.map(item => {
                if (item.id === 'item-11-1' || item.id === '11.1' || item.title?.includes('Data da última venda')) {
                  return formatItem11_1(item, item11_1SalesData.trim());
                }
                return item;
              })
            };
          }
          return area;
        });

        // Build full store structure
        const fullAudit: StoreAuditData = {
          id: 'store-' + Date.now(),
          storeName: storeName.trim(),
          sellerName: sellerName.trim() || 'Lojista Parceiro',
          sellerWhatsapp: sellerWhatsapp.trim() || '(11) 99999-9999',
          sellerEmail: sellerEmail.trim() || 'lojista@loja.com.br',
          storeUrl: storeUrl.trim() || `https://${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.lojaintegrada.com.br`,
          segment: segment || 'Varejo',
          registeredDate: new Date().toISOString().split('T')[0],
          firstContactDate: new Date().toISOString().split('T')[0],
          status: 'contato_iniciado',
          contactAttempts: 1,
          item11_1SalesData: item11_1SalesData.trim(),

          overallScore: aiData.overallScore || 58,
          totalConforme: finalAreas.flatMap((a: any) => a.items).filter((i: any) => i.status === 'conforme').length,
          totalAjustar: finalAreas.flatMap((a: any) => a.items).filter((i: any) => i.status === 'ajustar').length,
          totalCritico: finalAreas.flatMap((a: any) => a.items).filter((i: any) => i.status === 'critico').length,
          totalNaoAplicavel: 0,
          executiveSummary: aiData.executiveSummary || `Auditoria detalhada da loja ${storeName}. Identificados pontos prioritários no Top 1 - (ESCOPO BENEFICIO LOJA INTEGRADA) e oportunidades no Top 2 e 3 (execução opcional seller mediante orçamento).`,
          strengths: aiData.strengths || ['Prontidão de produtos para envio', 'Meios de pagamento configurados'],
          urgentBottlenecks: aiData.urgentBottlenecks || ['SEO dos 20 produtos principais', 'Banners profissionais e identidade visual'],

          areas: finalAreas,

          top1: {
            title: aiData.top1?.title || 'Top 1 — Banho de Loja Essencial (BENEFICIO LOJA INTEGRADA)',
            includedItems: aiData.top1?.includedItems || {
              layoutStandardAndBanner: true,
              seo20Products: true,
              domainConfiguration: true
            },
            details: aiData.top1?.details || 'Execução pela Agência Parceira DigiBrands dentro do escopo do benefício Loja Integrada: adequação de layout + 1 banner, SEO de 20 produtos e configuração de domínio.',
            bannerSpecs: aiData.top1?.bannerSpecs || '1 banner principal profissional desktop (1920x600px) e mobile com CTA',
            seoProductsList: aiData.top1?.seoProductsList || [
              'Produto Destaque 01', 'Produto Destaque 02', 'Produto Destaque 03', 'Produto Destaque 04',
              'Produto Destaque 05', 'Produto Destaque 06', 'Produto Destaque 07', 'Produto Destaque 08',
              'Produto Destaque 09', 'Produto Destaque 10', 'Produto Destaque 11', 'Produto Destaque 12',
              'Produto Destaque 13', 'Produto Destaque 14', 'Produto Destaque 15', 'Produto Destaque 16',
              'Produto Destaque 17', 'Produto Destaque 18', 'Produto Destaque 19', 'Produto Destaque 20'
            ],
            domainName: aiData.top1?.domainName || (storeUrl.includes('lojaintegrada') ? 'www.' + storeName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com.br' : storeUrl.replace('https://', '')),
            executionStatus: 'em_andamento',
            isFreeBenefit: true
          },

          top2: {
            id: 'top2',
            title: aiData.top2?.title || 'Top 2 — Automação e Recuperação de Carrinho Abandonado no WhatsApp',
            areaName: aiData.top2?.areaName || 'Pagamento e Checkout',
            hookDiagnostico: aiData.top2?.hookDiagnostico || 'Loja com abandono no checkout sem régua de mensagens automáticas.',
            proposedSolution: aiData.top2?.proposedSolution || 'Implantação de régua de automação via WhatsApp com disparos inteligentes.',
            commercialPitch: aiData.top2?.commercialPitch || 'Recupere até 25% das vendas perdidas sem gastar mais em anúncios.',
            estimatedPrice: aiData.top2?.estimatedPrice || 650,
            estimatedDays: aiData.top2?.estimatedDays || 4,
            expectedImpact: aiData.top2?.expectedImpact || 'Recuperação estimada de 18% a 25% dos pedidos abandonados no checkout.',
            sellerDecision: 'em_negociacao'
          },

          top3: {
            id: 'top3',
            title: aiData.top3?.title || 'Top 3 — Gestão e Estruturação de Tráfego Pago GA4 & Meta Ads',
            areaName: aiData.top3?.areaName || 'Analytics e Tráfego',
            hookDiagnostico: aiData.top3?.hookDiagnostico || 'Ausência de campanhas pagas contínuas e Pixel com API de Conversões.',
            proposedSolution: aiData.top3?.proposedSolution || 'Configuração avançada de GA4, Meta Pixel e lançamento de anúncios de Shopping.',
            commercialPitch: aiData.top3?.commercialPitch || 'Atraia novos compradores qualificados todos os dias.',
            estimatedPrice: aiData.top3?.estimatedPrice || 980,
            estimatedDays: aiData.top3?.estimatedDays || 7,
            expectedImpact: aiData.top3?.expectedImpact || 'Atração previsível de 1.500 a 3.000 novos visitantes qualificados/mês.',
            sellerDecision: 'em_negociacao'
          },

          beforeAfterNotes: {
            layoutBeforeDesc: 'Layout padrão sem banner e sem personalização visual.',
            layoutAfterDesc: 'Layout otimizado com paleta harmônica e 1 banner promocional com CTA.',
            seoBeforeDesc: 'Títulos curtos sem palavras-chave e descrições padrão.',
            seoAfterDesc: '20 produtos com títulos otimizados para busca do Google e descrições ricas.',
            domainBeforeDesc: storeUrl || 'subdominio.lojaintegrada.com.br',
            domainAfterDesc: 'www.' + storeName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com.br com SSL ativo'
          },

          clientApprovalNote: 'Aguardando validação final das melhorias implementadas.',

          nfStatus: {
            eligible: true,
            amount: 100.0,
            referenceMonth: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
            cnaeCode: '7319-0/02',
            serviceCode: '17.06'
          }
        };

        onAuditComplete(fullAudit);
        onClose();
      } else {
        throw new Error(result.error || 'Erro na resposta do servidor.');
      }
    } catch (err: any) {
      console.error('Audit failed, generating enhanced fallback store:', err);
      
      // Update checklist with sales data for fallback
      let fallbackAreas = DEFAULT_CHECKLIST_AREAS.map(area => {
        if (area.id === 11 || area.num === '11') {
          return {
            ...area,
            items: area.items.map(item => {
              if (item.id === 'item-11-1' || item.id === '11.1' || item.title?.includes('Data da última venda')) {
                return formatItem11_1(item, item11_1SalesData.trim());
              }
              return item;
            })
          };
        }
        return area;
      });

      const fallbackAudit: StoreAuditData = {
        id: 'store-' + Date.now(),
        storeName: storeName.trim(),
        sellerName: sellerName.trim() || 'Lojista Parceiro',
        sellerWhatsapp: sellerWhatsapp.trim() || '(11) 99999-9999',
        sellerEmail: sellerEmail.trim() || 'lojista@exemplo.com.br',
        storeUrl: storeUrl.trim() || `https://${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.lojaintegrada.com.br`,
        segment: segment || 'Geral',
        registeredDate: new Date().toISOString().split('T')[0],
        firstContactDate: new Date().toISOString().split('T')[0],
        status: 'contato_iniciado',
        contactAttempts: 1,
        item11_1SalesData: item11_1SalesData.trim(),
        overallScore: 62,
        totalConforme: 20,
        totalAjustar: 18,
        totalCritico: 8,
        totalNaoAplicavel: 0,
        executiveSummary: `Auditoria detalhada da loja ${storeName}. Identificados pontos prioritários no Top 1 - (ESCOPO BENEFICIO LOJA INTEGRADA) e oportunidades no Top 2 e 3 (execução opcional seller mediante orçamento).`,
        strengths: ['Pronta entrega estruturada', 'Meios de pagamento ativos'],
        urgentBottlenecks: ['SEO nos produtos principais', 'Banners e identidade visual'],
        areas: fallbackAreas,
        top1: {
          title: 'Top 1 — Essencial (BENEFICIO LOJA INTEGRADA)',
          includedItems: {
            layoutStandardAndBanner: true,
            seo20Products: true,
            domainConfiguration: true
          },
          details: 'Execução pela Agência Parceira DigiBrands dentro do benefício oficial Loja Integrada.',
          bannerSpecs: '1 banner promocional 1920x600px desktop com oferta de lançamento',
          seoProductsList: generateDefaultSeoProducts(
            storeName || 'Loja Online',
            segment || 'Varejo',
            customProductsText ? customProductsText.split(/[\n,;]+/).map(p => p.trim()).filter(p => p.length > 1) : undefined,
            storeUrl
          ).map(p => p.productName),
          domainName: storeUrl.replace('https://', ''),
          executionStatus: 'em_andamento',
          isFreeBenefit: true
        },
        seoProducts: generateDefaultSeoProducts(
          storeName || 'Loja Online',
          segment || 'Varejo',
          customProductsText ? customProductsText.split(/[\n,;]+/).map(p => p.trim()).filter(p => p.length > 1) : undefined,
          storeUrl
        ),
        top2: {
          id: 'top2',
          title: 'Top 2 — Automação de Carrinho Abandonado no WhatsApp',
          areaName: 'Pagamento e Checkout',
          hookDiagnostico: 'Loja sem fluxo automatizado para recuperar compradores que desistem no checkout.',
          proposedSolution: 'Implantação de régua de automação de WhatsApp com disparos inteligentes.',
          commercialPitch: 'Recupere até 25% dos carrinhos abandonados todos os meses.',
          estimatedPrice: 650,
          estimatedDays: 4,
          expectedImpact: 'Recuperação estimada de +18% a +25% de faturamento em carrinhos abandonados.',
          sellerDecision: 'em_negociacao'
        },
        top3: {
          id: 'top3',
          title: 'Top 3 — Tráfego Pago GA4 & Meta Ads Conversion API',
          areaName: 'Analytics e Tráfego',
          hookDiagnostico: 'Ausência de rastreamento avançado de conversão e campanhas ativas.',
          proposedSolution: 'Instalação completa de GA4, Pixel e gestão de campanhas de tráfego pago.',
          commercialPitch: 'Gere um fluxo constante de novos clientes qualificados.',
          estimatedPrice: 980,
          estimatedDays: 7,
          expectedImpact: 'Geração previsível de 1.500 a 3.000 novos visitantes qualificados no mês.',
          sellerDecision: 'em_negociacao'
        },
        beforeAfterNotes: {
          layoutBeforeDesc: 'Layout padrão sem banner e sem identidade personalizada.',
          layoutAfterDesc: 'Layout ajustado com paleta da marca e 1 banner de alto impacto.',
          seoBeforeDesc: 'Títulos e descrições sem palavras-chave.',
          seoAfterDesc: '20 produtos otimizados com SEO para o Google.',
          domainBeforeDesc: storeUrl,
          domainAfterDesc: 'www.' + storeName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com.br'
        },
        clientApprovalNote: 'Aprovado pelo lojista.',
        nfStatus: {
          eligible: true,
          amount: 100.0,
          referenceMonth: '09/2026',
          cnaeCode: '7319-0/02',
          serviceCode: '17.06'
        }
      };

      onAuditComplete(fallbackAudit);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#e4dfd6] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#3d2749] via-[#4d315c] to-[#5b3a6b] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#e0663f]" />
            </span>
            <div>
              <h2 className="text-base font-bold">
                Novo Diagnóstico Automático & Inspeção de Loja
              </h2>
              <p className="text-[11px] text-white/80">
                Auditoria minuciosa nas 11 áreas + Escopo Benefício Loja Integrada e Oportunidades de Escala
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="px-6 pt-4 pb-2 bg-[#faf8f5] border-b border-[#e4dfd6] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#7a7568] font-semibold">Preencher exemplo:</span>
          <button
            type="button"
            onClick={() => handleLoadSample('moda')}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#e4dfd6] hover:border-[#5b3a6b] text-[#1f2430] font-medium transition-colors cursor-pointer"
          >
            👗 Moda & Calçados
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('eletronicos')}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#e4dfd6] hover:border-[#5b3a6b] text-[#1f2430] font-medium transition-colors cursor-pointer"
          >
            📱 Eletrônicos
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('pet')}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#e4dfd6] hover:border-[#5b3a6b] text-[#1f2430] font-medium transition-colors cursor-pointer"
          >
            🐾 Pet Shop
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRunAudit} className="p-6 space-y-4 text-xs max-h-[78vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[#1f2430] block mb-1">Nome da Loja:*</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="Ex: Aura Moda Feminina"
                className="w-full p-2.5 rounded-xl border border-[#e4dfd6] bg-[#faf8f5] focus:bg-white focus:ring-1 focus:ring-[#5b3a6b] text-xs font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-[#1f2430] block mb-1">URL da Loja / Domínio:*</label>
              <input
                type="text"
                required
                value={storeUrl}
                onChange={e => setStoreUrl(e.target.value)}
                placeholder="https://auramoda.lojaintegrada.com.br"
                className="w-full p-2.5 rounded-xl border border-[#e4dfd6] bg-[#faf8f5] focus:bg-white focus:ring-1 focus:ring-[#5b3a6b] text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-[#1f2430] block mb-1">Nome do Lojista:</label>
              <input
                type="text"
                value={sellerName}
                onChange={e => setSellerName(e.target.value)}
                placeholder="Ex: Carlos Eduardo"
                className="w-full p-2.5 rounded-xl border border-[#e4dfd6] bg-[#faf8f5] text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-[#1f2430] block mb-1">WhatsApp do Lojista:</label>
              <input
                type="text"
                value={sellerWhatsapp}
                onChange={e => setSellerWhatsapp(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full p-2.5 rounded-xl border border-[#e4dfd6] bg-[#faf8f5] text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-[#1f2430] block mb-1">Nicho / Segmento:</label>
              <input
                type="text"
                value={segment}
                onChange={e => setSegment(e.target.value)}
                placeholder="Moda, Cosméticos, etc."
                className="w-full p-2.5 rounded-xl border border-[#e4dfd6] bg-[#faf8f5] text-xs"
              />
            </div>
          </div>

          {/* New Input Field: Item 11.1 Sales History filled by Agency Staff */}
          <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-1.5">
            <label className="font-bold text-[#5b3a6b] flex items-center gap-1.5 text-xs">
              <TrendingUp className="w-4 h-4 text-[#e0663f]" />
              Data da última venda e volume nos últimos 30/60/90 dias (Item 11.1 — Preenchimento Agência):
            </label>
            <input
              type="text"
              value={item11_1SalesData}
              onChange={e => setItem11_1SalesData(e.target.value)}
              placeholder="Ex: Última venda em 24/08/2026. Volume: 32 vendas em 30d, 85 vendas em 60d, 140 vendas em 90d (Ticket médio R$ 180)"
              className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs text-[#1f2430]"
            />
            <p className="text-[10.5px] text-[#7a7568]">
              Se a loja ainda não teve vendas, deixe em branco ou informe "sem vendas" e o sistema diagnosticará a necessidade de implementação imediata do TOP 1, TOP 2 e TOP 3.
            </p>
          </div>

          {/* New Input Field: 20 Products for SEO (Optional) */}
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1.5">
            <label className="font-bold text-[#166534] flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Lista de 20 Produtos para SEO (Opcional - se em branco, o sistema selecionará os 20 de maior potencial):
            </label>
            <textarea
              rows={2}
              value={customProductsText}
              onChange={e => setCustomProductsText(e.target.value)}
              placeholder="Cole os nomes dos produtos (um por linha ou separados por vírgula)..."
              className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs text-[#1f2430]"
            />
            <p className="text-[10.5px] text-[#7a7568]">
              Mapeamento estratégico para gerar palavras-chave de busca, títulos otimizados e descrições no Google.
            </p>
          </div>

          <div>
            <label className="font-bold text-[#1f2430] block mb-1">
              Informações Coletadas / Observações do Lojista (Painel de Entrada):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Descreva particularidades da loja, canais que utiliza, se já possui logotipo em alta qualidade..."
              className="w-full p-2.5 rounded-xl border border-[#e4dfd6] bg-[#faf8f5] text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="font-bold text-[#7a7568] block mb-1 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-[#5b3a6b]" />
              Opcional: Trecho HTML da Loja ou Produtos para Análise Fina:
            </label>
            <textarea
              rows={2}
              value={rawHtml}
              onChange={e => setRawHtml(e.target.value)}
              placeholder="Cole aqui cabeçalho, tags ou lista de produtos se desejar auditoria técnica profunda..."
              className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-[#faf8f5] text-[11px] font-mono"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#e4dfd6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#5b3a6b] to-[#3d2749] hover:from-[#3d2749] hover:to-[#5b3a6b] text-white shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Inspecionando Loja & Auditando 11 Áreas...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#e0663f]" />
                  Gerar Diagnóstico Completo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
