export interface MediaFile {
  id: string;
  name: string;
  path: string;
  type: "audio" | "video" | "image";
  size: number;
  duration?: number; // in seconds for audio/video
  createdAt: Date;
}

export interface Moment {
  id: string;
  title: string;
  notes: string; // markdown content
  importantNote?: string; // displayed prominently in timeline
  duration?: string; // format: "mm:ss" - optional
  durationSeconds?: number; // duration in seconds for calculations
  media: MediaFile[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Production {
  id: string;
  name: string;
  description?: string;
  moments: Moment[];
  createdAt: Date;
  updatedAt: Date;
  totalEstimatedDuration?: number; // calculated from moments
}

// Timeline and playback state
export interface TimelineState {
  isPlaying: boolean;
  isPaused: boolean;
  currentMomentIndex: number;
  globalTime: number; // total elapsed seconds
  currentMomentTime: number; // elapsed seconds in current moment
  startTime?: Date; // when play was pressed
}

// Audio player state
export interface AudioPlayerState {
  currentFile: MediaFile | null;
  isPlaying: boolean;
  volume: number; // 0-1
  currentTime: number;
  duration: number;
  waveform?: number[]; // for visualization
}

// Soundboard
export interface SoundEffect {
  id: string;
  name: string;
  url: string;
  isPlaying: boolean;
  volume: number;
  freesoundId?: number; // if from Freesound API
}

export interface FreesoundResult {
  id: number;
  name: string;
  previews: {
    "preview-hq-mp3": string;
    "preview-lq-mp3": string;
  };
  duration: number;
  username: string;
}

// App state
export interface AppState {
  currentProduction: Production | null;
  timeline: TimelineState;
  audioPlayer: AudioPlayerState;
  soundboard: {
    sounds: SoundEffect[];
    searchResults: FreesoundResult[];
    isSearching: boolean;
  };
}
