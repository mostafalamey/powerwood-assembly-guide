import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Play, Pause, Camera, Trash2, Circle, Info } from "lucide-react";

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
  onKeyframeDuplicate?: (sourceTime: number, newTime: number) => void;
  onKeyframeDeselect?: () => void;
  selectedKeyframeTime?: number | null;
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
  onKeyframeDuplicate,
  onKeyframeDeselect,
  selectedKeyframeTime = null,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingKeyframe, setDraggingKeyframe] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [scrubStartX, setScrubStartX] = useState(0);
  const [scrubHasMoved, setScrubHasMoved] = useState(false);
  const [isDuplicateDrag, setIsDuplicateDrag] = useState(false);
  const [duplicateOriginTime, setDuplicateOriginTime] = useState<number | null>(
    null,
  );
  const [hasCreatedDuplicate, setHasCreatedDuplicate] = useState(false);

  const sortedKeyframes = useMemo(() => {
    if (!keyframes.length) return [];
    return Array.from(new Set(keyframes)).sort((a, b) => a - b);
  }, [keyframes]);

  const timeFractions = useMemo(
    () => Array.from({ length: 11 }, (_, i) => i / 10),
    [],
  );

  const findNearestKeyframe = useCallback(
    (time: number) => {
      if (sortedKeyframes.length === 0) return null;
      let lo = 0;
      let hi = sortedKeyframes.length - 1;

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const value = sortedKeyframes[mid];
        if (value === time) return value;
        if (value < time) lo = mid + 1;
        else hi = mid - 1;
      }

      const leftIndex = Math.max(0, hi);
      const rightIndex = Math.min(sortedKeyframes.length - 1, lo);
      const left = sortedKeyframes[leftIndex];
      const right = sortedKeyframes[rightIndex];

      return Math.abs(left - time) <= Math.abs(right - time) ? left : right;
    },
    [sortedKeyframes],
  );

  const updateTimeFromMouse = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      let newTime = percentage * duration;

      // Snap to nearest keyframe if within threshold
      if (sortedKeyframes.length > 0) {
        const snapThreshold = 0.05; // Snap within 0.05 seconds
        const nearestKeyframe = findNearestKeyframe(newTime);

        if (
          nearestKeyframe !== null &&
          Math.abs(nearestKeyframe - newTime) <= snapThreshold
        ) {
          newTime = nearestKeyframe;
        }
      }

      // Snap to 0.01s precision
      newTime = Math.round(newTime * 100) / 100;

      onTimeChange(newTime);
    },
    [duration, findNearestKeyframe, onTimeChange, sortedKeyframes.length],
  );

  const getKeyframeTimeFromMouse = (e: MouseEvent) => {
    if (!timelineRef.current) return null;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    let newTime = percentage * duration;

    // Clamp to valid range
    newTime = Math.max(0, Math.min(newTime, duration));

    // Round to 2 decimal places
    newTime = Math.round(newTime * 100) / 100;

    return newTime;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setScrubStartX(e.clientX);
    setScrubHasMoved(false);
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
    setIsDuplicateDrag(e.shiftKey);
    setDuplicateOriginTime(e.shiftKey ? keyframeTime : null);
    setHasCreatedDuplicate(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingKeyframe !== null) {
      // Dragging a keyframe
      const movedDistance = Math.abs(e.clientX - dragStartX);
      if (movedDistance > 3) {
        setHasMoved(true);
        const newTime = getKeyframeTimeFromMouse(e);
        if (newTime === null || newTime === draggingKeyframe) return;
        if (isDuplicateDrag && onKeyframeDuplicate) {
          if (!hasCreatedDuplicate) {
            const sourceTime = duplicateOriginTime ?? draggingKeyframe;
            onKeyframeDuplicate(sourceTime, newTime);
            setDraggingKeyframe(newTime);
            setHasCreatedDuplicate(true);
          } else if (onKeyframeMoved) {
            onKeyframeMoved(draggingKeyframe, newTime);
            setDraggingKeyframe(newTime);
          }
        } else if (onKeyframeMoved) {
          onKeyframeMoved(draggingKeyframe, newTime);
          setDraggingKeyframe(newTime);
        }
      }
    } else if (isDragging) {
      // Dragging the scrubber
      const movedDistance = Math.abs(e.clientX - scrubStartX);
      if (movedDistance > 3 && !scrubHasMoved) {
        setScrubHasMoved(true);
      }
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
    } else if (draggingKeyframe === null && isDragging && !scrubHasMoved) {
      onKeyframeDeselect?.();
    }
    setIsDragging(false);
    setDraggingKeyframe(null);
    setHasMoved(false);
    setScrubHasMoved(false);
    setIsDuplicateDrag(false);
    setDuplicateOriginTime(null);
    setHasCreatedDuplicate(false);
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
  }, [isDragging, draggingKeyframe, handleMouseMove, handleMouseUp]);

  const formatTime = (seconds: number) => {
    const secs = Math.floor(seconds);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${secs}.${ms.toString().padStart(3, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-t border-white/50 dark:border-gray-700/50 p-2">
      {/* Controls */}
      <div className="flex items-center justify-between mb-2">
        {/* Left: Play button and time */}
        <div className="flex items-center gap-2">
          {/* Play/Pause button */}
          <button
            onClick={onPlayPause}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/30"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {/* Time display */}
          <div className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Center: Keyframe buttons */}
        <div className="flex items-center gap-1.5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-1.5 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          {/* Camera Record button */}
          <button
            onClick={onRecordCameraKeyframe}
            className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm"
            title="Record Camera Keyframe"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Camera Delete button */}
          <button
            onClick={onDeleteCameraKeyframe}
            disabled={!hasCameraKeyframeAtCurrentTime}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete Camera Keyframe"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Object Record button */}
          <button
            onClick={onRecordObjectKeyframe}
            disabled={!canRecordObjectKeyframe}
            className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title="Record Object Keyframe"
          >
            <Circle className="w-5 h-5" />
          </button>

          {/* Object Delete button */}
          <button
            onClick={onDeleteObjectKeyframe}
            disabled={!hasObjectKeyframeAtCurrentTime}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete Object Keyframe"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Duration input */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
            className="w-20 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">sec</span>
        </div>
      </div>

      {/* Timeline track */}
      <div
        ref={timelineRef}
        onMouseDown={handleMouseDown}
        className="relative h-10 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl cursor-pointer select-none shadow-inner border border-gray-200/50 dark:border-gray-600/50"
      >
        {sortedKeyframes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
            <Info className="w-4 h-4 mr-1" />
            No keyframes yet
          </div>
        )}
        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-l-xl pointer-events-none"
          style={{ width: `${progress}%` }}
        />

        {/* Keyframe markers */}
        {sortedKeyframes.map((kfTime) => {
          const kfPercent = duration > 0 ? (kfTime / duration) * 100 : 0;
          const isSelected = selectedKeyframeTime === kfTime;
          return (
            <div
              key={kfTime}
              className={`absolute top-0 w-2 h-full cursor-move transition-all duration-150 ${
                isSelected
                  ? "bg-gradient-to-b from-orange-400 to-orange-600 ring-2 ring-orange-300 shadow-lg"
                  : "bg-gradient-to-b from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 shadow-md"
              }`}
              style={{
                left: `${kfPercent}%`,
                marginLeft: "-4px",
                borderRadius: "3px",
              }}
              title={`Keyframe at ${formatTime(kfTime)} - Click to jump, drag to move`}
              onMouseDown={(e) => handleKeyframeMouseDown(e, kfTime)}
            />
          );
        })}

        {/* Time markers */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          {timeFractions.map((fraction) => (
            <div
              key={fraction}
              className="h-2 w-px bg-gray-300 dark:bg-gray-600"
            />
          ))}
        </div>

        {/* Scrubber */}
        <div
          className="absolute top-0 w-0.5 h-full bg-gradient-to-b from-red-500 to-rose-600 pointer-events-none shadow-lg"
          style={{ left: `${progress}%` }}
        >
          {/* Scrubber handle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3.5 h-3.5 bg-gradient-to-b from-red-500 to-rose-600 rounded-full border-2 border-white shadow-lg" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3.5 h-3.5 bg-gradient-to-b from-red-500 to-rose-600 rounded-full border-2 border-white shadow-lg" />
        </div>
      </div>

      {/* Time ticks */}
      <div className="relative mt-0.5 h-3">
        {timeFractions.map((fraction) => {
          const time = duration * fraction;
          return (
            <div
              key={fraction}
              className="absolute text-xs text-gray-500 dark:text-gray-400 transform -translate-x-1/2"
              style={{ left: `${fraction * 100}%` }}
            >
              {formatTime(time)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
