"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { CUSTOMER_PROFILE_FALLBACK } from "@/features/customer/constants";
import { fetchCustomerProfile, updateCustomerProfile } from "@/features/customer/data/customer-api";
import { UserCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import type { CustomerProfile } from "@/features/customer/types";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile>(CUSTOMER_PROFILE_FALLBACK);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", instagram: "", notes: "" });

  useEffect(() => {
    fetchCustomerProfile()
      .then((nextProfile) => {
        setProfile(nextProfile);
        setFormData({ name: nextProfile.name, phone: nextProfile.phone, email: nextProfile.email, instagram: nextProfile.instagram || "", notes: nextProfile.notes || "" });
      })
      .catch(() => toast.error("Profil belum dapat dimuat."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const nextProfile = await updateCustomerProfile({ name: formData.name, phone: formData.phone, instagram: formData.instagram, notes: formData.notes });
      setProfile(nextProfile);
      setFormData({ name: nextProfile.name, phone: nextProfile.phone, email: nextProfile.email, instagram: nextProfile.instagram || "", notes: nextProfile.notes || "" });
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui", { description: "Data diri kamu sudah tersimpan." });
    } catch {
      toast.error("Profil belum dapat disimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const resetForm = () => setFormData({ name: profile.name, phone: profile.phone, email: profile.email, instagram: profile.instagram || "", notes: profile.notes || "" });

  return (
    <div className="max-w-2xl space-y-8">
      <Reveal><h1 className="font-heading text-2xl font-bold text-foreground">Profil Akun</h1><p className="mt-1 text-muted-foreground">Kelola informasi pribadi dan preferensi kamu.</p></Reveal>
      <Reveal delay={0.1}>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4 border-b border-border/50 pb-6"><div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><UserCircleIcon weight="fill" className="size-10" /></div><div><h2 className="font-heading text-xl font-semibold">{profile.name}</h2><p className="text-sm text-muted-foreground">{profile.phone}</p></div></div>
          {loading ? <p className="py-8 text-sm text-muted-foreground">Memuat profil...</p> : <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2"><label htmlFor="name" className="text-sm font-medium">Nama Lengkap</label><input id="name" type="text" disabled={!isEditing || saving} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm disabled:bg-muted/50 disabled:text-muted-foreground" required /></div>
            <div className="space-y-2"><label htmlFor="phone" className="text-sm font-medium">Nomor WhatsApp</label><input id="phone" type="tel" disabled={!isEditing || saving} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm disabled:bg-muted/50 disabled:text-muted-foreground" required /></div>
            <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email</label><input id="email" type="email" disabled value={formData.email} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground" /><p className="text-xs text-muted-foreground">Email akun dikelola oleh Supabase Auth.</p></div>
            <div className="space-y-2"><label htmlFor="instagram" className="text-sm font-medium">Instagram <span className="font-normal text-muted-foreground">(Opsional)</span></label><input id="instagram" type="text" disabled={!isEditing || saving} value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="@namakamu" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm disabled:bg-muted/50 disabled:text-muted-foreground" /></div>
            <div className="space-y-2"><label htmlFor="notes" className="text-sm font-medium">Catatan Khusus <span className="font-normal text-muted-foreground">(Opsional)</span></label><textarea id="notes" disabled={!isEditing || saving} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Contoh: Kuku tipis, alergi produk tertentu..." className="h-24 w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm disabled:bg-muted/50 disabled:text-muted-foreground" /><p className="text-xs text-muted-foreground">Catatan ini akan otomatis disertakan setiap kali kamu melakukan booking.</p></div>
            <div className="flex justify-end pt-4">{isEditing ? <div className="flex gap-3"><Button type="button" variant="outline" disabled={saving} onClick={() => { resetForm(); setIsEditing(false); }}>Batal</Button><Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</Button></div> : <Button type="button" onClick={() => setIsEditing(true)}>Edit Profil</Button>}</div>
          </form>}
        </div>
      </Reveal>
    </div>
  );
}
