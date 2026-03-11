"use client";

import lottie, { type AnimationItem } from "lottie-web";
import { useEffect, useRef } from "react";

export default function LottieIcon({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    animationRef.current?.destroy();
    animationRef.current = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path,
      rendererSettings: {
        progressiveLoad: true,
        preserveAspectRatio: "xMidYMid meet",
      },
    });

    return () => {
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, [path]);

  return <div ref={containerRef} className={"overflow-visible " + (className ?? "")} />;
}
