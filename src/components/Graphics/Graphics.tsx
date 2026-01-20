import React, { useEffect, useRef, useState } from "react";
import { db } from "../../db";

interface Slide {
  id: string;
  title: string;
}

// Phase 1: Simple slide builder and preview using a single background video
export const Graphics: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [newTitle, setNewTitle] = useState("");
  const [presenterConnected, setPresenterConnected] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video in public/ should be available at the root path
  const videoSrc = "/colorful light rays.mp4";

  const addSlide = () => {
    const title = newTitle.trim();
    if (!title) return;
    const slide: Slide = {
      id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
    };
    const next = [...slides, slide];
    setSlides(next);
    persistSlides(next);
    setNewTitle("");
    setSelectedIndex(next.length - 1); // new slide index
  };

  const selectSlide = (index: number) => {
    setSelectedIndex(index);
    // Auto-send when onAir
    if (onAir) sendSlideToPresenter(slides[index]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addSlide();
  };

  // UI control: toggle On-Air state
  const toggleOnAir = () => {
    const next = !onAir;
    setOnAir(next);
    // when enabling On-Air, immediately send the current slide to presenter
    if (next) {
      sendSlideToPresenter(activeSlide);
    }
    // when disabling On-Air, do nothing (don't blackout automatically)
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
  const bcRef = useRef<BroadcastChannel | null>(null);
  const presenterRef = useRef<Window | null>(null);
  const [onAir, setOnAir] = useState(false);

  useEffect(() => {
    if (!bcRef.current) {
      try {
        bcRef.current = new BroadcastChannel("production-notes-presentation");
        // listen for presenter handshake messages
        bcRef.current.onmessage = (e) => {
          const m = e.data;
          if (!m) return;
          if (m.type === "presenter-ready") setPresenterConnected(true);
          if (m.type === "presenter-disconnect") setPresenterConnected(false);
        };
      } catch (err) {
        bcRef.current = null;
      }
    }
    return () => {
      bcRef.current?.close();
      bcRef.current = null;
    };
  }, []);

  const openPresenter = () => {
    try {
      // Open named presenter window (reuses existing). If already open, reload it so it picks up
      // any changed presenter.html content (useful during development).
      const w = window.open("/presenter.html", "production-presenter", "noopener,noreferrer");
      presenterRef.current = w;
      // If a window reference is returned and it's same-origin, try reloading it so new code/assets load.
      if (w && !w.closed) {
        try {
          // reload to pick up updated presenter.html (harmless if already fresh)
          w.location.reload();
        } catch (e) {
          // reload may fail if cross-origin or blocked; ignore
        }
      }

      // give the presenter a moment to initialize then send current state
      setTimeout(() => {
        if (onAir && activeSlide) {
          bcRef.current?.postMessage({ type: "slide", slide: activeSlide });
        } else if (!onAir) {
          bcRef.current?.postMessage({ type: "blackout" });
        }
      }, 400);
    } catch (err) {
      // opening presenter may fail in some environments; still safe to ignore here
    }
  };

  const sendSlideToPresenter = (slide: Slide | null) => {
    if (!bcRef.current) return;
    if (!slide) {
      bcRef.current.postMessage({ type: "blackout" });
    } else {
      bcRef.current.postMessage({ type: "slide", slide });
    }
  };

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  // store font size in pixels for the preview (dynamic fit)
  const [titleFontPx, setTitleFontPx] = useState<number | undefined>(undefined);
  const previewWrapperRef = useRef<HTMLDivElement | null>(null);

  // Fit title into max 3 lines by reducing font-size (in px) if necessary
  // Start with a font proportional to the preview container and shrink until it fits
  useEffect(() => {
    const el = titleRef.current;
    const container = previewWrapperRef.current;
    if (!el || !container) return;

    const maxLines = 3;
    const maxFont = Math.max(16, Math.floor(container.clientHeight * 0.22));
    const minFont = 14; // px
    const step = 1; // px

    const fit = () => {
      let font = maxFont;
      el.style.fontSize = font + "px";
      el.style.lineHeight = "1.33";
      el.style.whiteSpace = "normal";

      const computedLineHeight = parseFloat(getComputedStyle(el).lineHeight) || font * 1.33;
      const maxHeight = computedLineHeight * maxLines;

      while (el.scrollHeight > maxHeight && font > minFont) {
        font = Math.max(minFont, font - step);
        el.style.fontSize = font + "px";
      }

      setTitleFontPx(font);
    };

    fit();

    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeSlide?.title]);

  // load persisted slides from Dexie on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rec = await db.slides.get("presentation");
        if (mounted && rec?.slides) {
          setSlides(rec.slides as Slide[]);
          if ((rec.slides as Slide[]).length > 0) setSelectedIndex(0);
        }
      } catch (e) {
        // ignore read errors
      }
    })();
    return () => { mounted = false };
  }, []);

  // helper to persist slides after edits (call whenever slides mutated outside addSlide)
  const persistSlides = (next: Slide[]) => {
    try { db.slides.put({ id: "presentation", slides: next }); } catch (e) {}
  };

  // delete slide
  const deleteSlide = (id: string) => {
    const idx = slides.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const next = slides.filter((s) => s.id !== id);
    setSlides(next);
    persistSlides(next);
    // adjust selected index
    if (selectedIndex === idx) {
      const newIndex = Math.min(idx, next.length - 1);
      setSelectedIndex(newIndex >= 0 ? newIndex : -1);
    } else if (selectedIndex > idx) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  // inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const startEdit = (s: Slide) => {
    setEditingId(s.id);
    setEditingTitle(s.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = (id: string) => {
    const title = editingTitle.trim();
    if (!title) return;
    const next = slides.map((s) => (s.id === id ? { ...s, title } : s));
    setSlides(next);
    persistSlides(next);
    setEditingId(null);
    setEditingTitle("");
  };

  return (
    <div className="h-full p-4 flex flex-col">
      {/* Presenter controls */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={openPresenter}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Open Presenter
        </button>
        <button
          onClick={() => sendSlideToPresenter(activeSlide)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Send Slide
        </button>
        <button
          onClick={() => sendSlideToPresenter(null)}
          className="px-3 py-1 bg-gray-700 text-white rounded"
        >
          Blackout
        </button>
        <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <span
                className={`w-3 h-3 rounded-full ${presenterConnected ? 'bg-green-400' : 'bg-gray-600'}`}
                title={presenterConnected ? 'Presenter connected' : 'No presenter'}
              />
              <span className="text-sm text-gray-300">{presenterConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <label className="text-sm text-gray-300">On Air</label>
            <input
              type="checkbox"
              checked={onAir}
              onChange={toggleOnAir}
              className="w-5 h-5"
            />
        </div>
      </div>
      {/* Preview window (16:9) */}
      <div className="rounded-md overflow-hidden border border-gray-700 bg-black">
  <div ref={previewWrapperRef} className="w-full relative" style={{ paddingTop: "56.25%" }}>
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
                style={{ fontSize: titleFontPx ? `${titleFontPx}px` : undefined }}
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

        {/* Playlist (below preview) - fixed height with scrollbar */}
        <div className="mt-4" style={{ maxHeight: 240, overflowY: "auto", paddingRight: 6 }}>
          {slides.length === 0 ? (
            <div className="text-sm text-gray-400">No slides yet — add one above.</div>
          ) : (
            slides.map((s, i) => (
              <div
                key={s.id}
                className={`w-full text-left px-3 py-2 rounded border border-gray-700 bg-gray-800 hover:bg-gray-700 mb-2 flex items-start gap-3 ${
                  i === selectedIndex ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex-1">
                  {editingId === s.id ? (
                    <div className="flex gap-2">
                      <input
                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(s.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(s.id)}
                        className="px-2 py-1 bg-green-600 rounded text-sm text-white"
                        aria-label="Save"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 bg-gray-600 rounded text-sm text-white"
                        aria-label="Cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => selectSlide(i)}
                      className="text-left w-full"
                      aria-label={`Select slide ${i + 1}`}
                    >
                      <div className="font-medium text-white break-words whitespace-normal">{s.title}</div>
                      <div className="text-xs text-gray-400">Slide {i + 1}</div>
                    </button>
                  )}
                </div>

                {/* actions */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => startEdit(s)}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
                    title="Edit slide"
                    aria-label="Edit slide"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteSlide(s.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-sm text-white"
                    title="Delete slide"
                    aria-label="Delete slide"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Graphics;
