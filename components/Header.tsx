
import React from 'react';
import { ShieldCheck, ChevronDown } from 'lucide-react';
import { AppConfig } from '../types';

interface HeaderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  config: AppConfig;
}

export const Header: React.FC<HeaderProps> = ({ selectedYear, onYearChange, config }) => {
  return (
    <header className="bg-gov-blue text-white shadow-lg print:hidden relative z-20">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <div className="bg-white p-2 rounded-full h-14 w-14 flex items-center justify-center overflow-hidden">
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
        <div className="text-right border-l border-blue-500 pl-6 flex flex-col items-end">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Prestação de Contas</h3>
                
                {/* Year Selector Dropdown */}
                <div className="relative group">
                    <select 
                        value={selectedYear}
                        onChange={(e) => onYearChange(Number(e.target.value))}
                        className="appearance-none bg-blue-800 hover:bg-blue-700 text-white font-bold py-1 px-3 pr-8 rounded cursor-pointer outline-none focus:ring-2 focus:ring-blue-400 transition-colors border border-blue-600"
                    >
                        <option value={2026}>2026 (Planejamento)</option>
                        <option value={2025}>2025 (Em Execução)</option>
                        <option value={2024}>2024 (Histórico)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-blue-200" />
                </div>
            </div>
            <p className="text-xs text-blue-200 uppercase mt-1">{config.subDepartmentName}</p>
        </div>
      </div>
      <div className="bg-gov-yellow h-1 w-full"></div>
    </header>
  );
};
