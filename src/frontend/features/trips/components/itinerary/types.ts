import type { ItineraryItem } from "@/features/trips/itineraryTypes";

export type EditingItemTarget = {
  dayIndex: number;
  itemIndex: number;
};

export type EditingItemForm = {
  title: string;
  time: string;
  note: string;
};

export type EditableItineraryItem = Pick<ItineraryItem, "title" | "time" | "note">;

export type ClientItineraryItem = ItineraryItem & {
  clientId: string;
};

export type ClientItineraryDay = {
  label: string;
  date: string;
  active?: boolean;
  items: ClientItineraryItem[];
};

export type EmptyDayPlaceholder = {
  type: "emptyDay";
  dayNumber: number;
  date: string;
};

export type ItineraryTimelineEntry = ClientItineraryDay | EmptyDayPlaceholder;
