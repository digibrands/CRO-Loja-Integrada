import React, { useState } from 'react';
import { StoreAuditData, LeadStatus } from '../types';
import { 
  CheckCircle2, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  DollarSign, 
  Building2, 
  Calendar,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DeliveryProofManagerProps {
  store: StoreAuditData;
  onUpdateStore: (updated: StoreAuditData) => void;
  onOpenPdfTab: () => void;
}

export const DeliveryProofManager: React.FC<DeliveryProofManagerProps> = ({
  store,
  onUpdateStore,
  onOpenPdfTab
}) => {
  const [layoutBefore, setLayoutBefore] = useState(store.beforeAfterNotes?.layoutBeforeDesc || '');
  const [layoutAfter, setLayoutAfter] = useState(store.beforeAfterNotes?.layoutAfterDesc || '');
  const [seoBefore, setSeoBefore] = useState(store.beforeAfterNotes?.seoBeforeDesc || '');
  const [seoAfter, setSeoAfter] = useState(store.beforeAfterNotes?.seoAfterDesc || '');
  const [domainBefore, setDomainBefore] = useState(store.beforeAfterNotes?.domainBeforeDesc || '');
  const [domainAfter, setDomainAfter] = useState(store.beforeAfterNotes?.domainAfterDesc || '');
  const [approvalNote, setApprovalNote] = useState(store.clientApprovalNote || '');

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (newStatus === 'concluida') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onUpdateStore({
      ...store,
      status: newStatus,
      beforeAfterNotes: {
        layoutBeforeDesc: layoutBefore,
        layoutAfterDesc: layoutAfter,
        seoBeforeDesc: seoBefore,
        seoAfterDesc: seoAfter,
        domainBeforeDesc: domainBefore,
        domainAfterDesc: domainAfter,
      },
      clientApprovalNote: approvalNote
    });
  };

  const handleSaveNotes = () => {
    onUpdateStore({
      ...store,
      beforeAfterNotes: {
        layoutBeforeDesc: layoutBefore,
        layoutAfterDesc: layoutAfter,
        seoBeforeDesc: seoBefore,
        seoAfterDesc: seoAfter,
        domainBeforeDesc: domainBefore,
        domainAfterDesc: domainAfter,
      },
      clientApprovalNote: approvalNote
    });
    alert('Comprovantes e notas salvos com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Payout Info */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-[#3d2749] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400 text-emerald-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase">
              Validação Oficial LI
            </span>
            <span className="text-emerald-200 text-xs">
              Portal: campanhalojapronta.lojaintegrada.com.br/agencia
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Comprovação de Entrega & Faturamento da Agência
          </h2>
          <p className="text-xs text-emerald-100 max-w-2xl">
            Para liberação do pagamento de <b>R$ 100,00 por loja</b>, anexe os 3 comprovantes obrigatórios e mova o status para <b>Concluída</b>.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 flex flex-col items-center justify-center shrink-0">
          <span className="text-[10px] text-white/80 uppercase font-semibold">Valor a Receber</span>
          <span className="text-3xl font-extrabold text-white">R$ 100,00</span>
          <span className="text-[10px] text-emerald-300 font-medium">por loja entregue e validada</span>
        </div>
      </div>

      {/* Status Controller */}
      <div className="bg-white rounded-2xl p-5 border border-[#e4dfd6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#7a7568] uppercase block">Status no Portal da Agência:</span>
          <h3 className="text-base font-bold text-[#1f2430]">
            Gerenciar Status do Atendimento
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={store.status}
            onChange={e => handleStatusChange(e.target.value as LeadStatus)}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-[#e4dfd6] bg-[#faf8f5] text-[#1f2430] focus:ring-2 focus:ring-[#5b3a6b] cursor-pointer"
          >
            <option value="aguardando_inicio">1. Aguardando Início (Sistema)</option>
            <option value="contato_iniciado">2. Contato Iniciado (Prazo 30d começa)</option>
            <option value="aguardando_material">3. Aguardando Material do Lojista</option>
            <option value="em_execucao">4. Em Execução (Banho de Loja)</option>
            <option value="aguardando_aprovacao">5. Aguardando Aprovação da Loja</option>
            <option value="concluida">6. Concluída (Upload de comprovantes feito) ✓</option>
            <option value="pagamento_liberado">7. Pagamento Liberado (Validado pela LI) 🎉</option>
            <option value="comprovante_recusado">8. Comprovante Recusado (Corrigir)</option>
            <option value="nao_retornou_contato">9. Não Retornou Contato (4 tentativas)</option>
            <option value="lojista_desistiu">10. Lojista Desistiu</option>
            <option value="beneficio_expirado">11. Benefício Expirado (30 dias)</option>
          </select>

          <a
            href="https://campanhalojapronta.lojaintegrada.com.br/agencia"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#5b3a6b] text-white hover:bg-[#3d2749] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Portal da Agência
          </a>
        </div>
      </div>

      {/* The 3 Mandatory Proof Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proof 1: PDF Diagnosis */}
        <div className="bg-white rounded-2xl p-5 border border-[#e4dfd6] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h4 className="text-xs font-bold text-[#1f2430]">
              Diagnóstico Realizado (PDF)
            </h4>
          </div>

          <p className="text-xs text-[#7a7568]">
            Documento com a auditoria feita e as 3 prioridades identificadas (Top 1, Top 2, Top 3).
          </p>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pronto para Anexo
            </span>
            <button
              onClick={onOpenPdfTab}
              className="text-emerald-800 font-bold hover:underline cursor-pointer"
            >
              Ver PDF →
            </button>
          </div>
        </div>

        {/* Proof 2: Before & After Document */}
        <div className="bg-white rounded-2xl p-5 border border-[#e4dfd6] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h4 className="text-xs font-bold text-[#1f2430]">
              Documento de Antes & Depois
            </h4>
          </div>

          <p className="text-xs text-[#7a7568]">
            Comprovante destacando os entregáveis do Top 1 (Layout antigo x novo, SEO dos 20 produtos, Domínio).
          </p>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Registros Preenchidos
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">3 pilares</span>
          </div>
        </div>

        {/* Proof 3: Seller Approval */}
        <div className="bg-white rounded-2xl p-5 border border-[#e4dfd6] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h4 className="text-xs font-bold text-[#1f2430]">
              Confirmação do Lojista
            </h4>
          </div>

          <p className="text-xs text-[#7a7568]">
            Print de WhatsApp ou e-mail de que o cliente recebeu o benefício e a loja revisada.
          </p>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#5b3a6b] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#5b3a6b]" /> WhatsApp OK
            </span>
            <span className="text-[10px] text-[#5b3a6b]">Aprovado</span>
          </div>
        </div>
      </div>

      {/* Before & After Details Editor */}
      <div className="bg-white rounded-2xl p-6 border border-[#e4dfd6] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1f2430]">
              Registro dos Entregáveis de Antes & Depois (Top 1)
            </h3>
            <p className="text-xs text-[#7a7568]">
              Descreva as alterações efetuadas para inclusão no dossiê de comprovação da Loja Integrada
            </p>
          </div>
          <button
            onClick={handleSaveNotes}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#5b3a6b] text-white hover:bg-[#3d2749] cursor-pointer"
          >
            Salvar Comprovantes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#1f2430]">Layout Antes (Estado Inicial):</label>
            <textarea
              rows={2}
              value={layoutBefore}
              onChange={e => setLayoutBefore(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-[#faf8f5]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-emerald-800">Layout Depois (Estado Final com 1 Banner):</label>
            <textarea
              rows={2}
              value={layoutAfter}
              onChange={e => setLayoutAfter(e.target.value)}
              className="w-full p-2 rounded-lg border border-emerald-300 bg-emerald-50/40"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1f2430]">SEO Produtos Antes:</label>
            <textarea
              rows={2}
              value={seoBefore}
              onChange={e => setSeoBefore(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-[#faf8f5]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-emerald-800">SEO 20 Produtos Depois:</label>
            <textarea
              rows={2}
              value={seoAfter}
              onChange={e => setSeoAfter(e.target.value)}
              className="w-full p-2 rounded-lg border border-emerald-300 bg-emerald-50/40"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1f2430]">Domínio Antes:</label>
            <input
              type="text"
              value={domainBefore}
              onChange={e => setDomainBefore(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#e4dfd6] bg-[#faf8f5]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-emerald-800">Domínio Depois (Configurado):</label>
            <input
              type="text"
              value={domainAfter}
              onChange={e => setDomainAfter(e.target.value)}
              className="w-full p-2 rounded-lg border border-emerald-300 bg-emerald-50/40"
            />
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <label className="font-bold text-[#5b3a6b] text-xs">Registro de Confirmação do Lojista (WhatsApp / E-mail):</label>
          <textarea
            rows={2}
            value={approvalNote}
            onChange={e => setApprovalNote(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-[#e4dfd6] bg-[#faf8f5]"
          />
        </div>
      </div>

      {/* Invoice (NF) and Tax Guidance */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold">
              Instruções para Emissão de Nota Fiscal (NF) & Recebimento
            </h3>
          </div>
          <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
            Janela: Dias 06 a 10
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-bold text-amber-300 block">1. Validação LI (Até dia 05)</span>
            <p className="leading-relaxed">
              Até o dia 5 do mês atual, a Loja Integrada valida as entregas e libera o fechamento no portal.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-bold text-amber-300 block">2. Envio da NF (Dias 06 a 10)</span>
            <p className="leading-relaxed">
              Enviar para <b>financeiro@lojaintegrada.com.br</b> com cópia para <b>raisa.lopes@lojaintegrada.com.br</b>.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-bold text-amber-300 block">3. CNAE & Código de Serviço</span>
            <p className="leading-relaxed">
              CNAE: <b>7319-0/02</b> ou 7490-1/04 · Código Municipal: <b>17.06</b> (Propaganda e Publicidade).
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed">
          <b className="text-amber-400">Texto obrigatório na Descrição do Serviço da NF:</b><br/>
          "Comissão pela configuração e entrega de lojas da ação Loja Pronta, referente às entregas realizadas e validadas no período de [MÊS/ANO], conforme fechamento e validação da Loja Integrada."
        </div>
      </div>
    </div>
  );
};
