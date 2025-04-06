/// <reference types="chrome"/>

// Background script for ResearchAssist extension
// This script runs in the background and handles extension events

// Define types for Chrome API
interface ChromeInstalledDetails {
  reason: 'install' | 'update' | 'chrome_update' | 'shared_module_update';
  previousVersion?: string;
  id?: string;
}

interface ChromeMessage {
  type: string;
  action?: string;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  text?: string;
  url?: string;
  pageUrl?: string;
  pageTitle?: string;
  color?: string;
  note?: string;
  save?: boolean;
}

interface ChromeSender {
  tab?: chrome.tabs.Tab;
  frameId?: number;
  id?: string;
  url?: string;
  tlsChannelId?: string;
  origin?: string;
}

interface ChromeResponse {
  success: boolean;
  saved?: boolean;
  highlight?: any;
  note?: any;
  error?: string;
  timestamp?: string;
}

// API URL for server communication
const API_URL = 'http://localhost:5000';

// Set up storage keys
const STORAGE_KEYS = {
  HIGHLIGHTS: 'research_assist_highlights',
  NOTES: 'research_assist_notes',
  SETTINGS: 'research_assist_settings'
};

// Helper function to save highlight to server API
async function saveHighlightToServer(title: string, text: string, source: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/api/highlights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        text,
        source,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving highlight to server:', error);
    throw error;
  }
}

// Helper function to save note to server API
async function saveNoteToServer(title: string, content: string, category: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
        category,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving note to server:', error);
    throw error;
  }
}

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener((details: ChromeInstalledDetails) => {
  if (details.reason === 'install') {
    // First-time installation
    console.log('ResearchAssist extension installed');
    
    // Initialize storage with default settings
    chrome.storage.local.set({
      [STORAGE_KEYS.HIGHLIGHTS]: [],
      [STORAGE_KEYS.NOTES]: [],
      [STORAGE_KEYS.SETTINGS]: {
        defaultHighlightColor: '#4CAF50',
        exportIncludeHighlights: true,
        exportIncludeNotes: true,
        defaultExportFormat: 'pdf'
      }
    });
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('ResearchAssist extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message: ChromeMessage, sender: ChromeSender, sendResponse: (response: ChromeResponse) => void) => {
  console.log('Message received in background script:', message);
  
  // Handle highlight saving
  if (message.type === 'SAVE_HIGHLIGHT') {
    // Save highlight to server
    saveHighlightToServer(
      message.pageTitle || 'Untitled Highlight',
      message.text || '',
      message.url || message.pageUrl || ''
    )
    .then(savedHighlight => {
      // Also save to local storage for offline access
      chrome.storage.local.get([STORAGE_KEYS.HIGHLIGHTS], (data) => {
        const highlights = data[STORAGE_KEYS.HIGHLIGHTS] || [];
        highlights.push({
          ...savedHighlight,
          color: message.color || '#4CAF50'
        });
        
        chrome.storage.local.set({ [STORAGE_KEYS.HIGHLIGHTS]: highlights }, () => {
          sendResponse({ 
            success: true, 
            saved: true,
            highlight: savedHighlight
          });
        });
      });
    })
    .catch(error => {
      console.error('Error saving highlight:', error);
      
      // If server save fails, save locally as fallback
      const offlineHighlight = {
        id: Date.now(),
        title: message.pageTitle || 'Untitled Highlight',
        text: message.text || '',
        source: message.url || message.pageUrl || '',
        color: message.color || '#4CAF50',
        createdAt: new Date().toISOString()
      };
      
      chrome.storage.local.get([STORAGE_KEYS.HIGHLIGHTS], (data) => {
        const highlights = data[STORAGE_KEYS.HIGHLIGHTS] || [];
        highlights.push(offlineHighlight);
        
        chrome.storage.local.set({ [STORAGE_KEYS.HIGHLIGHTS]: highlights }, () => {
          sendResponse({
            success: true,
            saved: true,
            highlight: offlineHighlight,
            error: 'Saved offline only: ' + error.message
          });
        });
      });
    });
    
    return true; // Keep the message channel open for the async response
  }
  
  // Handle note saving
  if (message.type === 'SAVE_NOTE') {
    saveNoteToServer(
      message.title || 'Untitled Note',
      message.content || '',
      message.category || 'General'
    )
    .then(savedNote => {
      // Also save to local storage for offline access
      chrome.storage.local.get([STORAGE_KEYS.NOTES], (data) => {
        const notes = data[STORAGE_KEYS.NOTES] || [];
        notes.push(savedNote);
        
        chrome.storage.local.set({ [STORAGE_KEYS.NOTES]: notes }, () => {
          sendResponse({ 
            success: true, 
            saved: true,
            note: savedNote
          });
        });
      });
    })
    .catch(error => {
      console.error('Error saving note:', error);
      
      // If server save fails, save locally as fallback
      const now = new Date().toISOString();
      const offlineNote = {
        id: Date.now(),
        title: message.title || 'Untitled Note',
        content: message.content || '',
        category: message.category || 'General',
        createdAt: now,
        updatedAt: now
      };
      
      chrome.storage.local.get([STORAGE_KEYS.NOTES], (data) => {
        const notes = data[STORAGE_KEYS.NOTES] || [];
        notes.push(offlineNote);
        
        chrome.storage.local.set({ [STORAGE_KEYS.NOTES]: notes }, () => {
          sendResponse({
            success: true,
            saved: true,
            note: offlineNote,
            error: 'Saved offline only: ' + error.message
          });
        });
      });
    });
    
    return true; // Keep the message channel open for the async response
  }
  
  // Default response for unhandled message types
  sendResponse({ success: false, error: 'Unknown message type' });
  return true;
});

console.log('ResearchAssist background script loaded');
