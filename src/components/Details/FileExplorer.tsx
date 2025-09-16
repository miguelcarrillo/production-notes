import { Download, Music, Play } from "lucide-react";
import React from "react";
import { useProductionStore } from "../../stores/productionStore";
import type { MediaFile } from "../../types/production";

export const FileExplorer: React.FC = () => {
  const { currentProduction, timeline, loadAudioFile, playAudio } =
    useProductionStore();

  if (!currentProduction) {
    return (
      <div className="p-4 text-gray-400 text-center">No production loaded</div>
    );
  }

  const currentMoment = currentProduction.moments[timeline.currentMomentIndex];
  const mediaFiles = currentMoment?.media || [];

  const handleFileClick = (file: MediaFile) => {
    loadAudioFile(file);
  };

  const handlePlayClick = (file: MediaFile, event: React.MouseEvent) => {
    event.stopPropagation();
    loadAudioFile(file);
    playAudio();
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <p className="text-sm text-gray-400">
          {mediaFiles.length} file{mediaFiles.length !== 1 ? "s" : ""} in
          current moment
        </p>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {mediaFiles.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No media files in this moment</p>
          </div>
        ) : (
          <div className="space-y-1">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                className="group flex items-center p-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                onClick={() => handleFileClick(file)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify(file)
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
                    <span>{formatDuration(file.duration)}</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                </div>

                {/* Drag Handle */}
                <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-4 h-4 text-gray-500 rotate-90" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
