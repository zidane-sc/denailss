import Image from "next/image";
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { picsumUrl } from "@/lib/images";
import { SITE } from "@/constants/site";

const POSTS = [
  "ig-post-1",
  "ig-post-2",
  "ig-post-3",
  "ig-post-4",
  "ig-post-5",
  "ig-post-6",
];

export function InstagramSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Update terbaru di Instagram
          </h2>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <InstagramLogoIcon className="size-4" />
            @{SITE.instagramHandle}
          </a>
        </Reveal>

        <RevealGroup className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
          {POSTS.map((seed) => (
            <RevealItem key={seed}>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-2xl"
              >
                <Image
                  src={picsumUrl(seed, "square", 0.8)}
                  alt="Postingan Instagram Denailss"
                  fill
                  sizes="(min-width: 1024px) 14rem, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/35">
                  <InstagramLogoIcon
                    weight="fill"
                    className="size-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
              </a>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
