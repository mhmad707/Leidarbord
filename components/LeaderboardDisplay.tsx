
import React, { useMemo, useState } from 'react';
import { SheetRow, LeaderboardConfig } from '../types';

interface LeaderboardDisplayProps {
  data: SheetRow[];
  config: LeaderboardConfig;
}

const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({ data, config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const parseNumericValue = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Handle strings, replacing comma with dot for decimal parsing (e.g. 8,5 -> 8.5)
    const cleaned = String(val).replace(',', '.').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const valA = parseNumericValue(a[config.scoreColumn]);
      const valB = parseNumericValue(b[config.scoreColumn]);
      return valB - valA;
    });
  }, [data, config]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    return sortedData.filter(row => 
      String(row[config.nameColumn]).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedData, searchTerm, config]);

  const top3 = sortedData.slice(0, 3);

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return 'bg-amber-100 text-amber-700 ring-amber-400';
      case 1: return 'bg-slate-200 text-slate-700 ring-slate-400';
      case 2: return 'bg-orange-100 text-orange-700 ring-orange-400';
      default: return 'bg-slate-50 text-slate-500 ring-slate-200';
    }
  };

  const getMedalIcon = (index: number) => {
    switch(index) {
      case 0: return <i className="fas fa-medal text-amber-500"></i>;
      case 1: return <i className="fas fa-medal text-slate-400"></i>;
      case 2: return <i className="fas fa-medal text-orange-400"></i>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Podium Visuals */}
      <div className="grid grid-cols-3 gap-4 items-end pt-4 pb-8">
        {top3[1] && (
          <div className="flex flex-col items-center animate-in slide-in-from-left duration-500">
            <div className="mb-2 relative">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl border-4 border-white shadow-lg overflow-hidden">
                <img src={`https://picsum.photos/seed/${top3[1][config.nameColumn]}/100`} alt="avatar" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">2</div>
            </div>
            <div className="w-full h-24 bg-slate-200 rounded-t-2xl shadow-inner flex flex-col items-center justify-center p-2">
              <span className="text-sm font-bold text-slate-600 truncate w-full text-center" dir="auto">{top3[1][config.nameColumn]}</span>
              <span className="text-lg font-black text-slate-800">{top3[1][config.scoreColumn]}</span>
            </div>
          </div>
        )}

        {top3[0] && (
          <div className="flex flex-col items-center animate-in zoom-in duration-700">
            <div className="mb-2 relative scale-110">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                <i className="fas fa-crown text-2xl"></i>
              </div>
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-3xl border-4 border-white shadow-xl overflow-hidden ring-4 ring-amber-100/50">
                <img src={`https://picsum.photos/seed/${top3[0][config.nameColumn]}/100`} alt="avatar" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white">1</div>
            </div>
            <div className="w-full h-32 bg-indigo-600 rounded-t-2xl shadow-xl flex flex-col items-center justify-center p-2">
              <span className="text-base font-bold text-white truncate w-full text-center" dir="auto">{top3[0][config.nameColumn]}</span>
              <span className="text-2xl font-black text-white">{top3[0][config.scoreColumn]}</span>
            </div>
          </div>
        )}

        {top3[2] && (
          <div className="flex flex-col items-center animate-in slide-in-from-right duration-500">
            <div className="mb-2 relative">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl border-4 border-white shadow-lg overflow-hidden">
                <img src={`https://picsum.photos/seed/${top3[2][config.nameColumn]}/100`} alt="avatar" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">3</div>
            </div>
            <div className="w-full h-20 bg-orange-100 rounded-t-2xl shadow-inner flex flex-col items-center justify-center p-2">
              <span className="text-sm font-bold text-orange-700 truncate w-full text-center" dir="auto">{top3[2][config.nameColumn]}</span>
              <span className="text-lg font-black text-orange-900">{top3[2][config.scoreColumn]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table - Header and Config sections hidden as requested */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-end">
          <div className="relative w-full max-w-xs">
            <input 
              type="text" 
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Name (Arabic)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-indigo-600 bg-indigo-50/30 uppercase tracking-wider text-right border-x border-indigo-100/50">
                  {config.scoreColumn}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((row, index) => {
                const globalRank = sortedData.findIndex(r => r === row) + 1;
                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ring-2 ${getRankStyle(globalRank - 1)}`}>
                        {globalRank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 mr-3 flex-shrink-0 overflow-hidden border border-white shadow-sm">
                           <img src={`https://picsum.photos/seed/${row[config.nameColumn]}/100`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-lg" dir="auto">
                            {String(row[config.nameColumn])}
                            <span className="ml-2 inline-block">{getMedalIcon(globalRank - 1)}</span>
                          </div>
                          {config.groupColumn && (
                             <div className="text-xs text-slate-400 font-medium">{String(row[config.groupColumn])}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right bg-indigo-50/10 border-x border-indigo-50/50">
                      <span className="text-xl font-black text-indigo-700 tabular-nums">
                        {row[config.scoreColumn]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <i className="fas fa-search-minus text-4xl mb-4 opacity-20"></i>
              <p>No results found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardDisplay;
