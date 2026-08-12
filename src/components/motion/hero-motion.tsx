"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

interface HeroMotionProps {
  children: ReactNode;
}

/**
 * Cinematic hero entrance: staggered rise of the text column and a gentle
 * drift-up of the visual composition, fired once on mount.
 * Honors prefers-reduced-motion by rendering content fully visible.
 */
export function HeroMotion({ children }: HeroMotionProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = scope.current!;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        el.querySelectorAll("[data-hero-line]"),
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }
      )
        .fromTo(
          el.querySelectorAll("[data-hero-fade]"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
          "-=0.55"
        )
        .fromTo(
          el.querySelector("[data-hero-visual]"),
          { opacity: 0, y: 48, rotate: 1 },
          { opacity: 1, y: 0, rotate: 0, duration: 1.1 },
          "-=0.7"
        );

      // Gentle floating loop on the two floating cards once entrance completes.
      gsap.to(el.querySelector("[data-hero-float-a]"), {
        y: -8,
        duration: 2.6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.6,
      });
      gsap.to(el.querySelector("[data-hero-float-b]"), {
        y: 8,
        duration: 3.1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.6,
      });
    },
    { scope }
  );

  return (
    <div ref={scope} className="contents">
      {children}
    </div>
  );
}
