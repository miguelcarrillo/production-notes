import React from "react";
import { AudioPlayerComponent as AudioPlayer } from "./AudioPlayer";
import { Soundboard } from "./Soundboard";

export const Player: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Audio Player - 50% of height */}
      <div className="flex-[0_1_auto] min-h-0 border-b border-gray-600">
        <AudioPlayer />
      </div>

      {/* Soundboard - 50% of height */}
      <div className="flex-1 min-h-0">
        <Soundboard />
      </div>
    </div>
  );
};
