import Image from "next/image";
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/ssr";
import {
  getLiveInstagramPosts,
  INSTAGRAM_POST_URL,
} from "@/features/landing/data/instagram-posts.mock";

/**
 * Image-only grid of recent Instagram posts. Each card pulls the post photo
 * through the `/api/instagram/[shortcode]` proxy and links to the original
 * post. The list is managed by the owner in the backoffice.
 */
export function InstagramFeed() {
  const posts = getLiveInstagramPosts();
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {posts.map((shortcode) => (
        <a
          key={shortcode}
          href={INSTAGRAM_POST_URL(shortcode)}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-square overflow-hidden rounded-2xl"
        >
          <Image
            src={`/api/instagram/${shortcode}`}
            alt="Postingan Instagram Denailss"
            fill
            sizes="(min-width: 1024px) 14rem, 33vw"
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/35">
            <InstagramLogoIcon
              weight="fill"
              className="size-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          </div>
        </a>
      ))}
    </div>
  );
}
