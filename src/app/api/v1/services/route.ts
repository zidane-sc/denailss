import { listCatalogServices } from "@/features/booking/services/catalog-service";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return apiSuccess(await listCatalogServices());
  } catch (error) {
    return apiFailure(error);
  }
}
