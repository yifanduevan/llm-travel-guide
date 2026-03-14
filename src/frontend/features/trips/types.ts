export type ViewName =
  | "itinerary"
  | "dining"
  | "transportation"
  | "accommodation";

export const NAV_ITEMS: { id: ViewName; label: string }[] = [
  { id: "itinerary", label: "Itinerary" },
  { id: "dining", label: "Dining" },
  { id: "transportation", label: "Transportation" },
  { id: "accommodation", label: "Accommodation" },
];
