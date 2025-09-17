import Dexie, { type Table } from "dexie";
import type { SoundEffect } from "./types/production";

export interface SoundboardState {
  id: number; // Use a fixed ID (e.g., 0) to store the single state object
  sounds: SoundEffect[];
}

export class MySubClassedDexie extends Dexie {
  soundboard!: Table<SoundboardState>;

  constructor() {
    super("productionNotesDB");
    this.version(1).stores({
      soundboard: "id", // Primary key
    });
  }
}

export const db = new MySubClassedDexie();
