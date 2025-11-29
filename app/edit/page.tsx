"use client";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Play, Pause, Settings } from "lucide-react";
import PlaybackComponent from "../../components/PlaybackComponent";

interface Hotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  message: string;
  tooltip?: string;
  nextSlide?: number;
  delay?: number;
  duration?: number;
}

interface Slide {
  id: string;
  title: string;
  imageUrl: string;
  hotspots: Hotspot[];
}

export default function Page() {
  const divRef = useRef<HTMLDivElement>(null);

  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "slide-1",
      title: "Slide 1",
      imageUrl: "./img.png",
      hotspots: [],
    },
  ]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const currentSlide = slides[currentSlideIndex];
  const selectedHotspot = currentSlide?.hotspots?.find(
    (h) => h.id === selectedHotspotId
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playing || !divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      xPercent,
      yPercent,
      message: "New hotspot",
      tooltip: "",
      delay: 0,
      duration: 3,
    };

    setSlides((prev) =>
      prev.map((slide, idx) =>
        idx === currentSlideIndex
          ? { ...slide, hotspots: [...slide.hotspots, newHotspot] }
          : slide
      )
    );

    setSelectedHotspotId(newHotspot.id);
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${slides.length + 1}`,
      imageUrl: "./img.png",
      hotspots: [],
    };
    setSlides((prev) => [...prev, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    setSlides((prev) =>
      prev.map((slide, idx) =>
        idx === currentSlideIndex
          ? {
              ...slide,
              hotspots: slide.hotspots.filter((h) => h.id !== hotspotId),
            }
          : slide
      )
    );
    setSelectedHotspotId(null);
  };

  const handleUpdateHotspot = (
    hotspotId: string,
    field: keyof Hotspot,
    value: any
  ) => {
    setSlides((prev) =>
      prev.map((slide, idx) =>
        idx === currentSlideIndex
          ? {
              ...slide,
              hotspots: slide.hotspots.map((h) =>
                h.id === hotspotId ? { ...h, [field]: value } : h
              ),
            }
          : slide
      )
    );
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("slides", JSON.stringify(slides));
  }, [slides]);

  // Show playback component when in preview mode
  if (playing) {
    return <PlaybackComponent slides={slides} onExit={() => setPlaying(false)} />;
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Demo Builder</h1>
          <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {currentSlide?.title}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPlaying(!playing)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all font-medium text-sm"
          >
            {playing ? (
              <>
                <Pause size={16} /> Stop Preview
              </>
            ) : (
              <>
                <Play size={16} /> Preview
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Slides */}
        <div className="w-48 border-r border-gray-200 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
          <div className="p-4 space-y-3 flex-1">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Slides ({slides.length})
            </h3>

            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setSelectedHotspotId(null);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md group ${
                  currentSlideIndex === idx
                    ? "border-2 border-blue-500 bg-white shadow-md"
                    : "border-2 border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="aspect-video bg-gray-300 rounded-md mb-2 overflow-hidden text-xs flex items-center justify-center text-gray-500 relative">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {slide.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {slide.hotspots.length} hotspot{slide.hotspots.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleAddSlide}
              className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={16} /> Add Slide
            </button>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-100">
          <div
            ref={divRef}
            onClick={handleCanvasClick}
            className={`relative w-full max-w-2xl aspect-video border-2 border-gray-300 rounded-lg overflow-hidden ${
              playing ? "cursor-pointer" : "cursor-crosshair"
            } bg-white shadow-lg`}
          >
            {currentSlide?.imageUrl && (
              <img
                src={currentSlide.imageUrl}
                alt="Canvas"
                className="w-full h-full object-cover"
              />
            )}

            {/* Hotspots */}
            {currentSlide?.hotspots?.map((hotspot, index) => (
              <div
                key={hotspot.id}
                className="group absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${hotspot.xPercent}%`,
                  top: `${hotspot.yPercent}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspotId(hotspot.id);
                }}
              >
                {/* Radar effect for selected hotspot */}
                {selectedHotspotId === hotspot.id && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-blue-400 radar-effect" />
                )}

                {/* Outer circle with shadow */}
                <div
                  className={`absolute inset-0 rounded-full shadow-md transition-all duration-200 ${
                    selectedHotspotId === hotspot.id
                      ? "border-2 border-blue-500 bg-blue-500 scale-125"
                      : "border-2 border-red-500 bg-red-500 group-hover:bubble-effect"
                  }`}
                />

                {/* Inner text - step number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold leading-none">
                    {index + 1}
                  </span>
                </div>

                {/* Pulse effect */}
                <div
                  className={`absolute inset-0 rounded-full ${
                    selectedHotspotId === hotspot.id
                      ? "border-2 border-blue-400"
                      : "border-2 border-red-400"
                  } animate-pulse opacity-30`}
                />

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 mb-3 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded-md whitespace-nowrap shadow-lg z-10 pointer-events-none tooltip-bubble">
                  {hotspot.message}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-gray-900" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l border-gray-200 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          {selectedHotspot ? (
            <div className="p-6 space-y-6">
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {currentSlide?.hotspots?.findIndex(h => h.id === selectedHotspot.id) + 1}
                  </div>
                  Hotspot Properties
                </h3>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Message
                </label>
                <input
                  type="text"
                  value={selectedHotspot.message}
                  onChange={(e) =>
                    handleUpdateHotspot(
                      selectedHotspot.id,
                      "message",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-gray-400 transition-colors"
                />
              </div>

              {/* Tooltip */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Tooltip Content
                </label>
                <textarea
                  value={selectedHotspot.tooltip || ""}
                  onChange={(e) =>
                    handleUpdateHotspot(
                      selectedHotspot.id,
                      "tooltip",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-gray-400 transition-colors resize-none"
                  placeholder="Add additional content..."
                />
              </div>

              {/* Navigation */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Navigate to Slide
                </label>
                <select
                  value={selectedHotspot.nextSlide ?? ""}
                  onChange={(e) =>
                    handleUpdateHotspot(
                      selectedHotspot.id,
                      "nextSlide",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-gray-400 transition-colors"
                >
                  <option value="">No navigation</option>
                  {slides.map((slide, idx) => (
                    <option key={slide.id} value={idx}>
                      {slide.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timing */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Timing & Animation
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Delay (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={selectedHotspot.delay || 0}
                    onChange={(e) =>
                      handleUpdateHotspot(
                        selectedHotspot.id,
                        "delay",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={selectedHotspot.duration || 3}
                    onChange={(e) =>
                      handleUpdateHotspot(
                        selectedHotspot.id,
                        "duration",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteHotspot(selectedHotspot.id)}
                className="w-full py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 border border-red-200 hover:border-red-300"
              >
                <Trash2 size={16} /> Delete Hotspot
              </button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                <Settings size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                No hotspot selected
              </p>
              <p className="text-xs text-gray-500">
                Click on the canvas to add a hotspot or select an existing one
                to edit its properties.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
