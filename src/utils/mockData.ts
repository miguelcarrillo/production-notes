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
    title: "Opening Scene",
    notes: `# Opening Scene

## Setup
- Stage lights: **dim blue**  
- Sound: ambient forest background
- Props: ancient tree backdrop

## Action Points
1. Narrator enters from stage left
2. Begin with the forest ambience at **60% volume**
3. Wait for audience to settle (approx 30 seconds)
4. Narrator begins: "In the beginning..."

## Technical Notes
- Check wireless mic battery before start
- Forest ambience should fade in gradually
- Lighting cue: #001 (preset saved)

## Timing
This moment should last approximately 3 minutes including setup time.`,
    importantNote: "Check wireless mic battery - CRITICAL",
    duration: "03:00",
    durationSeconds: 180,
    media: [mockMediaFiles[0]], // ambient-forest.mp3
    order: 1,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "moment-2",
    title: "Character Introduction",
    notes: `# Character Introduction

## Characters on Stage
- **Protagonist**: Center stage, spotlight
- **Supporting cast**: Stage right, dim lighting

## Sound Design
- Dramatic music begins softly
- Build tension as protagonist speaks
- Peak volume at the revelation moment

## Lighting Cues
- Spot on protagonist: #002
- Dim wash on supporting cast: #003
- Follow-spot operator ready for movement

## Props Check
- [ ] Sword (rubber safety prop)
- [ ] Crown (on side table)
- [ ] Letter (in protagonist's pocket)

## Dialogue Notes
- Protagonist's opening line: "The kingdom has fallen..."
- Wait for dramatic pause before supporting cast responds
- If audience is responsive, extend the pause`,
    importantNote: "Sword prop - check it's the RUBBER one!",
    duration: "05:30",
    durationSeconds: 330,
    media: [mockMediaFiles[1]], // dramatic-music.mp3
    order: 2,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "moment-3",
    title: "Crowd Reaction Scene",
    notes: `# Crowd Reaction Scene

## Audience Participation
This scene involves direct audience participation:
- Actors will move into the audience
- Pre-planted audience members will start the reaction
- Real audience should join in naturally

## Sound Effects
- Crowd applause track ready as backup
- Only use if real crowd is too quiet
- **DO NOT** over-amplify - should feel natural

## Actor Instructions
- Move slowly into audience
- Make eye contact, gesture for participation  
- If crowd is shy, use the planted participants more actively
- Return to stage when applause peaks

## Safety Notes
- House lights to 50% for audience interaction
- Actors stay in designated aisles only
- Stage manager should monitor from booth`,
    importantNote: "House lights to 50% - safety first!",
    duration: "04:00",
    durationSeconds: 240,
    media: [mockMediaFiles[2]], // crowd-applause.mp3
    order: 3,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "moment-4",
    title: "Storm Sequence",
    notes: `# Storm Sequence - Act 2 Climax

## Weather Effects
- Rain sound effect: **crucial timing**
- Start quietly, build to full storm
- Thunder crashes synchronized with lightning
- Wind machine: medium setting

## Lighting Design  
- Lightning flashes: manual control
- Blue/white strobes for lightning
- Dim everything else to near-black
- Emergency lighting remains on

## Actor Safety
- Stage will be wet from rain effects
- Non-slip mats placed strategically
- Actors briefed on safe movement
- No running during storm sequence

## Technical Coordination
- Sound op and lighting op must communicate
- Count system: "Thunder in 3... 2... 1..."
- Rain machine operator has kill switch

## Props
- Umbrellas (actors carry but don't use)  
- Raincoats for quick changes
- Towels in wings for actors`,
    importantNote: "WET STAGE - non-slip mats essential!",
    duration: "06:15",
    durationSeconds: 375,
    media: [mockMediaFiles[3]], // rain-storm.mp3
    order: 4,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "moment-5",
    title: "Final Bell - Curtain Call",
    notes: `# Final Bell - Curtain Call

## The Grand Finale
- All cast on stage for final bow
- Single bell chime signals the end
- Timing must be perfect with final line

## Final Line Delivery
**Actor delivers**: "And so, the tale concludes..."  
**Pause exactly 2 seconds**  
**Bell chime plays**  
**Curtain falls immediately**

## Curtain Call Sequence
1. Curtain rises again after 10 seconds
2. Cast bows in three waves:
   - Supporting cast first
   - Main characters second  
   - Protagonist last
3. Full company bow together
4. Final curtain fall

## House Management
- House lights up to 75% after final bow
- Ushers ready to guide audience exit
- Cast remains for 5 minutes (photos, etc.)

## Strike Notes
- Props cleared immediately after curtain
- Audio equipment powered down
- Lights to work setting only`,
    importantNote: "2-second pause before bell - COUNT IT!",
    duration: "02:30",
    durationSeconds: 150,
    media: [mockMediaFiles[4]], // bell-chime.mp3
    order: 5,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
];

export const mockProduction: Production = {
  id: "prod-1",
  name: "The Ancient Kingdom - Opening Night",
  description:
    "A dramatic fantasy production featuring audience participation and complex technical elements.",
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
