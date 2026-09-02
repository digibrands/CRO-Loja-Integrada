import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StoreAuditData } from '../types';
import { getItemDeadline, getRiskAndBenefit, generateDefaultSeoProducts } from './auditHelpers';

/**
 * Downloads a vector-based, high-fidelity PDF report for the store audit.
 * Uses jsPDF + autotable with exact status colors, risk/benefit impact, deadlines, and 20 SEO products.
 */
export async function downloadDirectPdf(store: StoreAuditData): Promise<boolean> {
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

    // --- COLOR PALETTE ---
    const primaryPlum = [61, 39, 73]; // #3d2749
    const secondaryPlum = [91, 58, 107]; // #5b3a6b
    const accentOrange = [224, 102, 63]; // #e0663f
    const accentGreen = [46, 125, 50]; // #2e7d32
    const bgGreen = [240, 253, 244]; // #f0fdf4
    const darkText = [31, 36, 48]; // #1f2430
    const grayText = [122, 117, 104]; // #7a7568
    const lightBg = [250, 248, 245]; // #faf8f5
    const borderColor = [228, 223, 214]; // #e4dfd6

    // Header Top Decorative Strip
    doc.setFillColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.rect(0, 0, pageWidth, 7, 'F');
    doc.setFillColor(accentOrange[0], accentOrange[1], accentOrange[2]);
    doc.rect(0, 7, pageWidth, 1.5, 'F');

    currentY = 14;

    // Brand Eyebrow
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(accentOrange[0], accentOrange[1], accentOrange[2]);
    doc.text('LOJA INTEGRADA · ECOSSISTEMA OFICIAL DE PARCERIAS', margin, currentY);
    currentY += 5.5;

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('Checklist Padrão de Diagnóstico & Plano de Ação', margin, currentY);
    currentY += 5;

    // Agency Signature
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(secondaryPlum[0], secondaryPlum[1], secondaryPlum[2]);
    doc.text('AGÊNCIA PARCEIRA DIGIBRANDS - (51) 2165-6224 | www.digibrands.com.br', margin, currentY);
    currentY += 6;

    // Store Metadata Card
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'FD');

    // Column 1
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('Loja:', margin + 4, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(store.storeName || 'Loja Online', margin + 14, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('Segmento:', margin + 4, currentY + 13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(store.segment || 'Varejo Online', margin + 22, currentY + 13);

    // Column 2
    const col2X = margin + (contentWidth / 2) - 15;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('URL:', col2X, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryPlum[0], secondaryPlum[1], secondaryPlum[2]);
    doc.text(store.storeUrl || 'https://lojaintegrada.com.br', col2X + 10, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('Data do Diagnóstico:', col2X, currentY + 13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(new Date().toLocaleDateString('pt-BR'), col2X + 32, currentY + 13);

    // Column 3 - Score Badge
    const scoreBadgeX = margin + contentWidth - 36;
    doc.setFillColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.roundedRect(scoreBadgeX, currentY + 2.5, 32, 15, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('PONTUAÇÃO GERAL', scoreBadgeX + 16, currentY + 6.8, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${store.overallScore || 0}/100`, scoreBadgeX + 16, currentY + 13.5, { align: 'center' });

    currentY += 24;

    // --- 1. RESUMO EXECUTIVO ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('1. Resumo Executivo do Diagnóstico', margin, currentY);
    currentY += 4;

    let sanitizedSummary = store.executiveSummary || 'Diagnóstico técnico e comercial concluído com sucesso.';
    sanitizedSummary = sanitizedSummary
      .replace(/banho de loja/gi, 'Escopo do Benefício Loja Integrada')
      .replace(/Top 1 gratuito/gi, 'Top 1 - (ESCOPO BENEFICIO LOJA INTEGRADA)')
      .replace(/oportunidades de upsell no Top 2 e 3/gi, 'Top 2 e 3 (execução opcional seller mediante orçamento)')
      .replace(/Top 2 e 3 upsell/gi, 'Top 2 e 3 (execução opcional seller mediante orçamento)')
      .replace(/upsell no Top 2 e 3/gi, 'Top 2 e 3 (execução opcional seller mediante orçamento)');

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    const summaryLines = doc.splitTextToSize(sanitizedSummary, contentWidth - 8);
    const summaryHeight = Math.max(16, (summaryLines.length * 3.7) + 6);
    doc.roundedRect(margin, currentY, contentWidth, summaryHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(summaryLines, margin + 4, currentY + 4.8);

    currentY += summaryHeight + 5;

    // --- 2. PLANO DE AÇÃO: TOP 1 — ESSENCIAL (BENEFICIO LOJA INTEGRADA) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.text('2. Plano de Ação: Top 1 — Essencial (BENEFICIO LOJA INTEGRADA)', margin, currentY);
    currentY += 4;

    const top1BoxHeight = 32;
    doc.setFillColor(bgGreen[0], bgGreen[1], bgGreen[2]);
    doc.setDrawColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, top1BoxHeight, 2, 2, 'FD');
    doc.setLineWidth(0.1);

    // Badge
    doc.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.roundedRect(margin + 4, currentY + 3.5, 62, 4.5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('ESCOPO BENEFICIO LOJA INTEGRADA', margin + 6, currentY + 6.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.text('Escopo Oficial Garantido (Prazo: Imediato):', margin + 4, currentY + 12.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('• Adequação do layout padrão da Loja Integrada + 1 Banner Promocional profissional com CTA;', margin + 6, currentY + 17);
    doc.text('• SEO Estratégico dos 20 produtos principais com títulos otimizados e descrições ricas para o Google;', margin + 6, currentY + 21.2);
    doc.text('• Configuração e apontamento de Domínio Próprio (.com.br) com Certificado de Segurança SSL ativo.', margin + 6, currentY + 25.4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.text('Execução 100% realizada pela Agência Parceira DigiBrands sem custos ao lojista.', margin + 6, currentY + 29.5);

    currentY += top1BoxHeight + 5;

    // --- 3. TOP 2 & TOP 3 SEM VALORES MONETÁRIOS ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('3. Oportunidades de Expansão Comercial: Top 2 e Top 3 (execução opcional seller mediante orçamento)', margin, currentY);
    currentY += 4;

    const upsellCardWidth = (contentWidth - 4) / 2;
    const upsellCardHeight = 44;

    // Top 2 Card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.roundedRect(margin, currentY, upsellCardWidth, upsellCardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(secondaryPlum[0], secondaryPlum[1], secondaryPlum[2]);
    doc.text(doc.splitTextToSize(store.top2?.title || 'Top 2 — Automação de Carrinho Abandonado no WhatsApp', upsellCardWidth - 8), margin + 4, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('Diagnóstico Detalhado:', margin + 4, currentY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    const top2Hook = doc.splitTextToSize(store.top2?.hookDiagnostico || 'Gargalo identificado no fluxo de finalização e recuperação de checkout.', upsellCardWidth - 8);
    doc.text(top2Hook.slice(0, 3), margin + 4, currentY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.text('Impacto nos Resultados:', margin + 4, currentY + 33);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    const top2Impact = doc.splitTextToSize(store.top2?.expectedImpact || 'Elevação de até +25% de recuperação sobre os pedidos abandonados.', upsellCardWidth - 8);
    doc.text(top2Impact.slice(0, 2), margin + 4, currentY + 37);

    // Top 3 Card
    const top3X = margin + upsellCardWidth + 4;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.roundedRect(top3X, currentY, upsellCardWidth, upsellCardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(secondaryPlum[0], secondaryPlum[1], secondaryPlum[2]);
    doc.text(doc.splitTextToSize(store.top3?.title || 'Top 3 — Tráfego Pago GA4 & Meta Ads', upsellCardWidth - 8), top3X + 4, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('Diagnóstico Detalhado:', top3X + 4, currentY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    const top3Hook = doc.splitTextToSize(store.top3?.hookDiagnostico || 'Necessidade de fluxo contínuo e previsível de visitantes qualificados.', upsellCardWidth - 8);
    doc.text(top3Hook.slice(0, 3), top3X + 4, currentY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.text('Impacto nos Resultados:', top3X + 4, currentY + 33);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    const top3Impact = doc.splitTextToSize(store.top3?.expectedImpact || 'Atração previsível de novos compradores qualificados todos os dias.', upsellCardWidth - 8);
    doc.text(top3Impact.slice(0, 2), top3X + 4, currentY + 37);

    // --- PAGE BREAK FOR 11 CHECKLIST AREAS ---
    doc.addPage();
    currentY = margin;

    // Top decorative line on Page 2+
    doc.setFillColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.rect(0, 0, pageWidth, 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('4. Matriz Completa de Auditoria — 11 Áreas Vitais do E-commerce', margin, currentY + 2);
    currentY += 6;

    // Prepare table rows from store.areas
    const tableRows: any[] = [];
    (store.areas || []).forEach((area) => {
      // Area Header Row
      tableRows.push([
        {
          content: `${area.num} · ${area.title}`,
          colSpan: 4,
          styles: {
            fillColor: [61, 39, 73],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7.8,
          },
        },
      ]);

      // Items in this area
      (area.items || []).forEach((item) => {
        let statusBadge = 'CONFORME';

        if (item.status === 'critico') {
          statusBadge = 'CRÍTICO';
        } else if (item.status === 'ajustar') {
          statusBadge = 'AJUSTAR';
        } else if (item.status === 'nao_aplicavel') {
          statusBadge = 'N/A';
        }

        const isBenefitItem = item.isBanhoDeLojaCandidate;
        const banhoTag = isBenefitItem ? '\n[Item contemplado no escopo do benefício Loja Integrada]' : '';

        // Handle item 11.1 special logic
        let findingsText = (item.diagnosticFindings || 'Item avaliado.').replace(/banho de loja/gi, 'Escopo do Benefício Loja Integrada');
        let actionText = (item.recommendedAction || 'Manter conformidade.').replace(/banho de loja/gi, 'Escopo do Benefício Loja Integrada');
        
        if (item.id === 'item-11-1' || item.id === '11.1' || (area.id === 11 && item.title.includes('Data da última venda'))) {
          const salesVal = (store.item11_1SalesData || '').trim().toLowerCase();
          const hasNoSales = !salesVal || salesVal.includes('não teve vendas') || salesVal.includes('sem vendas') || salesVal.includes('nenhuma venda') || salesVal.includes('0 vendas') || salesVal.includes('ainda não');
          if (hasNoSales) {
            findingsText = 'A loja ainda não registrou vendas na plataforma. Diagnóstico prioritário: estruturação imediata do TOP 1, TOP 2 e TOP 3 para destravar as primeiras vendas.';
            actionText = 'Implementar o TOP 1 (Escopo do Benefício Loja Integrada) imediatamente e ativar o TOP 2 e TOP 3.';
          } else if (store.item11_1SalesData && !findingsText.includes(store.item11_1SalesData)) {
            findingsText = `${store.item11_1SalesData} (Dados informados pela agência). ${findingsText}`;
          }
        }

        // Deadline
        const deadline = getItemDeadline(item);

        // Risk & Benefit for 'ajustar' or 'critico'
        const riskBenefit = getRiskAndBenefit(item);
        let detailedContent = `Diagnóstico: ${findingsText}\nRecomendação: ${actionText}`;

        if (item.status === 'ajustar' || item.status === 'critico') {
          detailedContent += `\nImpacto se não for ajustado: ${riskBenefit.risk}`;
          detailedContent += `\nBenefício em caso de correção: ${riskBenefit.benefit}`;
        }

        detailedContent += `\nPrazo para correção: ${deadline}`;

        // Row background: light green for benefit items
        const rowBg: [number, number, number] | undefined = isBenefitItem ? [240, 253, 244] : undefined;

        tableRows.push([
          { content: item.id || '', styles: rowBg ? { fillColor: rowBg } : {} },
          { content: `${item.title}${banhoTag}`, styles: rowBg ? { fillColor: rowBg } : {} },
          { content: statusBadge, styles: {} }, // Color handled in didParseCell
          { content: detailedContent, styles: rowBg ? { fillColor: rowBg } : {} },
        ]);
      });
    });

    autoTable(doc, {
      startY: currentY,
      head: [['ID', 'Critério Avaliado', 'Status', 'Diagnóstico, Recomendação, Impactos & Prazos']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [91, 58, 107],
        textColor: [255, 255, 255],
        fontSize: 7.2,
        fontStyle: 'bold',
      },
      styles: {
        font: 'helvetica',
        fontSize: 6.5,
        cellPadding: 2.2,
        textColor: [31, 36, 48],
        lineColor: [228, 223, 214],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 11, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 46, fontStyle: 'bold' },
        2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        // Enforce exact background colors and white text on the Status column (column index 2)
        if (data.section === 'body' && data.column.index === 2) {
          const val = String(data.cell.raw || '').trim().toUpperCase();
          if (val === 'CRÍTICO' || val === 'CRITICO') {
            data.cell.styles.fillColor = [220, 38, 38]; // Red
            data.cell.styles.textColor = [255, 255, 255]; // White
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'center';
          } else if (val === 'AJUSTAR') {
            data.cell.styles.fillColor = [234, 88, 12]; // Orange
            data.cell.styles.textColor = [255, 255, 255]; // White
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'center';
          } else if (val === 'CONFORME') {
            data.cell.styles.fillColor = [22, 163, 74]; // Green
            data.cell.styles.textColor = [255, 255, 255]; // White
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'center';
          } else if (val === 'N/A') {
            data.cell.styles.fillColor = [107, 114, 128]; // Gray
            data.cell.styles.textColor = [255, 255, 255]; // White
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'center';
          }
        }
      },
      margin: { left: margin, right: margin, bottom: 16 },
    });

    // --- 5. TABELA DE 20 PRODUTOS COM APONTAMENTOS DE SEO (NOVA PÁGINA) ---
    doc.addPage();
    let seoPageY = margin;

    // Header strip on SEO page
    doc.setFillColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.rect(0, 0, pageWidth, 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(primaryPlum[0], primaryPlum[1], primaryPlum[2]);
    doc.text('5. Plano de Otimização de SEO para os 20 Produtos Estratégicos (Google Search)', margin, seoPageY + 2);
    seoPageY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(
      'Mapeamento dos 20 produtos com maior potencial de venda e intenção de busca no Google. Inclui títulos otimizados, meta tags e apontamentos de SEO.',
      margin,
      seoPageY + 2
    );
    seoPageY += 6;

    // Retrieve or generate 20 SEO products
    const seoProducts = (store.seoProducts && store.seoProducts.length >= 5)
      ? store.seoProducts
      : generateDefaultSeoProducts(store.storeName, store.segment, store.top1?.seoProductsList, store.storeUrl);

    const baseUrl = store.storeUrl 
      ? (store.storeUrl.startsWith('http') ? store.storeUrl.replace(/\/$/, '') : `https://${store.storeUrl.replace(/\/$/, '')}`)
      : `https://${(store.storeName || 'loja').toLowerCase().replace(/[^a-z0-9]/g, '')}.lojaintegrada.com.br`;

    const seoTableRows: any[] = seoProducts.slice(0, 20).map((prod, idx) => {
      const isAltRow = idx % 2 === 1;
      const rowBg: [number, number, number] | undefined = isAltRow ? [250, 248, 245] : undefined;

      const demandBadge = prod.searchVolumeDemand || (idx < 5 ? 'Muito Alta' : idx < 12 ? 'Alta' : 'Média');
      const itemSlug = prod.productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const exactUrl = prod.productUrl || `${baseUrl}/${itemSlug}`;
      const prodCol = `${prod.productName}\n[Categoria: ${prod.category || 'Catálogo'}]\nURL: ${exactUrl}`;
      const detailsCol = `Palavra-Chave: ${prod.focusKeyword}\nTítulo Otimizado: ${prod.optimizedTitle}\nMeta Description: ${prod.metaDescription}\nAjustes Recomendados: ${prod.seoAdjustments}`;

      return [
        { content: String(idx + 1).padStart(2, '0'), styles: { halign: 'center', fontStyle: 'bold', ...(rowBg ? { fillColor: rowBg } : {}) } },
        { content: prodCol, styles: { fontStyle: 'bold', ...(rowBg ? { fillColor: rowBg } : {}) } },
        { content: demandBadge, styles: { halign: 'center', fontStyle: 'bold', ...(rowBg ? { fillColor: rowBg } : {}) } },
        { content: detailsCol, styles: rowBg ? { fillColor: rowBg } : {} },
      ];
    });

    autoTable(doc, {
      startY: seoPageY,
      head: [['#', 'Produto & Categoria', 'Demanda Google', 'Diretrizes de SEO (Título H1, Meta Tag, Descrição Rica)']],
      body: seoTableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [61, 39, 73],
        textColor: [255, 255, 255],
        fontSize: 7.2,
        fontStyle: 'bold',
      },
      styles: {
        font: 'helvetica',
        fontSize: 6.3,
        cellPadding: 2,
        textColor: [31, 36, 48],
        lineColor: [228, 223, 214],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 50, fontStyle: 'normal' },
        2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const val = String(data.cell.raw || '').trim();
          if (val === 'Muito Alta') {
            data.cell.styles.textColor = [185, 28, 28]; // Dark red
          } else if (val === 'Alta') {
            data.cell.styles.textColor = [194, 65, 12]; // Dark orange
          } else {
            data.cell.styles.textColor = [21, 128, 61]; // Dark green
          }
        }
      },
      margin: { left: margin, right: margin, bottom: 16 },
    });

    // --- FOOTERS & PAGE NUMBERS ON ALL PAGES ---
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);

      // Footer line
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

      doc.text(
        `AGÊNCIA PARCEIRA DIGIBRANDS · (51) 2165-6224 | www.digibrands.com.br · Diagnóstico emitido para ${store.storeName}`,
        margin,
        pageHeight - 4.5
      );
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 4.5, { align: 'right' });
    }

    // Trigger Reliable Download via Blob Object URL
    const safeName = (store.storeName || 'loja').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fileName = `diagnostico_${safeName}.pdf`;

    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);

    return true;
  } catch (err) {
    console.error('Failed to generate direct PDF:', err);
    return false;
  }
}

/**
 * Generates and downloads a self-contained HTML file of the diagnostic report.
 */
export function downloadHtmlReport(store: StoreAuditData): void {
  const safeName = (store.storeName || 'loja').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fileName = `diagnostico_${safeName}.html`;

  let sanitizedSummary = store.executiveSummary || 'Diagnóstico técnico e comercial concluído com sucesso.';
  sanitizedSummary = sanitizedSummary
    .replace(/banho de loja/gi, 'Escopo do Benefício Loja Integrada')
    .replace(/Top 1 gratuito/gi, 'Top 1 - (ESCOPO BENEFICIO LOJA INTEGRADA)')
    .replace(/oportunidades de upsell no Top 2 e 3/gi, 'Top 2 e 3 (execução opcional seller mediante orçamento)')
    .replace(/Top 2 e 3 upsell/gi, 'Top 2 e 3 (execução opcional seller mediante orçamento)');

  const baseUrl = store.storeUrl 
    ? (store.storeUrl.startsWith('http') ? store.storeUrl.replace(/\/$/, '') : `https://${store.storeUrl.replace(/\/$/, '')}`)
    : `https://${(store.storeName || 'loja').toLowerCase().replace(/[^a-z0-9]/g, '')}.lojaintegrada.com.br`;

  const seoProducts = (store.seoProducts && store.seoProducts.length >= 5)
    ? store.seoProducts
    : generateDefaultSeoProducts(store.storeName, store.segment, store.top1?.seoProductsList, store.storeUrl);

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Diagnóstico - ${store.storeName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #faf8f5; color: #1f2430; margin: 0; padding: 24px; line-height: 1.5; }
    .container { max-width: 960px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e4dfd6; }
    h1 { color: #3d2749; margin-top: 0; font-size: 22px; }
    .header-bar { border-bottom: 3px solid #3d2749; padding-bottom: 16px; margin-bottom: 24px; }
    .meta-box { background: #faf8f5; border: 1px solid #e4dfd6; border-radius: 8px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; font-size: 13px; }
    .top1-box { background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .top-upsell-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
    .upsell-box { background: #ffffff; border: 1px solid #e4dfd6; border-radius: 8px; padding: 16px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #ffffff !important; }
    .badge-conforme { background: #16a34a !important; color: #ffffff !important; }
    .badge-critico { background: #dc2626 !important; color: #ffffff !important; }
    .badge-ajustar { background: #ea580c !important; color: #ffffff !important; }
    .badge-na { background: #6b7280 !important; color: #ffffff !important; }
    .area-header { background: #3d2749; color: white; padding: 10px 16px; border-radius: 6px; font-weight: bold; margin-top: 24px; font-size: 14px; }
    .item-row { border-bottom: 1px solid #e4dfd6; padding: 14px 10px; font-size: 13px; }
    .item-row-benefit { background: #f0fdf4; border-left: 4px solid #16a34a; }
    .impact-box { margin-top: 6px; font-size: 12px; background: #fffbeb; border: 1px solid #fde68a; padding: 6px 10px; border-radius: 4px; }
    .deadline-tag { display: inline-block; margin-top: 4px; font-size: 11px; font-weight: bold; color: #3d2749; }
    .seo-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    .seo-table th, .seo-table td { border: 1px solid #e4dfd6; padding: 8px 10px; text-align: left; }
    .seo-table th { background: #3d2749; color: white; font-weight: bold; }
    .seo-table tr:nth-child(even) { background: #faf8f5; }
    @media print { body { background: white; padding: 0; } .container { border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <div style="color: #e0663f; font-weight: bold; font-size: 12px; text-transform: uppercase;">Loja Integrada · Ecossistema Oficial de Parcerias</div>
      <h1>Checklist Padrão de Diagnóstico & Plano de Ação</h1>
      <div style="font-weight: bold; color: #5b3a6b;">AGÊNCIA PARCEIRA DIGIBRANDS - (51) 2165-6224 | www.digibrands.com.br</div>
    </div>

    <div class="meta-box">
      <div><b>Loja:</b> ${store.storeName}</div>
      <div><b>Segmento:</b> ${store.segment}</div>
      <div><b>PONTUAÇÃO GERAL:</b> <b style="color: #166534; font-size: 15px;">${store.overallScore}/100</b></div>
      <div><b>URL:</b> ${store.storeUrl}</div>
      <div><b>Data do Diagnóstico:</b> ${new Date().toLocaleDateString('pt-BR')}</div>
      <div><b>Consultoria Técnica:</b> DigiBrands</div>
    </div>

    <h3>1. Resumo Executivo do Diagnóstico</h3>
    <p>${sanitizedSummary}</p>

    <div class="top1-box">
      <div style="display: inline-block; background: #166534; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-bottom: 8px;">
        ESCOPO BENEFICIO LOJA INTEGRADA
      </div>
      <h3 style="color: #166534; margin-top: 0;">Top 1 — Essencial (BENEFICIO LOJA INTEGRADA)</h3>
      <p><b>Escopo Oficial Garantido (Prazo: Imediato):</b></p>
      <ul>
        <li>Adequação do layout padrão da Loja Integrada + 1 Banner Promocional profissional com CTA;</li>
        <li>SEO Estratégico dos 20 produtos principais com títulos otimizados e descrições ricas;</li>
        <li>Configuração e apontamento de Domínio Próprio (.com.br) com Certificado de Segurança SSL.</li>
      </ul>
      <p style="font-size: 12px; font-weight: bold; color: #166534;">Executado 100% pela Agência Parceira DigiBrands sem custos ao lojista.</p>
    </div>

    <h3>2. Oportunidades de Expansão Comercial: Top 2 e Top 3 (execução opcional seller mediante orçamento)</h3>
    <div class="top-upsell-grid">
      <div class="upsell-box">
        <h4 style="color: #5b3a6b; margin-top: 0;">${store.top2?.title || 'Top 2'}</h4>
        <p style="font-size: 12px;"><b>Diagnóstico Detalhado:</b> ${store.top2?.hookDiagnostico}</p>
        <p style="font-size: 12px; color: #166534;"><b>Impacto Esperado:</b> ${store.top2?.expectedImpact}</p>
      </div>
      <div class="upsell-box">
        <h4 style="color: #5b3a6b; margin-top: 0;">${store.top3?.title || 'Top 3'}</h4>
        <p style="font-size: 12px;"><b>Diagnóstico Detalhado:</b> ${store.top3?.hookDiagnostico}</p>
        <p style="font-size: 12px; color: #166534;"><b>Impacto Esperado:</b> ${store.top3?.expectedImpact}</p>
      </div>
    </div>

    <h3>3. Matriz Completa das 11 Áreas do Checklist (Inspeção Real)</h3>
    ${(store.areas || [])
      .map(
        (area) => `
      <div class="area-header">${area.num} · ${area.title}</div>
      ${(area.items || [])
        .map((item) => {
          const deadline = getItemDeadline(item);
          const riskBenefit = getRiskAndBenefit(item);
          const isBenefit = item.isBanhoDeLojaCandidate;

          return `
        <div class="item-row ${isBenefit ? 'item-row-benefit' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <b>${item.id} - ${item.title}</b>
            <span class="badge ${
              item.status === 'conforme'
                ? 'badge-conforme'
                : item.status === 'critico'
                ? 'badge-critico'
                : item.status === 'ajustar'
                ? 'badge-ajustar'
                : 'badge-na'
            }">${item.status.toUpperCase()}</span>
          </div>
          ${isBenefit ? '<div style="color: #166534; font-size: 11px; font-weight: bold; margin-top: 2px;">[Item contemplado pelo escopo do benefício Loja Integrada]</div>' : ''}
          <div style="font-size: 12px; color: #4b5563; margin-top: 6px;">
            <div><b>Diagnóstico:</b> ${item.diagnosticFindings}</div>
            <div><b>Recomendação:</b> ${item.recommendedAction}</div>
          </div>
          ${
            item.status === 'ajustar' || item.status === 'critico'
              ? `
            <div class="impact-box">
              <div><b style="color: #b91c1c;">Impacto se não for ajustado:</b> ${riskBenefit.risk}</div>
              <div><b style="color: #15803d;">Benefício em caso de correção:</b> ${riskBenefit.benefit}</div>
            </div>
          `
              : ''
          }
          <div class="deadline-tag">⏱️ <b>Prazo para correção:</b> ${deadline}</div>
        </div>
      `;
        })
        .join('')}
    `
      )
      .join('')}

    <h3>4. Plano de Otimização de SEO para os 20 Produtos Estratégicos (Google Search)</h3>
    <p style="font-size: 13px; color: #4b5563;">Mapeamento dos 20 produtos com maior potencial de venda e intenção de busca no Google para o nicho da loja:</p>
    <table class="seo-table">
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Produto & Categoria</th>
          <th style="width: 110px;">Demanda Google</th>
          <th>Diretrizes de SEO (Título H1, Meta Tag, Descrição Rica)</th>
        </tr>
      </thead>
      <tbody>
        ${seoProducts
          .slice(0, 20)
          .map(
            (prod, idx) => {
              const itemSlug = prod.productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              const exactUrl = prod.productUrl || `${baseUrl}/${itemSlug}`;
              return `
          <tr>
            <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
            <td>
              <b>${prod.productName}</b><br/>
              <span style="color: #6b7280; font-size: 11px;">[Categoria: ${prod.category || 'Catálogo Geral'}]</span><br/>
              <span style="color: #5b3a6b; font-size: 11px; font-family: monospace; word-break: break-all;"><b>URL:</b> ${exactUrl}</span>
            </td>
            <td style="text-align: center; font-weight: bold; color: ${prod.searchVolumeDemand === 'Muito Alta' ? '#b91c1c' : prod.searchVolumeDemand === 'Alta' ? '#c2410c' : '#15803d'};">${prod.searchVolumeDemand || 'Alta'}</td>
            <td style="font-size: 11px; line-height: 1.5;">
              <div><b style="color: #5b3a6b;">Palavra-Chave:</b> ${prod.focusKeyword}</div>
              <div><b>Título Otimizado:</b> ${prod.optimizedTitle}</div>
              <div><b>Meta Description:</b> ${prod.metaDescription}</div>
              <div><b style="color: #166534;">Ajustes Recomendados:</b> ${prod.seoAdjustments}</div>
            </td>
          </tr>
        `;
            }
          )
          .join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
}
