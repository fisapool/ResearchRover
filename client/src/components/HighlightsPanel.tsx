import React, { useState, useEffect } from 'react';
import { getHighlights, deleteHighlight } from '../lib/storage';
import { Highlight } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

const HighlightsPanel: React.FC = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHighlights = async () => {
      try {
        const data = await getHighlights();
        setHighlights(data);
      } catch (error) {
        console.error('Failed to load highlights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHighlights();
  }, []);

  const handleDeleteHighlight = async (id: number) => {
    if (confirm('Are you sure you want to delete this highlight?')) {
      try {
        await deleteHighlight(id);
        setHighlights(highlights.filter(h => h.id !== id));
      } catch (error) {
        console.error('Failed to delete highlight:', error);
      }
    }
  };

  const filteredHighlights = highlights.filter(highlight => 
    highlight.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    highlight.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleHighlightCurrentSelection = async () => {
    // Send message to content script to get selected text
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getSelection" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }
            
            if (response && response.selectedText) {
              // Open a dialog or new panel to save the highlight
              // This would be implemented in a real extension
              alert('Selected text: ' + response.selectedText);
            } else {
              alert('No text selected. Please select text on the page first.');
            }
          }
        );
      }
    });
  };

  return (
    <div id="panel-highlights" className="tab-panel flex flex-col flex-1 overflow-hidden" role="tabpanel">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-inter font-semibold text-base">Recent Highlights</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search highlights" 
              className="pl-8 pr-2 py-1 text-sm border border-borderColor rounded focus-visible w-40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="material-icons text-accent absolute left-2 top-1/2 transform -translate-y-1/2 text-sm">search</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-accent">Loading highlights...</div>
        ) : filteredHighlights.length === 0 ? (
          <div className="py-8 text-center text-accent">
            {searchTerm ? 'No highlights match your search' : 'No highlights saved yet'}
          </div>
        ) : (
          filteredHighlights.map(highlight => (
            <div 
              key={highlight.id} 
              className="bg-white border border-borderColor rounded-md p-3 mb-3 hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-inter font-medium text-sm truncate flex-1">{highlight.title}</h3>
                <div className="flex gap-1">
                  <button 
                    className="text-accent hover:text-primary transition-colors" 
                    aria-label="Edit"
                  >
                    <span className="material-icons text-sm">edit</span>
                  </button>
                  <button 
                    className="text-accent hover:text-red-500 transition-colors" 
                    aria-label="Delete"
                    onClick={() => handleDeleteHighlight(highlight.id)}
                  >
                    <span className="material-icons text-sm">delete</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-text mb-2 line-clamp-2">{highlight.text}</p>
              <div className="flex justify-between items-center text-xs text-accent">
                <span>{highlight.source}</span>
                <span>{formatDistanceToNow(new Date(highlight.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          ))
        )}

        <div className="text-center mt-6 mb-2">
          <button 
            className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded font-inter font-medium text-sm flex items-center mx-auto gap-1 shadow-sm"
            onClick={handleHighlightCurrentSelection}
          >
            <span className="material-icons text-sm">add</span>
            <span>Highlight current selection</span>
          </button>
        </div>
      </div>

      <div className="border-t border-borderColor p-3 bg-lightGray flex justify-between items-center mt-auto">
        <div className="text-sm text-accent font-inter">
          <span>{highlights.length} highlights saved</span>
        </div>
        <div className="flex gap-2">
          <button 
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            onClick={() => alert('Export functionality coming soon')}
          >
            <span className="material-icons text-sm">file_download</span>
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HighlightsPanel;
