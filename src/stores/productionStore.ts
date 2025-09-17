import { create } from "zustand";
import { devtools } from "zustand/middleware";
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
  loadAudioFile: (file: MediaFile) => void;
  playAudio: () => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  toggleLoop: () => void; // + Add toggleLoop action

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
}

// + Create a single audio instance outside the store
const audio = new Audio();

export const useProductionStore = create<ProductionStore>()(
  devtools(
    (set, get) => {
      // + Add event listeners to sync audio element state with the store
      audio.onplay = () =>
        set((state) => ({
          audioPlayer: { ...state.audioPlayer, isPlaying: true },
        }));
      audio.onpause = () =>
        set((state) => ({
          audioPlayer: { ...state.audioPlayer, isPlaying: false },
        }));
      audio.onvolumechange = () =>
        set((state) => ({
          audioPlayer: { ...state.audioPlayer, volume: audio.volume },
        }));
      audio.ontimeupdate = () =>
        set((state) => ({
          audioPlayer: { ...state.audioPlayer, currentTime: audio.currentTime },
        }));
      audio.onloadedmetadata = () =>
        set((state) => ({
          audioPlayer: { ...state.audioPlayer, duration: audio.duration },
        }));
      audio.onended = () => {
        // When the audio finishes, stop it (resets time) unless it's looping
        if (!audio.loop) {
          get().stopAudio();
        }
      };

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
          volume: 1,
          currentTime: 0,
          duration: 0,
          loop: false, // + Add loop state
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

        loadAudioFile: async (file) => {
          const { localFiles } = get();
          // If it's a drag/drop, we might get the path
          const filePath = typeof file === "string" ? file : null;
          const localFile = filePath
            ? localFiles.find((f) => f.path === filePath)
            : file;

          if (localFile?.handle) {
            const fileObject = await localFile.handle.getFile();
            const objectURL = URL.createObjectURL(fileObject);

            // If there was a previous track, revoke its URL to prevent memory leaks
            if (audio.src.startsWith("blob:")) {
              URL.revokeObjectURL(audio.src);
            }
            audio.src = objectURL;

            const mediaFile = await get().loadFileFromHandle(localFile.handle);
            if (mediaFile) {
              set((state) => ({
                audioPlayer: {
                  ...state.audioPlayer,
                  currentFile: { ...mediaFile, handle: localFile.handle },
                  currentTime: 0,
                },
              }));
            }
          }
        },

        playAudio: () => {
          if (get().audioPlayer.currentFile) {
            audio.play().catch((e) => console.error("Error playing audio:", e));
          }
        },

        pauseAudio: () => {
          audio.pause();
        },

        stopAudio: () => {
          audio.pause();
          audio.currentTime = 0;
        },

        setVolume: (volume) => {
          audio.volume = Math.max(0, Math.min(1, volume));
        },

        setCurrentTime: (time) => {
          audio.currentTime = time;
        },

        // + Add action for looping
        toggleLoop: () => {
          const willLoop = !audio.loop;
          audio.loop = willLoop;
          set((state) => ({
            audioPlayer: { ...state.audioPlayer, loop: willLoop },
          }));
        },

        // Soundboard actions
        searchSounds: async (query) => {
          set((state) => ({
            soundboard: {
              ...state.soundboard,
              isSearching: true,
            },
          }));

          try {
            // Mock API call - replace with actual Freesound API
            const mockResults: FreesoundResult[] = [
              {
                id: 12345,
                name: `${query} sound effect 1`,
                previews: {
                  "preview-hq-mp3": `/mock-audio/${query}-1.mp3`,
                  "preview-lq-mp3": `/mock-audio/${query}-1-lq.mp3`,
                },
                duration: 2.5,
                username: "mockuser1",
              },
              {
                id: 12346,
                name: `${query} ambient track`,
                previews: {
                  "preview-hq-mp3": `/mock-audio/${query}-2.mp3`,
                  "preview-lq-mp3": `/mock-audio/${query}-2-lq.mp3`,
                },
                duration: 5.2,
                username: "mockuser2",
              },
              {
                id: 12347,
                name: `Professional ${query} sound`,
                previews: {
                  "preview-hq-mp3": `/mock-audio/${query}-3.mp3`,
                  "preview-lq-mp3": `/mock-audio/${query}-3-lq.mp3`,
                },
                duration: 1.8,
                username: "prosound",
              },
            ];

            set((state) => ({
              soundboard: {
                ...state.soundboard,
                searchResults: mockResults,
                isSearching: false,
              },
            }));
          } catch (error) {
            console.error("Error searching sounds:", error);
            set((state) => ({
              soundboard: {
                ...state.soundboard,
                searchResults: [],
                isSearching: false,
              },
            }));
          }
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
      };
    },
    {
      name: "production-store",
    }
  )
);
