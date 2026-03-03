export type PriceLevel = "LOW" | "MEDIUM" | "HIGH";

export type BackendPriceTier = "TIER_1" | "TIER_2" | "TIER_3";

export function toPriceLevel(value?: string | null): PriceLevel | null {
  if (!value) return null;

  const normalized = value.trim().toUpperCase();

  if (normalized === "LOW" || normalized === "TIER_1" || normalized === "$") {
    return "LOW";
  }
  if (normalized === "MEDIUM" || normalized === "TIER_2" || normalized === "$$") {
    return "MEDIUM";
  }
  if (normalized === "HIGH" || normalized === "TIER_3" || normalized === "$$$") {
    return "HIGH";
  }

  return null;
}

export function toBackendPriceTier(
  level?: PriceLevel | null,
): BackendPriceTier | undefined {
  if (level === "LOW") return "TIER_1";
  if (level === "MEDIUM") return "TIER_2";
  if (level === "HIGH") return "TIER_3";
  return undefined;
}
