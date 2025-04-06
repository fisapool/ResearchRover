import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { z } from "zod";
import { insertHighlightSchema, insertNoteSchema } from "@shared/schema";
import crypto from 'crypto';

// WebSocket connection store
interface ConnectedClient {
  socket: WebSocket;
  userId?: string;
  sessionId?: string;
}

// PDF Annotation
interface PdfAnnotation {
  id: string;
  type: 'highlight' | 'note' | 'bookmark';
  pageNumber: number;
  content: string;
  position: { x: number; y: number; width?: number; height?: number };
  color: string;
  pdfUrl: string;
  createdAt: Date;
}

// Collaboration types
interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastActive?: Date;
}

interface CollaborationSession {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  members: User[];
  isPrivate: boolean;
  accessCode?: string;
  sharedItems: {
    type: 'note' | 'highlight';
    id: number;
  }[];
}

interface CollaborationMessage {
  id: string;
  userId: string;
  sessionId: string;
  text: string;
  timestamp: Date;
  mentions?: string[];
  attachedItems?: {
    type: 'note' | 'highlight';
    id: number;
  }[];
}

// In-memory stores (in a production app, these would be in the database)
const pdfAnnotations: PdfAnnotation[] = [];
const collaborationSessions: CollaborationSession[] = [];
const collaborationMessages: CollaborationMessage[] = [];
const onlineUsers: Map<string, User> = new Map();

export async function registerRoutes(app: Express): Promise<Server> {
  // Highlights API routes
  app.get("/api/highlights", async (req: Request, res: Response) => {
    try {
      const highlights = await storage.getHighlights();
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      res.status(500).json({ error: "Failed to fetch highlights" });
    }
  });

  app.get("/api/highlights/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const highlight = await storage.getHighlight(id);
      if (!highlight) {
        return res.status(404).json({ error: "Highlight not found" });
      }

      res.json(highlight);
    } catch (error) {
      console.error("Error fetching highlight:", error);
      res.status(500).json({ error: "Failed to fetch highlight" });
    }
  });

  app.post("/api/highlights", async (req: Request, res: Response) => {
    try {
      const validatedData = insertHighlightSchema.parse(req.body);
      const highlight = await storage.createHighlight(validatedData);
      res.status(201).json(highlight);
    } catch (error) {
      console.error("Error creating highlight:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create highlight" });
      }
    }
  });

  app.patch("/api/highlights/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const updatedHighlight = await storage.updateHighlight(id, req.body);
      if (!updatedHighlight) {
        return res.status(404).json({ error: "Highlight not found" });
      }

      res.json(updatedHighlight);
    } catch (error) {
      console.error("Error updating highlight:", error);
      res.status(500).json({ error: "Failed to update highlight" });
    }
  });

  app.delete("/api/highlights/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const result = await storage.deleteHighlight(id);
      if (!result) {
        return res.status(404).json({ error: "Highlight not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting highlight:", error);
      res.status(500).json({ error: "Failed to delete highlight" });
    }
  });

  // Notes API routes
  app.get("/api/notes", async (req: Request, res: Response) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const note = await storage.getNote(id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      res.json(note);
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create note" });
      }
    }
  });

  app.patch("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const updatedNote = await storage.updateNote(id, req.body);
      if (!updatedNote) {
        return res.status(404).json({ error: "Note not found" });
      }

      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const result = await storage.deleteNote(id);
      if (!result) {
        return res.status(404).json({ error: "Note not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize Socket.IO server for collaboration features
  const io = new SocketIOServer(httpServer, {
    path: '/ws',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('New socket connection established:', socket.id);
    
    socket.on('user:join', (user: User) => {
      console.log('User joined:', user.name);
      user.isOnline = true;
      user.lastActive = new Date();
      onlineUsers.set(user.id, user);
      
      // Send the current online users to the client
      io.emit('users:online', Array.from(onlineUsers.values()));
      
      // Send available sessions
      socket.emit('sessions:list', collaborationSessions);
    });
    
    socket.on('session:create', (session: CollaborationSession) => {
      console.log('Session created:', session.name);
      collaborationSessions.push(session);
      
      // Join the creator to the room
      socket.join(session.id);
      
      // Emit the created session to the creator
      socket.emit('session:created', session);
      
      // Broadcast the new session to all connected clients
      io.emit('sessions:list', collaborationSessions);
    });
    
    socket.on('session:join', ({ sessionId, userId, accessCode }: { sessionId: string, userId: string, accessCode?: string }) => {
      const sessionIndex = collaborationSessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }
      
      const session = collaborationSessions[sessionIndex];
      
      // Check if session is private and requires access code
      if (session.isPrivate && session.accessCode !== accessCode) {
        socket.emit('error', { message: 'Invalid access code' });
        return;
      }
      
      // Get user data
      const user = onlineUsers.get(userId);
      
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }
      
      // Check if user is already a member
      if (!session.members.some(m => m.id === userId)) {
        session.members.push(user);
        collaborationSessions[sessionIndex] = session;
      }
      
      // Join the socket to the room
      socket.join(sessionId);
      
      // Get messages for this session
      const sessionMessages = collaborationMessages.filter(m => m.sessionId === sessionId);
      
      // Emit session data and messages to the user
      socket.emit('session:joined', session, sessionMessages);
      
      // Broadcast the updated session to all users
      io.emit('sessions:list', collaborationSessions);
    });
    
    socket.on('session:leave', ({ sessionId, userId }: { sessionId: string, userId: string }) => {
      socket.leave(sessionId);
      
      const sessionIndex = collaborationSessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        const session = collaborationSessions[sessionIndex];
        
        // Remove user from session members
        session.members = session.members.filter(m => m.id !== userId);
        
        // If no members left, remove the session
        if (session.members.length === 0) {
          collaborationSessions.splice(sessionIndex, 1);
        } else {
          collaborationSessions[sessionIndex] = session;
        }
        
        // Broadcast updated sessions list
        io.emit('sessions:list', collaborationSessions);
      }
    });
    
    socket.on('message:send', (message: CollaborationMessage) => {
      // Store the message
      collaborationMessages.push(message);
      
      // Broadcast to all users in the session
      io.to(message.sessionId).emit('message:new', message);
    });
    
    socket.on('session:share-item', ({ sessionId, userId, itemType, itemId }: { sessionId: string, userId: string, itemType: 'note' | 'highlight', itemId: number }) => {
      const sessionIndex = collaborationSessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        const session = collaborationSessions[sessionIndex];
        
        // Check if item already shared
        if (!session.sharedItems.some(item => item.type === itemType && item.id === itemId)) {
          session.sharedItems.push({ type: itemType, id: itemId });
          collaborationSessions[sessionIndex] = session;
          
          // Broadcast to all users in the session
          io.to(sessionId).emit('session:item-shared', session, itemType, itemId);
        }
      }
    });
    
    socket.on('user:update', (user: User) => {
      // Update user details
      if (onlineUsers.has(user.id)) {
        user.isOnline = true;
        user.lastActive = new Date();
        onlineUsers.set(user.id, user);
        
        // Update user in all sessions they're part of
        for (let i = 0; i < collaborationSessions.length; i++) {
          const session = collaborationSessions[i];
          const memberIndex = session.members.findIndex(m => m.id === user.id);
          
          if (memberIndex !== -1) {
            session.members[memberIndex] = user;
            collaborationSessions[i] = session;
          }
        }
        
        // Notify the user
        socket.emit('user:updated', user);
        
        // Broadcast updated users and sessions
        io.emit('users:online', Array.from(onlineUsers.values()));
        io.emit('sessions:list', collaborationSessions);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      
      // Find and update user status
      // Convert Map entries to array for iteration to avoid MapIterator issues
      Array.from(onlineUsers.entries()).forEach(([id, user]) => {
        // In a real app, we'd have a way to associate socket ID with user ID
        // Here, we're just marking all users offline on disconnect for simplicity
        user.isOnline = false;
        user.lastActive = new Date();
        onlineUsers.set(id, user);
      });
      
      // Broadcast updated users list
      io.emit('users:online', Array.from(onlineUsers.values()));
    });
  });
  
  // Initialize WebSocket servers for different functionalities on distinct paths
  const pdfWss = new WebSocketServer({ server: httpServer, path: '/pdf-ws' });
  const collaborationWss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const pdfClients: ConnectedClient[] = [];
  const collaborationClients: ConnectedClient[] = [];
  
  pdfWss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket connection established for PDF annotations');
    
    // Add client to the store
    const client: ConnectedClient = { socket: ws };
    pdfClients.push(client);
    
    // Handle incoming messages
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle different message types
        switch (data.type) {
          case 'init':
            handleInit(client, data);
            break;
          case 'annotation:create':
            handleCreateAnnotation(client, data);
            break;
          case 'annotation:update':
            handleUpdateAnnotation(client, data);
            break;
          case 'annotation:delete':
            handleDeleteAnnotation(client, data);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      const index = pdfClients.findIndex((c: ConnectedClient) => c.socket === ws);
      if (index !== -1) {
        pdfClients.splice(index, 1);
      }
    });
  });
  
  // PDF WebSocket handlers
  function handleInit(client: ConnectedClient, data: any) {
    // Set the user ID and session ID for this client
    client.userId = data.userId;
    
    // If a PDF URL is provided, send any existing annotations for that PDF
    if (data.pdfUrl) {
      const pdfAnnotationsForUrl = pdfAnnotations.filter(a => a.pdfUrl === data.pdfUrl);
      
      client.socket.send(JSON.stringify({
        type: 'annotations:init',
        annotations: pdfAnnotationsForUrl
      }));
    }
  }
  
  function handleCreateAnnotation(client: ConnectedClient, data: any) {
    // Create new annotation
    const annotation: PdfAnnotation = {
      id: data.annotation.id || crypto.randomUUID(),
      type: data.annotation.type,
      pageNumber: data.annotation.pageNumber,
      content: data.annotation.content,
      position: data.annotation.position,
      color: data.annotation.color,
      pdfUrl: data.pdfUrl,
      createdAt: new Date()
    };
    
    // Store the annotation
    pdfAnnotations.push(annotation);
    
    // Broadcast to all clients viewing the same PDF
    broadcastToPdfClients(data.pdfUrl, {
      type: 'annotation:created',
      annotation
    });
  }
  
  function handleUpdateAnnotation(client: ConnectedClient, data: any) {
    const annotationIndex = pdfAnnotations.findIndex(a => a.id === data.annotation.id);
    
    if (annotationIndex !== -1) {
      // Update annotation
      const updatedAnnotation = {
        ...pdfAnnotations[annotationIndex],
        ...data.annotation,
        // Don't change these fields
        id: pdfAnnotations[annotationIndex].id,
        pdfUrl: pdfAnnotations[annotationIndex].pdfUrl,
        createdAt: pdfAnnotations[annotationIndex].createdAt
      };
      
      pdfAnnotations[annotationIndex] = updatedAnnotation;
      
      // Broadcast to all clients viewing the same PDF
      broadcastToPdfClients(updatedAnnotation.pdfUrl, {
        type: 'annotation:updated',
        annotation: updatedAnnotation
      });
    }
  }
  
  function handleDeleteAnnotation(client: ConnectedClient, data: any) {
    const annotationIndex = pdfAnnotations.findIndex(a => a.id === data.annotationId);
    
    if (annotationIndex !== -1) {
      const pdfUrl = pdfAnnotations[annotationIndex].pdfUrl;
      
      // Delete annotation
      pdfAnnotations.splice(annotationIndex, 1);
      
      // Broadcast to all clients viewing the same PDF
      broadcastToPdfClients(pdfUrl, {
        type: 'annotation:deleted',
        annotationId: data.annotationId
      });
    }
  }
  
  // Helper to broadcast messages to all clients viewing a specific PDF
  function broadcastToPdfClients(pdfUrl: string, message: any) {
    // Send to all clients regardless of PDF URL for now
    // In a real app, we would filter by clients viewing this specific PDF
    for (const client of pdfClients) {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify(message));
      }
    }
  }
  
  // REST API for PDF annotations
  app.get("/api/pdf-annotations", async (req: Request, res: Response) => {
    try {
      const pdfUrl = req.query.pdfUrl as string;
      
      if (pdfUrl) {
        const annotations = pdfAnnotations.filter(a => a.pdfUrl === pdfUrl);
        res.json(annotations);
      } else {
        res.json(pdfAnnotations);
      }
    } catch (error) {
      console.error("Error getting PDF annotations:", error);
      res.status(500).json({ error: "Failed to get PDF annotations" });
    }
  });
  
  app.post("/api/pdf-annotations", async (req: Request, res: Response) => {
    try {
      const annotation: PdfAnnotation = {
        id: req.body.id || crypto.randomUUID(),
        type: req.body.type,
        pageNumber: req.body.pageNumber,
        content: req.body.content,
        position: req.body.position,
        color: req.body.color,
        pdfUrl: req.body.pdfUrl,
        createdAt: new Date()
      };
      
      pdfAnnotations.push(annotation);
      res.status(201).json(annotation);
      
      // Also broadcast via WebSocket
      broadcastToPdfClients(annotation.pdfUrl, {
        type: 'annotation:created',
        annotation
      });
    } catch (error) {
      console.error("Error creating PDF annotation:", error);
      res.status(400).json({ error: "Failed to create PDF annotation" });
    }
  });
  
  app.delete("/api/pdf-annotations/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const annotationIndex = pdfAnnotations.findIndex(a => a.id === id);
      
      if (annotationIndex !== -1) {
        const pdfUrl = pdfAnnotations[annotationIndex].pdfUrl;
        
        // Delete annotation
        pdfAnnotations.splice(annotationIndex, 1);
        
        res.status(204).end();
        
        // Also broadcast via WebSocket
        broadcastToPdfClients(pdfUrl, {
          type: 'annotation:deleted',
          annotationId: id
        });
      } else {
        res.status(404).json({ error: "Annotation not found" });
      }
    } catch (error) {
      console.error("Error deleting PDF annotation:", error);
      res.status(500).json({ error: "Failed to delete PDF annotation" });
    }
  });
  
  return httpServer;
}
