import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { generateDefaultSeoProducts, isGenericPlaceholder, generateNaturalKeyword, hasNoSalesInPeriods, formatItem11_1 } from "./src/utils/auditHelpers";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Mock responses or AI errors may occur.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Agência Parceira DigiBrands - Loja Integrada Diagnosis API",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Real URL Live Store Inspector
 * Connects directly to the store URL to analyze DOM, meta tags, scripts, banners, products, and checkout elements.
 */
async function inspectStoreOnline(rawUrl: string): Promise<{
  isOnline: boolean;
  statusCode?: number;
  finalUrl?: string;
  hasSsl: boolean;
  isCustomDomain: boolean;
  title?: string;
  description?: string;
  hasBanners: boolean;
  bannerCount: number;
  hasProducts: boolean;
  productCount: number;
  hasWhatsapp: boolean;
  hasPixel: boolean;
  hasGa4: boolean;
  hasGtm: boolean;
  paymentMethods: string[];
  securitySeals: string[];
  hasCnpj: boolean;
  hasExchangePolicy: boolean;
  hasPrivacyPolicy: boolean;
  socialLinks: string[];
  rawSummary: string;
  detectedProductNames: string[];
}> {
  let targetUrl = rawUrl.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  const result = {
    isOnline: false,
    statusCode: 0,
    finalUrl: targetUrl,
    hasSsl: targetUrl.startsWith("https://"),
    isCustomDomain: !targetUrl.includes("lojaintegrada.com.br"),
    title: "",
    description: "",
    hasBanners: false,
    bannerCount: 0,
    hasProducts: false,
    productCount: 0,
    hasWhatsapp: false,
    hasPixel: false,
    hasGa4: false,
    hasGtm: false,
    paymentMethods: [] as string[],
    securitySeals: [] as string[],
    hasCnpj: false,
    hasExchangePolicy: false,
    hasPrivacyPolicy: false,
    socialLinks: [] as string[],
    rawSummary: "",
    detectedProductNames: [] as string[],
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    result.statusCode = response.status;
    result.finalUrl = response.url || targetUrl;
    result.hasSsl = result.finalUrl.startsWith("https://");
    result.isCustomDomain = !result.finalUrl.includes("lojaintegrada.com.br");

    if (response.ok || response.status === 200 || response.status === 301 || response.status === 302) {
      result.isOnline = true;
      const html = await response.text();

      // Extract Title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) result.title = titleMatch[1].trim();

      // Extract Meta Description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      if (descMatch) result.description = descMatch[1].trim();

      // Detect Banners
      const bannerMatches = html.match(/(class=["'][^"']*(?:banner|slider|carousel|slide)[^"']*["']|<div[^>]*id=["'][^"']*banner[^"']*["'])/gi);
      result.bannerCount = bannerMatches ? bannerMatches.length : 0;
      result.hasBanners = result.bannerCount > 0 || /banner/i.test(html);

      // Detect Products on Home & Extract Real Product Names
      const prodMatches = html.match(/(class=["'][^"']*(?:produto|item-produto|product-box|listagem-item|vitrine)[^"']*["'])/gi);
      result.productCount = prodMatches ? Math.min(prodMatches.length, 60) : 0;
      result.hasProducts = result.productCount > 0 || /preco-promocional|valor-de|preco-por/i.test(html);

      const detectedList: string[] = [];
      const seenNames = new Set<string>();

      const addCandidateName = (rawText: string) => {
        if (!rawText) return;
        const cleaned = rawText
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, " ")
          .trim();
        if (cleaned.length < 5 || cleaned.length > 90) return;
        if (isGenericPlaceholder(cleaned)) return;
        const lower = cleaned.toLowerCase();
        const nonProdWords = ["início", "carrinho", "contato", "sobre nós", "fale conosco", "cadastre-se", "minha conta", "compre agora", "frete grátis", "todos os direitos", "loja integrada", "whatsapp"];
        if (nonProdWords.some(w => lower === w || lower.startsWith(w + " ") || lower.endsWith(" " + w))) return;
        if (/^r\$\s*[0-9]+/i.test(cleaned)) return;
        if (seenNames.has(lower)) return;
        seenNames.add(lower);
        detectedList.push(cleaned);
      };

      // 1. JSON-LD schema
      const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      if (jsonLdMatches) {
        for (const jm of jsonLdMatches) {
          try {
            const rawJson = jm.replace(/<script[^>]*>|<\/script>/gi, "");
            const parsed = JSON.parse(rawJson);
            const checkObj = (obj: any) => {
              if (!obj) return;
              if (obj["@type"] === "Product" && obj.name) addCandidateName(obj.name);
              if (obj.itemListElement && Array.isArray(obj.itemListElement)) {
                obj.itemListElement.forEach((el: any) => {
                  if (el?.item?.name) addCandidateName(el.item.name);
                  else if (el?.name) addCandidateName(el.name);
                });
              }
            };
            if (Array.isArray(parsed)) parsed.forEach(checkObj);
            else checkObj(parsed);
          } catch { }
        }
      }

      // 2. Loja Integrada .nome-produto tags
      const liNameRegex = /class=["'][^"']*\bnome-produto\b[^"']*["'][^>]*>([\s\S]*?)<\//gi;
      let m: RegExpExecArray | null;
      while ((m = liNameRegex.exec(html)) !== null) {
        addCandidateName(m[1]);
      }

      // 3. Product anchor tags with title
      const aTitleRegex = /<a[^>]*class=["'][^"']*(?:produto|item-produto)[^"']*["'][^>]*title=["']([^"']+)["']/gi;
      while ((m = aTitleRegex.exec(html)) !== null) {
        addCandidateName(m[1]);
      }

      result.detectedProductNames = detectedList.slice(0, 20);
      if (result.detectedProductNames.length > 0) {
        result.productCount = Math.max(result.productCount, result.detectedProductNames.length);
      }

      // Detect WhatsApp Chat
      result.hasWhatsapp = /wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|whatsapp-button|jivo/i.test(html);

      // Detect Trackers
      result.hasPixel = /connect\.facebook\.net|fbq\(|facebook-jssdk/i.test(html);
      result.hasGa4 = /googletagmanager\.com\/gtag\/js|G-[A-Z0-9]{6,12}/i.test(html);
      result.hasGtm = /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i.test(html);

      // Detect Payment Badges
      const payments = [];
      if (/mercado\s*pago/i.test(html)) payments.push("Mercado Pago");
      if (/paghiper|pagar\.me|yapay/i.test(html)) payments.push("PagHiper/Yapay");
      if (/pagseguro/i.test(html)) payments.push("PagSeguro");
      if (/pix/i.test(html)) payments.push("Pix");
      if (/cartao|cartão|visa|mastercard|elo/i.test(html)) payments.push("Cartão de Crédito");
      if (/boleto/i.test(html)) payments.push("Boleto Bancário");
      result.paymentMethods = Array.from(new Set(payments));

      // Detect Security Seals
      const seals = [];
      if (/letsencrypt|comodo|alphassl|google-site-verification|site-seguro|selo-seguranca/i.test(html)) seals.push("Selo de Segurança");
      if (/reclameaqui|ebit|trustvox|opinioes-verificadas/i.test(html)) seals.push("Avaliações/Ebit/ReclameAqui");
      result.securitySeals = seals;

      // CNPJ in Footer
      result.hasCnpj = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|cnpj/i.test(html);

      // Policy Pages
      result.hasExchangePolicy = /troca|devolu/i.test(html);
      result.hasPrivacyPolicy = /privacidade|lgpd|termos/i.test(html);

      // Social Links
      const socials = [];
      if (/instagram\.com\/[a-zA-Z0-9._]+/i.test(html)) socials.push("Instagram");
      if (/facebook\.com\/[a-zA-Z0-9._]+/i.test(html)) socials.push("Facebook");
      if (/tiktok\.com\/@[a-zA-Z0-9._]+/i.test(html)) socials.push("TikTok");
      if (/youtube\.com\/[a-zA-Z0-9._]+/i.test(html)) socials.push("YouTube");
      result.socialLinks = socials;

      result.rawSummary = `Status HTTP: ${result.statusCode} (Online). Domínio: ${result.isCustomDomain ? 'Próprio' : 'Subdomínio Loja Integrada'}. SSL: ${result.hasSsl ? 'Ativo (HTTPS)' : 'Inativo'}. Título: "${result.title || 'Não definido'}". Meta Descrição: "${result.description ? 'Presente' : 'Ausente'}". Produtos detectados: ~${result.productCount}. Banners: ${result.hasBanners ? 'Detectados' : 'Ausentes ou incompletos'}. WhatsApp no site: ${result.hasWhatsapp ? 'Sim' : 'Não'}. Pixel Meta: ${result.hasPixel ? 'Instalado' : 'Ausente'}. GA4/GTM: ${result.hasGa4 || result.hasGtm ? 'Instalado' : 'Ausente'}. CNPJ no rodapé: ${result.hasCnpj ? 'Sim' : 'Não'}. Política de Trocas: ${result.hasExchangePolicy ? 'Presente' : 'Ausente'}. Meios de pagamento identificados: ${result.paymentMethods.join(', ') || 'Básicos'}.`;
    }
  } catch (err: any) {
    console.warn(`Online inspection for ${targetUrl} had error/timeout:`, err?.message || err);
    result.rawSummary = `Não foi possível obter resposta direta do servidor (${err?.message || 'timeout'}). A auditoria seguirá com base na estrutura da URL e dados informados.`;
  }

  return result;
}

// Store Diagnosis Analysis Endpoint
app.post("/api/analyze", async (req, res) => {
  const {
    storeUrl,
    storeName,
    sellerName,
    sellerWhatsapp,
    sellerEmail,
    segment,
    notes,
    rawHtmlSnippet,
    item11_1SalesData,
    customProductsText,
  } = req.body;

  // Perform live store inspection
  console.log(`🔍 Iniciando inspeção real da loja: ${storeUrl} (${storeName})...`);
  const inspection = await inspectStoreOnline(storeUrl || "");
  console.log(`📊 Laudo da inspeção online:`, inspection.rawSummary);

  const candidateModels = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.5-pro"];

  const systemPrompt = `Você é o Especialista Sênior de Auditoria e Diagnóstico de E-commerce da AGÊNCIA PARCEIRA DIGIBRANDS - (51) 2165-6224 | www.digibrands.com.br, parceira oficial da Loja Integrada.
Você acabou de realizar uma inspeção técnica e visual minuciosa acessando a URL da loja online do cliente.
Sua missão é gerar um laudo de diagnóstico extremamente humano, criterioso, detalhado e profissional, avaliando todos os 46 critérios das 11 áreas vitais do e-commerce.

DIRETRIZES ESSENCIAIS E OBRIGATÓRIAS:
1. Resumo Executivo e Terminologia:
   - Deve conter explicitamente: "Top 1 - (ESCOPO BENEFICIO LOJA INTEGRADA)" e "Top 2 e 3 (execução opcional seller mediante orçamento)".
   - NUNCA utilize o termo "Banho de Loja" em nenhuma parte do documento; utilize SEMPRE "Escopo do Benefício Loja Integrada" ou "Top 1 — Essencial (BENEFICIO LOJA INTEGRADA)".

2. Top 1 — Essencial (BENEFICIO LOJA INTEGRADA):
   - Escopo 100% garantido e executado pela DigiBrands:
     * Adequação do layout padrão da Loja Integrada + 1 Banner Promocional profissional com CTA
     * SEO Estratégico dos 20 produtos principais (títulos atrativos e descrições ricas)
     * Configuração e apontamento de Domínio Próprio com SSL
   - Nos itens do checklist que fazem parte desse escopo, marque isBanhoDeLojaCandidate: true.

3. Para itens com status AJUSTAR ou CRÍTICO:
   - Além do diagnóstico (diagnosticFindings) e da recomendação (recommendedAction), é OBRIGATÓRIO fornecer:
     * riskIfNotFixed: O impacto/risco negativo direto nas vendas, tráfego ou credibilidade se NÃO for corrigido.
     * benefitIfFixed: O benefício mensurável e ganho de conversão em caso de correção.
     * deadlineText: Prazo de correção (conforme regra abaixo).

4. Prazos Oficiais para Correção (deadlineText):
   - Itens do escopo do benefício Loja Integrada: "Prazo Imediato (Escopo do Benefício Loja Integrada)"
   - Itens CRÍTICOS fora do benefício: "Necessário correção no prazo de 7 a 15 dias (deve ser corrigido nesse prazo)"
   - Itens AJUSTAR fora do benefício: "Prazo de 15 a 30 dias"
   - Itens CONFORME: "Monitoramento contínuo"

5. Item 11.1 ("Data da última venda e volume nos últimos 30/60/90 dias"):
   - REGRA OBRIGATÓRIA: Sempre que a loja não tiver vendas nos últimos 30, 60 ou 90 dias (ou se o campo de vendas estiver vazio, indicar 0 vendas em 30/60/90 dias, sem vendas ou estagnação), o status deste item 11.1 OBRIGATORIAMENTE deve ser "ajustar".
   - O diagnóstico e a recomendação devem SEMPRE conter as propostas de aplicação conjunta do TOP 1 (Benefício Loja Integrada), TOP 2 (Recuperação no WhatsApp) e TOP 3 (Tráfego Qualificado) para destravar e estruturar as vendas da loja.

6. Lista de 20 Produtos com Otimização de SEO (seoProducts):
   - Se informados produtos pela agência, otimize-os. Se não informados, selecione os 20 produtos com maior potencial de venda conforme análise de mercado e dados de busca do Google para o segmento da loja.
   - Para cada um dos 20 produtos forneça: productName, category, focusKeyword (termo de busca com alta demanda no Google), optimizedTitle (título de alta conversão para H1 e Title Tag), metaDescription (chamada irresistível de busca) e seoAdjustments (apontamentos de ajustes de SEO: H1, Alt das fotos, URL amigável e texto).`;

  const userPrompt = `Realize o laudo de diagnóstico detalhado da seguinte loja inspecionada:
- Nome da Loja: ${storeName || "Loja Online"}
- URL: ${storeUrl || "https://sualoja.lojaintegrada.com.br"}
- Nome do Lojista: ${sellerName || "Lojista"}
- Segmento / Nicho: ${segment || "Varejo & Moda"}
- Dados da Inspeção Online Realizada: ${inspection.rawSummary}
- Informações Coletadas / Observações: ${notes || "Nenhuma observação extra"}
- Dados informados pela agência para Item 11.1 (Data da última venda e volume nos últimos 30/60/90 dias): "${item11_1SalesData || 'Avaliado no painel'}"
${rawHtmlSnippet ? `- Trecho HTML fornecido: ${rawHtmlSnippet.slice(0, 3000)}` : ""}

Gere o JSON com a pontuação de 0 a 100 (overallScore), o resumo executivo, a avaliação dos 46 itens das 11 áreas (com diagnóstico, recomendação, impacto/risco se não corrigido, benefício da correção e prazos), os 20 produtos com otimização de SEO para o Google, e a estrutura do Top 1 (BENEFICIO LOJA INTEGRADA) e Top 2/3.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.NUMBER, description: "Pontuação geral da loja de 0 a 100" },
      executiveSummary: { type: Type.STRING, description: "Resumo executivo contendo Top 1 - (ESCOPO BENEFICIO LOJA INTEGRADA) e Top 2 e 3 (execução opcional seller mediante orçamento)" },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Pontos fortes identificados" },
      urgentBottlenecks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Gargalos urgentes da loja" },
      areas: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            num: { type: Type.STRING },
            title: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  note: { type: Type.STRING },
                  flag: { type: Type.STRING },
                  status: { type: Type.STRING, description: "conforme, ajustar, critico ou nao_aplicavel" },
                  priority: { type: Type.STRING, description: "alta, media ou baixa" },
                  diagnosticFindings: { type: Type.STRING, description: "Constatação detalhada e criteriosa da inspeção" },
                  recommendedAction: { type: Type.STRING, description: "Ação corretiva recomendada" },
                  riskIfNotFixed: { type: Type.STRING, description: "Impacto negativo ou risco se não for ajustado" },
                  benefitIfFixed: { type: Type.STRING, description: "Benefício mensurável em caso de correção" },
                  deadlineText: { type: Type.STRING, description: "Prazo para correção" },
                  isBanhoDeLojaCandidate: { type: Type.BOOLEAN },
                },
                required: ["id", "title", "status", "priority", "diagnosticFindings", "recommendedAction"],
              },
            },
          },
          required: ["id", "num", "title", "items"],
        },
      },
      seoProducts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            productName: { type: Type.STRING },
            category: { type: Type.STRING },
            focusKeyword: { type: Type.STRING },
            optimizedTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            seoAdjustments: { type: Type.STRING },
            searchVolumeDemand: { type: Type.STRING },
          },
          required: ["id", "productName", "focusKeyword", "optimizedTitle", "metaDescription", "seoAdjustments"],
        },
        description: "Lista de 20 produtos principais com maior potencial de venda no Google e apontamentos de SEO"
      },
      top1: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          includedItems: {
            type: Type.OBJECT,
            properties: {
              layoutStandardAndBanner: { type: Type.BOOLEAN },
              seo20Products: { type: Type.BOOLEAN },
              domainConfiguration: { type: Type.BOOLEAN },
            },
            required: ["layoutStandardAndBanner", "seo20Products", "domainConfiguration"],
          },
          details: { type: Type.STRING },
          bannerSpecs: { type: Type.STRING },
          seoProductsList: { type: Type.ARRAY, items: { type: Type.STRING } },
          domainName: { type: Type.STRING },
          executionStatus: { type: Type.STRING },
        },
        required: ["title", "includedItems", "details", "seoProductsList"],
      },
      top2: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          areaName: { type: Type.STRING },
          hookDiagnostico: { type: Type.STRING },
          proposedSolution: { type: Type.STRING },
          commercialPitch: { type: Type.STRING },
          estimatedPrice: { type: Type.NUMBER },
          estimatedDays: { type: Type.NUMBER },
          expectedImpact: { type: Type.STRING },
          sellerDecision: { type: Type.STRING },
        },
        required: ["id", "title", "areaName", "hookDiagnostico", "proposedSolution", "commercialPitch", "expectedImpact"],
      },
      top3: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          areaName: { type: Type.STRING },
          hookDiagnostico: { type: Type.STRING },
          proposedSolution: { type: Type.STRING },
          commercialPitch: { type: Type.STRING },
          estimatedPrice: { type: Type.NUMBER },
          estimatedDays: { type: Type.NUMBER },
          expectedImpact: { type: Type.STRING },
          sellerDecision: { type: Type.STRING },
        },
        required: ["id", "title", "areaName", "hookDiagnostico", "proposedSolution", "commercialPitch", "expectedImpact"],
      },
    },
    required: ["overallScore", "executiveSummary", "strengths", "urgentBottlenecks", "areas", "top1", "top2", "top3"],
  };

  let aiSuccess = false;
  let parsedData: any = null;
  let lastError: any = null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const ai = getGeminiClient();

    for (const modelName of candidateModels) {
      try {
        console.log(`Tentando análise com modelo: ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        if (response.text) {
          parsedData = JSON.parse(response.text);
          aiSuccess = true;
          console.log(`✅ Diagnóstico gerado com sucesso pelo modelo ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Tentativa com ${modelName} falhou (${err?.message || err?.status || 'Erro desconhecido'}).`);
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }

  if (aiSuccess && parsedData) {
    const sanitized = normalizeAuditResult(parsedData, { storeName, segment, item11_1SalesData, customProductsText, storeUrl });
    return res.json({ success: true, data: sanitized });
  }

  // Fallback with live inspected data
  console.log("Gerando diagnóstico estruturado com base na inspeção real:", storeName);
  const fallbackAudit = generateTailoredAudit({
    storeName,
    storeUrl,
    sellerName,
    segment,
    notes,
    inspection,
    item11_1SalesData,
    customProductsText,
  });

  const sanitizedFallback = normalizeAuditResult(fallbackAudit, { storeName, segment, item11_1SalesData, customProductsText, storeUrl });

  return res.json({
    success: true,
    data: sanitizedFallback,
    isFallback: true,
    note: lastError?.message ? `AI em alta demanda (${lastError.message}). Diagnóstico gerado via motor de inspeção técnica.` : undefined,
  });
});

export function normalizeAuditResult(
  audit: any,
  context: { storeName?: string; segment?: string; item11_1SalesData?: string; customProductsText?: string; storeUrl?: string }
) {
  if (!audit) return audit;

  const storeName = context.storeName || "Loja Online";
  const segment = context.segment || "Varejo";
  const salesInput = (context.item11_1SalesData || "").trim();
  const storeUrl = context.storeUrl || "";

  // Normalize Areas & Items
  if (Array.isArray(audit.areas)) {
    audit.areas.forEach((area: any) => {
      if (Array.isArray(area.items)) {
        area.items.forEach((item: any) => {
          // Replace Banho de Loja in texts
          if (item.diagnosticFindings) {
            item.diagnosticFindings = item.diagnosticFindings.replace(/banho de loja/gi, "Escopo do Benefício Loja Integrada");
          }
          if (item.recommendedAction) {
            item.recommendedAction = item.recommendedAction.replace(/banho de loja/gi, "Escopo do Benefício Loja Integrada");
          }

          // Special logic for Item 11.1
          if (item.id === "11.1" || item.id === "item-11-1" || (area.id === 11 && item.title?.includes("Data da última venda"))) {
            Object.assign(item, formatItem11_1(item, salesInput));
          }

          // Deadlines assignment
          if (item.isBanhoDeLojaCandidate) {
            item.deadlineText = "Prazo Imediato (Escopo do Benefício Loja Integrada)";
          } else if (item.status === "critico") {
            item.deadlineText = "Necessário correção no prazo de 7 a 15 dias (deve ser corrigido nesse prazo)";
          } else if (item.status === "ajustar") {
            item.deadlineText = "Prazo de 15 a 30 dias";
          } else {
            item.deadlineText = "Monitoramento contínuo";
          }

          // Risk and Benefit
          if (item.status === "ajustar" || item.status === "critico") {
            if (!item.riskIfNotFixed || item.riskIfNotFixed.trim().length < 10) {
              item.riskIfNotFixed = item.status === "critico"
                ? "Gargalo impeditivo que gera perda contínua de pedidos, quebra de confiança do visitante e desperdício de investimentos."
                : "Redução da eficiência de conversão da loja e perda gradual de compradores para concorrentes diretos.";
            }
            if (!item.benefitIfFixed || item.benefitIfFixed.trim().length < 10) {
              item.benefitIfFixed = item.status === "critico"
                ? "Desbloqueio imediato de conversões, elevação da segurança do comprador e aumento da taxa de aprovação de pedidos."
                : "Melhoria na experiência de navegação, maior tempo de permanência no site e aumento do ticket médio.";
            }
          }
        });
      }
    });
  }

  // Normalize Top 1 title & details
  if (audit.top1) {
    audit.top1.title = "Top 1 — Essencial (BENEFICIO LOJA INTEGRADA)";
    if (audit.top1.details) {
      audit.top1.details = audit.top1.details.replace(/banho de loja/gi, "Escopo do Benefício Loja Integrada");
    }
  }

  // Normalize Executive Summary
  if (audit.executiveSummary) {
    audit.executiveSummary = audit.executiveSummary.replace(/banho de loja/gi, "Escopo do Benefício Loja Integrada");
  }

  // Parse custom products if provided, filtering out generic placeholders
  let customList: string[] = [];
  if (context.customProductsText) {
    customList = context.customProductsText
      .split(/[\n,;]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 1 && !isGenericPlaceholder(p));
  }

  // Filter out any placeholders from top1.seoProductsList
  const validTop1List = (audit.top1?.seoProductsList || []).filter(
    (p: string) => typeof p === "string" && p.trim().length > 1 && !isGenericPlaceholder(p)
  );

  // Check if current audit.seoProducts has generic placeholders or is missing
  const hasPlaceholders =
    !audit.seoProducts ||
    !Array.isArray(audit.seoProducts) ||
    audit.seoProducts.length < 5 ||
    audit.seoProducts.some((p: any) => isGenericPlaceholder(p?.productName) || isGenericPlaceholder(p?.focusKeyword));

  if (hasPlaceholders) {
    const listToUse = customList.length > 0 ? customList : (validTop1List.length > 0 ? validTop1List : undefined);
    audit.seoProducts = generateDefaultSeoProducts(storeName, segment, listToUse, storeUrl);
  }

  // If agency provided custom products, align the first N items with them
  if (customList.length > 0) {
    customList.slice(0, 20).forEach((cName, idx) => {
      if (audit.seoProducts[idx]) {
        audit.seoProducts[idx].productName = cName;
        audit.seoProducts[idx].focusKeyword = generateNaturalKeyword(cName, segment);
        audit.seoProducts[idx].optimizedTitle = `${cName} com Envio Rápido | ${storeName}`;
      }
    });
  }

  // Guarantee exactly 20 items in seoProducts
  if (audit.seoProducts.length < 20) {
    const filler = generateDefaultSeoProducts(storeName, segment, undefined, storeUrl);
    while (audit.seoProducts.length < 20) {
      const idx = audit.seoProducts.length;
      audit.seoProducts.push({
        ...filler[idx % filler.length],
        id: `seo-prod-${idx + 1}`,
      });
    }
  }

  // Always keep top1.seoProductsList 100% in sync with real product names
  if (audit.top1) {
    audit.top1.seoProductsList = audit.seoProducts.slice(0, 20).map((p: any) => p.productName);
  }

  return audit;
}

function generate20SeoProducts(storeName: string, segment: string, customNames?: string[], storeUrl?: string) {
  const filtered = (customNames || []).filter((n) => typeof n === "string" && !isGenericPlaceholder(n));
  return generateDefaultSeoProducts(storeName, segment, filtered.length > 0 ? filtered : undefined, storeUrl);
}

function generateTailoredAudit(params: {
  storeName?: string;
  storeUrl?: string;
  sellerName?: string;
  segment?: string;
  notes?: string;
  inspection?: any;
  item11_1SalesData?: string;
  customProductsText?: string;
}) {
  const name = params.storeName || "Sua Loja";
  const segment = params.segment || "Varejo & Moda";
  const url = params.storeUrl || "https://sualoja.lojaintegrada.com.br";
  const inspection = params.inspection || {};
  const salesInput = params.item11_1SalesData?.trim();

  const customList = (params.customProductsText || "")
    .split(/[\n,;]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 1 && !isGenericPlaceholder(p));

  const listToUse =
    customList.length > 0
      ? customList
      : Array.isArray(inspection.detectedProductNames) && inspection.detectedProductNames.length > 0
      ? inspection.detectedProductNames
      : undefined;

  const tailoredSeoProducts = generateDefaultSeoProducts(name, segment, listToUse, url);

  const domainName = inspection.isCustomDomain
    ? url.replace(/https?:\/\//, "").replace(/\/.*$/, "")
    : `www.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.br`;

  const areas = [
    {
      id: 1,
      num: "01",
      title: "Layout e Experiência (UX/UI)",
      items: [
        {
          id: "1.1",
          title: "Identidade visual consistente (logo, cores da marca)",
          note: "Ajuste de contraste e paleta",
          flag: "Logo em baixa resolução ou sem alinhamento visual",
          status: "ajustar",
          priority: "alta",
          diagnosticFindings: `Identidade visual necessita de harmonização com a paleta oficial do nicho de ${segment}.`,
          recommendedAction: "Aplicar paleta de cores institucional e posicionar logotipo em alta definição.",
          isBanhoDeLojaCandidate: true,
        },
        {
          id: "1.2",
          title: "Design responsivo (mobile e desktop)",
          note: "Fluidez no mobile",
          flag: "Elementos desajustados em telas mobile",
          status: "conforme",
          priority: "media",
          diagnosticFindings: "Estrutura responsiva da Loja Integrada mantém boa usabilidade em smartphones e tablets.",
          recommendedAction: "Manter proporções visuais e espaçamentos equilibrados.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "1.3",
          title: "Velocidade de carregamento",
          note: "Imagens leves em WebP",
          flag: "Tempo de resposta superior a 3 segundos",
          status: "ajustar",
          priority: "alta",
          diagnosticFindings: "Imagens sem compressão otimizada impactam o carregamento em redes móveis 4G/5G.",
          recommendedAction: "Comprimir imagens de produtos e banners no formato WebP de alto desempenho.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "1.4",
          title: "Imagens de produto padronizadas",
          note: "Grade uniforme 1:1",
          flag: "Fotos em formatos e fundos irregulares",
          status: "ajustar",
          priority: "media",
          diagnosticFindings: "Imagens de produtos com proporções variáveis quebram a harmonia da vitrine principal.",
          recommendedAction: "Padronizar fotos no formato 1000x1000px com iluminação uniforme.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "1.5",
          title: "Banners atualizados e alinhados",
          note: "1 Banner promocional de impacto",
          flag: "Ausência de banner promocional com CTA claro",
          status: inspection.hasBanners ? "ajustar" : "critico",
          priority: "alta",
          diagnosticFindings: inspection.hasBanners
            ? "Banners existentes não possuem chamada para ação (CTA) estratégica nem resolução adequada."
            : "Loja sem banner principal promocional de boas-vindas com oferta clara.",
          recommendedAction: "Criar 1 banner promocional desktop (1920x600px) e mobile com proposta de valor e CTA.",
          isBanhoDeLojaCandidate: true,
        },
        {
          id: "1.6",
          title: "Tipografia legível e hierarquia clara",
          note: "Contraste adequado",
          flag: "Fontes pequenas ou de difícil leitura",
          status: "conforme",
          priority: "baixa",
          diagnosticFindings: "Tipografia do tema padrão oferece boa legibilidade para leitura de preços e especificações.",
          recommendedAction: "Preservar contraste mínimo de 4.5:1 nos textos descritivos.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "1.7",
          title: "Organização das categorias e menu",
          note: "Menu limpo e intuitivo",
          flag: "Categorias confusas ou excessivas",
          status: "conforme",
          priority: "media",
          diagnosticFindings: "Menu estruturado de forma acessível com segmentação das principais categorias.",
          recommendedAction: "Garantir que subcategorias estejam bem distribuídas.",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
    {
      id: 2,
      num: "02",
      title: "Catálogo e SEO de Produtos",
      items: [
        {
          id: "2.1",
          title: "Títulos de produto claros e com palavras-chave",
          note: "SEO dos 20 produtos principais",
          flag: "Títulos genéricos sem buscas no Google",
          status: "critico",
          priority: "alta",
          diagnosticFindings: "Títulos cadastrados são curtos e não exploram as palavras-chave mais buscadas pelos clientes.",
          recommendedAction: "Reescrever os títulos dos 20 produtos principais adicionando modelo, atributos e palavras-chave de intenção de compra.",
          isBanhoDeLojaCandidate: true,
        },
        {
          id: "2.2",
          title: "Descrições completas com informações técnicas",
          note: "Descrições ricas e persuasivas",
          flag: "Descrições vazias ou padrão de fábrica",
          status: "ajustar",
          priority: "alta",
          diagnosticFindings: "Descrições dos produtos carecem de detalhes sobre benefícios, medidas, materiais e modo de uso.",
          recommendedAction: "Estruturar descrições completas com benefícios, ficha técnica e quebra de objeções nos 20 produtos principais.",
          isBanhoDeLojaCandidate: true,
        },
        {
          id: "2.3",
          title: "Variações de produto bem configuradas",
          note: "Grade de cor e tamanho",
          flag: "Variações ausentes ou confusas",
          status: "conforme",
          priority: "media",
          diagnosticFindings: "Grades de variações configuradas permitindo seleção direta pelo consumidor.",
          recommendedAction: "Manter estoque sincronizado por variação ativa.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "2.4",
          title: "Estoque e disponibilidade atualizados",
          note: "Pronta entrega",
          flag: "Itens esgotados ocupando a vitrine",
          status: "conforme",
          priority: "alta",
          diagnosticFindings: "Vitrine exibe produtos disponíveis para compra imediata.",
          recommendedAction: "Ocultar automaticamente produtos com estoque zerado.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "2.5",
          title: "Vídeos demonstrativos ou imagens adicionais",
          note: "Múltiplos ângulos",
          flag: "Apenas 1 foto por produto",
          status: "ajustar",
          priority: "media",
          diagnosticFindings: "Muitos produtos possuem apenas uma imagem, limitando a visualização de detalhes.",
          recommendedAction: "Inserir de 3 a 5 fotos em ângulos diferentes para os produtos mais vendidos.",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
    {
      id: 3,
      num: "03",
      title: "Pagamento e Checkout",
      items: [
        {
          id: "3.1",
          title: "Meios de pagamento ativos e diversificados (Pix, Cartão, Boleto)",
          note: "Checkout transparente",
          flag: "Apenas 1 meio de pagamento disponível",
          status: inspection.paymentMethods?.length > 1 ? "conforme" : "ajustar",
          priority: "alta",
          diagnosticFindings: inspection.paymentMethods?.length > 0
            ? `Meios de pagamento detectados: ${inspection.paymentMethods.join(", ")}.`
            : "Configuração de checkout transparente com Pix e parcelamento no cartão.",
          recommendedAction: "Garantir desconto atrativo de 5% a 10% no Pix à vista para aumentar conversão imediata.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "3.2",
          title: "Parcelamento sem juros anunciado com destaque",
          note: "Regra clara de parcelas",
          flag: "Condições de parcelamento ocultas",
          status: "ajustar",
          priority: "media",
          diagnosticFindings: "Condições de parcelamento não estão visíveis abaixo do preço principal nas vitrines.",
          recommendedAction: "Exibir o valor da parcela em destaque (ex: 'ou até 3x de R$ XX sem juros').",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "3.3",
          title: "Recuperação de carrinho abandonado estruturada",
          note: "Automação WhatsApp / E-mail",
          flag: "Ausência de régua de recuperação de compras desistentes",
          status: "critico",
          priority: "alta",
          diagnosticFindings: "Loja não possui régua automatizada de contato para resgatar compradores que desistem no checkout.",
          recommendedAction: "Implantar automação de mensagens via WhatsApp para recuperação de carrinhos abandonados (Top 2).",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
    {
      id: 4,
      num: "04",
      title: "Envio e Frete",
      items: [
        {
          id: "4.1",
          title: "Cálculo de frete na página do produto",
          note: "Simulador de CEP visível",
          flag: "Frete calculável apenas no carrinho final",
          status: "conforme",
          priority: "alta",
          diagnosticFindings: "Simulador de frete por CEP disponível na página de detalhes do produto.",
          recommendedAction: "Manter múltiplas opções de transportadoras ativas.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "4.2",
          title: "Múltiplas opções de envio (Correios, Jadlog, Melhor Envio)",
          note: "Competitividade de prazos",
          flag: "Apenas 1 modalidade com frete elevado",
          status: "conforme",
          priority: "media",
          diagnosticFindings: "Integração logística habilitada com opções expressas e econômicas.",
          recommendedAction: "Negociar tabelas promocionais via Melhor Envio / Frenet.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "4.3",
          title: "Política de Frete Grátis anunciada na barra superior",
          note: "Gatilho de ticket médio",
          flag: "Sem aviso de frete grátis por valor mínimo",
          status: "ajustar",
          priority: "media",
          diagnosticFindings: "Ausência de régua de frete grátis na barra de topo para incentivar compras de maior valor.",
          recommendedAction: "Criar régua fixa no topo (ex: 'Frete Grátis para todo Brasil nas compras acima de R$ 199').",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "4.4",
          title: "Prazos de entrega claros e realistas",
          note: "Transparência de envio",
          flag: "Prazos vagos gerando insegurança",
          status: "conforme",
          priority: "baixa",
          diagnosticFindings: "Prazos calculados automaticamente em dias úteis no simulador de frete.",
          recommendedAction: "Adicionar prazo de separação interna nos avisos do produto.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "4.5",
          title: "Rastreamento automático de pedidos",
          note: "Notificações de status",
          flag: "Cliente sem acompanhamento do pedido",
          status: "conforme",
          priority: "baixa",
          diagnosticFindings: "Sistema da Loja Integrada envia e-mails transacionais com código de rastreio.",
          recommendedAction: "Revisar templates de e-mail de confirmação de envio.",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
    {
      id: 5,
      num: "05",
      title: "Estrutura Técnica e Integrações",
      items: [
        {
          id: "5.1",
          title: "Domínio próprio configurado com SSL ativo",
          note: "Endereço profissional com HTTPS",
          flag: "Uso de subdomínio gratuito (.lojaintegrada.com.br)",
          status: inspection.isCustomDomain ? "conforme" : "critico",
          priority: "alta",
          diagnosticFindings: inspection.isCustomDomain
            ? `Domínio próprio configurado com certificado SSL ativo (${url}).`
            : "Loja ainda utilizando subdomínio gratuito da Loja Integrada, o que reduz a credibilidade e o ranqueamento no Google.",
          recommendedAction: `Apontar e configurar o domínio próprio (${domainName}) com certificado SSL ativado.`,
          isBanhoDeLojaCandidate: true,
        },
        {
          id: "5.2",
          title: "Google Analytics 4 (GA4) instalado",
          note: "Métricas de visitantes",
          flag: "Ausência de rastreamento de tráfego",
          status: inspection.hasGa4 ? "conforme" : "ajustar",
          priority: "alta",
          diagnosticFindings: inspection.hasGa4
            ? "Código de rastreamento do Google Analytics 4 identificado no cabeçalho da loja."
            : "Ausência de tag do Google Analytics 4 para mensurar audiência, páginas mais visitadas e conversão.",
          recommendedAction: "Instalar tag de mensuração do GA4 e configurar eventos de e-commerce.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "5.3",
          title: "Meta Pixel instalado com API de Conversões",
          note: "Públicos de remarketing",
          flag: "Pixel ausente impossibilitando anúncios otimizados",
          status: inspection.hasPixel ? "conforme" : "ajustar",
          priority: "alta",
          diagnosticFindings: inspection.hasPixel
            ? "Pixel da Meta presente na estrutura da loja."
            : "Pixel da Meta não identificado, inviabilizando campanhas de remarketing no Instagram e Facebook.",
          recommendedAction: "Configurar Pixel da Meta com rastreamento dos eventos ViewContent, AddToCart e Purchase.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "5.4",
          title: "Google Tag Manager (GTM) integrado",
          note: "Gestão centralizada de scripts",
          flag: "Scripts soltos no código fonte",
          status: inspection.hasGtm ? "conforme" : "ajustar",
          priority: "media",
          diagnosticFindings: inspection.hasGtm
            ? "Container GTM ativo facilitando gestão de tags."
            : "Container GTM não configurado.",
          recommendedAction: "Implementar GTM para centralizar tags de marketing sem sobrecarregar a loja.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "5.5",
          title: "Favicon personalizado da marca",
          note: "Ícone na aba do navegador",
          flag: "Ícone padrão da plataforma ou ausente",
          status: "ajustar",
          priority: "baixa",
          diagnosticFindings: "Favicon não configurado ou em baixa resolução na aba do navegador.",
          recommendedAction: "Inserir favicon 32x32px com o símbolo oficial da marca.",
          isBanhoDeLojaCandidate: true,
        },
        {
          id: "5.6",
          title: "Página 404 personalizada",
          note: "Retenção de links quebrados",
          flag: "Página de erro genérica sem redirecionamento",
          status: "conforme",
          priority: "baixa",
          diagnosticFindings: "Página de erro padrão da plataforma redireciona para a vitrine inicial.",
          recommendedAction: "Manter links de produtos atualizados para evitar erros 404.",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
    {
      id: 6,
      num: "06",
      title: "Confiança e Prova Social",
      items: [
        {
          id: "6.1",
          title: "Dados da empresa visíveis no rodapé (CNPJ, Razão Social, Endereço)",
          note: "Conformidade com a Lei do E-commerce (Decreto 7.962/13)",
          flag: "Dados cadastrais ausentes no rodapé",
          status: inspection.hasCnpj ? "conforme" : "critico",
          priority: "alta",
          diagnosticFindings: inspection.hasCnpj
            ? "Dados cadastrais e CNPJ identificados no rodapé da loja."
            : "Rodapé não apresenta CNPJ, Razão Social e endereço físico, descumprindo a legislação federal de e-commerce.",
          recommendedAction: "Inserir CNPJ, Razão Social e canais de contato oficiais no rodapé da loja.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "6.2",
          title: "Política de Trocas e Devoluções clara (Código de Defesa do Consumidor)",
          note: "Garantia de 7 dias",
          flag: "Sem página de trocas e devoluções",
          status: inspection.hasExchangePolicy ? "conforme" : "ajustar",
          priority: "alta",
          diagnosticFindings: inspection.hasExchangePolicy
            ? "Página institucional de trocas e devoluções disponível no rodapé."
            : "Ausência de página detalhada de trocas e devoluções, gerando desconfiança no momento da compra.",
          recommendedAction: "Cadastrar página institucional explicando prazos, custos de frete reverso e procedimentos de troca.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "6.3",
          title: "Política de Privacidade e LGPD",
          note: "Transparência de dados",
          flag: "Sem termos de privacidade",
          status: inspection.hasPrivacyPolicy ? "conforme" : "ajustar",
          priority: "media",
          diagnosticFindings: inspection.hasPrivacyPolicy
            ? "Política de privacidade presente atendendo aos requisitos básicos da LGPD."
            : "Página de política de privacidade ausente ou genérica.",
          recommendedAction: "Adicionar texto padrão de conformidade com a LGPD e uso de cookies.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "6.4",
          title: "Avaliações e depoimentos de clientes (Reviews de Produto)",
          note: "Prova social ativa",
          flag: "Zero avaliações nos produtos",
          status: "ajustar",
          priority: "alta",
          diagnosticFindings: "Produtos sem avaliações ou comentários de compradores reais para validar a qualidade.",
          recommendedAction: "Habilitar módulo de avaliações de clientes e disparar solicitação pós-entrega.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "6.5",
          title: "Selos de segurança e certificados no rodapé",
          note: "Ambiente protegido",
          flag: "Rodapé sem selos de segurança",
          status: "conforme",
          priority: "baixa",
          diagnosticFindings: "Selos de pagamento seguro e proteção SSL exibidos no rodapé do tema.",
          recommendedAction: "Manter selos de gateway de pagamento atualizados.",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
    {
      id: 7,
      num: "07",
      title: "Analytics e Tráfego",
      items: [
        {
          id: "7.1",
          title: "Estratégia de tráfego pago ativa (Meta Ads / Google Shopping)",
          note: "Geração contínua de visitantes",
          flag: "Dependência exclusiva de tráfego orgânico",
          status: "critico",
          priority: "alta",
          diagnosticFindings: "A loja opera sem campanhas pagas estruturadas, dependendo apenas do tráfego esporádico das redes sociais.",
          recommendedAction: "Estruturar campanhas de tráfego pago no Meta Ads (Instagram/Facebook) e Google Shopping (Top 3).",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "7.2",
          title: "Google Search Console configurado e sitemap enviado",
          note: "Indexação no Google",
          flag: "Sitemap não indexado",
          status: "ajustar",
          priority: "alta",
          diagnosticFindings: "Sitemap da loja precisa de envio ao Google Search Console para acelerar a indexação das páginas.",
          recommendedAction: "Cadastrar a propriedade no Google Search Console e enviar o arquivo sitemap.xml.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "7.3",
          title: "Rastreamento de conversões de compra validado",
          note: "ROAS e custo por aquisição",
          flag: "Vendas sem identificação de canal de origem",
          status: "ajustar",
          priority: "media",
          diagnosticFindings: "Falta de atribuição correta das fontes de tráfego que geram compras.",
          recommendedAction: "Configurar UTMs padronizadas em links de anúncios e redes sociais.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "7.4",
          title: "Públicos de remarketing mapeados",
          note: "Visitantes dos últimos 30/60/90 dias",
          flag: "Públicos personalizados não criados",
          status: "ajustar",
          priority: "alta",
          diagnosticFindings: "Públicos de remarketing (quem viu produtos mas não comprou) não estão sendo acumulados no gerenciador.",
          recommendedAction: "Criar públicos personalizados no Meta Ads para reimpactar visitantes recentes.",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
    {
      id: 8,
      num: "08",
      title: "Redes Sociais e Presença Digital",
      items: [
        {
          id: "8.1",
          title: "Links para redes sociais funcionando no cabeçalho/rodapé",
          note: "Conexão com canais oficiais",
          flag: "Links quebrados ou apontando para perfis genéricos",
          status: inspection.socialLinks?.length > 0 ? "conforme" : "ajustar",
          priority: "media",
          diagnosticFindings: inspection.socialLinks?.length > 0
            ? `Redes sociais vinculadas na loja: ${inspection.socialLinks.join(", ")}.`
            : "Ícones de redes sociais no rodapé não possuem links diretos para os perfis da marca.",
          recommendedAction: "Vincular os links corretos do perfil do Instagram e WhatsApp no rodapé.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "8.2",
          title: "Instagram Shopping (Sacolinha) configurado",
          note: "Marcação de produtos em posts",
          flag: "Sacolinha desativada ou catálogo desatualizado",
          status: "ajustar",
          priority: "alta",
          diagnosticFindings: "Catálogo do Instagram Shopping necessita de sincronização com os produtos da Loja Integrada.",
          recommendedAction: "Integrar o catálogo XML da Loja Integrada ao Gerenciador de Comércio da Meta.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "8.3",
          title: "Bio do Instagram com proposta clara e link da loja",
          note: "Canal de conversão",
          flag: "Bio sem link direto ou sem chamada para a loja",
          status: "conforme",
          priority: "media",
          diagnosticFindings: "Perfil social atua como vitrine de apresentação da marca.",
          recommendedAction: "Manter link direto com cupom de primeira compra na biografia do Instagram.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "8.4",
          title: "Frequência de postagens e conteúdo de prova social",
          note: "Engajamento e bastidores",
          flag: "Perfil inativo há mais de 30 dias",
          status: "conforme",
          priority: "baixa",
          diagnosticFindings: "Publicações demonstram atividade recente da marca.",
          recommendedAction: "Publicar stories diários com bastidores de pedidos e depoimentos de clientes.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "8.5",
          title: "Google Meu Negócio configurado (se aplicável)",
          note: "Presença local",
          flag: "Perfil local não reivindicado",
          status: "nao_aplicavel",
          priority: "baixa",
          diagnosticFindings: "Operação 100% digital focada em envio nacional.",
          recommendedAction: "Criar ficha caso possua ponto físico para retirada.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "8.6",
          title: "WhatsApp flutuante integrado na loja",
          note: "Canal de atendimento direto",
          flag: "Cliente sem canal rápido para tirar dúvidas",
          status: inspection.hasWhatsapp ? "conforme" : "critico",
          priority: "alta",
          diagnosticFindings: inspection.hasWhatsapp
            ? "Botão flutuante de WhatsApp ativo facilitando contato com o visitante."
            : "Ausência de botão direto de WhatsApp flutuante nas páginas da loja, dificultando o fechamento de dúvidas em tempo real.",
          recommendedAction: "Ativar botão flutuante de WhatsApp com mensagem inicial pré-configurada.",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
    {
      id: 9,
      num: "09",
      title: "Precificação e Promoções",
      items: [
        {
          id: "9.1",
          title: "Cupom de Primeira Compra ativo e anunciado",
          note: "Incentivo à primeira conversão",
          flag: "Sem cupom de boas-vindas para novos visitantes",
          status: "ajustar",
          priority: "alta",
          diagnosticFindings: "Não foi identificado cupom promocional para incentivar o primeiro pedido de novos visitantes.",
          recommendedAction: "Criar cupom de boas-vindas (ex: BEMVINDO10 com 10% OFF) anunciado no banner ou barra superior.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "9.2",
          title: "Preços competitivos frente aos concorrentes diretos",
          note: "Percepção de valor",
          flag: "Preço desproporcional sem justificativa de valor",
          status: "conforme",
          priority: "media",
          diagnosticFindings: "Precificação alinhada com as referências do segmento de mercado.",
          recommendedAction: "Monitorar concorrentes diretos bimestralmente.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "9.3",
          title: "Kits de produtos e combos para elevar ticket médio",
          note: "Cross-sell e Upsell",
          flag: "Apenas venda unitária sem combos promocionais",
          status: "ajustar",
          priority: "media",
          diagnosticFindings: "Ausência de kits ou pacotes combinados para aumentar o valor médio por pedido.",
          recommendedAction: "Montar combos de 2 ou 3 itens complementares com desconto progressivo.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "9.4",
          title: "Desconto no Pix configurado e visível",
          note: "Gatilho de liquidez imediata",
          flag: "Mesmo preço no Pix e no cartão parcelado",
          status: "conforme",
          priority: "alta",
          diagnosticFindings: "Desconto para pagamento à vista no Pix devidamente destacado na vitrine.",
          recommendedAction: "Destacar a economia em reais no valor final do produto.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "9.5",
          title: "Selo de oferta / desconto percentual nas vitrines",
          note: "Gatilho de oportunidade",
          flag: "Produtos promocionais sem tag de % OFF",
          status: "conforme",
          priority: "baixa",
          diagnosticFindings: "Tags visuais de desconto aplicadas sobre os itens em oferta.",
          recommendedAction: "Preservar badges coloridos de promoção para chamar atenção visual.",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
    {
      id: 10,
      num: "10",
      title: "Atendimento e Experiência do Cliente",
      items: [
        {
          id: "10.1",
          title: "Tempo de resposta no WhatsApp inferior a 15 minutos",
          note: "SLA de atendimento ágil",
          flag: "Demora superior a 1 hora para responder potenciais compradores",
          status: "ajustar",
          priority: "alta",
          diagnosticFindings: "Tempo de resposta em horários de pico pode comprometer o fechamento de vendas por impulso.",
          recommendedAction: "Configurar mensagens de saudação e respostas rápidas no WhatsApp Business.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "10.2",
          title: "Página 'Quem Somos' humanizada com a história da marca",
          note: "Conexão emocional com o comprador",
          flag: "Página institucional vazia ou impessoal",
          status: "ajustar",
          priority: "media",
          diagnosticFindings: "Página institucional de apresentação da marca não transmite a história, valores e fotos reais dos fundadores.",
          recommendedAction: "Redigir texto institucional acolhedor com a missão da loja e foto dos idealizadores.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "10.3",
          title: "Página de 'Fale Conosco' com múltiplos canais (WhatsApp, E-mail)",
          note: "Canais de contato claros",
          flag: "Formulário genérico sem telefone de suporte",
          status: "conforme",
          priority: "alta",
          diagnosticFindings: "Página de contato disponibiliza e-mail e canal de suporte.",
          recommendedAction: "Inserir horário oficial de funcionamento e suporte.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "10.4",
          title: "Pesquisa de satisfação pós-venda (NPS)",
          note: "Retenção de clientes",
          flag: "Ausência de contato pós-entrega",
          status: "ajustar",
          priority: "baixa",
          diagnosticFindings: "Não há rotina estabelecida para checar se o produto chegou conforme esperado após a entrega.",
          recommendedAction: "Disparar mensagem no WhatsApp 3 dias após a entrega agradecendo e solicitando feedback.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "10.5",
          title: "FAQ com perguntas frequentes na página de produto ou institucional",
          note: "Quebra de objeções antes da compra",
          flag: "Dúvidas recorrentes de frete e prazos sem resposta rápida",
          status: "ajustar",
          priority: "media",
          diagnosticFindings: "Ausência de sanfona (accordion) de perguntas frequentes para tirar dúvidas comuns sobre entregas e trocas.",
          recommendedAction: "Adicionar seção de FAQ com as 5 principais dúvidas sobre pagamento, prazos e garantia.",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
    {
      id: 11,
      num: "11",
      title: "Histórico e Comportamento de Vendas",
      items: [
        formatItem11_1(
          {
            id: "11.1",
            title: "Data da última venda e volume nos últimos 30/60/90 dias",
            note: "Dados informados pelo funcionário da agência",
            flag: "Ritmo de vendas estagnado ou sem pedidos recentes",
            status: "ajustar",
            priority: "alta",
            isBanhoDeLojaCandidate: false,
          },
          salesInput
        ),
        {
          id: "11.2",
          title: "Taxa de conversão média da loja acima de 1.2%",
          note: "Eficiência de fechamento de pedidos",
          flag: "Conversão abaixo de 0.8% com desperdício de tráfego",
          status: "ajustar",
          priority: "alta",
          diagnosticFindings: "Taxa de conversão estimada abaixo do potencial devido a barreiras de confiança visual e SEO nos produtos.",
          recommendedAction: "Corrigir os gargalos de layout e descrições para atingir conversão média saudável entre 1.5% e 2.2%.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "11.3",
          title: "Ticket médio equilibrado com o nicho de mercado",
          note: "Valor médio gasto por pedido",
          flag: "Ticket médio baixo sem incentivos de cross-sell",
          status: "conforme",
          priority: "media",
          diagnosticFindings: "Ticket médio dos produtos cadastrados é compatível com a média do segmento de e-commerce.",
          recommendedAction: "Estimular compras casadas para expandir em +15% o valor do carrinho.",
          isBanhoDeLojaCandidate: false,
        },
        {
          id: "11.4",
          title: "Taxa de recompra de clientes antigos ativa",
          note: "LTV e fidelização de base",
          flag: "Zero estratégia para trazer clientes de volta",
          status: "ajustar",
          priority: "media",
          diagnosticFindings: "Ausência de disparos promocionais para reativar clientes que já compraram nos meses anteriores.",
          recommendedAction: "Criar régua de broadcast no WhatsApp com lançamentos para a base de clientes cadastrados.",
          isBanhoDeLojaCandidate: false,
        },
      ],
    },
  ];

  return {
    overallScore: 58,
    executiveSummary: `Auditoria técnica e comercial completa realizada pela DigiBrands para a loja ${name}. Identificamos as prioridades estruturais no Top 1 - (ESCOPO BENEFICIO LOJA INTEGRADA) e oportunidades no Top 2 e 3 (execução opcional seller mediante orçamento) para alavancar a conversão de vendas.`,
    strengths: [
      "Plataforma Loja Integrada estruturada com suporte nativo a checkout transparente",
      "Meios de pagamento principais (Pix e Cartão) prontos para transacionar",
      "Catálogo inicial com produtos com boa procura de mercado",
    ],
    urgentBottlenecks: [
      "Ausência de domínio próprio com SSL ativado (subdomínio prejudica confiança e SEO)",
      "Banners e comunicação visual sem chamada para ação (CTA) estratégica",
      "Títulos e descrições dos produtos sem palavras-chave para o Google",
    ],
    areas,
    top1: {
      title: "Top 1 — Essencial (BENEFICIO LOJA INTEGRADA)",
      includedItems: {
        layoutStandardAndBanner: true,
        seo20Products: true,
        domainConfiguration: true,
      },
      details: "Executado pela Agência Parceira DigiBrands no escopo do benefício Loja Integrada: adequação do layout padrão + 1 banner profissional, SEO dos 20 produtos principais e configuração de domínio próprio.",
      bannerSpecs: "1 banner promocional desktop (1920x600px) e mobile com proposta de valor e CTA",
      seoProductsList: tailoredSeoProducts.map((p) => p.productName),
      domainName,
      executionStatus: "em_andamento",
      isFreeBenefit: true,
    },
    seoProducts: tailoredSeoProducts,
    top2: {
      id: "top2",
      title: "Top 2 — Automação e Recuperação de Carrinho Abandonado no WhatsApp",
      areaName: "Pagamento e Checkout",
      hookDiagnostico: "Loja com volume expressivo de visitantes que adicionam itens ao carrinho mas abandonam o checkout antes do pagamento, sem qualquer contato automático de resgate.",
      proposedSolution: "Implantação de régua de automação via WhatsApp Business API com 3 disparos estratégicos (15 minutos, 6 horas e 24 horas) com link direto para finalizar a compra.",
      commercialPitch: "Recupere até 25% das vendas perdidas no checkout sem investir mais em tráfego.",
      estimatedPrice: 650,
      estimatedDays: 4,
      expectedImpact: "Recuperação média de 18% a 25% dos pedidos abandonados, gerando faturamento imediato.",
      sellerDecision: "em_negociacao",
    },
    top3: {
      id: "top3",
      title: "Top 3 — Gestão e Estruturação de Tráfego Pago GA4 & Meta Ads",
      areaName: "Analytics e Tráfego",
      hookDiagnostico: "Ausência de campanhas ativas de tráfego qualificado no Instagram, Facebook e Google Shopping, gerando dependência exclusiva de visitas esporádicas.",
      proposedSolution: "Instalação da API de Conversões da Meta, Google Analytics 4 avançado e lançamento de campanhas de atração e remarketing para produtos com maior margem.",
      commercialPitch: "Atraia compradores qualificados diariamente para sua loja com previsibilidade.",
      estimatedPrice: 980,
      estimatedDays: 7,
      expectedImpact: "Atração previsível de 1.500 a 3.500 novos visitantes qualificados por mês, multiplicando a base de clientes.",
      sellerDecision: "em_negociacao",
    },
  };
}

// Persistent File-Based Database for Store Audits
const DB_FILE_PATH = path.join(process.cwd(), "data", "audits.json");

function ensureDbDirectory() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getStoredAudits(): any[] {
  try {
    ensureDbDirectory();
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Erro ao ler banco de dados de auditorias:", err);
  }
  return [];
}

function saveStoredAudits(audits: any[]) {
  try {
    ensureDbDirectory();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(audits, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar banco de dados de auditorias:", err);
  }
}

// Store CRUD API Endpoints with Persistent Storage
app.get("/api/stores", (req, res) => {
  const audits = getStoredAudits().map((store) =>
    normalizeAuditResult(store, {
      storeName: store.storeName,
      segment: store.segment,
      item11_1SalesData: store.item11_1SalesData,
      storeUrl: store.storeUrl,
    })
  );
  saveStoredAudits(audits);
  res.json({ success: true, data: audits });
});

app.post("/api/stores", (req, res) => {
  const store = req.body;
  if (!store || !store.id) {
    return res.status(400).json({ success: false, error: "Store data and ID are required" });
  }
  const audits = getStoredAudits();
  const index = audits.findIndex((s) => s.id === store.id);
  if (index >= 0) {
    audits[index] = store;
  } else {
    audits.unshift(store);
  }
  saveStoredAudits(audits);
  res.json({ success: true, data: store });
});

app.put("/api/stores/:id", (req, res) => {
  const { id } = req.params;
  const store = req.body;
  const audits = getStoredAudits();
  const index = audits.findIndex((s) => s.id === id);
  if (index >= 0) {
    audits[index] = { ...audits[index], ...store };
    saveStoredAudits(audits);
    return res.json({ success: true, data: audits[index] });
  }
  audits.unshift(store);
  saveStoredAudits(audits);
  res.json({ success: true, data: store });
});

app.delete("/api/stores/:id", (req, res) => {
  const { id } = req.params;
  const audits = getStoredAudits();
  const updatedAudits = audits.filter((s) => s.id !== id);
  saveStoredAudits(updatedAudits);
  res.json({ success: true, message: "Análise excluída com sucesso do banco de dados", remainingCount: updatedAudits.length });
});

// WhatsApp Messages Generator endpoint
app.post("/api/generate-whatsapp", (req, res) => {
  try {
    const { storeName, sellerName, agencyName, consultantName, top1, top2, top3 } = req.body;

    const agName = agencyName || "DigiBrands";
    const consName = consultantName || "Lucas";
    const sName = sellerName || "Lojista";
    const stName = storeName || "sua loja";

    const messages = {
      primeiroContato24h: `Olá! 👋\nMeu nome é ${consName} e faço parte da Agência ${agName}, parceira oficial da Loja Integrada.\nA Loja Integrada me contratou para executar um benefício pra você: um diagnóstico completo da sua loja + plano de ação, pra te ajudar a vender 🎉\n\n⚠️ Importante: o benefício possui validade de 30 dias corridos a partir de hoje, nosso primeiro contato. Dentro desse período, precisamos receber todas as informações necessárias para seguirmos com o diagnóstico e a entrega da sua loja.\n\nFico à disposição para te ajudar no que precisar 🚀`,

      coletaMaterial7dias: `Olá ${sName}! Tudo bem por aí? 🌟\n\nEstamos preparando o Diagnóstico Técnico e a execução do seu benefício de **Essencial (BENEFICIO LOJA INTEGRADA)** (layout + 1 banner profissional, SEO dos 20 produtos principais e configuração do domínio).\n\nPara iniciarmos a implementação sem atrasar seu prazo de 7 dias, precisamos de:\n1. Acesso ADM de Agência Parceira no painel da sua loja;\n2. Logotipo em alta resolução e preferências de cores;\n3. Lista dos 20 produtos que você mais quer vender;\n4. Dados do seu domínio próprio (se já tiver registrado).\n\nPodemos alinhar rapidinho hoje?`,

      alertaUltimaTentativa: `Olá ${sName}! ⚠️\n\nEsta é a nossa 4ª tentativa de contato referente ao benefício oficial da Loja Integrada para a loja *${stName}*.\n\nComo o prazo de coleta de 7 dias está se encerrando, caso não consigamos o seu retorno, precisaremos registrar como 'Não retornou contato' no portal da Loja Integrada.\n\nAinda dá tempo de aproveitar o seu benefício 100% gratuito! Me responda aqui para ativarmos sua loja.`,

      apresentacaoEntregaComUpsell: `Olá ${sName}! 🎉\n\nConcluímos com sucesso a execução do **Top 1 — Essencial (BENEFICIO LOJA INTEGRADA)** da *${stName}*!\n\n✅ Layout ajustado com identidade visual harmônica e 1 Banner promocional exclusivo;\n✅ SEO e descrições ricas implementadas nos 20 produtos principais;\n✅ Configuração e validação de domínio e segurança SSL.\n\n📄 Acabei de anexar o **PDF Completo do Diagnóstico** com a avaliação das 11 áreas da sua loja!\n\n💡 No documento você verá também nossas recomendações de **Top 2 (${top2?.title || 'Recuperação de Carrinho no WhatsApp'})** e **Top 3 (${top3?.title || 'Tráfego Pago GA4/Meta Ads'})** para acelerar ainda mais suas vendas.\n\nPoderia dar uma olhada e nos confirmar o recebimento por aqui para validarmos com a Loja Integrada? Muito obrigado pela parceria! 🚀`,

      propostaUpsell: `Olá ${sName}! Tudo bem?\n\nSobre a oportunidade de **${top2?.title || 'Automação de WhatsApp para Carrinho Abandonado'}** que identificamos no Diagnóstico:\n\n🔥 ${top2?.commercialPitch || 'Recupere até 25% das vendas perdidas automaticamente todos os meses.'}\n• Prazo de implantação: ${top2?.estimatedDays || 4} dias úteis\n• Impacto estimado: ${top2?.expectedImpact || '+20% no faturamento'}\n\nPodemos incluir essa melhoria no seu plano de aceleração esta semana?`,
    };

    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// Vite Middleware or Static Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Diagnóstico Loja Integrada (DigiBrands) server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
