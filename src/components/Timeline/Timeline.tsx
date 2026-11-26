// src/components/Timeline/Timeline.tsx

import { useEffect, useRef } from "react";
import { useProductionStore } from "../../stores/productionStore";
import { MomentCard } from "./MomentCard";
import { TimeControl } from "./TimeControl";

export const Timeline: React.FC = () => {
  const { currentProduction, timeline, updateTimelineTime } =
    useProductionStore();

  // Ref for the timeline container
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  // Ref for the currently active moment
  const activeMomentRef = useRef<HTMLDivElement>(null);

  // Update timeline time every second when playing
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    // We always want the global timer to keep running once started (globalStartTime set).
    // The moment timer (currentMomentTime) will only advance while `timeline.isPlaying` is true
    // because updateTimelineTime checks `isPlaying` before incrementing it.
    if (timeline.globalStartTime) {
      interval = setInterval(() => {
        updateTimelineTime();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeline.globalStartTime, updateTimelineTime]);

  // Scroll the active moment into view when the currentMomentIndex changes
  useEffect(() => {
    if (activeMomentRef.current && timelineContainerRef.current) {
      activeMomentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [timeline.currentMomentIndex]);

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

      {/* Local File Loader moved to Details component */}

      {/* Moments List */}
      <div
        className="flex-1 overflow-y-auto"
        ref={timelineContainerRef} // Attach the container ref
      >
        {currentProduction.moments.map((moment, index) => (
          <MomentCard
            key={moment.id}
            moment={moment}
            index={index}
            isActive={index === timeline.currentMomentIndex}
            ref={index === timeline.currentMomentIndex ? activeMomentRef : null} // Attach the active moment ref
          />
        ))}
      </div>
    </div>
  );
};
