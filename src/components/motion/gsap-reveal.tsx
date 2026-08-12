"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GsapRevealProps {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  /** Duration in seconds. Defaults to 0.7. */
  duration?: number;
}

/**
 * Fade + rise reveal fired once when the element scrolls into view.
 * Honors prefers-reduced-motion: skips the tween entirely (content stays visible).
 */
export function GsapReveal({
  children,
  className,
  y = 28,
  delay = 0,
  duration = 0.7,
}: GsapRevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = scope.current!;
      gsap.from(el, {
        opacity: 0,
        y,
        duration,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      });
    },
    { scope }
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

interface GsapGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

/**
 * Staggered container: children are selected with `[data-gsap-item]` and
 * revealed in sequence when the container enters the viewport.
 */
export function GsapGroup({ children, className, stagger = 0.09 }: GsapGroupProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = scope.current!;
      gsap.from(el.querySelectorAll("[data-gsap-item]"), {
        opacity: 0,
        y: 26,
        duration: 0.6,
        stagger,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 86%",
          once: true,
        },
      });
    },
    { scope }
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

interface GsapItemProps {
  children: ReactNode;
  className?: string;
}

/** Marker for children inside a GsapGroup. */
export function GsapItem({ children, className }: GsapItemProps) {
  return (
    <div data-gsap-item className={className}>
      {children}
    </div>
  );
}

interface GsapParallaxProps {
  children: ReactNode;
  className?: string;
  /** Vertical scroll speed factor. Positive moves slower than scroll, negative moves opposite. */
  speed?: number;
}

/**
 * Scroll-linked parallax. The element translates vertically as the page scrolls.
 * Disabled for reduced motion.
 */
export function GsapParallax({ children, className, speed = 0.12 }: GsapParallaxProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = scope.current!;
      gsap.to(el, {
        yPercent: -speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    },
    { scope }
  );

  return (
    <div ref={scope} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
