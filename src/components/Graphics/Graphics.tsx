import React, { useEffect, useRef, useState } from "react";

interface Slide {
  id: string;
  title: string;
}

// Phase 1: Simple slide builder and preview using a single background video
export const Graphics: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [newTitle, setNewTitle] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video in public/ should be available at the root path
  const videoSrc = "/spotlight_hd.mp4";

  const addSlide = () => {
    const title = newTitle.trim();
    if (!title) return;
    const slide: Slide = {
      id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
    };
    setSlides((s) => [...s, slide]);
    setNewTitle("");
    setSelectedIndex(slides.length); // new slide index
  };

  const selectSlide = (index: number) => {
    setSelectedIndex(index);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addSlide();
  };

  // Ensure video keeps playing/muted when source is ready
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // autoplay muted is usually honored; ensure it plays
    const playIfNeeded = async () => {
      try {
        v.muted = true;
        await v.play();
      } catch (err) {
        // Autoplay might be blocked; that's acceptable for authoring
      }
    };
    playIfNeeded();
  }, [videoSrc]);

  const activeSlide = slides[selectedIndex] ?? null;
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [titleFontSize, setTitleFontSize] = useState<number | undefined>(undefined);

  // Fit title into max 3 lines by reducing font-size if necessary
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const maxLines = 3;
    const maxFont = 48; // px
    const minFont = 14; // px
    const step = 1; // px

    // apply font size and measure
    const fit = () => {
      let font = maxFont;
      el.style.fontSize = font + "px";
      el.style.lineHeight = "1.05";
      // allow wrapping
      el.style.whiteSpace = "normal";

      const computedLineHeight = parseFloat(getComputedStyle(el).lineHeight) || font * 1.05;
      const maxHeight = computedLineHeight * maxLines;

      // Reduce font until the content's scrollHeight fits within maxHeight
      while (el.scrollHeight > maxHeight && font > minFont) {
        font = Math.max(minFont, font - step);
        el.style.fontSize = font + "px";
      }

      setTitleFontSize(font);
    };

    fit();

    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeSlide?.title]);

  return (
    <div className="h-full p-4 flex flex-col">
      {/* Preview window (16:9) */}
      <div className="rounded-md overflow-hidden border border-gray-700 bg-black">
        <div className="w-full relative" style={{ paddingTop: "56.25%" }}>
          <video
            ref={videoRef}
            src={videoSrc}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted
            playsInline
            autoPlay
          />

          {/* Foreground title overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center px-6">
            <div className="backdrop-blur-xs rounded-md px-6 py-3 max-w-[90%] text-center">
              <h1
                ref={titleRef}
                className="graphics-title font-bold text-white break-words whitespace-normal leading-tight text-center"
                style={{ fontSize: titleFontSize ? `${titleFontSize}px` : undefined }}
              >
                {activeSlide ? activeSlide.title : "Preview"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Slide creator */}
      <div className="mt-4 border-t border-gray-700 pt-4">
        <div className="flex gap-2">
          <input
            aria-label="Slide title"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
            placeholder="Enter slide title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            onClick={addSlide}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium"
          >
            Add Slide
          </button>
        </div>

        {/* Playlist (below preview) */}
        <div className="mt-4 grid gap-2 grid-cols-1 md:grid-cols-2">
          {slides.length === 0 ? (
            <div className="text-sm text-gray-400">No slides yet — add one above.</div>
          ) : (
            slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => selectSlide(i)}
                className={`w-full text-left px-3 py-2 rounded border border-gray-700 bg-gray-800 hover:bg-gray-700 ${
                  i === selectedIndex ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="font-medium text-white break-words whitespace-normal">{s.title}</div>
                <div className="text-xs text-gray-400">Slide {i + 1}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Graphics;
