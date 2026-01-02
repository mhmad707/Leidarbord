
import React, { useState } from 'react';
import { SheetRow } from '../types';

interface SpreadsheetLoaderProps {
  onDataLoaded: (data: SheetRow[], url: string) => void;
}

const SpreadsheetLoader: React.FC<SpreadsheetLoaderProps> = ({ onDataLoaded }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseCsv = (csvText: string): SheetRow[] => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
      const row: SheetRow = {};
      headers.forEach((header, index) => {
        const val = values[index];
        // Attempt to parse decimals correctly
        const numericVal = val.replace(',', '.');
        row[header] = !isNaN(Number(numericVal)) && val !== '' ? Number(numericVal) : val;
      });
      return row;
    });
  };

  const handleFetch = async () => {
    setError(null);
    if (!url.includes('docs.google.com/spreadsheets')) {
      setError('Please enter a valid Google Sheets URL.');
      return;
    }

    setIsProcessing(true);
    try {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) throw new Error('Could not parse Spreadsheet ID');
      
      const sheetId = match[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error('Failed to fetch sheet. Ensure it is public or shared.');
      
      const csvText = await response.text();
      const rows = parseCsv(csvText);
      
      if (rows.length === 0) throw new Error('The sheet appears to be empty.');
      
      onDataLoaded(rows, url);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the sheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadDemo = () => {
    // Demo data with Arabic names in Col C and DECIMAL Ranks in Col D
    const demoData: SheetRow[] = [
      { "ID": "101", "الفئة": "ذهبي", "الاسم": "أحمد محمد", "النقاط": 980.5 },
      { "ID": "102", "الفئة": "فضي", "الاسم": "سارة أحمد", "النقاط": 945.75 },
      { "ID": "103", "الفئة": "ذهبي", "الاسم": "ياسين كريم", "النقاط": 1120.2 },
      { "ID": "104", "الفئة": "برونزي", "الاسم": "ليلى محمود", "النقاط": 780.0 },
      { "ID": "105", "الفئة": "فضي", "الاسم": "عمر خالد", "النقاط": 1050.55 },
      { "ID": "106", "الفئة": "ذهبي", "الاسم": "مريم علي", "النقاط": 1090.9 },
    ];
    onDataLoaded(demoData, 'demo');
  };

  return (
    <div className="max-w-2xl mx-auto pt-12 pb-24">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Lidarbord <span className="text-indigo-600">لوحة الصدارة</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-lg mx-auto">
          Connected directly to your spreadsheet. Ranking by Column D (Decimal values supported).
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Google Sheets URL</label>
            <div className="relative">
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
              <i className="fas fa-link absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>
            <p className="mt-3 text-xs text-slate-400 flex items-center">
              <i className="fas fa-info-circle mr-2"></i>
              Column C: Arabic Names | Column D: Rank (Decimals like 8.5 are sorted correctly).
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center animate-in fade-in zoom-in duration-200">
              <i className="fas fa-exclamation-circle mr-3"></i>
              {error}
            </div>
          )}

          <button 
            onClick={handleFetch}
            disabled={isProcessing || !url}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-200"
          >
            {isProcessing ? "Processing..." : "Connect Spreadsheet"}
          </button>

          <button 
            onClick={loadDemo}
            className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
          >
            Try with Decimal Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetLoader;
