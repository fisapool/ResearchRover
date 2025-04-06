import { Highlight, Note } from '@shared/schema';

// Chrome storage keys
const STORAGE_KEYS = {
  HIGHLIGHTS: 'research_assist_highlights',
  NOTES: 'research_assist_notes',
};

// Helper to get data from chrome storage
const getFromStorage = async <T>(key: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] as T);
      }
    });
  });
};

// Helper to set data in chrome storage
const setInStorage = async <T>(key: string, value: T): Promise<void> => {
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
    const highlights = await getFromStorage<Highlight[]>(STORAGE_KEYS.HIGHLIGHTS);
    return highlights || [];
  } catch (error) {
    console.error('Error getting highlights:', error);
    return [];
  }
};

export const getHighlight = async (id: number): Promise<Highlight | undefined> => {
  const highlights = await getHighlights();
  return highlights.find(h => h.id === id);
};

export const saveHighlight = async (highlight: Omit<Highlight, 'id' | 'createdAt'>): Promise<Highlight> => {
  const highlights = await getHighlights();
  
  // Generate new ID (in a real app, this would be handled server-side)
  const newId = highlights.length ? Math.max(...highlights.map(h => h.id)) + 1 : 1;
  
  const newHighlight: Highlight = {
    ...highlight,
    id: newId,
    createdAt: new Date().toISOString(),
  };
  
  await setInStorage(STORAGE_KEYS.HIGHLIGHTS, [...highlights, newHighlight]);
  return newHighlight;
};

export const updateHighlight = async (id: number, data: Partial<Highlight>): Promise<Highlight | null> => {
  const highlights = await getHighlights();
  const index = highlights.findIndex(h => h.id === id);
  
  if (index === -1) return null;
  
  const updatedHighlight = { ...highlights[index], ...data };
  highlights[index] = updatedHighlight;
  
  await setInStorage(STORAGE_KEYS.HIGHLIGHTS, highlights);
  return updatedHighlight;
};

export const deleteHighlight = async (id: number): Promise<boolean> => {
  const highlights = await getHighlights();
  const newHighlights = highlights.filter(h => h.id !== id);
  
  if (newHighlights.length === highlights.length) return false;
  
  await setInStorage(STORAGE_KEYS.HIGHLIGHTS, newHighlights);
  return true;
};

// Notes CRUD operations
export const getNotes = async (): Promise<Note[]> => {
  try {
    const notes = await getFromStorage<Note[]>(STORAGE_KEYS.NOTES);
    return notes || [];
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

export const getNote = async (id: number): Promise<Note | undefined> => {
  const notes = await getNotes();
  return notes.find(n => n.id === id);
};

export const saveNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
  const notes = await getNotes();
  
  // Generate new ID
  const newId = notes.length ? Math.max(...notes.map(n => n.id)) + 1 : 1;
  const now = new Date().toISOString();
  
  const newNote: Note = {
    ...note,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };
  
  await setInStorage(STORAGE_KEYS.NOTES, [...notes, newNote]);
  return newNote;
};

export const updateNote = async (id: number, data: Partial<Note>): Promise<Note | null> => {
  const notes = await getNotes();
  const index = notes.findIndex(n => n.id === id);
  
  if (index === -1) return null;
  
  const updatedNote = { 
    ...notes[index], 
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  notes[index] = updatedNote;
  
  await setInStorage(STORAGE_KEYS.NOTES, notes);
  return updatedNote;
};

export const deleteNote = async (id: number): Promise<boolean> => {
  const notes = await getNotes();
  const newNotes = notes.filter(n => n.id !== id);
  
  if (newNotes.length === notes.length) return false;
  
  await setInStorage(STORAGE_KEYS.NOTES, newNotes);
  return true;
};
