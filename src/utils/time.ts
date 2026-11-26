/** Formats seconds as mm:ss. */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

/** Parses an mm:ss string into seconds. */
export const parseDuration = (duration: string): number => {
  const [mins, secs] = duration.split(":").map(Number);
  return mins * 60 + secs;
};
