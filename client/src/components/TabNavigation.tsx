import React from 'react';
import { TabType } from '../App';
import { 
  FileText, // For highlights
  PenTool, // For notes
  WrenchIcon, // For tools
  FileIcon, // For PDF
  BarChart2, // For visualization
  Users // For collaboration
} from 'lucide-react';

interface TabItem {
  id: TabType;
  label: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tabs?: TabItem[];
}

const DEFAULT_TABS: TabItem[] = [
  { id: 'highlights', label: 'Highlights', icon: <FileText size={16} /> },
  { id: 'notes', label: 'Notes', icon: <PenTool size={16} /> },
  { id: 'tools', label: 'Tools', icon: <WrenchIcon size={16} /> }
];

const ICON_MAP = {
  highlights: <FileText size={16} />,
  notes: <PenTool size={16} />,
  tools: <WrenchIcon size={16} />,
  pdf: <FileIcon size={16} />,
  visualize: <BarChart2 size={16} />,
  collaborate: <Users size={16} />
};

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  tabs = DEFAULT_TABS 
}) => {
  return (
    <div className="border-b border-borderColor flex flex-wrap" role="tablist">
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          id={`tab-${tab.id}`} 
          className={`flex-1 py-3 px-2 font-medium text-sm flex items-center justify-center gap-1 min-w-[90px] ${
            activeTab === tab.id 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`} 
          role="tab" 
          aria-selected={activeTab === tab.id} 
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon || ICON_MAP[tab.id] || null}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
