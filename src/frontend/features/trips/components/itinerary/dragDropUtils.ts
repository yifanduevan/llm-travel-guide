import type { ItineraryDay, ItineraryItem } from "@/features/trips/itineraryTypes";
import type {
  ClientItineraryDay,
  ClientItineraryItem,
  EmptyDayPlaceholder,
  ItineraryTimelineEntry,
} from "./types";

const DAY_DROP_ZONE_PREFIX = "itinerary-day-drop-zone-";
let nextClientItemId = 1;

type ItemLocation = {
  dayIndex: number;
  itemIndex: number;
  item: ClientItineraryItem;
};

function createClientItemId(): string {
  const id = nextClientItemId;
  nextClientItemId += 1;
  return `itinerary-item-${id}`;
}

export function withClientItemId(item: ItineraryItem): ClientItineraryItem {
  return {
    ...item,
    clientId: createClientItemId(),
  };
}

export function toClientDay(day: ItineraryDay): ClientItineraryDay {
  return {
    ...day,
    items: day.items.map((item) => withClientItemId(item)),
  };
}

export function hydrateTimelineDays(days: ItineraryDay[]): ItineraryTimelineEntry[] {
  return days.map((day) => toClientDay(day));
}

export function isEmptyDayPlaceholder(
  entry: ItineraryTimelineEntry,
): entry is EmptyDayPlaceholder {
  return "type" in entry && entry.type === "emptyDay";
}

export function toBuildableDay(entry: ItineraryTimelineEntry): ItineraryDay {
  if (isEmptyDayPlaceholder(entry)) {
    return {
      label: `Day ${entry.dayNumber}: Placeholder`,
      date: entry.date,
      active: false,
      items: [],
    };
  }

  return {
    ...entry,
    items: entry.items.map((item) => ({
      icon: item.icon,
      title: item.title,
      time: item.time,
      note: item.note,
      image: item.image,
      muted: item.muted,
    })),
  };
}

export function createDayFromPlaceholder(
  placeholder: EmptyDayPlaceholder,
): ClientItineraryDay {
  return {
    label: `Day ${placeholder.dayNumber}: New day`,
    date: placeholder.date,
    active: false,
    items: [],
  };
}

export function getDayDropZoneId(dayIndex: number): string {
  return `${DAY_DROP_ZONE_PREFIX}${dayIndex}`;
}

function getDayIndexFromDropZoneId(id: string): number | null {
  if (!id.startsWith(DAY_DROP_ZONE_PREFIX)) {
    return null;
  }

  const parsed = Number(id.slice(DAY_DROP_ZONE_PREFIX.length));
  return Number.isInteger(parsed) ? parsed : null;
}

function findItemLocation(
  entries: ItineraryTimelineEntry[],
  itemId: string,
): ItemLocation | null {
  for (let dayIndex = 0; dayIndex < entries.length; dayIndex += 1) {
    const entry = entries[dayIndex];
    if (isEmptyDayPlaceholder(entry)) {
      continue;
    }

    const itemIndex = entry.items.findIndex((item) => item.clientId === itemId);
    if (itemIndex !== -1) {
      return {
        dayIndex,
        itemIndex,
        item: entry.items[itemIndex],
      };
    }
  }

  return null;
}

function findDropTarget(
  entries: ItineraryTimelineEntry[],
  overId: string,
): { dayIndex: number; itemIndex: number } | null {
  const overDayIndex = getDayIndexFromDropZoneId(overId);
  if (overDayIndex !== null) {
    const overDay = entries[overDayIndex];
    if (!overDay) {
      return null;
    }

    if (isEmptyDayPlaceholder(overDay)) {
      return { dayIndex: overDayIndex, itemIndex: 0 };
    }

    return { dayIndex: overDayIndex, itemIndex: overDay.items.length };
  }

  const overItemLocation = findItemLocation(entries, overId);
  if (!overItemLocation) {
    return null;
  }

  return {
    dayIndex: overItemLocation.dayIndex,
    itemIndex: overItemLocation.itemIndex,
  };
}

function cloneTimeline(entries: ItineraryTimelineEntry[]): ItineraryTimelineEntry[] {
  return entries.map((entry) =>
    isEmptyDayPlaceholder(entry) ? { ...entry } : { ...entry, items: [...entry.items] },
  );
}

export function moveItemForDrag(
  entries: ItineraryTimelineEntry[],
  activeItemId: string,
  overId: string,
): ItineraryTimelineEntry[] {
  if (activeItemId === overId) {
    return entries;
  }

  const source = findItemLocation(entries, activeItemId);
  const target = findDropTarget(entries, overId);

  if (!source || !target) {
    return entries;
  }

  let insertIndex = target.itemIndex;
  if (source.dayIndex === target.dayIndex && source.itemIndex < insertIndex) {
    insertIndex -= 1;
  }

  if (source.dayIndex === target.dayIndex && source.itemIndex === insertIndex) {
    return entries;
  }

  const next = cloneTimeline(entries);
  const sourceEntry = next[source.dayIndex];
  if (!sourceEntry || isEmptyDayPlaceholder(sourceEntry)) {
    return entries;
  }

  const [movedItem] = sourceEntry.items.splice(source.itemIndex, 1);
  if (!movedItem) {
    return entries;
  }

  const targetEntry = next[target.dayIndex];
  if (!targetEntry) {
    return entries;
  }

  if (isEmptyDayPlaceholder(targetEntry)) {
    next[target.dayIndex] = createDayFromPlaceholder(targetEntry);
  }

  const destinationEntry = next[target.dayIndex];
  if (!destinationEntry || isEmptyDayPlaceholder(destinationEntry)) {
    return entries;
  }

  const boundedIndex = Math.max(0, Math.min(insertIndex, destinationEntry.items.length));
  destinationEntry.items.splice(boundedIndex, 0, movedItem);

  return next;
}

export function findItemById(
  entries: ItineraryTimelineEntry[],
  itemId: string,
): ClientItineraryItem | null {
  const location = findItemLocation(entries, itemId);
  return location?.item ?? null;
}
