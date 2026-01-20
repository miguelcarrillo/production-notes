import React, { useState } from "react";
import { Details } from "../Details/Details";
import { Player } from "../Player/Player";
import { Timeline } from "../Timeline/Timeline";
import { Graphics } from "../Graphics/Graphics";
import { ProductionNotes } from "../Details/ProductionNotes";

export const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"details" | "player">("details");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Production Notes</h1>
          <ProductionNotes />
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">Local Mode</span>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main 3-column layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Column 1: Timeline (unchanged) */}
        <div className="w-2/12 min-w-[300px] bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Timeline />
          </div>
        </div>

        {/* Column 2: Sound area with tabs for Details and Player */}
        <div className="w-5/12 min-w-[300px] bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="flex items-center px-4 py-2 border-b border-gray-700">
            <button
              className={`px-3 py-1 rounded-t-md font-medium mr-2 ${
                activeTab === "details"
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`px-3 py-1 rounded-t-md font-medium ${
                activeTab === "player"
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("player")}
            >
              Player
            </button>
          </div>

          {/* Tab content area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "details" ? (
              <Details />
            ) : (
              <Player />
            )}
          </div>
        </div>

        {/* Column 3: Graphics (new) */}
        <div className="w-5/12 min-w-[300px] bg-gray-750 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Graphics />
          </div>
        </div>
      </div>
    </div>
  );
};
