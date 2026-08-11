import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { GalleryDesignsProvider } from "@/features/gallery/components/gallery-designs-provider";
import { ServicesProvider } from "@/features/services/components/services-provider";
import { PromotionsProvider } from "@/features/promotion/components/promotions-provider";
import { ReviewsProvider } from "@/features/reviews/components/reviews-provider";
import { AvailabilityProvider } from "@/features/booking/components/availability-provider";
import { DepositConfigProvider } from "@/features/booking/components/deposit-config-provider";
import { SITE } from "@/constants/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  icons: {
    icon: "/images/logo-icon.png",
  },
  openGraph: {
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/logo-horizontal.png",
        width: 800,
        height: 320,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    images: ["/images/logo-horizontal.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TooltipProvider delay={150}>
          <GalleryDesignsProvider>
            <ServicesProvider>
              <PromotionsProvider>
                <ReviewsProvider>
                  <AvailabilityProvider>
                    <DepositConfigProvider>
                      <SiteHeader />
                      <main className="flex-1">{children}</main>
                      <SiteFooter />
                    </DepositConfigProvider>
                  </AvailabilityProvider>
                </ReviewsProvider>
              </PromotionsProvider>
            </ServicesProvider>
          </GalleryDesignsProvider>
          <Toaster position="bottom-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}

