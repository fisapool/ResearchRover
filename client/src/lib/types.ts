export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  folderId: string | null;
  links: NoteLink[];
  highlights: Highlight[];
  metadata: NoteMetadata;
}

export interface NoteLink {
  sourceNoteId: string;
  targetNoteId: string;
  linkText: string;
  createdAt: Date;
}

export interface Highlight {
  id: string;
  text: string;
  sourceUrl: string;
  pageNumber?: number;
  color: string;
  noteId: string;
  createdAt: Date;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NoteMetadata {
  sourceUrl?: string;
  author?: string;
  publicationDate?: Date;
  pdfPath?: string;
  pageNumbers?: number[];
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface MindMapNode {
  id: string;
  noteId: string;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected nodes
}

export interface CollaborationSession {
  id: string;
  name: string;
  participants: string[]; // User IDs
  notes: string[]; // Note IDs
  createdAt: Date;
  updatedAt: Date;
} 