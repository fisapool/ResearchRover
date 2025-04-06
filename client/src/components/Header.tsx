import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white py-3 px-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        <span className="material-icons">bookmarks</span>
        <h1 className="font-inter font-semibold text-lg">ResearchAssist</h1>
      </div>
      <div className="flex items-center gap-2">
        <button 
          className="p-1 rounded hover:bg-white/10 transition-colors" 
          aria-label="Settings"
        >
          <span className="material-icons text-xl">settings</span>
        </button>
        <button 
          className="p-1 rounded hover:bg-white/10 transition-colors" 
          aria-label="Help"
        >
          <span className="material-icons text-xl">help_outline</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
