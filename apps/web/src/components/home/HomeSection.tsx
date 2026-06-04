"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function HomeSection() {
  return (
    <section className="relative overflow-hidden min-h-[80vh] flex items-center justify-center px-4 bg-white pt-24">
      <div className="relative max-w-6xl mx-auto text-center">

        <h1
          className="text-5xl md:text-7xl lg:text-8xl mb-8 text-gray-950 leading-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          AI That Reviews Your
          <br />
          <span className="italic">Pull Requests</span> Before{" "}
          <span className="italic">Anyone Else.</span>
        </h1>

        <p
          className="text-lg md:text-xl mb-12 text-gray-500 max-w-2xl mx-auto"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
        >
          PullRabbit instantly reviews every PR you open — catching bugs,
          flagging bad patterns, and suggesting fixes. Powered by multi-agent AI.
        </p>

        <Button
          size="lg"
          onClick={() => signIn("github")}
          className="bg-gradient-to-t from-[#0700FF] to-[#5661F9] hover:opacity-90 text-white px-12 py-6 text-lg rounded-lg transition-opacity"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          Get Started
        </Button>

        <VideoOnView />
      </div>
    </section>
  );
}

function VideoOnView() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoEl) return;
        if (entry.isIntersecting) {
          try {
            videoEl.currentTime = 0;
            const playPromise = videoEl.play();
            if (playPromise && typeof (playPromise as any).then === "function") {
              (playPromise as Promise<void>).catch(() => {});
            }
          } catch {}
        } else {
          videoEl.pause();
          videoEl.currentTime = 0;
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-20 max-w-5xl mx-auto">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src="/demo.mp4"
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </div>
  );
}
