export type ItemStatus = 'conforme' | 'ajustar' | 'critico' | 'nao_aplicavel';

export type LeadStatus = 
  | 'aguardando_inicio'
  | 'primeiro_contato_atrasado'
  | 'contato_iniciado'
  | 'aguardando_material'
  | 'nao_retornou_contato'
  | 'em_execucao'
  | 'aguardando_aprovacao'
  | 'concluida'
  | 'comprovante_recusado'
  | 'lojista_desistiu'
  | 'beneficio_expirado'
  | 'pagamento_liberado';

export interface ChecklistItem {
  id: string;
  areaId: number;
  areaName: string;
  title: string;
  note?: string;
  flag?: string;
  status: ItemStatus;
  priority: 'alta' | 'media' | 'baixa';
  diagnosticFindings: string;
  recommendedAction: string;
  riskIfNotFixed?: string; // Impacto se não for ajustado / consertado (Requisito 2)
  benefitIfFixed?: string; // Benefício em caso de correção (Requisito 2)
  deadlineText?: string; // Prazo estimado de correção (Requisito 5)
  isBanhoDeLojaCandidate?: boolean; // Contemplado pelo Escopo do Benefício Loja Integrada
}

export interface ChecklistArea {
  id: number;
  num: string;
  title: string;
  items: ChecklistItem[];
}

export interface SeoProductItem {
  id: string;
  productName: string;
  category?: string;
  productUrl?: string; // URL exata do produto no site da loja
  focusKeyword: string; // Palavra-chave foco no Google Search
  currentTitle?: string;
  optimizedTitle: string; // Título otimizado para H1 / Title Tag / Busca
  metaDescription: string; // Descrição de busca para atrair cliques (CTR)
  seoAdjustments: string; // Apontamentos detalhados de SEO (Alt das imagens, URL, atributos, tags)
  searchVolumeDemand?: 'Muito Alta' | 'Alta' | 'Média';
}

export interface Top1BeneficioLojaIntegrada {
  title: string;
  includedItems: {
    layoutStandardAndBanner: boolean;
    seo20Products: boolean;
    domainConfiguration: boolean;
  };
  details: string;
  bannerSpecs?: string;
  seoProductsList?: string[];
  domainName?: string;
  executionStatus: 'pendente' | 'em_andamento' | 'concluido';
  isFreeBenefit: true;
}

// Alias for backwards compatibility
export type Top1BanhoDeLoja = Top1BeneficioLojaIntegrada;

export interface TopUpsellProposal {
  id: 'top2' | 'top3';
  title: string;
  areaName: string;
  hookDiagnostico: string;
  proposedSolution: string;
  commercialPitch: string;
  estimatedPrice: number;
  estimatedDays: number;
  expectedImpact: string;
  sellerDecision: 'em_negociacao' | 'aceito' | 'recusado' | 'postergado';
}

export interface StoreAuditData {
  id: string;
  storeName: string;
  sellerName: string;
  sellerWhatsapp: string;
  sellerEmail: string;
  storeUrl: string;
  segment: string;
  registeredDate: string;
  firstContactDate?: string;
  status: LeadStatus;
  contactAttempts: number;
  item11_1SalesData?: string; // Data da última venda e volume nos últimos 30/60/90 dias preenchido pela agência
  
  // Executive Summary & Scores
  overallScore: number; // 0 - 100
  totalConforme: number;
  totalAjustar: number;
  totalCritico: number;
  totalNaoAplicavel: number;
  executiveSummary: string;
  strengths: string[];
  urgentBottlenecks: string[];
  
  // 11 Areas with 46 items
  areas: ChecklistArea[];
  
  // Action Plan
  top1: Top1BeneficioLojaIntegrada;
  top2: TopUpsellProposal;
  top3: TopUpsellProposal;

  // SEO Products Analysis (Requisito 6)
  seoProducts?: SeoProductItem[];
  
  // Proof of delivery
  beforeAfterNotes: {
    layoutBeforeDesc?: string;
    layoutAfterDesc?: string;
    seoBeforeDesc?: string;
    seoAfterDesc?: string;
    domainBeforeDesc?: string;
    domainAfterDesc?: string;
  };
  clientApprovalNote?: string;
  nfStatus?: {
    eligible: boolean;
    amount: number; // R$ 100,00
    referenceMonth: string;
    cnaeCode: string;
    serviceCode: string;
  };
}

export interface AnalysisPromptRequest {
  storeUrl: string;
  storeName: string;
  sellerName: string;
  sellerWhatsapp?: string;
  sellerEmail?: string;
  segment?: string;
  notes?: string;
  rawHtmlSnippet?: string;
  item11_1SalesData?: string;
  customProductsText?: string;
}
