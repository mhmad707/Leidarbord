
import React from 'react';
import { SheetRow } from '../types';

interface PointsSystemDisplayProps {
  data: SheetRow[];
}

const PointsSystemDisplay: React.FC<PointsSystemDisplayProps> = ({ data }) => {
  if (data.length === 0) return null;

  // Get all available headers from the sheet
  const allHeaders = Object.keys(data[0]);
  
  // Group headers into pairs (e.g., [A, B], [C, D], [E, F])
  const columnPairs: string[][] = [];
  for (let i = 0; i < allHeaders.length; i += 2) {
    const pair = allHeaders.slice(i, i + 2);
    if (pair.length > 0) {
      columnPairs.push(pair);
    }
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 px-1 md:px-0">
      <div className="text-center space-y-2 md:space-y-3 mb-2 md:mb-4">
        <h2 className="text-2xl md:text-4xl font-black text-slate-900" dir="rtl">نظام النقاط والتقييم</h2>
        <div className="w-16 md:w-24 h-1 md:h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
        <p className="text-slate-500 font-medium text-sm md:text-lg" dir="rtl">المعايير الرسمية لاحتساب الدرجات في المسابقة</p>
      </div>

      <div className="flex flex-col space-y-8 md:space-y-10">
        {columnPairs.map((pair, pairIdx) => {
          const relevantRows = data.filter(row => {
            return pair.some(col => {
              const val = row[col];
              return val !== undefined && val !== null && String(val).trim() !== '';
            });
          });

          if (relevantRows.length === 0) return null;

          return (
            <div key={pairIdx} className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse px-1 md:px-2" dir="rtl">
                <div className="w-8 h-8 md:w-10 h-10 rounded-xl md:rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-black shadow-sm text-sm md:text-base">
                  {pairIdx + 1}
                </div>
                <h3 className="text-lg md:text-2xl font-black text-slate-800">
                   {pair[0] || `الجدول ${pairIdx + 1}`}
                </h3>
              </div>

              <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden transition-all">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse" dir="rtl">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        {pair.map((header, hIdx) => (
                          <th 
                            key={hIdx} 
                            className={`px-4 md:px-8 py-3 md:py-5 text-[10px] md:text-xs font-black uppercase tracking-widest text-right ${hIdx === 1 ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-400'}`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {relevantRows.map((row, rIdx) => (
                        <tr 
                          key={rIdx} 
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          {pair.map((header, cIdx) => (
                            <td 
                              key={cIdx} 
                              className={`px-4 md:px-8 py-3 md:py-5 text-sm md:text-xl font-bold ${cIdx === 1 ? 'text-emerald-600 bg-emerald-50/10' : 'text-slate-700'}`}
                            >
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-emerald-50 rounded-3xl md:rounded-[3rem] p-6 md:p-12 border border-emerald-100 text-emerald-800 relative overflow-hidden group shadow-inner" dir="rtl">
        <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform pointer-events-none hidden md:block">
           <i className="fas fa-kaaba text-[12rem]"></i>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-10 md:space-x-reverse">
          <div className="w-12 h-12 md:w-20 h-20 bg-white rounded-xl md:rounded-[2rem] flex items-center justify-center shadow-lg flex-shrink-0 border border-emerald-200">
            <i className="fas fa-circle-info text-emerald-500 text-xl md:text-4xl"></i>
          </div>
          <div className="text-center md:text-right">
            <h4 className="font-black text-xl md:text-3xl mb-2 md:mb-4">تنبيه لجميع المتسابقين</h4>
            <p className="text-emerald-700 leading-relaxed text-sm md:text-xl opacity-90 max-w-3xl">
              يرجى العلم أن هذه المعايير هي المرجع الوحيد لرصد الدرجات. في حال وجود أي استفسار حول النقاط المسجلة في لوحة الصدارة، يرجى مراجعة اللجنة التنظيمية لمسجد الشفاء. نسأل الله التوفيق للجميع في هذه المسابقة المباركة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsSystemDisplay;
