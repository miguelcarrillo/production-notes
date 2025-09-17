// src/components/FileManager/FileManager.tsx

import {
  AlertCircle,
  CheckCircle,
  Folder,
  FolderOpen,
  HardDrive,
  RefreshCw,
  Upload,
} from "lucide-react";
import React, { useState } from "react";
import type { MediaFile } from "../../types/production";
import {
  clearStoredDirectoryAccess,
  isFileSystemAccessSupported,
  selectAudioDirectory,
  selectAudioFiles,
} from "../../utils/fileSystem";

interface FileManagerProps {
  onFilesLoaded: (files: MediaFile[]) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  onFilesLoaded,
  isVisible,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedFiles, setLoadedFiles] = useState<MediaFile[]>([]);
  const [directoryName, setDirectoryName] = useState<string | null>(null);

  const handleDirectorySelect = async () => {
    if (!isFileSystemAccessSupported()) {
      setError(
        "Your browser doesn't support directory selection. Use file selection instead."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const files = await selectAudioDirectory();
      setLoadedFiles(files);
      setDirectoryName("Selected Directory");
      onFilesLoaded(files);

      console.log(`Loaded ${files.length} audio files`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage !== "Directory selection cancelled") {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const files = await selectAudioFiles();
      setLoadedFiles(files);
      setDirectoryName("Selected Files");
      onFilesLoaded(files);

      console.log(`Loaded ${files.length} audio files`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFiles = () => {
    setLoadedFiles([]);
    setDirectoryName(null);
    setError(null);
    clearStoredDirectoryAccess();
    onFilesLoaded([]);
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-white">File Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="sr-only">Close</span>✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {/* Browser Support Info */}
          <div className="mb-6">
            {isFileSystemAccessSupported() ? (
              <div className="flex items-center space-x-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Directory access supported - You can select entire folders
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>
                  Limited to file selection - Directory access not supported in
                  this browser
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            {isFileSystemAccessSupported() && (
              <button
                onClick={handleDirectorySelect}
                disabled={isLoading}
                className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <FolderOpen className="w-5 h-5" />
                )}
                <span>Select Audio Folder</span>
              </button>
            )}

            <button
              onClick={handleFileSelect}
              disabled={isLoading}
              className="flex items-center space-x-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span>Select Audio Files</span>
            </button>

            {loadedFiles.length > 0 && (
              <button
                onClick={handleClearFiles}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-400" />
              <p className="text-gray-300">Scanning for audio files...</p>
            </div>
          )}

          {/* Loaded Files Display */}
          {loadedFiles.length > 0 && !isLoading && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Folder className="w-5 h-5 text-primary-400" />
                    <div>
                      <h3 className="font-medium text-white">
                        {directoryName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {loadedFiles.length} audio file
                        {loadedFiles.length !== 1 ? "s" : ""} found
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    Total size:{" "}
                    {formatFileSize(
                      loadedFiles.reduce((sum, file) => sum + file.size, 0)
                    )}
                  </div>
                </div>
              </div>

              {/* File List */}
              <div className="bg-gray-700 rounded-lg max-h-60 overflow-y-auto">
                <div className="divide-y divide-gray-600">
                  {loadedFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className="p-3 hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">
                            {file.name}
                          </h4>
                          <p className="text-sm text-gray-400 truncate">
                            {file.path}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{formatDuration(file.duration)}</span>
                          <span>{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {loadedFiles.length === 0 && !isLoading && !error && (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No Files Loaded
              </h3>
              <p className="text-gray-500 mb-6">
                Select a folder or files to import your audio library
              </p>

              <div className="bg-gray-700 rounded-lg p-6 max-w-2xl mx-auto text-left">
                <h4 className="font-medium text-white mb-3">Tips:</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Supported formats: MP3, WAV, OGG, M4A, AAC, FLAC</li>
                  <li>
                    • Folder selection will scan subdirectories (up to 3 levels
                    deep)
                  </li>
                  <li>
                    • File metadata (duration, size) is automatically extracted
                  </li>
                  <li>• Large files may take a moment to process</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {loadedFiles.length > 0 && (
              <span>
                {loadedFiles.length} file{loadedFiles.length !== 1 ? "s" : ""}{" "}
                ready to use
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
            {loadedFiles.length > 0 && (
              <button onClick={onClose} className="btn-primary">
                Use These Files
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
