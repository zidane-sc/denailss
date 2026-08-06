"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Apakah saya harus melakukan booking terlebih dahulu?",
      a: "Ya, demi menjaga privasi, kenyamanan, dan kualitas pelayanan, studio kami hanya melayani customer yang telah membuat janji temu (appointment-only) terlebih dahulu.",
    },
    {
      q: "Apakah ada sistem deposit untuk melakukan booking?",
      a: "Ya, untuk mengurangi pembatalan sepihak (no-show), beberapa jadwal atau tipe layanan memerlukan deposit ringan. Deposit ini akan otomatis memotong total biaya treatment Anda di studio nanti.",
    },
    {
      q: "Berapa batas waktu jika saya ingin melakukan reschedule?",
      a: "Perubahan jadwal atau pembatalan dapat dilakukan maksimal 24 jam sebelum jadwal treatment Anda. Pembatalan mendadak (kurang dari 24 jam) akan menyebabkan deposit hangus.",
    },
    {
      q: "Berapa lama daya tahan gel nail art dari Denailss?",
      a: "Dengan persiapan kuku yang bersih dan material gel premium yang kami gunakan, nail art umumnya bertahan 3 hingga 5 minggu tergantung pada aktivitas harian Anda.",
    },
    {
      q: "Bagaimana cara saya menuju lokasi studio?",
      a: "Studio kami berlokasi di area Bandung. Alamat lengkap, titik Google Maps, dan panduan masuk studio akan dikirimkan secara otomatis melalui WhatsApp/Email setelah booking Anda dikonfirmasi.",
    },
  ];

  const toggleFAQ = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="faq" className="py-24 bg-background transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-pink">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-sm text-charcoal/65 leading-relaxed max-w-xl mx-auto">
            Punya pertanyaan seputar layanan kami? Temukan jawabannya di bawah ini atau hubungi kami langsung jika Anda membutuhkan bantuan lebih lanjut.
          </p>
          <div className="w-12 h-1 bg-primary-pink/70 rounded mx-auto mt-2" />
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-primary-pink/15 rounded-2xl bg-sand/10 dark:bg-sand/5 overflow-hidden transition-all duration-300 hover:border-primary-pink/30"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-semibold text-charcoal transition-colors hover:text-primary-pink focus:outline-none"
                >
                  <div className="flex gap-3 items-center pr-4">
                    <HelpCircle className="h-5 w-5 text-primary-pink shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4.5 w-4.5 text-primary-pink shrink-0" />
                  ) : (
                    <ChevronDown className="h-4.5 w-4.5 text-primary-pink shrink-0" />
                  )}
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[200px] border-t border-primary-pink/5" : "max-h-0"
                  }`}
                >
                  <p className="p-6 text-sm text-charcoal/70 leading-relaxed bg-white/40 dark:bg-charcoal/20">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

