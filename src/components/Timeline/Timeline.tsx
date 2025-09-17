// src/components/Timeline/Timeline.tsx

import { FolderOpen } from "lucide-react";
import { useEffect } from "react";
import { useProductionStore } from "../../stores/productionStore";
import { MomentCard } from "./MomentCard";
import { TimeControl } from "./TimeControl";

export const Timeline: React.FC = () => {
  const {
    currentProduction,
    timeline,
    updateTimelineTime,
    loadDirectory,
    localFiles,
    isScanningFiles,
  } = useProductionStore();

  // Update timeline time every second when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timeline.isPlaying) {
      interval = setInterval(() => {
        updateTimelineTime();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeline.isPlaying, updateTimelineTime]);

  if (!currentProduction) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Production Loaded</h3>
          <p className="text-sm">Load a production to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Time Control */}
      <TimeControl />

      {/* + Local File Loader */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={loadDirectory}
          disabled={isScanningFiles}
          className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          <FolderOpen className="w-5 h-5" />
          <span>{isScanningFiles ? "Scanning..." : "Load Audio Folder"}</span>
        </button>
        {localFiles.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Loaded {localFiles.length} audio files.
          </p>
        )}
      </div>

      {/* Moments List */}
      <div className="flex-1 overflow-y-auto">
        {currentProduction.moments.map((moment, index) => (
          <MomentCard
            key={moment.id}
            moment={moment}
            index={index}
            isActive={index === timeline.currentMomentIndex}
          />
        ))}
      </div>
    </div>
  );
};
