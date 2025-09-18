import type { MediaFile, Moment, Production } from "../types/production";

const mockMediaFiles: MediaFile[] = [
  {
    id: "1",
    name: "ambient-forest.mp3",
    path: "/audio/ambient-forest.mp3",
    type: "audio",
    size: 2450000,
    duration: 180,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "dramatic-music.mp3",
    path: "/audio/dramatic-music.mp3",
    type: "audio",
    size: 3200000,
    duration: 240,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    name: "crowd-applause.mp3",
    path: "/audio/crowd-applause.mp3",
    type: "audio",
    size: 1800000,
    duration: 120,
    createdAt: new Date("2024-01-16"),
  },
  {
    id: "4",
    name: "rain-storm.mp3",
    path: "/audio/rain-storm.mp3",
    type: "audio",
    size: 4100000,
    duration: 300,
    createdAt: new Date("2024-01-16"),
  },
  {
    id: "5",
    name: "bell-chime.mp3",
    path: "/audio/bell-chime.mp3",
    type: "audio",
    size: 450000,
    duration: 15,
    createdAt: new Date("2024-01-17"),
  },
];

const mockMoments: Moment[] = [
  {
    id: "moment-1",
    title: "Improvisadores entran",
    notes: "música de Hollywood.",
    importantNote: "música de Hollywood.",
    media: [], // ambient-forest.mp3
    order: 1,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "moment-2",
    title: "Intro con el público",
    notes: `Cada uno escoje un título sugerido por el público. Tono de “queremos ver todas estas películas!”. Cada uno presenta el título que eligió y por qué quiere ver la película.`,
    importantNote: ``,
    media: [], // dramatic-music.mp3
    order: 2,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "moment-3",
    title: "Trailer 1: Misterio",
    notes: ``,
    importantNote: ``,
    media: [], // crowd-applause.mp3
    order: 3,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "moment-4",
    title: "Trailer 2: Poema",
    notes: ``,
    importantNote: ``,
    media: [], // rain-storm.mp3
    order: 4,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-5",
    title: "Trailer 3: Comedia",
    notes: ``,
    importantNote: ``,
    media: [], // bell-chime.mp3
    order: 5,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-6",
    title: "Trailer 4: Historia de vida",
    notes: ``,
    importantNote: ``,
    media: [], // ambient-forest.mp3
    order: 6,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-7",
    title: "Trailer 5: Ensamble",
    notes: ``,
    importantNote: ``,
    media: [], // dramatic-music.mp3
    order: 7,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-8",
    title: "Público escoge historia",
    notes: "Se pregunta cuál película quieren ver.",
    importantNote: "Se pregunta cuál película quieren ver.",
    media: [], // crowd-applause.mp3
    order: 8,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-9",
    title: "Película entera.",
    notes: "Ver apéndice 4 para la estructura de la historia.",
    importantNote: "Ver apéndice 4 para la estructura de la historia.",
    media: [], // rain-storm.mp3
    order: 9,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
];

export const mockProduction: Production = {
  id: "prod-1",
  name: "Sólo en Cines",
  description: "xxx",
  moments: mockMoments,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-17"),
  totalEstimatedDuration: mockMoments.reduce(
    (total, moment) => total + (moment.durationSeconds || 0),
    0
  ),
};

export const mockSoundEffects = [
  {
    id: "sfx-1",
    name: "Sword Clang",
    url: "/audio/sfx/sword-clang.mp3",
    isPlaying: false,
    volume: 0.8,
  },
  {
    id: "sfx-2",
    name: "Door Creak",
    url: "/audio/sfx/door-creak.mp3",
    isPlaying: false,
    volume: 0.6,
  },
  {
    id: "sfx-3",
    name: "Horse Gallop",
    url: "/audio/sfx/horse-gallop.mp3",
    isPlaying: false,
    volume: 0.7,
  },
  {
    id: "sfx-4",
    name: "Magic Sparkle",
    url: "/audio/sfx/magic-sparkle.mp3",
    isPlaying: false,
    volume: 0.5,
  },
  {
    id: "sfx-5",
    name: "Crowd Gasp",
    url: "/audio/sfx/crowd-gasp.mp3",
    isPlaying: false,
    volume: 0.9,
  },
  {
    id: "sfx-6",
    name: "Wind Howl",
    url: "/audio/sfx/wind-howl.mp3",
    isPlaying: false,
    volume: 0.6,
  },
];

// Utility functions
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const parseDuration = (duration: string): number => {
  const [mins, secs] = duration.split(":").map(Number);
  return mins * 60 + secs;
};
