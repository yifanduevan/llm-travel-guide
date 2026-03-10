import type { ItineraryDay } from "@/features/trips/itineraryTypes";

type DayLabelParts = {
  prefix: string;
  title: string;
};

export function buildNextItineraryDay(
  days: ItineraryDay[],
  tripStartDate?: string | null,
): ItineraryDay {
  const referenceYear = getReferenceYear(tripStartDate);
  const lastDay = days[days.length - 1];
  const lastDayNumber = parseDayNumber(lastDay?.label);
  const nextDayNumber = (lastDayNumber ?? days.length) + 1;

  const baseDate = resolveBaseDate(days, tripStartDate, referenceYear);
  const nextDate = new Date(baseDate);
  if (days.length > 0) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return {
    label: `Day ${nextDayNumber}: New day`,
    date: formatDayDate(nextDate),
    active: false,
    items: [],
  };
}

export function splitDayLabel(
  label: string,
  fallbackDayNumber: number,
): DayLabelParts {
  const match = label.match(/^(Day\s+\d+\s*:\s*)(.*)$/i);
  if (match) {
    return {
      prefix: match[1],
      title: match[2] ?? "",
    };
  }

  return {
    prefix: `Day ${fallbackDayNumber}: `,
    title: label.trim(),
  };
}

function resolveBaseDate(
  days: ItineraryDay[],
  tripStartDate: string | null | undefined,
  referenceYear: number,
): Date {
  const lastDay = days[days.length - 1];
  const parsedLastDayDate = lastDay
    ? parseDayDateLabel(lastDay.date, referenceYear)
    : null;
  if (parsedLastDayDate) return parsedLastDayDate;

  if (tripStartDate) {
    const tripDate = new Date(tripStartDate);
    if (isValidDate(tripDate)) {
      return tripDate;
    }
  }

  return new Date();
}

function parseDayNumber(label?: string): number | null {
  if (!label) return null;
  const match = label.match(/Day\s+(\d+)/i);
  if (!match) return null;

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function parseDayDateLabel(label: string, fallbackYear: number): Date | null {
  const directDate = new Date(`${label}, ${fallbackYear}`);
  if (isValidDate(directDate)) {
    return directDate;
  }

  const dateMatch = label.trim().match(/^(?:[^,]+,\s*)?([A-Za-z]+)\s+(\d{1,2})$/);
  if (!dateMatch) return null;

  const monthName = dateMatch[1];
  const day = Number(dateMatch[2]);
  const monthProbe = new Date(`${monthName} 1, ${fallbackYear}`);
  if (!isValidDate(monthProbe) || Number.isNaN(day)) {
    return null;
  }

  const parsed = new Date(fallbackYear, monthProbe.getMonth(), day);
  return isValidDate(parsed) ? parsed : null;
}

function formatDayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getReferenceYear(tripStartDate?: string | null): number {
  if (tripStartDate) {
    const date = new Date(tripStartDate);
    if (isValidDate(date)) {
      return date.getFullYear();
    }
  }
  return new Date().getFullYear();
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}
