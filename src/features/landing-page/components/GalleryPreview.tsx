import Image from "next/image";
import { Search, Heart, Sparkles } from "lucide-react";

export default function GalleryPreview() {
  const portfolioItems = [
    {
      src: "/gallery_1.jpg",
      title: "Blush Abstract Gold Swirls",
      style: "Abstract Pastel",
      price: "Rp 50.000",
      description: "Desain abstrak dengan kombinasi warna pastel lembut dan sentuhan foil emas asli.",
    },
    {
      src: "/gallery_2.jpg",
      title: "Liquid Silver Chrome",
      style: "Futuristic Metallic",
      price: "Rp 60.000",
      description: "Efek chrome perak cair pada dasar nude, memberikan kesan futuristik namun tetap elegan.",
    },
    {
      src: "/gallery_3.jpg",
      title: "Dainty Rose Blossom",
      style: "Romantic Floral",
      price: "Rp 70.000",
      description: "Gambar bunga mawar kecil buatan tangan dengan kombinasi gliter emas halus.",
    },
  ];

  return (
    <section id="gallery" className="py-24 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-pink">Portfolio</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal">
              Galeri Inspirasi Seni Kuku
            </h2>
            <p className="text-sm text-charcoal/65 leading-relaxed">
              Jelajahi beberapa hasil karya terbaik kami. Anda dapat memesan desain yang sama persis atau menyesuaikannya dengan selera pribadi Anda.
            </p>
            <div className="w-12 h-1 bg-primary-pink/70 rounded mt-2" />
          </div>
          <div>
            <span className="text-xs font-semibold text-charcoal/40 italic">
              Klik &quot;Book&quot; pada gambar untuk memilih desain ini
            </span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item, idx) => (
            <div
              key={idx}
              className="relative group aspect-square rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-primary-pink/15"
            >
              {/* Image */}
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-w-768px) 100vw, 350px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 text-white">
                
                {/* Details */}
                <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary-pink/25 backdrop-blur-sm text-[10px] font-semibold tracking-wider uppercase border border-primary-pink/30 text-primary-pink-light">
                      {item.style}
                    </span>
                    <span className="text-sm font-bold text-primary-pink-light">
                      {item.price} <span className="text-[10px] font-normal text-white/50">(Art saja)</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold tracking-wide">{item.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <a
                      href="#booking-cta"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-pink hover:bg-primary-pink-dark text-white rounded-full text-xs font-semibold tracking-wide transition-all duration-300"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Book Desain Ini
                    </a>
                    <button className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300">
                      <Heart className="h-4 w-4 hover:fill-red-500 hover:text-red-500 transition-colors duration-300" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

