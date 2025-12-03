
import React, { useState, useEffect } from 'react';
import { SECTORS, STRATEGIC_ACTIONS } from './constants';
import { SectorId, ReportEntry } from './types';
import { Header } from './components/Header';
import { ActionCard } from './components/ActionCard';
import { ActionDrawer } from './components/ActionDrawer';
import { ReportPreview } from './components/ReportPreview';
import { StatsDashboard } from './components/StatsDashboard';
import { Printer, LayoutDashboard, FileEdit, CheckCircle2, BarChart3, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  // activeSectorId can be a SectorId enum OR 'OVERVIEW' string
  const [activeSectorId, setActiveSectorId] = useState<string>('OVERVIEW');
  const [reportData, setReportData] = useState<ReportEntry[]>([]);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('stif_report_2025_v2'); 
    if (saved) {
      try {
        setReportData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('stif_report_2025_v2', JSON.stringify(reportData));
  }, [reportData]);

  const handleSaveEntry = (entry: ReportEntry) => {
    setReportData(prev => {
      // Remove existing entry for this action+sector and add new one
      const filtered = prev.filter(e => !(e.actionId === entry.actionId && e.sectorId === entry.sectorId));
      return [...filtered, entry];
    });
  };

  // Identify current context (Overview or specific sector)
  const isOverview = activeSectorId === 'OVERVIEW';
  const currentSector = SECTORS.find(s => s.id === activeSectorId);

  const handleOpenDrawer = (actionId: string) => {
      setSelectedActionId(actionId);
      setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
      setIsDrawerOpen(false);
      setTimeout(() => setSelectedActionId(null), 300); // Wait for animation
  };

  // Helper to calculate progress for a specific sector
  const calculateSectorProgress = (secId: string) => {
    const completed = STRATEGIC_ACTIONS.reduce((acc, action) => {
        const entry = reportData.find(e => e.actionId === action.id && e.sectorId === secId);
        
        // No entry = not done
        if (!entry) return acc;
        
        // Inactive = done (compliant)
        if (entry.hasActivities === false) return acc + 1;
        
        // Active with deliveries = done
        if (entry.deliveries && entry.deliveries.length > 0) return acc + 1;
        
        return acc;
    }, 0);
    
    return {
        completed,
        total: STRATEGIC_ACTIONS.length,
        percentage: Math.round((completed / STRATEGIC_ACTIONS.length) * 100)
    };
  };

  // Progress for Sidebar (Current active sector or N/A for Overview)
  const currentProgress = !isOverview ? calculateSectorProgress(activeSectorId) : null;

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 relative">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 flex-shrink-0 no-print">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6">
            
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Painel de Controle</h3>
            
            {/* Overview Link */}
            <button
                onClick={() => setActiveSectorId('OVERVIEW')}
                className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-between mb-4 ${
                isOverview
                    ? 'bg-gov-blue text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
                <div className="flex items-center gap-2">
                    <BarChart3 size={18} />
                    <span>Visão Geral</span>
                </div>
                {isOverview && <div className="h-2 w-2 bg-white rounded-full"></div>}
            </button>

            <div className="border-t border-gray-200 mb-4"></div>

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Setores / Diretorias</h3>
            <nav className="space-y-1">
              {SECTORS.map(sector => (
                <button
                  key={sector.id}
                  onClick={() => {
                      setActiveSectorId(sector.id);
                      setViewMode('form'); // Reset to form view when switching
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                    activeSectorId === sector.id 
                      ? `${sector.color} text-white shadow-md` 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{sector.shortName}</span>
                  {activeSectorId === sector.id && <div className="h-2 w-2 bg-white rounded-full"></div>}
                </button>
              ))}
            </nav>

            {/* Sidebar Progress (Hidden in Overview) */}
            {!isOverview && currentProgress && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Progresso do Setor</h3>
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700">{currentProgress.percentage}% Completo</span>
                        <span className="text-gray-500">{currentProgress.completed}/{currentProgress.total} Ações</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-500 ${currentProgress.percentage === 100 ? 'bg-green-500' : 'bg-gov-yellow'}`} 
                            style={{ width: `${currentProgress.percentage}%` }}
                        ></div>
                    </div>
                    {currentProgress.percentage === 100 && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 p-2 rounded justify-center">
                            <CheckCircle2 size={12} /> Dados completos!
                        </div>
                    )}
                </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isOverview ? 'Superintendência de Tecnologia' : currentSector?.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {isOverview 
                            ? 'Monitoramento consolidado de todas as diretorias (STIF).'
                            : 'Painel de gestão das ações estratégicas de 2025.'
                        }
                    </p>
                </div>
                
                {/* View Switcher - Only available in Sector Mode */}
                {!isOverview && (
                    <div className="flex bg-white rounded-lg shadow-sm p-1">
                        <button 
                            onClick={() => setViewMode('form')}
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                                viewMode === 'form' ? 'bg-gov-lightBlue text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <FileEdit size={16} /> Gestão
                        </button>
                        <button 
                            onClick={() => setViewMode('preview')}
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                                viewMode === 'preview' ? 'bg-gov-lightBlue text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <LayoutDashboard size={16} /> Relatório Final
                        </button>
                    </div>
                )}
            </div>

            {/* Sub-departments Tag */}
            {!isOverview && currentSector?.subDepartments && (
                 <div className="flex flex-wrap gap-2 mb-6 no-print">
                    {currentSector.subDepartments.map(sub => (
                        <span key={sub} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
                            {sub}
                        </span>
                    ))}
                 </div>
            )}

            {/* Stats Dashboard (Dynamic Context) */}
            {viewMode === 'form' && (
                <StatsDashboard reportData={reportData} activeSectorId={activeSectorId} />
            )}

            {/* Content Area Switcher */}
            {isOverview ? (
                // OVERVIEW MODE: Summary Table
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">Resumo de Desempenho por Diretoria</h3>
                        <span className="text-xs text-gray-500">Dados consolidados em tempo real</span>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Diretoria / Setor</th>
                                <th className="px-6 py-4">Progresso de Preenchimento</th>
                                <th className="px-6 py-4 text-center">Entregas Totais</th>
                                <th className="px-6 py-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {SECTORS.map(sector => {
                                const prog = calculateSectorProgress(sector.id);
                                const totalDeliveries = reportData
                                    .filter(e => e.sectorId === sector.id && e.hasActivities !== false)
                                    .reduce((acc, curr) => acc + (curr.deliveries?.length || 0), 0);

                                return (
                                    <tr key={sector.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{sector.shortName}</div>
                                            <div className="text-xs text-gray-400">{sector.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full w-24">
                                                    <div 
                                                        className={`h-2 rounded-full ${prog.percentage === 100 ? 'bg-green-500' : 'bg-gov-yellow'}`}
                                                        style={{ width: `${prog.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-600 w-8">{prog.percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-50 text-gov-blue py-1 px-3 rounded-full font-bold text-xs">
                                                {totalDeliveries}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setActiveSectorId(sector.id)}
                                                className="text-gov-lightBlue hover:text-gov-blue font-medium text-xs flex items-center justify-end gap-1 ml-auto group"
                                            >
                                                Detalhar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                // SECTOR MODE: Cards or Preview
                <>
                    {viewMode === 'form' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                            {STRATEGIC_ACTIONS.map(action => (
                                <ActionCard 
                                    key={action.id} 
                                    action={action} 
                                    sectorId={activeSectorId as SectorId}
                                    data={reportData.find(e => e.actionId === action.id && e.sectorId === activeSectorId)}
                                    onSave={handleSaveEntry}
                                    onOpenDrawer={() => handleOpenDrawer(action.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-300 p-8 rounded shadow-inner min-h-screen flex flex-col items-center">
                            <div className="w-full max-w-[210mm] flex justify-end mb-4 no-print">
                                <button 
                                    onClick={() => window.print()}
                                    className="bg-gov-blue hover:bg-blue-800 text-white px-4 py-2 rounded shadow flex items-center gap-2"
                                >
                                    <Printer size={18} /> Imprimir / Salvar PDF
                                </button>
                            </div>
                            {currentSector && (
                                <ReportPreview 
                                    sector={currentSector} 
                                    entries={reportData.filter(e => e.sectorId === activeSectorId)} 
                                />
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
      </main>

      {/* Drawer Component */}
      <ActionDrawer 
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        action={selectedActionId ? STRATEGIC_ACTIONS.find(a => a.id === selectedActionId) || null : null}
        sectorId={activeSectorId as SectorId}
        data={selectedActionId ? reportData.find(e => e.actionId === selectedActionId && e.sectorId === activeSectorId) : undefined}
        onSave={handleSaveEntry}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 no-print">
        <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-500">
                Sistema de Prestação de Contas SEFAZ/TO &copy; 2025
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
