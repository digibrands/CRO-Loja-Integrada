import { KanbanStatus, KanbanHistoryEntry, StoreAuditData } from '../types';

export const KANBAN_STAGES: Array<{
  id: KanbanStatus;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  accentHex: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  headerBg: string;
}> = [
  {
    id: 'loja_analisada',
    label: 'LOJA ANALISADA',
    shortLabel: 'Analisada',
    description: 'Diagnóstico concluído, auditoria e checklist gerados',
    color: '#2563eb',
    accentHex: '#3b82f6',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    border: 'border-blue-200',
    headerBg: 'bg-blue-600'
  },
  {
    id: 'em_execucao_top1',
    label: 'EM EXECUÇÃO TOP1',
    shortLabel: 'Execução TOP1',
    description: 'Executando benefício Loja Integrada (banner, SEO, domínio)',
    color: '#059669',
    accentHex: '#10b981',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    border: 'border-emerald-200',
    headerBg: 'bg-emerald-600'
  },
  {
    id: 'proposta_upsell_enviada',
    label: 'PROPOSTA UPSELL ENVIADA',
    shortLabel: 'Proposta Enviada',
    description: 'Proposta comercial de TOP 2 & TOP 3 enviada ao lojista',
    color: '#c6024e',
    accentHex: '#c6024e',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-[#c6024e]',
    border: 'border-pink-200',
    headerBg: 'bg-[#c6024e]'
  },
  {
    id: 'em_execucao_top2_top3',
    label: 'EM EXECUÇÃO TOP2/TOP3',
    shortLabel: 'Execução TOP2/3',
    description: 'Serviços de upsell contratados em implementação ativa',
    color: '#d97706',
    accentHex: '#f59e0b',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    border: 'border-amber-200',
    headerBg: 'bg-amber-500'
  },
  {
    id: 'finalizadas',
    label: 'FINALIZADAS',
    shortLabel: 'Finalizada',
    description: 'Entregas validadas pelo lojista e ciclo concluído',
    color: '#475569',
    accentHex: '#64748b',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    border: 'border-slate-300',
    headerBg: 'bg-slate-700'
  }
];

export function getKanbanStage(status?: KanbanStatus) {
  const defaultStage = KANBAN_STAGES[0];
  if (!status) return defaultStage;
  return KANBAN_STAGES.find(s => s.id === status) || defaultStage;
}

export function formatDateTime(dateInput?: string | Date): string {
  if (!dateInput) {
    const now = new Date();
    return now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return String(dateInput);
    }
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Ensures the store has a valid kanbanStatus and initial statusHistory if empty.
 */
export function ensureStoreKanban(store: StoreAuditData): StoreAuditData {
  const currentStatus: KanbanStatus = store.kanbanStatus || 'loja_analisada';
  const stage = getKanbanStage(currentStatus);

  let history: KanbanHistoryEntry[] = Array.isArray(store.statusHistory) && store.statusHistory.length > 0 
    ? [...store.statusHistory] 
    : [
        {
          status: currentStatus,
          statusLabel: stage.label,
          date: formatDateTime(store.registeredDate || new Date().toISOString()),
          note: 'Diagnóstico técnico da loja cadastrado'
        }
      ];

  // Guarantee that the latest status is in history
  const hasCurrentInHistory = history.some(h => h.status === currentStatus);
  if (!hasCurrentInHistory) {
    history.push({
      status: currentStatus,
      statusLabel: stage.label,
      date: formatDateTime(new Date().toISOString()),
      note: 'Status atualizado'
    });
  }

  return {
    ...store,
    kanbanStatus: currentStatus,
    statusHistory: history
  };
}

/**
 * Updates a store to a new Kanban stage, recording a history log entry with timestamp.
 */
export function updateStoreKanbanStatus(
  store: StoreAuditData,
  newStatus: KanbanStatus,
  note?: string
): StoreAuditData {
  const targetStage = getKanbanStage(newStatus);
  const nowStr = formatDateTime(new Date().toISOString());

  const currentHistory: KanbanHistoryEntry[] = store.statusHistory ? [...store.statusHistory] : [];
  
  const newEntry: KanbanHistoryEntry = {
    status: newStatus,
    statusLabel: targetStage.label,
    date: nowStr,
    note: note || `Movido para ${targetStage.label}`
  };

  return {
    ...store,
    kanbanStatus: newStatus,
    statusHistory: [...currentHistory, newEntry]
  };
}
