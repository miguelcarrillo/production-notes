import { Pause, Play, SkipForward, Square } from "lucide-react";
import React from "react";
import { useProductionStore } from "../../stores/productionStore";
import { formatDuration } from "../../utils/mockData";

export const TimeControl: React.FC = () => {
  const {
    timeline,
    currentProduction,
    startTimeline,
    pauseTimeline,
    stopTimeline,
    nextMoment,
  } = useProductionStore();

  const currentMoment = currentProduction?.moments[timeline.currentMomentIndex];
  const totalDuration = currentProduction?.totalEstimatedDuration || 0;

  const handlePlayPause = () => {
    if (timeline.isPlaying) {
      pauseTimeline();
    } else {
      startTimeline();
    }
  };

  return (
    <div className="p-4 bg-gray-800 border-b border-gray-700">
      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-3 mb-4">
        <button
          onClick={handlePlayPause}
          className="flex items-center justify-center w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors"
        >
          {timeline.isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </button>

        <button
          onClick={stopTimeline}
          className="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
        >
          <Square className="w-5 h-5" />
        </button>

        <button
          onClick={nextMoment}
          className="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
          disabled={
            !currentProduction ||
            timeline.currentMomentIndex >= currentProduction.moments.length - 1
          }
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Time Displays */}
      <div className="grid grid-cols-2 gap-4 text-center">
        {/* Global Time */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Total Time</div>
          <div className="text-xl font-mono font-bold text-primary-400">
            {formatDuration(timeline.globalTime)}
          </div>
          <div className="text-xs text-gray-500">
            / {formatDuration(totalDuration)}
          </div>
        </div>

        {/* Current Moment Time */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Moment Time</div>
          <div className="text-xl font-mono font-bold text-green-400">
            {formatDuration(timeline.currentMomentTime)}
          </div>
          <div className="text-xs text-gray-500">
            / {currentMoment?.duration || "--:--"}
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              timeline.isPlaying
                ? "bg-green-500"
                : timeline.isPaused
                ? "bg-yellow-500"
                : "bg-gray-500"
            }`}
          ></div>
          <span className="text-sm text-gray-400">
            {timeline.isPlaying
              ? "Playing"
              : timeline.isPaused
              ? "Paused"
              : "Stopped"}
          </span>
        </div>
      </div>
    </div>
  );
};
