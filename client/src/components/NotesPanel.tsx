import React, { useState, useEffect } from 'react';
import { getNotes, deleteNote } from '../lib/storage';
import { Note } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

const NotesPanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    // In a real implementation, this would open a note editor
    alert('Note creation functionality coming soon');
  };

  const handleExport = () => {
    alert('Export functionality coming soon');
  };

  return (
    <div id="panel-notes" className="tab-panel flex flex-col flex-1 overflow-hidden" role="tabpanel">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-inter font-semibold text-base">Research Notes</h2>
          <button 
            className="bg-primary hover:bg-primary/90 text-white py-1 px-3 rounded font-inter font-medium text-sm flex items-center gap-1"
            onClick={createNewNote}
          >
            <span className="material-icons text-sm">add</span>
            <span>New Note</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-accent">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="py-8 text-center text-accent">No notes saved yet</div>
        ) : (
          notes.map(note => (
            <div 
              key={note.id} 
              className="bg-white border border-borderColor rounded-md p-3 mb-3 hover:border-primary transition-colors cursor-pointer"
              onClick={() => alert(`Opening note: ${note.title}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-inter font-medium text-sm">{note.title}</h3>
                <span className="text-xs bg-lightGray px-2 py-0.5 rounded-full text-accent">{note.category}</span>
              </div>
              <p className="text-sm text-text mb-2 line-clamp-2">{note.content}</p>
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
