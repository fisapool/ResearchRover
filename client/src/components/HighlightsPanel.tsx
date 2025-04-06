import React, { useState, useEffect } from 'react';
import { getHighlights, deleteHighlight, saveHighlight } from '../lib/storage';
import { Highlight, InsertHighlight } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

const HighlightsPanel: React.FC = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [highlightSource, setHighlightSource] = useState('');
  const [highlightTitle, setHighlightTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load highlights on component mount
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
    // Reset any previous error
    setErrorMessage('');
    
    // Send message to content script to get selected text
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getSelection" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              setErrorMessage('Unable to communicate with the page. Make sure you are on an actual webpage.');
              return;
            }
            
            if (response && response.selectedText) {
              // Save the selected text and show the form
              setSelectedText(response.selectedText);
              setHighlightSource(response.pageUrl || '');
              setHighlightTitle(response.pageTitle || 'Untitled Highlight');
              setShowSaveForm(true);
            } else {
              setErrorMessage('No text selected. Please select text on the page first.');
            }
          }
        );
      } else {
        setErrorMessage('Unable to access the current tab.');
      }
    });
  };

  const handleQuickSaveHighlight = async () => {
    // Reset any previous error
    setErrorMessage('');
    
    // Send message to content script to get selected text and save directly
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "saveHighlight" },
          async (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              setErrorMessage('Unable to communicate with the page. Make sure you are on an actual webpage.');
              return;
            }
            
            if (response && response.success) {
              // Highlight was saved successfully on the server
              // Refresh the highlights list
              try {
                const data = await getHighlights();
                setHighlights(data);
                alert('Highlight saved successfully!');
              } catch (error) {
                console.error('Failed to refresh highlights:', error);
              }
            } else {
              setErrorMessage(response?.error || 'Failed to save highlight. Please try again.');
            }
          }
        );
      } else {
        setErrorMessage('Unable to access the current tab.');
      }
    });
  };

  const handleSaveHighlight = async () => {
    if (!selectedText || !highlightTitle) {
      setErrorMessage('Title and text are required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      // First, highlight the text on the page
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]?.id) {
          // Attempt to highlight the text visually
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "highlightSelection", color: '#4CAF50' },
            async () => {
              try {
                // Save the highlight to the database
                const newHighlight: Omit<InsertHighlight, 'id'> = {
                  title: highlightTitle,
                  text: selectedText,
                  source: highlightSource || window.location.href,
                  userId: null, // Ensure userId is set to null, not undefined
                };
            
                const savedHighlight = await saveHighlight(newHighlight);
                
                // Update highlights list with the new highlight
                setHighlights([...highlights, savedHighlight]);
                
                // Reset form
                setShowSaveForm(false);
                setSelectedText('');
                setHighlightTitle('');
                setHighlightSource('');
                
                // Show success message
                alert('Highlight saved successfully!');
              } catch (error) {
                console.error('Failed to save highlight:', error);
                setErrorMessage('Failed to save highlight. Please try again.');
              } finally {
                setIsSaving(false);
              }
            }
          );
        } else {
          setErrorMessage('Unable to access the current tab.');
          setIsSaving(false);
        }
      });
    } catch (error) {
      console.error('Error saving highlight:', error);
      setErrorMessage('Error saving highlight. Please try again.');
      setIsSaving(false);
    }
  };

  const handleCancelSave = () => {
    setShowSaveForm(false);
    setSelectedText('');
    setHighlightTitle('');
    setHighlightSource('');
    setErrorMessage('');
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

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {errorMessage}
          </div>
        )}

        {showSaveForm ? (
          <div className="bg-white border border-borderColor rounded-md p-4 mb-4">
            <h3 className="font-inter font-medium text-base mb-3">Save Highlight</h3>
            
            <div className="mb-3">
              <label htmlFor="highlight-title" className="block text-sm text-accent mb-1">Title</label>
              <input 
                id="highlight-title" 
                type="text" 
                className="w-full border border-borderColor rounded px-3 py-2 text-sm focus-visible" 
                value={highlightTitle}
                onChange={(e) => setHighlightTitle(e.target.value)}
                placeholder="Enter a title for this highlight"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="highlight-text" className="block text-sm text-accent mb-1">Selected Text</label>
              <div className="bg-lightGray border border-borderColor rounded p-3 text-sm mb-2 max-h-32 overflow-y-auto">
                {selectedText}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="highlight-source" className="block text-sm text-accent mb-1">Source</label>
              <input 
                id="highlight-source" 
                type="text" 
                className="w-full border border-borderColor rounded px-3 py-2 text-sm focus-visible" 
                value={highlightSource}
                onChange={(e) => setHighlightSource(e.target.value)}
                placeholder="Enter the source URL"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="text-accent hover:text-text border border-borderColor px-3 py-1 rounded text-sm"
                onClick={handleCancelSave}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1"
                onClick={handleSaveHighlight}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="material-icons animate-spin text-sm">refresh</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons text-sm">save</span>
                    <span>Save Highlight</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
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

            <div className="flex flex-col items-center gap-2 mt-6 mb-2">
              <button 
                className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded font-inter font-medium text-sm flex items-center mx-auto gap-1 shadow-sm"
                onClick={handleHighlightCurrentSelection}
              >
                <span className="material-icons text-sm">add</span>
                <span>Highlight current selection</span>
              </button>
              <button
                className="text-primary hover:text-primary/80 font-medium text-sm flex items-center mx-auto gap-1"
                onClick={handleQuickSaveHighlight}
              >
                <span className="material-icons text-sm">bolt</span>
                <span>Quick save (no visual highlight)</span>
              </button>
            </div>
          </>
        )}
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
