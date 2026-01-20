// src/components/Timeline/MomentCard.tsx

import { AlertTriangle, Clock } from "lucide-react";
import React from "react";
import { useProductionStore } from "../../stores/productionStore";
import type { Moment } from "../../types/production";

interface MomentCardProps {
  moment: Moment;
  index: number;
  isActive: boolean;
}

export const MomentCard = React.forwardRef<HTMLDivElement, MomentCardProps>(
  ({ moment, index, isActive }, ref) => {
    const { goToMoment } = useProductionStore();

    const handleClick = () => {
      goToMoment(index);
    };

    return (
      <div
        ref={ref}
        className={`p-4 border-b cursor-pointer transition-colors flex flex-col ${
          isActive
            ? "bg-gradient-to-r from-primary-700 to-primary-600 text-white"
            : "bg-gray-900 text-gray-400 opacity-70 hover:opacity-100"
        }`}
        onClick={handleClick}
      >
        {/* Header: number + title aligned */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center justify-center w-8 h-8 text-sm font-semibold rounded ${
                isActive ? "bg-white/10 text-white" : "bg-gray-800 text-gray-300"
              }`}
            >
              {index + 1}
            </span>
            <h3 className={`font-semibold text-left ${isActive ? "text-white" : "text-gray-200"}`}>
              {moment.title}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {moment.duration && (
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {moment.duration}
              </div>
            )}
            {moment.importantNote && (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Important Note */}
        {moment.importantNote && (
          <div className="text-sm text-yellow-400 bg-yellow-900/20 rounded p-2 mb-2">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{moment.importantNote}</span>
            </div>
          </div>
        )}

        {/* Media Count */}
        {moment.media.length > 0 && (
          <div className="text-xs text-gray-400 mt-auto">
            {moment.media.length} media file{moment.media.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    );
  }
);

MomentCard.displayName = "MomentCard";
