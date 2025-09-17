import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware"; // + Import subscribeWithSelector
import { db } from "../db"; // + Import our db instance
import type {
  AudioPlayerState,
  FreesoundResult,
  MediaFile,
  Production,
  SoundEffect,
  TimelineState,
} from "../types/production";
import { mockProduction, mockSoundEffects } from "../utils/mockData";

export interface LocalFile {
  handle: FileSystemFileHandle;
  name: string;
  path: string;
}

interface ProductionStore {
  // Current production
  currentProduction: Production | null;

  // Timeline state
  timeline: TimelineState;

  // Audio player state
  audioPlayer: AudioPlayerState;

  // Soundboard state
  soundboard: {
    sounds: SoundEffect[];
    searchResults: FreesoundResult[];
    isSearching: boolean;
  };

  // + Add state for the local file browser
  localFiles: LocalFile[];
  isScanningFiles: boolean;

  // Actions for production management
  setCurrentProduction: (production: Production) => void;

  // Timeline actions
  startTimeline: () => void;
  pauseTimeline: () => void;
  stopTimeline: () => void;
  nextMoment: () => void;
  previousMoment: () => void;
  goToMoment: (momentIndex: number) => void;
  updateTimelineTime: () => void;

  // Audio player actions
  loadAudioFile: (file: Partial<MediaFile>) => void; // Can accept a partial file now

  // Soundboard actions
  searchSounds: (query: string) => Promise<void>;
  addSoundToBoard: (sound: FreesoundResult) => void;
  playSoundEffect: (soundId: string) => void;
  stopSoundEffect: (soundId: string) => void;
  removeSoundFromBoard: (soundId: string) => void;
  setSoundEffectVolume: (soundId: string, volume: number) => void;

  // + Add actions for file system access
  loadDirectory: () => Promise<void>;
  loadFileFromHandle: (
    fileHandle: FileSystemFileHandle
  ) => Promise<MediaFile | null>;

  // + Add hydrate action to interface
  hydrateSoundboard: () => Promise<void>;

  // + Add clearSearchResults to the interface
  clearSearchResults: () => void;
}

// A variable to keep track of the last created Blob URL so we can revoke it.
let currentObjectUrl: string | null = null;

// + Wrap the devtools middleware with subscribeWithSelector
export const useProductionStore = create<ProductionStore>()(
  subscribeWithSelector(
    devtools(
      (set, get) => {
        return {
          // Initial state
          currentProduction: mockProduction,

          timeline: {
            isPlaying: false,
            isPaused: false,
            currentMomentIndex: 0,
            globalTime: 0,
            currentMomentTime: 0,
            startTime: undefined,
          },

          audioPlayer: {
            currentFile: null,
            isPlaying: false,
            pausedByUser: false,
          },

          soundboard: {
            sounds: mockSoundEffects,
            searchResults: [],
            isSearching: false,
          },

          localFiles: [],
          isScanningFiles: false,

          // Production actions
          setCurrentProduction: (production) =>
            set({ currentProduction: production }),

          // Timeline actions
          startTimeline: () =>
            set((state) => ({
              timeline: {
                ...state.timeline,
                isPlaying: true,
                isPaused: false,
                startTime: new Date(),
              },
            })),

          pauseTimeline: () =>
            set((state) => ({
              timeline: {
                ...state.timeline,
                isPlaying: false,
                isPaused: true,
              },
            })),

          stopTimeline: () =>
            set((state) => ({
              timeline: {
                ...state.timeline,
                isPlaying: false,
                isPaused: false,
                globalTime: 0,
                currentMomentTime: 0,
                currentMomentIndex: 0,
                startTime: undefined,
              },
            })),

          nextMoment: () =>
            set((state) => {
              const { currentProduction, timeline } = state;
              if (!currentProduction) return {};

              const nextIndex = Math.min(
                timeline.currentMomentIndex + 1,
                currentProduction.moments.length - 1
              );

              return {
                timeline: {
                  ...timeline,
                  currentMomentIndex: nextIndex,
                  currentMomentTime: 0,
                },
              };
            }),

          previousMoment: () =>
            set((state) => {
              const nextIndex = Math.max(
                state.timeline.currentMomentIndex - 1,
                0
              );

              return {
                timeline: {
                  ...state.timeline,
                  currentMomentIndex: nextIndex,
                  currentMomentTime: 0,
                },
              };
            }),

          goToMoment: (momentIndex) =>
            set((state) => ({
              timeline: {
                ...state.timeline,
                currentMomentIndex: momentIndex,
                currentMomentTime: 0,
              },
            })),

          updateTimelineTime: () =>
            set((state) => {
              const { timeline } = state;
              if (!timeline.isPlaying || !timeline.startTime) return {};

              const now = new Date();
              const totalElapsed = Math.floor(
                (now.getTime() - timeline.startTime.getTime()) / 1000
              );

              return {
                timeline: {
                  ...timeline,
                  globalTime: totalElapsed,
                  currentMomentTime: totalElapsed, // Simplified - in real version, calculate per moment
                },
              };
            }),

          // --- REWRITE AUDIO ACTIONS ---

          // --- REWRITE the loadAudioFile action ---
          loadAudioFile: (file) => {
            if (!file.handle) return;

            // Revoke the previous Blob URL to prevent memory leaks
            if (currentObjectUrl) {
              URL.revokeObjectURL(currentObjectUrl);
            }

            get()
              .loadFileFromHandle(file.handle as FileSystemFileHandle)
              .then(async (mediaFile) => {
                if (mediaFile) {
                  const fileObject = await (
                    file.handle as FileSystemFileHandle
                  ).getFile();
                  currentObjectUrl = URL.createObjectURL(fileObject); // Create the URL here

                  set({
                    audioPlayer: {
                      currentFile: {
                        ...mediaFile,
                        handle: file.handle,
                        src: currentObjectUrl, // <-- The URL is now part of the state
                      } as MediaFile,
                      isPlaying: false,
                      pausedByUser: false,
                    },
                  });
                }
              })
              .catch((error) => {
                console.error("Error loading audio file:", error);
              });
          },

          // Soundboard actions
          searchSounds: async (query) => {
            set((state) => ({
              soundboard: {
                ...state.soundboard,
                isSearching: true,
                searchResults: [],
              },
            }));

            const apiKey = import.meta.env.VITE_FREESOUND_API_KEY;

            if (!apiKey) {
              console.error(
                "Freesound API key is missing. Please check your .env.local file."
              );
              set((state) => ({
                soundboard: { ...state.soundboard, isSearching: false },
              }));
              return;
            }

            const url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(
              query
            )}&page_size=10&fields=id,name,previews,duration,username&token=${apiKey}`;

            try {
              const response = await fetch(url);
              if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
              }
              const data = await response.json();

              // Map the results to our FreesoundResult type
              const mappedResults: FreesoundResult[] = data.results
                .map((sound: any) => ({
                  id: sound.id,
                  name: sound.name,
                  previews: sound.previews, // The API returns the object we need
                  duration: sound.duration,
                  username: sound.username,
                }))
                .filter(
                  (sound: FreesoundResult) =>
                    sound.previews && sound.previews["preview-hq-mp3"]
                );

              set((state) => ({
                soundboard: {
                  ...state.soundboard,
                  searchResults: mappedResults,
                  isSearching: false,
                },
              }));
            } catch (error) {
              console.error("Error searching Freesound:", error);
              set((state) => ({
                soundboard: {
                  ...state.soundboard,
                  searchResults: [],
                  isSearching: false,
                },
              }));
            }
          },

          clearSearchResults: () => {
            set((state) => ({
              soundboard: {
                ...state.soundboard,
                searchResults: [],
              },
            }));
          },

          addSoundToBoard: (sound) =>
            set((state) => {
              const newSoundEffect: SoundEffect = {
                id: `sfx-${sound.id}`,
                name: sound.name,
                url: sound.previews["preview-hq-mp3"],
                isPlaying: false,
                volume: 0.7,
                freesoundId: sound.id,
              };

              return {
                soundboard: {
                  ...state.soundboard,
                  sounds: [...state.soundboard.sounds, newSoundEffect],
                  searchResults: state.soundboard.searchResults.filter(
                    (r) => r.id !== sound.id
                  ),
                },
              };
            }),

          playSoundEffect: (soundId) =>
            set((state) => ({
              soundboard: {
                ...state.soundboard,
                sounds: state.soundboard.sounds.map((sound) =>
                  sound.id === soundId ? { ...sound, isPlaying: true } : sound
                ),
              },
            })),

          stopSoundEffect: (soundId) =>
            set((state) => ({
              soundboard: {
                ...state.soundboard,
                sounds: state.soundboard.sounds.map((sound) =>
                  sound.id === soundId ? { ...sound, isPlaying: false } : sound
                ),
              },
            })),

          removeSoundFromBoard: (soundId) =>
            set((state) => ({
              soundboard: {
                ...state.soundboard,
                sounds: state.soundboard.sounds.filter(
                  (sound) => sound.id !== soundId
                ),
              },
            })),

          setSoundEffectVolume: (soundId, volume) =>
            set((state) => ({
              soundboard: {
                ...state.soundboard,
                sounds: state.soundboard.sounds.map((sound) =>
                  sound.id === soundId
                    ? { ...sound, volume: Math.max(0, Math.min(1, volume)) }
                    : sound
                ),
              },
            })),

          // + Add the new actions
          loadDirectory: async () => {
            try {
              set({ isScanningFiles: true, localFiles: [] });
              const dirHandle = await window.showDirectoryPicker();
              const files: LocalFile[] = [];

              async function scanDirectory(
                handle: FileSystemDirectoryHandle,
                path: string
              ) {
                for await (const entry of handle.values()) {
                  const currentPath = `${path}/${entry.name}`;
                  if (
                    entry.kind === "file" &&
                    (entry.name.endsWith(".mp3") || entry.name.endsWith(".wav"))
                  ) {
                    files.push({
                      handle: entry,
                      name: entry.name,
                      path: currentPath,
                    });
                  } else if (entry.kind === "directory") {
                    await scanDirectory(entry, currentPath);
                  }
                }
              }

              await scanDirectory(dirHandle, dirHandle.name);
              set({ localFiles: files, isScanningFiles: false });
            } catch (error) {
              console.error("Error loading directory:", error);
              set({ isScanningFiles: false });
            }
          },

          loadFileFromHandle: async (fileHandle) => {
            try {
              const file = await fileHandle.getFile();
              const audio = new Audio(URL.createObjectURL(file));

              return new Promise((resolve) => {
                audio.onloadedmetadata = () => {
                  const mediaFile: MediaFile = {
                    id: fileHandle.name, // Use name as a unique ID for this session
                    name: file.name,
                    path: fileHandle.name,
                    type: "audio",
                    size: file.size,
                    duration: audio.duration,
                    createdAt: new Date(file.lastModified),
                  };
                  URL.revokeObjectURL(audio.src); // Clean up
                  resolve(mediaFile);
                };
                audio.onerror = () => {
                  console.error("Error loading audio metadata for", file.name);
                  resolve(null);
                };
              });
            } catch (error) {
              console.error("Error creating MediaFile from handle:", error);
              return null;
            }
          },

          // + Add the new hydration action
          hydrateSoundboard: async () => {
            const savedState = await db.soundboard.get(0);
            if (savedState) {
              console.log("Hydrating soundboard from IndexedDB...");
              set((state) => ({
                soundboard: {
                  ...state.soundboard,
                  sounds: savedState.sounds,
                },
              }));
            }
          },

          // UI components should control playback directly. If you want to update store state from UI events, add simple setters here.
        };
      },
      { name: "production-store" }
    )
  )
);

// + Add the subscription logic outside the create call
useProductionStore.subscribe(
  (state) => state.soundboard.sounds,
  (sounds) => {
    console.log("Persisting soundboard to IndexedDB...");
    db.soundboard.put({ id: 0, sounds: sounds });
  },
  { fireImmediately: false } // Avoids saving the initial empty/mock state on load
);
