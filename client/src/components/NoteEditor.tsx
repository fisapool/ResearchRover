import React, { useState, useEffect } from 'react';
import { Note, Tag, Highlight } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Note) => void;
  onCancel: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);

  const handleSave = () => {
    const updatedNote: Note = {
      id: note?.id || uuidv4(),
      title,
      content,
      tags,
      createdAt: note?.createdAt || new Date(),
      updatedAt: new Date(),
      folderId: note?.folderId || null,
      links: note?.links || [],
      highlights: note?.highlights || [],
      metadata: note?.metadata || {},
    };
    onSave(updatedNote);
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="w-full p-2 text-xl font-bold border-b border-gray-300 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onMouseUp={handleTextSelection}
          placeholder="Write your note here..."
          className="w-full h-64 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Tag
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-200 rounded-full flex items-center gap-2"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {selectedText && (
        <div className="mb-4 p-2 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">Selected text: {selectedText}</p>
          <button
            onClick={() => setShowLinkModal(true)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Link
          </button>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}; 