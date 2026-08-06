import { Sparkles, Heart, Smile, ShieldAlert } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: <Heart className="h-6 w-6 text-primary-pink" />,
      title: "Memprioritaskan Kesehatan Kuku",
      description: "Kami percaya kuku yang indah dimulai dari kuku yang sehat. Produk dan teknik pembersihan kami dirancang untuk melindungi kuku asli Anda.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary-pink" />,
      title: "100% Desain Kustom",
      description: "Ekspresikan diri Anda melalui seni kuku. Setiap detail digambar secara manual dengan ketelitian tinggi sesuai selera unik Anda.",
    },
    {
      icon: <Smile className="h-6 w-6 text-primary-pink" />,
      title: "Studio Privat & Tenang",
      description: "Hindari antrean panjang dan suasana bising. Nikmati waktu santai Anda di studio private kami dengan suasana eksklusif.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Text Left */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-pink">About Denailss</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal">
              Slow Beauty Untuk Kuku Alami Anda
            </h2>
            <div className="w-12 h-1 bg-primary-pink/70 rounded" />
            <p className="text-base text-charcoal/70 leading-relaxed pt-2">
              Berawal dari kecintaan terhadap seni lukis kuku yang detail, **Denailss** hadir sebagai alternatif bagi Anda yang menginginkan layanan berkualitas tinggi tanpa merusak kekuatan kuku alami. 
            </p>
            <p className="text-base text-charcoal/70 leading-relaxed">
              Kami tidak terburu-buru demi kuantitas. Setiap appointment dikerjakan secara santai, teliti, dan bersih (slow beauty), menggunakan produk gel pilihan yang bersertifikasi aman untuk kuku sensitif.
            </p>
            <div className="p-4 rounded-2xl bg-sand/40 border border-primary-pink/15 flex gap-3 text-sm text-charcoal/75">
              <ShieldAlert className="h-5 w-5 text-primary-pink shrink-0 mt-0.5" />
              <span>Studio kami menerapkan sterilisasi alat secara menyeluruh sebelum dan sesudah setiap sesi customer.</span>
            </div>
          </div>

          {/* Values Right */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-1 gap-8 lg:pl-8">
            {values.map((val, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-5 p-6 rounded-2xl bg-sand/20 dark:bg-sand/5 hover:bg-sand/30 dark:hover:bg-sand/10 border border-primary-pink/5 transition-all duration-300 group hover:shadow-sm"
              >
                <div className="h-12 w-12 rounded-xl bg-white dark:bg-charcoal border border-primary-pink/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {val.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-charcoal">{val.title}</h3>
                  <p className="text-sm text-charcoal/65 leading-relaxed">{val.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

