// src/components/Timeline/Timeline.tsx

import { useEffect } from "react";
import { useProductionStore } from "../../stores/productionStore";
import { MomentCard } from "./MomentCard";
import { TimeControl } from "./TimeControl";

export const Timeline: React.FC = () => {
  const { currentProduction, timeline, updateTimelineTime } =
    useProductionStore();

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
