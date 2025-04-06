import { Highlight, Note } from '@shared/schema';
import { apiRequest } from './queryClient';

// Environment detection
const isExtension = typeof chrome !== 'undefined' && chrome.storage;

// Storage strategy - use Chrome storage in extension context, API otherwise
const useApiStorage = !isExtension;

// Chrome storage keys for extension mode
const STORAGE_KEYS = {
  HIGHLIGHTS: 'research_assist_highlights',
  NOTES: 'research_assist_notes',
};

// Helper to get data from chrome storage (for extension mode)
const getFromStorage = async <T>(key: string): Promise<T> => {
  if (!isExtension) return Promise.resolve([] as unknown as T);
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        // Convert string dates to Date objects for client-side use
        const data = result[key];
        if (Array.isArray(data)) {
          const processed = data.map(item => {
            if (item.createdAt) item.createdAt = new Date(item.createdAt);
            if (item.updatedAt) item.updatedAt = new Date(item.updatedAt);
            return item;
          });
          resolve(processed as T);
        } else {
          resolve(data as T);
        }
      }
    });
  });
};

// Helper to set data in chrome storage (for extension mode)
const setInStorage = async <T>(key: string, value: T): Promise<void> => {
  if (!isExtension) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

// Highlights CRUD operations
export const getHighlights = async (): Promise<Highlight[]> => {
  try {
    if (useApiStorage) {
      const response = await fetch('/api/highlights');
      if (!response.ok) throw new Error('Failed to fetch highlights');
      return await response.json();
    } else {
      const highlights = await getFromStorage<Highlight[]>(STORAGE_KEYS.HIGHLIGHTS);
      return highlights || [];
    }
  } catch (error) {
    console.error('Error getting highlights:', error);
    return [];
  }
};

export const getHighlight = async (id: number): Promise<Highlight | undefined> => {
  try {
    if (useApiStorage) {
      const response = await fetch(`/api/highlights/${id}`);
      if (!response.ok) {
        if (response.status === 404) return undefined;
        throw new Error('Failed to fetch highlight');
      }
      return await response.json();
    } else {
      const highlights = await getHighlights();
      return highlights.find(h => h.id === id);
    }
  } catch (error) {
    console.error('Error getting highlight:', error);
    return undefined;
  }
};

export const saveHighlight = async (highlight: { title: string; text: string; source: string; userId: number | null }): Promise<Highlight> => {
  if (useApiStorage) {
    const response = await apiRequest('POST', '/api/highlights', highlight);
    return await response.json();
  } else {
    const highlights = await getHighlights();
    
    // Generate new ID (in a real app, this would be handled server-side)
    const newId = highlights.length ? Math.max(...highlights.map(h => h.id)) + 1 : 1;
    
    const newHighlight: Highlight = {
      ...highlight,
      id: newId,
      createdAt: new Date(),
    };
    
    await setInStorage(STORAGE_KEYS.HIGHLIGHTS, [...highlights, newHighlight]);
    return newHighlight;
  }
};

export const updateHighlight = async (id: number, data: Partial<Highlight>): Promise<Highlight | null> => {
  if (useApiStorage) {
    try {
      const response = await apiRequest('PATCH', `/api/highlights/${id}`, data);
      return await response.json();
    } catch (error) {
      console.error('Error updating highlight:', error);
      return null;
    }
  } else {
    const highlights = await getHighlights();
    const index = highlights.findIndex(h => h.id === id);
    
    if (index === -1) return null;
    
    const updatedHighlight = { ...highlights[index], ...data };
    highlights[index] = updatedHighlight;
    
    await setInStorage(STORAGE_KEYS.HIGHLIGHTS, highlights);
    return updatedHighlight;
  }
};

export const deleteHighlight = async (id: number): Promise<boolean> => {
  try {
    if (useApiStorage) {
      await apiRequest('DELETE', `/api/highlights/${id}`);
      return true;
    } else {
      const highlights = await getHighlights();
      const newHighlights = highlights.filter(h => h.id !== id);
      
      if (newHighlights.length === highlights.length) return false;
      
      await setInStorage(STORAGE_KEYS.HIGHLIGHTS, newHighlights);
      return true;
    }
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return false;
  }
};

// Notes CRUD operations
export const getNotes = async (): Promise<Note[]> => {
  try {
    if (useApiStorage) {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      return await response.json();
    } else {
      const notes = await getFromStorage<Note[]>(STORAGE_KEYS.NOTES);
      return notes || [];
    }
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

export const getNote = async (id: number): Promise<Note | undefined> => {
  try {
    if (useApiStorage) {
      const response = await fetch(`/api/notes/${id}`);
      if (!response.ok) {
        if (response.status === 404) return undefined;
        throw new Error('Failed to fetch note');
      }
      return await response.json();
    } else {
      const notes = await getNotes();
      return notes.find(n => n.id === id);
    }
  } catch (error) {
    console.error('Error getting note:', error);
    return undefined;
  }
};

export const saveNote = async (note: { title: string; content: string; category: string; userId: number | null }): Promise<Note> => {
  if (useApiStorage) {
    const response = await apiRequest('POST', '/api/notes', note);
    return await response.json();
  } else {
    const notes = await getNotes();
    
    // Generate new ID
    const newId = notes.length ? Math.max(...notes.map(n => n.id)) + 1 : 1;
    const now = new Date();
    
    const newNote: Note = {
      ...note,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    await setInStorage(STORAGE_KEYS.NOTES, [...notes, newNote]);
    return newNote;
  }
};

export const updateNote = async (id: number, data: Partial<Note>): Promise<Note | null> => {
  if (useApiStorage) {
    try {
      const response = await apiRequest('PATCH', `/api/notes/${id}`, data);
      return await response.json();
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  } else {
    const notes = await getNotes();
    const index = notes.findIndex(n => n.id === id);
    
    if (index === -1) return null;
    
    const updatedNote = { 
      ...notes[index], 
      ...data,
      updatedAt: new Date(),
    };
    
    notes[index] = updatedNote;
    
    await setInStorage(STORAGE_KEYS.NOTES, notes);
    return updatedNote;
  }
};

export const deleteNote = async (id: number): Promise<boolean> => {
  try {
    if (useApiStorage) {
      await apiRequest('DELETE', `/api/notes/${id}`);
      return true;
    } else {
      const notes = await getNotes();
      const newNotes = notes.filter(n => n.id !== id);
      
      if (newNotes.length === notes.length) return false;
      
      await setInStorage(STORAGE_KEYS.NOTES, newNotes);
      return true;
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
};
