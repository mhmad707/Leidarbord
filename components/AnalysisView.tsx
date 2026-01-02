
import React from 'react';
import { GeminiAnalysis } from '../types';

interface AnalysisViewProps {
  analysis: GeminiAnalysis | null;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <i className="fas fa-sparkles"></i>
          </div>
          <h3 className="font-bold text-lg">AI Insight</h3>
        </div>
        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
          {analysis.summary}
        </p>
        <div className="pt-4 border-t border-indigo-500/50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">Key Trends</h4>
          <p className="text-sm font-medium italic">"{analysis.trends}"</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
          <i className="fas fa-star text-amber-500 mr-2"></i>
          Top Performers
        </h3>
        <ul className="space-y-4">
          {analysis.topPerformers.map((performer, idx) => (
            <li key={idx} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold shadow-sm">
                {idx + 1}
              </div>
              <span className="text-sm font-semibold text-slate-700">{performer}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Config Detected</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Name Column</span>
            <span className="font-mono text-indigo-400">{analysis.config.nameColumn}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Score Column</span>
            <span className="font-mono text-indigo-400">{analysis.config.scoreColumn}</span>
          </div>
          {analysis.config.groupColumn && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Category</span>
              <span className="font-mono text-indigo-400">{analysis.config.groupColumn}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
