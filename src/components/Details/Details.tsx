import React, { useState } from "react";
import { FileExplorer } from "./FileExplorer";
import { ProductionNotes } from "./ProductionNotes";

export const Details: React.FC = () => {
  const [isNotesCollapsed, setIsNotesCollapsed] = useState(true);

  return (
    <div className="h-full flex flex-col">
      {/* Production Notes */}
      {/* + Conditionally change flex properties */}
      <div
        className={`border-b border-gray-600 transition-all duration-300 ${
          isNotesCollapsed ? "flex-none" : "flex-[2] min-h-0"
        }`}
      >
        <ProductionNotes
          isCollapsed={isNotesCollapsed}
          setIsCollapsed={setIsNotesCollapsed}
        />
      </div>

      {/* File Explorer */}
      {/* + Conditionally change flex properties */}
      <div
        className={`transition-all duration-300 ${
          isNotesCollapsed ? "flex-1" : "flex-[3] min-h-0"
        }`}
      >
        <FileExplorer />
      </div>
    </div>
  );
};
