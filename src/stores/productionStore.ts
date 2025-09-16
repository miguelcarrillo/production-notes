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

  // Soundboard actions
  searchSounds: (query: string) => Promise<void>;
  addSoundToBoard: (sound: FreesoundResult) => void;
  playSoundEffect: (soundId: string) => void;
  stopSoundEffect: (soundId: string) => void;
  removeSoundFromBoard: (soundId: string) => void;
  setSoundEffectVolume: (soundId: string, volume: number) => void;
}

export const useProductionStore = create<ProductionStore>()(
  devtools(
    (set, get) => ({
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
        waveform: undefined,
      },

      soundboard: {
        sounds: mockSoundEffects,
        searchResults: [],
        isSearching: false,
      },

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
          const nextIndex = Math.max(state.timeline.currentMomentIndex - 1, 0);

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

      // Audio player actions
      loadAudioFile: (file) =>
        set((state) => ({
          audioPlayer: {
            ...state.audioPlayer,
            currentFile: file,
            currentTime: 0,
            duration: file.duration || 0,
          },
        })),

      playAudio: () =>
        set((state) => ({
          audioPlayer: {
            ...state.audioPlayer,
            isPlaying: true,
          },
        })),

      pauseAudio: () =>
        set((state) => ({
          audioPlayer: {
            ...state.audioPlayer,
            isPlaying: false,
          },
        })),

      stopAudio: () =>
        set((state) => ({
          audioPlayer: {
            ...state.audioPlayer,
            isPlaying: false,
            currentTime: 0,
          },
        })),

      setVolume: (volume) =>
        set((state) => ({
          audioPlayer: {
            ...state.audioPlayer,
            volume: Math.max(0, Math.min(1, volume)),
          },
        })),

      setCurrentTime: (time) =>
        set((state) => ({
          audioPlayer: {
            ...state.audioPlayer,
            currentTime: time,
          },
        })),

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
    }),
    {
      name: "production-store",
    }
  )
);
