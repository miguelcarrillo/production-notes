import { Pause, Play, Repeat, Square, Volume2 } from "lucide-react"; // + Import Repeat
import React, { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { useProductionStore } from "../../stores/productionStore";

export const AudioPlayer: React.FC = () => {
  const {
    audioPlayer,
    playAudio,
    pauseAudio,
    stopAudio,
    setVolume,
    setCurrentTime,
    toggleLoop, // + Get toggleLoop
    loadAudioFile, // + Get loadAudioFile
    localFiles, // + Get localFiles for drop handling
  } = useProductionStore();

  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (audioPlayer.currentFile && waveformRef.current) {
      console.log("waveformRef.current:", waveformRef.current);
      console.log("Initializing WaveSurfer...");
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#4A5568", // gray-600
        progressColor: "#4299E1", // primary-500
        barWidth: 2,
        barRadius: 3,
        height: 80,
        cursorWidth: 0,
      });

      // Sync WaveSurfer's seek with our state
      wavesurfer.current.on("seeking", (time) => {
        console.log("Seeking to time:", time);
        setCurrentTime(time);
      });

      // Debug WaveSurfer events
      wavesurfer.current.on("ready", () => {
        console.log("WaveSurfer is ready.");
      });

      wavesurfer.current.on("error", (error) => {
        console.error("WaveSurfer error:", error);
      });

      return () => {
        console.log("Destroying WaveSurfer instance...");
        wavesurfer.current?.destroy();
      };
    } else {
      console.warn(
        "WaveSurfer initialization skipped. Either no file is loaded or waveformRef is null."
      );
    }
  }, [audioPlayer.currentFile]);

  // Load audio into WaveSurfer when the file changes
  useEffect(() => {
    if (audioPlayer.currentFile?.handle && wavesurfer.current) {
      const loadWaveform = async () => {
        try {
          console.log(
            "Loading audio file into WaveSurfer:",
            audioPlayer.currentFile?.name
          );
          const file = await audioPlayer.currentFile!.handle!.getFile();
          const objectURL = URL.createObjectURL(file);
          wavesurfer.current?.load(objectURL);
        } catch (error) {
          console.error("Error loading audio file into WaveSurfer:", error);
        }
      };
      loadWaveform();
    } else {
      console.warn(
        "No valid audio file to load into WaveSurfer.",
        audioPlayer.currentFile
      );
    }
  }, [audioPlayer.currentFile]);

  // Sync WaveSurfer play/pause with our state
  useEffect(() => {
    if (wavesurfer.current) {
      if (audioPlayer.isPlaying) {
        console.log("Playing audio in WaveSurfer.");
        wavesurfer.current.play();
      } else {
        console.log("Pausing audio in WaveSurfer.");
        wavesurfer.current.pause();
      }
    }
  }, [audioPlayer.isPlaying]);

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const filePath = e.dataTransfer.getData("application/local-file-path");
      console.log("Dropped file path:", filePath);
      if (filePath) {
        const fileToLoad = localFiles.find((f) => f.path === filePath);
        console.log("File to load:", fileToLoad);
        if (fileToLoad) {
          loadAudioFile({
            id: fileToLoad.name,
            name: fileToLoad.name,
            path: fileToLoad.path,
            type: "audio",
            size: 0, // Placeholder, as size is not available
            createdAt: new Date(), // Placeholder
            handle: fileToLoad.handle,
          });
        } else {
          console.warn("No matching file found in localFiles.");
        }
      }
    } catch (error) {
      console.error("Error handling dropped file:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handlePlayPause = () => {
    if (audioPlayer.isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  return (
    <div className="h-full flex flex-col">
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
                {audioPlayer.currentFile?.name || "Unknown File"}
              </h5>
            </div>

            {/* Waveform Visualization */}
            <div ref={waveformRef} className="w-full h-24" />

            {/* Progress Bar */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={audioPlayer.duration || 0}
                value={audioPlayer.currentTime}
                onChange={handleTimeChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={toggleLoop}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  audioPlayer.loop
                    ? "bg-primary-600 text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                }`}
                title="Toggle Loop"
              >
                <Repeat className="w-5 h-5" />
              </button>

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
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioPlayer.volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
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
              Drag an audio file here from the project folder
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
