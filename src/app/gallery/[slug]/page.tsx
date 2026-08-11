import type { Metadata } from "next";
import {
  getGalleryDesignBySlug,
  listCatalogGalleryWithImages,
} from "@/features/gallery/services/gallery-service";
import { DesignDetailView } from "@/features/gallery/components/design-detail-view";
import { imageUrl } from "@/lib/images";
import { SITE } from "@/constants/site";

export async function generateStaticParams() {
  const designs = await listCatalogGalleryWithImages();
  return designs.map((design) => ({ slug: design.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const design = await getGalleryDesignBySlug(slug);
  if (!design) return {};
  const cover = design.imageSeeds[0];
  return {
    title: design.title,
    description: design.description,
    alternates: {
      canonical: `${SITE.url}/gallery/${design.slug}`,
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
