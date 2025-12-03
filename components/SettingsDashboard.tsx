
import React, { useState, useRef } from 'react';
import { AppConfig, SectorConfig, StrategicAction } from '../types';
import { Save, Upload, GripVertical, Edit2, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Archive, CheckCircle, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface SettingsDashboardProps {
  config: AppConfig;
  sectors: SectorConfig[];
  strategicActions?: StrategicAction[]; // Optional for backward compat, but used
  onUpdateConfig: (newConfig: AppConfig) => void;
  onUpdateSectors: (newSectors: SectorConfig[]) => void;
  onUpdateStrategicActions?: (newActions: StrategicAction[]) => void;
}

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({
  config,
  sectors,
  strategicActions = [],
  onUpdateConfig,
  onUpdateSectors,
  onUpdateStrategicActions
}) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'sectors' | 'actions' | 'deadlines'>('sectors');
  
  // Local state for Config Form
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  
  // Local state for Sector Modal
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<SectorConfig | null>(null);
  const [sectorForm, setSectorForm] = useState<Partial<SectorConfig>>({});

  // Local state for Strategic Action Modal
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<StrategicAction | null>(null);
  const [actionForm, setActionForm] = useState<Partial<StrategicAction>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Identity Handlers ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalConfig(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveIdentity = () => {
    onUpdateConfig(localConfig);
    alert('Configurações salvas com sucesso!');
  };

  // --- Sector Handlers ---
  const moveSector = (index: number, direction: 'up' | 'down') => {
    const newSectors = [...sectors];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newSectors.length) {
      const temp = newSectors[index];
      newSectors[index] = newSectors[targetIndex];
      newSectors[targetIndex] = temp;
      onUpdateSectors(newSectors);
    }
  };

  const toggleSectorStatus = (index: number) => {
    const newSectors = [...sectors];
    newSectors[index] = { 
        ...newSectors[index], 
        isActive: newSectors[index].isActive === undefined ? false : !newSectors[index].isActive 
    };
    onUpdateSectors(newSectors);
  };

  const openSectorModal = (sector?: SectorConfig) => {
    if (sector) {
      setEditingSector(sector);
      setSectorForm(sector);
    } else {
      setEditingSector(null);
      setSectorForm({ color: 'bg-blue-600', isActive: true });
    }
    setIsSectorModalOpen(true);
  };

  const saveSector = () => {
    if (!sectorForm.name || !sectorForm.shortName || !sectorForm.id) {
        alert('Preencha os campos obrigatórios (ID, Nome, Sigla)');
        return;
    }

    let newSectors = [...sectors];
    const newSectorData = sectorForm as SectorConfig;

    if (editingSector) {
        newSectors = newSectors.map(s => s.id === editingSector.id ? { ...newSectorData } : s);
    } else {
        newSectors.push(newSectorData);
    }

    onUpdateSectors(newSectors);
    setIsSectorModalOpen(false);
  };

  // --- Strategic Action Handlers ---
  const toggleActionStatus = (action: StrategicAction) => {
      if (!onUpdateStrategicActions) return;
      const updated = strategicActions.map(a => 
          a.id === action.id ? { ...a, isActive: !a.isActive } : a
      );
      onUpdateStrategicActions(updated);
  };

  const openActionModal = (action?: StrategicAction) => {
      if (action) {
          setEditingAction(action);
          setActionForm(action);
      } else {
          setEditingAction(null);
          // Auto generate ID based on count
          const nextId = (Math.max(...strategicActions.map(a => parseInt(a.id) || 0)) + 1).toString();
          setActionForm({ 
              id: nextId, 
              isActive: true, 
              startYear: 2025, 
              endYear: 2028,
              responsible: 'SID/STIF' 
          });
      }
      setIsActionModalOpen(true);
  };

  const saveAction = () => {
      if (!onUpdateStrategicActions) return;
      if (!actionForm.action || !actionForm.description || !actionForm.id) {
          alert('Preencha os campos obrigatórios');
          return;
      }

      const newActionData = actionForm as StrategicAction;
      let updatedActions = [...strategicActions];

      if (editingAction) {
          updatedActions = updatedActions.map(a => a.id === editingAction.id ? newActionData : a);
      } else {
          updatedActions.push(newActionData);
      }

      onUpdateStrategicActions(updatedActions);
      setIsActionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Administração e Parâmetros</h2>
      </div>

      {/* Tabs Header */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('identity')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'identity'
                ? 'border-gov-blue text-gov-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Identidade Visual
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'deadlines'
                ? 'border-gov-blue text-gov-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Prazos e Ciclo
          </button>
          <button
            onClick={() => setActiveTab('sectors')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sectors'
                ? 'border-gov-blue text-gov-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Setores e Diretorias
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'actions'
                ? 'border-gov-blue text-gov-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ações Estratégicas (Metas)
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
        
        {/* TAB 1: IDENTITY */}
        {activeTab === 'identity' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Card A: Logo */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 flex flex-col items-center text-center">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <ImageIcon size={18} /> Logotipo do Cabeçalho
                    </h3>
                    
                    <div className="h-32 w-32 bg-white border border-gray-300 border-dashed rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                        {localConfig.logoUrl ? (
                            <img src={localConfig.logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                        ) : (
                            <span className="text-gray-300 text-xs">Sem logo</span>
                        )}
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleLogoUpload} 
                        accept="image/png, image/svg+xml, image/jpeg"
                        className="hidden" 
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium flex items-center gap-2 mb-2"
                    >
                        <Upload size={14} /> Alterar Logo
                    </button>
                    <p className="text-xs text-gray-400">Recomendado: Fundo transparente, altura 50px (PNG/SVG)</p>
                </div>

                {/* Card B: Texts */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <h3 className="font-bold text-gray-700 mb-4">Títulos Institucionais</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instituição (Topo)</label>
                            <input 
                                type="text" 
                                value={localConfig.institutionName}
                                onChange={e => setLocalConfig({...localConfig, institutionName: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Departamento (Linha 1)</label>
                            <input 
                                type="text" 
                                value={localConfig.departmentName}
                                onChange={e => setLocalConfig({...localConfig, departmentName: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade/Superintendência (Linha 2)</label>
                            <input 
                                type="text" 
                                value={localConfig.subDepartmentName}
                                onChange={e => setLocalConfig({...localConfig, subDepartmentName: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button 
                    onClick={saveIdentity}
                    className="px-6 py-2 bg-gov-blue text-white rounded-lg shadow hover:bg-blue-800 font-bold flex items-center gap-2"
                >
                    <Save size={18} /> Salvar Alterações
                </button>
            </div>
          </div>
        )}

        {/* TAB 4: DEADLINES (PRAZOS) */}
        {activeTab === 'deadlines' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                 <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <Clock className="text-gov-blue" /> Definição de Prazos Limites (Deadline)
                    </h3>
                    <p className="text-sm text-gray-500 mb-8">
                        Configure as datas de encerramento do exercício. Estas datas controlam a exibição de alertas e o bloqueio automático de edições.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                         {/* Campo A */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Fim da Fase Setorial (Diretorias)</label>
                            <div className="relative">
                                <input 
                                    type="date"
                                    value={localConfig.deadlines?.sectorDeadline || ''}
                                    onChange={(e) => setLocalConfig(prev => ({
                                        ...prev,
                                        deadlines: { ...prev.deadlines, sectorDeadline: e.target.value }
                                    }))}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-lightBlue outline-none"
                                />
                                <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500">
                                Data limite para os diretores registrarem atividades. Após esta data, o sistema pode bloquear novas edições.
                            </p>
                        </div>

                         {/* Campo B */}
                         <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Entrega Final (Superintendência)</label>
                            <div className="relative">
                                <input 
                                    type="date"
                                    value={localConfig.deadlines?.finalDeadline || ''}
                                    onChange={(e) => setLocalConfig(prev => ({
                                        ...prev,
                                        deadlines: { ...prev.deadlines, finalDeadline: e.target.value }
                                    }))}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-lightBlue outline-none"
                                />
                                <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500">
                                Data limite para consolidação e envio do relatório final para órgãos de controle.
                            </p>
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex items-center justify-between">
                         <div className="flex gap-3">
                            <div className="bg-orange-100 p-2 rounded-full h-10 w-10 flex items-center justify-center text-orange-600">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">Banner de Contagem Regressiva</h4>
                                <p className="text-xs text-gray-600">
                                    Exibir um alerta visual no topo de todas as páginas informando quantos dias restam para o prazo setorial?
                                </p>
                            </div>
                         </div>
                         
                         <button 
                            onClick={() => setLocalConfig(prev => ({
                                ...prev,
                                deadlines: { ...prev.deadlines, showBanner: !prev.deadlines.showBanner }
                            }))}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                localConfig.deadlines?.showBanner ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                        >
                            <span className="sr-only">Toggle banner</span>
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    localConfig.deadlines?.showBanner ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                 </div>

                 <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button 
                        onClick={saveIdentity}
                        className="px-6 py-2 bg-gov-blue text-white rounded-lg shadow hover:bg-blue-800 font-bold flex items-center gap-2"
                    >
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>
            </div>
        )}

        {/* TAB 2: SECTORS */}
        {activeTab === 'sectors' && (
          <div className="animate-fadeIn">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => openSectorModal()}
                    className="px-4 py-2 bg-gov-blue text-white rounded-lg hover:bg-blue-800 font-medium flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18} /> Novo Setor
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Ordem</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Sigla</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome Completo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sectors.map((sector, index) => (
                            <tr key={sector.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <GripVertical size={16} className="text-gray-300 cursor-move" />
                                        <div className="flex flex-col">
                                            <button 
                                                onClick={() => moveSector(index, 'up')}
                                                disabled={index === 0}
                                                className="text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                            >
                                                <ArrowUp size={10} />
                                            </button>
                                            <button 
                                                onClick={() => moveSector(index, 'down')}
                                                disabled={index === sectors.length - 1}
                                                className="text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                            >
                                                <ArrowDown size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-100">
                                        {sector.shortName}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {sector.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button 
                                        onClick={() => toggleSectorStatus(index)}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            sector.isActive !== false ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span className="sr-only">Toggle setting</span>
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                sector.isActive !== false ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => openSectorModal(sector)}
                                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* TAB 3: STRATEGIC ACTIONS (METAS) */}
        {activeTab === 'actions' && onUpdateStrategicActions && (
          <div className="animate-fadeIn">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => openActionModal()}
                    className="px-4 py-2 bg-gov-blue text-white rounded-lg hover:bg-blue-800 font-medium flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18} /> Nova Ação Estratégica
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ação / Meta</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Vigência</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {strategicActions.map((action) => {
                            const isExpired = action.endYear < 2025; // Simple check against current base year
                            return (
                                <tr key={action.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">
                                        #{action.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{action.action}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{action.description}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${isExpired ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {action.startYear} - {action.endYear}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => toggleActionStatus(action)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                action.isActive !== false ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    action.isActive !== false ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => openActionModal(action)}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal for Sector Edit/Create */}
      {isSectorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {editingSector ? 'Editar Setor' : 'Novo Setor'}
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID (Único, sem espaços)</label>
                        <input 
                            type="text" 
                            value={sectorForm.id || ''}
                            onChange={e => setSectorForm({...sectorForm, id: e.target.value.toUpperCase().replace(/\s/g, '')})}
                            className="w-full p-2 border border-gray-300 rounded"
                            disabled={!!editingSector} // ID cannot change after creation
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sigla</label>
                        <input 
                            type="text" 
                            value={sectorForm.shortName || ''}
                            onChange={e => setSectorForm({...sectorForm, shortName: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                        <input 
                            type="text" 
                            value={sectorForm.name || ''}
                            onChange={e => setSectorForm({...sectorForm, name: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cor do Card</label>
                         <select 
                            value={sectorForm.color || 'bg-blue-600'}
                            onChange={e => setSectorForm({...sectorForm, color: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded"
                         >
                            <option value="bg-blue-900">Azul Escuro</option>
                            <option value="bg-blue-700">Azul Médio</option>
                            <option value="bg-blue-600">Azul Padrão</option>
                            <option value="bg-yellow-600">Amarelo/Dourado</option>
                            <option value="bg-green-600">Verde</option>
                            <option value="bg-indigo-600">Roxo</option>
                         </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        onClick={() => setIsSectorModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={saveSector}
                        className="px-4 py-2 bg-gov-blue text-white rounded hover:bg-blue-800"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Modal for Strategic Action Edit/Create */}
      {isActionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {editingAction ? 'Editar Ação Estratégica' : 'Nova Ação Estratégica'}
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID (Número)</label>
                        <input 
                            type="text" 
                            value={actionForm.id || ''}
                            onChange={e => setActionForm({...actionForm, id: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título da Ação (Meta)</label>
                        <textarea 
                            value={actionForm.action || ''}
                            onChange={e => setActionForm({...actionForm, action: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded h-20 text-sm"
                            placeholder="Ex: Modernizar a infraestrutura..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição Detalhada</label>
                        <textarea 
                            value={actionForm.description || ''}
                            onChange={e => setActionForm({...actionForm, description: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded h-24 text-sm"
                            placeholder="Descrição completa para o relatório..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ano Início</label>
                            <select 
                                value={actionForm.startYear || 2025}
                                onChange={e => setActionForm({...actionForm, startYear: parseInt(e.target.value)})}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ano Fim</label>
                            <select 
                                value={actionForm.endYear || 2025}
                                onChange={e => setActionForm({...actionForm, endYear: parseInt(e.target.value)})}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input 
                            type="checkbox" 
                            id="isActiveAction"
                            checked={actionForm.isActive !== false}
                            onChange={e => setActionForm({...actionForm, isActive: e.target.checked})}
                            className="h-4 w-4 text-gov-blue rounded border-gray-300"
                        />
                        <label htmlFor="isActiveAction" className="text-sm text-gray-700 font-medium">Ação Ativa</label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        onClick={() => setIsActionModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={saveAction}
                        className="px-4 py-2 bg-gov-blue text-white rounded hover:bg-blue-800"
                    >
                        Salvar
                    </button>
                </div>
            </div>
          </div>
      )}

    </div>
  );
};
