import { buildNextItineraryDay, splitDayLabel } from "../dayUtils";
import {
  getDayDropZoneId,
  moveItemForDrag,
} from "../dragDropUtils";
import {
  formatPickerTimeToDisplay,
  formatTimePickerPartsToValue,
  parseDisplayTimeToPicker,
  parsePickerTimeToParts,
} from "../timeUtils";
import type { ClientItineraryDay, EmptyDayPlaceholder, ItineraryTimelineEntry } from "../types";

function makeItem(clientId: string, title: string) {
  return {
    clientId,
    icon: "event",
    title,
    time: "09:00",
    note: "",
  };
}

function makeDay(
  clientDayId: string,
  label: string,
  date: string,
  itemIds: string[],
): ClientItineraryDay {
  return {
    clientDayId,
    label,
    date,
    items: itemIds.map((itemId) => makeItem(itemId, itemId.toUpperCase())),
  };
}

function itemIdsFor(day: ItineraryTimelineEntry): string[] {
  if ("type" in day) {
    return [];
  }

  return day.items.map((item) => item.clientId);
}

describe("dragDropUtils.moveItemForDrag", () => {
  it("reorders items within the same day when dropped on a day drop zone", () => {
    const entries: ItineraryTimelineEntry[] = [
      makeDay("day-1", "Day 1: Plan", "Monday, Jun 10", ["a", "b", "c"]),
    ];

    const result = moveItemForDrag(entries, "a", getDayDropZoneId(0));

    expect(itemIdsFor(result[0])).toEqual(["b", "c", "a"]);
    expect(result).not.toBe(entries);
  });

  it("moves an item before the hovered item in the same day", () => {
    const entries: ItineraryTimelineEntry[] = [
      makeDay("day-1", "Day 1: Plan", "Monday, Jun 10", ["a", "b", "c"]),
    ];

    const result = moveItemForDrag(entries, "c", "a");

    expect(itemIdsFor(result[0])).toEqual(["c", "a", "b"]);
  });

  it("moves an item across days and keeps sequence in destination day", () => {
    const entries: ItineraryTimelineEntry[] = [
      makeDay("day-1", "Day 1: Plan", "Monday, Jun 10", ["a", "b"]),
      makeDay("day-2", "Day 2: Explore", "Tuesday, Jun 11", ["c"]),
    ];

    const result = moveItemForDrag(entries, "b", "c");

    expect(itemIdsFor(result[0])).toEqual(["a"]);
    expect(itemIdsFor(result[1])).toEqual(["b", "c"]);
  });

  it("creates a day from placeholder when dropping into an empty day", () => {
    const placeholder: EmptyDayPlaceholder = {
      clientDayId: "placeholder-2",
      type: "emptyDay",
      dayNumber: 2,
      date: "Tuesday, Jun 11",
    };

    const entries: ItineraryTimelineEntry[] = [
      makeDay("day-1", "Day 1: Plan", "Monday, Jun 10", ["a", "b"]),
      placeholder,
    ];

    const result = moveItemForDrag(entries, "a", getDayDropZoneId(1));

    expect(itemIdsFor(result[0])).toEqual(["b"]);
    expect("type" in result[1]).toBe(false);
    if ("type" in result[1]) {
      throw new Error("Expected placeholder to convert into a real day");
    }
    expect(result[1].label).toBe("Day 2: New day");
    expect(itemIdsFor(result[1])).toEqual(["a"]);
  });

  it("returns original entries when target is invalid", () => {
    const entries: ItineraryTimelineEntry[] = [
      makeDay("day-1", "Day 1: Plan", "Monday, Jun 10", ["a", "b", "c"]),
    ];

    const result = moveItemForDrag(entries, "a", "missing-target");

    expect(result).toBe(entries);
    expect(itemIdsFor(result[0])).toEqual(["a", "b", "c"]);
  });
});

describe("dayUtils", () => {
  it("builds next itinerary day by incrementing day number and date", () => {
    const days = [
      { label: "Day 1: Arrival", date: "Monday, Jun 10", active: false, items: [] },
      { label: "Day 2: Museum", date: "Tuesday, Jun 11", active: false, items: [] },
    ];

    const result = buildNextItineraryDay(days, "2024-06-10T12:00:00Z");

    expect(result.label).toBe("Day 3: New day");
    expect(result.date).toBe("Wednesday, Jun 12");
    expect(result.items).toEqual([]);
  });

  it("uses trip start date when creating the first day", () => {
    const result = buildNextItineraryDay([], "2024-08-20T12:00:00Z");

    expect(result.label).toBe("Day 1: New day");
    expect(result.date).toBe("Tuesday, Aug 20");
  });

  it("splits and normalizes day labels", () => {
    expect(splitDayLabel("Day 4: Food Tour", 9)).toEqual({
      prefix: "Day 4: ",
      title: "Food Tour",
    });

    expect(splitDayLabel("Arrival", 2)).toEqual({
      prefix: "Day 2: ",
      title: "Arrival",
    });
  });
});

describe("timeUtils", () => {
  it("parses 12-hour display time into 24-hour picker value", () => {
    expect(parseDisplayTimeToPicker("2:30 pm")).toBe("14:30");
  });

  it("formats picker value into 12-hour display time", () => {
    expect(formatPickerTimeToDisplay("00:05")).toBe("12:05 AM");
  });

  it("round-trips picker parts conversion", () => {
    const parts = parsePickerTimeToParts("14:05");

    expect(parts).toEqual({
      hour12: 2,
      minute: 5,
      meridiem: "PM",
    });
    expect(formatTimePickerPartsToValue(parts)).toBe("14:05");
  });

  it("returns empty value for invalid display input", () => {
    expect(parseDisplayTimeToPicker("25:88")).toBe("");
  });
});
