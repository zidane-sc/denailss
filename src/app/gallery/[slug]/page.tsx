import type { Metadata } from "next";
import {
  GALLERY_DESIGNS,
  getDesignBySlug,
} from "@/features/gallery/data/designs.mock";
import { DesignDetailView } from "@/features/gallery/components/design-detail-view";
import { imageUrl } from "@/lib/images";

export function generateStaticParams() {
  return GALLERY_DESIGNS.map((design) => ({ slug: design.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const design = getDesignBySlug(slug);
  if (!design) return {};
  const cover = design.imageSeeds[0];
  return {
    title: design.title,
    description: design.description,
    alternates: {
      canonical: `/gallery/${design.slug}`,
    },
    openGraph: {
      title: design.title,
      description: design.description,
      url: `/gallery/${design.slug}`,
      type: "article",
      images: cover
        ? [
            {
              url: imageUrl(cover),
              alt: design.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: design.title,
      description: design.description,
      images: cover ? [imageUrl(cover)] : undefined,
    },
  };
}

export default async function GalleryDesignPage({ params }: PageProps<"/gallery/[slug]">) {
  const { slug } = await params;
  // Renders the live catalog (seed + uploaded designs) client-side.
  return <DesignDetailView slug={slug} />;
}
