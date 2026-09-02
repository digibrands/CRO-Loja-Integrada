import React, { useState } from 'react';
import { StoreAuditData } from '../types';
import { 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  AlertCircle, 
  Send,
  UserCheck,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface WhatsAppAssistantProps {
  store: StoreAuditData;
  onUpdateStore: (updated: StoreAuditData) => void;
}

export const WhatsAppAssistant: React.FC<WhatsAppAssistantProps> = ({ store, onUpdateStore }) => {
  const [agencyName, setAgencyName] = useState('DigiBrands');
  const [consultantName, setConsultantName] = useState('Lucas');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cleanPhone = store.sellerWhatsapp.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  // Campaign templates
  const messages = {
    primeiroContato: `Olá! 👋
Meu nome é ${consultantName} e faço parte da Agência ${agencyName}, parceira oficial da Loja Integrada.
A Loja Integrada me contratou para executar um benefício pra você: um diagnóstico completo da sua loja + plano de ação, pra te ajudar a vender 🎉

⚠️ Importante: o benefício possui validade de 30 dias corridos a partir de hoje, nosso primeiro contato. Dentro desse período, precisamos receber todas as informações necessárias para seguirmos com o diagnóstico e a entrega da sua loja.

Fico à disposição para te ajudar no que precisar 🚀`,

    coletaMaterial: `Olá ${store.sellerName}! Tudo bem por aí? 🌟

Estamos estruturando o Diagnóstico Técnico da *${store.storeName}* e a execução do seu benefício de **Banho de Loja** (layout + 1 banner profissional, SEO dos 20 produtos e configuração de domínio).

Para iniciarmos a implementação sem atrasar seu prazo legal de 7 dias, precisamos de:
1. Convite de usuário como "Agência Parceira" no painel da sua loja (área de Usuários);
2. Logotipo em boa resolução e cores preferidas;
3. Lista dos 20 produtos principais que você mais quer destacar;
4. Dados do seu domínio próprio (caso já tenha registrado).

Podemos alinhar rapidinho hoje?`,

    quartaTentativa: `Olá ${store.sellerName}! ⚠️

Esta é a nossa 4ª tentativa de contato referente ao benefício oficial da Loja Integrada para a loja *${store.storeName}*.

Como a janela de coleta de 7 dias está se encerrando, caso não tenhamos seu retorno, o atendimento precisará ser registrado como "Não retornou contato" no portal da Loja Integrada.

Ainda dá tempo de receber a sua loja pronta e o diagnóstico 100% gratuito! Me responda por aqui para darmos início.`,

    entregaTop1ComUpsell: `Olá ${store.sellerName}! 🎉

Concluímos com sucesso a execução do **Top 1 — Banho de Loja** da *${store.storeName}*!

✅ Layout revisado com 1 Banner Promocional profissional;
✅ SEO e descrições ricas implementadas nos 20 produtos principais;
✅ Configuração e apontamento do domínio próprio ${store.top1.domainName || ''}.

📄 Em anexo estou te enviando o **PDF Completo do Diagnóstico** com a nota e avaliação das 11 áreas da sua loja.

💡 No relatório, destacamos também o **Top 2 (${store.top2.title})** e o **Top 3 (${store.top3.title})** como recomendações para você acelerar suas vendas ainda mais.

Poderia conferir a loja e me mandar uma confirmação de recebimento por aqui para validarmos com a Loja Integrada? Muito obrigado! 🚀`,

    propostaUpsell: `Olá ${store.sellerName}! Tudo bem?

Sobre a oportunidade de **${store.top2.title}** que identificamos no Diagnóstico:

🔥 ${store.top2.commercialPitch}
• Investimento especial parceiro: R$ ${store.top2.estimatedPrice},00
• Prazo: ${store.top2.estimatedDays} dias úteis
• Impacto esperado: ${store.top2.expectedImpact}

Podemos agendar para rodar essa melhoria na sua loja esta semana?`
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${formattedPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const incrementAttempts = () => {
    onUpdateStore({
      ...store,
      contactAttempts: (store.contactAttempts || 0) + 1,
      status: store.contactAttempts >= 3 ? 'nao_retornou_contato' : 'contato_iniciado'
    });
  };

  return (
    <div className="space-y-6">
      {/* Config Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#e4dfd6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#1f2430]">
            Assistente de Comunicação WhatsApp & SLA 24h
          </h2>
          <p className="text-xs text-[#7a7568]">
            Mensagens oficiais pré-formatadas para garantir conformidade com as regras da Loja Integrada
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] font-bold text-[#7a7568] block">Nome da Agência:</label>
            <input
              type="text"
              value={agencyName}
              onChange={e => setAgencyName(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#e4dfd6] bg-[#faf8f5]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#7a7568] block">Nome do Especialista:</label>
            <input
              type="text"
              value={consultantName}
              onChange={e => setConsultantName(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#e4dfd6] bg-[#faf8f5]"
            />
          </div>

          <div className="pt-3">
            <button
              onClick={incrementAttempts}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Registrar Tentativa ({store.contactAttempts || 0}/4)
            </button>
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <b>Regra de SLA da Campanha:</b> A agência tem até <b>24h úteis</b> para realizar o 1º contato. A janela de 7 dias é para coleta de materiais. Caso o lojista não responda, a agência deve realizar no mínimo <b>4 tentativas documentadas</b> dentro dos 7 dias para justificar o status no portal da LI.
        </div>
      </div>

      {/* Message Cards */}
      <div className="space-y-4">
        {/* 1. Primeiro Contato 24h */}
        <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                Passo 1
              </span>
              <h3 className="text-sm font-bold text-[#1f2430]">
                1º Contato Oficial (Em até 24h úteis) — Abordagem Padrão
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700">Obrigatório LI</span>
          </div>

          <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e4dfd6] font-sans text-xs text-[#1f2430] whitespace-pre-wrap leading-relaxed">
            {messages.primeiroContato}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#7a7568]">
              Disparar para: <b>{store.sellerWhatsapp}</b> ({store.sellerName})
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy('m1', messages.primeiroContato)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'm1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'm1' ? 'Copiado!' : 'Copiar Texto'}
              </button>

              <button
                onClick={() => handleOpenWhatsApp(messages.primeiroContato)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar no WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* 2. Coleta de Material (7 dias) */}
        <div className="bg-white rounded-2xl p-5 border border-[#e4dfd6] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">
                Passo 2
              </span>
              <h3 className="text-sm font-bold text-[#1f2430]">
                Solicitação de Materiais (Janela de 7 Dias)
              </h3>
            </div>
          </div>

          <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e4dfd6] font-sans text-xs text-[#1f2430] whitespace-pre-wrap leading-relaxed">
            {messages.coletaMaterial}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => handleCopy('m2', messages.coletaMaterial)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 inline-flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'm2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'm2' ? 'Copiado!' : 'Copiar Texto'}
            </button>

            <button
              onClick={() => handleOpenWhatsApp(messages.coletaMaterial)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar no WhatsApp
            </button>
          </div>
        </div>

        {/* 3. 4ª Tentativa de Contato */}
        <div className="bg-white rounded-2xl p-5 border border-[#e4dfd6] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-xs">
                Aviso
              </span>
              <h3 className="text-sm font-bold text-[#1f2430]">
                4ª Tentativa de Contato (Evitar Expiração de Prazo)
              </h3>
            </div>
          </div>

          <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e4dfd6] font-sans text-xs text-[#1f2430] whitespace-pre-wrap leading-relaxed">
            {messages.quartaTentativa}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => handleCopy('m3', messages.quartaTentativa)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 inline-flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'm3' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'm3' ? 'Copiado!' : 'Copiar Texto'}
            </button>

            <button
              onClick={() => handleOpenWhatsApp(messages.quartaTentativa)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar no WhatsApp
            </button>
          </div>
        </div>

        {/* 4. Entrega Top 1 + Envio do PDF + Upsell */}
        <div className="bg-white rounded-2xl p-5 border-2 border-purple-400 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-100 text-[#5b3a6b] font-bold text-xs">
                Passo 3 & Upsell
              </span>
              <h3 className="text-sm font-bold text-[#1f2430]">
                Entrega do Banho de Loja + Envio do PDF + Gancho Comercial
              </h3>
            </div>
            <span className="text-xs font-bold text-[#e0663f]">Venda de Upsell</span>
          </div>

          <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e4dfd6] font-sans text-xs text-[#1f2430] whitespace-pre-wrap leading-relaxed">
            {messages.entregaTop1ComUpsell}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => handleCopy('m4', messages.entregaTop1ComUpsell)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 inline-flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'm4' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'm4' ? 'Copiado!' : 'Copiar Texto'}
            </button>

            <button
              onClick={() => handleOpenWhatsApp(messages.entregaTop1ComUpsell)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
