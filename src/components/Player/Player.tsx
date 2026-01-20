import React from "react";
import { Soundboard } from "./Soundboard";

export const Player: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Soundboard - 50% of height */}
      <div className="flex-1 min-h-0">
        <Soundboard />
      </div>
    </div>
  );
};
