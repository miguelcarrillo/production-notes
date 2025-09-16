// src/components/Timeline/MomentCard.tsx

import { AlertTriangle, Clock } from "lucide-react";
import { useProductionStore } from "../../stores/productionStore";
import type { Moment } from "../../types/production";

interface MomentCardProps {
  moment: Moment;
  index: number;
  isActive: boolean;
}

export const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  index,
  isActive,
}) => {
  const { goToMoment } = useProductionStore();

  const handleClick = () => {
    goToMoment(index);
  };

  return (
    <div
      className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
        isActive
          ? "bg-primary-900 border-primary-600"
          : "bg-gray-900 hover:bg-gray-800"
      }`}
      onClick={handleClick}
    >
      {/* Moment Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
              isActive
                ? "bg-primary-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {index + 1}
          </span>
          {moment.duration && (
            <div className="flex items-center text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              {moment.duration}
            </div>
          )}
        </div>
        {moment.importantNote && (
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Moment Title */}
      <h3
        className={`font-semibold mb-2 ${
          isActive ? "text-white" : "text-gray-200"
        }`}
      >
        {moment.title}
      </h3>

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
        <div className="text-xs text-gray-400">
          {moment.media.length} media file{moment.media.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};
