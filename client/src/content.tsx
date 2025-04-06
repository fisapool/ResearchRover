// Content script for the extension
// This runs on webpages to provide highlighting functionality

// Function to get selected text from the page
function getSelectedText(): string {
  return window.getSelection()?.toString() || '';
}

// Function to highlight selected text
function highlightSelectedText(): boolean {
  const selection = window.getSelection();
  
  if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
    return false;
  }
  
  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  span.style.backgroundColor = '#4CAF50';
  span.style.color = 'white';
  span.className = 'research-assist-highlight';
  
  try {
    range.surroundContents(span);
    return true;
  } catch (error) {
    console.error('Error highlighting text:', error);
    return false;
  }
}

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    sendResponse({ selectedText: getSelectedText() });
  } else if (request.action === "highlightSelection") {
    const success = highlightSelectedText();
    sendResponse({ success });
  }
  
  // Return true to indicate that we will send a response asynchronously
  return true;
});

// Initialize content script
console.log('ResearchAssist content script loaded');

// Add custom highlight styles to the page
const style = document.createElement('style');
style.textContent = `
  .research-assist-highlight {
    background-color: #4CAF50;
    color: white;
    border-radius: 2px;
    padding: 0 2px;
  }
`;
document.head.appendChild(style);
