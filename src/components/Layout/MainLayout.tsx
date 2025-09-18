import React from "react";
import { Details } from "../Details/Details";
import { Player } from "../Player/Player";
import { Timeline } from "../Timeline/Timeline";

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Production Notes</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">Local Mode</span>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main 3-column layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Column 1: Timeline */}
        <div className="w-2/12 min-w-[300px] bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Timeline />
          </div>
        </div>

        {/* Column 2: Details */}
        <div className="w-4/12 min-w-[300px] bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Details />
          </div>
        </div>

        {/* Column 3: Player */}
        <div className="w-6/12 min-w-[300px] bg-gray-750 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Player />
          </div>
        </div>
      </div>
    </div>
  );
};
