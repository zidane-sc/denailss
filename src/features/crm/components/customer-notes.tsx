"use client";

import React, { useState } from "react";
import { NotePencilIcon, CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, useReducedMotion } from "motion/react";

export function CustomerNotes({
  customerId,
  initialNotes,
}: {
  customerId: string;
  initialNotes?: string;
}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState<string>(() => initialNotes ?? "");
  const [draft, setDraft] = useState<string>(() => value);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasNotes = value.trim().length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/crm/customers/${encodeURIComponent(customerId)}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      if (!res.ok) throw new Error(payload.error?.message ?? "Catatan gagal disimpan.");
      setValue(draft);
      setEditing(false);
      toast.success("Catatan tersimpan 💅", { description: "Yang penting tentang pelanggan ini tetap ada di kepalamu." });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Catatan gagal disimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-secondary-soft text-secondary [&>svg]:size-3.5">
            <NotePencilIcon />
          </span>
          <h3 className="font-heading text-sm font-semibold text-foreground/90">Catatan</h3>
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            Notebook kecil buat hal yang perlu diingat.
          </span>
        </div>

        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-full text-xs text-muted-foreground hover:text-primary [&>svg]:size-4"
            onClick={handleEdit}
          >
            <NotePencilIcon />
            {hasNotes ? "Edit" : "Tambah Catatan"}
          </Button>
        )}
      </div>

      <motion.div
        key={editing ? "editing" : "viewing"}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4"
      >
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Contoh: suka warna nude & chrome. Biasanya booking Minggu sore."
              rows={5}
              aria-label="Catatan pelanggan"
              className="min-h-28 rounded-xl bg-background/60 leading-relaxed"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1.5 rounded-full" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                ) : (
                  <CheckIcon className="size-4" />
                )}
                Simpan Catatan
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5 rounded-full text-muted-foreground" onClick={handleCancel}>
                <XIcon className="size-4" />
                Batal
              </Button>
            </div>
          </div>
        ) : hasNotes ? (
          <div className="rounded-xl border border-border/50 bg-muted/25 px-4 py-3.5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
              {value}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/80 bg-background/40 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada catatan. Tambahkan hal kecil yang perlu diingat tentang pelanggan ini.
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
