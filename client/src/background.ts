// Background script for the Chrome extension
// This runs in the background to handle extension events

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('ResearchAssist extension installed');
    
    // Initialize storage with empty arrays
    chrome.storage.local.set({
      research_assist_highlights: [],
      research_assist_notes: []
    });
  }
});

// Listen for context menu item clicks
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveHighlight') {
    // Handle saving highlight
    console.log('Saving highlight:', request.data);
    sendResponse({ success: true });
  } else if (request.action === 'saveNote') {
    // Handle saving note
    console.log('Saving note:', request.data);
    sendResponse({ success: true });
  }
  
  return true; // Keep the message channel open for async response
});

// This is where we would add more background functionality
// Such as notifications, alarms, or other events

console.log('ResearchAssist background script loaded');
