import { Clock, Tag, Sparkles } from "lucide-react";

export default function Services() {
  const serviceList = [
    {
      name: "Gel Extension",
      price: "150.000",
      duration: "120 min",
      description: "Ekstensi kuku menggunakan soft gel premium agar kuku terlihat lebih panjang, ramping, dan tetap lentur alami.",
      featured: true,
    },
    {
      name: "Nail Art (Custom)",
      price: "50.000",
      duration: "60-90 min",
      description: "Seni lukis kuku manual (hand-painted) dengan kuas halus. Bebas pilih motif: abstract, chrome, floral, hingga 3D art.",
      featured: true,
    },
    {
      name: "Premium Manicure",
      price: "80.000",
      duration: "45 min",
      description: "Pembersihan kutikula secara mendalam, pembentukan kuku, scrub tangan, massage, dan nutrisi vitamin kuku.",
      featured: false,
    },
    {
      name: "Pedicure Spa",
      price: "100.000",
      duration: "60 min",
      description: "Perawatan jari kaki lengkap, perendaman kaki dengan aroma terapi, penggosokan tumit, scrub, dan vitamin.",
      featured: false,
    },
    {
      name: "Custom Press-on Nails",
      price: "120.000",
      duration: "Custom",
      description: "Kuku palsu kustom yang diukur pas untuk kuku Anda. Dilukis secara kustom dan dapat dipakai ulang berkali-kali.",
      featured: false,
    },
    {
      name: "Safe Gel Removal",
      price: "30.000",
      duration: "30 min",
      description: "Pembersihan gel lama secara hati-hati agar lapisan keratin kuku asli Anda tidak terkikis tipis.",
      featured: false,
    },
  ];

  return (
    <section id="services" className="py-24 bg-sand/30 dark:bg-sand/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-pink">Layanan & Menu</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal">
            Treatment Menu & Pricelist
          </h2>
          <p className="text-sm text-charcoal/65 leading-relaxed">
            Semua layanan menggunakan peralatan steril dan material gel impor yang aman. Dikerjakan dengan fokus detail dan higienis.
          </p>
          <div className="w-12 h-1 bg-primary-pink/70 rounded mx-auto mt-2" />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceList.map((svc, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col justify-between p-8 rounded-3xl border transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 ${
                svc.featured
                  ? "bg-white dark:bg-charcoal border-primary-pink/25 shadow-md shadow-primary-pink/5"
                  : "bg-white/70 dark:bg-charcoal/50 border-primary-pink/10 hover:bg-white"
              }`}
            >
              {/* Highlight Badge */}
              {svc.featured && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-pink/10 text-primary-pink text-xs font-medium border border-primary-pink/20">
                  <Sparkles className="h-3 w-3" />
                  Terpopuler
                </span>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-charcoal group-hover:text-primary-pink transition-colors duration-300">
                  {svc.name}
                </h3>
                
                {/* Price tag */}
                <div className="flex items-baseline gap-1 text-charcoal">
                  <span className="text-xs font-medium text-charcoal/50">Mulai</span>
                  <span className="text-2xl font-bold text-primary-pink">Rp {svc.price}</span>
                </div>

                <p className="text-sm text-charcoal/65 leading-relaxed min-h-[60px]">
                  {svc.description}
                </p>
              </div>

              {/* Footer info (Duration) */}
              <div className="border-t border-primary-pink/15 pt-4 mt-6 flex items-center justify-between text-xs text-charcoal/60">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary-pink/80" />
                  <span>Durasi: {svc.duration}</span>
                </div>
                <a
                  href="#booking-cta"
                  className="text-xs font-semibold text-primary-pink hover:text-primary-pink-dark flex items-center gap-0.5"
                >
                  Book <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

