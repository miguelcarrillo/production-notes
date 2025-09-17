import { Music, Play } from "lucide-react";
import React from "react";
import type { LocalFile } from "../../stores/productionStore"; // Import LocalFile
import { useProductionStore } from "../../stores/productionStore";

export const FileExplorer: React.FC = () => {
  // Destructure the new state and actions
  const { localFiles, loadAudioFile, playAudio } = useProductionStore();

  // The logic now revolves around localFiles, not moment.media
  const mediaFiles = localFiles;

  const handleFileClick = (file: LocalFile) => {
    // We pass the object with the handle to loadAudioFile
    loadAudioFile({ handle: file.handle } as any);
  };

  // Add a double-click handler to load and play immediately
  const handleDoubleClick = (file: LocalFile) => {
    loadAudioFile({ handle: file.handle } as any);
    playAudio();
  };

  const handlePlayClick = (file: LocalFile, event: React.MouseEvent) => {
    event.stopPropagation();
    loadAudioFile({ handle: file.handle } as any);
    playAudio();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <p className="text-sm text-gray-400">
          {mediaFiles.length} file{mediaFiles.length !== 1 ? "s" : ""} in
          project folder
        </p>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {mediaFiles.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No audio folder loaded</p>
            <p className="text-xs text-gray-500 mt-1">
              Use the button in the Timeline column.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {mediaFiles.map((file) => (
              <div
                key={file.path}
                className="group flex items-center p-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                onClick={() => handleFileClick(file)}
                onDoubleClick={() => handleDoubleClick(file)} // Add double-click
                draggable
                onDragStart={(e) => {
                  // We need to pass the handle's info. A simple path/name is enough.
                  e.dataTransfer.setData(
                    "application/local-file-path",
                    file.path
                  );
                  e.dataTransfer.effectAllowed = "copy";
                }}
              >
                {/* File Icon */}
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 bg-primary-900 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary-400" />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-200 truncate group-hover:text-white">
                      {file.name}
                    </h5>
                    <button
                      onClick={(e) => handlePlayClick(file, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary-600 rounded transition-all"
                      title="Play file"
                    >
                      <Play className="w-4 h-4 text-primary-400 hover:text-white" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400 mt-1">
                    {/* We don't have this info yet, so we can hide it */}
                    <span className="truncate">{file.path}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
