import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";

interface AudioPlayerProps {
  cabinetId: string;
  stepId: string;
  audioUrl?: { en?: string; ar?: string };
  autoPlay?: boolean;
  onEnded?: () => void;
  onPlayPause?: (isPlaying: boolean) => void;
}

export default function AudioPlayer({
  cabinetId,
  stepId,
  audioUrl,
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

  // Determine audio file path from step JSON
  const getAudioPath = () => {
    return locale === "ar" ? audioUrl?.ar : audioUrl?.en;
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

    if (!audioPath) {
      audio.pause();
      audio.src = "";
      setIsLoading(false);
      setHasError(true);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
      <audio ref={audioRef} preload="auto" />

      {hasError && (
        <div className="mb-2 rounded-md bg-gray-100 dark:bg-gray-800 p-2 text-center text-xs text-gray-500">
          {t("audioNotAvailable") ||
            "Audio narration not available for this step"}
        </div>
      )}

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
            <span className="material-symbols-rounded text-xl text-white">
              pause
            </span>
          ) : (
            <span className="material-symbols-rounded text-xl text-white ml-0.5">
              play_arrow
            </span>
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
              <span className="material-symbols-rounded text-xl text-gray-600 dark:text-gray-400">
                volume_off
              </span>
            ) : volume < 0.5 ? (
              <span className="material-symbols-rounded text-xl text-gray-600 dark:text-gray-400">
                volume_down
              </span>
            ) : (
              <span className="material-symbols-rounded text-xl text-gray-600 dark:text-gray-400">
                volume_up
              </span>
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
