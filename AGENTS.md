<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Denailss

Indonesian nail-art studio booking platform. Next.js 16 (App Router, Turbopack) + TypeScript strict + Tailwind v4 (CSS-first config in `src/app/globals.css`, no `tailwind.config.*`). All UI copy is Indonesian; brand voice is home-based ("nail art rumahan", "lokasi treatment", "operasional aktif") — never commercial "studio" wording.

## Commands
- `npm run dev` — dev server; `npm run build` — prod build (runs typecheck); `npm run lint` — ESLint.
- `npx tsc --noEmit` for a standalone typecheck (no npm script for it).
- No test suite exists.

## The big gotchas
- **shadcn/ui on Base UI, not Radix.** `components.json` says `"style": "base-nova"` and primitives come from `@base-ui/react`. There is NO `asChild` prop. Compose with `render={<Link href="..." />}` and set `nativeButton={false}` when a button is rendered as a link/anchor (pattern: `src/components/layout/site-header.tsx`).
- **Icons are `@phosphor-icons/react`**, imported from `@phosphor-icons/react/dist/ssr` in server components. lucide-react was uninstalled; `components.json`'s `iconLibrary: "lucide"` is stale metadata.
- **No backend.** Everything runs on local mocks under `src/features/*/data/*.mock.ts`, which are the named seams to swap for a real Supabase/Drizzle repo layer later (Epics 4-9 not started). Exception: `src/features/booking/logic/availability.ts` and `pricing.ts` are real business logic, not mocks.
- **Fonts:** Outfit (headings) + Plus Jakarta Sans (body) via `next/font/google`. No Inter/serif.
- **Images:** real nail-art photos from the Denailss Instagram (`@denailss_9`) live in `public/images/instagram/`. `src/lib/images.ts`'s `imageUrl(seed)` maps the mock-data seed names to these local assets (unknown seeds fall back to the default); no remote image hosts are configured in `next.config.ts`. The Instagram grid section still proxies live posts via `/api/instagram/[shortcode]`.
- **Design tokens** live in `src/app/globals.css` (dusty rose primary, honey-yellow secondary, periwinkle accent, blush background). Light-mode only in custom code — don't add `dark:` variants.
- Path alias `@/*` → `./src/*`. Business contact info is single-sourced in `src/constants/site.ts` — update there, not per-page.

## Known bug — don't reintroduce
`zodResolver` validation in `step-customer-info.tsx` is async. In `booking-flow.tsx`'s `goNext`, `formRef.current.submit()` must be `async` and awaited, or the "Lanjut" button silently blocks progression on the first click after filling the form.

## Workflow
- Read `docs/PROGRESS.md` first — it's the running memory of what's built and what's next; update it when scope changes. `docs/PRD.md` and `docs/TRD.md` are the spec.
- Commit style is conventional (`feat:`, `chore:`).
