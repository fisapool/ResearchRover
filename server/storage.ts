import { 
  users, type User, type InsertUser,
  highlights, type Highlight, type InsertHighlight,
  notes, type Note, type InsertNote 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface with required CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Highlight methods
  getHighlights(): Promise<Highlight[]>;
  getHighlight(id: number): Promise<Highlight | undefined>;
  createHighlight(highlight: InsertHighlight): Promise<Highlight>;
  updateHighlight(id: number, data: Partial<Highlight>): Promise<Highlight | undefined>;
  deleteHighlight(id: number): Promise<boolean>;
  
  // Note methods
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, data: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Highlight methods
  async getHighlights(): Promise<Highlight[]> {
    return await db.select().from(highlights);
  }

  async getHighlight(id: number): Promise<Highlight | undefined> {
    const [highlight] = await db.select().from(highlights).where(eq(highlights.id, id));
    return highlight || undefined;
  }

  async createHighlight(insertHighlight: InsertHighlight): Promise<Highlight> {
    const [highlight] = await db
      .insert(highlights)
      .values(insertHighlight)
      .returning();
    return highlight;
  }

  async updateHighlight(id: number, data: Partial<Highlight>): Promise<Highlight | undefined> {
    const [updatedHighlight] = await db
      .update(highlights)
      .set(data)
      .where(eq(highlights.id, id))
      .returning();
    return updatedHighlight || undefined;
  }

  async deleteHighlight(id: number): Promise<boolean> {
    await db
      .delete(highlights)
      .where(eq(highlights.id, id));
    return true;
  }

  // Note methods
  async getNotes(): Promise<Note[]> {
    return await db.select().from(notes);
  }

  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note || undefined;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values(insertNote)
      .returning();
    return note;
  }

  async updateNote(id: number, data: Partial<Note>): Promise<Note | undefined> {
    const [updatedNote] = await db
      .update(notes)
      .set(data)
      .where(eq(notes.id, id))
      .returning();
    return updatedNote || undefined;
  }

  async deleteNote(id: number): Promise<boolean> {
    await db
      .delete(notes)
      .where(eq(notes.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
