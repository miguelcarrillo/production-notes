import type { Moment, Production, SoundEffect } from "../types/production";

const mockMoments: Moment[] = [
  {
    id: "moment-1",
    title: "Tráiler 1 - Blockbuster (3’)",
    notes: "",
    media: [],
    order: 1,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "moment-2",
    title: "Tráiler 2 - Misterio (3’)",
    notes: `Cada uno escoje un título sugerido por el público. Tono de “queremos ver todas estas películas!”. Cada uno presenta el título que eligió y por qué quiere ver la película.`,
    importantNote: ``,
    media: [], 
    order: 2,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "moment-3",
    title: "Tráiler 3 - Auge y Caída (3’)",
    notes: ``,
    importantNote: ``,
    media: [], // crowd-applause.mp3
    order: 3,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "moment-4",
    title: "Tráiler 4 - Comedia (3')",
    notes: ``,
    importantNote: ``,
    media: [], // rain-storm.mp3
    order: 4,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-5",
    title: "Intro con el público (2’)",
    notes: ``,
    importantNote: ``,
    media: [], // bell-chime.mp3
    order: 5,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-6",
    title: "Peli completa (15’)",
    notes: ``,
    importantNote: ``,
    media: [], // ambient-forest.mp3
    order: 6,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-7",
    title: "Entrevista con los actores (3’)",
    notes: ``,
    importantNote: ``,
    media: [], // dramatic-music.mp3
    order: 7,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-8",
    title: "Tráiler Adicional 1 (3’)",
    notes: "",
    importantNote: "",
    media: [], // crowd-applause.mp3
    order: 8,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-9",
    title: "Vuelta a la entrevista (2’)",
    notes: "",
    importantNote: "",
    media: [], // rain-storm.mp3
    order: 9,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-10",
    title: "Tráiler adicional 2 (3')",
    notes: "",
    importantNote: "",
    media: [], // rain-storm.mp3
    order: 10,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
    {
    id: "moment-11",
    title: "Escena Final (2')",
    notes: "",
    importantNote: "",
    media: [], // rain-storm.mp3
    order: 10,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },  
  {
    id: "moment-12",
    title: "Créditos",
    notes: "",
    importantNote: "",
    media: [], // rain-storm.mp3
    order: 10,
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

/**
 * Default soundboard: CC0 sounds from Freesound (found through Openverse),
 * streamed from Freesound's CDN so the demo works without local files.
 */
export const mockSoundEffects: SoundEffect[] = [
  {
    id: "sfx-1",
    name: "Sword Clang",
    url: "https://cdn.freesound.org/previews/439/439508_3928631-hq.mp3",
    isPlaying: false,
    volume: 0.8,
    creator: "ethanchase7744",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl: "https://freesound.org/people/ethanchase7744/sounds/439508",
  },
  {
    id: "sfx-2",
    name: "Door Creak",
    url: "https://cdn.freesound.org/previews/219/219492_4056007-hq.mp3",
    isPlaying: false,
    volume: 0.6,
    creator: "JarredGibb",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl: "https://freesound.org/people/JarredGibb/sounds/219492",
  },
  {
    id: "sfx-3",
    name: "Horse Gallop",
    url: "https://cdn.freesound.org/previews/197/197212_3001728-hq.mp3",
    isPlaying: false,
    volume: 0.7,
    creator: "HebronTheatre",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl: "https://freesound.org/people/HebronTheatre/sounds/197212",
  },
  {
    id: "sfx-4",
    name: "Magic Sparkle",
    url: "https://cdn.freesound.org/previews/351/351408_4067257-hq.mp3",
    isPlaying: false,
    volume: 0.5,
    creator: "newagesoup",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl: "https://freesound.org/people/newagesoup/sounds/351408",
  },
  {
    id: "sfx-5",
    name: "Crowd Gasp",
    url: "https://cdn.freesound.org/previews/207/207779_2046066-hq.mp3",
    isPlaying: false,
    volume: 0.9,
    creator: "Dvideoguy",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl: "https://freesound.org/people/Dvideoguy/sounds/207779",
  },
  {
    id: "sfx-6",
    name: "Wind Howl",
    url: "https://cdn.freesound.org/previews/331/331527_2417207-hq.mp3",
    isPlaying: false,
    volume: 0.6,
    creator: "DAVESTALKER",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl: "https://freesound.org/people/DAVESTALKER/sounds/331527",
  },
];
