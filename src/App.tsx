import React, { useState, useEffect } from 'react';
import { StoreAuditData } from './types';
import { INITIAL_SAMPLE_STORE } from './data/defaultChecklist';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ChecklistMatrix } from './components/ChecklistMatrix';
import { ActionPlanView } from './components/ActionPlanView';
import { PdfPreviewReport } from './components/PdfPreviewReport';
import { ReportLabPythonView } from './components/ReportLabPythonView';
import { DeliveryProofManager } from './components/DeliveryProofManager';
import { WhatsAppAssistant } from './components/WhatsAppAssistant';
import { StoreFormModal } from './components/StoreFormModal';
import { StoreListPanel } from './components/StoreListPanel';
import { EditStoreModal } from './components/EditStoreModal';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  FileText, 
  Code2, 
  MessageSquare, 
  ShieldCheck,
  Plus,
  ArrowLeft,
  ChevronRight,
  Store
} from 'lucide-react';

export default function App() {
  const [stores, setStores] = useState<StoreAuditData[]>(() => {
    try {
      const saved = localStorage.getItem('loja_integrada_audits');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved audits', e);
    }
    return [];
  });

  const [activeStoreId, setActiveStoreId] = useState<string>(() => {
    return stores[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<'stores' | 'overview' | 'checklist' | 'actionplan' | 'pdf' | 'python' | 'delivery' | 'whatsapp'>('stores');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreAuditData | null>(null);

  // Load from backend database API on start
  useEffect(() => {
    async function loadStoresFromBackend() {
      try {
        const res = await fetch('/api/stores');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setStores(json.data);
            if (json.data.length > 0) {
              setActiveStoreId(prev => prev && json.data.some((s: any) => s.id === prev) ? prev : json.data[0].id);
            } else {
              setActiveStoreId('');
            }
          }
        }
      } catch (err) {
        console.warn('Backend store load fallback to local storage:', err);
      }
    }
    loadStoresFromBackend();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('loja_integrada_audits', JSON.stringify(stores));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [stores]);

  const currentStore: StoreAuditData | null = stores.find(s => s?.id === activeStoreId) || stores[0] || null;

  const handleUpdateCurrentStore = async (updated: StoreAuditData) => {
    setStores(prev => prev.map(s => s.id === updated.id ? updated : s));
    try {
      await fetch(`/api/stores/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.warn('Could not sync store to backend:', err);
    }
  };

  const handleAuditComplete = async (newStore: StoreAuditData) => {
    setStores(prev => [newStore, ...prev.filter(s => s.id !== newStore.id)]);
    setActiveStoreId(newStore.id);
    setActiveTab('overview');
    try {
      await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore)
      });
    } catch (err) {
      console.warn('Could not sync new store to backend:', err);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    const remaining = stores.filter(s => s.id !== storeId);
    setStores(remaining);
    if (remaining.length === 0) {
      setActiveStoreId('');
      setActiveTab('stores');
    } else {
      if (activeStoreId === storeId) {
        setActiveStoreId(remaining[0].id);
      }
    }
    try {
      await fetch(`/api/stores/${storeId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not delete store from backend:', err);
    }
  };

  const handleSelectStoreFromList = (storeId: string, targetTab: 'overview' | 'checklist' | 'actionplan' | 'pdf' = 'overview') => {
    setActiveStoreId(storeId);
    setActiveTab(targetTab);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1f2430] flex flex-col font-sans selection:bg-[#5b3a6b]/20 selection:text-[#3d2749]">
      {/* Top Application Header */}
      <Header
        store={currentStore}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewAuditClick={() => setIsModalOpen(true)}
        onExportPdf={() => setActiveTab('pdf')}
        storeCount={stores.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb / Context bar when in diagnosis sub-tabs */}
        {activeTab !== 'stores' && (
          <div className="bg-white px-4 py-2.5 rounded-xl border border-[#e4dfd6] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('stores')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#5b3a6b] hover:text-[#3d2749] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Painel de Lojas</span>
              </button>
              <span className="text-[#e4dfd6]">|</span>
              <div className="flex items-center gap-1.5 text-xs text-[#7a7568]">
                <span>Loja Selecionada:</span>
                <span className="font-bold text-[#1f2430] bg-[#faf8f5] px-2 py-0.5 rounded border border-[#e4dfd6]">
                  {currentStore.storeName}
                </span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {currentStore.overallScore}/100 Pts
                </span>
              </div>
            </div>

            {/* Quick switcher to other stores */}
            {stores.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] text-[#7a7568] font-medium hidden sm:inline">Trocar loja:</span>
                <select
                  value={activeStoreId}
                  onChange={(e) => setActiveStoreId(e.target.value)}
                  className="text-xs bg-[#faf8f5] border border-[#e4dfd6] rounded-lg px-2.5 py-1 font-semibold text-[#1f2430] focus:outline-none focus:ring-1 focus:ring-[#5b3a6b]"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.storeName} ({s.overallScore} pts)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Tab Content */}
        {activeTab === 'stores' && (
          <StoreListPanel
            stores={stores}
            onSelectStore={handleSelectStoreFromList}
            onNewAuditClick={() => setIsModalOpen(true)}
            onEditStore={(store) => setEditingStore(store)}
            onDeleteStore={handleDeleteStore}
            onUpdateStore={handleUpdateCurrentStore}
          />
        )}

        {activeTab !== 'stores' && !currentStore && (
          <div className="bg-white rounded-2xl border border-dashed border-[#e4dfd6] p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#faf8f5] text-[#7a7568] flex items-center justify-center mx-auto">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1f2430]">Nenhuma loja selecionada</h3>
              <p className="text-xs text-[#7a7568] mt-1">
                Cadastre ou selecione uma loja no painel para visualizar o diagnóstico e relatórios.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveTab('stores')}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1f2430] text-xs font-bold transition-colors cursor-pointer"
              >
                Ir para o Painel de Lojas
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5b3a6b] hover:bg-[#3d2749] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Nova Loja com IA
              </button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && currentStore && (
          <DashboardOverview 
            store={currentStore} 
            onNavigateTab={setActiveTab} 
          />
        )}

        {activeTab === 'checklist' && currentStore && (
          <ChecklistMatrix 
            store={currentStore} 
            onUpdateStore={handleUpdateCurrentStore} 
          />
        )}

        {activeTab === 'actionplan' && currentStore && (
          <ActionPlanView 
            store={currentStore} 
            onUpdateStore={handleUpdateCurrentStore} 
          />
        )}

        {activeTab === 'pdf' && currentStore && (
          <PdfPreviewReport 
            store={currentStore} 
            onNavigateTab={setActiveTab} 
          />
        )}

        {activeTab === 'python' && currentStore && (
          <ReportLabPythonView 
            store={currentStore} 
          />
        )}

        {activeTab === 'whatsapp' && currentStore && (
          <WhatsAppAssistant 
            store={currentStore} 
            onUpdateStore={handleUpdateCurrentStore} 
          />
        )}

        {activeTab === 'delivery' && currentStore && (
          <DeliveryProofManager 
            store={currentStore} 
            onUpdateStore={handleUpdateCurrentStore}
            onOpenPdfTab={() => setActiveTab('pdf')}
          />
        )}
      </main>

      {/* Modal for AI Auditing */}
      <StoreFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAuditComplete={handleAuditComplete}
      />

      {/* Modal for Editing Store Info */}
      <EditStoreModal
        isOpen={!!editingStore}
        onClose={() => setEditingStore(null)}
        store={editingStore}
        onSave={handleUpdateCurrentStore}
      />
    </div>
  );
}
