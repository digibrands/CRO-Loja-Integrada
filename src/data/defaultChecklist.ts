import { ChecklistArea, StoreAuditData } from '../types';
import { generateDefaultSeoProducts } from '../utils/auditHelpers';

export const DEFAULT_CHECKLIST_AREAS: ChecklistArea[] = [
  {
    id: 1,
    num: "01",
    title: "Layout e Experiência (UX/UI)",
    items: [
      {
        id: "item-1-1",
        areaId: 1,
        areaName: "Layout e Experiência (UX/UI)",
        title: "Identidade visual consistente (logo, cores)",
        status: "ajustar",
        priority: "alta",
        diagnosticFindings: "Cores primárias não possuem padrão harmônico e logotipo precisa de vetorização adequada para boa legibilidade.",
        recommendedAction: "Adequar paleta de cores institucional e padronizar contraste e aplicação do logotipo no cabeçalho.",
        isBanhoDeLojaCandidate: true
      },
      {
        id: "item-1-2",
        areaId: 1,
        areaName: "Layout e Experiência (UX/UI)",
        title: "Design responsivo (mobile e desktop)",
        status: "conforme",
        priority: "media",
        diagnosticFindings: "Estrutura responsiva da Loja Integrada carrega com boa adaptação aos tamanhos de tela mobile.",
        recommendedAction: "Manter monitoramento de espaçamentos no checkout mobile.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-1-3",
        areaId: 1,
        areaName: "Layout e Experiência (UX/UI)",
        title: "Velocidade de carregamento",
        status: "ajustar",
        priority: "alta",
        diagnosticFindings: "Imagens pesadas na home page aumentam o tempo de carregamento inicial acima de 3.2s.",
        recommendedAction: "Otimizar compressão em formato WebP e configurar carregamento assíncrono.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-1-4",
        areaId: 1,
        areaName: "Layout e Experiência (UX/UI)",
        title: "Imagens de produto em boa qualidade e padronizadas",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Fotos com proporções diferentes (quadradas e retangulares misturadas) e fundos não padronizados.",
        recommendedAction: "Padronizar proporção 1:1 com fundo neutro/branco em toda a vitrine.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-1-5",
        areaId: 1,
        areaName: "Layout e Experiência (UX/UI)",
        title: "Banners atualizados, sem promoções vencidas, alinhados à marca e com aparência natural",
        status: "critico",
        priority: "alta",
        diagnosticFindings: "Banner principal desatualizado, baixa resolução e sem chamada para ação (CTA) clara.",
        recommendedAction: "Criação de 1 banner profissional promocional com CTA destacado (incluso no Escopo do Benefício Loja Integrada).",
        isBanhoDeLojaCandidate: true
      },
      {
        id: "item-1-6",
        areaId: 1,
        areaName: "Layout e Experiência (UX/UI)",
        title: "Navegação intuitiva (menu, categorias, busca)",
        status: "conforme",
        priority: "media",
        diagnosticFindings: "Categorias organizadas em menus suspensos de fácil localização.",
        recommendedAction: "Manter hierarquia de categorias primárias e secundárias.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-1-7",
        areaId: 1,
        areaName: "Layout e Experiência (UX/UI)",
        title: "Página inicial comunica a proposta de valor com clareza",
        status: "ajustar",
        priority: "alta",
        diagnosticFindings: "Faltam réguas informativas de vantagens (parcelamento, frete, garantia) acima do primeiro scroll.",
        recommendedAction: "Implementar régua de benefícios e destaques da loja no tema padrão.",
        isBanhoDeLojaCandidate: true
      }
    ]
  },
  {
    id: 2,
    num: "02",
    title: "Catálogo e SEO de Produtos",
    items: [
      {
        id: "item-2-1",
        areaId: 2,
        areaName: "Catálogo e SEO de Produtos",
        title: "Descrições completas e únicas (não copiadas do fabricante)",
        note: "Base para o Top de SEO de 20 produtos",
        status: "critico",
        priority: "alta",
        diagnosticFindings: "Mais de 80% dos produtos utilizam descrições padrão curtas ou copiadas do fornecedor sem palavras-chave estratégicas.",
        recommendedAction: "Reescrever descrições ricas com foco em conversão e SEO para os 20 produtos principais da loja (Incluso no Escopo do Benefício Loja Integrada).",
        isBanhoDeLojaCandidate: true
      },
      {
        id: "item-2-2",
        areaId: 2,
        areaName: "Catálogo e SEO de Produtos",
        title: "Títulos otimizados com palavra-chave principal",
        status: "ajustar",
        priority: "alta",
        diagnosticFindings: "Títulos genéricos sem atributos de busca (ex: 'Camisa Azul' em vez de 'Camisa Polo Masculina Algodão Azul Marinho').",
        recommendedAction: "Otimizar tags de título com estrutura de busca comercial.",
        isBanhoDeLojaCandidate: true
      },
      {
        id: "item-2-3",
        areaId: 2,
        areaName: "Catálogo e SEO de Produtos",
        title: "Categorização e atributos corretos (marca, cor, tamanho)",
        status: "conforme",
        priority: "media",
        diagnosticFindings: "Grade de variações de cor e tamanho devidamente associada no catálogo.",
        recommendedAction: "Revisar filtros na barra lateral para novos lançamentos.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-2-4",
        areaId: 2,
        areaName: "Catálogo e SEO de Produtos",
        title: "URLs amigáveis",
        status: "conforme",
        priority: "baixa",
        diagnosticFindings: "URLs geradas com slug limpo pela plataforma Loja Integrada.",
        recommendedAction: "Evitar alterações em URLs de produtos já indexados sem redirecionamento.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-2-5",
        areaId: 2,
        areaName: "Catálogo e SEO de Produtos",
        title: "Avaliações de clientes ativadas na página do produto",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Módulo nativo de avaliações ativado mas com poucos depoimentos coletados.",
        recommendedAction: "Configurar incentivo de pós-venda para avaliação de pedidos entregues.",
        isBanhoDeLojaCandidate: false
      }
    ]
  },
  {
    id: 3,
    num: "03",
    title: "Pagamento e Checkout",
    items: [
      {
        id: "item-3-1",
        areaId: 3,
        areaName: "Pagamento e Checkout",
        title: "Meios de pagamento configurados (cartão, Pix, boleto)",
        status: "conforme",
        priority: "alta",
        diagnosticFindings: "Gateway de pagamento ativo com opções de Pix com desconto e cartão em até 12x.",
        recommendedAction: "Destacar selos de pagamento seguro no rodapé e checkout transparente.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-3-2",
        areaId: 3,
        areaName: "Pagamento e Checkout",
        title: "Opção de compra sem cadastro obrigatório",
        status: "conforme",
        priority: "media",
        diagnosticFindings: "Fluxo de checkout transparente da Loja Integrada com preenchimento simplificado.",
        recommendedAction: "Manter fluxo ágil sem etapas desnecessárias.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-3-3",
        areaId: 3,
        areaName: "Pagamento e Checkout",
        title: "Carrinho abandonado com fluxo de recuperação (via ferramenta externa de automação, quando houver)",
        status: "critico",
        priority: "alta",
        diagnosticFindings: "Loja perde vendas por não ter disparos automáticos de WhatsApp e e-mail para clientes que desistem no carrinho.",
        recommendedAction: "Implantar automação de recuperação de carrinho via WhatsApp (Oportunidade para Upsell).",
        isBanhoDeLojaCandidate: false
      }
    ]
  },
  {
    id: 4,
    num: "04",
    title: "Envio e Frete",
    items: [
      {
        id: "item-4-1",
        areaId: 4,
        areaName: "Envio e Frete",
        title: "Cálculo automático de frete (CEP/peso/dimensão)",
        status: "conforme",
        priority: "alta",
        diagnosticFindings: "Cálculo de CEP funcionando na página do produto e no carrinho.",
        recommendedAction: "Auditar pesos e cubagens dos produtos para evitar prejuízo no frete.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-4-2",
        areaId: 4,
        areaName: "Envio e Frete",
        title: "Múltiplas opções de transportadora/Correios",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Apenas Correios configurado; faltam integrações com transportadoras privadas mais baratas como Jadlog/Melhor Envio/Frenet.",
        recommendedAction: "Conectar integração com agregadores de frete para baratear custos.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-4-3",
        areaId: 4,
        areaName: "Envio e Frete",
        title: "Frete grátis com regra clara, se aplicável",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Não há régua de barra de progresso de frete grátis para aumentar ticket médio.",
        recommendedAction: "Definir valor de corte (ex: Frete Grátis acima de R$ 199) e exibir banner no topo.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-4-4",
        areaId: 4,
        areaName: "Envio e Frete",
        title: "Prazos de entrega comunicados com clareza",
        status: "conforme",
        priority: "media",
        diagnosticFindings: "Prazos em dias úteis exibidos claramente na simulação de frete.",
        recommendedAction: "Manter precisão nos prazos informados.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-4-5",
        areaId: 4,
        areaName: "Envio e Frete",
        title: "Política de troca/devolução visível e simples",
        status: "ajustar",
        priority: "alta",
        diagnosticFindings: "Página de trocas não está em destaque no rodapé e não explica o prazo legal de 7 dias.",
        recommendedAction: "Inserir página institucional clara de Trocas e Devoluções em conformidade com o CDC.",
        isBanhoDeLojaCandidate: false
      }
    ]
  },
  {
    id: 5,
    num: "05",
    title: "Estrutura Técnica e Integrações",
    items: [
      {
        id: "item-5-1",
        areaId: 5,
        areaName: "Estrutura Técnica e Integrações",
        title: "Domínio próprio configurado",
        status: "critico",
        priority: "alta",
        diagnosticFindings: "Loja ainda opera sob subdomínio temporário (.lojaintegrada.com.br) ou DNS com apontamento incompleto.",
        recommendedAction: "Configurar e apontar DNS do domínio próprio definitivo (Incluso no escopo gratuito de Banho de Loja).",
        isBanhoDeLojaCandidate: true
      },
      {
        id: "item-5-2",
        areaId: 5,
        areaName: "Estrutura Técnica e Integrações",
        title: "SSL ativo",
        status: "conforme",
        priority: "alta",
        diagnosticFindings: "Certificado HTTPS criptografado ativo em todas as páginas da loja.",
        recommendedAction: "Garantir renovação automática contínua.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-5-3",
        areaId: 5,
        areaName: "Estrutura Técnica e Integrações",
        title: "Pixels/tags instalados (Meta, Google)",
        status: "critico",
        priority: "alta",
        diagnosticFindings: "Pixel do Facebook e Google Tag Manager ausentes ou sem disparo de eventos de compra.",
        recommendedAction: "Configuração completa de Meta Pixel e Google Ads Conversion Tags (Oportunidade Upsell).",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-5-4",
        areaId: 5,
        areaName: "Estrutura Técnica e Integrações",
        title: "Integração com ERP/gestão de estoque, se aplicável",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Controle de estoque manual diretamente pelo painel.",
        recommendedAction: "Avaliar integração com Bling ou Tiny ERP para automação fiscal e de estoque.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-5-5",
        areaId: 5,
        areaName: "Estrutura Técnica e Integrações",
        title: "Sistema de emissão de nota fiscal configurado",
        status: "conforme",
        priority: "media",
        diagnosticFindings: "Processo de faturamento manual estruturado pelo lojista.",
        recommendedAction: "Manter emissão em dia com os despachos.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-5-6",
        areaId: 5,
        areaName: "Estrutura Técnica e Integrações",
        title: "Integração com marketplaces via canais nativos da LI (Mercado Livre e Magalu) ou via parceiros",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Loja vende apenas no canal próprio sem explorar a audiência dos marketplaces integrados.",
        recommendedAction: "Ativar integração com canais nativos da LI para Mercado Livre e Magalu (Upsell de Catálogo).",
        isBanhoDeLojaCandidate: false
      }
    ]
  },
  {
    id: 6,
    num: "06",
    title: "Confiança e Prova Social",
    items: [
      {
        id: "item-6-1",
        areaId: 6,
        areaName: "Confiança e Prova Social",
        title: "CNPJ, endereço e contato visíveis",
        status: "ajustar",
        priority: "alta",
        diagnosticFindings: "CNPJ e razão social não constam no rodapé da loja, descumprindo o Decreto do E-commerce (nº 7.962/2013).",
        recommendedAction: "Inserir dados cadastrais completos no rodapé institucional.",
        isBanhoDeLojaCandidate: true
      },
      {
        id: "item-6-2",
        areaId: 6,
        areaName: "Confiança e Prova Social",
        title: "Política de privacidade e termos de uso (LGPD)",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Texto genérico sem termos de consentimento de cookies da LGPD.",
        recommendedAction: "Implementar termos atualizados e aviso de cookies.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-6-3",
        areaId: 6,
        areaName: "Confiança e Prova Social",
        title: "Selos de segurança visíveis",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Selos de segurança e certificados SSL não estão destacados visualmente no rodapé.",
        recommendedAction: "Adicionar selos de compra segura no rodapé e páginas de checkout.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-6-4",
        areaId: 6,
        areaName: "Confiança e Prova Social",
        title: "Avaliações de produtos/loja via módulo nativo de avaliações da LI (ativado e em uso), além de reputação externa (Google, Reclame Aqui)",
        status: "critico",
        priority: "alta",
        diagnosticFindings: "Inexistência de depoimentos e fotos de clientes reais recebendo mercadorias.",
        recommendedAction: "Estruturar programa de coleta de provas sociais com fotos de compradores.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-6-5",
        areaId: 6,
        areaName: "Confiança e Prova Social",
        title: "Canais de atendimento claros e responsivos",
        status: "conforme",
        priority: "alta",
        diagnosticFindings: "Botão flutuante de WhatsApp e e-mail de suporte presentes na loja.",
        recommendedAction: "Inserir horário fixo de atendimento para alinhar expectativas do comprador.",
        isBanhoDeLojaCandidate: false
      }
    ]
  },
  {
    id: 7,
    num: "07",
    title: "Analytics e Tráfego",
    items: [
      {
        id: "item-7-1",
        areaId: 7,
        areaName: "Analytics e Tráfego",
        title: "Google Analytics/Search Console configurados",
        status: "critico",
        priority: "alta",
        diagnosticFindings: "Google Analytics 4 (GA4) e Google Search Console não estão vinculados à loja.",
        recommendedAction: "Configuração completa de GA4 com e-commerce aprimorado e Search Console.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-7-2",
        areaId: 7,
        areaName: "Analytics e Tráfego",
        title: "Origem de tráfego identificada (orgânico, pago, social, direto)",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Lojista não possui relatórios de acompanhamento de canais de aquisição de tráfego.",
        recommendedAction: "Criar painel de visualização de métricas de aquisição.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-7-3",
        areaId: 7,
        areaName: "Analytics e Tráfego",
        title: "Mix de tráfego — dependência excessiva de um único canal é risco",
        status: "ajustar",
        priority: "alta",
        diagnosticFindings: "100% dos visitantes dependem de divulgação manual no feed de rede social própria.",
        recommendedAction: "Diversificar canais com Google Shopping e Tráfego Pago estruturado.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-7-4",
        areaId: 7,
        areaName: "Analytics e Tráfego",
        title: "Uso de tráfego pago (Google/redes sociais)",
        status: "critico",
        priority: "alta",
        diagnosticFindings: "Loja não investe em anúncios pagos para alimentar o funil com novos compradores.",
        recommendedAction: "Gestão profissional de campanhas de Meta Ads & Google Shopping (Proposta Upsell).",
        isBanhoDeLojaCandidate: false
      }
    ]
  },
  {
    id: 8,
    num: "08",
    title: "Redes Sociais e Presença Digital",
    items: [
      {
        id: "item-8-1",
        areaId: 8,
        areaName: "Redes Sociais e Presença Digital",
        title: "Perfis ativos (Instagram/Facebook) com bio e link para a loja",
        status: "conforme",
        priority: "media",
        diagnosticFindings: "Perfil no Instagram com bio informativa e link direto para a loja online.",
        recommendedAction: "Utilizar catálogo do Instagram Shopping para taguear produtos em postagens.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-8-2",
        areaId: 8,
        areaName: "Redes Sociais e Presença Digital",
        title: "Frequência de postagem consistente (não abandonado)",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Postagens esporádicas com hiatos de mais de 15 dias sem conteúdo novo.",
        recommendedAction: "Criar cronograma editorial com pelo menos 3 postagens semanais e stories diários.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-8-3",
        areaId: 8,
        areaName: "Redes Sociais e Presença Digital",
        title: "WhatsApp Business configurado para atendimento",
        status: "conforme",
        priority: "alta",
        diagnosticFindings: "Conta comercial com catálogo e mensagem de ausência básica configurada.",
        recommendedAction: "Estruturar respostas rápidas para dúvidas frequentes de frete e prazos.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-8-4",
        areaId: 8,
        areaName: "Redes Sociais e Presença Digital",
        title: "Google Meu Negócio criado e atualizado",
        status: "ajustar",
        priority: "baixa",
        diagnosticFindings: "Empresa não possui perfil do Google Perfil de Empresas cadastrado para buscas locais.",
        recommendedAction: "Criar e validar perfil no Google Meu Negócio.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-8-5",
        areaId: 8,
        areaName: "Redes Sociais e Presença Digital",
        title: "Identidade visual consistente entre loja e redes sociais",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Divergência de fontes e paleta entre os posts do Instagram e o layout da loja.",
        recommendedAction: "Alinhar o kit de marca visual da loja ao feed do Instagram.",
        isBanhoDeLojaCandidate: true
      },
      {
        id: "item-8-6",
        areaId: 8,
        areaName: "Redes Sociais e Presença Digital",
        title: "Engajamento real (curtidas, comentários) vs. seguidores comprados/inativos",
        status: "conforme",
        priority: "baixa",
        diagnosticFindings: "Comunidade orgânica e engajamento condizente com a base de seguidores.",
        recommendedAction: "Interagir prontamente com comentários e directs.",
        isBanhoDeLojaCandidate: false
      }
    ]
  },
  {
    id: 9,
    num: "09",
    title: "Precificação e Promoções",
    items: [
      {
        id: "item-9-1",
        areaId: 9,
        areaName: "Precificação e Promoções",
        title: "Preços competitivos frente a concorrentes/marketplaces",
        status: "conforme",
        priority: "media",
        diagnosticFindings: "Preços alinhados à faixa de mercado no segmento.",
        recommendedAction: "Monitorar oscilações de concorrentes diretos.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-9-2",
        areaId: 9,
        areaName: "Precificação e Promoções",
        title: "Margem considera frete, taxas de gateway e impostos",
        status: "ajustar",
        priority: "alta",
        diagnosticFindings: "Margens de contribuição não detalham as taxas de parcelamento do gateway.",
        recommendedAction: "Estruturar planilha de precificação com custo real de venda por canal.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-9-3",
        areaId: 9,
        areaName: "Precificação e Promoções",
        title: "Cupons ou promoções ativas configuradas corretamente",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Não há cupom de primeira compra ou pop-up de captura de lead ativo.",
        recommendedAction: "Configurar cupom de boas-vindas com desconto de 5% ou 10% no primeiro pedido.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-9-4",
        areaId: 9,
        areaName: "Precificação e Promoções",
        title: "Estratégia de frete embutido no preço, se aplicável",
        status: "conforme",
        priority: "baixa",
        diagnosticFindings: "Precificação transparente com frete calculado separadamente.",
        recommendedAction: "Avaliar testes de frete grátis embutido em kits promocionais.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-9-5",
        areaId: 9,
        areaName: "Precificação e Promoções",
        title: "Calendário sazonal/datas comemorativas planejado com antecedência",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Loja sem campanhas antecipadas para próximas datas comerciais do calendário.",
        recommendedAction: "Planejar campanhas sazonais com 30 dias de antecedência.",
        isBanhoDeLojaCandidate: false
      }
    ]
  },
  {
    id: 10,
    num: "10",
    title: "Atendimento e Experiência do Cliente",
    items: [
      {
        id: "item-10-1",
        areaId: 10,
        areaName: "Atendimento e Experiência do Cliente",
        title: "Tempo de resposta no atendimento (WhatsApp/chat/e-mail)",
        status: "conforme",
        priority: "alta",
        diagnosticFindings: "Respostas no WhatsApp dentro de 15 minutos em horário comercial.",
        recommendedAction: "Configurar bot de triagem para horários noturnos e finais de semana.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-10-2",
        areaId: 10,
        areaName: "Atendimento e Experiência do Cliente",
        title: "Script ou processo de atendimento pré-venda estruturado",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Atendimento reativo sem roteiro para quebra de objeções ou sugestão de produtos adicionais.",
        recommendedAction: "Desenvolver script de atendimento consultivo para aumento de ticket.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-10-3",
        areaId: 10,
        areaName: "Atendimento e Experiência do Cliente",
        title: "Acompanhamento pós-venda (confirmação, rastreio, suporte)",
        status: "ajustar",
        priority: "alta",
        diagnosticFindings: "Comunicações de rastreio limitadas aos e-mails transacionais básicos da plataforma.",
        recommendedAction: "Implantar disparos de status de entrega diretamente no WhatsApp.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-10-4",
        areaId: 10,
        areaName: "Atendimento e Experiência do Cliente",
        title: "Processo de troca/devolução claro e sem atrito para o cliente",
        status: "conforme",
        priority: "media",
        diagnosticFindings: "Atendimento direto com logística reversa orientada ao comprador.",
        recommendedAction: "Manter processo documentado e transparente.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-10-5",
        areaId: 10,
        areaName: "Atendimento e Experiência do Cliente",
        title: "Canais de atendimento centralizados (não dispersos sem controle)",
        status: "conforme",
        priority: "media",
        diagnosticFindings: "WhatsApp e e-mail integrados em equipe centralizada.",
        recommendedAction: "Monitorar fila e histórico de conversas.",
        isBanhoDeLojaCandidate: false
      }
    ]
  },
  {
    id: 11,
    num: "11",
    title: "Histórico e Comportamento de Vendas",
    items: [
      {
        id: "item-11-1",
        areaId: 11,
        areaName: "Histórico e Comportamento de Vendas",
        title: "Data da última venda e volume nos últimos 30/60/90 dias",
        status: "ajustar",
        priority: "alta",
        diagnosticFindings: "Volume de vendas instável com quedas nos últimos 30 dias devido à baixa tração de tráfego.",
        recommendedAction: "Trabalhar ações de reativação de base de clientes e anúncios pontuais.",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-11-2",
        areaId: 11,
        areaName: "Histórico e Comportamento de Vendas",
        title: "Principais gargalos identificados (tráfego sem conversão, carrinho abandonado)",
        status: "critico",
        priority: "alta",
        diagnosticFindings: "Taxa de conversão estimada em 0.4% (abaixo da média de 1.2% do e-commerce nacional).",
        recommendedAction: "Executar o Top 1 (Escopo do Benefício Loja Integrada) para elevar confiança e reduzir atritos visuais.",
        isBanhoDeLojaCandidate: true
      },
      {
        id: "item-11-3",
        areaId: 11,
        areaName: "Histórico e Comportamento de Vendas",
        title: "Tentativas anteriores de divulgação e canais usados",
        status: "ajustar",
        priority: "media",
        diagnosticFindings: "Investimentos pontuais anteriores sem tagueamento de conversão correto.",
        recommendedAction: "Reestruturar presença digital e métricas de retorno sobre investimento (ROAS).",
        isBanhoDeLojaCandidate: false
      },
      {
        id: "item-11-4",
        areaId: 11,
        areaName: "Histórico e Comportamento de Vendas",
        title: "Capacidade operacional para sustentar o volume de vendas buscado (estoque, expedição, pós-venda)",
        status: "conforme",
        priority: "alta",
        diagnosticFindings: "Lojista possui pronta entrega e capacidade física para triplicar despachos diários.",
        recommendedAction: "Acelerar atração de tráfego para preencher capacidade ociosa de faturamento.",
        isBanhoDeLojaCandidate: false
      }
    ]
  }
];

export const INITIAL_SAMPLE_STORE: StoreAuditData = {
  id: "store-sample-aura-01",
  storeName: "Aura Moda & Acessórios",
  sellerName: "Carlos Eduardo Silva",
  sellerWhatsapp: "(11) 98765-4321",
  sellerEmail: "carlos.aura@gmail.com",
  storeUrl: "https://auramoda.lojaintegrada.com.br",
  segment: "Moda Feminina e Acessórios",
  registeredDate: new Date().toISOString().split('T')[0],
  firstContactDate: new Date().toISOString().split('T')[0],
  status: "contato_iniciado",
  contactAttempts: 1,
  item11_1SalesData: "Última venda: há 4 dias (28/08/2026). Volume: 18 pedidos nos últimos 30 dias, 35 pedidos nos 60 dias e 52 pedidos nos 90 dias.",
  
  overallScore: 58,
  totalConforme: 19,
  totalAjustar: 19,
  totalCritico: 8,
  totalNaoAplicavel: 0,
  executiveSummary: "A loja possui excelente mix de produtos e capacidade operacional de expedição. Identificamos como prioritário o Top 1 - (ESCOPO BENEFICIO LOJA INTEGRADA) com adequação do layout padrão + 1 banner, SEO dos 20 produtos principais e configuração de domínio, além de oportunidades de expansão no Top 2 e 3 (execução opcional seller mediante orçamento).",
  strengths: [
    "Pronta entrega com capacidade operacional para escala",
    "Checkout e meios de pagamento principais ativados",
    "Atendimento ágil via WhatsApp comercial"
  ],
  urgentBottlenecks: [
    "Operação ainda em subdomínio .lojaintegrada.com.br (prejudica credibilidade)",
    "Banners desatualizados e sem chamada para ação comercial",
    "Descrições de produtos sem otimização de SEO para o Google",
    "Ausência de tagueamento de conversões no Meta Pixel e Google Ads"
  ],
  
  areas: DEFAULT_CHECKLIST_AREAS,
  
  top1: {
    title: "Top 1 — Essencial (BENEFICIO LOJA INTEGRADA)",
    includedItems: {
      layoutStandardAndBanner: true,
      seo20Products: true,
      domainConfiguration: true
    },
    details: "Execução pela Agência Parceira DigiBrands dentro do escopo do benefício Loja Integrada: 1) Adequação do layout padrão da plataforma com paleta harmônica + criação de 1 Banner Principal promocional de alto impacto com CTA; 2) Otimização completa de títulos e descrições ricas com SEO para os 20 produtos principais; 3) Configuração e apontamento de DNS do Domínio Próprio (.com.br) com certificado de segurança SSL.",
    bannerSpecs: "Banner Desktop 1920x600px e Mobile 600x600px com oferta de Coleção Atual e cupom de boas-vindas.",
    seoProductsList: [
      "Vestido Midi Floral Primavera",
      "Calça Pantalona Linho Elegance",
      "Blusa Viscose Decote V",
      "Conjunto Alfaiataria Feminino",
      "Brinco Argola Banhado a Ouro",
      "Bolsa Transversal Couro Sintético",
      "Camisa Social Manga Longa",
      "Saia Plissada Cintura Alta",
      "Regata Seda Premium",
      "Casaco Sobretudo Inverno",
      "Cardigan Tricô Alongado",
      "Short Jeans Cintura Alta",
      "Colar Choker Pérolas",
      "Cinto Feminino Fivela Dourada",
      "Vestido Longo Festa Cetim",
      "Blazer Feminino Estruturado",
      "T-shirt Algodão Egípcio",
      "Macaquinho Casual Estampado",
      "Jaqueta Jeans Destroyed",
      "Scarpin Clássico Salto Médio"
    ],
    domainName: "auramoda.com.br",
    executionStatus: "em_andamento",
    isFreeBenefit: true
  },

  seoProducts: generateDefaultSeoProducts("Aura Moda & Acessórios", "Moda Feminina e Acessórios", [
    "Vestido Midi Floral Primavera",
    "Calça Pantalona Linho Elegance",
    "Blusa Viscose Decote V",
    "Conjunto Alfaiataria Feminino",
    "Brinco Argola Banhado a Ouro",
    "Bolsa Transversal Couro Sintético",
    "Camisa Social Manga Longa",
    "Saia Plissada Cintura Alta",
    "Regata Seda Premium",
    "Casaco Sobretudo Inverno",
    "Cardigan Tricô Alongado",
    "Short Jeans Cintura Alta",
    "Colar Choker Pérolas",
    "Cinto Feminino Fivela Dourada",
    "Vestido Longo Festa Cetim",
    "Blazer Feminino Estruturado",
    "T-shirt Algodão Egípcio",
    "Macaquinho Casual Estampado",
    "Jaqueta Jeans Destroyed",
    "Scarpin Clássico Salto Médio"
  ]),
  
  top2: {
    id: "top2",
    title: "Top 2 — Automação de Recuperação de Carrinho Abandonado & WhatsApp Pro",
    areaName: "Pagamento e Checkout / Atendimento",
    hookDiagnostico: "Identificado na auditoria que a loja perde cerca de 70% das pessoas que iniciam o checkout mas não concluem, sem nenhum fluxo automático de reengajamento.",
    proposedSolution: "Implantação de régua de automação inteligente via WhatsApp e e-mail: disparo em 15 minutos, 24 horas e 48 horas com recuperação de carrinho, aviso de estoque e cupom de urgência.",
    commercialPitch: "Recupere até 25% das vendas perdidas automaticamente todos os meses sem precisar gastar mais em anúncios.",
    estimatedPrice: 650,
    estimatedDays: 4,
    expectedImpact: "+18% a +25% de aumento imediato no faturamento mensal sobre os carrinhos recuperados.",
    sellerDecision: "em_negociacao"
  },
  
  top3: {
    id: "top3",
    title: "Top 3 — Configuração de Analytics GA4, Meta Pixel & Gestão de Tráfego Pago",
    areaName: "Analytics e Tráfego / Estrutura Técnica",
    hookDiagnostico: "Loja não possui GA4 nem Pixel configurados com eventos de compra, operando às cegas sem campanhas de tráfego pago ativas.",
    proposedSolution: "Instalação do Google Tag Manager com GA4 E-commerce, Meta Pixel com API de Conversões (CAPI) e lançamento da primeira campanha no Google Shopping e Meta Ads.",
    commercialPitch: "Construa um fluxo constante e previsível de novos clientes todos os dias com rastreamento preciso de cada real investido.",
    estimatedPrice: 980,
    estimatedDays: 7,
    expectedImpact: "Atração qualificada de 1.500 a 3.000 novos visitantes segmentados no primeiro mês.",
    sellerDecision: "em_negociacao"
  },
  
  beforeAfterNotes: {
    layoutBeforeDesc: "Layout padrão cru, sem banner institucional e com subdomínio temporário auramoda.lojaintegrada.com.br.",
    layoutAfterDesc: "Layout estilizado com paleta da marca, 1 banner promocional de alto impacto e domínio próprio configurado.",
    seoBeforeDesc: "Títulos genéricos (ex: 'Vestido 01') e descrições vazias sem palavras-chave.",
    seoAfterDesc: "20 produtos com títulos otimizados para busca do Google, descrições ricas, tabela de medidas e termos de conversão.",
    domainBeforeDesc: "auramoda.lojaintegrada.com.br",
    domainAfterDesc: "www.auramoda.com.br com SSL ativo"
  },
  
  clientApprovalNote: "Lojista informou por WhatsApp que aprovou as alterações do Top 1 e solicitou proposta detalhada do Top 2.",
  
  nfStatus: {
    eligible: true,
    amount: 100.00,
    referenceMonth: "09/2026",
    cnaeCode: "7319-0/02",
    serviceCode: "17.06"
  }
};
