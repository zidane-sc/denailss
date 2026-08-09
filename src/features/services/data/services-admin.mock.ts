import type { Service } from "@/types";
import { SERVICES } from "./services.seed";

/**
 * Services admin store — mock-first seam standing in for the future `services`
 * repository (TRD §4). Consumers read the live catalog through
 * `getLiveServices()`, so owner edits (name, price, hero photo, FAQ, deposit
 * flag, active status) show up immediately across the public site, booking
 * flow, reviews, promotion rules, and backoffice dashboard.
 *
 * State persists to localStorage (`denailss.services.admin`); the seeded
 * SERVICES array (in `services.seed.ts`) is the fallback until the first edit.
 * Swap this module for a real API call without touching consumers.
 */

const STORAGE_KEY = "denailss.services.admin";

let cached: Service[] | null = null;

/** Migrates persisted services so entries carry the newer fields. */
function migrate(list: Service[]): Service[] {
  return list.map((service) => {
    const partial = service as Partial<Service>;
    return {
      ...service,
      active: typeof partial.active === "boolean" ? partial.active : true,
      tiers: Array.isArray(partial.tiers) ? partial.tiers : [],
      requiresPickup:
        typeof partial.requiresPickup === "boolean"
          ? partial.requiresPickup
          : partial.slug === "fake-nail",
    };
  });
}

function load(): Service[] {
  if (cached) return cached;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Service[];
        if (Array.isArray(parsed)) {
          cached = migrate(parsed);
          return cached;
        }
      }
    } catch {
      // fall through to seed
    }
  }
  cached = migrate([...SERVICES]);
  return cached;
}

/** SSR-safe reactive read: server gets the seed, client gets persisted + live. */
export function getLiveServices(): Service[] {
  if (typeof window !== "undefined") return load();
  return migrate([...SERVICES]);
}

/** Services currently bookable and shown publicly. */
export function getActiveServices(): Service[] {
  return getLiveServices().filter((service) => service.active);
}

export function getServiceBySlug(slug: string): Service | undefined {
  return load().find((service) => service.slug === slug);
}

/** Subscriber set for reactive (live) reads of the service list. */
const subscribers = new Set<() => void>();

export function subscribeServices(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function notify() {
  subscribers.forEach((cb) => cb());
}

function save(list: Service[]) {
  cached = list;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage unavailable (private mode etc.) — keep in-memory state
    }
  }
  notify();
}

export function updateService(service: Service): Service[] {
  const list = load();
  const idx = list.findIndex((s) => s.id === service.id);
  if (idx === -1) return list;
  const next = [...list];
  next[idx] = service;
  save(next);
  return next;
}

/** Toggle a service between active (bookable) and nonaktif (hidden publicly). */
export function setActiveService(id: string, active: boolean): Service[] {
  const list = load();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return list;
  const next = [...list];
  next[idx] = { ...next[idx], active };
  save(next);
  return next;
}
