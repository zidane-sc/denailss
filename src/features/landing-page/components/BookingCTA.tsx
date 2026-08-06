"use client";

import { useState } from "react";
import { Sparkles, Calendar, ArrowRight, ArrowLeft, CheckCircle2, Copy, Smartphone } from "lucide-react";

export default function BookingCTA() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>("Gel Extension");
  const [selectedAddon, setSelectedAddon] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("Minggu, 9 Agustus - 09:00 WIB");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const services = [
    { name: "Gel Extension", price: 150000, duration: "120 mnt" },
    { name: "Premium Manicure", price: 80000, duration: "45 mnt" },
    { name: "Pedicure Spa", price: 100000, duration: "60 mnt" },
    { name: "Custom Press-on Nails", price: 120000, duration: "Kustom" },
  ];

  const slots = [
    "Minggu, 9 Agustus - 09:00 WIB",
    "Minggu, 9 Agustus - 13:00 WIB",
    "Selasa, 11 Agustus - 18:00 WIB",
    "Selasa, 11 Agustus - 20:00 WIB",
  ];

  const getBasePrice = () => {
    return services.find(s => s.name === selectedService)?.price || 0;
  };

  const getTotalPrice = () => {
    let total = getBasePrice();
    if (selectedAddon) total += 50000;
    return total;
  };

  const getDepositAmount = () => {
    // 50,000 fixed deposit
    return 50000;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const handleWhatsAppSubmit = () => {
    const addonText = selectedAddon ? "\n- + Custom Nail Art (+Rp 50.000)" : "";
    const text = `Halo Denailss! Saya ingin melakukan booking janji temu:
    
*Nama:* ${name}
*No. WhatsApp:* ${phone}
*Layanan:* ${selectedService}${addonText}
*Jadwal:* ${selectedSlot}
*Total Biaya:* ${formatPrice(getTotalPrice())}
*Deposit:* ${formatPrice(getDepositAmount())} (Transfer BCA)
*Catatan:* ${notes || "-"}

Mohon verifikasi booking saya. Terima kasih!`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section id="booking-cta" className="py-24 bg-gradient-to-t from-sand/40 via-cream to-background transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* Card Frame */}
        <div className="bg-white dark:bg-charcoal border border-primary-pink/15 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          {/* Decorative Corner Light Orbs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-pink/10 rounded-full blur-2xl -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-pink/10 rounded-full blur-2xl -z-10" />

          {/* Heading */}
          <div className="text-center space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-pink/10 text-primary-pink text-xs font-semibold uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" />
              <span>Interactive Booking Wizard</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-charcoal">
              Reservasi Jadwal Treatment Anda
            </h2>
            <p className="text-sm text-charcoal/65 max-w-lg mx-auto">
              Cukup 4 langkah mudah untuk mengamankan slot Anda. Coba simulasi booking interaktif ini sekarang.
            </p>
          </div>

          {/* Steps Indicator */}
          <div className="flex justify-between items-center max-w-md mx-auto mb-10">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1 last:flex-initial">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${
                    step >= num
                      ? "bg-primary-pink text-white border-primary-pink shadow-md shadow-primary-pink/10"
                      : "bg-transparent text-charcoal/40 border-primary-pink/15"
                  }`}
                >
                  {num}
                </div>
                {num < 4 && (
                  <div
                    className={`h-[2px] flex-1 mx-2 transition-all duration-300 ${
                      step > num ? "bg-primary-pink" : "bg-primary-pink/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Contents */}
          <div className="min-h-[280px]">
            {/* STEP 1: CHOOSE SERVICE */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-pink" />
                  Langkah 1: Pilih Layanan & Addon
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((svc) => (
                    <button
                      key={svc.name}
                      onClick={() => setSelectedService(svc.name)}
                      className={`p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-28 ${
                        selectedService === svc.name
                          ? "border-primary-pink bg-primary-pink/5 shadow-sm shadow-primary-pink/5"
                          : "border-primary-pink/15 hover:border-primary-pink/30 bg-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="font-semibold text-charcoal">{svc.name}</span>
                        <span className="text-xs text-charcoal/40 font-medium">{svc.duration}</span>
                      </div>
                      <span className="text-base font-bold text-primary-pink">{formatPrice(svc.price)}</span>
                    </button>
                  ))}
                </div>

                {/* Addon Choice */}
                <div className="p-5 rounded-2xl border border-primary-pink/15 flex items-center justify-between bg-sand/20 dark:bg-sand/5">
                  <div className="space-y-1 pr-4">
                    <span className="font-semibold text-charcoal text-sm block">Custom Nail Art (+Rp 50.000)</span>
                    <span className="text-xs text-charcoal/50 leading-relaxed block">
                      Tambahkan opsi lukis custom (abstrak, floral, 3D, chrome) di atas base treatment Anda.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedAddon}
                    onChange={(e) => setSelectedAddon(e.target.checked)}
                    className="h-5 w-5 rounded border-primary-pink/30 text-primary-pink focus:ring-primary-pink accent-primary-pink cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE DATE & TIME */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-pink" />
                  Langkah 2: Pilih Slot Waktu Tersedia
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 flex items-center justify-between ${
                        selectedSlot === slot
                          ? "border-primary-pink bg-primary-pink/5 font-semibold text-primary-pink"
                          : "border-primary-pink/15 hover:border-primary-pink/25 text-charcoal/70 bg-transparent"
                      }`}
                    >
                      <span>{slot}</span>
                      <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center text-[10px] ${
                        selectedSlot === slot ? "border-primary-pink bg-primary-pink text-white" : "border-primary-pink/20"
                      }`}>
                        {selectedSlot === slot && "✓"}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-charcoal/40 italic">
                  *Ketersediaan jam disesuaikan dengan availability engine mingguan studio kami.
                </p>
              </div>
            )}

            {/* STEP 3: CUSTOMER INFO */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary-pink" />
                  Langkah 3: Informasi Kontak Anda
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal/60 uppercase tracking-wider mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-primary-pink/20 focus:border-primary-pink bg-transparent text-charcoal outline-none transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal/60 uppercase tracking-wider mb-2">
                      Nomor WhatsApp (Aktif)
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 0812XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-primary-pink/20 focus:border-primary-pink bg-transparent text-charcoal outline-none transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal/60 uppercase tracking-wider mb-2">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      placeholder="Misal: ingin request warna pastel tertentu, kuku asli sangat pendek, dll."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-primary-pink/20 focus:border-primary-pink bg-transparent text-charcoal outline-none transition-colors text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: DEPOSIT & SUBMIT */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center space-y-3 pb-2">
                  <CheckCircle2 className="h-12 w-12 text-primary-pink mx-auto" />
                  <h3 className="text-lg font-bold text-charcoal">
                    Satu Langkah Lagi!
                  </h3>
                  <p className="text-sm text-charcoal/75 leading-relaxed max-w-md mx-auto">
                    Untuk mengonfirmasi booking Anda, silakan lakukan transfer deposit sebesar <span className="font-bold text-primary-pink">{formatPrice(getDepositAmount())}</span> ke nomor rekening di bawah ini.
                  </p>
                </div>

                {/* Transfer Info */}
                <div className="p-5 rounded-2xl border border-primary-pink/15 bg-sand/20 dark:bg-sand/5 space-y-3.5">
                  <div className="flex justify-between items-center text-sm border-b border-primary-pink/5 pb-2">
                    <span className="text-charcoal/60">Bank Penerima</span>
                    <span className="font-bold text-charcoal">BCA (Bank Central Asia)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-primary-pink/5 pb-2">
                    <span className="text-charcoal/60">Nomor Rekening</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-charcoal">
                      <span>7720918731</span>
                      <button
                        onClick={() => copyToClipboard("7720918731")}
                        className="p-1 hover:text-primary-pink transition-colors"
                        title="Copy Rekening"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-charcoal/60">Atas Nama</span>
                    <span className="font-bold text-charcoal">DENA ZIDANE</span>
                  </div>
                </div>

                {copied && (
                  <p className="text-center text-xs font-semibold text-primary-pink animate-pulse">
                    Nomor rekening disalin ke clipboard!
                  </p>
                )}

                <div className="p-4 rounded-xl bg-primary-pink/5 border border-primary-pink/15 text-xs text-charcoal/60 leading-relaxed text-center">
                  Setelah transfer, klik tombol kirim di bawah ini untuk mengirim bukti pembayaran & detail booking secara otomatis ke WhatsApp Admin kami.
                </div>
              </div>
            )}
          </div>

          {/* Wizard Controls */}
          <div className="border-t border-primary-pink/15 pt-8 mt-8 flex justify-between items-center">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-primary-pink/15 text-charcoal/85 hover:border-primary-pink hover:text-primary-pink transition-colors text-sm font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => {
                  if (step === 3 && (!name || !phone)) {
                    alert("Mohon isi Nama Lengkap dan Nomor WhatsApp Anda terlebih dahulu.");
                    return;
                  }
                  setStep(step + 1);
                }}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary-pink hover:bg-primary-pink-dark text-white rounded-full transition-all duration-300 text-sm font-semibold shadow-md shadow-primary-pink/20"
              >
                <span>Lanjut</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleWhatsAppSubmit}
                className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-300 text-base font-bold shadow-lg shadow-green-600/10"
              >
                <span>Kirim via WhatsApp</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
