/**
 * Unified transport icon mapping for frontend rendering.
 * The backend/mock should only provide semantic transport mode/type strings.
 * This module handles normalization and icon rendering decisions.
 */

export type TransportMode =
  | "FLIGHT"
  | "SHIP"
  | "CAR"
  | "BUS"
  | "TRAIN"
  | "WALKING"
  | "OTHERS";

/**
 * Normalize transport mode string from various sources (lowercase, synonyms, etc.)
 * @param input - Raw mode/type string from API or mock
 * @returns Normalized TransportMode constant
 */
export function normalizeTransportMode(
  input: string | undefined | null
): TransportMode {
  if (!input) return "OTHERS";

  const normalized = input.toUpperCase().trim();

  // Map common synonyms and variations
  switch (normalized) {
    case "FLIGHT":
    case "AIRPLANE":
    case "AIR":
      return "FLIGHT";

    case "SHIP":
    case "FERRY":
    case "BOAT":
    case "CRUISE":
      return "SHIP";

    case "CAR":
    case "AUTOMOBILE":
    case "DRIVING":
    case "RENTAL":
      return "CAR";

    case "BUS":
    case "COACH":
    case "SHUTTLE":
      return "BUS";

    case "TRAIN":
    case "RAIL":
      return "TRAIN";

    case "WALK":
    case "WALKING":
    case "PEDESTRIAN":
      return "WALKING";
    case "OTHER":
    case "OTHERS":
      return "OTHERS";

    default:
      return "OTHERS";
  }
}

/**
 * Get Material Symbols icon name for a transport mode.
 * Do NOT use data-provided icon fields; always derive from semantic mode.
 * @param mode - Transport mode (e.g., "FLIGHT", "flight", "airplane")
 * @returns Material Symbols icon name
 */
export function getTransportIconName(mode: string | undefined | null): string {
  const normalized = normalizeTransportMode(mode);

  switch (normalized) {
    case "FLIGHT":
      return "flight";
    case "SHIP":
      return "directions_boat";
    case "CAR":
      return "directions_car";
    case "BUS":
      return "directions_bus";
    case "TRAIN":
      return "train";
    case "WALKING":
      return "directions_walk";
    case "OTHERS":
    default:
      return "commute";
  }
}
