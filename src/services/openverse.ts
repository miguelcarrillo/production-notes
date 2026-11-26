/**
 * Sound search through the Openverse audio API (https://api.openverse.org).
 *
 * Openverse indexes Creative Commons audio, including ~590k sounds from
 * Freesound. Anonymous requests need no API key (rate limit: 100/min,
 * 1,000/day per IP) and the API allows CORS, so the browser can call it
 * directly and no secret ships with the app.
 */
import type { SoundSearchResult } from "../types/production";

const API_URL = "https://api.openverse.org/v1/audio/";
const PAGE_SIZE = 20;

/** Subset of the Openverse audio fields this app uses. */
interface OpenverseAudio {
  id: string;
  title: string | null;
  url: string | null;
  creator: string | null;
  license: string;
  license_version: string | null;
  license_url: string | null;
  foreign_landing_url: string | null;
  duration: number | null; // milliseconds
}

interface OpenverseResponse {
  result_count: number;
  page_count: number;
  page: number;
  results: OpenverseAudio[];
}

export interface SoundSearchPage {
  results: SoundSearchResult[];
  page: number;
  pageCount: number;
}

export class SoundSearchError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(
      status === 429
        ? "Too many searches. Wait a minute and try again."
        : `Sound search failed (HTTP ${status}).`,
    );
    this.name = "SoundSearchError";
    this.status = status;
  }
}

/** "by-nc" + "4.0" → "CC BY-NC 4.0"; "cc0" → "CC0"; "pdm" → "Public Domain". */
export const formatLicense = (license: string, version?: string | null) => {
  if (license === "cc0") return "CC0";
  if (license === "pdm") return "Public Domain";
  return `CC ${license.toUpperCase()}${version ? ` ${version}` : ""}`;
};

const toResult = (audio: OpenverseAudio): SoundSearchResult | null => {
  if (!audio.url) return null;
  return {
    id: audio.id,
    name: audio.title?.trim() || "Untitled sound",
    previewUrl: audio.url,
    duration: (audio.duration ?? 0) / 1000,
    creator: audio.creator || "Unknown",
    license: formatLicense(audio.license, audio.license_version),
    licenseUrl: audio.license_url ?? undefined,
    sourceUrl: audio.foreign_landing_url ?? undefined,
  };
};

export const searchSounds = async (
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<SoundSearchPage> => {
  const params = new URLSearchParams({
    q: query,
    source: "freesound",
    page: String(page),
    page_size: String(PAGE_SIZE),
    mature: "false",
  });
  const response = await fetch(`${API_URL}?${params}`, { signal });
  if (!response.ok) throw new SoundSearchError(response.status);

  const data = (await response.json()) as OpenverseResponse;
  return {
    results: data.results
      .map(toResult)
      .filter((r): r is SoundSearchResult => r !== null),
    page: data.page ?? page,
    pageCount: data.page_count,
  };
};
