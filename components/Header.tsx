
import React from 'react';

interface HeaderProps {
  onLogoClick: () => void;
  onSwitchView: () => void;
  viewMode: 'leaderboard' | 'points';
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, onSwitchView, viewMode }) => {
  const logoUrl = "https://lh3.googleusercontent.com/d/1G4KHlAGhfqEfl5rVrzPdT5iIZwAulyTj";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div 
          onClick={onLogoClick}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100 group-hover:scale-105 transition-transform overflow-hidden">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '<i class="fas fa-mosque text-sky-500 text-xl"></i>';
              }}
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-2xl font-black tracking-tight text-slate-800 leading-none" dir="rtl">
              برنامج رمضان الخير
            </span>
            <span className="text-sm font-bold text-sky-500 mt-1" dir="rtl">مسجد الشفاء</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={onSwitchView}
            className={`px-6 py-2.5 ${viewMode === 'leaderboard' ? 'bg-sky-500' : 'bg-emerald-500'} text-white rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center hover:brightness-110`}
          >
            <i className={`fas ${viewMode === 'leaderboard' ? 'fa-list-check' : 'fa-trophy'} mr-2`}></i>
            <span dir="rtl">
              {viewMode === 'leaderboard' ? 'نظام النقاط' : 'العودة للنتائج'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
