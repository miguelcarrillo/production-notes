import { Pause, Play, Square, Volume2 } from "lucide-react";
import React, { useRef } from "react";
import { useProductionStore } from "../../stores/productionStore";

export const AudioPlayer: React.FC = () => {
  const {
    audioPlayer,
    playAudio,
    pauseAudio,
    stopAudio,
    setVolume,
    setCurrentTime,
  } = useProductionStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef<HTMLInputElement>(null);

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const fileData = e.dataTransfer.getData("application/json");
      const file = JSON.parse(fileData);
      // In a real app, you'd load the audio file here
      console.log("Dropped file:", file);
    } catch (error) {
      console.error("Error handling dropped file:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (audioPlayer.isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  // Mock waveform data
  const mockWaveform = Array.from(
    { length: 100 },
    (_, i) => Math.sin(i * 0.1) * 50 + Math.random() * 30 + 20
  );

  return (
    <div className="h-full flex flex-col">
      {/* Drop Zone */}
      <div
        className="flex-1 flex flex-col justify-center p-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {audioPlayer.currentFile ? (
          <div className="space-y-4">
            {/* Current File Info */}
            <div className="text-center">
              <h5 className="font-medium text-white mb-1">
                {audioPlayer.currentFile.name}
              </h5>
              <p className="text-sm text-gray-400">
                {formatTime(audioPlayer.currentTime)} /{" "}
                {formatTime(audioPlayer.duration)}
              </p>
            </div>

            {/* Waveform Visualization */}
            <div className="bg-gray-800 rounded-lg p-4 h-24">
              <div className="flex items-end justify-center h-full space-x-1">
                {mockWaveform.map((height, index) => (
                  <div
                    key={index}
                    className={`w-1 rounded-t transition-colors ${
                      index <
                      (audioPlayer.currentTime / audioPlayer.duration) * 100
                        ? "bg-primary-500"
                        : "bg-gray-600"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={audioPlayer.duration}
                value={audioPlayer.currentTime}
                onChange={handleTimeChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handlePlayPause}
                disabled={!audioPlayer.currentFile}
                className="flex items-center justify-center w-14 h-14 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full transition-colors"
              >
                {audioPlayer.isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>

              <button
                onClick={stopAudio}
                disabled={!audioPlayer.currentFile}
                className="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full transition-colors"
              >
                <Square className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={volumeRef}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioPlayer.volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-400 min-w-[3rem]">
                {Math.round(audioPlayer.volume * 100)}%
              </span>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center text-gray-400 border-2 border-dashed border-gray-600 rounded-lg p-8">
            <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h5 className="font-medium mb-2">No Audio Loaded</h5>
            <p className="text-sm mb-4">
              Drag an audio file here or select from the file explorer
            </p>
            <div className="text-xs text-gray-500">
              Supported formats: MP3, WAV, OGG
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
