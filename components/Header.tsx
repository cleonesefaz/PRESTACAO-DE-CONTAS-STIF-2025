
import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, User, LogOut, Users } from 'lucide-react';
import { AppConfig } from '../types';

interface HeaderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  config: AppConfig;
}

export const Header: React.FC<HeaderProps> = ({ selectedYear, onYearChange, config }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-gov-blue text-white shadow-lg print:hidden relative z-20">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Esquerda: Identidade Visual */}
        <div className="flex items-center space-x-4">
            <div className="bg-white p-2 rounded-full h-14 w-14 flex items-center justify-center overflow-hidden shadow-sm">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <ShieldCheck className="h-8 w-8 text-gov-blue" />
                )}
            </div>
            <div>
                <h1 className="text-xl font-bold uppercase tracking-wide leading-none mb-1">{config.institutionName}</h1>
                <h2 className="text-sm font-light text-blue-100">{config.departmentName}</h2>
            </div>
        </div>

        {/* Direita: Controles e Usuário */}
        <div className="flex items-center">
            
            {/* Seletor de Ano / Contexto */}
            <div className="text-right pr-6 flex flex-col items-end border-r border-blue-500/50 mr-6">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold hidden lg:block">Prestação de Contas</h3>
                    
                    <div className="relative group">
                        <select 
                            value={selectedYear}
                            onChange={(e) => onYearChange(Number(e.target.value))}
                            className="appearance-none bg-blue-800 hover:bg-blue-700 text-white font-bold py-1 px-3 pr-8 rounded cursor-pointer outline-none focus:ring-2 focus:ring-blue-400 transition-colors border border-blue-600 shadow-sm"
                        >
                            <option value={2026}>2026 (Planejamento)</option>
                            <option value={2025}>2025 (Em Execução)</option>
                            <option value={2024}>2024 (Histórico)</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-blue-200" />
                    </div>
                </div>
                <p className="text-xs text-blue-200 uppercase mt-1 hidden md:block max-w-[200px] truncate" title={config.subDepartmentName}>
                    {config.subDepartmentName}
                </p>
            </div>

            {/* Widget de Usuário / Perfil */}
            <div className="relative">
                <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 text-left focus:outline-none group rounded-lg hover:bg-blue-800/50 p-1 transition-colors"
                >
                    <div className="bg-blue-400/30 rounded-full p-0.5 border-2 border-blue-300 group-hover:border-white transition-colors">
                         <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-gov-blue font-bold text-sm">
                            AD
                         </div>
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-sm font-bold text-white leading-none group-hover:text-blue-50">Administrador do Sistema</p>
                        <p className="text-xs text-blue-200 mt-1 opacity-80 group-hover:opacity-100">Gestão STIF</p>
                    </div>
                    <ChevronDown size={16} className={`text-blue-200 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsUserMenuOpen(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl py-2 z-20 text-gray-800 border border-gray-100 animate-fadeIn origin-top-right">
                             {/* Cabeçalho do Menu */}
                             <div className="px-5 py-4 border-b border-gray-100 mb-1 bg-gray-50/50 rounded-t-xl">
                                <p className="text-sm font-bold text-gray-900">Administrador do Sistema</p>
                                <p className="text-xs text-gray-500 truncate">admin.stif@sefaz.to.gov.br</p>
                                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase rounded">
                                    Super Admin
                                </span>
                             </div>
                             
                             <div className="py-1">
                                <button className="w-full text-left px-5 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3 text-gray-700 transition-colors">
                                    <User size={18} className="text-gray-400" /> Meu Perfil
                                </button>
                                <button className="w-full text-left px-5 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3 text-gray-700 transition-colors">
                                    <Users size={18} className="text-gray-400" /> Gerenciar Usuários e Permissões
                                </button>
                             </div>
                             
                             <div className="my-1 border-t border-gray-100"></div>
                             
                             <div className="py-1">
                                <button className="w-full text-left px-5 py-2.5 hover:bg-red-50 text-sm flex items-center gap-3 text-red-600 font-semibold transition-colors">
                                    <LogOut size={18} /> Sair / Logout
                                </button>
                             </div>
                        </div>
                    </>
                )}
            </div>

        </div>
      </div>
      <div className="bg-gov-yellow h-1 w-full"></div>
    </header>
  );
};
