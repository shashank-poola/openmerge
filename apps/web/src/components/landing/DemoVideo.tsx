"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { VolumeHighIcon, VolumeOffIcon } from "@hugeicons/core-free-icons";

export function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.6] },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;

    // React does not keep the `muted` attribute in sync, so drive the element directly.
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted && video.paused) {
      void video.play().catch(() => undefined);
    }
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="block aspect-video w-full object-cover"
        autoPlay
        muted
        loop
        preload="metadata"
        playsInline
        aria-label="OpenMerge launch video"
      >
        <source src="/demo/openmerge-launch.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <button
        type="button"
        onClick={toggleSound}
        aria-label={isMuted ? "Turn sound on" : "Turn sound off"}
        aria-pressed={!isMuted}
        className="absolute bottom-4 right-4 inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-[#171717]/75 px-4 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-[#171717]/90"
      >
        <HugeiconsIcon icon={isMuted ? VolumeOffIcon : VolumeHighIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
        {isMuted ? "Sound on" : "Mute"}
      </button>
    </div>
  );
}
