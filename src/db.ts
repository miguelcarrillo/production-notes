import Dexie, { type Table } from "dexie";
import type { SoundEffect } from "./types/production";

export interface SoundboardState {
  id: number; // Use a fixed ID (e.g., 0) to store the single state object
  sounds: SoundEffect[];
}

export interface StoredHandle {
  id: string; // e.g., 'directoryHandle'
  handle: FileSystemDirectoryHandle;
}

export class MySubClassedDexie extends Dexie {
  soundboard!: Table<SoundboardState>;
  fileSystemHandles!: Table<StoredHandle>;
  slides!: Table<{
    id: string;
    slides: Array<{ id: string; title: string }>;
  }>;

  constructor() {
    super("productionNotesDB");
    // Add a new 'slides' store to persist presentation slides.
    // Bump DB version so Dexie can create the new store if it doesn't exist.
    this.version(2).stores({
      soundboard: "id", // Primary key
      fileSystemHandles: "id",
      slides: "id",
    });
  }
}

export const db = new MySubClassedDexie();
