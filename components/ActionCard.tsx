import React from 'react';
import { StrategicAction, ReportEntry, SectorId } from '../types';
import { ToggleLeft, ToggleRight, LayoutList, CheckCircle2, AlertCircle, ArrowRight, Eye } from 'lucide-react';

interface ActionCardProps {
  action: StrategicAction;
  sectorId: SectorId;
  data?: ReportEntry;
  onSave: (data: ReportEntry) => void;
  onOpenDrawer: () => void;
  readOnly?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, sectorId, data, onSave, onOpenDrawer, readOnly = false }) => {
  // Default hasActivities to true if undefined, unless explicitly false
  const hasActivities = data?.hasActivities !== false; 
  const deliveriesCount = data?.deliveries?.length || 0;

  const toggleActivities = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening drawer when clicking toggle
    if (readOnly) return;

    onSave({
      actionId: action.id,
      sectorId,
      deliveries: data?.deliveries || [], 
      hasActivities: !hasActivities,
      lastUpdated: Date.now()
    });
  };

  return (
    <div 
      className={`relative group flex flex-col justify-between bg-white rounded-xl shadow-sm border transition-all duration-300 h-full hover:shadow-md cursor-pointer
        ${hasActivities ? 'border-gray-200' : 'border-gray-100 bg-gray-50/50 grayscale opacity-70 hover:opacity-100 hover:grayscale-0'}
      `}
      onClick={onOpenDrawer}
    >
      
      {/* Header */}
      <div className={`p-5 rounded-t-xl border-b transition-colors duration-300 ${hasActivities ? 'bg-white border-gray-100' : 'bg-transparent border-transparent'}`}>
        <div className="flex justify-between items-start mb-3">
             <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${hasActivities ? 'bg-blue-50 text-gov-blue' : 'bg-gray-200 text-gray-500'}`}>
               Ação {action.id}
             </span>
             
             <button 
                onClick={toggleActivities}
                className={`focus:outline-none transition-transform ${!readOnly && 'active:scale-95 hover:scale-105'} ${readOnly && 'cursor-not-allowed opacity-80'}`}
                title={readOnly ? "Modo de leitura (Alteração bloqueada)" : (hasActivities ? "Ativa em 2025" : "Sem atividades em 2025")}
                disabled={readOnly}
            >
                {hasActivities ? (
                    <ToggleRight size={28} className="text-green-500" />
                ) : (
                    <ToggleLeft size={28} className="text-gray-400" />
                )}
            </button>
        </div>

        <h3 className={`font-bold text-lg leading-tight line-clamp-3 ${hasActivities ? 'text-gray-800' : 'text-gray-500'}`}>
          {action.action}
        </h3>
      </div>

      {/* Body / Stats */}
      <div className="px-5 py-4 flex-1">
        {hasActivities ? (
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${deliveriesCount > 0 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                    {deliveriesCount > 0 ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <div>
                    <span className="block text-2xl font-bold text-gray-800">{deliveriesCount}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase">Entregas Realizadas</span>
                </div>
            </div>
        ) : (
            <div className="flex items-center gap-3 opacity-60">
                 <div className="p-3 rounded-lg bg-gray-200 text-gray-500">
                    <ToggleLeft size={24} />
                 </div>
                 <div>
                    <span className="block text-sm font-bold text-gray-600">Inativo</span>
                    <span className="text-xs text-gray-500 font-medium uppercase">Sem movimentação</span>
                </div>
            </div>
        )}
      </div>

      {/* Footer / Action */}
      <div className={`p-4 border-t ${hasActivities ? 'border-gray-100 bg-gray-50 rounded-b-xl' : 'border-transparent'}`}>
        <button 
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors
                ${hasActivities 
                    ? 'bg-white border border-gray-200 text-gov-blue shadow-sm hover:bg-gov-blue hover:text-white' 
                    : 'bg-transparent text-gray-500 hover:text-gray-700 hover:underline'}
            `}
        >
            {readOnly ? (
                 <>Ver Detalhes <Eye size={16} /></>
            ) : (
                hasActivities ? (
                    <>Gerenciar Entregas <ArrowRight size={16} /></>
                ) : (
                    <>Ver Detalhes</>
                )
            )}
        </button>
      </div>
    </div>
  );
};