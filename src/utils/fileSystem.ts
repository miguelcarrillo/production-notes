import type { MediaFile } from "../types/production";

// Check if File System Access API is supported
export const isFileSystemAccessSupported = (): boolean => {
  return "showDirectoryPicker" in window;
};

// Supported audio file types
const SUPPORTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/m4a",
  "audio/aac",
  "audio/flac",
];

const SUPPORTED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".aac",
  ".flac",
];

// Check if a file is a supported audio file
export const isAudioFile = (file: File): boolean => {
  const hasValidType = SUPPORTED_AUDIO_TYPES.includes(file.type);
  const hasValidExtension = SUPPORTED_AUDIO_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  return hasValidType || hasValidExtension;
};

// Get audio duration using HTML5 Audio API
export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectURL = URL.createObjectURL(file);

    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(objectURL);
      resolve(audio.duration);
    });

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(objectURL);
      reject(new Error("Failed to load audio metadata"));
    });

    audio.src = objectURL;
  });
};

// Convert File to MediaFile interface
export const fileToMediaFile = async (
  file: File,
  basePath: string = ""
): Promise<MediaFile> => {
  let duration: number | undefined;

  try {
    duration = await getAudioDuration(file);
  } catch (error) {
    console.warn(`Could not get duration for ${file.name}:`, error);
  }

  return {
    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    path: basePath + file.name,
    type: "audio",
    size: file.size,
    duration,
    createdAt: new Date(file.lastModified),
  };
};

// File System Access API - Select directory
export const selectAudioDirectory = async (): Promise<MediaFile[]> => {
  if (!isFileSystemAccessSupported()) {
    throw new Error("File System Access API not supported");
  }

  try {
    // @ts-ignore - FileSystemDirectoryHandle types might not be fully available
    const directoryHandle = await window.showDirectoryPicker({
      mode: "read",
    });

    const mediaFiles: MediaFile[] = [];
    const basePath = `/${directoryHandle.name}/`;

    // Recursively read directory contents
    await processDirectory(directoryHandle, mediaFiles, basePath);

    return mediaFiles;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error("Directory selection cancelled");
    }
    throw error;
  }
};

// Recursively process directory contents
const processDirectory = async (
  directoryHandle: any, // FileSystemDirectoryHandle
  mediaFiles: MediaFile[],
  basePath: string,
  maxDepth: number = 3,
  currentDepth: number = 0
): Promise<void> => {
  if (currentDepth >= maxDepth) return;

  try {
    // @ts-ignore
    for await (const [name, handle] of directoryHandle.entries()) {
      if (handle.kind === "file") {
        try {
          const file = await handle.getFile();
          if (isAudioFile(file)) {
            const mediaFile = await fileToMediaFile(file, basePath);
            mediaFiles.push(mediaFile);
          }
        } catch (error) {
          console.warn(`Could not process file ${name}:`, error);
        }
      } else if (handle.kind === "directory") {
        // Recursively process subdirectories
        await processDirectory(
          handle,
          mediaFiles,
          `${basePath}${name}/`,
          maxDepth,
          currentDepth + 1
        );
      }
    }
  } catch (error) {
    console.warn("Error processing directory:", error);
  }
};

// Fallback: Traditional file input for multiple files
export const selectAudioFiles = async (): Promise<MediaFile[]> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = SUPPORTED_AUDIO_EXTENSIONS.join(",");

    input.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;
      const files = Array.from(target.files || []);

      if (files.length === 0) {
        resolve([]);
        return;
      }

      try {
        const mediaFiles = await Promise.all(
          files
            .filter(isAudioFile)
            .map((file) => fileToMediaFile(file, "/selected/"))
        );

        resolve(mediaFiles);
      } catch (error) {
        reject(error);
      }
    });

    input.addEventListener("cancel", () => {
      resolve([]);
    });

    input.click();
  });
};

// Create object URL for playing files
export const createAudioObjectURL = (file: File): string => {
  return URL.createObjectURL(file);
};

// Cleanup object URL
export const revokeAudioObjectURL = (url: string): void => {
  URL.revokeObjectURL(url);
};

// Get file from File System Access API handle (for playing)
export const getFileFromPath = async (
  directoryHandle: any, // FileSystemDirectoryHandle
  filePath: string
): Promise<File | null> => {
  try {
    // Remove leading slash and split path
    const pathParts = filePath.replace(/^\/[^/]+\//, "").split("/");
    let currentHandle = directoryHandle;

    // Navigate to the file through directory structure
    for (let i = 0; i < pathParts.length - 1; i++) {
      const dirName = pathParts[i];
      currentHandle = await currentHandle.getDirectoryHandle(dirName);
    }

    // Get the file
    const fileName = pathParts[pathParts.length - 1];
    const fileHandle = await currentHandle.getFileHandle(fileName);
    return await fileHandle.getFile();
  } catch (error) {
    console.error("Error getting file from path:", error);
    return null;
  }
};

// Store directory handle for later use (in sessionStorage)
export const storeDirectoryHandle = (handle: any): void => {
  // Note: We can't actually store the handle directly, but we can store metadata
  sessionStorage.setItem("hasDirectoryAccess", "true");
  sessionStorage.setItem("directoryName", handle.name);
};

// Check if we have stored directory access
export const hasStoredDirectoryAccess = (): boolean => {
  return sessionStorage.getItem("hasDirectoryAccess") === "true";
};

// Clear stored directory access
export const clearStoredDirectoryAccess = (): void => {
  sessionStorage.removeItem("hasDirectoryAccess");
  sessionStorage.removeItem("directoryName");
};
