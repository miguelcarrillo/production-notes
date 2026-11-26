import { Howl } from "howler";
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { db } from "../db";
import { searchSounds as searchOpenverse } from "../services/openverse";
import type {
  AudioPlayerState,
  MediaFile,
  Production,
  SoundEffect,
  SoundSearchResult,
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
    searchResults: SoundSearchResult[];
    isSearching: boolean;
    searchError: string | null;
    playingPreviewId: string | null;
    /** Query, page and total pages of the last search, for pagination. */
    lastQuery: string | null;
    page: number;
    pageCount: number;
  };

  localFiles: LocalFile[];
  isScanningFiles: boolean;

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
  loadAudioFile: (file: Partial<MediaFile>) => Promise<void>;
  setAudioPlayingState: (isPlaying: boolean, userInitiated: boolean) => void;

  // Soundboard actions
  searchSounds: (query: string) => Promise<void>;
  loadSearchPage: (query: string, page: number) => Promise<void>;
  clearSearchResults: () => void;
  addSoundToBoard: (sound: SoundSearchResult) => void;
  playSoundEffect: (soundId: string) => void;
  stopSoundEffect: (soundId: string) => void;
  removeSoundFromBoard: (soundId: string) => void;
  setSoundEffectVolume: (soundId: string, volume: number) => void;
  playPreviewSound: (sound: SoundSearchResult) => void;
  stopPreviewSound: () => void;

  // File system actions
  loadDirectory: () => Promise<void>;
  rehydrateDirectoryHandle: () => Promise<void>;
  scanDirectory: (
    handle: FileSystemDirectoryHandle,
    path: string,
    files: LocalFile[]
  ) => Promise<void>;
  loadFileFromHandle: (
    fileHandle: FileSystemFileHandle
  ) => Promise<MediaFile | null>;

  hydrateSoundboard: () => Promise<void>;

  // New action to fetch the next page of search results
  fetchNextPage: () => Promise<void>;
}

// --- Audio Engine Setup ---

// Cache for soundboard sounds
const soundCache = new Map<string, Howl>();
// Dedicated player for previews
let previewHowl: Howl | null = null;
// Variable for the main audio player's Blob URL
let currentObjectUrl: string | null = null;

export const useProductionStore = create<ProductionStore>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // --- INITIAL STATE ---
        currentProduction: mockProduction,
        timeline: {
          isPlaying: false,
          isPaused: false,
          currentMomentIndex: 0,
          globalTime: 0,
          currentMomentTime: 0,
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
          searchError: null,
          playingPreviewId: null,
          lastQuery: null,
          page: 0,
          pageCount: 0,
        },
        localFiles: [],
        isScanningFiles: false,

        // --- ACTIONS ---

        setCurrentProduction: (production) =>
          set({ currentProduction: production }),

        // --- Timeline Actions ---
        startTimeline: () => {
          set((state) => {
            // If the global timer hasn't started yet, start it now.
            // It will not be reset until stopTimeline is called.
            const newGlobalStartTime =
              state.timeline.globalStartTime || Date.now();

            return {
              timeline: {
                ...state.timeline,
                isPlaying: true,
                isPaused: false,
                globalStartTime: newGlobalStartTime,
              },
            };
          });
        },

        pauseTimeline: () => {
          // Pause only affects the moment timer, not the global one.

          set((state) => ({
            timeline: {
              ...state.timeline,
              isPlaying: false,
              isPaused: true,
            },
          }));
        },

        stopTimeline: () => {
          // This is a full reset of everything.
          set({
            timeline: {
              isPlaying: false,
              isPaused: false,
              currentMomentIndex: 0,
              globalTime: 0,
              currentMomentTime: 0,
              globalStartTime: undefined, // Clear the global start time
            },
          });
        },

        nextMoment: () => {
          set((state) => {
            if (!state.currentProduction) return {};

            // Prevent going past the end of the moments list
            const nextIndex = Math.min(
              state.timeline.currentMomentIndex + 1,
              state.currentProduction.moments.length - 1
            );

            // If we are already at the last moment, do nothing.
            if (nextIndex === state.timeline.currentMomentIndex) {
              return {};
            }

            return {
              timeline: {
                ...state.timeline,
                currentMomentIndex: nextIndex,
                currentMomentTime: 0, // Reset moment timer for the new moment
              },
            };
          });
        },

        // This action is largely the same as nextMoment, but for clarity
        goToMoment: (momentIndex) => {
          set((state) => ({
            timeline: {
              ...state.timeline,
              currentMomentIndex: momentIndex,
              currentMomentTime: 0, // Always reset moment timer on a manual jump
            },
          }));
        },

        // This is the core "heartbeat" of the timer system
        updateTimelineTime: () => {
          const { currentProduction } = get();
          if (!currentProduction) return;

          set((state) => {
            const { timeline } = state;
            let {
              globalTime,
              currentMomentTime,
              currentMomentIndex,
              isPlaying,
            } = timeline;

            // 1. Update Global Timer (always runs if started)
            if (timeline.globalStartTime) {
              globalTime = Math.floor(
                (Date.now() - timeline.globalStartTime) / 1000
              );
            }

            // 2. Update Moment Timer (only if playing)
            if (isPlaying) {
              currentMomentTime += 1;

              const currentMoment =
                currentProduction.moments[currentMomentIndex];
              const momentDuration = currentMoment?.durationSeconds || 0;

              // 3. Check for Auto-Advance to next moment
              if (momentDuration > 0 && currentMomentTime >= momentDuration) {
                const isLastMoment =
                  currentMomentIndex >= currentProduction.moments.length - 1;

                if (isLastMoment) {
                  // If it's the last moment, just pause the timer at the end.
                  isPlaying = false;
                  currentMomentTime = momentDuration; // Clamp to the duration
                } else {
                  // Advance to the next moment
                  currentMomentIndex += 1;
                  currentMomentTime = 0; // Reset for the new moment
                }
              }
            }

            // Return the updated state
            return {
              timeline: {
                ...timeline,
                globalTime,
                currentMomentTime,
                currentMomentIndex,
                isPlaying,
              },
            };
          });
        },

        // --- Audio Player Actions ---
        loadAudioFile: async (file) => {
          if (!file.handle) return;
          if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);

          try {
            const mediaFile = await get().loadFileFromHandle(
              file.handle as FileSystemFileHandle
            );
            if (mediaFile) {
              const fileObject = await (
                file.handle as FileSystemFileHandle
              ).getFile();
              currentObjectUrl = URL.createObjectURL(fileObject);
              set({
                audioPlayer: {
                  currentFile: {
                    ...mediaFile,
                    handle: file.handle,
                    src: currentObjectUrl,
                  } as MediaFile,
                  // Do not auto-play on load; the player manages play locally
                  isPlaying: false,
                  pausedByUser: false,
                },
              });
            }
          } catch (error) {
            console.error("Error loading audio file:", error);
          }
        },
        setAudioPlayingState: (isPlaying, userInitiated) => {

          return set((state) => ({
            audioPlayer: {
              ...state.audioPlayer,
              isPlaying: isPlaying,
              pausedByUser: userInitiated
                ? !isPlaying
                : state.audioPlayer.pausedByUser,
            },
          }));
        },

        // --- Soundboard Actions ---
        searchSounds: (query) => get().loadSearchPage(query, 1),

        loadSearchPage: async (query, page) => {
          set((state) => ({
            soundboard: {
              ...state.soundboard,
              isSearching: true,
              searchError: null,
            },
          }));
          try {
            const result = await searchOpenverse(query, page);
            set((state) => ({
              soundboard: {
                ...state.soundboard,
                searchResults: result.results,
                isSearching: false,
                lastQuery: query,
                page: result.page,
                pageCount: result.pageCount,
              },
            }));
          } catch (error) {
            console.error("Error searching sounds:", error);
            set((state) => ({
              soundboard: {
                ...state.soundboard,
                isSearching: false,
                searchError:
                  error instanceof Error
                    ? error.message
                    : "Sound search failed.",
              },
            }));
          }
        },

        clearSearchResults: () =>
          set((state) => ({
            soundboard: {
              ...state.soundboard,
              searchResults: [],
              searchError: null,
              lastQuery: null,
              page: 0,
              pageCount: 0,
            },
          })),

        fetchNextPage: async () => {
          const { lastQuery, page, pageCount } = get().soundboard;
          if (!lastQuery || page >= pageCount) return;
          await get().loadSearchPage(lastQuery, page + 1);
        },

        addSoundToBoard: (sound) =>
          set((state) => {
            const newSoundEffect: SoundEffect = {
              id: `sfx-${sound.id}`,
              name: sound.name,
              url: sound.previewUrl,
              isPlaying: false,
              volume: 0.7,
              creator: sound.creator,
              license: sound.license,
              licenseUrl: sound.licenseUrl,
              sourceUrl: sound.sourceUrl,
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
        playSoundEffect: (soundId) => {
          // Stop any active preview first
          get().stopPreviewSound();

          const sound = get().soundboard.sounds.find((s) => s.id === soundId);
          if (!sound) return;

          // Stop any other soundboard sound that might be playing
          soundCache.forEach((howl, id) => {
            if (id !== soundId) howl.stop();
          });

          let howl = soundCache.get(soundId);

          if (!howl) {
            howl = new Howl({
              src: [sound.url],
              volume: sound.volume,
              html5: true,
              onend: () => {
                get().stopSoundEffect(soundId);
              },
            });
            soundCache.set(soundId, howl);
          }

          howl.volume(sound.volume);
          howl.play();

          // Update state to show this sound is playing and others are not
          set((state) => ({
            soundboard: {
              ...state.soundboard,
              sounds: state.soundboard.sounds.map((s) =>
                s.id === soundId
                  ? { ...s, isPlaying: true }
                  : { ...s, isPlaying: false }
              ),
            },
          }));
        },

        stopSoundEffect: (soundId) => {
          const howl = soundCache.get(soundId);
          howl?.stop();

          set((state) => ({
            soundboard: {
              ...state.soundboard,
              sounds: state.soundboard.sounds.map((s) =>
                s.id === soundId ? { ...s, isPlaying: false } : s
              ),
            },
          }));
        },

        removeSoundFromBoard: (soundId) => {
          const howl = soundCache.get(soundId);
          if (howl) {
            howl.unload();
            soundCache.delete(soundId);
          }

          set((state) => ({
            soundboard: {
              ...state.soundboard,
              sounds: state.soundboard.sounds.filter((s) => s.id !== soundId),
            },
          }));
        },

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

        // --- File System Actions ---
        scanDirectory: async (handle, path, files) => {
          for await (const entry of handle.values()) {
            const currentPath = `${path}/${entry.name}`;
            if (
              entry.kind === "file" &&
              (entry.name.endsWith(".mp3") || entry.name.endsWith(".wav"))
            ) {
              files.push({
                handle: entry as FileSystemFileHandle,
                name: entry.name,
                path: currentPath,
              });
            } else if (entry.kind === "directory") {
              await get().scanDirectory(
                entry as FileSystemDirectoryHandle,
                currentPath,
                files
              );
            }
          }
        },
        loadDirectory: async () => {
          try {
            set({ isScanningFiles: true, localFiles: [] });
            const dirHandle = await window.showDirectoryPicker();
            await db.fileSystemHandles.put({
              id: "directory",
              handle: dirHandle,
            });

            const files: LocalFile[] = [];
            await get().scanDirectory(dirHandle, dirHandle.name, files);

            files.sort((a, b) => a.name.localeCompare(b.name));
            set({ localFiles: files, isScanningFiles: false });
          } catch (error) {
            if ((error as Error).name !== "AbortError") {
              console.error("Error loading directory:", error);
            }
            set({ isScanningFiles: false });
          }
        },
        rehydrateDirectoryHandle: async () => {
          const stored = await db.fileSystemHandles.get("directory");
          if (stored?.handle) {
            const permission = await stored.handle.queryPermission({
              mode: "read",
            });
            if (permission === "granted") {
              set({ isScanningFiles: true, localFiles: [] });
              const files: LocalFile[] = [];
              await get().scanDirectory(
                stored.handle,
                stored.handle.name,
                files
              );

              files.sort((a, b) => a.name.localeCompare(b.name));
              set({ localFiles: files, isScanningFiles: false });
            } else {
              await db.fileSystemHandles.clear();
            }
          }
        },
        loadFileFromHandle: async (fileHandle) => {
          try {
            const file = await fileHandle.getFile();
            const audio = new Audio(URL.createObjectURL(file));
            return new Promise((resolve) => {
              audio.onloadedmetadata = () => {
                const mediaFile: MediaFile = {
                  id: fileHandle.name,
                  name: file.name,
                  path: fileHandle.name,
                  type: "audio",
                  size: file.size,
                  duration: audio.duration,
                  createdAt: new Date(file.lastModified),
                };
                URL.revokeObjectURL(audio.src);
                resolve(mediaFile);
              };
              audio.onerror = () => {
                resolve(null);
              };
            });
          } catch {
            return null;
          }
        },
        hydrateSoundboard: async () => {
          const savedState = await db.soundboard.get(0);
          if (savedState) {
            set((state) => ({
              soundboard: { ...state.soundboard, sounds: savedState.sounds },
            }));
          }
        },
        playPreviewSound: (sound) => {
          // Stop any currently playing audio (board sounds and previous preview)
          get().stopPreviewSound();
          soundCache.forEach((howl) => howl.stop());
          set((state) => ({
            soundboard: {
              ...state.soundboard,
              sounds: state.soundboard.sounds.map((s) => ({
                ...s,
                isPlaying: false,
              })),
            },
          }));

          previewHowl = new Howl({
            src: [sound.previewUrl],
            html5: true,
            onend: () => {
              get().stopPreviewSound();
            },
          });
          previewHowl.play();

          set((state) => ({
            soundboard: {
              ...state.soundboard,
              playingPreviewId: sound.id,
            },
          }));
        },

        stopPreviewSound: () => {
          if (previewHowl) {
            previewHowl.stop();
            previewHowl.unload();
            previewHowl = null;
          }
          set((state) => ({
            soundboard: {
              ...state.soundboard,
              playingPreviewId: null,
            },
          }));
        },
      }),
      { name: "production-store" }
    )
  )
);

useProductionStore.subscribe(
  (state) => state.soundboard.sounds,
  (sounds) => {
    db.soundboard.put({ id: 0, sounds: sounds });
  },
  { fireImmediately: false }
);
