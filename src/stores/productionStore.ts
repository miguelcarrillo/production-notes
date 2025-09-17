import { Howl } from "howler";
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { db } from "../db";
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
    playingPreviewId: number | null;
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
  clearSearchResults: () => void;
  addSoundToBoard: (sound: FreesoundResult) => void;
  playSoundEffect: (soundId: string) => void;
  stopSoundEffect: (soundId: string) => void;
  removeSoundFromBoard: (soundId: string) => void;
  setSoundEffectVolume: (soundId: string, volume: number) => void;
  playPreviewSound: (sound: FreesoundResult) => void;
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
          playingPreviewId: null,
        },
        localFiles: [],
        isScanningFiles: false,

        // --- ACTIONS ---

        setCurrentProduction: (production) =>
          set({ currentProduction: production }),

        // --- Timeline Actions ---
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
            timeline: { ...state.timeline, isPlaying: false, isPaused: true },
          })),
        stopTimeline: () =>
          set({
            timeline: {
              isPlaying: false,
              isPaused: false,
              currentMomentIndex: 0,
              globalTime: 0,
              currentMomentTime: 0,
            },
          }),
        nextMoment: () =>
          set((state) => {
            if (!state.currentProduction) return {};
            const nextIndex = Math.min(
              state.timeline.currentMomentIndex + 1,
              state.currentProduction.moments.length - 1
            );
            return {
              timeline: {
                ...state.timeline,
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
            if (!state.timeline.isPlaying || !state.timeline.startTime)
              return {};
            const now = new Date();
            const totalElapsed = Math.floor(
              (now.getTime() - state.timeline.startTime.getTime()) / 1000
            );
            return {
              timeline: {
                ...state.timeline,
                globalTime: totalElapsed,
                currentMomentTime: totalElapsed,
              },
            };
          }),

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
                  isPlaying: true,
                  pausedByUser: false,
                },
              });
            }
          } catch (error) {
            console.error("Error loading audio file:", error);
          }
        },
        setAudioPlayingState: (isPlaying, userInitiated) =>
          set((state) => ({
            audioPlayer: {
              ...state.audioPlayer,
              isPlaying: isPlaying,
              pausedByUser: userInitiated
                ? !isPlaying
                : state.audioPlayer.pausedByUser,
            },
          })),

        // --- Soundboard Actions ---
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
            console.error("Freesound API key missing.");
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
            if (!response.ok)
              throw new Error(`API request failed: ${response.statusText}`);
            const data = await response.json();
            const mappedResults: FreesoundResult[] = data.results
              .map((sound: any) => ({
                id: sound.id,
                name: sound.name,
                previews: sound.previews,
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
        clearSearchResults: () =>
          set((state) => ({
            soundboard: { ...state.soundboard, searchResults: [] },
          })),
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
          } catch (error) {
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
            src: [sound.previews["preview-hq-mp3"]],
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
