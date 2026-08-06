import Image from "next/image";
import { ArrowRight, Sparkles, MessageCircle, Star, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden bg-gradient-to-b from-sand/30 via-cream to-background">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary-pink/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary-pink/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-pink/10 border border-primary-pink/20 text-primary-pink text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Premium Nail Art Studio</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal leading-tight">
              Eksplorasi Seni Kuku Alami Anda di <span className="text-primary-pink italic font-light">Denailss</span>
            </h1>
            
            <p className="text-lg text-charcoal/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Manjakan diri Anda dengan treatment kuku berkualitas premium, nail art buatan tangan yang presisi, dan suasana studio private yang tenang. Kami fokus menjaga kesehatan kuku alami Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#booking-cta"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-primary-pink hover:bg-primary-pink-dark text-white rounded-full text-base font-semibold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary-pink/20"
              >
                <span>Book Appointment</span>
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 border border-primary-pink/25 hover:border-primary-pink hover:bg-primary-pink/5 text-charcoal/90 hover:text-primary-pink rounded-full text-base font-semibold tracking-wide transition-all duration-300"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Konsultasi WhatsApp</span>
              </a>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-sm text-charcoal/60">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-primary-pink text-primary-pink" />
                <span><span className="font-semibold text-charcoal">4.9</span>/5 Kepuasan Pelanggan</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-primary-pink" />
                <span>Private & Higienis</span>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-[500px] aspect-[3/2] sm:aspect-[4/3] lg:aspect-[3/2] rounded-3xl overflow-hidden shadow-2xl border border-primary-pink/15 group">
              <Image
                src="/hero_nail_art.jpg"
                alt="Beautiful premium nail art by Denailss"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-w-768px) 100vw, 500px"
              />
              
              {/* Overlay Glass Card */}
              <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/70 dark:bg-charcoal/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-xs text-charcoal/50 uppercase tracking-widest font-semibold">Nail Artist</p>
                  <p className="text-sm font-bold text-charcoal">by Dena Zidane</p>
                </div>
                <div className="h-10 w-[1.5px] bg-charcoal/10" />
                <div>
                  <p className="text-xs text-charcoal/50 uppercase tracking-widest font-semibold">Tipe Layanan</p>
                  <p className="text-sm font-bold text-charcoal">Private Appointment Only</p>
                </div>
              </div>
            </div>
            
            {/* Background Decorative Element */}
            <div className="absolute -top-4 -right-4 w-full h-full border border-primary-pink/15 rounded-3xl -z-10 translate-x-2 translate-y-2 pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}
