import React from 'react';

const QuickActionButton: React.FC = () => {
  const handleQuickHighlight = () => {
    // Send message to content script to highlight selected text
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "highlightSelection" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }
            
            if (response && response.success) {
              alert('Text highlighted successfully!');
            } else {
              alert('No text selected or unable to highlight. Please select text on the page first.');
            }
          }
        );
      }
    });
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button 
        className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:bg-secondary/90 transition-colors" 
        aria-label="Quick highlight"
        onClick={handleQuickHighlight}
      >
        <span className="material-icons">highlight</span>
      </button>
    </div>
  );
};

export default QuickActionButton;
