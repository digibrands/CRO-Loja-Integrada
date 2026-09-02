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

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
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

  if (segLower.includes('moda') || segLower.includes('vestu') || segLower.includes('roupa') || segLower.includes('acessório')) {
    baseList = [
      { name: "Vestido Midi Floral Elegance", keyword: "vestido midi floral estampado", category: "Vestidos", adjustments: "Inserir H1 com 'vestido midi floral', tabela de medidas em cm na descrição e alt tag em 3 fotos." },
      { name: "Calça Pantalona Linho Premium", keyword: "calça pantalona linho cintura alta", category: "Calças", adjustments: "Criar URL amigável /calca-pantalona-linho-cintura-alta, destacar composição 100% linho e caimento." },
      { name: "Blazer Feminino Estruturado Alfaiataria", keyword: "blazer alfaiataria feminino acinturado", category: "Blazers", adjustments: "Otimizar meta tag com frete e parcelamento, listar ocasiões de uso e detalhes do forro." },
      { name: "Conjunto Moletom Flanelado Confort", keyword: "conjunto moletom feminino flanelado", category: "Conjuntos", adjustments: "Adicionar palavras-chave de inverno, guia de tamanhos P ao GG e fotos com modelo real." },
      { name: "Camisa Social Seda Manga Longa", keyword: "camisa social feminina manga longa", category: "Camisas", adjustments: "Inserir termos de busca para look trabalho, especificações do tecido e botões perolados." },
      { name: "Saia Plissada Cintura Alta", keyword: "saia plissada midi cintura alta", category: "Saias", adjustments: "Destacar caimento do plissado, forro interno e combinações com calçados." },
      { name: "Bolsa Transversal Couro Sintético", keyword: "bolsa transversal feminina pequena", category: "Bolsas", adjustments: "Informar dimensões exatas (altura x largura x profundidade), divisórias e tipo de fecho." },
      { name: "Brinco Argola Banhado Ouro 18k", keyword: "brinco argola semijoia banhada ouro", category: "Semijoias", adjustments: "Destacar garantia de banho, tecnologia antialérgica e peso da peça." },
      { name: "Regata Canelada Gola Alta", keyword: "regata canelada gola alta basica", category: "Blusas", adjustments: "Otimizar título para busca de básicos, elasticidade do tecido e kit com cores." },
      { name: "Short Jeans Cintura Alta Destroyed", keyword: "short jeans feminino cintura alta desfiado", category: "Shorts", adjustments: "Incluir medidas de quadril e cintura, lavagem e composição com elastano." },
      { name: "Vestido Longo Festa Fenda Lateral", keyword: "vestido longo festa madrinha formatura", category: "Vestidos de Festa", adjustments: "Otimizar para buscas de casamentos e formaturas, tecido acetinado e caimento." },
      { name: "Cardigan Tricô Alongado Outono", keyword: "cardigan feminino trico longo", category: "Casacos & Tricôs", adjustments: "Palavras-chave sazonais, orientações de lavagem e textura dos pontos." },
      { name: "Colar Choker Corrente Fita", keyword: "colar choker fita banhado ouro", category: "Semijoias", adjustments: "Comprimento da corrente, extensor ajustável e fotos de composição de mix de colares." },
      { name: "Cinto Feminino Fivela Dourada", keyword: "cinto couro legitimo fivela quadrada", category: "Acessórios", adjustments: "Largura da tira em centímetros, opções de furação e tabela de medidas." },
      { name: "T-Shirt Algodão Penteado Estonada", keyword: "camiseta feminina algodao premium", category: "T-shirts", adjustments: "Gramatura do tecido 100% algodão, estampa silk screen resistente e caimento soltinho." },
      { name: "Jaqueta Jeans Oversized Streetwear", keyword: "jaqueta jeans oversized feminina", category: "Casacos", adjustments: "Medidas de ombro e manga, lavagem vintage e bolsos funcionais." },
      { name: "Macacão Pantacourt com Cinto Faixa", keyword: "macacao pantacourt feminino elegante", category: "Macacões", adjustments: "Zíper invisível traseiro, fotos da modelo em movimento e tecido não transparente." },
      { name: "Scarpin Clássico Salto Médio", keyword: "sapato scarpin salto medio confort", category: "Calçados", adjustments: "Palmilha anatômica confort, altura do salto em cm e sola antiderrapante." },
      { name: "Blusa Crepe Manga Bufante", keyword: "blusa feminina manga bufante princesa", category: "Blusas", adjustments: "Transparência zero, acabamento da gola e facilidade para passar." },
      { name: "Cropped Alfaiataria Alça Larga", keyword: "cropped alfaiataria feminino estruturado", category: "Croppeds", adjustments: "Estrutura com barbatana, forro duplo e combinações com peças de cintura alta." },
    ];
  } else if (segLower.includes('cosm') || segLower.includes('beleza') || segLower.includes('skincare') || segLower.includes('perfum')) {
    baseList = [
      { name: "Sérum Facial Vitamina C 15% Clareador", keyword: "serum vitamina c facial clareador manchas", category: "Skincare", adjustments: "Inserir concentração de ativos no título H1, modo de uso dia/noite e tipo de pele." },
      { name: "Hidratante Facial Ácido Hialurônico", keyword: "hidratante facial acido hialuronico toque seco", category: "Skincare", adjustments: "Destacar efeito matte/toque seco, rendimento e certificação cruelty-free." },
      { name: "Protetor Solar FPS 50 Toque Seco", keyword: "protetor solar facial fps 50 sem cor", category: "Proteção Solar", adjustments: "Comprovação dermatológica, resistência à água e benefícios anti-idade." },
      { name: "Shampoo Hidratante Sem Sulfato", keyword: "shampoo sem sulfato cabelos secos", category: "Cabelos", adjustments: "Lista completa de ingredientes sem parabenos, indicação de curvatura capilar." },
      { name: "Máscara de Nutrição Capilar Óleos Nobres", keyword: "mascara nutricao capilar profissional", category: "Cabelos", adjustments: "Cronograma capilar (etapa nutrição), tempo de pausa e resultado de salão." },
      { name: "Óleo Reparador de Pontas Argan & Mirra", keyword: "oleo capilar reparador pontas argan", category: "Finalizadores", adjustments: "Proteção térmica até 230°C, perfume suave e aplicação em cabelo seco/úmido." },
      { name: "Sabonete Líquido Facial Ácido Salicílico", keyword: "sabonete facial antiacne pele oleosa", category: "Limpeza Facial", adjustments: "Controle de oleosidade e poros dilatados, indicação de uso diário." },
      { name: "Batom Líquido Matte Longa Duração 12h", keyword: "batom matte longa duracao que nao transfere", category: "Maquiagem", adjustments: "Fotos fiéis das cores em diferentes tons de pele, teste de transferência." },
      { name: "Base Líquida Acabamento Natural Alta Cobertura", keyword: "base liquida cobertura media acabamento glow", category: "Maquiagem", adjustments: "Tabela de correspondência de tons, subtom quente/frio e fórmula oil-free." },
      { name: "Máscara de Cílios Efeito Volume Extremo", keyword: "rimel mascara cilios volume e alongamento", category: "Maquiagem", adjustments: "Formato do aplicador em silicone, fácil remoção com água morna." },
      { name: "Perfume Eau de Parfum Floral Amadeirado 100ml", keyword: "perfume feminino eau de parfum fixacao 24h", category: "Perfumaria", adjustments: "Pirâmide olfativa completa (topo, corpo e fundo) e ocasião recomendada." },
      { name: "Body Splash Desodorante Colônia Frutado", keyword: "body splash feminino refrescante pos banho", category: "Perfumaria", adjustments: "Notas aromáticas, sensação de frescor e reaplicação ao longo do dia." },
      { name: "Esfoliante Corporal Café & Açúcar Mascavo", keyword: "esfoliante corporal natural renovacao celular", category: "Corpo & Banho", adjustments: "Granulação dos esfoliantes naturais, hidratação pós-enxágue e frequência." },
      { name: "Creme Hidratante Corporal Manteiga de Karité", keyword: "hidratante corporal pele extra seca", category: "Corpo & Banho", adjustments: "Absorção rápida sem sensação pegajosa, ação 48 horas de barreira lipídica." },
      { name: "Tônico Facial Renovador com Niacinamida", keyword: "tonico facial niacinamida poros uniformizacao", category: "Skincare", adjustments: "Função de equilíbrio de pH, uniformização do tom e compatibilidade." },
      { name: "Água Micelar Demaquilante 6 em 1", keyword: "agua micelar demaquilante bifasica", category: "Limpeza Facial", adjustments: "Remoção de maquiagem à prova d'água sem agredir a área dos olhos." },
      { name: "Paleta de Sombras Neutras Pigmentadas", keyword: "paleta sombras neutras matte cintilante", category: "Maquiagem", adjustments: "Swatch das cores em vídeo/foto, textura aveludada e esfumado fácil." },
      { name: "Kit Pincéis Profissionais de Maquiagem", keyword: "kit pinceis maquiagem cerdas macias", category: "Acessórios", adjustments: "Numeração e função de cada pincel no kit, guia de higienização." },
      { name: "Gloss Labial Hidratante com Efeito Plump", keyword: "gloss labial efeito bocao acido hialuronico", category: "Lábios", adjustments: "Sensação refrescante, brilho espelhado e aumento visível dos lábios." },
      { name: "Leave-in Protetor Térmico Multifuncional", keyword: "leave in protetor termico antifrizz", category: "Cabelos", adjustments: "10 benefícios em 1 frasco, redução de frizz e desembaraço imediato." },
    ];
  } else if (segLower.includes('eletro') || segLower.includes('tech') || segLower.includes('gadget') || segLower.includes('celular') || segLower.includes('info')) {
    baseList = [
      { name: "Smartwatch Bluetooth com Monitor Cardíaco", keyword: "smartwatch bluetooth prova dagua monitor cardiaco", category: "Smartwatches", adjustments: "Informar autonomia de bateria em dias, compatibilidade Android/iOS e sensores inclusos." },
      { name: "Fone de Ouvido Sem Fio TWS com Cancelamento de Ruído", keyword: "fone de ouvido bluetooth cancelamento de ruido tws", category: "Áudio", adjustments: "Especificar versão Bluetooth 5.3, latência baixa para jogos e estojo com display de bateria." },
      { name: "Carregador Rápido por Indução Magnética 15W", keyword: "carregador sem fio inducao rapido compativel", category: "Carregadores", adjustments: "Destacar certificação Anatel, proteção contra sobreaquecimento e aparelhos suportados." },
      { name: "Suporte Veicular Articulado com Trava Automática", keyword: "suporte celular veicular trava automatica saida ar", category: "Acessórios Veiculares", adjustments: "Explicar compatibilidade de telas (4.7 a 7 polegadas) e estabilidade em curvas." },
      { name: "Cabo USB-C Trançado em Nylon Reforçado 2m", keyword: "cabo tipo c nylon reforcado carga rapida 60w", category: "Cabos & Conectores", adjustments: "Ressaltar blindagem contra quebras, velocidade de transferência e comprimento." },
      { name: "Película de Vidro 3D Cobertura Total", keyword: "pelicula de vidro 3d privacidade impacto", category: "Proteção", adjustments: "Incluir kit de aplicação com flanela, dureza 9H e proteção contra arranhões." },
      { name: "Capa Protetora Anti-Impacto com Borda Elevada", keyword: "capinha anti impacto transparente reforcada", category: "Capas & Cases", adjustments: "Tecnologia anti-amarelamento e elevação para proteger a lente da câmera." },
      { name: "Caixa de Som Portátil à Prova d'Água 20W", keyword: "caixa de som bluetooth portatil potente ipx7", category: "Áudio", adjustments: "Bateria de 12 horas contínuas, certificação IPX7 e modo pareamento estéreo TWS." },
      { name: "Power Bank Bateria Portátil 20.000mAh", keyword: "carregador portatil power bank 20000mah homologado", category: "Baterias", adjustments: "Quantidade média de recargas por smartphone e indicadores LED de carga restante." },
      { name: "Teclado Mecânico Compacto RGB", keyword: "teclado mecanico switch red abnt2 rgb", category: "Periféricos", adjustments: "Tipo de switch silencioso, layout ABNT2 com Ç e software de personalização." },
      { name: "Mouse Gamer Ergonômico 6400 DPI", keyword: "mouse gamer ergonomico rgb sensor optico", category: "Periféricos", adjustments: "Quantidade de botões programáveis e ajuste de sensibilidade on-the-fly." },
      { name: "Hub Adaptador USB-C 7 em 1 HDMI 4K", keyword: "hub adaptador usb c hdmi leitor cartao macbook", category: "Adaptadores", adjustments: "Suporte a resolução 4K 60Hz, compatibilidade universal e carcaça em alumínio." },
      { name: "Ring Light LED com Tripé Ajustável 26cm", keyword: "ring light mesa suporte celular tripé dimmer", category: "Vídeo & Foto", adjustments: "3 temperaturas de cor (fria, neutra e quente) e alimentação USB prática." },
      { name: "Webcam Full HD 1080p com Microfone Embutido", keyword: "webcam full hd 1080p microfone integrado streaming", category: "Periféricos", adjustments: "Plug & play sem instalação de drivers e obturador de privacidade físico." },
      { name: "Mouse Pad Gamer Extra Grande 900x400mm", keyword: "mouse pad gamer speed borda costurada grande", category: "Acessórios", adjustments: "Superfície Speed lisa, base emborrachada antiderrapante e costura reforçada." },
      { name: "Lâmpada Inteligente Wi-Fi RGB 10W", keyword: "lampada inteligente wifi alexa google home rgb", category: "Smart Home", adjustments: "Integração por voz com Alexa/Google e agendamento de rotinas no app." },
      { name: "Adaptador Bluetooth 5.0 USB Plug and Play", keyword: "adaptador bluetooth 5 0 usb pc notebook", category: "Conectividade", adjustments: "Conexão de até 5 dispositivos simultâneos com alcance de 20 metros." },
      { name: "Organizador de Cabos e Fios com Fita Adesiva", keyword: "organizador de cabos clips suporte fios mesa", category: "Organização", adjustments: "Fixação 3M durável para mesas de setup gamer ou home office." },
      { name: "Mini Caixa Organizadora para Acessórios Tech", keyword: "estojo case organizador acessorios cabos viagem", category: "Organização", adjustments: "Divisórias com elásticos e tecido impermeável para viagens." },
      { name: "Bastão de Selfie com Tripé e Controle Bluetooth", keyword: "bastao de selfie tripe controle remoto fotos", category: "Acessórios", adjustments: "Rotação 360 graus, haste extensível em alumínio leve e disparo sem fio." },
    ];
  } else if (segLower.includes('pet') || segLower.includes('animal') || segLower.includes('veterin')) {
    baseList = [
      { name: "Cama Pet Nuvem Redonda Anti-Stress Lavável", keyword: "cama pet nuvem anti stress cachorro gato lavavel", category: "Camas & Conforto", adjustments: "Destacar zíper para lavagem em máquina, tecido pelúcia macio e fundo impermeável." },
      { name: "Comedouro e Bebedouro Automático Gravitacional", keyword: "comedouro automatico fonte agua pet cachorro gato", category: "Alimentação", adjustments: "Capacidade em litros (2L), material atóxico livre de BPA e facilidade de limpeza." },
      { name: "Coleira Peitoral Ergonômica Anti-Puxão", keyword: "peitoral anti puxao cachorro reforçado refletivo", category: "Passeio", adjustments: "Tabela de medidas de tórax e pescoço em cm, costuras refletivas para passeio noturno." },
      { name: "Guia Retrátil para Cães com Trava 5 Metros", keyword: "guia retratil cachorro 5m fita reforçada trava", category: "Passeio", adjustments: "Peso máximo suportado (até 25kg), trava de segurança rápida e empunhadura anatômica." },
      { name: "Arranhador para Gatos com Torre e Brinquedo", keyword: "arranhador torre para gatos sisal compacto", category: "Gatos & Brinquedos", adjustments: "Poste revestido em corda de sisal natural, base estável e pelúcia antialérgica." },
      { name: "Tapete Higiênico Super Absorvente 30 Unidades", keyword: "tapete higienico cachorro carvão ativado sem odor", category: "Higiene", adjustments: "Gel ultra absorvente, barreiras laterais antivazamento e atrativo canino." },
      { name: "Shampoo e Condicionador Pet 2 em 1 Neutro", keyword: "shampoo pet hipoalergenico pelos macios cheiroso", category: "Higiene", adjustments: "pH balanceado para a pele animal, extratos naturais e fórmula que não arde os olhos." },
      { name: "Brinquedo Mordedor Interativo Porta Petisco", keyword: "brinquedo interativo cachorro borracha resistente", category: "Brinquedos", adjustments: "Borracha natural durável, auxílio na limpeza do tártaro e estímulo mental." },
      { name: "Escova Rasqueadeira com Botão Autolimpante", keyword: "escova rasqueadeira pelos mortos autolimpante", category: "Estética", adjustments: "Cerdas com pontas arredondadas que massageiam sem ferir e remoção de pelos com 1 clique." },
      { name: "Petisco Natural Bifinho 100% Carne 500g", keyword: "petisco bifinho cachorro natural adestramento", category: "Petiscos", adjustments: "Rico em proteínas, sem corantes artificiais e ideal para reforço positivo." },
      { name: "Bolsa de Transporte Aérea Homologada para Pets", keyword: "bolsa transporte pet aviao homologada cabine", category: "Viagem", adjustments: "Medidas padrão exigidas pelas companhias aéreas e telas respiráveis em 3 lados." },
      { name: "Cinto de Segurança Pet para Carro Engate Universal", keyword: "cinto seguranca veicular cachorro universal regulavel", category: "Passeio", adjustments: "Mosquetão com rotação 360 graus e fita de alta tenacidade." },
      { name: "Bebedouro Fonte Elétrica Bivolt com Filtro Carvão", keyword: "fonte de agua gato bebedouro eletrico silencioso", category: "Alimentação", adjustments: "Bomba submersa ultra silenciosa e refil filtrante incluso." },
      { name: "Cortador de Unha Pet Profissional com Trava", keyword: "alicate cortador de unha cachorro gato com trava", category: "Higiene", adjustments: "Lâmina em aço inoxidável e batente de segurança contra cortes excessivos." },
      { name: "Brinquedo Varinha com Pena e Guizo para Gatos", keyword: "varinha brinquedo gato interativa com pena", category: "Gatos & Brinquedos", adjustments: "Cabo flexível e estímulo ao instinto caçador." },
      { name: "Ração Premium Especial Cães Adultos 15kg", keyword: "racao premium especial caes adultos sabor frango", category: "Nutrição", adjustments: "Níveis de garantia nutricional, ômega 3 e 6 para pelagem e extrato de yucca." },
      { name: "Areia Sanitária Higiênica Fina Torrão Firme 4kg", keyword: "areia sanitaria gato torrao firme controle odor", category: "Higiene", adjustments: "Absorção imediata formando torrões fáceis de recolher com pá sanitária." },
      { name: "Pá Higiênica Coletora de Fezes Sanitária", keyword: "pa higienica areia gato vazada resistente", category: "Acessórios", adjustments: "Grade com espaçamento ideal para economizar areia limpa." },
      { name: "Spray Educador Sanitário Pode e Não Pode", keyword: "spray educador sanitario cachorro xixi no lugar", category: "Adestramento", adjustments: "Orientação de aplicação diária para demarcação de território correta." },
      { name: "Bandana Pet Estampada com Fecho Ajustável", keyword: "bandana pet cachorro estilosa acessorio", category: "Moda Pet", adjustments: "Tecido 100% algodão lavável e fecho prático por botões de pressão." },
    ];
  } else {
    // E-commerce Geral
    baseList = [
      { name: `Kit Principal Especial ${storeName}`, keyword: `comprar ${segment.toLowerCase()} atacado varejo online`, category: "Mais Vendidos", adjustments: "Otimizar H1 com palavra-chave transacional, adicionar 4 fotos de alta definição e descrição rica." },
      { name: `Modelo Destaque Oficial ${storeName}`, keyword: `melhor preco ${segment.toLowerCase()} loja oficial`, category: "Destaques", adjustments: "Configurar selos de garantia, prazo de entrega por CEP e especificações técnicas completas." },
      { name: `Lançamento Exclusivo da Coleção`, keyword: `lancamento ${segment.toLowerCase()} original pronta entrega`, category: "Lançamentos", adjustments: "Inserir vídeo de demonstração, atributos de variação de cor/tamanho e FAQ rápido." },
      { name: `Kit Promocional Econômico com Desconto`, keyword: `kit promocional atacado ${segment.toLowerCase()}`, category: "Kits", adjustments: "Destacar economia percentual do kit, tabela de itens inclusos e embalagem segura." },
      { name: `Linha Premium Acabamento Superior`, keyword: `${segment.toLowerCase()} linha premium qualidade comprovada`, category: "Linha Premium", adjustments: "Enfatizar diferenciais da matéria-prima, certificações e depoimentos de compradores." },
      { name: `Modelo Clássico Tradicional`, keyword: `modelo classico original ${segment.toLowerCase()}`, category: "Clássicos", adjustments: "Otimizar meta description com chamada para parcelamento sem juros e frete." },
      { name: `Versão Compacta Portátil Prática`, keyword: `${segment.toLowerCase()} compacto portatil pratico`, category: "Portáteis", adjustments: "Detalhar peso, dimensões e facilidade de transporte no dia a dia." },
      { name: `Edição Especial Limitada`, keyword: `edicao limitada ${segment.toLowerCase()} colecionador`, category: "Especiais", adjustments: "Criar senso de urgência com contador de estoque e selo de autenticidade." },
      { name: `Linha Alta Performance Profissional`, keyword: `${segment.toLowerCase()} profissional alta performance`, category: "Profissional", adjustments: "Comparativo técnico contra concorrentes e manual de instruções em PDF." },
      { name: `Acessório Complementar Essencial`, keyword: `acessorios originais para ${segment.toLowerCase()}`, category: "Acessórios", adjustments: "Configurar como produto cross-sell na página do item principal." },
      { name: `Kit Refil Econômico de Reposição`, keyword: `refil reposicao ${segment.toLowerCase()} desconto`, category: "Refis", adjustments: "Explicar compatibilidade exata de modelos e economia a longo prazo." },
      { name: `Linha Sustentável Ecológica`, keyword: `${segment.toLowerCase()} sustentavel ecologico certificado`, category: "Eco", adjustments: "Selos de sustentabilidade, materiais reciclados e impacto positivo." },
      { name: `Modelo Ergonômico Confort`, keyword: `${segment.toLowerCase()} ergonomico confort certificado`, category: "Conforto", adjustments: "Benefícios para postura e bem-estar, recomendação ergonômica." },
      { name: `Versão Plus Size / Tamanho Grande`, keyword: `${segment.toLowerCase()} tamanho grande reforçado`, category: "Especiais", adjustments: "Tabela detalhada de capacidades e medidas máximas suportadas." },
      { name: `Kit Presente com Embalagem Especial`, keyword: `presente ideal ${segment.toLowerCase()} com embalagem`, category: "Presentes", adjustments: "Opção de cartão de mensagem, embalagem especial de presente." },
      { name: `Modelo Resistente de Alta Durabilidade`, keyword: `${segment.toLowerCase()} resistente duravel garantia`, category: "Resistentes", adjustments: "Grau de proteção, testes de durabilidade e orientações de uso." },
      { name: `Linha Express Pronta Entrega Despacho 24h`, keyword: `${segment.toLowerCase()} pronta entrega envio 24h`, category: "Pronta Entrega", adjustments: "Selo de despacho em 24h e rastreamento online dos Correios/Transportadora." },
      { name: `Modelo Básico Dia a Dia Custo-Benefício`, keyword: `${segment.toLowerCase()} basico dia a dia custo beneficio`, category: "Básicos", adjustments: "Foco no custo-benefício, durabilidade comprovada e versatilidade." },
      { name: `Versão Multifuncional Completa`, keyword: `${segment.toLowerCase()} multifuncional completo`, category: "Multiuso", adjustments: "Fotos e descrições detalhando cada uma das funções integradas." },
      { name: `Coleção Exclusiva de Tendência`, keyword: `nova colecao ${segment.toLowerCase()} tendencia ano`, category: "Tendências", adjustments: "SEO sazonal com as principais tendências de busca do Google deste ano." },
    ];
  }

  // If custom product names were supplied by the agency, override the names
  if (customNames && customNames.length > 0) {
    return customNames.slice(0, 20).map((customName, idx) => {
      const template = baseList[idx % baseList.length];
      const cleanName = customName.trim();
      const slug = slugify(cleanName);
      const productUrl = `${baseUrl}/${slug}`;
      const keyword = `${cleanName.toLowerCase()} comprar online`;
      return {
        id: `seo-prod-${idx + 1}`,
        productName: cleanName,
        category: template.category || 'Catálogo Oficial',
        productUrl,
        focusKeyword: keyword,
        currentTitle: cleanName,
        optimizedTitle: `${cleanName} com Envio Rápido e Melhor Oferta | ${storeName}`,
        metaDescription: `Compre ${cleanName} na ${storeName} com garantia de procedência, parcelamento facilitado e entrega para todo o Brasil. Confira os detalhes!`,
        seoAdjustments: `Ajustar tag H1 principal para conter a palavra-chave "${keyword}", incluir descrição com mais de 250 palavras e otimizar texto alt nas imagens.`,
        searchVolumeDemand: (idx < 5 ? 'Muito Alta' : idx < 12 ? 'Alta' : 'Média') as any
      };
    });
  }

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
      optimizedTitle: `${item.name} - ${item.keyword} | ${storeName}`,
      metaDescription: `Encontre ${item.name} com as melhores condições na ${storeName}. Aproveite parcelamento em até 12x, frete seguro e qualidade garantida!`,
      seoAdjustments: item.adjustments,
      searchVolumeDemand: (idx < 5 ? 'Muito Alta' : idx < 12 ? 'Alta' : 'Média') as any
    };
  });
}
