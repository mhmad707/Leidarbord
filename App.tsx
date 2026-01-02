
import React, { useState, useCallback, useEffect } from 'react';
import { SheetRow, AppState } from './types';
import { analyzeSheetData } from './services/gemini';
import Header from './components/Header';
import LeaderboardDisplay from './components/LeaderboardDisplay';

const FIXED_SHEET_ID = '16-lTDAzjiErO4mRy7_hYhAua_6LQN4mMZ3SaYskhavE';
const EXPORT_URL = `https://docs.google.com/spreadsheets/d/${FIXED_SHEET_ID}/export?format=csv`;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    data: [],
    analysis: null,
    loading: true, // Start in loading state for auto-fetch
    error: null,
    sheetUrl: EXPORT_URL,
  });

  const parseCsv = (csvText: string): SheetRow[] => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
      const row: SheetRow = {};
      headers.forEach((header, index) => {
        const val = values[index] || '';
        // Attempt to parse decimals correctly (handle both . and ,)
        const numericVal = val.replace(',', '.');
        row[header] = !isNaN(Number(numericVal)) && val !== '' ? Number(numericVal) : val;
      });
      return row;
    });
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(EXPORT_URL);
      if (!response.ok) throw new Error('Failed to fetch sheet. Ensure it is public or shared.');
      
      const csvText = await response.text();
      const rows = parseCsv(csvText);
      
      if (rows.length === 0) throw new Error('The sheet appears to be empty.');
      
      // We still run analysis to get the configuration if possible, 
      // but we will only display the leaderboard.
      try {
        const analysis = await analyzeSheetData(rows);
        setState(prev => ({ ...prev, data: rows, analysis, loading: false }));
      } catch (err) {
        // Fallback if AI fails
        setState(prev => ({ ...prev, data: rows, loading: false }));
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Determine configuration with C (index 2) as Name and D (index 3) as Rank
  const getDisplayConfig = () => {
    if (state.data.length === 0) return { nameColumn: '', scoreColumn: '' };
    const headers = Object.keys(state.data[0]);
    return {
      nameColumn: headers[2] || headers[0],
      scoreColumn: headers[3] || headers[headers.length - 1],
      groupColumn: headers[1] 
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onLogoClick={() => window.location.reload()} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        {state.loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading Rankings...</p>
          </div>
        )}

        {!state.loading && state.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl flex items-center shadow-sm">
            <i className="fas fa-exclamation-circle mr-3 text-xl"></i>
            <div>
              <p className="font-bold">Connection Error</p>
              <p className="text-sm opacity-90">{state.error}</p>
            </div>
          </div>
        )}

        {!state.loading && state.data.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <LeaderboardDisplay 
              data={state.data} 
              config={state.analysis?.config || getDisplayConfig()} 
            />
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} IQRA Ranks - مسجد الشفاء. Optimized for Arabic.
        </div>
      </footer>
    </div>
  );
};

export default App;
