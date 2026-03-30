import { getTransportIconName, normalizeTransportMode } from "../iconMap";

describe("iconMap", () => {
  it("normalizes transport modes from variants and synonyms", () => {
    expect(normalizeTransportMode("flight")).toBe("FLIGHT");
    expect(normalizeTransportMode("airplane")).toBe("FLIGHT");
    expect(normalizeTransportMode("ferry")).toBe("SHIP");
    expect(normalizeTransportMode("driving")).toBe("CAR");
    expect(normalizeTransportMode("coach")).toBe("BUS");
    expect(normalizeTransportMode("rail")).toBe("TRAIN");
    expect(normalizeTransportMode("pedestrian")).toBe("WALKING");
    expect(normalizeTransportMode("something-unknown")).toBe("OTHERS");
    expect(normalizeTransportMode(undefined)).toBe("OTHERS");
  });

  it("returns the correct material icon name for each normalized mode", () => {
    expect(getTransportIconName("FLIGHT")).toBe("flight");
    expect(getTransportIconName("SHIP")).toBe("directions_boat");
    expect(getTransportIconName("CAR")).toBe("directions_car");
    expect(getTransportIconName("BUS")).toBe("directions_bus");
    expect(getTransportIconName("TRAIN")).toBe("train");
    expect(getTransportIconName("WALKING")).toBe("directions_walk");
    expect(getTransportIconName("unknown")).toBe("commute");
    expect(getTransportIconName(null)).toBe("commute");
  });
});
