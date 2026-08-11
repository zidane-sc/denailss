"use client";

import Image from "next/image";
import { useLiveSettings } from "@/features/settings/components/settings-provider";
import { imageUrl } from "@/lib/images";
import { SITE } from "@/constants/site";

const FALLBACK_LOGO = "/images/logo-horizontal.png";

/**
 * Brand logo — uses the owner-uploaded logo from backoffice settings when
 * available (a `storage:` reference resolved to its Supabase URL), otherwise
 * the bundled default PNG.
 */
export function SiteLogo({
  width,
  height,
  className,
  priority = false,
}: {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  const settings = useLiveSettings();
  const logo = settings?.businessProfile.logo;
  const src = logo ? imageUrl(logo) : FALLBACK_LOGO;
  const alt = settings?.businessProfile.name ?? SITE.name;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
