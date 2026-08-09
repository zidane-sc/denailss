"use client";

import { Textarea } from "@/components/ui/textarea";
import type { SettingsDraft } from "../types";
import { SettingsField, SettingsSection } from "./settings-shared";

/**
 * Policies settings — informational business policy text only. This is NOT the
 * deposit calculation/configuration engine (that lives in the booking flow's
 * deposit config); it is the policy wording shown to customers.
 */
export function PoliciesForm({
  draft,
  onChange,
}: {
  draft: SettingsDraft;
  onChange: (draft: SettingsDraft) => void;
}) {
  const { policies } = draft;

  return (
    <SettingsSection
      title="Kebijakan"
      description="Ketentuan yang disampaikan ke customer seputar booking."
    >
      <SettingsField
        label="Kebijakan Pembatalan"
        hint={
          policies.cancellation.trim()
            ? "Ketentuan pembatalan dan reschedule yang disampaikan ke customer."
            : undefined
        }
      >
        <Textarea
          value={policies.cancellation}
          onChange={(e) =>
            onChange({
              ...draft,
              policies: { ...policies, cancellation: e.target.value },
            })
          }
          placeholder="Tulis kebijakan pembatalan Denailss di sini."
          rows={4}
        />
        {!policies.cancellation.trim() && (
          <p className="text-[11px] text-muted-foreground">Belum ada kebijakan.</p>
        )}
      </SettingsField>

      <SettingsField
        label="Kebijakan Deposit"
        hint={
          policies.deposit.trim()
            ? "Jelaskan apakah deposit wajib, cara transfer, dan aturan refund."
            : undefined
        }
      >
        <Textarea
          value={policies.deposit}
          onChange={(e) =>
            onChange({
              ...draft,
              policies: { ...policies, deposit: e.target.value },
            })
          }
          placeholder="Tulis kebijakan deposit Denailss di sini."
          rows={4}
        />
        {!policies.deposit.trim() && (
          <p className="text-[11px] text-muted-foreground">Belum ada kebijakan.</p>
        )}
      </SettingsField>
    </SettingsSection>
  );
}
