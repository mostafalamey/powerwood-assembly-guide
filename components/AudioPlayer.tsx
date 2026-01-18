import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";

interface AudioPlayerProps {
  cabinetId: string;
  stepId: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onPlayPause?: (isPlaying: boolean) => void;
}

export default function AudioPlayer({
  cabinetId,
  stepId,
  autoPlay = false,
  onEnded,
  onPlayPause,
}: AudioPlayerProps) {
  const { t, locale } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Determine audio file path based on cabinet category
  const getAudioPath = () => {
    // Extract category from cabinet ID (e.g., "BC-002" -> "BaseCabinets")
    const prefix = cabinetId.split("-")[0];
    let category = "";

    switch (prefix) {
      case "BC":
        category = "BaseCabinets";
        break;
      case "WC":
        category = "WallCabinets";
        break;
      case "HC":
        category = "HighCabinets";
        break;
      case "TC":
        category = "TallCabinets";
        break;
      case "CB":
        category = "CornerBase";
        break;
      case "CW":
        category = "CornerWall";
        break;
      case "FL":
        category = "Fillers";
        break;
      default:
        category = "BaseCabinets";
    }

    // Format: BC-002 -> BC_002
    const formattedId = cabinetId.replace("-", "_");

    // Language code: 'en' -> 'eng', 'ar' -> 'arb'
    const langCode = locale === "ar" ? "arb" : "eng";

    return `/audio/${langCode}/${category}/${formattedId}/step${stepId}.mp3`;
  };

  // Load new audio when step or language changes
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const audioPath = getAudioPath();

    // Reset state
    setIsLoading(true);
    setHasError(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Load new audio
    audio.src = audioPath;
    audio.load();

    // Attempt autoplay if enabled (may fail on iOS without user interaction)
    if (autoPlay) {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            // Autoplay failed (likely iOS restriction)
            setIsPlaying(false);
          });
      }
    }
  }, [stepId, locale, autoPlay]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [onEnded]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (onPlayPause) {
        onPlayPause(false);
      }
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (onPlayPause) {
            onPlayPause(true);
          }
        })
        .catch((error) => {
          // Play failed silently
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (hasError) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center text-sm text-gray-500">
        {t("audioNotAvailable") ||
          "Audio narration not available for this step"}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
      <audio ref={audioRef} preload="auto" />

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isLoading
              ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
          aria-label={isPlaying ? t("pause") || "Pause" : t("play") || "Play"}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar & Time */}
        <div className="flex-1 min-w-0">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading}
            aria-label={t("audioProgress") || "Audio progress"}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: isLoading
                ? undefined
                : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    (currentTime / duration) * 100
                  }%, #e5e7eb ${
                    (currentTime / duration) * 100
                  }%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t("volume") || "Volume"}
          >
            {volume === 0 ? (
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : volume < 0.5 ? (
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 9v6h4l5 5V4l-5 5H7z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>

          {showVolumeSlider && (
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                aria-label={t("volumeSlider") || "Volume slider"}
                className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    volume * 100
                  }%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
