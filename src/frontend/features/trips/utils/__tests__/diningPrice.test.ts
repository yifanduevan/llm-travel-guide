import { toBackendPriceTier, toPriceLevel } from "../diningPrice";

describe("diningPrice utils", () => {
  it("normalizes supported values to price levels", () => {
    expect(toPriceLevel("LOW")).toBe("LOW");
    expect(toPriceLevel("tier_2")).toBe("MEDIUM");
    expect(toPriceLevel("$$$")).toBe("HIGH");
    expect(toPriceLevel(" $ ")).toBe("LOW");
  });

  it("returns null for missing or unknown values", () => {
    expect(toPriceLevel(undefined)).toBeNull();
    expect(toPriceLevel(null)).toBeNull();
    expect(toPriceLevel("premium")).toBeNull();
  });

  it("maps ui price levels to backend tiers", () => {
    expect(toBackendPriceTier("LOW")).toBe("TIER_1");
    expect(toBackendPriceTier("MEDIUM")).toBe("TIER_2");
    expect(toBackendPriceTier("HIGH")).toBe("TIER_3");
    expect(toBackendPriceTier(null)).toBeUndefined();
    expect(toBackendPriceTier(undefined)).toBeUndefined();
  });
});
