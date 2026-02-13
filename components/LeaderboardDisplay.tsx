
import React, { useMemo, useState, useEffect } from 'react';
import { SheetRow, LeaderboardConfig } from '../types';

interface LeaderboardDisplayProps {
  data: SheetRow[];
  config: LeaderboardConfig;
}

type SortDirection = 'asc' | 'desc';

interface SortState {
  key: string;
  direction: SortDirection;
}

const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({ data, config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<SheetRow | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortState>({ 
    key: config.scoreColumn, 
    direction: 'desc' 
  });

  // Monitor scroll for "Scroll to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const historyHeaders = useMemo(() => {
    if (data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.length >= 6 ? keys.slice(5, 10) : [];
  }, [data]);

  const historyStyles = [
    { icon: 'fa-calendar-alt', color: 'text-sky-500', bg: 'bg-sky-50' },
    { icon: 'fa-history', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { icon: 'fa-chart-bar', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: 'fa-award', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: 'fa-check-double', color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const resolveImageUrl = (url: any): string | null => {
    if (!url || typeof url !== 'string' || url.trim() === '' || url.trim().toLowerCase() === 'images') {
      return null;
    }
    const driveMatch = url.match(/(?:\/d\/|id=)([a-zA-Z0-9-_]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    if (url.startsWith('http')) {
      return url.trim();
    }
    return null;
  };

  const getInitials = (name: any): string => {
    const n = String(name || '').trim();
    return n ? n.charAt(0) : '?';
  };

  const parseNumericValue = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(',', '.').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const baseScoreSortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const valA = parseNumericValue(a[config.scoreColumn]);
      const valB = parseNumericValue(b[config.scoreColumn]);
      return valB - valA;
    });
  }, [data, config]);

  const sortedAndFilteredData = useMemo(() => {
    let result = [...data];
    if (searchTerm) {
      result = result.filter(row => 
        String(row[config.nameColumn]).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    result.sort((a, b) => {
      let valA: any;
      let valB: any;
      if (sortConfig.key === 'rank') {
        valA = baseScoreSortedData.findIndex(r => r === a);
        valB = baseScoreSortedData.findIndex(r => r === b);
      } else if (sortConfig.key === config.scoreColumn) {
        valA = parseNumericValue(a[config.scoreColumn]);
        valB = parseNumericValue(b[config.scoreColumn]);
      } else {
        const strA = String(a[sortConfig.key] || '');
        const strB = String(b[sortConfig.key] || '');
        const comparison = strA.localeCompare(strB, 'ar', { sensitivity: 'base' });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      if (valA === valB) return 0;
      const res = valA > valB ? 1 : -1;
      return sortConfig.direction === 'asc' ? res : -res;
    });
    return result;
  }, [data, config, searchTerm, sortConfig, baseScoreSortedData]);

  const top3 = baseScoreSortedData.slice(0, 3);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      const defaultDir = (key === config.nameColumn || key === config.groupColumn) ? 'asc' : 'desc';
      return { key, direction: defaultDir };
    });
  };

  const getSortIcon = (key: string) => {
    const isActive = sortConfig.key === key;
    return (
      <span className={`ml-1 md:ml-2 inline-flex flex-col items-center justify-center leading-[0] transition-colors ${isActive ? 'text-sky-500' : 'text-slate-300 opacity-40 group-hover:opacity-100'}`}>
        <i className={`fas fa-sort-up text-[8px] md:text-[10px] ${isActive && sortConfig.direction === 'asc' ? '' : 'opacity-30'}`}></i>
        <i className={`fas fa-sort-down text-[8px] md:text-[10px] ${isActive && sortConfig.direction === 'desc' ? '' : 'opacity-30'}`}></i>
      </span>
    );
  };

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return 'bg-amber-100 text-amber-700 ring-amber-400';
      case 1: return 'bg-slate-200 text-slate-700 ring-slate-400';
      case 2: return 'bg-orange-100 text-orange-700 ring-orange-400';
      default: return 'bg-slate-50 text-slate-500 ring-slate-200';
    }
  };

  const renderAvatar = (row: SheetRow, size: string, fontSize: string = "text-xl", ringColor: string = "ring-white") => {
    const imageUrl = resolveImageUrl(row[config.imageColumn || '']);
    const name = String(row[config.nameColumn]);
    
    if (imageUrl) {
      return (
        <div className={`${size} rounded-full bg-slate-100 flex items-center justify-center border-2 md:border-4 border-white shadow-lg overflow-hidden ring-2 md:ring-4 ${ringColor}`}>
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      );
    }
    return (
      <div className={`${size} rounded-full bg-sky-500 flex items-center justify-center border-2 md:border-4 border-white shadow-lg ring-2 md:ring-4 ${ringColor}`}>
        <span className={`${fontSize} font-bold text-white`}>
          {getInitials(name)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 px-1 md:px-0">
      {/* Podium (Top 3 Players) */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 items-end pt-2 pb-6 md:pb-8">
        {top3[1] && (
          <div 
            className="flex flex-col items-center animate-in slide-in-from-left duration-500 cursor-pointer transition-all hover:scale-105 active:scale-95 group" 
            onClick={() => setSelectedRow(top3[1])}
          >
            <div className="mb-2 relative">
              {renderAvatar(top3[1], "w-12 h-12 md:w-16 h-16", "text-lg md:text-2xl")}
              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white border border-white shadow-sm">2</div>
            </div>
            <div className="w-full h-16 md:h-24 bg-slate-200 rounded-t-xl md:rounded-t-2xl shadow-inner flex flex-col items-center justify-center p-1 md:p-2 group-hover:bg-slate-300 transition-colors">
              <span className="text-[10px] md:text-sm font-bold text-slate-600 truncate w-full text-center px-1" dir="auto">{top3[1][config.nameColumn]}</span>
              <span className="text-sm md:text-lg font-black text-slate-800">{top3[1][config.scoreColumn]}</span>
            </div>
          </div>
        )}
        
        {top3[0] && (
          <div 
            className="flex flex-col items-center animate-in zoom-in duration-700 cursor-pointer transition-all hover:scale-110 active:scale-105 group" 
            onClick={() => setSelectedRow(top3[0])}
          >
            <div className="mb-2 relative scale-110">
              <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                <i className="fas fa-crown text-lg md:text-2xl"></i>
              </div>
              {renderAvatar(top3[0], "w-16 h-16 md:w-20 h-20", "text-2xl md:text-3xl", "ring-amber-100/30")}
              <div className="absolute -top-1 -right-1 w-6 h-6 md:w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white border border-white shadow-md">1</div>
            </div>
            <div className="w-full h-24 md:h-32 bg-sky-500 rounded-t-xl md:rounded-t-2xl shadow-xl flex flex-col items-center justify-center p-1 md:p-2 group-hover:bg-sky-600 transition-colors">
              <span className="text-xs md:text-base font-bold text-white truncate w-full text-center px-1" dir="auto">{top3[0][config.nameColumn]}</span>
              <span className="text-lg md:text-2xl font-black text-white">{top3[0][config.scoreColumn]}</span>
            </div>
          </div>
        )}
        
        {top3[2] && (
          <div 
            className="flex flex-col items-center animate-in slide-in-from-right duration-500 cursor-pointer transition-all hover:scale-105 active:scale-95 group" 
            onClick={() => setSelectedRow(top3[2])}
          >
            <div className="mb-2 relative">
              {renderAvatar(top3[2], "w-12 h-12 md:w-16 h-16", "text-lg md:text-2xl")}
              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white border border-white shadow-sm">3</div>
            </div>
            <div className="w-full h-14 md:h-20 bg-orange-100 rounded-t-xl md:rounded-t-2xl shadow-inner flex flex-col items-center justify-center p-1 md:p-2 group-hover:bg-orange-200 transition-colors">
              <span className="text-[10px] md:text-sm font-bold text-orange-700 truncate w-full text-center px-1" dir="auto">{top3[2][config.nameColumn]}</span>
              <span className="text-sm md:text-lg font-black text-orange-900">{top3[2][config.scoreColumn]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-end">
          <div className="relative w-full max-w-xs">
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 md:pl-9 pr-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-lg md:rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all shadow-sm"
            />
            <i className="fas fa-search absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] md:text-xs"></i>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-3 md:px-6 py-3 md:py-4 w-12 md:w-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('rank')}>
                  Rank {getSortIcon('rank')}
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort(config.nameColumn)}>
                  Student {getSortIcon(config.nameColumn)}
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-right bg-sky-50/20 w-24 md:w-32 text-[10px] font-bold text-sky-600 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort(config.scoreColumn)}>
                  Points {getSortIcon(config.scoreColumn)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedAndFilteredData.map((row, index) => {
                const globalRank = baseScoreSortedData.findIndex(r => r === row) + 1;
                const imageUrl = resolveImageUrl(row[config.imageColumn || '']);
                const nameStr = String(row[config.nameColumn]);

                return (
                  <tr 
                    key={index} 
                    onClick={() => setSelectedRow(row)}
                    className="hover:bg-sky-50/60 transition-all duration-200 group cursor-pointer relative z-0"
                  >
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className={`w-6 h-6 md:w-8 h-8 rounded-md md:rounded-lg flex items-center justify-center font-bold text-xs md:text-sm ring-1 md:ring-2 transition-all ${getRankStyle(globalRank - 1)}`}>
                        {globalRank}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 md:w-12 h-12 rounded-full mr-2 md:mr-4 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white shadow-sm ring-1 ring-slate-100">
                           {imageUrl ? (
                             <img src={imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                           ) : (
                             <div className="w-full h-full bg-sky-500 flex items-center justify-center">
                               <span className="text-white font-bold text-[10px] md:text-lg">{getInitials(nameStr)}</span>
                             </div>
                           )}
                        </div>
                        <div className="font-bold text-slate-800 text-sm md:text-lg transition-colors group-hover:text-sky-600 truncate max-w-[120px] md:max-w-none" dir="auto">{nameStr}</div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right bg-sky-50/10 font-black text-sky-500 text-base md:text-xl tabular-nums transition-colors">
                      {row[config.scoreColumn]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sortedAndFilteredData.length === 0 && (
            <div className="py-12 md:py-20 text-center">
               <div className="w-12 h-12 md:w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <i className="fas fa-search text-slate-300 text-base md:text-xl"></i>
               </div>
               <p className="text-slate-400 font-medium italic text-xs md:text-sm">No results match your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRow && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedRow(null)}
        >
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"></div>
          <div 
            className="relative bg-white w-full max-w-md rounded-2xl md:rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 h-10 bg-slate-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 z-20 cursor-pointer" onClick={() => setSelectedRow(null)}>
              <i className="fas fa-times"></i>
            </div>

            <div className="overflow-y-auto w-full p-6 md:p-8 pt-8 md:pt-10 flex flex-col items-center text-center scrollbar-hide">
              <div className="mb-4 md:mb-6">
                {renderAvatar(selectedRow, "w-24 h-24 md:w-40 h-40", "text-4xl md:text-6xl", "ring-sky-100")}
              </div>
              
              <h2 className="text-2xl md:text-4xl font-black text-slate-800 mb-2 leading-tight px-4" dir="auto">
                {String(selectedRow[config.nameColumn])}
              </h2>
              
              <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-sky-50 text-sky-600 rounded-full text-xs md:text-sm font-bold mb-6 md:mb-10 shadow-sm border border-sky-100">
                <i className="fas fa-trophy mr-2 text-[10px]"></i>
                Rank #{baseScoreSortedData.findIndex(r => r === selectedRow) + 1} &bull; {selectedRow[config.scoreColumn]} Pts
              </div>

              <div className="w-full space-y-3 md:space-y-4 text-left">
                <div className="flex items-center mb-1 md:mb-2 px-1">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">History</span>
                   <div className="ml-3 flex-grow h-[1px] bg-slate-100"></div>
                </div>
                
                <div className="grid gap-2 md:gap-3">
                  {historyHeaders.map((header, idx) => {
                    const style = historyStyles[idx] || historyStyles[0];
                    const value = selectedRow[header];
                    
                    return (
                      <div key={idx} className={`${style.bg} rounded-xl md:rounded-2xl p-3 md:p-4 flex justify-between items-center border border-white shadow-sm`}>
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className={`w-8 h-8 md:w-10 h-10 rounded-lg md:rounded-xl ${style.bg} border border-white flex items-center justify-center shadow-sm flex-shrink-0`}>
                            <i className={`fas ${style.icon} ${style.color} text-xs md:text-base`}></i>
                          </div>
                          <span className="text-[10px] md:text-sm font-bold text-slate-600 text-left leading-tight truncate max-w-[100px] md:max-w-none">{header}</span>
                        </div>
                        <span className={`text-lg md:text-2xl font-black ${style.color} tabular-nums`}>
                          {value !== undefined && value !== null && value !== '' ? String(value) : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={() => setSelectedRow(null)}
                className="mt-8 md:mt-10 w-full py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-lg hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-[0.97]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-14 h-14 bg-sky-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-sky-600 transition-all z-40 animate-in fade-in zoom-in duration-300 ring-4 ring-white"
        >
          <i className="fas fa-arrow-up text-base md:text-lg"></i>
        </button>
      )}
    </div>
  );
};

export default LeaderboardDisplay;
