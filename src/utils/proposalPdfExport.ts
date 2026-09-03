import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StoreAuditData, UpsellServiceItem } from '../types';

/**
 * Generates and downloads a custom commercial proposal PDF for TOP 2 and TOP 3 (and any extra services)
 * Palette requested: #c6024e (Magenta), #fde917 (Electric Yellow), #ffffff (White), #000000 (Black/Dark text)
 * Agency info: WhatsApp (51) 2165-6224 | e-mail: atendimento@digibrands.com.br | site: digibrands.com.br
 */
export async function downloadProposalPdf(store: StoreAuditData): Promise<boolean> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let currentY = margin;

    // Palette:
    const colorMagenta = [198, 2, 78];     // #c6024e
    const colorYellow = [253, 233, 23];    // #fde917
    const colorBlack = [18, 18, 18];       // #121212
    const colorDarkGray = [60, 60, 60];    // Secondary text
    const colorLightBg = [250, 250, 250];  // Subtle card background
    const colorBorder = [225, 225, 225];   // Light border

    // Helper: format currency
    const formatBRL = (val?: number) => {
      const num = Number(val) || 0;
      return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Helper: format date
    const today = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Header Top Strips
    doc.setFillColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
    doc.rect(0, 0, pageWidth, 18, 'F');

    doc.setFillColor(colorYellow[0], colorYellow[1], colorYellow[2]);
    doc.rect(0, 18, pageWidth, 2.5, 'F');

    // Header Content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('DIGIBRANDS', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colorYellow[0], colorYellow[1], colorYellow[2]);
    doc.text('AGÊNCIA PARCEIRA OFICIAL LOJA INTEGRADA', margin + 36, 12);

    // Right header tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('PROPOSTA COMERCIAL & ORÇAMENTO', pageWidth - margin, 12, { align: 'right' });

    currentY = 27;

    // Document Main Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
    doc.text('Plano de Aceleração & Escala de Vendas', margin, currentY);
    currentY += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colorDarkGray[0], colorDarkGray[1], colorDarkGray[2]);
    doc.text('Serviços Estratégicos Recomendados (TOP 2, TOP 3 e Adicionais de Conversão)', margin, currentY);
    currentY += 7;

    // --- CLIENT & AGENCY SUMMARY CARD ---
    const cardHeight = 36;
    doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.roundedRect(margin, currentY, contentWidth, cardHeight, 2, 2, 'FD');

    // Left accent bar on card
    doc.setFillColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
    doc.rect(margin, currentY, 2.5, cardHeight, 'F');

    // Left Column: Client Data
    const col1X = margin + 6;
    const col2X = margin + (contentWidth / 2) + 2;
    let cardY = currentY + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
    doc.text('DADOS DA LOJA CLIENTE', col1X, cardY);
    doc.text('DADOS DA AGÊNCIA PROPONENTE', col2X, cardY);
    cardY += 5;

    doc.setFontSize(8.5);
    doc.setTextColor(colorBlack[0], colorBlack[1], colorBlack[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`Loja: ${store.storeName || 'Loja Cliente'}`, col1X, cardY);
    doc.text('Agência DigiBrands Soluções Digitais', col2X, cardY);
    cardY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Responsável: ${store.sellerName || 'Lojista Responsável'}`, col1X, cardY);
    doc.text('WhatsApp: (51) 2165-6224', col2X, cardY);
    cardY += 4.5;

    doc.text(`Segmento: ${store.segment || 'Geral'} | Tel: ${store.sellerWhatsapp || 'Não informado'}`, col1X, cardY);
    doc.text('E-mail: atendimento@digibrands.com.br', col2X, cardY);
    cardY += 4.5;

    const urlDisplay = (store.storeUrl || '').replace(/^https?:\/\//, '');
    doc.text(`URL: ${urlDisplay || 'loja.com.br'}`, col1X, cardY);
    doc.text('Site: digibrands.com.br | Validade: 10 dias', col2X, cardY);

    currentY += cardHeight + 6;

    // --- DIGIBRANDS PRESENTATION BLOCK ---
    doc.setFillColor(colorBlack[0], colorBlack[1], colorBlack[2]);
    doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'F');

    // Yellow decorative stripe
    doc.setFillColor(colorYellow[0], colorYellow[1], colorYellow[2]);
    doc.rect(margin + 2, currentY + 2, 1.5, 19, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colorYellow[0], colorYellow[1], colorYellow[2]);
    doc.text('QUEM É A DIGIBRANDS?', margin + 7, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    const introText = 
      'A DigiBrands é agência parceira oficial e certificada pela Loja Integrada, com histórico consolidado em reestruturação técnica, CRO (otimização de conversão), tráfego de alta performance e automações. Desenvolvemos estratégias completas para transformar visitantes em compradores recorrentes e acelerar o faturamento com máxima rentabilidade.';
    const introLines = doc.splitTextToSize(introText, contentWidth - 14);
    doc.text(introLines, margin + 7, currentY + 11.5);

    currentY += 28;

    // Section Header: Serviços Propostos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
    doc.text('DETALHAMENTO DOS SERVIÇOS & ESCOPOS DE ENTREGA', margin, currentY);
    currentY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colorDarkGray[0], colorDarkGray[1], colorDarkGray[2]);
    doc.text('Propostas desenhadas especificamente a partir dos gargalos detectados no diagnóstico técnico da sua loja:', margin, currentY);
    currentY += 5;

    // Collect all proposal services: TOP 2, TOP 3 + custom services
    interface ProposalItemView {
      tag: string;
      title: string;
      hook: string;
      solution: string;
      impact: string;
      days: number;
      price: number;
    }

    const proposalServices: ProposalItemView[] = [];

    // TOP 2
    if (store.top2) {
      proposalServices.push({
        tag: 'PRIORIDADE #01 — TOP 2',
        title: store.top2.title || 'Recuperação de Carrinho e Vendas no WhatsApp',
        hook: store.top2.hookDiagnostico || 'Gargalo de abandono de carrinho identificado no diagnóstico da loja.',
        solution: store.top2.proposedSolution || 'Automação completa de checkout e disparo de mensagens no WhatsApp.',
        impact: store.top2.expectedImpact || 'Recuperação média de 15% a 25% dos carrinhos perdidos.',
        days: Number(store.top2.estimatedDays) || 4,
        price: Number(store.top2.estimatedPrice) || 350
      });
    }

    // TOP 3
    if (store.top3) {
      proposalServices.push({
        tag: 'PRIORIDADE #02 — TOP 3',
        title: store.top3.title || 'Campanhas de Aquisição e Tráfego Pago Qualificado',
        hook: store.top3.hookDiagnostico || 'Baixo volume de tráfego qualificado para tracionar compras diárias.',
        solution: store.top3.proposedSolution || 'Configuração de Google Ads / Meta Ads e mensuração no GA4.',
        impact: store.top3.expectedImpact || 'Aumento substancial de visitantes prontos para comprar.',
        days: Number(store.top3.estimatedDays) || 7,
        price: Number(store.top3.estimatedPrice) || 600
      });
    }

    // Custom Upsell Services if present
    if (Array.isArray(store.customUpsellServices)) {
      store.customUpsellServices
        .filter(s => s.includedInProposal !== false)
        .forEach((s, idx) => {
          proposalServices.push({
            tag: `SERVIÇO COMPLEMENTAR #${idx + 1}`,
            title: s.title || 'Serviço Adicional de Aceleração',
            hook: s.description || 'Implementação estratégica adicional para escala do negócio.',
            solution: s.deliverables && s.deliverables.length > 0 ? s.deliverables.join('; ') : s.description || 'Escopo técnico personalizado.',
            impact: s.expectedImpact || 'Aumento de ticket médio e performance de vendas.',
            days: Number(s.estimatedDays) || 5,
            price: Number(s.estimatedPrice) || 250
          });
        });
    }

    // Render Proposal Services Cards
    proposalServices.forEach((service, index) => {
      // Check for page overflow
      if (currentY > pageHeight - 55) {
        doc.addPage();
        currentY = margin;
      }

      const serviceBoxY = currentY;
      const boxPadding = 4;
      
      // Calculate dynamic height for content
      doc.setFontSize(8);
      const hookLines = doc.splitTextToSize(`Diagnóstico Identificado: ${service.hook}`, contentWidth - 10);
      const solutionLines = doc.splitTextToSize(`Solução Proposta: ${service.solution}`, contentWidth - 10);
      const impactLines = doc.splitTextToSize(`Impacto Estimado: ${service.impact}`, contentWidth - 10);

      const estimatedHeight = 18 + (hookLines.length * 3.5) + (solutionLines.length * 3.5) + (impactLines.length * 3.5) + 8;

      // Draw Container Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
      doc.roundedRect(margin, serviceBoxY, contentWidth, estimatedHeight, 2, 2, 'FD');

      // Top Tag Bar
      doc.setFillColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
      doc.roundedRect(margin, serviceBoxY, contentWidth, 6, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(colorYellow[0], colorYellow[1], colorYellow[2]);
      doc.text(service.tag, margin + 4, serviceBoxY + 4.2);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.text(`Prazo: ${service.days} dias úteis`, pageWidth - margin - 4, serviceBoxY + 4.2, { align: 'right' });

      // Service Title & Price Line
      let innerY = serviceBoxY + 11;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(colorBlack[0], colorBlack[1], colorBlack[2]);
      doc.text(service.title, margin + 4, innerY);

      // Price Tag Pill
      const priceStr = formatBRL(service.price);
      doc.setFontSize(10);
      doc.setTextColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
      doc.text(priceStr, pageWidth - margin - 4, innerY, { align: 'right' });

      innerY += 5;

      // Hook
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(colorDarkGray[0], colorDarkGray[1], colorDarkGray[2]);
      doc.text(hookLines, margin + 4, innerY);
      innerY += hookLines.length * 3.5 + 1;

      // Solution
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colorBlack[0], colorBlack[1], colorBlack[2]);
      doc.text(solutionLines, margin + 4, innerY);
      innerY += solutionLines.length * 3.5 + 1;

      // Impact
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
      doc.text(impactLines, margin + 4, innerY);

      currentY += estimatedHeight + 4;
    });

    // Check if we need a new page for Investment Summary Table
    if (currentY > pageHeight - 75) {
      doc.addPage();
      currentY = margin;
    }

    // --- INVESTMENT SUMMARY TABLE ---
    currentY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
    doc.text('RESUMO DE INVESTIMENTO & CONDIÇÕES COMERCIAIS', margin, currentY);
    currentY += 4;

    const tableRows = proposalServices.map((s, idx) => [
      `#${idx + 1}`,
      s.title,
      `${s.days} dias úteis`,
      formatBRL(s.price)
    ]);

    const totalPrice = proposalServices.reduce((sum, s) => sum + s.price, 0);

    autoTable(doc, {
      startY: currentY,
      head: [['Item', 'Serviço / Escopo Contratado', 'Prazo de Implantação', 'Investimento']],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        textColor: [20, 20, 20],
        lineColor: [230, 230, 230],
        lineWidth: 0.2,
        cellPadding: 2.8
      },
      headStyles: {
        fillColor: [198, 2, 78], // #c6024e
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        currentY = data.cursor?.y || currentY;
      }
    });

    currentY += 4;

    // Total Box & Payment Conditions
    const paymentBoxHeight = 28;
    if (currentY > pageHeight - paymentBoxHeight - 20) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFillColor(colorBlack[0], colorBlack[1], colorBlack[2]);
    doc.roundedRect(margin, currentY, contentWidth, paymentBoxHeight, 2, 2, 'F');

    // Accent line in yellow
    doc.setFillColor(colorYellow[0], colorYellow[1], colorYellow[2]);
    doc.rect(margin + 2, currentY + 2, contentWidth - 4, 1.2, 'F');

    let pY = currentY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colorYellow[0], colorYellow[1], colorYellow[2]);
    doc.text('TOTAL DO INVESTIMENTO PROPOSTO:', margin + 6, pY);

    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(formatBRL(totalPrice), pageWidth - margin - 6, pY, { align: 'right' });
    pY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(220, 220, 220);
    const paymentTerms = store.proposalPaymentTerms || 'Condições Facilitadas: Parcelamento em até 3x sem juros no cartão ou 5% de desconto à vista via PIX. Entrada de 50% no aceite e saldo na validação da entrega.';
    const termLines = doc.splitTextToSize(`Forma de Pagamento: ${paymentTerms}`, contentWidth - 12);
    doc.text(termLines, margin + 6, pY);
    pY += termLines.length * 3.5 + 1;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorYellow[0], colorYellow[1], colorYellow[2]);
    doc.text('Aprovação Rápida: Responda via WhatsApp oficial (51) 2165-6224 para iniciar a execução imediatamente.', margin + 6, pY);

    currentY += paymentBoxHeight + 6;

    // --- FOOTER & CONTACTS ON ALL PAGES ---
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Bottom Bar
      const footerY = pageHeight - 10;
      doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
      doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(colorMagenta[0], colorMagenta[1], colorMagenta[2]);
      doc.text('DIGIBRANDS', margin, footerY + 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(colorDarkGray[0], colorDarkGray[1], colorDarkGray[2]);
      doc.text('WhatsApp: (51) 2165-6224  |  E-mail: atendimento@digibrands.com.br  |  Site: digibrands.com.br', margin + 26, footerY + 2);

      doc.setFont('helvetica', 'bold');
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, footerY + 2, { align: 'right' });
    }

    const safeName = (store.storeName || 'Loja').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Proposta_Orcamento_DigiBrands_${safeName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating proposal PDF:', error);
    throw error;
  }
}
