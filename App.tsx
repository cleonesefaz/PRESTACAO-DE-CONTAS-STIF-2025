
import React, { useState, useEffect, useMemo } from 'react';
import { SECTORS as INITIAL_SECTORS, STRATEGIC_ACTIONS } from './constants';
import { SectorId, ReportEntry, SectorConfig, AppConfig } from './types';
import { Header } from './components/Header';
import { ActionCard } from './components/ActionCard';
import { ActionDrawer } from './components/ActionDrawer';
import { ReportPreview } from './components/ReportPreview';
import { StatsDashboard } from './components/StatsDashboard';
import { SettingsDashboard } from './components/SettingsDashboard';
import { Printer, LayoutDashboard, FileEdit, CheckCircle2, BarChart3, ArrowRight, ChevronRight, History, Settings, FileDown, Eye } from 'lucide-react';

const DEFAULT_CONFIG: AppConfig = {
    institutionName: 'Governo do Estado do Tocantins',
    departmentName: 'Secretaria da Fazenda',
    subDepartmentName: 'Superintendência de Tecnologia e Inovação Fazendária'
};

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  
  // App Configuration (Identity)
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  
  // Sectors (Dynamic List)
  const [sectors, setSectors] = useState<SectorConfig[]>(INITIAL_SECTORS);

  // Navigation & Data
  const [activeSectorId, setActiveSectorId] = useState<string>('OVERVIEW');
  const [reportData, setReportData] = useState<ReportEntry[]>([]);
  const [viewMode, setViewMode] = useState<'form' | 'preview' | 'settings'>('form');
  
  // Context
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  // --- LOGIC ---

  const isReadOnly = selectedYear < 2025;

  // Load Config & Sectors from LocalStorage (Once on mount)
  useEffect(() => {
    const savedConfig = localStorage.getItem('stif_config');
    if (savedConfig) setAppConfig(JSON.parse(savedConfig));

    const savedSectors = localStorage.getItem('stif_sectors');
    if (savedSectors) setSectors(JSON.parse(savedSectors));
  }, []);

  // Persist Config
  const handleUpdateConfig = (newConfig: AppConfig) => {
      setAppConfig(newConfig);
      localStorage.setItem('stif_config', JSON.stringify(newConfig));
  };

  // Persist Sectors
  const handleUpdateSectors = (newSectors: SectorConfig[]) => {
      setSectors(newSectors);
      localStorage.setItem('stif_sectors', JSON.stringify(newSectors));
  };

  // Load Report Data based on Year
  useEffect(() => {
    const storageKey = `stif_report_${selectedYear}_v2`;
    const saved = localStorage.getItem(storageKey); 
    if (saved) {
      try {
        setReportData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data", e);
        setReportData([]);
      }
    } else {
        setReportData([]);
    }
  }, [selectedYear]);

  // Save Report Data
  useEffect(() => {
    const storageKey = `stif_report_${selectedYear}_v2`;
    localStorage.setItem(storageKey, JSON.stringify(reportData));
  }, [reportData, selectedYear]);

  const handleSaveEntry = (entry: ReportEntry) => {
    if (isReadOnly) return;
    setReportData(prev => {
      const filtered = prev.filter(e => !(e.actionId === entry.actionId && e.sectorId === entry.sectorId));
      return [...filtered, entry];
    });
  };

  const isOverview = activeSectorId === 'OVERVIEW';
  const currentSector = sectors.find(s => s.id === activeSectorId);

  const handleOpenDrawer = (actionId: string) => {
      setSelectedActionId(actionId);
      setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
      setIsDrawerOpen(false);
      setTimeout(() => setSelectedActionId(null), 300);
  };

  const calculateSectorProgress = (secId: string) => {
    const completed = STRATEGIC_ACTIONS.reduce((acc, action) => {
        const entry = reportData.find(e => e.actionId === action.id && e.sectorId === secId);
        if (!entry) return acc;
        if (entry.hasActivities === false) return acc + 1;
        if (entry.deliveries && entry.deliveries.length > 0) return acc + 1;
        return acc;
    }, 0);
    
    return {
        completed,
        total: STRATEGIC_ACTIONS.length,
        percentage: Math.round((completed / STRATEGIC_ACTIONS.length) * 100)
    };
  };

  // 1. Ranking per Sector (Directory)
  const rankingData = useMemo(() => {
    const data = sectors
        .filter(s => s.isActive !== false) // Only active sectors in ranking
        .map(sector => {
            const totalDeliveries = reportData
                .filter(e => e.sectorId === sector.id && e.hasActivities !== false)
                .reduce((acc, curr) => acc + (curr.deliveries?.length || 0), 0);
            return { ...sector, totalDeliveries };
        });
    return data.sort((a, b) => b.totalDeliveries - a.totalDeliveries);
  }, [reportData, sectors]);

  const maxSectorDeliveryCount = Math.max(...rankingData.map(d => d.totalDeliveries)) || 1;

  // 2. Ranking per Strategic Action (New)
  const actionRankingData = useMemo(() => {
      const data = STRATEGIC_ACTIONS.map(action => {
          const totalDeliveries = reportData
            .filter(e => e.actionId === action.id && e.hasActivities !== false)
            .reduce((acc, curr) => acc + (curr.deliveries?.length || 0), 0);
          return { ...action, totalDeliveries };
      });
      return data.sort((a, b) => b.totalDeliveries - a.totalDeliveries);
  }, [reportData]);

  const maxActionDeliveryCount = Math.max(...actionRankingData.map(d => d.totalDeliveries)) || 1;

  const currentProgress = !isOverview && activeSectorId !== 'SETTINGS' ? calculateSectorProgress(activeSectorId) : null;

  // Handler for Sidebar Navigation
  const handleNavClick = (target: string) => {
      setActiveSectorId(target);
      if (target === 'SETTINGS') {
          setViewMode('settings');
      } else {
          setViewMode('form');
      }
  };

  // Get active sectors for consolidated report
  const activeSectors = useMemo(() => sectors.filter(s => s.isActive !== false), [sectors]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header selectedYear={selectedYear} onYearChange={setSelectedYear} config={appConfig} />

      {isReadOnly && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-800 px-4 py-2 text-sm text-center font-medium flex items-center justify-center gap-2 no-print">
            <History size={16} />
            <span>Visualizando Histórico: Exercício de {selectedYear} (Encerrado). O sistema está em modo somente leitura.</span>
        </div>
      )}

      {selectedYear > 2025 && (
        <div className="bg-blue-50 border-b border-blue-200 text-blue-800 px-4 py-2 text-sm text-center font-medium flex items-center justify-center gap-2 no-print">
            <FileEdit size={16} />
            <span>Modo de Planejamento: Exercício de {selectedYear}. As informações inseridas aqui são provisórias.</span>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 relative">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 flex-shrink-0 no-print flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6">
            
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Painel de Controle</h3>
            
            <button
                onClick={() => handleNavClick('OVERVIEW')}
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
              {sectors.filter(s => s.isActive !== false).map(sector => (
                <button
                  key={sector.id}
                  onClick={() => handleNavClick(sector.id)}
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

            {!isOverview && activeSectorId !== 'SETTINGS' && currentProgress && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Progresso do Setor</h3>
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700">{currentProgress.percentage}% Completo</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-500 ${currentProgress.percentage === 100 ? 'bg-green-500' : 'bg-gov-yellow'}`} 
                            style={{ width: `${currentProgress.percentage}%` }}
                        ></div>
                    </div>
                </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-gray-200">
                 <button
                    onClick={() => handleNavClick('SETTINGS')}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeSectorId === 'SETTINGS'
                          ? 'bg-gray-800 text-white shadow-md'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                 >
                    <Settings size={18} />
                    <span>Configurações</span>
                 </button>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
            
            {/* View: SETTINGS */}
            {viewMode === 'settings' ? (
                <SettingsDashboard 
                    config={appConfig}
                    sectors={sectors}
                    onUpdateConfig={handleUpdateConfig}
                    onUpdateSectors={handleUpdateSectors}
                />
            ) : (
                <>
                    {/* Header for Overview/Sectors */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 no-print">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {isOverview ? appConfig.subDepartmentName.split(' ')[0] : currentSector?.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {isOverview 
                                    ? `Monitoramento consolidado - ${selectedYear}`
                                    : `Painel de gestão das ações estratégicas de ${selectedYear}.`
                                }
                            </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex bg-white rounded-lg shadow-sm p-1">
                             {isOverview ? (
                                <button 
                                    onClick={() => setViewMode('preview')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                                        viewMode === 'preview' 
                                            ? 'bg-gov-blue text-white shadow-md' 
                                            : 'bg-white text-gov-blue hover:bg-blue-50 border border-blue-200'
                                    }`}
                                >
                                    <FileDown size={18} /> Baixar Relatório Consolidado
                                </button>
                             ) : (
                                <>
                                    <button 
                                        onClick={() => setViewMode('preview')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all border ml-1 ${
                                            viewMode === 'preview' 
                                                ? 'bg-gov-lightBlue text-white shadow-sm border-transparent' 
                                                : 'text-gray-500 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Eye size={16} /> Visualizar Prévia
                                    </button>
                                </>
                             )}
                        </div>
                    </div>

                    {/* Stats (Visible on Form Mode) */}
                    {viewMode === 'form' && (
                        <StatsDashboard reportData={reportData} activeSectorId={activeSectorId} />
                    )}

                    {/* Content Logic */}
                    {isOverview ? (
                        <>
                         {viewMode === 'form' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Coluna Esquerda: Ranking Setores */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <BarChart3 size={20} className="text-gov-blue"/> Comparativo por Diretoria
                                    </h3>
                                    <div className="space-y-4">
                                        {rankingData.map((data, index) => {
                                            const percentage = (data.totalDeliveries / maxSectorDeliveryCount) * 100;
                                            const barWidth = data.totalDeliveries > 0 ? `${percentage}%` : '4px';

                                            return (
                                                <button 
                                                    key={data.id}
                                                    onClick={() => handleNavClick(data.id)}
                                                    className="w-full group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-20 text-right flex-shrink-0">
                                                            <span className="block font-bold text-gray-700 text-sm group-hover:text-gov-blue transition-colors">
                                                                {data.shortName}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 relative h-8 bg-gray-100 rounded-md overflow-hidden flex items-center">
                                                            <div 
                                                                className={`h-full absolute left-0 top-0 rounded-r-md transition-all duration-1000 ease-out flex items-center justify-end pr-2 group-hover:brightness-95 ${data.totalDeliveries === 0 ? 'bg-gray-200' : 'bg-gov-blue'}`}
                                                                style={{ width: barWidth }}
                                                            ></div>
                                                        </div>
                                                        <div className="w-8 text-left flex-shrink-0">
                                                            <span className={`text-lg font-bold ${data.totalDeliveries > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                                                {data.totalDeliveries}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Coluna Direita: Volume por Ação */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <CheckCircle2 size={20} className="text-gov-lightBlue"/> Volume por Ação Estratégica
                                    </h3>
                                    <div className="space-y-4">
                                        {actionRankingData.map((data, index) => {
                                            const percentage = (data.totalDeliveries / maxActionDeliveryCount) * 100;
                                            const barWidth = data.totalDeliveries > 0 ? `${percentage}%` : '4px';

                                            return (
                                                <div 
                                                    key={data.id}
                                                    className="w-full p-2 -mx-2 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-32 text-right flex-shrink-0">
                                                            <span className="block font-medium text-gray-600 text-xs truncate" title={data.action}>
                                                                {data.action}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 relative h-8 bg-gray-100 rounded-md overflow-hidden flex items-center">
                                                            <div 
                                                                className={`h-full absolute left-0 top-0 rounded-r-md transition-all duration-1000 ease-out flex items-center justify-end pr-2 ${data.totalDeliveries === 0 ? 'bg-gray-200' : 'bg-gov-lightBlue'}`}
                                                                style={{ width: barWidth }}
                                                            ></div>
                                                        </div>
                                                        <div className="w-8 text-left flex-shrink-0">
                                                            <span className={`text-lg font-bold ${data.totalDeliveries > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                                                {data.totalDeliveries}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                         ) : (
                            // Render Consolidated Report
                             <div className="bg-gray-300 p-8 rounded shadow-inner min-h-screen flex flex-col items-center">
                                    <div className="w-full max-w-[210mm] flex justify-between mb-4 no-print">
                                        <button 
                                            onClick={() => setViewMode('form')}
                                            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                                        >
                                           &larr; Voltar
                                        </button>
                                        <button 
                                            onClick={() => window.print()}
                                            className="bg-gov-blue hover:bg-blue-800 text-white px-4 py-2 rounded shadow flex items-center gap-2 font-bold"
                                        >
                                            <Printer size={18} /> Imprimir Relatório Consolidado
                                        </button>
                                    </div>
                                    <ReportPreview 
                                        sectors={activeSectors} 
                                        entries={reportData} 
                                    />
                            </div>
                         )}
                        </>
                    ) : (
                        <>
                            {viewMode === 'form' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                                    {STRATEGIC_ACTIONS.map(action => (
                                        <ActionCard 
                                            key={action.id} 
                                            action={action} 
                                            sectorId={activeSectorId}
                                            data={reportData.find(e => e.actionId === action.id && e.sectorId === activeSectorId)}
                                            onSave={handleSaveEntry}
                                            onOpenDrawer={() => handleOpenDrawer(action.id)}
                                            readOnly={isReadOnly}
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
                                            <Printer size={18} /> Imprimir Prévia (Rascunho)
                                        </button>
                                    </div>
                                    {currentSector && (
                                        <ReportPreview 
                                            sectors={[currentSector]} 
                                            entries={reportData.filter(e => e.sectorId === activeSectorId)} 
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
      </main>

      <ActionDrawer 
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        action={selectedActionId ? STRATEGIC_ACTIONS.find(a => a.id === selectedActionId) || null : null}
        sectorId={activeSectorId as SectorId}
        data={selectedActionId ? reportData.find(e => e.actionId === selectedActionId && e.sectorId === activeSectorId) : undefined}
        onSave={handleSaveEntry}
        readOnly={isReadOnly}
      />
    </div>
  );
};

export default App;
