import { listCatalogServicesAll } from "@/features/services/services/service-service";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return apiSuccess(await listCatalogServicesAll());
  } catch (error) {
    return apiFailure(error);
  }
}
