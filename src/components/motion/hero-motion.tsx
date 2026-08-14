"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

interface HeroMotionProps {
  children: ReactNode;
}

/**
 * Cinematic hero entrance: subtle, performance-optimized entrance that
 * preserves fast First Contentful Paint & Largest Contentful Paint (LCP).
 * Honors prefers-reduced-motion by keeping content in its natural state.
 */
export function HeroMotion({ children }: HeroMotionProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = scope.current;
      if (!el) return;

      const lines = el.querySelectorAll("[data-hero-line]");
      const fades = el.querySelectorAll("[data-hero-fade]");
      const visual = el.querySelector("[data-hero-visual]");
      const floatA = el.querySelector("[data-hero-float-a]");
      const floatB = el.querySelector("[data-hero-float-b]");

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      if (lines.length) {
        tl.from(lines, {
          y: 18,
          opacity: 0.4,
          duration: 0.5,
          stagger: 0.08,
          clearProps: "all",
        });
      }

      if (fades.length) {
        tl.from(
          fades,
          {
            y: 14,
            opacity: 0.3,
            duration: 0.4,
            stagger: 0.06,
            clearProps: "all",
          },
          "-=0.3"
        );
      }

      if (visual) {
        tl.from(
          visual,
          {
            y: 20,
            opacity: 0.6,
            duration: 0.6,
            clearProps: "all",
          },
          "-=0.4"
        );
      }

      // Gentle floating loop on the two detail cards
      if (floatA) {
        gsap.to(floatA, {
          y: -6,
          duration: 2.8,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 0.8,
        });
      }
      if (floatB) {
        gsap.to(floatB, {
          y: 6,
          duration: 3.2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 0.8,
        });
      }
    },
    { scope }
  );

  return (
    <div ref={scope} className="contents">
      {children}
    </div>
  );
}
