import React from "react";
import { FileExplorer } from "./FileExplorer";
import { ProductionNotes } from "./ProductionNotes";

export const Details: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Production Notes - 60% of height */}
      <div className="flex-[2] min-h-0 border-b border-gray-600">
        <ProductionNotes />
      </div>

      {/* File Explorer - 40% of height */}
      <div className="flex-[3] min-h-0">
        <FileExplorer />
      </div>
    </div>
  );
};
