import { updateSettingsSchema } from "@/features/settings/schemas/api";
import { getSettings, updateSettings } from "@/features/settings/services/settings-service";
import { getDepositConfig } from "@/features/booking/services/deposit-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";
import { SITE } from "@/constants/site";

/** Fallback when the settings row has not been seeded yet. */
async function defaultSettings() {
  const deposit = await getDepositConfig();
  return {
    businessProfile: {
      name: SITE.name,
      logo: null,
      description: SITE.description,
      address: SITE.address,
    },
    socialMedia: {
      instagram: SITE.instagramHandle,
      tiktok: SITE.tiktokHandle,
      whatsapp: SITE.whatsappNumber,
    },
    policies: {
      cancellation: "",
      deposit: deposit.notes,
    },
  };
}

export async function GET() {
  try {
    const settings = await getSettings();
    return apiSuccess(settings ?? (await defaultSettings()));
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireApiOwner();
    const parsed = updateSettingsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data pengaturan tidak valid.", 422));
    }
    return apiSuccess(await updateSettings(parsed.data));
  } catch (error) {
    return apiFailure(error);
  }
}
