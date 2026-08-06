import { Star, Quote } from "lucide-react";

export default function ReviewsPreview() {
  const reviews = [
    {
      name: "Sarah Amanda",
      role: "Regular Customer",
      rating: 5,
      date: "Juli 2026",
      text: "Hasil nail art-nya sangat rapi dan teliti! Dena ramah banget dan studionya nyaman sekali. Biasanya kuku saya cepat rusak kalau di-extension, tapi ini bertahan lebih dari 4 minggu tanpa ada lift sama sekali!",
    },
    {
      name: "Rachel Jovian",
      role: "First-time Customer",
      rating: 5,
      date: "Agustus 2026",
      text: "Paling suka sama konsep private studio-nya. Gak bising dan bener-bener rileks. Desain kustom chrome-nya juga persis banget sama foto referensi yang saya bawa. Teh hangatnya enak banget!",
    },
    {
      name: "Nabila Putri",
      role: "Regular Customer",
      rating: 5,
      date: "Juni 2026",
      text: "Sangat peduli sama kesehatan kuku asli. Sesi removal gel lama lembut banget gak kasar, gak bikin kuku saya tipis. Recommended buat yang punya kuku sensitif/tipis!",
    },
  ];

  return (
    <section id="reviews" className="py-24 bg-sand/30 dark:bg-sand/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-pink">Ulasan</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal">
            Apa Kata Pelanggan Kami?
            </h2>
          <p className="text-sm text-charcoal/65 leading-relaxed">
            Kepuasan Anda adalah kebahagiaan kami. Berikut adalah pengalaman tulus dari para pelanggan yang melakukan treatment di Denailss.
          </p>
          <div className="w-12 h-1 bg-primary-pink/70 rounded mx-auto mt-2" />
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-charcoal p-8 rounded-3xl border border-primary-pink/15 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300 relative group"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary-pink/10 group-hover:text-primary-pink/20 transition-colors duration-300 pointer-events-none" />

              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-primary-pink text-primary-pink" />
                  ))}
                </div>
                
                <p className="text-sm text-charcoal/70 leading-relaxed italic">
                  &quot;{rev.text}&quot;
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="border-t border-primary-pink/5 pt-4 mt-6 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-charcoal">{rev.name}</h4>
                  <p className="text-charcoal/50">{rev.role}</p>
                </div>
                <span className="text-charcoal/40 font-medium">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

