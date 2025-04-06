/// <reference types="chrome"/>

// Background script for ResearchRover extension
// This script runs in the background and handles extension events

// Define types for Chrome API
interface ChromeInstalledDetails {
  reason: 'install' | 'update' | 'chrome_update' | 'shared_module_update';
  previousVersion?: string;
  id?: string;
}

interface ChromeMessage {
  type: string;
  title?: string;
  content?: string;
  tags?: string[];
  text?: string;
  url?: string;
  pageTitle?: string;
  color?: string;
  note?: string;
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
  error?: string;
  timestamp?: string;
}

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener((details: ChromeInstalledDetails) => {
  if (details.reason === 'install') {
    // First-time installation
    console.log('ResearchRover extension installed');
    
    // Initialize storage with default settings
    chrome.storage.local.set({
      notes: [],
      highlights: [],
      settings: {
        autoSync: true,
        syncInterval: 5, // minutes
        defaultVisualization: 'line',
        aiAnalysisEnabled: true
      }
    });
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('ResearchRover extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message: ChromeMessage, sender: ChromeSender, sendResponse: (response: ChromeResponse) => void) => {
  console.log('Message received in background script:', message);
  
  if (message.type === 'SAVE_NOTE') {
    // Handle saving a note
    chrome.storage.local.get('notes', (data: { notes?: any[] }) => {
      const notes = data.notes || [];
      notes.push({
        id: Date.now().toString(),
        title: message.title,
        content: message.content,
        tags: message.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      chrome.storage.local.set({ notes }, () => {
        sendResponse({ success: true });
      });
    });
    return true; // Keep the message channel open for the async response
  }
  
  if (message.type === 'SAVE_HIGHLIGHT') {
    // Handle saving a highlight
    chrome.storage.local.get('highlights', (data: { highlights?: any[] }) => {
      const highlights = data.highlights || [];
      highlights.push({
        id: Date.now().toString(),
        text: message.text,
        url: message.url,
        pageTitle: message.pageTitle,
        color: message.color || 'yellow',
        note: message.note || '',
        createdAt: new Date().toISOString()
      });
      
      chrome.storage.local.set({ highlights }, () => {
        sendResponse({ success: true });
      });
    });
    return true; // Keep the message channel open for the async response
  }
  
  if (message.type === 'SYNC_DATA') {
    // Handle data synchronization
    console.log('Syncing data...');
    // In a real implementation, this would send data to a server
    // For now, we'll just simulate a successful sync
    setTimeout(() => {
      sendResponse({ success: true, timestamp: new Date().toISOString() });
    }, 1000);
    return true; // Keep the message channel open for the async response
  }
  
  // Default response for unhandled message types
  sendResponse({ success: false, error: 'Unknown message type' });
});

// Set up alarm for periodic sync if enabled
chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
  if (alarm.name === 'autoSync') {
    chrome.storage.local.get('settings', (data: { settings?: { autoSync?: boolean } }) => {
      if (data.settings && data.settings.autoSync) {
        // Trigger sync
        chrome.runtime.sendMessage({ type: 'SYNC_DATA' });
      }
    });
  }
});

// Initialize alarm for auto-sync
chrome.storage.local.get('settings', (data: { settings?: { autoSync?: boolean, syncInterval?: number } }) => {
  if (data.settings && data.settings.autoSync) {
    const interval = (data.settings.syncInterval || 5) * 60; // Convert minutes to seconds
    chrome.alarms.create('autoSync', { periodInMinutes: interval });
  }
});

// This is where we would add more background functionality
// Such as notifications, alarms, or other events

console.log('ResearchRover background script loaded');
