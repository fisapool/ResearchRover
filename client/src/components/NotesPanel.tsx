import React, { useState, useEffect } from 'react';
import { getNotes, saveNote, deleteNote, updateNote } from '../lib/storage';
import { Note, InsertNote } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
  'Important',
  'Research',
  'To Review',
  'Citation',
  'Ideas',
  'Questions',
  'General',
];

const NotesPanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // New note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<string>(CATEGORIES[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const data = await getNotes();
        setNotes(data);
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).length;
  };

  const createNewNote = () => {
    // Reset form state
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory(CATEGORIES[0]);
    setErrorMessage('');
    setShowNoteEditor(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category);
    setErrorMessage('');
    setShowNoteEditor(true);
  };

  const handleSaveNote = async () => {
    // Validate form
    if (!noteTitle.trim()) {
      setErrorMessage('Please enter a title for your note.');
      return;
    }

    if (!noteContent.trim()) {
      setErrorMessage('Please enter some content for your note.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      if (editingNote) {
        // Update existing note
        const updatedNote = await updateNote(editingNote.id, {
          title: noteTitle,
          content: noteContent,
          category: noteCategory,
        });

        if (updatedNote) {
          // Replace the old note with the updated one
          setNotes(notes.map(note => note.id === editingNote.id ? updatedNote : note));
        }
      } else {
        // Create new note
        const newNote = {
          title: noteTitle,
          content: noteContent,
          category: noteCategory,
          userId: null as number | null, // Ensure userId is set to null, not undefined
        };

        const savedNote = await saveNote(newNote);
        
        // Add the new note to the list
        setNotes([...notes, savedNote]);
      }

      // Close the editor and reset form
      setShowNoteEditor(false);
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
      setNoteCategory(CATEGORIES[0]);
    } catch (error) {
      console.error('Failed to save note:', error);
      setErrorMessage('An error occurred while saving the note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        setNotes(notes.filter(note => note.id !== id));
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setShowNoteEditor(false);
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory(CATEGORIES[0]);
    setErrorMessage('');
  };

  const handleExport = () => {
    alert('Export functionality coming soon');
  };

  return (
    <div id="panel-notes" className="tab-panel flex flex-col flex-1 overflow-hidden" role="tabpanel">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-inter font-semibold text-base">Research Notes</h2>
          {!showNoteEditor && (
            <button 
              className="bg-primary hover:bg-primary/90 text-white py-1 px-3 rounded font-inter font-medium text-sm flex items-center gap-1"
              onClick={createNewNote}
            >
              <span className="material-icons text-sm">add</span>
              <span>New Note</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {errorMessage}
          </div>
        )}

        {showNoteEditor ? (
          <div className="bg-white border border-borderColor rounded-md p-4 mb-4">
            <h3 className="font-inter font-medium text-base mb-3">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            
            <div className="mb-3">
              <label htmlFor="note-title" className="block text-sm text-accent mb-1">Title</label>
              <input 
                id="note-title" 
                type="text" 
                className="w-full border border-borderColor rounded px-3 py-2 text-sm focus-visible" 
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter a title for your note"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="note-category" className="block text-sm text-accent mb-1">Category</label>
              <select
                id="note-category"
                className="w-full border border-borderColor rounded px-3 py-2 text-sm focus-visible"
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value)}
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="note-content" className="block text-sm text-accent mb-1">Content</label>
              <textarea 
                id="note-content" 
                className="w-full border border-borderColor rounded px-3 py-2 text-sm focus-visible min-h-[120px]" 
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note content here..."
              />
            </div>
            
            <div className="text-xs text-accent mb-4">
              {getWordCount(noteContent)} words
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="text-accent hover:text-text border border-borderColor px-3 py-1 rounded text-sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1"
                onClick={handleSaveNote}
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
                    <span>Save Note</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="py-8 text-center text-accent">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="py-8 text-center text-accent">No notes saved yet</div>
            ) : (
              notes.map(note => (
                <div 
                  key={note.id} 
                  className="bg-white border border-borderColor rounded-md p-3 mb-3 hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 
                      className="font-inter font-medium text-sm truncate flex-1 cursor-pointer"
                      onClick={() => handleEditNote(note)}
                    >
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-lightGray px-2 py-0.5 rounded-full text-accent">
                        {note.category}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          className="text-accent hover:text-primary transition-colors" 
                          aria-label="Edit"
                          onClick={() => handleEditNote(note)}
                        >
                          <span className="material-icons text-sm">edit</span>
                        </button>
                        <button 
                          className="text-accent hover:text-red-500 transition-colors" 
                          aria-label="Delete"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p 
                    className="text-sm text-text mb-2 line-clamp-2 cursor-pointer" 
                    onClick={() => handleEditNote(note)}
                  >
                    {note.content}
                  </p>
                  <div className="flex justify-between items-center text-xs text-accent">
                    <span>Edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-xs">format_list_bulleted</span>
                      <span>{getWordCount(note.content)} words</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      <div className="border-t border-borderColor p-3 bg-lightGray flex justify-between items-center mt-auto">
        <div className="text-sm text-accent font-inter">
          <span>{notes.length} notes saved</span>
        </div>
        <div className="flex gap-2">
          <button 
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            onClick={handleExport}
          >
            <span className="material-icons text-sm">file_download</span>
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
