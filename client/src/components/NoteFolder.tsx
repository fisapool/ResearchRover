import React, { useState } from 'react';
import { Folder, Note } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

interface NoteFolderProps {
  folder: Folder;
  notes: Note[];
  onFolderSelect: (folderId: string) => void;
  onNoteSelect: (noteId: string) => void;
  onCreateSubfolder: (parentId: string, name: string) => void;
  onCreateNote: (folderId: string) => void;
}

export const NoteFolder: React.FC<NoteFolderProps> = ({
  folder,
  notes,
  onFolderSelect,
  onNoteSelect,
  onCreateSubfolder,
  onCreateNote,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreatingSubfolder, setIsCreatingSubfolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const folderNotes = notes.filter(note => note.folderId === folder.id);

  const handleCreateSubfolder = () => {
    if (newFolderName.trim()) {
      onCreateSubfolder(folder.id, newFolderName.trim());
      setNewFolderName('');
      setIsCreatingSubfolder(false);
    }
  };

  return (
    <div className="ml-4">
      <div className="flex items-center gap-2 py-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        <span className="font-medium">{folder.name}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreatingSubfolder(true)}
            className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            New Folder
          </button>
          <button
            onClick={() => onCreateNote(folder.id)}
            className="px-2 py-1 text-sm bg-blue-100 rounded hover:bg-blue-200"
          >
            New Note
          </button>
        </div>
      </div>

      {isCreatingSubfolder && (
        <div className="ml-6 mb-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="p-1 border border-gray-300 rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateSubfolder()}
          />
          <button
            onClick={handleCreateSubfolder}
            className="ml-2 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create
          </button>
          <button
            onClick={() => setIsCreatingSubfolder(false)}
            className="ml-2 px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="ml-6">
          {folderNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onNoteSelect(note.id)}
              className="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              {note.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 