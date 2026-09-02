import React, { useState, useEffect } from 'react';
import { StoreAuditData } from '../types';
import { X, Save, Building2, Globe, User, Phone, Mail, FileText, Tag, ShoppingCart } from 'lucide-react';

interface EditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreAuditData | null;
  onSave: (updatedStore: StoreAuditData) => void;
}

export const EditStoreModal: React.FC<EditStoreModalProps> = ({
  isOpen,
  onClose,
  store,
  onSave
}) => {
  const [formData, setFormData] = useState({
    storeName: '',
    sellerName: '',
    sellerWhatsapp: '',
    sellerEmail: '',
    storeUrl: '',
    segment: '',
    notes: '',
    item11_1SalesData: '',
    overallScore: 0
  });

  useEffect(() => {
    if (store) {
      setFormData({
        storeName: store.storeName || '',
        sellerName: store.sellerName || '',
        sellerWhatsapp: store.sellerWhatsapp || '',
        sellerEmail: store.sellerEmail || '',
        storeUrl: store.storeUrl || '',
        segment: store.segment || '',
        notes: store.notes || '',
        item11_1SalesData: store.item11_1SalesData || '',
        overallScore: store.overallScore || 0
      });
    }
  }, [store]);

  if (!isOpen || !store) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreAuditData = {
      ...store,
      storeName: formData.storeName.trim() || store.storeName,
      sellerName: formData.sellerName.trim() || store.sellerName,
      sellerWhatsapp: formData.sellerWhatsapp.trim(),
      sellerEmail: formData.sellerEmail.trim(),
      storeUrl: formData.storeUrl.trim() || store.storeUrl,
      segment: formData.segment.trim() || store.segment,
      notes: formData.notes.trim(),
      item11_1SalesData: formData.item11_1SalesData.trim(),
      overallScore: Number(formData.overallScore) || store.overallScore
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e4dfd6] shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#e4dfd6] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5b3a6b]/10 text-[#5b3a6b] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1f2430]">Editar Dados da Loja</h3>
              <p className="text-xs text-[#7a7568]">Atualize as informações cadastrais e dados operacionais da loja</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7a7568] hover:bg-[#faf8f5] hover:text-[#1f2430] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#1f2430] flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-[#5b3a6b]" />
                Nome da Loja
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#e4dfd6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b3a6b]/20 focus:border-[#5b3a6b]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1f2430] flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-[#5b3a6b]" />
                URL da Loja
              </label>
              <input
                type="url"
                required
                value={formData.storeUrl}
                onChange={e => setFormData({ ...formData, storeUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#e4dfd6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b3a6b]/20 focus:border-[#5b3a6b]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1f2430] flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-[#5b3a6b]" />
                Nome do Lojista
              </label>
              <input
                type="text"
                value={formData.sellerName}
                onChange={e => setFormData({ ...formData, sellerName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#e4dfd6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b3a6b]/20 focus:border-[#5b3a6b]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1f2430] flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-[#5b3a6b]" />
                Segmento / Nicho
              </label>
              <input
                type="text"
                value={formData.segment}
                onChange={e => setFormData({ ...formData, segment: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#e4dfd6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b3a6b]/20 focus:border-[#5b3a6b]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1f2430] flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-[#5b3a6b]" />
                WhatsApp do Lojista
              </label>
              <input
                type="text"
                value={formData.sellerWhatsapp}
                onChange={e => setFormData({ ...formData, sellerWhatsapp: e.target.value })}
                placeholder="(51) 99999-9999"
                className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#e4dfd6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b3a6b]/20 focus:border-[#5b3a6b]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1f2430] flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-[#5b3a6b]" />
                E-mail do Lojista
              </label>
              <input
                type="email"
                value={formData.sellerEmail}
                onChange={e => setFormData({ ...formData, sellerEmail: e.target.value })}
                placeholder="contato@loja.com.br"
                className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#e4dfd6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b3a6b]/20 focus:border-[#5b3a6b]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1f2430] flex items-center gap-1.5 mb-1">
              <ShoppingCart className="w-3.5 h-3.5 text-[#e0663f]" />
              Dados de Vendas (Item 11.1 - Última venda e volume nos últimos 30/60/90 dias)
            </label>
            <input
              type="text"
              value={formData.item11_1SalesData}
              onChange={e => setFormData({ ...formData, item11_1SalesData: e.target.value })}
              placeholder="Ex: Última venda há 4 dias; 48 pedidos no mês (~R$ 12.400)"
              className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#e4dfd6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b3a6b]/20 focus:border-[#5b3a6b]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1f2430] flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#5b3a6b]" />
              Observações Gerais da Agência
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Anotações internas sobre o atendimento do seller..."
              className="w-full px-3 py-2 text-xs bg-[#faf8f5] border border-[#e4dfd6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b3a6b]/20 focus:border-[#5b3a6b]"
            />
          </div>

          <div className="pt-4 border-t border-[#e4dfd6] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7a7568] hover:text-[#1f2430] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5b3a6b] hover:bg-[#3d2749] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
