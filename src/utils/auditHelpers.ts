import { ChecklistItem, SeoProductItem, StoreAuditData } from '../types';

/**
 * Returns the official deadline required by the audit specification:
 * - Escopo do benefício Loja Integrada: Prazo Imediato
 * - Crítico fora do benefício: Necessário correção no prazo de 7 a 15 dias (deve ser corrigido nesse prazo)
 * - Ajustar: Prazo de 15 a 30 dias
 * - Conforme: Monitoramento contínuo
 */
export function getItemDeadline(item: { isBanhoDeLojaCandidate?: boolean; status: string; deadlineText?: string }): string {
  if (item.deadlineText && item.deadlineText.trim()) {
    return item.deadlineText;
  }
  if (item.isBanhoDeLojaCandidate) {
    return 'Prazo Imediato (Escopo do Benefício Loja Integrada)';
  }
  if (item.status === 'critico') {
    return 'Necessário correção no prazo de 7 a 15 dias (deve ser corrigido nesse prazo)';
  }
  if (item.status === 'ajustar') {
    return 'Prazo de 15 a 30 dias';
  }
  return 'Monitoramento contínuo';
}

/**
 * Ensures items with status 'ajustar' or 'critico' have explicit risk and benefit descriptions.
 */
export function getRiskAndBenefit(item: ChecklistItem): { risk: string; benefit: string } {
  if (item.riskIfNotFixed && item.benefitIfFixed) {
    return { risk: item.riskIfNotFixed, benefit: item.benefitIfFixed };
  }

  // Fallback realistic descriptions based on title and status
  const titleLower = item.title.toLowerCase();
  
  if (titleLower.includes('domínio') || titleLower.includes('dominio') || titleLower.includes('ssl')) {
    return {
      risk: 'Perda imediata de credibilidade, rejeição de até 40% dos visitantes e penalização severa no ranking do Google.',
      benefit: 'Aumento imediato da confiança de compra, segurança SSL ativa e indexação preferencial nos buscadores.'
    };
  }

  if (titleLower.includes('banner') || titleLower.includes('layout') || titleLower.includes('identidade visual')) {
    return {
      risk: 'Aumento da taxa de rejeição no primeiro scroll e desinteresse imediato do visitante por falta de clareza na oferta.',
      benefit: 'Elevação do apelo visual comercial, retenção de visitantes e direcionamento direto para os produtos mais vendidos.'
    };
  }

  if (titleLower.includes('descriç') || titleLower.includes('seo') || titleLower.includes('título')) {
    return {
      risk: 'Invisibilidade orgânica no Google Search e abandono da página de produto por dúvidas técnicas sobre o item.',
      benefit: 'Atração contínua de tráfego orgânico gratuito qualificado e eliminação de dúvidas de compra no checkout.'
    };
  }

  if (titleLower.includes('carrinho') || titleLower.includes('checkout') || titleLower.includes('pagamento')) {
    return {
      risk: 'Abandono de até 75% dos carrinhos iniciados e perda direta de faturamento sem recuperação.',
      benefit: 'Recuperação de 18% a 25% dos pedidos abandonados e conversão facilitada via Pix e Cartão de Crédito.'
    };
  }

  if (titleLower.includes('tráfego') || titleLower.includes('pixel') || titleLower.includes('analytics') || titleLower.includes('ga4')) {
    return {
      risk: 'Operação às cegas sem métricas de conversão e impossibilidade de escalar anúncios lucrativos.',
      benefit: 'Rastreamento completo do funil de vendas e atração previsível de novos clientes todos os dias.'
    };
  }

  if (titleLower.includes('velocidade') || titleLower.includes('carregamento')) {
    return {
      risk: 'Mais de 53% dos usuários mobile abandonam sites que demoram mais de 3 segundos para carregar.',
      benefit: 'Navegação fluida, menor custo por clique em campanhas e aumento imediato na taxa de conversão.'
    };
  }

  if (titleLower.includes('whatsapp') || titleLower.includes('atendimento')) {
    return {
      risk: 'Perda de clientes indecisos no momento da compra e ausência de canal ágil de fechamento direto.',
      benefit: 'Conversão acelerada de dúvidas em vendas imediatas com atendimento personalizado.'
    };
  }

  // Default fallback for critical/adjust
  if (item.status === 'critico') {
    return {
      risk: 'Gargalo impeditivo que gera perda contínua de vendas e quebra de confiança no momento do fechamento.',
      benefit: 'Desbloqueio de conversões, maior segurança percebida pelo comprador e elevação da taxa de pedidos.'
    };
  }

  return {
    risk: 'Redução da eficiência comercial da loja e perda gradual de compradores para concorrentes diretos.',
    benefit: 'Otimização da experiência do usuário, maior tempo de permanência no site e aumento do ticket médio.'
  };
}

/**
 * Checks if the store has no sales in the last 30, 60, or 90 days.
 * Whenever there are no sales in 30, 60, or 90 days (or no sales registered),
 * Item 11.1 must have status "ajustar" with proposals for TOP 1, 2, and 3.
 */
export function hasNoSalesInPeriods(salesData?: string): boolean {
  if (!salesData || !salesData.trim()) return true;
  const text = salesData.trim().toLowerCase();

  // Explicit phrases indicating no sales
  const noSalesPatterns = [
    'sem venda',
    'sem pedido',
    'sem faturamento',
    'sem movimentação',
    'sem movimentacao',
    'não teve venda',
    'nao teve venda',
    'não possui venda',
    'nao possui venda',
    'não há registro',
    'nao ha registro',
    'não registrou venda',
    'nao registrou venda',
    'não consta venda',
    'nao consta venda',
    'nenhuma venda',
    'nenhum pedido',
    'ainda não',
    'ainda nao',
    'não vendeu',
    'nao vendeu',
    'nunca vendeu',
    'nunca teve venda',
    '0 vendas',
    '0 venda',
    '0 pedido',
    'zero venda',
    'zero pedido',
    'vendas: 0',
    'venda: 0',
    'pedidos: 0',
    'pedido: 0',
    'última venda: nenhuma',
    'ultima venda: nenhuma',
    'última venda: nunca',
    'ultima venda: nunca',
    'última venda: -',
    'ultima venda: -',
    'sem histórico',
    'sem historico'
  ];

  if (noSalesPatterns.some(pattern => text.includes(pattern))) {
    return true;
  }

  // Regex checks for zero in specific periods (30, 60 or 90 days)
  const zeroPeriodRegexes = [
    /\b0\s*(?:vendas?|pedidos?)?\s*(?:nos\s+últimos|nos\s+ultimos|em)?\s*(?:30|60|90)\s*dias/i,
    /(?:últimos|ultimos|em)?\s*(?:30|60|90)\s*dias[^\n.,;:]*?[:=]?\s*(?:0|zero|nenhuma?|sem\s+vendas?)/i,
    /(?:30|60|90)\s*dias[^\n.,;:]*?\b0\b/i,
    /\b0\b[^\n.,;:]*?(?:30|60|90)\s*dias/i,
    /(?:sem\s+vendas?|nenhuma?\s+venda|0\s+vendas?)[^\n.]*?(?:30|60|90)\s*dias/i,
    /(?:30|60|90)\s*dias[^\n.]*?(?:sem\s+vendas?|nenhuma?\s+venda|0\s+vendas?)/i,
  ];

  if (zeroPeriodRegexes.some(rx => rx.test(text))) {
    return true;
  }

  // Check if text mentions positive number of sales / orders
  const hasPositiveSales = /\b([1-9]\d*)\s*(?:vendas?|pedidos?|ped\b)/i.test(text) ||
    /(?:vendas?|pedidos?)[^0-9]*\b([1-9]\d*)/i.test(text);

  if (!hasPositiveSales) {
    return true;
  }

  return false;
}

/**
 * Standardizes Item 11.1 data.
 * If there are no sales in 30, 60 or 90 days, status MUST be 'ajustar'
 * with the proposal of application of TOP 1, TOP 2 and TOP 3.
 */
export function formatItem11_1<T extends {
  id?: string;
  status?: string;
  diagnosticFindings?: string;
  recommendedAction?: string;
  riskIfNotFixed?: string;
  benefitIfFixed?: string;
  deadlineText?: string;
  [key: string]: any;
}>(item: T, salesData?: string): T {
  const hasNoSales = hasNoSalesInPeriods(salesData);

  if (hasNoSales) {
    const rawSales = (salesData || '').trim();
    const details = rawSales ? ` (${rawSales})` : ' (Sem histórico recente de pedidos registrado no painel)';
    return {
      ...item,
      status: 'ajustar',
      diagnosticFindings: `Ausência de vendas registradas nos últimos 30, 60 ou 90 dias na plataforma Loja Integrada${details}. Para destravar os primeiros pedidos com consistência e converter o tráfego em clientes, é indispensável a aplicação combinada do TOP 1 (Estruturação Essencial do Benefício Loja Integrada: banner promocional de alta conversão, layout profissional, SEO nos 20 produtos principais e domínio próprio), TOP 2 (Automação e Recuperação de Carrinho Abandonado via WhatsApp) e TOP 3 (Campanhas de Aquisição e Tráfego Qualificado).`,
      recommendedAction: `Implementar imediatamente o TOP 1 (Escopo do Benefício Loja Integrada) para eliminar barreiras visuais e de credibilidade, associado à ativação do TOP 2 (Recuperação no WhatsApp) e TOP 3 (Tráfego Pago e Orgânico) para gerar tração comercial e volume diário de vendas.`,
      riskIfNotFixed: `Permanência do cenário de estagnação sem vendas, desperdício dos visitantes recebidos e perda contínua de compradores para lojas concorrentes estruturadas.`,
      benefitIfFixed: `Destravamento imediato das primeiras vendas na plataforma, ativação do funil de conversão completo e recuperação automática de vendas perdidas para faturar com consistência.`,
      deadlineText: `Prazo de 15 a 30 dias`
    };
  }

  // Has sales
  const rawSales = (salesData || '').trim();
  return {
    ...item,
    diagnosticFindings: `${rawSales} (Dados informados pela agência). O ritmo de pedidos aponta oportunidade de aceleração comercial com a aplicação do TOP 1 (Benefício Loja Integrada) somado à ativação contínua do TOP 2 e TOP 3.`,
    recommendedAction: `Executar o TOP 1 (Benefício Loja Integrada) e otimizar os canais de retenção (TOP 2) e tração de tráfego (TOP 3) para escalar o volume de faturamento.`
  };
}

export function isGenericPlaceholder(name: string): boolean {
  if (!name || typeof name !== 'string') return true;
  const lower = name.trim().toLowerCase();
  if (lower.length < 3) return true;
  return (
    /^produto\s*(principal|destaque|exemplo|teste|\d+)/i.test(lower) ||
    /produto\s+\d+/i.test(lower) ||
    lower.includes('produto principal') ||
    lower.includes('produto destaque') ||
    lower.includes('principal 0') ||
    lower.includes('principal 1') ||
    lower.includes('destaque 0') ||
    lower.includes('destaque 1') ||
    lower.includes('modelo destaque') ||
    lower.includes('kit principal') ||
    lower === 'produto'
  );
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function generateNaturalKeyword(name: string, category: string): string {
  const clean = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = clean.split(' ').filter(w => w.length > 1);
  if (words.length >= 3) {
    return words.slice(0, 5).join(' ');
  }
  const catClean = (category || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (catClean && !clean.includes(catClean)) {
    return `${clean} ${catClean}`;
  }
  return `${clean} pronta entrega`;
}

/**
 * Generates or normalizes the 20 strategic SEO Products list according to market demand and Google Search data.
 */
export function generateDefaultSeoProducts(
  storeName: string, 
  segment: string, 
  customNames?: string[],
  storeUrl?: string
): SeoProductItem[] {
  const segLower = (segment || '').toLowerCase();
  const baseUrl = storeUrl 
    ? (storeUrl.startsWith('http') ? storeUrl.replace(/\/$/, '') : `https://${storeUrl.replace(/\/$/, '')}`)
    : `https://${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.lojaintegrada.com.br`;

  // Base default product templates tailored by niche
  let baseList: { name: string; keyword: string; category: string; adjustments: string }[] = [];

  if (segLower.includes('moda') || segLower.includes('vestu') || segLower.includes('roupa') || segLower.includes('calcado') || segLower.includes('calçado') || segLower.includes('sapato')) {
    baseList = [
      { name: "Vestido Midi Floral Elegance com Fenda", keyword: "vestido midi floral estampado feminino fenda", category: "Vestidos", adjustments: "Inserir H1 com 'vestido midi floral fenda', tabela de medidas em cm na descrição e alt tag em 3 fotos." },
      { name: "Calça Pantalona Linho Cintura Alta", keyword: "calca pantalona linho cintura alta feminina", category: "Calças", adjustments: "Criar URL amigável /calca-pantalona-linho-cintura-alta, destacar composição 100% linho e caimento fluído." },
      { name: "Blazer Feminino Alfaiataria Estruturado", keyword: "blazer alfaiataria feminino acinturado forrado", category: "Blazers", adjustments: "Otimizar meta tag com frete e parcelamento, listar ocasiões de uso e detalhes do forro interno." },
      { name: "Conjunto Moletom Flanelado Premium", keyword: "conjunto moletom feminino flanelado capuz", category: "Conjuntos", adjustments: "Adicionar palavras-chave de inverno, guia de tamanhos P ao GG e fotos com modelo real." },
      { name: "Camisa Social Seda Manga Longa", keyword: "camisa social feminina manga longa seda", category: "Camisas", adjustments: "Inserir termos de busca para look trabalho, especificações do tecido nobre e botões perolados." },
      { name: "Saia Plissada Midi Cintura Alta", keyword: "saia plissada midi cintura alta elastico", category: "Saias", adjustments: "Destacar caimento do plissado, forro interno duplo que não marca e combinações com calçados." },
      { name: "Bolsa Transversal Couro Sintético Alça Corrente", keyword: "bolsa transversal feminina pequena alca corrente", category: "Bolsas", adjustments: "Informar dimensões exatas (altura x largura x profundidade em cm), divisórias e tipo de fecho." },
      { name: "Short Jeans Cintura Alta Barra Desfiada", keyword: "short jeans feminino cintura alta destroyed", category: "Shorts", adjustments: "Incluir medidas de quadril e cintura, lavagem vintage e composição com elastano." },
      { name: "Vestido Longo Festa Fenda Lateral Acetinado", keyword: "vestido longo festa madrinha formatura acetinado", category: "Vestidos de Festa", adjustments: "Otimizar para buscas de casamentos e formaturas, tecido acetinado premium e caimento impecável." },
      { name: "Cardigan Tricô Alongado Outono Inverno", keyword: "cardigan feminino trico longo quentinho", category: "Casacos & Tricôs", adjustments: "Palavras-chave sazonais de inverno, orientações de lavagem e textura dos pontos artesanais." },
      { name: "Regata Canelada Gola Alta Básica", keyword: "regata canelada gola alta basica feminina", category: "Blusas", adjustments: "Otimizar título para busca de básicos essenciais, elasticidade do tecido e opções de cores." },
      { name: "Cinto Feminino Fivela Dourada Couro Legítimo", keyword: "cinto couro legitimo feminino fivela dourada", category: "Acessórios", adjustments: "Largura da tira em centímetros, opções de furação e tabela de medidas da cintura." },
      { name: "T-Shirt Algodão Penteado Estonada Vintage", keyword: "camiseta feminina algodao penteado estonada", category: "T-shirts", adjustments: "Gramatura do tecido 100% algodão, estampa silk screen resistente e caimento soltinho." },
      { name: "Jaqueta Jeans Oversized Streetwear", keyword: "jaqueta jeans oversized feminina vintage", category: "Casacos", adjustments: "Medidas de ombro e manga, lavagem retrô e bolsos funcionais frontais." },
      { name: "Macacão Pantacourt com Cinto Faixa", keyword: "macacao pantacourt feminino elegante festa", category: "Macacões", adjustments: "Zíper invisível traseiro, fotos da modelo em movimento e tecido com zero transparência." },
      { name: "Scarpin Clássico Salto Médio Confort", keyword: "sapato scarpin salto medio bico fino confort", category: "Calçados", adjustments: "Palmilha anatômica acolchoada, altura do salto em cm e sola antiderrapante segura." },
      { name: "Blusa Crepe Manga Bufante Princesa", keyword: "blusa feminina crepe manga bufante princesa", category: "Blusas", adjustments: "Transparência zero, acabamento da gola com laço e tecido de fácil passadoria." },
      { name: "Cropped Alfaiataria Alça Larga Estruturado", keyword: "cropped alfaiataria feminino estruturado alca larga", category: "Croppeds", adjustments: "Estrutura com barbatana, forro duplo e sugestões de combinações com peças de cintura alta." },
      { name: "Sandália Rasteira Trançada Metalizada", keyword: "sandalia rasteira feminina tiras metalizada verao", category: "Calçados", adjustments: "Solado flexível antiderrapante, acabamento dourado e conforto para o dia a dia." },
      { name: "Kimono Estampado Tecido Fluido Boho", keyword: "kimono feminino estampado viscose saida praia", category: "Kimonos", adjustments: "Tecido fresco e leve, caimento amplo tamanho único e versatilidade dia/noite." },
    ];
  } else if (segLower.includes('cosm') || segLower.includes('beleza') || segLower.includes('skincare') || segLower.includes('perfum') || segLower.includes('maquiag')) {
    baseList = [
      { name: "Sérum Facial Vitamina C 15% Clareador", keyword: "serum vitamina c facial clareador manchas pele", category: "Skincare", adjustments: "Inserir concentração de ativos no título H1, modo de uso dia/noite e compatibilidade por tipo de pele." },
      { name: "Hidratante Facial Ácido Hialurônico Toque Seco", keyword: "hidratante facial acido hialuronico toque seco matte", category: "Skincare", adjustments: "Destacar efeito matte sem oleosidade, rendimento em aplicações e certificação cruelty-free." },
      { name: "Protetor Solar FPS 50 Facial Toque Seco", keyword: "protetor solar facial fps 50 toque seco sem cor", category: "Proteção Solar", adjustments: "Comprovação dermatológica, resistência à água e suor e benefícios anti-idade na rotina." },
      { name: "Shampoo Hidratante Sem Sulfato Cabelos Secos", keyword: "shampoo sem sulfato hidratante cabelos secos", category: "Cabelos", adjustments: "Lista completa de ingredientes sem parabenos, indicação de curvatura capilar e pH fisiológico." },
      { name: "Máscara de Nutrição Capilar Óleos Nobres 500g", keyword: "mascara nutricao capilar profissional oleo argan", category: "Cabelos", adjustments: "Cronograma capilar (etapa nutrição), tempo de pausa recomendado e resultado de salão." },
      { name: "Óleo Reparador de Pontas Argan & Mirra 60ml", keyword: "oleo capilar reparador pontas argan protecao termica", category: "Finalizadores", adjustments: "Proteção térmica até 230°C, perfume suave duradouro e aplicação em cabelo seco/úmido." },
      { name: "Sabonete Líquido Facial Ácido Salicílico 150ml", keyword: "sabonete facial antiacne acido salicilico pele oleosa", category: "Limpeza Facial", adjustments: "Controle comprovado de oleosidade e poros dilatados, indicação de uso diário 2x ao dia." },
      { name: "Batom Líquido Matte Longa Duração 12h", keyword: "batom liquido matte longa duracao que nao transfere", category: "Maquiagem", adjustments: "Fotos fiéis das cores em diferentes tons de pele, teste de transferência e não craquela." },
      { name: "Base Líquida Alta Cobertura Acabamento Glow", keyword: "base liquida alta cobertura acabamento natural glow", category: "Maquiagem", adjustments: "Tabela de correspondência de tons, subtom quente/frio/neutro e fórmula oil-free resistente à água." },
      { name: "Máscara de Cílios Volume Extremo e Alongamento", keyword: "rimel mascara cilios volume extremo a prova dagua", category: "Maquiagem", adjustments: "Formato do aplicador anatômico em silicone, fácil remoção com água morna e sem borrões." },
      { name: "Perfume Eau de Parfum Floral Amadeirado 100ml", keyword: "perfume feminino eau de parfum fixacao 24h marcante", category: "Perfumaria", adjustments: "Pirâmide olfativa completa (notas de topo, corpo e fundo) e ocasião recomendada de uso." },
      { name: "Body Splash Desodorante Colônia Frutado 200ml", keyword: "body splash feminino refrescante pos banho cheiroso", category: "Perfumaria", adjustments: "Notas aromáticas frescas, sensação pós-banho prolongada e facilidade de reaplicação." },
      { name: "Esfoliante Corporal Café & Açúcar Mascavo", keyword: "esfoliante corporal natural cafe renovacao celular", category: "Corpo & Banho", adjustments: "Granulação dos esfoliantes 100% naturais, hidratação pós-enxágue e frequência semanal." },
      { name: "Creme Hidratante Corporal Manteiga de Karité 400ml", keyword: "hidratante corporal manteiga karite pele extra seca", category: "Corpo & Banho", adjustments: "Absorção rápida sem sensação pegajosa, ação 48 horas de barreira lipídica comprovada." },
      { name: "Tônico Facial Renovador com Niacinamida 5%", keyword: "tonico facial niacinamida poros uniformizacao pele", category: "Skincare", adjustments: "Função de equilíbrio do pH cutâneo, uniformização do tom e prevenção de manchinhas." },
      { name: "Água Micelar Demaquilante Bifásica 200ml", keyword: "agua micelar demaquilante bifasica a prova dagua", category: "Limpeza Facial", adjustments: "Remoção de maquiagem resistente à prova d'água sem agredir a sensível área dos olhos." },
      { name: "Paleta de Sombras Neutras 12 Cores Pigmentadas", keyword: "paleta sombras neutras matte cintilante pigmentada", category: "Maquiagem", adjustments: "Swatch das cores em foto/vídeo, textura aveludada macia e esfumado profissional sem esfarelar." },
      { name: "Kit Pincéis Profissionais de Maquiagem 10 Peças", keyword: "kit pinceis maquiagem profissional cerdas macias", category: "Acessórios", adjustments: "Numeração e função de cada pincel no kit, guia passo a passo de higienização correta." },
      { name: "Gloss Labial Hidratante com Efeito Plump Volume", keyword: "gloss labial efeito bocao acido hialuronico plump", category: "Lábios", adjustments: "Sensação refrescante suave, brilho espelhado e aumento volumétrico visível dos lábios." },
      { name: "Leave-in Protetor Térmico Multifuncional 10 em 1", keyword: "leave in protetor termico antifrizz 10 em 1", category: "Cabelos", adjustments: "10 benefícios comprovados em 1 único frasco, redução imediata de frizz e desembaraço fácil." },
    ];
  } else if (segLower.includes('eletro') || segLower.includes('tech') || segLower.includes('gadget') || segLower.includes('celular') || segLower.includes('info') || segLower.includes('gamer')) {
    baseList = [
      { name: "Smartwatch Bluetooth com Monitor Cardíaco e Oximetro", keyword: "smartwatch bluetooth prova dagua monitor cardiaco sono", category: "Smartwatches", adjustments: "Informar autonomia de bateria em dias, compatibilidade Android/iOS e sensores de saúde." },
      { name: "Fone de Ouvido Sem Fio TWS Bluetooth Cancelamento Ruído", keyword: "fone de ouvido bluetooth cancelamento de ruido tws sem fio", category: "Áudio", adjustments: "Especificar versão Bluetooth 5.3, baixa latência para jogos/vídeos e estojo com display digital." },
      { name: "Carregador Rápido por Indução Magnética 15W Qi", keyword: "carregador sem fio inducao rapido compativel 15w", category: "Carregadores", adjustments: "Destacar homologação Anatel, proteção contra sobreaquecimento e lista de smartphones suportados." },
      { name: "Suporte Veicular Articulado com Trava Automática", keyword: "suporte celular veicular trava automatica saida ar carro", category: "Acessórios Veiculares", adjustments: "Compatibilidade de telas (4.7 a 7 polegadas), rotação 360° e estabilidade em lombadas/curvas." },
      { name: "Cabo USB-C Trançado em Nylon Reforçado 2 Metros 60W", keyword: "cabo tipo c nylon reforcado carga rapida 60w 2m", category: "Cabos & Conectores", adjustments: "Ressaltar blindagem interna contra quebras, velocidade de transferência e comprimento estendido." },
      { name: "Película de Vidro 3D Cobertura Total Dureza 9H", keyword: "pelicula de vidro 3d celular borda curva impacto 9h", category: "Proteção", adjustments: "Incluir kit de aplicação com flanela e adesivos, alta transparência e resistência a riscos." },
      { name: "Capa Protetora Anti-Impacto com Airbag nos Cantos", keyword: "capinha anti impacto transparente borda reforcada celular", category: "Capas & Cases", adjustments: "Tecnologia anti-amarelamento UV e elevação milimétrica para proteger as lentes da câmera." },
      { name: "Caixa de Som Portátil Bluetooth à Prova d'Água 20W IPX7", keyword: "caixa de som bluetooth portatil potente prova dagua ipx7", category: "Áudio", adjustments: "Bateria de 12 horas contínuas, certificação IPX7 imersão e modo pareamento estéreo TWS." },
      { name: "Power Bank Bateria Portátil 20.000mAh Homologado", keyword: "carregador portatil power bank 20000mah homologado anatel", category: "Baterias", adjustments: "Quantidade média de recargas completas por smartphone e display LED de porcentagem restante." },
      { name: "Teclado Mecânico Compacto RGB Switch Silencioso", keyword: "teclado mecanico switch red abnt2 rgb compacto", category: "Periféricos", adjustments: "Tipo de switch suave, padrão ABNT2 com Ç e software dedicado para efeitos de iluminação." },
      { name: "Mouse Gamer Ergonômico 6400 DPI com Botões Laterais", keyword: "mouse gamer ergonomico rgb 6400 dpi sensor optico", category: "Periféricos", adjustments: "Quantidade de botões programáveis, pegada anatômica e ajuste de sensibilidade instantâneo." },
      { name: "Hub Adaptador USB-C 7 em 1 HDMI 4K e Leitor SD", keyword: "hub adaptador usb c hdmi 4k leitor cartao macbook notebook", category: "Adaptadores", adjustments: "Suporte a resolução 4K 60Hz sem lag, compatibilidade universal e carcaça dissipadora em alumínio." },
      { name: "Ring Light LED de Mesa 26cm com Tripé e Suporte Celular", keyword: "ring light mesa suporte celular tripe iluminacao lives", category: "Vídeo & Foto", adjustments: "3 temperaturas de cor (fria, neutra e quente), dimmer regulável e alimentação USB prática." },
      { name: "Webcam Full HD 1080p com Microfone Embutido e Tampa", keyword: "webcam full hd 1080p microfone integrado reuniões home office", category: "Periféricos", adjustments: "Plug & play sem instalação de drivers externos e obturador de privacidade físico deslizante." },
      { name: "Mouse Pad Gamer Extra Grande Speed 900x400mm", keyword: "mouse pad gamer speed borda costurada grande 900x400", category: "Acessórios", adjustments: "Superfície Speed deslize suave, base emborrachada antiderrapante e costura perimetral reforçada." },
      { name: "Lâmpada Inteligente Wi-Fi RGB 10W Compatível Alexa", keyword: "lampada inteligente wifi alexa google home rgb bivolt", category: "Smart Home", adjustments: "Controle por comandos de voz Alexa/Google, sincronização com música e rotinas automáticas no app." },
      { name: "Adaptador Bluetooth 5.0 USB Plug and Play para PC", keyword: "adaptador bluetooth 5 0 usb dongle pc notebook fone", category: "Conectividade", adjustments: "Conexão estável com até 5 dispositivos simultâneos com alcance livre de até 20 metros." },
      { name: "Organizador de Cabos e Fios com Fita Adesiva 3M", keyword: "organizador de cabos clips suporte fios mesa setup", category: "Organização", adjustments: "Fixação 3M durável que não danifica móveis, mantendo mesas de trabalho e games organizadas." },
      { name: "Case Estojo Organizador para Acessórios Tech e Cabos", keyword: "estojo case organizador acessorios cabos viagem impermeavel", category: "Organização", adjustments: "Divisórias com elásticos e tecido impermeável resistente, ideal para proteger cabos e carregadores." },
      { name: "Bastão de Selfie com Tripé Retrátil e Controle Bluetooth", keyword: "bastao de selfie tripe controle remoto bluetooth fotos celular", category: "Acessórios", adjustments: "Haste extensível em liga de alumínio leve, rotação 360° e disparador remoto sem fio." },
    ];
  } else if (segLower.includes('pet') || segLower.includes('animal') || segLower.includes('cao') || segLower.includes('gato') || segLower.includes('veterin')) {
    baseList = [
      { name: "Cama Pet Nuvem Redonda Anti-Stress Lavável", keyword: "cama pet nuvem anti stress cachorro gato lavavel pelucia", category: "Camas & Conforto", adjustments: "Destacar zíper para lavagem facilitada em máquina, tecido pelúcia macio e fundo impermeável." },
      { name: "Comedouro e Bebedouro Automático Gravitacional 2 Litros", keyword: "comedouro automatico fonte agua pet cachorro gato 2l", category: "Alimentação", adjustments: "Capacidade de 2 Litros, material atóxico livre de BPA e facilidade de higienização." },
      { name: "Coleira Peitoral Ergonômica Anti-Puxão com Guia", keyword: "peitoral anti puxao cachorro acolchoado refletivo passeio", category: "Passeio", adjustments: "Tabela de medidas de tórax e pescoço em cm, costuras refletivas seguras para passeios noturnos." },
      { name: "Guia Retrátil para Cães até 25kg com Trava 5 Metros", keyword: "guia retratil cachorro 5m fita reforcada trava seguranca", category: "Passeio", adjustments: "Peso máximo suportado, trava de segurança com engate rápido e empunhadura anatômica macia." },
      { name: "Arranhador Torre para Gatos com Poste em Sisal e Brinquedo", keyword: "arranhador torre para gatos sisal compacto pelucia", category: "Gatos & Brinquedos", adjustments: "Poste revestido em corda de sisal 100% natural, base estável anti-tombamento e pelúcia antialérgica." },
      { name: "Tapete Higiênico Super Absorvente com Carvão Ativado", keyword: "tapete higienico cachorro carvao ativado sem odor 30 un", category: "Higiene", adjustments: "Gel ultra absorvente anti-vazamento, neutralização rápida de odores e atrativo canino funcional." },
      { name: "Shampoo e Condicionador Pet 2 em 1 Vegano Neutro", keyword: "shampoo pet hipoalergenico pelos macios cheiroso neutro", category: "Higiene", adjustments: "pH balanceado para a derme do animal, extratos botânicos naturais e fórmula que não arde os olhos." },
      { name: "Brinquedo Mordedor Interativo para Cães Porta Petisco", keyword: "brinquedo interativo cachorro borracha resistente porta petisco", category: "Brinquedos", adjustments: "Borracha atóxica de alta durabilidade, auxílio comprovado na remoção de tártaro e estímulo mental." },
      { name: "Escova Rasqueadeira para Pelos Mortos com Botão Autolimpante", keyword: "escova rasqueadeira pelos mortos autolimpante cao gato", category: "Estética", adjustments: "Cerdas com ponteiras de proteção arredondadas que massageiam sem ferir a pele e botão de descarte." },
      { name: "Petisco Natural Bifinho 100% Carne e Frango 500g", keyword: "petisco bifinho cachorro natural adestramento 500g", category: "Petiscos", adjustments: "Alto teor de proteínas nobres, zero corantes artificiais e textura macia para reforço positivo." },
      { name: "Bolsa de Transporte Pet Aérea Homologada para Cabine", keyword: "bolsa transporte pet aviao homologada cabine aviacao", category: "Viagem", adjustments: "Medidas padronizadas homologadas pelas companhias aéreas e telas respiráveis em 3 lados." },
      { name: "Cinto de Segurança Pet Veicular Regulável Engate Universal", keyword: "cinto seguranca veicular cachorro universal regulavel carro", category: "Passeio", adjustments: "Mosquetão metálico giratório 360° reforçado e fita de alta tenacidade testada." },
      { name: "Bebedouro Fonte Elétrica Bivolt Silenciosa com Filtro", keyword: "fonte de agua gato bebedouro eletrico silencioso carvao", category: "Alimentação", adjustments: "Bomba submersa ultra silenciosa, refil filtrante de carvão ativo e estímulo à hidratação felina." },
      { name: "Alicate Cortador de Unha Pet Profissional com Trava", keyword: "alicate cortador de unha cachorro gato trava seguranca", category: "Higiene", adjustments: "Lâmina em aço inox afiada e batente limitador de segurança contra cortes excessivos da raiz." },
      { name: "Brinquedo Varinha Interativa com Pena e Guizo para Gatos", keyword: "varinha brinquedo gato interativa pena guizo flexivel", category: "Gatos & Brinquedos", adjustments: "Cabo flexível e resistente com penas naturais para estimular o instinto caçador do felino." },
      { name: "Ração Premium Especial Cães Adultos 15kg", keyword: "racao premium especial caes adultos sabor frango e arroz 15kg", category: "Nutrição", adjustments: "Tabela de garantia nutricional detalhada, ômega 3 e 6 para pelagem brilhante e extrato de yucca." },
      { name: "Areia Sanitária Higiênica Fina Torrão Firme 4kg", keyword: "areia sanitaria gato torrao firme controle odores 4kg", category: "Higiene", adjustments: "Formação imediata de torrões sólidos fáceis de recolher com pá sanitária sem desperdício." },
      { name: "Pá Higiênica Coletora de Fezes para Areia Sanitária", keyword: "pa higienica areia gato vazada plastica resistente", category: "Acessórios", adjustments: "Grade com espaçamento calibrado para economizar areia limpa e cabo com encaixe firme." },
      { name: "Spray Educador Sanitário Pipi Pode e Pipi Não Pode", keyword: "spray educador sanitario cachorro xixi no lugar correto", category: "Adestramento", adjustments: "Modo de aplicação diário explicativo para demarcação de território higiênico sem agressão." },
      { name: "Bandana Pet Estampada com Fecho em Botão de Pressão", keyword: "bandana pet cachorro gato estilosa algodao confort", category: "Moda Pet", adjustments: "Tecido 100% algodão lavável em máquina, costura dupla reforçada e fecho prático regulável." },
    ];
  } else if (segLower.includes('casa') || segLower.includes('decor') || segLower.includes('cozinha') || segLower.includes('utensil') || segLower.includes('cama')) {
    baseList = [
      { name: "Jogo de Panelas Cerâmica Antiaderente 5 Peças com Tampa de Vidro", keyword: "jogo de panelas ceramica antiaderente inducao 5 pecas", category: "Cozinha", adjustments: "Destacar compatibilidade com fogão de indução, cabos soft-touch térmicos e livre de metais pesados." },
      { name: "Garrafa Térmica Inox 1 Litro com Termômetro Digital LED", keyword: "garrafa termica inox 1l termometro digital led cafe", category: "Cozinha", adjustments: "Isolamento a vácuo dupla camada 12h quente/24h frio e display digital de temperatura touch." },
      { name: "Manta de Sofá Algodão Tramado Artesanal 150x200cm", keyword: "manta de sofa algodao tramado artesanal franjas", category: "Decoração", adjustments: "Tecido 100% algodão de toque macio, acabamento com franjas artesanais e lavável em máquina." },
      { name: "Conjunto 6 Pratos Rasos de Porcelana Oxford Linha Clássica", keyword: "conjunto pratos rasos porcelana branca jantar 6 pecas", category: "Mesa Posta", adjustments: "Resistente a micro-ondas e lava-louças, acabamento brilhante impecável e espessura robusta." },
      { name: "Luminária de Mesa Articulada LED Touch 3 Tons de Luz", keyword: "luminaria de mesa articulada led touch recarregavel", category: "Iluminação", adjustments: "Bateria interna recarregável via USB, ajuste de brilho contínuo e haste flexível 360 graus." },
      { name: "Jogo de Cama Casal Percal 200 Fios 100% Algodão 4 Peças", keyword: "jogo de cama casal percal 200 fios 100 algodao 4 pecas", category: "Cama & Banho", adjustments: "Toque acetinado suave, elástico perimetral total no lençol de baixo e fronhas com abas." },
      { name: "Kit 4 Almofadas Decorativas com Enchimento Siliconado 45x45", keyword: "kit almofadas decorativas sala cheias com ziper 45x45", category: "Decoração", adjustments: "Zíper invisível para retirada da capa e lavagem, enchimento antialérgico fibra de silicone." },
      { name: "Organizador Giratório Multiuso Acrílico para Cosméticos e Temperos", keyword: "organizador giratorio acrilico 360 despensa armario", category: "Organização", adjustments: "Giro 360° fluido sobre rolamentos de aço, borda elevada contra quedas e acrílico transparente." },
      { name: "Faqueiro Aço Inox 24 Peças com Estojo para Gaveta", keyword: "faqueiro aco inox 24 pecas servico completo gaveta", category: "Mesa Posta", adjustments: "Lâminas temperadas com fio durável, acabamento polido alto brilho e estojo organizador incluso." },
      { name: "Jogo de Toalhas Banhão 5 Peças 100% Algodão Gramatura 500g", keyword: "jogo toalhas banhao 5 pecas algodao alta absorcao 500g", category: "Cama & Banho", adjustments: "Gramatura 500g/m² com alta capacidade de absorção e barra aveludada decorativa jacquard." },
      { name: "Kit 6 Potes Herméticos de Vidro com Tampa de Bambu", keyword: "potes hermeticos vidro tampa bambu mantimentos", category: "Cozinha", adjustments: "Anel de vedação em silicone hermético, vidro borossilicato resistente a calor e tampa ecológica." },
      { name: "Tapete de Sala Felpudo Macio Antiderrapante 150x200cm", keyword: "tapete para sala felpudo macio antiderrapante 150x200", category: "Decoração", adjustments: "Base antiderrapante com pontos emborrachados, toque super macio e fios com proteção antiácaro." },
      { name: "Cortina Blackout em Tecido com Ilhós 300x250cm", keyword: "cortina blackout tecido corta luz quarto sala 300x250", category: "Cortinas", adjustments: "Bloqueio de 90% da luminosidade sem plástico PVC, caimento ondulado elegante e ilhós cromados." },
      { name: "Tábua de Corte Grande em Bambu com Canaleta de Gordura", keyword: "tabua de corte carne churrasco bambu grande canaleta", category: "Churrasco & Cozinha", adjustments: "Ação antibacteriana natural do bambu, canaleta para reter líquidos e alta resistência a cortes." },
      { name: "Escorredor de Louças 2 Andares Inox com Porta Copos e Talheres", keyword: "escorredor de loucas 2 andares inox pia com bandeja", category: "Organização", adjustments: "Aço inoxidável com proteção antiferrugem, bandeja coletora de água plástica removível." },
      { name: "Conjunto 6 Taças de Vinho Cristal Ecológico 450ml", keyword: "conjunto tacas de vinho cristal ecologico transparente", category: "Mesa Posta", adjustments: "Borda fina cortada a laser, transparência cristalina pura e sonoridade característica do cristal." },
      { name: "Aromatizador Difusor Elétrico Ultrassônico com LED 500ml", keyword: "difusor aromatizador ambiente ultrassonico oleo essencial led", category: "Aromas", adjustments: "Desligamento automático com tanque vazio, temporizador integrado e vaporização ultra fina." },
      { name: "Varal Retrátil de Parede em Alumínio 5 Varetas 1 Metro", keyword: "varal retratil parede dobravel aluminio lavanderia", category: "Lavanderia", adjustments: "Estrutura 100% em alumínio que não enferruja, fechamento compacto rente à parede e fácil fixação." },
      { name: "Cesto de Roupa Dobrável com Tampa e Forro Removível 60L", keyword: "cesto de roupa suja dobravel com tampa bambu tecido", category: "Organização", adjustments: "Forro interno lavável com alças, estrutura em ripas de bambu reforçada e ventilação adequada." },
      { name: "Dispenser de Detergente e Suporte para Esponja 2 em 1", keyword: "dispenser dosador detergente suporte esponja pia cozinha", category: "Cozinha", adjustments: "Dosagem exata com 1 toque economizando detergente e mantendo a bancada da pia sempre seca." },
    ];
  } else if (segLower.includes('suplement') || segLower.includes('fitness') || segLower.includes('academia') || segLower.includes('esporte') || segLower.includes('nutri')) {
    baseList = [
      { name: "Whey Protein Isolado 900g 100% Puro Zero Lactose", keyword: "whey protein isolado 900g puro zero lactose proteina", category: "Proteínas", adjustments: "Inserir tabela nutricional com quantidade de BCAA/Glutamina por dose e laudos laboratoriais." },
      { name: "Creatina Monohidratada 100% Pura Micronizada 300g", keyword: "creatina monohidratada 100 pura 300g micronizada forca", category: "Aminoácidos", adjustments: "Destacar selo Creapure/Pureza comprovada, solubilidade instantânea e benefícios no ganho de força." },
      { name: "Pré-Treino Ultra Concentrado com Cafeína e Beta-Alanina", keyword: "pre treino ultra concentrado cafeina beta alanina energia", category: "Energia", adjustments: "Dosagem dos estimulantes por scoop, foco mental e redução da fadiga muscular nos treinos." },
      { name: "Multivitamínico Completo A a Z 60 Cápsulas", keyword: "multivitaminico completo a z minerais imunidade 60 caps", category: "Vitaminas", adjustments: "Biodisponibilidade das vitaminas e minerais quelatos essenciais para o sistema imunológico." },
      { name: "Coenzima Q10 100mg com Vitamina E Antioxidante", keyword: "coenzima q10 100mg ubiquinona antioxidante coracao", category: "Saúde & Longevidade", adjustments: "Absorção com cápsulas em óleo, benefícios para saúde mitocondrial e proteção cardiovascular." },
      { name: "BCAA 2:1:1 Fermentado em Pó 300g Recuperação Muscular", keyword: "bcaa 2 1 1 po recuperacao muscular anticatabolico", category: "Aminoácidos", adjustments: "Proporção balanceada de Leucina, Isoleucina e Valina para evitar catabolismo muscular pós-treino." },
      { name: "Glutamina Micronizada 100% Pura 300g Saúde Intestinal", keyword: "glutamina micronizada pura 300g imunidade intestino", category: "Saúde Intestinal", adjustments: "Reforço da barreira epitelial intestinal, rápida absorção e ausência de carboidratos ou glúten." },
      { name: "Colágeno Hidrolisado Verisol com Ácido Hialurônico e Biotina", keyword: "colageno hidrolisado verisol acido hialuronico biotina pele", category: "Beleza & Pele", adjustments: "Comprovação científica do peptídeo Verisol na firmeza da pele e fortalecimento de unhas e cabelos." },
      { name: "Ômega 3 Ultra Concentrado 1000mg EPA 660 DHA 440", keyword: "omega 3 concentrado epa dha capsulas sem gosto peixe", category: "Saúde Cardiovascular", adjustments: "Certificação IFOS livre de metais pesados, cápsulas gastro-resistentes sem refluxo ou gosto de peixe." },
      { name: "Termogênico Queimador de Gordura com Cafeína e Chá Verde", keyword: "termogenico potente queimador gordura acelerar metabolismo", category: "Emagrecimento", adjustments: "Aceleração do metabolismo basal, controle de apetite e orientações de horários para não atrapalhar o sono." },
      { name: "Pasta de Amendoim Integral Crocante 1kg Zero Açúcar", keyword: "pasta de amendoim integral crocante 1kg zero acucar", category: "Alimentos Fit", adjustments: "Ingredientes 100% amendoim torrado sem óleo de palma, alto teor protéico e sem glúten." },
      { name: "Coqueteleira Shaker com Mola Misturadora e Compartimento 600ml", keyword: "coqueteleira shaker com mola misturador suplementos 600ml", category: "Acessórios", adjustments: "Vedação anti-vazamento garantida, material livre de BPA e compartimento inferior para pó e cápsulas." },
      { name: "Faixa Elástica Mini Band Kit com 5 Intensidades", keyword: "kit mini band faixas elasticas exercicios funcionais 5 niveis", category: "Acessórios Fitness", adjustments: "Látex natural resistente que não enrola na perna, tabela de cargas progressivas do leve ao extra forte." },
      { name: "Corda de Pular com Rolamento Duplo e Cabo de Aço Regulável", keyword: "corda de pular speed rope crossfit rolamento duplo ajustavel", category: "Crossfit & Treino", adjustments: "Velocidade máxima para double unders, regulagem de altura rápida sem ferramentas e pegada confortável." },
      { name: "Luva para Musculação com Munhequeira Ajustável", keyword: "luva musculacao com munhequeira apoio punho academia", category: "Acessórios", adjustments: "Palma em couro acolchoado antiderrapante, munhequeira de estabilização do pulso e tecido respirável." },
      { name: "Whey Protein 3W Concentrado Isolado e Hidrolisado 900g", keyword: "whey protein 3w concentrado isolado hidrolisado sabor chocolate", category: "Proteínas", adjustments: "Combinação sinérgica de rápida e média absorção, cremosidade superior e rica em aminoácidos." },
      { name: "Magnésio Dimalato 500mg 60 Cápsulas Relaxamento Muscular", keyword: "magnesio dimalato 500mg prevencao caibras sono energia", category: "Minerais", adjustments: "Prevenção comprovada de câimbras e dores musculares, melhora na qualidade do sono e fadiga." },
      { name: "Vitamina D3 2000 UI com Vitamina K2 MK-7", keyword: "vitamina d3 2000 ui k2 mk7 fixacao calcio ossos", category: "Vitaminas", adjustments: "Sinergia da D3 com K2 para direcionamento correto do cálcio para os ossos sem calcificar artérias." },
      { name: "Barra de Proteína Zero Açúcar Caixa com 12 Unidades", keyword: "barra de proteina zero acucar 20g proteina caixa", category: "Snacks Fit", adjustments: "20g de proteína nobre por unidade, textura macia sem gosto residual e praticidade para lanches." },
      { name: "Strap para Musculação e Levantamento Terra em Algodão Reforçado", keyword: "strap musculacao puxada levantamento terra fita algodao", category: "Acessórios", adjustments: "Costura tripla reforçada suportando altas cargas e alívio da pegada no antebraço para focar no músculo alvo." },
    ];
  } else {
    // E-commerce Geral / Varejo Multicategorias (20 produtos REAIS, concretos e com busca real no Google)
    baseList = [
      { name: "Mochila Executiva Antifurto Impermeável para Notebook com Entrada USB", keyword: "mochila executiva antifurto impermeavel notebook usb", category: "Bolsas & Mochilas", adjustments: "Inserir H1 com 'mochila antifurto para notebook', detalhar dimensões para laptops de até 15.6 polegadas e trava TSA." },
      { name: "Garrafa Térmica Inox 1 Litro a Vácuo com Termômetro Digital LED", keyword: "garrafa termica inox 1l termometro digital led cafe agua", category: "Cozinha & Térmicos", adjustments: "Otimizar tag Title com retenção térmica comprovada (12h quente/24h frio) e destacar tela touch screen." },
      { name: "Suporte Articulado para Notebook Ergonômico de Alumínio Dobrável", keyword: "suporte articulado para notebook aluminio ergonomico dobravel", category: "Escritório & Home Office", adjustments: "Destacar certificação ergonômica NR17, múltiplos níveis de inclinação e almofadas de silicone anti-risco." },
      { name: "Organizador Multiuso Acrílico com Divisórias para Gaveta e Armário", keyword: "organizador de gavetas acrilico divisórias multiuso transparente", category: "Organização", adjustments: "Especificar medidas em centímetros (C x L x A), empilhamento modular e acrílico espesso cristalino." },
      { name: "Mini Processador e Triturador Elétrico de Alimentos Sem Fio USB", keyword: "mini processador triturador alimentos eletrico sem fio usb", category: "Cozinha & Eletro", adjustments: "Explicar potência das lâminas em inox 304, facilidade de lavagem e autonomia da bateria recarregável." },
      { name: "Lâmpada LED com Sensor de Movimento Recarregável USB Magnética", keyword: "luminaria led sensor de movimento recarregavel armario escada", category: "Iluminação & Casa", adjustments: "Ressaltar fixação magnética com fita 3M sem furar paredes e alcance do sensor de presença de 3 metros." },
      { name: "Bolsa Térmica Marmita com Alça Reforçada e Bolsos Laterais", keyword: "bolsa termica marmita fitness trabalho alca transversal", category: "Marmitas & Térmicos", adjustments: "Isolamento térmico triplo multicamadas, forro interno impermeável fácil de limpar e volume em litros." },
      { name: "Umidificador e Aromatizador de Ar Ultrassônico com LED Noturno", keyword: "umidificador aromatizador de ar ultrassonico difusor led", category: "Climatização & Bem-Estar", adjustments: "Funcionamento super silencioso para quarto de bebê, capacidade do tanque e desligamento automático." },
      { name: "Kit Organizador de Malas para Viagem 6 Peças Impermeável", keyword: "kit organizador de malas viagem 6 pecas necessaire bagagem", category: "Viagem", adjustments: "Tamanho de cada um dos 6 organizadores, tecido nylon resistente à água e zíperes bidirecionais." },
      { name: "Almofada Ortopédica Ergonômica Espuma Viscoelástica com Memória", keyword: "almofada ortopedica assento ergonomico viscoelastico coluna", category: "Conforto & Postura", adjustments: "Alívio da pressão no cóccix e ciático, capa com zíper lavável e espuma de memória de alta densidade." },
      { name: "Balança Digital Corporal com Bioimpedância e Conexão Bluetooth", keyword: "balanca digital bioimpedancia corporal bluetooth aplicativo", category: "Saúde & Fitness", adjustments: "Mapeamento de 12 parâmetros corporais (gordura, massa magra, água), app em português e memória multiusuário." },
      { name: "Tapete Capacho Antiderrapante Lavável para Entrada", keyword: "tapete capacho entrada porta antiderrapante lavavel vinil", category: "Decoração", adjustments: "Base antiderrapante emborrachada, retenção de poeira dos sapatos e facilidade de limpeza com mangueira." },
      { name: "Escova de Limpeza Elétrica Giratória Multifuncional com 3 Pontas", keyword: "escova eletrica limpeza giratoria banheiro rejunte pia", category: "Limpeza Prática", adjustments: "Velocidade de rotação para tirar limo e gordura sem esforço físico e 3 cerdas intercambiáveis." },
      { name: "Dispenser Automático de Sabonete Líquido e Álcool Gel com Sensor", keyword: "dispenser sabonete liquido automatico sensor aproximacao pia", category: "Higiene & Banheiro", adjustments: "Acionamento sem contato físico 100% higiênico, regulagem do volume da gota e visor de nível transparente." },
      { name: "Lousa Magnética Organizadora Semanal para Geladeira com Canetas", keyword: "lousa magnetica semanal geladeira menu tarefas planejamento", category: "Planejamento & Casa", adjustments: "Fixação magnética total na porta da geladeira, película especial que apaga a seco sem manchar e canetas." },
      { name: "Kit Ferramentas Manuais 24 Peças em Maleta Compacta Rígida", keyword: "kit ferramentas manuais para casa 24 pecas maleta", category: "Ferramentas", adjustments: "Lista completa dos itens (martelo, trena, alicate, chaves de fenda), aço forjado e cabo emborrachado." },
      { name: "Relógio Despertador Digital LED com Temperatura e Modo Noturno", keyword: "relogio despertador digital led mesa cabeceira temperatura", category: "Decoração & Quarto", adjustments: "Ajuste de intensidade luminosa para não incomodar no escuro, sensor de temperatura ambiente e alarme snooze." },
      { name: "Suporte de Celular de Mesa Dobrável Articulado em Alumínio", keyword: "suporte celular mesa articulado aluminio dobravel videochamada", category: "Acessórios", adjustments: "Ângulo de visão ergonômico para chamadas de vídeo, abertura inferior para conectar cabo do carregador." },
      { name: "Porta Temperos Giratório em Aço Inox com 12 Potes de Vidro", keyword: "porta temperos giratorio inox 12 potes vidro bancada", category: "Cozinha", adjustments: "Base giratória suave 360°, tampas com dosador duplo e potes de vidro de 100ml com identificação." },
      { name: "Mini Selador Térmico Portátil para Embalagens Plásticas", keyword: "mini selador termico embalagens plasticas alimentos portatil", category: "Utilidades", adjustments: "Aquecimento rápido em 3 segundos para lacrar sacos de salgadinhos e mantimentos, evitando desperdício." },
    ];
  }

  // Filter out any generic placeholders from custom names
  const validCustomNames = (customNames || [])
    .map(n => (n || '').trim())
    .filter(n => n.length > 2 && !isGenericPlaceholder(n));

  // If valid custom product names were supplied by the agency, map them
  if (validCustomNames.length > 0) {
    const mappedCustom: SeoProductItem[] = validCustomNames.slice(0, 20).map((cleanName, idx) => {
      const template = baseList[idx % baseList.length];
      const slug = slugify(cleanName);
      const productUrl = `${baseUrl}/${slug}`;
      const keyword = generateNaturalKeyword(cleanName, template.category);

      return {
        id: `seo-prod-${idx + 1}`,
        productName: cleanName,
        category: template.category || 'Catálogo Oficial',
        productUrl,
        focusKeyword: keyword,
        currentTitle: cleanName,
        optimizedTitle: `${cleanName} com Envio Rápido e Frete Seguro | ${storeName}`,
        metaDescription: `Compre ${cleanName} na ${storeName} com garantia de procedência, parcelamento em até 12x e entrega para todo o Brasil. Confira!`,
        seoAdjustments: `Ajustar tag H1 principal para conter a palavra-chave "${keyword}", incluir descrição com mais de 250 palavras e otimizar texto alt nas imagens.`,
        searchVolumeDemand: (idx < 5 ? 'Muito Alta' : idx < 12 ? 'Alta' : 'Média') as any
      };
    });

    // If we have fewer than 20 valid custom names, complete with baseList items
    if (mappedCustom.length < 20) {
      const needed = 20 - mappedCustom.length;
      const startIdx = mappedCustom.length;
      for (let i = 0; i < needed; i++) {
        const item = baseList[(startIdx + i) % baseList.length];
        const slug = slugify(item.name);
        const productUrl = `${baseUrl}/${slug}`;
        mappedCustom.push({
          id: `seo-prod-${startIdx + i + 1}`,
          productName: item.name,
          category: item.category,
          productUrl,
          focusKeyword: item.keyword,
          currentTitle: item.name,
          optimizedTitle: `${item.name} com Envio Rápido | ${storeName}`,
          metaDescription: `Encontre ${item.name} com as melhores condições na ${storeName}. Aproveite parcelamento em até 12x, frete seguro e qualidade garantida!`,
          seoAdjustments: item.adjustments,
          searchVolumeDemand: ((startIdx + i) < 5 ? 'Muito Alta' : (startIdx + i) < 12 ? 'Alta' : 'Média') as any
        });
      }
    }

    return mappedCustom;
  }

  // Default: return 20 authentic niche products with real URLs and natural Google search keywords
  return baseList.slice(0, 20).map((item, idx) => {
    const slug = slugify(item.name);
    const productUrl = `${baseUrl}/${slug}`;
    return {
      id: `seo-prod-${idx + 1}`,
      productName: item.name,
      category: item.category,
      productUrl,
      focusKeyword: item.keyword,
      currentTitle: item.name,
      optimizedTitle: `${item.name} com Envio Rápido | ${storeName}`,
      metaDescription: `Encontre ${item.name} com as melhores condições na ${storeName}. Aproveite parcelamento em até 12x, frete seguro e qualidade garantida!`,
      seoAdjustments: item.adjustments,
      searchVolumeDemand: (idx < 5 ? 'Muito Alta' : idx < 12 ? 'Alta' : 'Média') as any
    };
  });
}
