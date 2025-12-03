import React, { useState } from 'react';
import { StrategicAction, ReportEntry, SectorId, DeliveryItem } from '../types';
import { X, Plus, Calendar, FileText, Trash2, Edit2, AlertCircle, ChevronRight } from 'lucide-react';
import { ActionDeliveryModal } from './ActionDeliveryModal';

interface ActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  action: StrategicAction | null;
  sectorId: SectorId;
  data?: ReportEntry;
  onSave: (data: ReportEntry) => void;
}

export const ActionDrawer: React.FC<ActionDrawerProps> = ({ 
    isOpen, 
    onClose, 
    action, 
    sectorId, 
    data, 
    onSave 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DeliveryItem | undefined>(undefined);

  if (!action) return null;

  const hasActivities = data?.hasActivities !== false; 
  const deliveries = data?.deliveries || [];

  const handleOpenModal = (item?: DeliveryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = (item: DeliveryItem) => {
    let newDeliveries = [...deliveries];
    
    if (editingItem) {
      // Edit mode
      newDeliveries = newDeliveries.map(d => d.id === item.id ? item : d);
    } else {
      // Add mode
      newDeliveries.push(item);
    }

    onSave({
      actionId: action.id,
      sectorId,
      deliveries: newDeliveries,
      hasActivities: true,
      lastUpdated: Date.now()
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta entrega?')) {
      const newDeliveries = deliveries.filter(d => d.id !== id);
      onSave({
        actionId: action.id,
        sectorId,
        deliveries: newDeliveries,
        hasActivities: true,
        lastUpdated: Date.now()
      });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="bg-gov-blue text-white p-6 shadow-md flex justify-between items-start">
            <div className="pr-8">
                <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1 block">
                    Gerenciando Ação Estratégica
                </span>
                <h2 className="text-xl font-bold leading-tight">
                    {action.action}
                </h2>
                <div className="mt-2 text-blue-100 text-xs flex items-center gap-2">
                    <Calendar size={12} /> Vigência: {action.startDate} a {action.endDate}
                </div>
            </div>
            <button 
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white"
            >
                <X size={24} />
            </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            
            {/* Reference Description */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição Planejada (Meta)</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{action.description}</p>
            </div>

            {!hasActivities ? (
                <div className="flex flex-col items-center justify-center py-10 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                     <AlertCircle size={48} className="text-gray-400 mb-4" />
                     <h3 className="text-lg font-semibold text-gray-600">Ação Inativa</h3>
                     <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
                        Você marcou esta ação como "Sem Atividades" em 2025. Para adicionar entregas, ative-a novamente no Dashboard.
                     </p>
                </div>
            ) : (
                <div>
                     <div className="flex justify-between items-end mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <ChevronRight className="text-gov-blue" /> Entregas Realizadas
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">
                            {deliveries.length} registros
                        </span>
                    </div>

                    <div className="space-y-4 mb-20">
                        {deliveries.length === 0 && (
                             <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText size={32} className="text-blue-300" />
                                </div>
                                <h4 className="text-gray-800 font-semibold mb-1">Nenhuma entrega cadastrada</h4>
                                <p className="text-gray-500 text-sm mb-6">Registre os marcos importantes e projetos finalizados vinculados a esta ação.</p>
                                <button 
                                    onClick={() => handleOpenModal()}
                                    className="bg-gov-blue text-white hover:bg-blue-800 px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
                                >
                                    Adicionar Primeira Entrega
                                </button>
                            </div>
                        )}

                        {deliveries.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all group relative">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                                     <button 
                                        onClick={() => handleOpenModal(item)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                         <div className="bg-blue-50 text-gov-blue p-2 rounded-lg mb-2">
                                            <Calendar size={20} />
                                         </div>
                                         <div className="h-full w-0.5 bg-gray-100"></div>
                                    </div>
                                    
                                    <div className="flex-1 pb-2">
                                        <div className="flex justify-between items-start pr-16">
                                            <h5 className="font-bold text-gray-800 text-lg">{item.title}</h5>
                                        </div>
                                        <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded mb-2">
                                            {item.date}
                                        </span>
                                        <div className="text-sm text-gray-600 leading-relaxed mb-3">
                                            {item.description}
                                        </div>
                                        {item.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {item.attachments.map(file => (
                                                    <span key={file.id} className="inline-flex items-center gap-1 text-[10px] bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-500">
                                                        <FileText size={10} /> {file.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Drawer Footer (Floating Add Button if content exists) */}
        {hasActivities && (
            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                 <button 
                    onClick={() => handleOpenModal()}
                    className="w-full py-3 bg-gov-blue hover:bg-blue-800 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Plus size={24} />
                    Adicionar Nova Entrega
                </button>
            </div>
        )}

        <ActionDeliveryModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveItem}
            initialData={editingItem}
        />
      </div>
    </>
  );
};