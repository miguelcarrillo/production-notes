import { Play, Plus, Search, Square, Volume2, X } from "lucide-react";
import React, { useState } from "react";
import { useProductionStore } from "../../stores/productionStore";

export const Soundboard: React.FC = () => {
  const {
    soundboard,
    searchSounds,
    addSoundToBoard,
    playSoundEffect,
    stopSoundEffect,
    removeSoundFromBoard,
    setSoundEffectVolume,
  } = useProductionStore();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchSounds(searchQuery.trim());
    }
  };

  const handleSoundToggle = (soundId: string) => {
    const sound = soundboard.sounds.find((s) => s.id === soundId);
    if (sound?.isPlaying) {
      stopSoundEffect(soundId);
    } else {
      playSoundEffect(soundId);
    }
  };

  const handleVolumeChange = (soundId: string, volume: number) => {
    setSoundEffectVolume(soundId, volume);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sounds..."
              className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={soundboard.isSearching}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {soundboard.isSearching ? "..." : "Search"}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search Results */}
        {soundboard.searchResults.length > 0 && (
          <div className="p-4 border-b border-gray-600">
            <h5 className="font-medium text-gray-300 mb-3">Search Results</h5>
            <div className="space-y-2">
              {soundboard.searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <h6 className="text-sm font-medium text-white truncate">
                      {result.name}
                    </h6>
                    <p className="text-xs text-gray-400">
                      {result.duration.toFixed(1)}s • by {result.username}
                    </p>
                  </div>
                  <button
                    onClick={() => addSoundToBoard(result)}
                    className="ml-3 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sound Effects Grid */}
        <div className="p-4">
          <h5 className="font-medium text-gray-300 mb-3">Sound Effects</h5>
          <div className="grid grid-cols-2 gap-3">
            {soundboard.sounds.map((sound) => (
              <div
                key={sound.id}
                className="group relative bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeSoundFromBoard(sound.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Play/Stop Button */}
                <button
                  onClick={() => handleSoundToggle(sound.id)}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center mb-2 transition-colors ${
                    sound.isPlaying
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                >
                  {sound.isPlaying ? (
                    <Square className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-1" />
                  )}
                </button>

                {/* Sound Name */}
                <h6 className="text-sm font-medium text-white text-center mb-2 truncate">
                  {sound.name}
                </h6>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={sound.volume}
                    onChange={(e) =>
                      handleVolumeChange(sound.id, parseFloat(e.target.value))
                    }
                    className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {soundboard.sounds.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm">No sound effects added yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Search and add sounds to build your soundboard
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
