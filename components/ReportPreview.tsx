
import React from 'react';
import { SectorConfig, ReportEntry } from '../types';
import { STRATEGIC_ACTIONS } from '../constants';

interface ReportPreviewProps {
  sector: SectorConfig;
  entries: ReportEntry[];
}

interface EvidenceSummary {
  actionId: string;
  actionTitle: string;
  deliveryTitle: string;
  fileName: string;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ sector, entries }) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Helper to check if an entry is empty or marked as inactive
  const hasContent = (entry?: ReportEntry) => {
    if (!entry) return false;
    if (entry.hasActivities === false) return false;
    return entry.deliveries && entry.deliveries.length > 0;
  };

  // Helper to collect all evidences for summary table
  const collectEvidences = (): EvidenceSummary[] => {
    const summary: EvidenceSummary[] = [];
    STRATEGIC_ACTIONS.forEach(action => {
      const entry = entries.find(e => e.actionId === action.id);
      if (hasContent(entry)) {
        entry?.deliveries.forEach(delivery => {
          delivery.attachments.forEach(file => {
            summary.push({
              actionId: action.id,
              actionTitle: action.id, // Gets ID directly
              deliveryTitle: delivery.title,
              fileName: file.name
            });
          });
        });
      }
    });
    return summary;
  };

  const evidences = collectEvidences();

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-[15mm] text-justify text-black font-sans shadow-none print:shadow-none">
      
      {/* Header Oficial */}
      <div className="flex items-center gap-6 mb-8 border-b-2 border-gov-blue pb-4">
        <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Bras%C3%A3o_do_Tocantins.svg/1200px-Bras%C3%A3o_do_Tocantins.svg.png" 
            alt="Brasão Tocantins" 
            className="h-24 w-auto object-contain"
        />
        <div className="flex-1">
            <h1 className="text-xl font-bold uppercase text-gov-blue">Governo do Estado do Tocantins</h1>
            <h2 className="text-lg font-semibold text-gray-800">Secretaria da Fazenda</h2>
            <h3 className="text-base font-medium text-gray-700">Superintendência de Tecnologia e Inovação Fazendária</h3>
        </div>
      </div>

      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold uppercase mb-2 tracking-wide">Relatório de Prestação de Contas 2025</h2>
        <h3 className="text-xl font-semibold text-gray-800">{sector.name}</h3>
        <p className="text-sm text-gray-500 mt-2 italic">Gerado em: {currentDate}</p>
      </div>

      <div className="space-y-10">
        {STRATEGIC_ACTIONS.map((action, actionIndex) => {
            const entry = entries.find(e => e.actionId === action.id);
            
            // Skip inactive or empty actions
            if (!hasContent(entry)) return null;

            // Define Action Number based on ID
            const actionNumberStr = action.id;

            return (
                <div key={action.id} className="break-inside-avoid">
                    {/* Título da Ação */}
                    <div className="mb-4">
                        <h3 className="font-bold text-lg text-gray-900 border-l-4 border-gov-blue pl-3 uppercase">
                          {actionNumberStr}. {action.action}
                        </h3>
                    </div>
                    
                    {/* Lista de Entregas */}
                    <div className="pl-2 space-y-6">
                      {entry?.deliveries.map((delivery, deliveryIndex) => (
                        <div key={delivery.id} className="break-inside-avoid relative pl-6">
                            {/* Linha conectora visual (opcional) */}
                            <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200"></div>

                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="font-bold text-base text-gov-blue">
                                    {actionNumberStr}.{deliveryIndex + 1}
                                </span>
                                <h4 className="font-bold text-base text-gray-800">
                                    {delivery.title}
                                </h4>
                                <span className="text-sm font-semibold text-gray-500 uppercase ml-auto border border-gray-200 px-2 py-0.5 rounded">
                                    {delivery.date}
                                </span>
                            </div>

                          <div className="pl-4">
                            {/* Descrição */}
                            {delivery.description && (
                                <div className="text-sm leading-relaxed whitespace-pre-wrap mb-3 text-gray-700">
                                {delivery.description}
                                </div>
                            )}

                            {/* Resultados */}
                            {delivery.results && (
                              <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100 mb-2">
                                <span className="text-xs font-bold text-gov-blue uppercase block mb-1">Resultados / Benefícios:</span>
                                <p className="text-sm italic text-gray-700 whitespace-pre-wrap">
                                  {delivery.results}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Separator for clarity between actions */}
                    <div className="my-8 border-b border-gray-100 w-2/3 mx-auto"></div>
                </div>
            );
        })}

        {entries.filter(e => hasContent(e)).length === 0 && (
            <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-lg text-gray-500 font-medium">Nenhuma atividade registrada e ativa para este setor em 2025.</p>
            </div>
        )}
      </div>

      {/* Tabela de Evidências Consolidada (Anexo) */}
      {evidences.length > 0 && (
        <div className="mt-12 break-before-page">
            <h3 className="font-bold uppercase text-lg mb-4 border-b-2 border-black pb-2 text-gray-800">
                Anexo I - Relação de Evidências e Documentos
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-300">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 border-b border-gray-300 w-20 text-center">Item</th>
                            <th className="px-4 py-3 border-b border-gray-300">Entrega / Marco</th>
                            <th className="px-4 py-3 border-b border-gray-300">Arquivo Anexado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {evidences.map((ev, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-center font-mono text-gray-500">Ação {ev.actionTitle}</td>
                                <td className="px-4 py-2 font-medium text-gray-800">{ev.deliveryTitle}</td>
                                <td className="px-4 py-2 text-blue-600 underline decoration-dotted">{ev.fileName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">* Os arquivos digitais citados encontram-se arquivados eletronicamente no sistema de gestão da STIF.</p>
        </div>
      )}

      {/* Área de Assinaturas */}
      <div className="mt-20 pt-10 border-t-2 border-gray-300 page-break-inside-avoid">
        <div className="grid grid-cols-2 gap-20">
            <div className="text-center">
                 <div className="h-16"></div> {/* Espaço para assinatura */}
                 <div className="border-t border-black pt-2">
                    <p className="font-bold text-sm uppercase mb-1">Responsável pelo Setor</p>
                    <p className="text-xs text-gray-600">{sector.name}</p>
                 </div>
            </div>
            <div className="text-center">
                 <div className="h-16"></div> {/* Espaço para assinatura */}
                 <div className="border-t border-black pt-2">
                    <p className="font-bold text-sm uppercase mb-1">Superintendente</p>
                    <p className="text-xs text-gray-600">Tecnologia e Inovação Fazendária</p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};