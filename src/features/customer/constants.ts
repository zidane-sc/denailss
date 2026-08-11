import type { CustomerProfile } from "./types";

/**
 * Minimal fallback profile used while the real profile loads from the API.
 * The live value comes from `/api/v1/customer/profile`.
 */
export const CUSTOMER_PROFILE_FALLBACK: CustomerProfile = {
  id: "cust-fallback",
  name: "",
  phone: "",
  email: "",
  notes: "",
};
