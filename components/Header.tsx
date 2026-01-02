
import React from 'react';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  // Using the direct download format for Google Drive images
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
              alt="IQRA Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback icon if the image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '<i class="fas fa-book-open text-indigo-600 text-xl"></i>';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-slate-800 leading-none">
              IQRA <span className="text-indigo-600">Ranks</span>
            </span>
            <span className="text-sm font-bold text-slate-400 mt-1">Leaderboard System</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-wide" dir="rtl">
            مسجد <span className="text-indigo-600">الشفاء</span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
