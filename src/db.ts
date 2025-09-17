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

  constructor() {
    super("productionNotesDB");
    this.version(1).stores({
      soundboard: "id", // Primary key
      fileSystemHandles: "id",
    });
  }
}

export const db = new MySubClassedDexie();
