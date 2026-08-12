import { InstagramLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { GsapReveal } from "@/components/motion/gsap-reveal";
import { SITE } from "@/constants/site";
import { InstagramFeed } from "@/features/landing/components/instagram-feed";
import type { Settings } from "@/features/settings/types";

export async function InstagramSection({ settings }: { settings: Settings }) {
  const handle = settings.socialMedia.instagram || SITE.instagramHandle;
  const url = `https://www.instagram.com/${handle}/`;

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <GsapReveal className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Update terbaru di Instagram
          </h2>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <InstagramLogoIcon className="size-4" />
            @{handle}
          </a>
        </GsapReveal>

        <GsapReveal className="mt-8">
          <InstagramFeed />
        </GsapReveal>
      </div>
    </section>
  );
}
