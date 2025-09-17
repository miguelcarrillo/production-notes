import { Play } from "lucide-react";
import React from "react";
import AudioPlayer, {
  type InterfaceGridTemplateArea,
  type PlayList,
} from "react-modern-audio-player";
import { useProductionStore } from "../../stores/productionStore";

const stringToHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const customInterfacePlacement: InterfaceGridTemplateArea = {
  artwork: "row1-2",
  trackInfo: "row2-2",
  trackTimeCurrent: "row3-1",
  progress: "row3-2",
  trackTimeDuration: "row3-3",
  playButton: "row4-2",
  repeatType: "row4-3",
  volume: "row4-1",
};

export const AudioPlayerComponent: React.FC = () => {
  const { audioPlayer, loadAudioFile, localFiles, setAudioPlayingState } =
    useProductionStore();

  const handleDrop = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const filePath = e.dataTransfer.getData("application/local-file-path");
    if (filePath) {
      const fileToLoad = localFiles.find((f) => f.path === filePath);
      if (fileToLoad) loadAudioFile({ handle: fileToLoad.handle });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  if (!audioPlayer.currentFile || !audioPlayer.currentFile.src) {
    return (
      <div
        className="h-full flex flex-col justify-center p-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="text-center text-gray-400 border-2 border-dashed border-gray-600 rounded-lg p-8">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h5 className="font-medium mb-2">No Audio Loaded</h5>
          <p className="text-sm mb-4">Click a file or drag it here to play</p>
        </div>
      </div>
    );
  }

  const playListForPlayer: PlayList = [
    {
      name: audioPlayer.currentFile.name,
      writer:
        audioPlayer.currentFile.path.split("/").pop()?.split(".")[0] ||
        "Unknown",
      img: "/vinyl-record.png",
      src: audioPlayer.currentFile.src,
      id: stringToHash(audioPlayer.currentFile.id),
    },
  ];

  return (
    <div
      className="h-full flex flex-col justify-center p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <AudioPlayer
        key={audioPlayer.currentFile.id}
        playList={playListForPlayer}
        // FIX: Moved onPlay and onPause inside this object
        audioInitialState={{
          isPlaying: audioPlayer.isPlaying,
          curPlayId: stringToHash(audioPlayer.currentFile.id),
          // Event handlers for the underlying <audio> element go here
          onPlay: () => setAudioPlayingState(true, true),
          onPause: () => setAudioPlayingState(false, true),
        }}
        activeUI={{
          all: true,
          progress: "waveform",
          artwork: false,
          playList: false,
          prevNnext: false,
        }}
        placement={{
          player: "static",
          interface: {
            templateArea: customInterfacePlacement,
          },
          volumeSlider: "right",
        }}
        rootContainerProps={{
          colorScheme: "dark",
        }}
      />
    </div>
  );
};
