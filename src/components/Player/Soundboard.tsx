import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Search,
  Square,
  X,
} from "lucide-react";
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
    clearSearchResults,
    playPreviewSound,
    stopPreviewSound,
    fetchNextPage,
    loadSearchPage,
  } = useProductionStore();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchSounds(searchQuery.trim());
      setSearchQuery(""); // Clear search box
    }
  };

  const handleSoundToggle = (soundId: string) => {
    const sound = soundboard.sounds.find((s) => s.id === soundId);
    if (sound?.isPlaying) {
      stopSoundEffect(soundId);
    } else {
      // The playSoundEffect action will handle stopping other sounds if needed.
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
        {soundboard.searchError && (
          <p
            role="alert"
            className="m-4 p-3 text-sm text-red-200 bg-red-950/50 rounded-lg"
          >
            {soundboard.searchError}
          </p>
        )}

        {/* Search Results */}
        {soundboard.searchResults.length > 0 && (
          <div className="p-4 border-b border-gray-600 relative">
            <button
              onClick={clearSearchResults}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
              title="Close search results"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-300">
                Results for &ldquo;{soundboard.lastQuery}&rdquo;
              </h5>
              {soundboard.pageCount > 1 && (
                <div className="flex items-center mr-6 space-x-2 text-sm text-gray-400">
                  <button
                    onClick={() =>
                      soundboard.lastQuery &&
                      loadSearchPage(soundboard.lastQuery, soundboard.page - 1)
                    }
                    disabled={soundboard.isSearching || soundboard.page <= 1}
                    className="p-1 hover:text-white disabled:opacity-30"
                    title="Previous page"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    {soundboard.page} / {soundboard.pageCount}
                  </span>
                  <button
                    onClick={fetchNextPage}
                    disabled={
                      soundboard.isSearching ||
                      soundboard.page >= soundboard.pageCount
                    }
                    className="p-1 hover:text-white disabled:opacity-30"
                    title="Next page"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {soundboard.searchResults.map((result) => {
                const isPreviewPlaying =
                  soundboard.playingPreviewId === result.id;

                return (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h6 className="text-sm font-medium text-white truncate">
                        {result.name}
                      </h6>
                      <p className="text-xs text-gray-400 truncate">
                        {result.duration.toFixed(1)}s · {result.creator} ·{" "}
                        {result.licenseUrl ? (
                          <a
                            href={result.licenseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-white"
                          >
                            {result.license}
                          </a>
                        ) : (
                          result.license
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        isPreviewPlaying
                          ? stopPreviewSound()
                          : playPreviewSound(result)
                      }
                      className={`ml-3 p-2 text-white rounded transition-colors ${
                        isPreviewPlaying
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      title={isPreviewPlaying ? "Stop preview" : "Play preview"}
                    >
                      {isPreviewPlaying ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => addSoundToBoard(result)}
                      className="ml-3 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                      title="Add to soundboard"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sound Effects Grid */}
        <div className="p-4">
          <h5 className="font-medium text-gray-300 mb-3">Sound Effects</h5>
          <div className="grid grid-cols-4 gap-2">
            {soundboard.sounds.map((sound) => (
              <div
                key={sound.id}
                className="group relative bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors flex flex-col items-center"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeSoundFromBoard(sound.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Play/Stop */}
                <button
                  onClick={() => handleSoundToggle(sound.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    sound.isPlaying
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                >
                  {sound.isPlaying ? (
                    <Square className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-1" />
                  )}
                </button>

                {/* Sound Name */}
                <h6
                  className="w-full text-xs font-medium text-white text-center mb-2 truncate"
                  title={
                    sound.creator
                      ? `${sound.name} by ${sound.creator} (${sound.license})`
                      : sound.name
                  }
                >
                  {sound.name}
                </h6>

                {/* Volume Control */}
                <div className="flex items-center space-x-2 max-w-full">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={sound.volume}
                    onChange={(e) =>
                      handleVolumeChange(sound.id, parseFloat(e.target.value))
                    }
                    className="max-w-full flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-sm"
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
          <p className="mt-6 text-xs text-gray-500">
            Sounds from{" "}
            <a
              href="https://freesound.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300"
            >
              Freesound
            </a>{" "}
            via{" "}
            <a
              href="https://openverse.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300"
            >
              Openverse
            </a>
            , under Creative Commons licenses. Hover a sound for its credit.
          </p>
        </div>
      </div>
    </div>
  );
};
