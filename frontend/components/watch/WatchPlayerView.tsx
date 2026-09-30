"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Download,
  Lightbulb,
  RotateCcw,
  Server,
  Star,
  Tv,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Film,
  Sparkles,
  ExternalLink,
  Maximize,
  Minimize,
  FastForward,
  Rewind,
  Play,
  Pause,
  Keyboard,
  Volume2,
  VolumeX,
  HelpCircle,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { MovieItem, SeriesSeason, SeriesEpisode } from "@/lib/types";
import { getImageUrl, formatRating, formatDuration } from "@/lib/utils";
import { MovieCard } from "@/components/movies/MovieCard";
import { getWatchServers, WatchServerItem } from "@/lib/api";
import { LazyImage } from "@/components/ui/LazyImage";

interface WatchPlayerViewProps {
  item: MovieItem;
  initialSeason?: number;
  initialEpisode?: number;
  related?: MovieItem[];
}

function formatTimestamp(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h > 0) {
    return `${h}:${remM < 10 ? "0" : ""}${remM}:${s < 10 ? "0" : ""}${s}`;
  }
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function WatchPlayerView({
  item,
  initialSeason = 1,
  initialEpisode = 1,
  related = [],
}: WatchPlayerViewProps) {
  const isSeries = item.type === "SERIES";
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [selectedServer, setSelectedServer] = useState<string>("server-1");
  const [backendServers, setBackendServers] = useState<WatchServerItem[]>([]);
  const [loadingServers, setLoadingServers] = useState<boolean>(true);
  const [noServersAvailable, setNoServersAvailable] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<MovieItem[]>(related || []);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

  const playerBoxRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Synchronize fullscreen state across native Fullscreen API and browser events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastPlaybackTimeRef = useRef<number>(0);
  const [hudNotice, setHudNotice] = useState<{
    text: string;
    icon: "forward" | "backward" | "play" | "pause" | "fullscreen" | "mute" | "next" | "prev";
  } | null>(null);
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const showHud = useCallback(
    (
      text: string,
      icon: "forward" | "backward" | "play" | "pause" | "fullscreen" | "mute" | "next" | "prev"
    ) => {
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
      setHudNotice({ text, icon });
      hudTimerRef.current = setTimeout(() => {
        setHudNotice(null);
      }, 1500);
    },
    []
  );

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isFullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const toggleFullscreen = async () => {
    const el = playerBoxRef.current;
    if (!el) return;

    const isCurrentlyFs = Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement ||
      isFullscreen
    );

    if (!isCurrentlyFs) {
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        } else if ((el as any).mozRequestFullScreen) {
          (el as any).mozRequestFullScreen();
        } else if ((el as any).msRequestFullscreen) {
          (el as any).msRequestFullscreen();
        } else {
          setIsFullscreen(true);
        }
      } catch (err) {
        console.warn("Native fullscreen request failed, falling back to CSS fullscreen:", err);
        setIsFullscreen(true);
      }
    } else {
      try {
        if (
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement
        ) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen();
          } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
          }
        }
      } catch (err) {
        console.warn("Exit native fullscreen failed:", err);
      }
      setIsFullscreen(false);
    }
  };

  const cleanTmdbId = String(item.tmdbId || item.id || "").trim();

  // Custom streams from DB if available
  const dbCustomSources = item.streamSources || [];

  // Determine current active episode details if series
  const activeSeasonData: SeriesSeason | undefined = useMemo(() => {
    if (!isSeries || !item.seasons || item.seasons.length === 0) return undefined;
    return (
      item.seasons.find((s) => (s.seasonNumber ?? s.seasonNum) === season) ||
      item.seasons[0]
    );
  }, [isSeries, item.seasons, season]);

  const episodesList: SeriesEpisode[] = useMemo(() => {
    if (!activeSeasonData) return [];
    return activeSeasonData.episodes || [];
  }, [activeSeasonData]);

  const activeEpisodeObj = useMemo(() => {
    if (!isSeries || episodesList.length === 0) return undefined;
    return (
      episodesList.find((ep) => (ep.episodeNumber ?? ep.episodeNum) === episode) ||
      episodesList[0]
    );
  }, [isSeries, episodesList, episode]);

  // Fetch and verify live working servers from backend API
  useEffect(() => {
    let isCancelled = false;
    const fetchServers = async () => {
      setLoadingServers(true);
      try {
        const res = await getWatchServers({
          tmdbId: cleanTmdbId,
          type: item.type,
          season: isSeries ? season : undefined,
          episode: isSeries ? episode : undefined,
          slug: item.slug,
        });

        if (isCancelled) return;

        if (res && res.servers && res.servers.length > 0) {
          setBackendServers(res.servers);
          setNoServersAvailable(false);
          // If currently selected server is not in the working servers list, select the first available server
          setSelectedServer((curr) => {
            const exists = res.servers.some((s) => s.id === curr);
            return exists ? curr : res.servers[0].id;
          });
          if (res.categoryRecommendations && res.categoryRecommendations.length > 0) {
            setRecommendations(res.categoryRecommendations);
          }
        } else {
          setBackendServers([]);
          setNoServersAvailable(true);
          if (res?.categoryRecommendations && res.categoryRecommendations.length > 0) {
            setRecommendations(res.categoryRecommendations);
          }
        }
      } catch (err) {
        console.warn("Failed to load servers from backend:", err);
        if (!isCancelled) {
          setBackendServers([]);
          setNoServersAvailable(true);
        }
      } finally {
        if (!isCancelled) {
          setLoadingServers(false);
        }
      }
    };

    if (cleanTmdbId) {
      fetchServers();
    }
    return () => {
      isCancelled = true;
    };
  }, [cleanTmdbId, item.type, item.slug, isSeries, season, episode]);

  // Load saved resume timestamp on mount / episode change
  useEffect(() => {
    try {
      const storageKey = `resume_${item.slug || item.id}_s${isSeries ? season : 1}_e${isSeries ? episode : 1}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 5) {
          lastPlaybackTimeRef.current = parsed;
        }
      }
    } catch {}
  }, [item.slug, item.id, isSeries, season, episode]);

  // Live timestamp tracking via postMessage events from embed player
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === "string" && (data.startsWith("{") || data.startsWith("["))) {
          try {
            data = JSON.parse(data);
          } catch {}
        }
        if (!data || typeof data !== "object") return;

        const time =
          data.currentTime ??
          data.time ??
          data.seconds ??
          data.data?.currentTime ??
          data.data?.seconds ??
          data.data?.time;

        if (typeof time === "number" && !isNaN(time) && time > 0) {
          lastPlaybackTimeRef.current = Math.floor(time);
          try {
            const storageKey = `resume_${item.slug || item.id}_s${isSeries ? season : 1}_e${isSeries ? episode : 1}`;
            localStorage.setItem(storageKey, String(Math.floor(time)));
          } catch {}
        }
      } catch {}
    };

    window.addEventListener("message", handleWindowMessage);
    return () => window.removeEventListener("message", handleWindowMessage);
  }, [item.slug, item.id, isSeries, season, episode]);

  // Heartbeat playback progress tracker as reliable fallback
  useEffect(() => {
    const interval = setInterval(() => {
      lastPlaybackTimeRef.current += 1;
      try {
        const storageKey = `resume_${item.slug || item.id}_s${isSeries ? season : 1}_e${isSeries ? episode : 1}`;
        localStorage.setItem(storageKey, String(Math.floor(lastPlaybackTimeRef.current)));
      } catch {}
    }, 1000);

    return () => clearInterval(interval);
  }, [item.slug, item.id, isSeries, season, episode]);

  // Handle switching server while preserving exact playback timestamp
  const handleSelectServer = (srvId: string) => {
    if (srvId === selectedServer) return;
    const resumeSec = Math.floor(lastPlaybackTimeRef.current || 0);
    const storageKey = `resume_${item.slug || item.id}_s${isSeries ? season : 1}_e${isSeries ? episode : 1}`;
    if (resumeSec > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, String(resumeSec));
      } catch {}
    }
    setSelectedServer(srvId);
    setIframeKey((k) => k + 1);

    const targetSrv = backendServers.find((s) => s.id === srvId);
    const srvName = targetSrv?.name || "Server";

    if (resumeSec > 0) {
      showHud(`Switched to ${srvName} • Resuming at ${formatTimestamp(resumeSec)}`, "forward");
    } else {
      showHud(`Switched to ${srvName}`, "forward");
    }
  };

  // On iframe load, send multiple postMessage seek commands to guarantee resuming
  const handleIframeLoad = () => {
    const resumeSec = Math.floor(lastPlaybackTimeRef.current || 0);
    if (resumeSec > 3) {
      showHud(`Resuming from ${formatTimestamp(resumeSec)}`, "forward");
      [500, 1200, 2500, 4000].forEach((delay) => {
        setTimeout(() => {
          const cw = iframeRef.current?.contentWindow;
          if (cw) {
            try {
              cw.postMessage({ type: "SEEK", time: resumeSec, offset: resumeSec }, "*");
              cw.postMessage({ type: "seek", value: resumeSec }, "*");
              cw.postMessage({ action: "seek", value: resumeSec }, "*");
              cw.postMessage({ event: "seek", val: resumeSec }, "*");
              cw.postMessage(JSON.stringify({ event: "command", func: "seekTo", args: [resumeSec, true] }), "*");
              cw.postMessage({ command: "seek", arg: resumeSec }, "*");
            } catch {}
          }
        }, delay);
      });
    }
  };

  // Build current iframe stream URL with start timestamp attached
  const streamUrl = useMemo(() => {
    if (!cleanTmdbId || backendServers.length === 0) return "";
    const active = backendServers.find((s) => s.id === selectedServer) || backendServers[0];
    if (!active || !active.url) return "";

    const startSec = Math.floor(lastPlaybackTimeRef.current || 0);
    const rawUrl = active.url;

    if (startSec > 3) {
      const sep = rawUrl.includes("?") ? "&" : "?";
      return `${rawUrl}${sep}start=${startSec}&t=${startSec}&time=${startSec}#t=${startSec}`;
    }
    return rawUrl;
  }, [cleanTmdbId, backendServers, selectedServer, iframeKey]);


  // Single unified download URL exclusively using 02moviedownloader.top
  const downloadUrl = useMemo(() => {
    const idParam = cleanTmdbId || item.imdbId || String(item.id);
    if (isSeries) {
      return `https://02moviedownloader.top/api/download/tv/${idParam}/${season}/${episode}`;
    }
    return `https://02moviedownloader.top/api/download/movie/${idParam}`;
  }, [cleanTmdbId, item.imdbId, item.id, isSeries, season, episode]);

  // Save to watch history
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem("watch_history") || "[]";
      const history = JSON.parse(historyStr);
      const filtered = Array.isArray(history) ? history.filter((x: any) => x.slug !== item.slug) : [];
      filtered.unshift({
        id: cleanTmdbId || item.id,
        title: item.title,
        slug: item.slug,
        poster: item.posterPath || (item as any).poster || "",
        posterPath: item.posterPath || (item as any).poster || "",
        type: item.type,
        season: isSeries ? season : undefined,
        episode: isSeries ? episode : undefined,
        timestamp: Date.now(),
      });
      localStorage.setItem("watch_history", JSON.stringify(filtered.slice(0, 20)));
    } catch {}
  }, [cleanTmdbId, item.id, item.title, item.slug, item.posterPath, item.type, isSeries, season, episode]);

  // Episode navigation helpers
  const handlePrevEpisode = useCallback(() => {
    if (!isSeries || episodesList.length === 0) return;
    const currentIndex = episodesList.findIndex((ep) => (ep.episodeNumber ?? ep.episodeNum) === episode);
    if (currentIndex > 0) {
      const prevEp = episodesList[currentIndex - 1];
      setEpisode(prevEp.episodeNumber ?? prevEp.episodeNum ?? 1);
      lastPlaybackTimeRef.current = 0;
      setIframeKey((k) => k + 1);
    }
  }, [isSeries, episodesList, episode]);

  const handleNextEpisode = useCallback(() => {
    if (!isSeries || episodesList.length === 0) return;
    const currentIndex = episodesList.findIndex((ep) => (ep.episodeNumber ?? ep.episodeNum) === episode);
    if (currentIndex >= 0 && currentIndex < episodesList.length - 1) {
      const nextEp = episodesList[currentIndex + 1];
      setEpisode(nextEp.episodeNumber ?? nextEp.episodeNum ?? 1);
      lastPlaybackTimeRef.current = 0;
      setIframeKey((k) => k + 1);
    }
  }, [isSeries, episodesList, episode]);

  // Skipping actions (Normal and Fullscreen)
  const handleSkip = useCallback(
    (seconds: number) => {
      playerBoxRef.current?.focus();
      lastPlaybackTimeRef.current = Math.max(0, lastPlaybackTimeRef.current + seconds);

      // Direct HTML5 video tag seek if present
      const video = playerBoxRef.current?.querySelector("video");
      if (video) {
        video.currentTime = Math.max(0, video.currentTime + seconds);
      }

      // Cross-origin postMessage seek
      if (iframeRef.current?.contentWindow) {
        const cw = iframeRef.current.contentWindow;
        try {
          cw.postMessage({ type: "SEEK", offset: seconds }, "*");
          cw.postMessage({ type: seconds > 0 ? "FORWARD" : "BACKWARD", seconds: Math.abs(seconds) }, "*");
          cw.postMessage({ action: seconds > 0 ? "forward" : "rewind", value: Math.abs(seconds) }, "*");
          cw.postMessage({ event: seconds > 0 ? "forward" : "rewind", val: Math.abs(seconds) }, "*");
          cw.postMessage(JSON.stringify({ event: "command", func: seconds > 0 ? "forward" : "rewind", args: [Math.abs(seconds)] }), "*");
          cw.postMessage({ command: seconds > 0 ? "forward" : "rewind", arg: Math.abs(seconds) }, "*");
          cw.postMessage({ method: seconds > 0 ? "forward" : "rewind", value: Math.abs(seconds) }, "*");
        } catch {}
      }

      if (seconds > 0) {
        showHud(`+${seconds}s Skip Forward`, "forward");
      } else {
        showHud(`${seconds}s Skip Backward`, "backward");
      }
    },
    [showHud]
  );

  const handleTogglePlay = useCallback(() => {
    playerBoxRef.current?.focus();

    const video = playerBoxRef.current?.querySelector("video");
    if (video) {
      if (video.paused) {
        video.play();
        showHud("Playing", "play");
      } else {
        video.pause();
        showHud("Paused", "pause");
      }
      return;
    }

    if (iframeRef.current?.contentWindow) {
      const cw = iframeRef.current.contentWindow;
      try {
        cw.postMessage({ type: "TOGGLE_PLAY" }, "*");
        cw.postMessage({ type: "PLAY_PAUSE" }, "*");
        cw.postMessage({ action: "play_pause" }, "*");
        cw.postMessage({ event: "play_pause" }, "*");
        cw.postMessage(JSON.stringify({ event: "command", func: "togglePlay" }), "*");
        showHud("Play / Pause", "play");
      } catch {}
    }
  }, [showHud]);

  const handleToggleMute = useCallback(() => {
    playerBoxRef.current?.focus();
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    const video = playerBoxRef.current?.querySelector("video");
    if (video) {
      video.muted = nextMute;
    }

    if (iframeRef.current?.contentWindow) {
      const cw = iframeRef.current.contentWindow;
      try {
        cw.postMessage({ type: "MUTE", value: nextMute }, "*");
        cw.postMessage({ type: "TOGGLE_MUTE" }, "*");
        cw.postMessage({ action: "mute", value: nextMute }, "*");
        cw.postMessage(JSON.stringify({ event: "command", func: nextMute ? "mute" : "unMute" }), "*");
      } catch {}
    }

    showHud(nextMute ? "Muted" : "Unmuted", "mute");
  }, [isMuted, showHud]);

  // Comprehensive keyboard shortcuts listener (Active in Normal & Fullscreen Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing inside an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // 1. Right Arrow or 'L': Skip Forward 10s (or 30s with Shift)
      if ((e.key === "ArrowRight" && !e.shiftKey) || e.key === "l" || e.key === "L") {
        e.preventDefault();
        handleSkip(10);
      } else if (e.key === "ArrowRight" && e.shiftKey) {
        e.preventDefault();
        handleSkip(30);
      }
      // 2. Left Arrow or 'J': Skip Backward 10s (or 30s with Shift)
      else if ((e.key === "ArrowLeft" && !e.shiftKey) || e.key === "j" || e.key === "J") {
        e.preventDefault();
        handleSkip(-10);
      } else if (e.key === "ArrowLeft" && e.shiftKey) {
        e.preventDefault();
        handleSkip(-30);
      }
      // 3. Space or 'K': Toggle Play / Pause
      else if (e.key === " " || e.key === "k" || e.key === "K") {
        e.preventDefault();
        handleTogglePlay();
      }
      // 4. 'F': Toggle Fullscreen
      else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
        showHud(isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode", "fullscreen");
      }
      // 5. 'M': Toggle Mute
      else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        handleToggleMute();
      }
      // 6. 'N': Next Episode (Series)
      else if ((e.key === "n" || e.key === "N") && isSeries) {
        e.preventDefault();
        handleNextEpisode();
        showHud("Next Episode", "next");
      }
      // 7. 'P': Previous Episode (Series)
      else if ((e.key === "p" || e.key === "P") && isSeries) {
        e.preventDefault();
        handlePrevEpisode();
        showHud("Previous Episode", "prev");
      }
      // 8. 'T': Theater Mode
      else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setTheaterMode((prev) => !prev);
      }
      // 9. 'R': Reload Player
      else if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIframeKey((k) => k + 1);
        showHud("Reloading Player...", "play");
      }
      // 10. '?' or 'H': Shortcuts Help Modal
      else if (e.key === "?" || e.key === "h" || e.key === "H") {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }
      // 11. Escape: Exit fullscreen or close modal
      else if (e.key === "Escape") {
        if (showShortcutsModal) {
          setShowShortcutsModal(false);
        } else if (isFullscreen) {
          if (document.fullscreenElement) {
            try {
              document.exitFullscreen?.();
            } catch {}
          }
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFullscreen,
    isSeries,
    showShortcutsModal,
    handleSkip,
    handleTogglePlay,
    handleToggleMute,
    toggleFullscreen,
    handleNextEpisode,
    handlePrevEpisode,
    showHud,
  ]);

  const detailsHref = isSeries ? `/series/${item.slug}` : `/movie/${item.slug}`;

  return (
    <div className="relative min-h-screen bg-[#08080c] text-white">
      {/* Theater Dimmer Overlay */}
      {theaterMode && (
        <div
          onClick={() => setTheaterMode(false)}
          className="fixed inset-0 bg-black/95 z-40 transition-opacity duration-300 cursor-pointer"
          title="Click to exit theater mode"
        />
      )}

      <div className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* 1. TOP RETURN & ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <Link
            href={detailsHref}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141420] hover:bg-[#1f1f32] text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#e50914]" />
            <span>Back to Details</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheaterMode(!theaterMode)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                theaterMode
                  ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20"
                  : "bg-[#141420] hover:bg-[#1f1f32] text-slate-300 hover:text-white border border-white/10"
              }`}
              title="Dim surrounding page lights"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{theaterMode ? "Lights On" : "Theater Mode"}</span>
            </button>

            {/* FULL SCREEN TOGGLE BUTTON */}
            <button
              onClick={toggleFullscreen}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isFullscreen
                  ? "bg-[#e50914] text-white border-red-500 shadow-md shadow-red-600/30"
                  : "bg-[#141420] hover:bg-[#1f1f32] text-slate-300 hover:text-white border border-white/10"
              }`}
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen Video"}
            >
              {isFullscreen ? (
                <Minimize className="w-3.5 h-3.5 text-white" />
              ) : (
                <Maximize className="w-3.5 h-3.5 text-[#e50914]" />
              )}
              <span>{isFullscreen ? "Exit Fullscreen" : "Full Screen"}</span>
            </button>

            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#141420] hover:bg-[#1f1f32] text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              title="Reload video player"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reload</span>
            </button>

            {/* SINGLE DOWNLOAD BUTTON */}
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>

        {/* 2. 16:9 CINEMA VIDEO PLAYER BOX */}
        <div
          ref={playerBoxRef}
          tabIndex={0}
          className={`relative overflow-hidden bg-black transition-all duration-300 outline-none select-none ${
            isFullscreen
              ? "!fixed !inset-0 !z-[99999] !w-screen !h-screen !rounded-none !border-0 !m-0 !p-0 flex items-center justify-center bg-black"
              : `rounded-2xl border border-white/10 shadow-2xl ${
                  theaterMode ? "z-50 ring-2 ring-red-600/50 shadow-red-950/80" : ""
                }`
          }`}
        >
          {/* Subtle Exit Fullscreen Button in fullscreen */}
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-50 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-semibold border border-white/20 backdrop-blur-md shadow-2xl transition-all cursor-pointer"
              title="Exit Full Screen (Esc / F)"
            >
              <Minimize className="w-4 h-4 text-[#e50914]" />
              <span>Exit Fullscreen</span>
            </button>
          )}

          <div
            className={`relative w-full bg-[#050508] ${
              isFullscreen ? "!h-full !w-full !pb-0 flex items-center justify-center" : "pb-[56.25%]"
            }`}
          >
            {noServersAvailable && !loadingServers ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#141426] via-[#0d0d17] to-[#07070b]">
                <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-xl mb-3.5">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wide text-white mb-1.5">
                  Sorry, Currently Not Have This Content
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5">
                  We could not find an active streaming server for this title right now. Please explore other top-rated recommendations in this category below.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#watch-other-section"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                  >
                    <Film className="w-4 h-4" />
                    <span>Watch Other Titles in this Category</span>
                  </a>
                  <button
                    onClick={() => {
                      setLoadingServers(true);
                      setIframeKey((k) => k + 1);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retry Servers</span>
                  </button>
                </div>
              </div>
            ) : streamUrl ? (
              <iframe
                ref={iframeRef}
                key={iframeKey}
                src={streamUrl}
                onLoad={handleIframeLoad}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen *"
                allowFullScreen={true}
                // @ts-ignore
                webkitallowfullscreen="true"
                // @ts-ignore
                mozallowfullscreen="true"
                className={`w-full h-full border-0 ${
                  isFullscreen ? "h-full w-full" : "absolute inset-0"
                }`}
              />
            ) : loadingServers ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#e50914]" />
                <span className="font-semibold text-slate-300">Connecting to best verified streaming server...</span>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                <span>No streaming URL available for this title.</span>
              </div>
            )}
          </div>
        </div>

        {/* INTERACTIVE KEYBOARD SHORTCUTS BAR (NORMAL MODE) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-[#11111a] border border-white/10 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-6 h-6 rounded-lg bg-[#e50914]/20 border border-[#e50914]/30 flex items-center justify-center text-[#e50914]">
              <Keyboard className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Keyboard Controls:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <button
              onClick={() => handleSkip(-10)}
              className="px-2 py-0.5 rounded-md bg-[#181826] hover:bg-[#222236] border border-white/10 text-slate-300 hover:text-white font-mono transition-all cursor-pointer"
              title="Skip 10s backward (Left Arrow or J)"
            >
              <span className="text-[#e50914] font-bold">←</span> / <span className="font-bold">J</span> (-10s)
            </button>
            <button
              onClick={() => handleSkip(10)}
              className="px-2 py-0.5 rounded-md bg-[#181826] hover:bg-[#222236] border border-white/10 text-slate-300 hover:text-white font-mono transition-all cursor-pointer"
              title="Skip 10s forward (Right Arrow or L)"
            >
              <span className="text-[#e50914] font-bold">→</span> / <span className="font-bold">L</span> (+10s)
            </button>
            <button
              onClick={handleTogglePlay}
              className="px-2 py-0.5 rounded-md bg-[#181826] hover:bg-[#222236] border border-white/10 text-slate-300 hover:text-white font-mono transition-all cursor-pointer"
              title="Play / Pause (Space or K)"
            >
              <span className="font-bold">Space</span> Play/Pause
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-2 py-0.5 rounded-md bg-[#181826] hover:bg-[#222236] border border-white/10 text-slate-300 hover:text-white font-mono transition-all cursor-pointer"
              title="Toggle Fullscreen (F)"
            >
              <span className="font-bold text-[#e50914]">F</span> Fullscreen
            </button>
            <button
              onClick={handleToggleMute}
              className="px-2 py-0.5 rounded-md bg-[#181826] hover:bg-[#222236] border border-white/10 text-slate-300 hover:text-white font-mono transition-all cursor-pointer"
              title="Mute / Unmute (M)"
            >
              <span className="font-bold">M</span> Mute
            </button>
            {isSeries && (
              <>
                <button
                  onClick={handlePrevEpisode}
                  className="px-2 py-0.5 rounded-md bg-[#181826] hover:bg-[#222236] border border-white/10 text-slate-300 hover:text-white font-mono transition-all cursor-pointer"
                  title="Previous Episode (P)"
                >
                  <span className="font-bold">P</span> Prev Ep
                </button>
                <button
                  onClick={handleNextEpisode}
                  className="px-2 py-0.5 rounded-md bg-[#181826] hover:bg-[#222236] border border-white/10 text-slate-300 hover:text-white font-mono transition-all cursor-pointer"
                  title="Next Episode (N)"
                >
                  <span className="font-bold">N</span> Next Ep
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setShowShortcutsModal(true)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Shortcuts Guide</span>
          </button>
        </div>

        {/* 3. PLAYER TITLE & QUICK CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
              {item.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              {isSeries && (
                <span className="px-2 py-0.5 rounded-md bg-[#e50914]/20 border border-[#e50914]/30 text-[#e50914] font-bold">
                  Season {season} &bull; Episode {episode}
                  {activeEpisodeObj?.title ? `: ${activeEpisodeObj.title}` : ""}
                </span>
              )}
              {item.imdbRating && (
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {formatRating(item.imdbRating)} IMDb
                </span>
              )}
              {item.releaseYear && <span>{item.releaseYear}</span>}
              <span className="text-slate-500">&bull;</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Ultra-HD Fast Cloud Stream
              </span>
            </div>
          </div>

          {/* Series Episode Quick Stepper & Single Download Button */}
          <div className="flex items-center gap-3">
            {isSeries && (
              <div className="inline-flex items-center gap-1 bg-[#141420] p-1 rounded-xl border border-white/10">
                <button
                  onClick={handlePrevEpisode}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Previous Episode"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-semibold text-slate-300 whitespace-nowrap">
                  Ep {episode}
                </span>
                <button
                  onClick={handleNextEpisode}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Next Episode"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* PRIMARY SINGLE DOWNLOAD BUTTON */}
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e50914] to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/40 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download in HD / 4K</span>
            </a>
          </div>
        </div>

        {/* 4. MULTI-SERVER SELECTION HUB */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#11111a] border border-white/10 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#e50914]/20 border border-[#e50914]/30 flex items-center justify-center text-[#e50914]">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-display">
                    Streaming Servers
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                    {backendServers.length} Online &amp; Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Switch server if video buffers or stops.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Timestamp Auto-Resume Active</span>
            </div>
          </div>

          {/* Loading Skeletons while checking backend servers */}
          {loadingServers && backendServers.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#141422] border border-white/5 space-y-2 skeleton-shimmer"
                >
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                  <div className="h-4 w-3/4 bg-white/15 rounded" />
                  <div className="h-3 w-1/3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : noServersAvailable && backendServers.length === 0 ? (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-center space-y-1">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wide">
                No active streaming servers found for this title
              </p>
              <p className="text-[11px] text-slate-400">
                Please try other recommendations in this category below.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {backendServers.map((srv, idx) => {
                const isActive = selectedServer === srv.id;
                return (
                  <button
                    key={srv.id || idx}
                    onClick={() => handleSelectServer(srv.id)}
                    className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between gap-2.5 ${
                      isActive
                        ? "bg-gradient-to-br from-[#1e1015] via-[#2a0e16] to-[#171220] border-red-500 shadow-lg shadow-red-950/60 ring-1 ring-red-500/40 scale-[1.02]"
                        : "bg-[#131320] hover:bg-[#1a1a2c] text-slate-300 hover:text-white border-white/10 hover:border-white/25 hover:scale-[1.01]"
                    }`}
                  >
                    {/* Top Row: Status Dot & Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {isActive ? (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        ) : (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: srv.color || "#3b82f6" }}
                          />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {isActive ? "Streaming" : "Ready"}
                        </span>
                      </div>

                      {isActive && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#e50914] text-white shadow-sm">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Middle: Prominent Standard Server Name */}
                    <div>
                      <div className="font-display font-extrabold text-sm sm:text-base text-white tracking-wide group-hover:text-red-400 transition-colors">
                        {srv.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium truncate">
                        {srv.tag}
                      </div>
                    </div>

                    {/* Bottom: Quality Tag */}
                    <div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                        {srv.quality || "HD"}
                      </span>
                      {isActive && (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Connected</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. VISUAL SEASON & EPISODE SELECTOR (FOR SERIES) */}
        {isSeries && item.seasons && item.seasons.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#11111a] border border-white/10 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              <Tv className="w-4 h-4 text-[#e50914]" />
              <span>Select Season &amp; Episode</span>
            </div>

            {/* Season Tabs */}
            {item.seasons.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {item.seasons.map((sObj) => {
                  const sNum = sObj.seasonNumber ?? sObj.seasonNum ?? 1;
                  const isCurrentSeason = season === sNum;
                  return (
                    <button
                      key={sObj.id || sNum}
                      onClick={() => {
                        setSeason(sNum);
                        setEpisode(1);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isCurrentSeason
                          ? "bg-[#e50914] text-white shadow-md shadow-red-600/30"
                          : "bg-[#161626] hover:bg-[#202035] text-slate-300 hover:text-white border border-white/10"
                      }`}
                    >
                      Season {sNum}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Episode Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {episodesList.map((ep) => {
                const epNum = ep.episodeNumber ?? ep.episodeNum ?? 1;
                const isCurrentEp = episode === epNum;
                return (
                  <button
                    key={ep.id || epNum}
                    onClick={() => setEpisode(epNum)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isCurrentEp
                        ? "bg-[#e50914]/20 border-[#e50914] shadow-md shadow-red-950/40 scale-[1.01]"
                        : "bg-[#141420] hover:bg-[#1e1e30] border-white/5 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#e50914]">
                        Episode {epNum}
                      </span>
                      {ep.duration && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {ep.duration}m
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-white line-clamp-1">
                      {ep.title || `Episode ${epNum}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. SINGLE UNIFIED DOWNLOAD CARD */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#11111e] via-[#151528] to-[#11111e] border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              <h3 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-wide">
                High-Speed Cloud Downloader
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Verified high-speed downloads powered exclusively by 2moviedownloader.top. Supports 1080p, 720p, 480p, and subtitle downloads with IDM, 1DM &amp; ADM.
            </p>
          </div>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download Video (Cloud CDN)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

        {/* 7. WATCH OTHER TITLES / YOU MAY ALSO LIKE */}
        {((recommendations && recommendations.length > 0) || (related && related.length > 0)) && (
          <div id="watch-other-section" className="space-y-4 pt-6 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e50914]" />
                <h2 className="text-lg sm:text-xl font-display font-black text-white uppercase tracking-wide">
                  {noServersAvailable
                    ? `Watch Other ${isSeries ? "Web Series" : "Movies"} in this Category`
                    : "You May Also Like"}
                </h2>
              </div>
              <Link
                href={isSeries ? "/series" : "/movies"}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Browse All Titles &rarr;
              </Link>
            </div>

            {noServersAvailable && (
              <p className="text-xs text-amber-400 font-medium">
                Here are recommended titles with verified streaming servers available right now:
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {(recommendations && recommendations.length > 0 ? recommendations : related)
                .slice(0, 12)
                .map((rel) => (
                  <MovieCard key={rel.id} movie={rel} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* KEYBOARD SHORTCUTS GUIDE MODAL */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-[#11111a] border border-white/10 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#e50914]/20 border border-[#e50914]/40 flex items-center justify-center text-[#e50914]">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    Player Keyboard Controls
                  </h3>
                  <p className="text-xs text-slate-400">Available in both Normal &amp; Fullscreen mode</p>
                </div>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Rewind 10 Seconds</span>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono text-[#e50914] font-bold">← / J</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Forward 10 Seconds</span>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono text-[#e50914] font-bold">→ / L</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Play / Pause</span>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono text-white font-bold">Space / K</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Toggle Fullscreen</span>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono text-[#e50914] font-bold">F</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Mute / Unmute</span>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono text-white font-bold">M</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Reload Player</span>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono text-white font-bold">R</span>
              </div>
              {isSeries && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-300">Next / Prev Episode</span>
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono text-[#e50914] font-bold">N / P</span>
                </div>
              )}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Close Dialog / Exit</span>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono text-white font-bold">Esc</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
