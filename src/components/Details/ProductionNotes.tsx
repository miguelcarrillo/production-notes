import React from "react";
import { useProductionStore } from "../../stores/productionStore";

interface ProductionNotesProps {
}

export const ProductionNotes: React.FC<ProductionNotesProps> = ({
}) => {
  const { currentProduction, timeline } = useProductionStore();

  if (!currentProduction) {
    return (
      <div className="p-4 text-gray-400 text-center">No production loaded</div>
    );
  }

  const currentMoment = currentProduction.moments[timeline.currentMomentIndex];

  if (!currentMoment) {
    return (
      <div className="p-4 text-gray-400 text-center">No moment selected</div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-0 border border-gray-700 flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-200 truncate">
            {currentMoment.title}
          </h3>
          <p className="text-sm text-gray-400">
            Moment {timeline.currentMomentIndex + 1} of{" "}
            {currentProduction.moments.length}
          </p>
        </div>
      </div>
    </div>
  );
};
