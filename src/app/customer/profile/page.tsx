"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { CUSTOMER_PROFILE } from "@/features/customer/data/customer.mock";
import { UserCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: CUSTOMER_PROFILE.name,
    phone: CUSTOMER_PROFILE.phone,
    email: CUSTOMER_PROFILE.email,
    notes: CUSTOMER_PROFILE.notes || "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui", {
        description: "Data diri kamu sudah tersimpan.",
      });
    }, 500);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <Reveal>
        <h1 className="font-heading text-2xl font-bold text-foreground">Profil Akun</h1>
        <p className="mt-1 text-muted-foreground">Kelola informasi pribadi dan preferensi kamu.</p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4 border-b border-border/50 pb-6">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserCircleIcon weight="fill" className="size-10" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold">{formData.name}</h2>
              <p className="text-sm text-muted-foreground">{formData.phone}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nama Lengkap</label>
              <input
                id="name"
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-muted/50 disabled:text-muted-foreground"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Nomor WhatsApp</label>
              <input
                id="phone"
                type="tel"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-muted/50 disabled:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-muted/50 disabled:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Catatan Khusus <span className="text-muted-foreground font-normal">(Opsional)</span></label>
              <textarea
                id="notes"
                disabled={!isEditing}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Contoh: Kuku tipis, alergi produk tertentu..."
                className="h-24 w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-muted/50 disabled:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Catatan ini akan otomatis disertakan setiap kali kamu melakukan booking.</p>
            </div>

            <div className="flex justify-end pt-4">
              {isEditing ? (
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: CUSTOMER_PROFILE.name,
                        phone: CUSTOMER_PROFILE.phone,
                        email: CUSTOMER_PROFILE.email,
                        notes: CUSTOMER_PROFILE.notes || "",
                      });
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit">Simpan Perubahan</Button>
                </div>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profil
                </Button>
              )}
            </div>
          </form>
        </div>
      </Reveal>
    </div>
  );
}
