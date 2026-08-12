import { listCatalogServicesAll } from "@/features/services/services/service-service";
import { apiFailure, cachedApiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return cachedApiSuccess(await listCatalogServicesAll());
  } catch (error) {
    return apiFailure(error);
  }
}
