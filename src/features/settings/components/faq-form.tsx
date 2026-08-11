"use client";

import { PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SettingsDraft, SettingsFaq } from "../types";
import { SettingsSection } from "./settings-shared";

/**
 * FAQ settings — the two landing FAQ groups ("Seputar Booking" and
 * "Seputar Layanan"). Editable here; rendered on the landing page and its
 * JSON-LD structured data.
 */
export function FaqForm({
  draft,
  onChange,
}: {
  draft: SettingsDraft;
  onChange: (draft: SettingsDraft) => void;
}) {
  const { faqs } = draft;

  const setFaq = (index: number, patch: Partial<SettingsFaq>) => {
    const next = faqs.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange({ ...draft, faqs: next });
  };

  const addFaq = (section: SettingsFaq["section"]) => {
    onChange({ ...draft, faqs: [...faqs, { section, q: "", a: "" }] });
  };

  const removeFaq = (index: number) => {
    onChange({ ...draft, faqs: faqs.filter((_, i) => i !== index) });
  };

  const renderGroup = (section: SettingsFaq["section"], label: string) => {
    const items = faqs.filter((f) => f.section === section);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground/90">{label}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1 rounded-full text-xs"
            onClick={() => addFaq(section)}
          >
            <PlusIcon className="size-3.5" />
            Tambah
          </Button>
        </div>
        {items.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">Belum ada pertanyaan di kelompok ini.</p>
        ) : (
          items.map((faq) => {
            const index = faqs.findIndex((f) => f === faq);
            return (
              <div key={index} className="space-y-2.5 rounded-xl border border-border/60 bg-background/40 p-3">
                <Input
                  value={faq.q}
                  onChange={(e) => setFaq(index, { q: e.target.value })}
                  placeholder="Pertanyaan"
                  className="h-9 text-sm"
                />
                <Textarea
                  value={faq.a}
                  onChange={(e) => setFaq(index, { a: e.target.value })}
                  placeholder="Jawaban"
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1 rounded-full text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => removeFaq(index)}
                  >
                    <TrashIcon className="size-3.5" />
                    Hapus
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <SettingsSection
      title="FAQ"
      description="Pertanyaan yang sering ditanyakan di halaman utama."
    >
      <div className="grid gap-6">
        {renderGroup("booking", "Seputar Booking")}
        {renderGroup("service", "Seputar Layanan")}
      </div>
    </SettingsSection>
  );
}
