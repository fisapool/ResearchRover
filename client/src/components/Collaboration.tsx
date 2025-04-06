import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Note, Highlight } from '@shared/schema';
import { ClipboardCopy, Send, Share2, UserPlus, Users, MessageSquare, Edit2, Save, X } from 'lucide-react';

type CollaborationMode = 'realtime' | 'shared' | 'chat';
type CollaboratorRole = 'owner' | 'editor' | 'viewer';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  role: CollaboratorRole;
  active: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

interface CollaborationSession {
  id: string;
  name: string;
  collaborators: Collaborator[];
  sharedNotes: string[]; // IDs of shared notes
  sharedHighlights: string[]; // IDs of shared highlights
  chatHistory: ChatMessage[];
  createdAt: Date;
}

interface CollaborationProps {
  notes: Note[];
  highlights: Highlight[];
}

export const Collaboration: React.FC<CollaborationProps> = ({ notes, highlights }) => {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  const [mode, setMode] = useState<CollaborationMode>('shared');
  const [chatMessage, setChatMessage] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeSessionLink, setActiveSessionLink] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mock user for demo
  const currentUser = {
    id: 'user-1',
    name: 'Current User',
    avatar: 'https://ui.shadcn.com/avatars/01.png'
  };

  // Scroll chat to bottom whenever new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.chatHistory]);

  // Create default/demo session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createDemoSession();
    }
  }, []);

  // Create a demo session for testing
  const createDemoSession = () => {
    const demoSession: CollaborationSession = {
      id: `session-${Date.now()}`,
      name: 'Research Project Collaboration',
      collaborators: [
        { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: 'owner', active: true },
        { id: 'user-2', name: 'Alice Johnson', avatar: 'https://ui.shadcn.com/avatars/02.png', role: 'editor', active: false },
        { id: 'user-3', name: 'Bob Williams', avatar: 'https://ui.shadcn.com/avatars/03.png', role: 'viewer', active: false }
      ],
      sharedNotes: notes.slice(0, 2).map(n => n.id.toString()),
      sharedHighlights: highlights.slice(0, 2).map(h => h.id.toString()),
      chatHistory: [
        {
          id: 'msg-1',
          senderId: 'user-2',
          senderName: 'Alice Johnson',
          text: 'I added some notes on the latest research paper.',
          timestamp: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
          id: 'msg-2',
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: "Thanks, I'll take a look and add my thoughts.",
          timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
        }
      ],
      createdAt: new Date(Date.now() - 86400000) // 1 day ago
    };
    
    setSessions([demoSession]);
    setActiveSession(demoSession);
    generateSessionLink(demoSession.id);
  };

  // Create new collaboration session
  const createSession = () => {
    if (!sessionName.trim()) {
      toast({
        title: 'Session name required',
        description: 'Please enter a name for your collaboration session',
        variant: 'destructive'
      });
      return;
    }
    
    const newSession: CollaborationSession = {
      id: `session-${Date.now()}`,
      name: sessionName,
      collaborators: [
        { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: 'owner', active: true }
      ],
      sharedNotes: selectedNotes,
      sharedHighlights: selectedHighlights,
      chatHistory: [],
      createdAt: new Date()
    };
    
    setSessions([...sessions, newSession]);
    setActiveSession(newSession);
    setSessionName('');
    setSelectedNotes([]);
    setSelectedHighlights([]);
    
    generateSessionLink(newSession.id);
    
    toast({
      title: 'Session created',
      description: 'Your collaboration session has been created successfully'
    });
  };

  // Generate shareable link for session
  const generateSessionLink = (sessionId: string) => {
    const baseUrl = window.location.origin;
    setActiveSessionLink(`${baseUrl}/collaborate?session=${sessionId}`);
  };

  // Copy session link to clipboard
  const copySessionLink = () => {
    navigator.clipboard.writeText(activeSessionLink);
    toast({
      title: 'Link copied',
      description: 'Collaboration link copied to clipboard'
    });
  };

  // Send invitation to collaborator
  const inviteCollaborator = () => {
    if (!activeSession) return;
    
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }
    
    // In a real app, this would send an email
    // For demo, just show a success message
    toast({
      title: 'Invitation sent',
      description: `Invitation sent to ${inviteEmail}`
    });
    
    // Add the invited user to collaborators list with pending status
    const updatedSession = {
      ...activeSession,
      collaborators: [
        ...activeSession.collaborators,
        {
          id: `user-${Date.now()}`,
          name: inviteEmail.split('@')[0], // Use part of email as name
          role: 'editor' as CollaboratorRole,
          active: false
        }
      ]
    };
    
    updateSession(updatedSession);
    setInviteEmail('');
  };

  // Update session data
  const updateSession = (updatedSession: CollaborationSession) => {
    setSessions(sessions.map(s => 
      s.id === updatedSession.id ? updatedSession : s
    ));
    setActiveSession(updatedSession);
  };

  // Send chat message
  const sendChatMessage = () => {
    if (!activeSession || !chatMessage.trim()) return;
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: chatMessage,
      timestamp: new Date()
    };
    
    const updatedSession = {
      ...activeSession,
      chatHistory: [...activeSession.chatHistory, newMessage]
    };
    
    updateSession(updatedSession);
    setChatMessage('');
  };

  // Toggle notes/highlights selection
  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) ? 
        prev.filter(id => id !== noteId) : 
        [...prev, noteId]
    );
  };
  
  const toggleHighlightSelection = (highlightId: string) => {
    setSelectedHighlights(prev => 
      prev.includes(highlightId) ? 
        prev.filter(id => id !== highlightId) : 
        [...prev, highlightId]
    );
  };

  // Start editing a note
  const startEditingNote = (note: Note) => {
    setEditingNote(note);
    setEditedNoteContent(note.content);
  };

  // Save edited note
  const saveEditedNote = () => {
    if (!editingNote) return;
    
    // In a real app, this would update the note in the database
    // For demo, just show a success message
    toast({
      title: 'Note updated',
      description: 'Your changes have been saved'
    });
    
    setEditingNote(null);
  };

  // Cancel note editing
  const cancelEditingNote = () => {
    setEditingNote(null);
  };

  // Render shared notes
  const renderSharedNotes = () => {
    if (!activeSession) return null;
    
    const sharedNoteObjects = notes.filter(note => 
      activeSession.sharedNotes.includes(note.id.toString())
    );
    
    if (sharedNoteObjects.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          No notes shared in this session
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {sharedNoteObjects.map(note => (
          <Card key={note.id} className={`${editingNote?.id === note.id ? 'border-blue-400' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{note.title}</CardTitle>
                {editingNote?.id !== note.id && (
                  <Button variant="ghost" size="sm" onClick={() => startEditingNote(note)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardDescription>
                {new Date(note.createdAt).toLocaleDateString()} - {note.category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingNote?.id === note.id ? (
                <Textarea 
                  value={editedNoteContent} 
                  onChange={(e) => setEditedNoteContent(e.target.value)}
                  className="min-h-[120px]"
                />
              ) : (
                <div className="text-sm">{note.content}</div>
              )}
            </CardContent>
            {editingNote?.id === note.id && (
              <CardFooter className="flex justify-end space-x-2 pt-0">
                <Button variant="outline" size="sm" onClick={cancelEditingNote}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={saveEditedNote}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    );
  };

  // Render shared highlights
  const renderSharedHighlights = () => {
    if (!activeSession) return null;
    
    const sharedHighlightObjects = highlights.filter(highlight => 
      activeSession.sharedHighlights.includes(highlight.id.toString())
    );
    
    if (sharedHighlightObjects.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          No highlights shared in this session
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {sharedHighlightObjects.map(highlight => (
          <Card key={highlight.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{highlight.title}</CardTitle>
              <CardDescription>
                {new Date(highlight.createdAt).toLocaleDateString()} - {highlight.source}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="text-sm p-3 rounded-md bg-blue-50" 
              >
                {highlight.text}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render chat messages
  const renderChatMessages = () => {
    if (!activeSession) return null;
    
    if (activeSession.chatHistory.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          No messages yet. Start the conversation!
        </div>
      );
    }
    
    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {activeSession.chatHistory.map(message => {
            const isCurrentUser = message.senderId === currentUser.id;
            const collaborator = activeSession.collaborators.find(c => c.id === message.senderId);
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[80%]`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={collaborator?.avatar} />
                    <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div 
                      className={`rounded-lg p-3 ${
                        isCurrentUser 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} /> {/* Scroll anchor */}
        </div>
      </ScrollArea>
    );
  };

  // Render creation form
  const renderCreateForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Session Name</label>
        <Input 
          value={sessionName} 
          onChange={(e) => setSessionName(e.target.value)} 
          placeholder="Enter session name" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Select Notes to Share</label>
        <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-gray-500 text-center">No notes available</div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="flex items-center mb-2">
                <input 
                  type="checkbox" 
                  id={`note-${note.id}`}
                  checked={selectedNotes.includes(note.id.toString())}
                  onChange={() => toggleNoteSelection(note.id.toString())}
                  className="mr-2"
                />
                <label htmlFor={`note-${note.id}`}>{note.title}</label>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Select Highlights to Share</label>
        <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
          {highlights.length === 0 ? (
            <div className="text-gray-500 text-center">No highlights available</div>
          ) : (
            highlights.map(highlight => (
              <div key={highlight.id} className="flex items-center mb-2">
                <input 
                  type="checkbox" 
                  id={`highlight-${highlight.id}`}
                  checked={selectedHighlights.includes(highlight.id.toString())}
                  onChange={() => toggleHighlightSelection(highlight.id.toString())}
                  className="mr-2"
                />
                <label htmlFor={`highlight-${highlight.id}`}>{highlight.title}</label>
              </div>
            ))
          )}
        </div>
      </div>
      
      <Button onClick={createSession} className="w-full">
        Create Collaboration Session
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Research Collaboration</h2>
        
        {activeSession ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveSession(null)}>
              Create New Session
            </Button>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              Active Session: {activeSession.name}
            </Badge>
          </div>
        ) : (
          <Badge className="bg-blue-100 text-blue-800">Create a new session to collaborate</Badge>
        )}
      </div>
      
      {!activeSession ? (
        renderCreateForm()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Collaborators</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {activeSession.collaborators.map(collaborator => (
                  <div key={collaborator.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{collaborator.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{collaborator.role}</div>
                      </div>
                    </div>
                    <Badge 
                      variant={collaborator.active ? "default" : "outline"}
                      className={collaborator.active ? "bg-green-100 text-green-800" : ""}
                    >
                      {collaborator.active ? "Active" : "Offline"}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Invite Collaborators</label>
                  <div className="flex gap-2">
                    <Input 
                      value={inviteEmail} 
                      onChange={(e) => setInviteEmail(e.target.value)} 
                      placeholder="Email address"
                      className="text-sm"
                    />
                    <Button size="sm" onClick={inviteCollaborator}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Share Session Link</label>
                  <div className="flex gap-2">
                    <Input 
                      value={activeSessionLink}
                      readOnly
                      className="text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={copySessionLink}>
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>{activeSession.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {activeSession.collaborators.length}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" /> {activeSession.sharedNotes.length + activeSession.sharedHighlights.length}
                  </Badge>
                </div>
              </div>
              <Tabs defaultValue="shared" onValueChange={(v) => setMode(v as CollaborationMode)}>
                <TabsList className="mt-2">
                  <TabsTrigger value="shared">Shared Content</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="realtime">Realtime Editing</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="pt-6">
              {mode === 'shared' && (
                <Tabs defaultValue="notes">
                  <TabsList className="mb-4">
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="highlights">Highlights</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="notes">
                    {renderSharedNotes()}
                  </TabsContent>
                  
                  <TabsContent value="highlights">
                    {renderSharedHighlights()}
                  </TabsContent>
                </Tabs>
              )}
              
              {mode === 'chat' && (
                <div className="flex flex-col h-[500px]">
                  {renderChatMessages()}
                  
                  <div className="mt-4 flex gap-2">
                    <Input 
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <Button onClick={sendChatMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {mode === 'realtime' && (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">Realtime Collaboration</h3>
                  <p className="text-gray-500 mt-2 max-w-md">
                    Collaborate in realtime with your team members.
                    This feature would enable multiple users to edit the same document simultaneously.
                  </p>
                  <Badge className="mt-4 bg-yellow-100 text-yellow-800">Coming Soon</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Collaboration;