import React from 'react';
import { TabType } from '../App';

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-borderColor flex" role="tablist">
      <button 
        id="tab-highlights" 
        className={`flex-1 py-3 px-4 font-inter font-medium text-sm flex items-center justify-center gap-1 ${
          activeTab === 'highlights' 
            ? 'text-primary border-b-2 border-primary' 
            : 'text-accent hover:text-text'
        }`} 
        role="tab" 
        aria-selected={activeTab === 'highlights'} 
        onClick={() => setActiveTab('highlights')}
      >
        <span className="material-icons text-sm">format_highlight</span>
        <span>Highlights</span>
      </button>
      <button 
        id="tab-notes" 
        className={`flex-1 py-3 px-4 font-inter font-medium text-sm flex items-center justify-center gap-1 ${
          activeTab === 'notes' 
            ? 'text-primary border-b-2 border-primary' 
            : 'text-accent hover:text-text'
        }`} 
        role="tab" 
        aria-selected={activeTab === 'notes'} 
        onClick={() => setActiveTab('notes')}
      >
        <span className="material-icons text-sm">note</span>
        <span>Notes</span>
      </button>
      <button 
        id="tab-tools" 
        className={`flex-1 py-3 px-4 font-inter font-medium text-sm flex items-center justify-center gap-1 ${
          activeTab === 'tools' 
            ? 'text-primary border-b-2 border-primary' 
            : 'text-accent hover:text-text'
        }`} 
        role="tab" 
        aria-selected={activeTab === 'tools'} 
        onClick={() => setActiveTab('tools')}
      >
        <span className="material-icons text-sm">build</span>
        <span>Tools</span>
      </button>
    </div>
  );
};

export default TabNavigation;
