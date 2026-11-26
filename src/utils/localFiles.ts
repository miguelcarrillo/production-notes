/**
 * Helpers for reading the user's local audio library.
 *
 * Chromium browsers support the File System Access API (`showDirectoryPicker`),
 * which lets us remember the folder between sessions. Other browsers (Firefox,
 * Safari, Brave by default) and non-secure contexts (e.g. a LAN IP over http)
 * do not, so we fall back to `<input type="file" webkitdirectory>`.
 */

export interface LocalFile {
  name: string;
  /** Path relative to the selected folder, including the folder name. */
  path: string;
  /** Present when the folder was opened with the File System Access API. */
  handle?: FileSystemFileHandle;
  /** Present when the folder was opened with the file input fallback. */
  file?: File;
}

const AUDIO_EXTENSIONS = [".mp3", ".wav", ".ogg", ".m4a"];

export const isAudioFileName = (name: string): boolean => {
  const lower = name.toLowerCase();
  return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

export const isDirectoryPickerSupported = (): boolean =>
  typeof window !== "undefined" &&
  window.isSecureContext &&
  typeof window.showDirectoryPicker === "function";

/** Builds the local file list from a `webkitdirectory` input selection. */
export const localFilesFromFileList = (fileList: FileList): LocalFile[] =>
  Array.from(fileList)
    .filter((file) => isAudioFileName(file.name))
    .map((file) => ({
      name: file.name,
      path: file.webkitRelativePath || file.name,
      file,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

/** Returns the underlying File regardless of how the folder was opened. */
export const readLocalFile = async (localFile: LocalFile): Promise<File> => {
  if (localFile.file) return localFile.file;
  if (localFile.handle) return localFile.handle.getFile();
  throw new Error(`No file source for ${localFile.path}`);
};
