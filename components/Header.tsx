import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gov-blue text-white shadow-lg print:hidden">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <div className="bg-white p-2 rounded-full">
                <ShieldCheck className="h-8 w-8 text-gov-blue" />
            </div>
            <div>
                <h1 className="text-xl font-bold uppercase tracking-wide">Tocantins</h1>
                <h2 className="text-sm font-light text-blue-100">Governo do Estado</h2>
            </div>
        </div>
        <div className="text-right border-l border-blue-500 pl-6">
            <h3 className="text-lg font-semibold">Prestação de Contas 2025</h3>
            <p className="text-xs text-blue-200 uppercase">Superintendência de Tecnologia e Inovação Fazendária</p>
        </div>
      </div>
      <div className="bg-gov-yellow h-1 w-full"></div>
    </header>
  );
};