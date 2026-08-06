import Link from "next/link";
import { Sparkles, Phone, Clock, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-sand border-t border-primary-pink/15 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <Sparkles className="h-5 w-5 text-primary-pink group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xl font-bold tracking-widest text-charcoal">
                DENAILSS
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-charcoal/60">
              Platform booking & portfolio seni kuku (nail art) eksklusif. Didesain secara detail untuk mempercantik kuku alami Anda dengan kualitas premium.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-white dark:bg-charcoal border border-primary-pink/15 hover:border-primary-pink hover:text-primary-pink transition-all duration-300 text-charcoal/70"
                aria-label="Instagram"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-white dark:bg-charcoal border border-primary-pink/15 hover:border-primary-pink hover:text-primary-pink transition-all duration-300 text-charcoal/70"
                aria-label="WhatsApp"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-white dark:bg-charcoal border border-primary-pink/15 hover:border-primary-pink hover:text-primary-pink transition-all duration-300 text-charcoal/70"
                aria-label="TikTok"
              >
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.4-.43-.59-.67-.07 3.32-.03 6.64-.04 9.96-.06 2.04-.59 4.14-1.92 5.67-1.45 1.72-3.83 2.66-6.07 2.44-2.82-.19-5.46-2.14-6.19-4.88-1.04-3.55 1.05-7.73 4.67-8.86 1.04-.33 2.15-.39 3.23-.21v4.18c-.85-.24-1.79-.17-2.56.3-.96.53-1.54 1.67-1.43 2.77.1 1.25.96 2.39 2.19 2.68 1.11.29 2.39-.12 2.94-1.12.38-.64.43-1.41.42-2.14V0h-3.96z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-charcoal">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-sm text-charcoal/65 hover:text-primary-pink transition-colors duration-300">
                  About Us
                </a>
              </li>
              <li>
                <a href="#services" className="text-sm text-charcoal/65 hover:text-primary-pink transition-colors duration-300">
                  Services & Pricing
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-sm text-charcoal/65 hover:text-primary-pink transition-colors duration-300">
                  Nail Art Gallery
                </a>
              </li>
              <li>
                <a href="#reviews" className="text-sm text-charcoal/65 hover:text-primary-pink transition-colors duration-300">
                  Customer Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Operational Hours */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-charcoal">
              Jam Operasional
            </h3>
            <ul className="space-y-2 text-sm text-charcoal/65">
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary-pink shrink-0" />
                <span>Selasa: 18:00 – 22:00</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary-pink shrink-0" />
                <span>Minggu: 09:00 – 18:00</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-transparent shrink-0" />
                <span className="text-xs text-charcoal/40 italic">*Jadwal dapat bervariasi setiap minggu</span>
              </li>
            </ul>
          </div>

          {/* Location / Studio */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-charcoal">
              Lokasi Studio
            </h3>
            <div className="space-y-2 text-sm text-charcoal/65">
              <p className="flex gap-2">
                <MapPin className="h-4 w-4 text-primary-pink shrink-0 mt-0.5" />
                <span>Bandung, Jawa Barat, Indonesia (Detail lokasi dikirim setelah konfirmasi booking)</span>
              </p>
              <p className="flex gap-2 pt-1 text-xs text-charcoal/50">
                Studio bersifat private appointment-only untuk menjaga kenyamanan dan eksklusivitas pelayanan.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="border-t border-primary-pink/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-charcoal/50">
          <p>© {currentYear} Denailss. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with ❤️ for <span className="font-semibold text-charcoal/70">Denailss Platform</span> by Zidane.
          </p>
        </div>
      </div>
    </footer>
  );
}
