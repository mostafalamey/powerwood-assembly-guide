import React, { useRef, useState, useEffect } from "react";

interface TimelineProps {
  duration: number; // Total duration in seconds
  currentTime: number;
  onTimeChange: (time: number) => void;
  keyframes?: number[]; // Array of keyframe times
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onRecordCameraKeyframe?: () => void;
  onDeleteCameraKeyframe?: () => void;
  onRecordObjectKeyframe?: () => void;
  onDeleteObjectKeyframe?: () => void;
  hasCameraKeyframeAtCurrentTime?: boolean;
  hasObjectKeyframeAtCurrentTime?: boolean;
  canRecordObjectKeyframe?: boolean;
  onKeyframeMoved?: (oldTime: number, newTime: number) => void;
  onKeyframeSelect?: (time: number) => void;
}

export default function Timeline({
  duration,
  currentTime,
  onTimeChange,
  keyframes = [],
  isPlaying = false,
  onPlayPause,
  onRecordCameraKeyframe,
  onDeleteCameraKeyframe,
  onRecordObjectKeyframe,
  onDeleteObjectKeyframe,
  hasCameraKeyframeAtCurrentTime = false,
  hasObjectKeyframeAtCurrentTime = false,
  canRecordObjectKeyframe = false,
  onKeyframeMoved,
  onKeyframeSelect,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingKeyframe, setDraggingKeyframe] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const updateTimeFromMouse = (e: MouseEvent | React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    let newTime = percentage * duration;

    // Snap to nearest keyframe if within threshold
    if (keyframes.length > 0) {
      const snapThreshold = 0.05; // Snap within 0.05 seconds
      const nearestKeyframe = keyframes.reduce((nearest, kf) => {
        const distance = Math.abs(kf - newTime);
        const nearestDistance = Math.abs(nearest - newTime);
        return distance < nearestDistance ? kf : nearest;
      }, keyframes[0]);

      if (Math.abs(nearestKeyframe - newTime) <= snapThreshold) {
        newTime = nearestKeyframe;
      }
    }

    onTimeChange(newTime);
  };

  const updateKeyframeTimeFromMouse = (e: MouseEvent, oldTime: number) => {
    if (!timelineRef.current || !onKeyframeMoved) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    let newTime = percentage * duration;

    // Clamp to valid range
    newTime = Math.max(0, Math.min(newTime, duration));

    // Round to 2 decimal places
    newTime = Math.round(newTime * 100) / 100;

    // Only update if time changed
    if (newTime !== oldTime) {
      onKeyframeMoved(oldTime, newTime);
      setDraggingKeyframe(newTime);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateTimeFromMouse(e);
  };

  const handleKeyframeMouseDown = (
    e: React.MouseEvent,
    keyframeTime: number,
  ) => {
    e.stopPropagation();
    setDraggingKeyframe(keyframeTime);
    setDragStartX(e.clientX);
    setHasMoved(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingKeyframe !== null) {
      // Dragging a keyframe
      const movedDistance = Math.abs(e.clientX - dragStartX);
      if (movedDistance > 3) {
        setHasMoved(true);
      }
      updateKeyframeTimeFromMouse(e, draggingKeyframe);
    } else if (isDragging) {
      // Dragging the scrubber
      updateTimeFromMouse(e);
    }
  };

  const handleMouseUp = () => {
    if (draggingKeyframe !== null && !hasMoved) {
      // Click on keyframe without dragging - move scrubber to that time and select it
      onTimeChange(draggingKeyframe);
      if (onKeyframeSelect) {
        onKeyframeSelect(draggingKeyframe);
      }
    }
    setIsDragging(false);
    setDraggingKeyframe(null);
    setHasMoved(false);
  };

  useEffect(() => {
    if (isDragging || draggingKeyframe !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, draggingKeyframe]);

  const formatTime = (seconds: number) => {
    const secs = Math.floor(seconds);
    const ms = Math.floor((seconds % 1) * 100);
    return `${secs}.${ms.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      {/* Controls */}
      <div className="flex items-center justify-between mb-3">
        {/* Left: Play button and time */}
        <div className="flex items-center gap-2">
          {/* Play/Pause button */}
          <button
            onClick={onPlayPause}
            className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Time display */}
          <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Center: Keyframe buttons */}
        <div className="flex items-center gap-2">
          {/* Camera Record button */}
          <button
            onClick={onRecordCameraKeyframe}
            className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            title="Record Camera Keyframe"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Camera Delete button */}
          <button
            onClick={onDeleteCameraKeyframe}
            disabled={!hasCameraKeyframeAtCurrentTime}
            className="p-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Camera Keyframe"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          {/* Object Record button */}
          <button
            onClick={onRecordObjectKeyframe}
            disabled={!canRecordObjectKeyframe}
            className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Record Object Keyframe"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="6" />
            </svg>
          </button>

          {/* Object Delete button */}
          <button
            onClick={onDeleteObjectKeyframe}
            disabled={!hasObjectKeyframeAtCurrentTime}
            className="p-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Object Keyframe"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Right: Duration input */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Duration:
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => {
              const newDuration = Math.max(0.1, Number(e.target.value));
              // Keep current time within new duration
              if (currentTime > newDuration) {
                onTimeChange(newDuration);
              }
            }}
            step="0.5"
            min="0.1"
            className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">sec</span>
        </div>
      </div>

      {/* Timeline track */}
      <div
        ref={timelineRef}
        onMouseDown={handleMouseDown}
        className="relative h-12 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer select-none"
      >
        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 opacity-20 rounded-l pointer-events-none"
          style={{ width: `${progress}%` }}
        />

        {/* Keyframe markers */}
        {keyframes.map((kfTime, index) => {
          const kfPercent = duration > 0 ? (kfTime / duration) * 100 : 0;
          return (
            <div
              key={index}
              className="absolute top-0 w-2 h-full bg-yellow-500 cursor-move hover:bg-yellow-400 transition-colors"
              style={{ left: `${kfPercent}%`, marginLeft: "-4px" }}
              title={`Keyframe at ${formatTime(kfTime)} - Click to jump, drag to move`}
              onMouseDown={(e) => handleKeyframeMouseDown(e, kfTime)}
            />
          );
        })}

        {/* Time markers */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          {Array.from({ length: 11 }, (_, i) => i / 10).map((fraction) => (
            <div
              key={fraction}
              className="h-2 w-px bg-gray-400 dark:bg-gray-500"
            />
          ))}
        </div>

        {/* Scrubber */}
        <div
          className="absolute top-0 w-0.5 h-full bg-red-600 pointer-events-none"
          style={{ left: `${progress}%` }}
        >
          {/* Scrubber handle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-lg" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-lg" />
        </div>
      </div>

      {/* Time ticks */}
      <div className="relative mt-1 h-4">
        {Array.from({ length: 11 }, (_, i) => {
          const time = (duration * i) / 10;
          return (
            <div
              key={i}
              className="absolute text-xs text-gray-500 dark:text-gray-400 transform -translate-x-1/2"
              style={{ left: `${(i / 10) * 100}%` }}
            >
              {formatTime(time)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
