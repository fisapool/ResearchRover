/// <reference types="chrome"/>

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

// Content script for the extension
// This runs on webpages to provide highlighting functionality

// Function to get selected text from the page
function getSelectedText(): string {
  return window.getSelection()?.toString() || '';
}

// Function to get selected text with additional info
function getSelectionInfo() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
    return null;
  }
  
  return {
    text: selection.toString(),
    pageUrl: window.location.href,
    pageTitle: document.title,
  };
}

// Function to highlight selected text
function highlightSelectedText(color = '#4CAF50'): boolean {
  const selection = window.getSelection();
  
  if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
    return false;
  }
  
  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  span.style.backgroundColor = color;
  span.style.color = 'white';
  span.className = 'research-assist-highlight';
  span.dataset.timestamp = new Date().toISOString();
  
  try {
    range.surroundContents(span);
    return true;
  } catch (error) {
    console.error('Error highlighting text:', error);
    // Handle complex selections (spanning multiple DOM elements)
    try {
      // Create a document fragment for the selected content
      const fragment = range.cloneContents();
      
      // Create a wrapper span for the entire selection
      const wrapper = document.createElement('span');
      wrapper.className = 'research-assist-highlight-wrapper';
      wrapper.style.backgroundColor = 'transparent';
      
      // Apply highlights to text nodes in the fragment
      highlightTextNodesInFragment(fragment, color);
      
      // Clear the selection range and insert the highlighted fragment
      range.deleteContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
      
      return true;
    } catch (fragmentError) {
      console.error('Failed to highlight complex selection:', fragmentError);
      return false;
    }
  }
}

// Helper function to highlight text nodes in a document fragment
function highlightTextNodesInFragment(fragment: DocumentFragment, color: string) {
  const walker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  const textNodes = [];
  let currentNode = walker.nextNode();
  
  // Collect all text nodes
  while (currentNode) {
    textNodes.push(currentNode);
    currentNode = walker.nextNode();
  }
  
  // Wrap each text node in a highlight span
  textNodes.forEach(textNode => {
    if (textNode.textContent?.trim()) {
      const span = document.createElement('span');
      span.className = 'research-assist-highlight';
      span.style.backgroundColor = color;
      span.style.color = 'white';
      span.dataset.timestamp = new Date().toISOString();
      
      const parent = textNode.parentNode;
      if (parent) {
        // Replace the text node with the highlighted span
        const highlightedNode = span.cloneNode(true);
        highlightedNode.appendChild(textNode.cloneNode(true));
        parent.replaceChild(highlightedNode, textNode);
      }
    }
  });
}

// Function to save highlight to background
function saveHighlight(text: string, pageUrl: string, pageTitle: string, color: string = '#4CAF50') {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'SAVE_HIGHLIGHT',
        text: text,
        url: pageUrl,
        pageTitle: pageTitle,
        color: color
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      }
    );
  });
}

// Save highlight to server API directly
async function saveHighlightToServer(title: string, text: string, source: string) {
  try {
    const response = await fetch('http://localhost:5000/api/highlights', {
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

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    const selectionInfo = getSelectionInfo();
    sendResponse(selectionInfo ? 
      { 
        selectedText: selectionInfo.text,
        pageUrl: selectionInfo.pageUrl,
        pageTitle: selectionInfo.pageTitle 
      } : 
      { selectedText: '' }
    );
  } else if (request.action === "highlightSelection") {
    const success = highlightSelectedText(request.color || '#4CAF50');
    
    // If highlighting was successful, try to save the highlight
    if (success && request.save === true) {
      const selectionInfo = getSelectionInfo();
      if (selectionInfo) {
        // Save highlight via extension's internal storage
        saveHighlight(
          selectionInfo.text,
          selectionInfo.pageUrl,
          selectionInfo.pageTitle,
          request.color || '#4CAF50'
        )
        .then(result => {
          sendResponse({ success: true, saved: true, highlight: selectionInfo });
        })
        .catch(err => {
          console.error('Failed to save highlight:', err);
          sendResponse({ success: true, saved: false, error: err.message });
        });
        
        return true; // Keeps message channel open for async response
      }
    }
    
    sendResponse({ success });
  } else if (request.action === "saveHighlight") {
    // For directly saving a highlight without visual highlighting
    const selectionInfo = getSelectionInfo();
    if (selectionInfo) {
      const title = request.title || selectionInfo.pageTitle || 'Untitled Highlight';
      
      // Save to server API
      saveHighlightToServer(title, selectionInfo.text, selectionInfo.pageUrl)
        .then(result => {
          sendResponse({ success: true, saved: true, highlight: result });
        })
        .catch(err => {
          console.error('Failed to save highlight to server:', err);
          sendResponse({ success: false, saved: false, error: err.message });
        });
      
      return true; // Keeps message channel open for async response
    } else {
      sendResponse({ success: false, error: 'No text selected' });
    }
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
    cursor: pointer;
  }
  
  .research-assist-highlight-wrapper {
    display: inline;
  }
`;
document.head.appendChild(style);
