import { listCatalogGallery } from "@/features/booking/services/catalog-service";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return apiSuccess(await listCatalogGallery());
  } catch (error) {
    return apiFailure(error);
  }
}
