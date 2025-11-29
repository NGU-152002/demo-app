"use client";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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

interface PlaybackProps {
  slides: Slide[];
  onExit: () => void;
}

interface AnimatingHotspot {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export default function PlaybackComponent({ slides, onExit }: PlaybackProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [playingHotspotIndex, setPlayingHotspotIndex] = useState(-1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [animatingHotspot, setAnimatingHotspot] = useState<AnimatingHotspot | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[currentSlideIndex];
  const currentHotspot =
    playingHotspotIndex >= 0 && playingHotspotIndex < currentSlide.hotspots.length
      ? currentSlide.hotspots[playingHotspotIndex]
      : null;

  // Handle hotspot playback sequence
  useEffect(() => {
    if (!isAutoPlaying || !currentSlide) return;

    if (playingHotspotIndex === -1) {
      // Start with first hotspot
      const delay = (currentSlide.hotspots[0]?.delay || 0) * 1000;
      timeoutRef.current = setTimeout(() => {
        setPlayingHotspotIndex(0);
      }, delay);
    } else if (playingHotspotIndex < currentSlide.hotspots.length) {
      // Move to next hotspot
      const hotspot = currentSlide.hotspots[playingHotspotIndex];
      const duration = (hotspot.duration || 3) * 1000;

      timeoutRef.current = setTimeout(() => {
        const nextIndex = playingHotspotIndex + 1;

        if (nextIndex < currentSlide.hotspots.length) {
          const nextHotspot = currentSlide.hotspots[nextIndex];
          const nextDelay = (nextHotspot.delay || 0) * 1000;
          timeoutRef.current = setTimeout(() => {
            setPlayingHotspotIndex(nextIndex);
          }, nextDelay);
        } else {
          // All hotspots done, move to next slide if navigation is set
          if (currentHotspot?.nextSlide !== undefined) {
            setCurrentSlideIndex(currentHotspot.nextSlide);
            setPlayingHotspotIndex(-1);
          } else {
            // Stay on current slide
            setPlayingHotspotIndex(-1);
          }
        }
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [playingHotspotIndex, isAutoPlaying, currentSlide]);

  const handleHotspotClick = () => {
    if (!currentHotspot) return;

    // If hotspot has navigation, go to next slide with animation
    if (currentHotspot.nextSlide !== undefined) {
      const targetSlideIndex = currentHotspot.nextSlide;
      const targetSlide = slides[targetSlideIndex];

      // Find the first hotspot on the target slide
      const targetHotspot = targetSlide?.hotspots?.[0];

      // Create animation from current hotspot to target hotspot
      if (targetHotspot) {
        setAnimatingHotspot({
          fromX: currentHotspot.xPercent,
          fromY: currentHotspot.yPercent,
          toX: targetHotspot.xPercent,
          toY: targetHotspot.yPercent,
        });

        // Switch slides after animation completes
        timeoutRef.current = setTimeout(() => {
          setCurrentSlideIndex(targetSlideIndex);
          setPlayingHotspotIndex(-1);
          setAnimatingHotspot(null);
        }, 800);
      } else {
        // If no hotspots on target slide, just switch
        setCurrentSlideIndex(targetSlideIndex);
        setPlayingHotspotIndex(-1);
      }
    } else {
      // Otherwise, advance to next hotspot
      const nextIndex = playingHotspotIndex + 1;
      if (nextIndex < currentSlide.hotspots.length) {
        const nextHotspot = currentSlide.hotspots[nextIndex];
        const delay = (nextHotspot.delay || 0) * 1000;
        timeoutRef.current = setTimeout(() => {
          setPlayingHotspotIndex(nextIndex);
        }, delay);
      } else {
        // No more hotspots
        setPlayingHotspotIndex(-1);
      }
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      setPlayingHotspotIndex(-1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setPlayingHotspotIndex(-1);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">Preview Mode</h1>
          <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
            {currentSlide?.title}
          </div>
        </div>
        <button
          onClick={onExit}
          className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        <div ref={canvasRef} className="relative w-full h-full max-w-4xl max-h-96">
          {/* Slide Image */}
          <img
            src={currentSlide?.imageUrl}
            alt={currentSlide?.title}
            className="w-full h-full object-contain"
          />

          {/* Animated navigation hotspot - launches to next slide */}
          {animatingHotspot && (
            <div
              className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none hotspot-navigate"
              style={{
                left: `${animatingHotspot.fromX}%`,
                top: `${animatingHotspot.fromY}%`,
              }}
            >
              <div className="absolute inset-0 rounded-full bg-yellow-500 border-2 border-yellow-400 shadow-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">→</span>
              </div>
            </div>
          )}

          {/* Hotspots */}
          {currentSlide?.hotspots?.map((hotspot, index) => {
            const isCurrentHotspot = index === playingHotspotIndex;
            const isVisible = index <= playingHotspotIndex;

            if(isVisible) return null

            return (
              <div
                key={hotspot.id}
                className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                  isCurrentHotspot ? "scale-150" : "scale-100"
                }`}
                style={{
                  left: `${hotspot.xPercent}%`,
                  top: `${hotspot.yPercent}%`,
                  opacity: !isVisible ? 1 : 0,
                  pointerEvents: isCurrentHotspot ? "auto" : "none",
                }}
                onClick={handleHotspotClick}
              >
                {/* Radar effect for current hotspot */}
                {isCurrentHotspot && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-yellow-400 radar-effect" />
                )}

                {/* Circle */}
                <div
                  className={`absolute inset-0 rounded-full shadow-lg transition-all ${
                    isCurrentHotspot
                      ? "border-2 border-yellow-400 bg-yellow-500 animate-pulse bubble-effect"
                      : "border-2 border-blue-500 bg-blue-500"
                  }`}
                />

                {/* Step Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>

                {/* Message Tooltip */}
                {isCurrentHotspot && (
                  <div className="absolute bottom-full left-1/2 mb-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl w-max max-w-xs z-10 tooltip-bubble">
                    <p className="text-sm font-medium">{hotspot.message}</p>
                    {hotspot.tooltip && (
                      <p className="text-xs text-gray-300 mt-2">{hotspot.tooltip}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Click to continue →
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-gray-900 border-t border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-gray-400 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-400">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-gray-400 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isAutoPlaying
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {isAutoPlaying ? "Auto" : "Manual"}
            </button>

            <button
              onClick={onExit}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              Exit Preview
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 max-w-4xl mx-auto bg-gray-800 rounded-full h-1 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{
              width: `${
                currentSlide?.hotspots?.length
                  ? ((playingHotspotIndex + 1) / currentSlide.hotspots.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
