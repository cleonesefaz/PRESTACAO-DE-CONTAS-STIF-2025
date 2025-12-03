
import React, { useMemo } from 'react';
import { ReportEntry, StrategicAction } from '../types';
import { Trophy, TrendingUp } from 'lucide-react';

interface StatsDashboardProps {
  reportData: ReportEntry[];
  activeSectorId: string; // Changed from SectorId to string to support 'OVERVIEW'
  strategicActions: StrategicAction[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ reportData, activeSectorId, strategicActions }) => {
  
  // 1. Calculate Statistics
  const stats = useMemo(() => {
    // Filter data: If OVERVIEW, take all. If specific sector, filter by ID.
    const entriesToAnalyze = activeSectorId === 'OVERVIEW' 
        ? reportData 
        : reportData.filter(e => e.sectorId === activeSectorId);
    
    // KPI 1: Total Volume
    const totalDeliveries = entriesToAnalyze.reduce((acc, entry) => {
        // Only count if active
        if (entry.hasActivities === false) return acc;
        return acc + (entry.deliveries ? entry.deliveries.length : 0);
    }, 0);

    // Filter active strategic actions based on isActive flag
    const activeStrategicActions = strategicActions.filter(a => a.isActive !== false);

    // KPI 2: Coverage (Active Actions vs Total)
    let totalPossibleActions = 0;
    let activeActionsCount = 0;

    if (activeSectorId === 'OVERVIEW') {
        const numberOfSectors = 5; // Fixed assumption or could be dynamic passed via props
        totalPossibleActions = activeStrategicActions.length * numberOfSectors;
        
        // Count all entries in reportData that are active (hasActivities !== false)
        activeActionsCount = entriesToAnalyze.filter(e => e.hasActivities !== false).length;
    } else {
        totalPossibleActions = activeStrategicActions.length;
        activeActionsCount = activeStrategicActions.reduce((acc, action) => {
            const entry = entriesToAnalyze.find(e => e.actionId === action.id);
            if (!entry) return acc; // Not started
            if (entry.hasActivities === false) return acc; // Explicitly inactive
            return acc + 1; // It is active
        }, 0);
    }

    const coveragePercent = totalPossibleActions > 0 
        ? Math.round((activeActionsCount / totalPossibleActions) * 100)
        : 0;

    // KPI 3: Monthly Rhythm (Sparkline)
    const months = Array(12).fill(0);
    entriesToAnalyze.forEach(entry => {
        if (entry.hasActivities === false || !entry.deliveries) return;
        
        entry.deliveries.forEach(d => {
            const dateStr = d.date.toLowerCase();
            let monthIndex = -1;
            
            // Simple parser for PT-BR dates
            if (dateStr.includes('jan') || dateStr.includes('/01')) monthIndex = 0;
            else if (dateStr.includes('fev') || dateStr.includes('/02')) monthIndex = 1;
            else if (dateStr.includes('mar') || dateStr.includes('/03')) monthIndex = 2;
            else if (dateStr.includes('abr') || dateStr.includes('/04')) monthIndex = 3;
            else if (dateStr.includes('mai') || dateStr.includes('/05')) monthIndex = 4;
            else if (dateStr.includes('jun') || dateStr.includes('/06')) monthIndex = 5;
            else if (dateStr.includes('jul') || dateStr.includes('/07')) monthIndex = 6;
            else if (dateStr.includes('ago') || dateStr.includes('/08')) monthIndex = 7;
            else if (dateStr.includes('set') || dateStr.includes('/09')) monthIndex = 8;
            else if (dateStr.includes('out') || dateStr.includes('/10')) monthIndex = 9;
            else if (dateStr.includes('nov') || dateStr.includes('/11')) monthIndex = 10;
            else if (dateStr.includes('dez') || dateStr.includes('/12')) monthIndex = 11;

            if (monthIndex >= 0) months[monthIndex]++;
        });
    });

    const maxMonthly = Math.max(...months) || 1; // Avoid division by zero

    return {
        totalDeliveries,
        activeActionsCount,
        totalPossibleActions,
        coveragePercent,
        months,
        maxMonthly
    };
  }, [reportData, activeSectorId, strategicActions]);

  // Donut Chart Helpers
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.coveragePercent / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 no-print">
        
        {/* KPI 1: Volume Total */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1 bg-gov-blue"></div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Volume Total</span>
                    <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {activeSectorId === 'OVERVIEW' ? 'Superintendência' : 'Setor'}
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gov-blue">{stats.totalDeliveries}</span>
                    <span className="text-sm text-gray-500 font-medium">Entregas</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Registradas em 2025</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-gov-blue group-hover:scale-110 transition-transform">
                <Trophy size={28} />
            </div>
        </div>

        {/* KPI 2: Cobertura Estratégica (Donut) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1 bg-gov-lightBlue"></div>
            
            {/* SVG Donut */}
            <div className="relative h-20 w-20 flex-shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                    {/* Background Circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="none"
                        stroke="#005b96" // gov-lightBlue
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xs font-bold text-gov-blue">{stats.coveragePercent}%</span>
                </div>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cobertura</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-800">{stats.activeActionsCount}</span>
                    <span className="text-sm text-gray-500">de {stats.totalPossibleActions} Metas</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    {activeSectorId === 'OVERVIEW' ? 'Global (Todos Setores)' : 'Setorial'}
                </p>
            </div>
        </div>

        {/* KPI 3: Ritmo Anual (Sparkline Bars) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1 bg-gov-yellow"></div>
            
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        Ritmo Anual <TrendingUp size={12} />
                    </span>
                </div>
            </div>

            <div className="flex items-end justify-between h-16 gap-1 pt-2">
                {stats.months.map((count, idx) => {
                    const heightPercent = stats.maxMonthly > 0 ? (count / stats.maxMonthly) * 100 : 0;
                    // Min height 10% for visuals if count > 0, else 4px base
                    const visualHeight = count > 0 ? Math.max(heightPercent, 10) : 0; 
                    
                    return (
                        <div key={idx} className="flex flex-col items-center gap-1 w-full group cursor-default">
                             {/* Tooltip-ish value on hover */}
                            <div className="h-full w-full flex items-end relative">
                                <div 
                                    className={`w-full rounded-t-sm transition-all duration-500 ${count > 0 ? 'bg-gov-yellow hover:bg-orange-400' : 'bg-gray-100 h-[2px]'}`}
                                    style={{ height: count > 0 ? `${visualHeight}%` : '4px' }}
                                    title={`${count} entregas`}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Axis Labels */}
            <div className="flex justify-between text-[8px] text-gray-400 uppercase font-bold mt-1">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dez</span>
            </div>
        </div>
    </div>
  );
};
