import { listCatalogServicesAll } from "@/features/services/services/service-service";
import { apiFailure, cachedApiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    return cachedApiSuccess(await listCatalogServicesAll(), request);
  } catch (error) {
    return apiFailure(error);
  }
}
