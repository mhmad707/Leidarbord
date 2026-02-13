
import React, { useState, useCallback, useEffect } from 'react';
import { SheetRow, AppState } from './types';
import { analyzeSheetData } from './services/gemini';
import Header from './components/Header';
import LeaderboardDisplay from './components/LeaderboardDisplay';
import PointsSystemDisplay from './components/PointsSystemDisplay';

const LEADERBOARD_SHEET_ID = '16-lTDAzjiErO4mRy7_hYhAua_6LQN4mMZ3SaYskhavE';
const POINTS_SYSTEM_SHEET_ID = '1bH32M6_2_ehSTlo6iov4slxaX18U_HZlG5wOv8ecma4';

type ViewMode = 'leaderboard' | 'points';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('leaderboard');
  const [state, setState] = useState<AppState>({
    data: [],
    analysis: null,
    loading: true, 
    error: null,
    sheetUrl: '',
  });

  const parseCsv = (csvText: string): SheetRow[] => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    // Simple CSV parser that handles quotes and commas
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const headers = lines[0].split(regex).map(h => h.trim().replace(/^"(.*)"$/, '$1'));
    
    return lines.slice(1).map(line => {
      const values = line.split(regex).map(v => v.trim().replace(/^"(.*)"$/, '$1'));
      const row: SheetRow = {};
      headers.forEach((header, index) => {
        const val = values[index] || '';
        const numericVal = val.replace(',', '.');
        row[header] = !isNaN(Number(numericVal)) && val !== '' ? Number(numericVal) : val;
      });
      return row;
    });
  };

  const fetchData = useCallback(async (isSilent = false, targetMode?: ViewMode) => {
    const mode = targetMode || viewMode;
    const idToFetch = mode === 'leaderboard' ? LEADERBOARD_SHEET_ID : POINTS_SYSTEM_SHEET_ID;
    
    if (!isSilent) setState(prev => ({ ...prev, loading: true, data: isSilent ? prev.data : [] }));
    
    try {
      const freshUrl = `https://docs.google.com/spreadsheets/d/${idToFetch}/export?format=csv&cachebust=${Date.now()}`;
      const response = await fetch(freshUrl);
      if (!response.ok) throw new Error('Failed to fetch data.');
      
      const csvText = await response.text();
      const rows = parseCsv(csvText);
      
      if (rows.length === 0) throw new Error('The document appears to be empty.');
      
      if (mode === 'leaderboard') {
        try {
          const analysis = await analyzeSheetData(rows);
          setState(prev => ({ ...prev, data: rows, analysis, loading: false, error: null, sheetUrl: freshUrl }));
        } catch (err) {
          setState(prev => ({ ...prev, data: rows, loading: false, error: null, sheetUrl: freshUrl }));
        }
      } else {
        setState(prev => ({ ...prev, data: rows, analysis: null, loading: false, error: null, sheetUrl: freshUrl }));
      }
    } catch (err: any) {
      if (!isSilent) setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, [viewMode]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleToggleView = () => {
    const nextMode = viewMode === 'leaderboard' ? 'points' : 'leaderboard';
    setViewMode(nextMode);
    fetchData(false, nextMode);
  };

  const getLeaderboardConfig = () => {
    if (state.data.length === 0) return { nameColumn: '', scoreColumn: '' };
    const headers = Object.keys(state.data[0]);
    return {
      nameColumn: headers[2] || headers[0],
      scoreColumn: headers[3] || headers[headers.length - 1],
      groupColumn: headers[1],
      imageColumn: headers[4] // Column E
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        onLogoClick={() => fetchData()} 
        onSwitchView={handleToggleView}
        viewMode={viewMode}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {state.loading && state.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            <p className="text-slate-500 font-medium animate-pulse">
              {viewMode === 'leaderboard' ? 'Loading Rankings...' : 'Loading Points System...'}
            </p>
          </div>
        )}

        {state.error && state.data.length === 0 && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl flex items-center shadow-sm">
            <i className="fas fa-exclamation-circle mr-3 text-xl"></i>
            <div>
              <p className="font-bold">Connection Error</p>
              <p className="text-sm opacity-90">{state.error}</p>
            </div>
          </div>
        )}

        {state.data.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span>Live Updates Enabled</span>
            </div>
            
            {viewMode === 'leaderboard' ? (
              <LeaderboardDisplay 
                data={state.data} 
                config={state.analysis?.config || getLeaderboardConfig()} 
              />
            ) : (
              <PointsSystemDisplay data={state.data} />
            )}
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} IQRA Ranks - مسجد الشفاء. {viewMode === 'leaderboard' ? 'نتائج المسابقة' : 'نظام النقاط'}
        </div>
      </footer>
    </div>
  );
};

export default App;
