import React, { useState, useEffect } from 'react';
import { CollaborationSession, Note } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

interface CollaborationProps {
  notes: Note[];
  onSessionCreate: (session: CollaborationSession) => void;
  onSessionJoin: (sessionId: string) => void;
  onNoteShare: (noteId: string, sessionId: string) => void;
}

export const Collaboration: React.FC<CollaborationProps> = ({
  notes,
  onSessionCreate,
  onSessionJoin,
  onNoteShare,
}) => {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [newSessionName, setNewSessionName] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      const newSession: CollaborationSession = {
        id: uuidv4(),
        name: newSessionName.trim(),
        participants: [], // This would be populated with actual user IDs
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      onSessionCreate(newSession);
      setSessions([...sessions, newSession]);
      setNewSessionName('');
      setIsCreatingSession(false);
    }
  };

  const handleJoinSession = (sessionId: string) => {
    onSessionJoin(sessionId);
    setSelectedSession(sessionId);
  };

  const handleShareNotes = () => {
    if (selectedSession && selectedNotes.length > 0) {
      selectedNotes.forEach((noteId) => {
        onNoteShare(noteId, selectedSession);
      });
      setSelectedNotes([]);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Collaboration</h3>
        <button
          onClick={() => setIsCreatingSession(true)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        >
          Create New Session
        </button>

        {isCreatingSession && (
          <div className="mb-4">
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="Session name"
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateSession}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreatingSession(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="font-medium mb-2">Active Sessions</h4>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-2 border border-gray-200 rounded hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <span>{session.name}</span>
                  <button
                    onClick={() => handleJoinSession(session.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Join
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {session.participants.length} participants
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedSession && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Share Notes</h4>
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedNotes.includes(note.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotes([...selectedNotes, note.id]);
                      } else {
                        setSelectedNotes(
                          selectedNotes.filter((id) => id !== note.id)
                        );
                      }
                    }}
                  />
                  <span>{note.title}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleShareNotes}
              disabled={selectedNotes.length === 0}
              className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Share Selected Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 