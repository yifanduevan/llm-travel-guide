export type TimePickerMeridiem = "AM" | "PM";

export type TimePickerParts = {
  hour12: number;
  minute: number;
  meridiem: TimePickerMeridiem;
};

export const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
export const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) => index * 5);

export function parseDisplayTimeToPicker(displayTime: string): string {
  const value = displayTime.trim();
  if (!value) return "";

  const twelveHourMatch = value.match(
    /^(\d{1,2}):(\d{2})\s*([AaPp])\.?\s*[Mm]\.?$/,
  );
  if (twelveHourMatch) {
    const hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const meridiem = twelveHourMatch[3].toUpperCase();

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      return "";
    }

    let hour24 = hour % 12;
    if (meridiem === "P") {
      hour24 += 12;
    }

    return `${hour24.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  }

  const twentyFourHourMatch = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (twentyFourHourMatch) {
    return `${twentyFourHourMatch[1].padStart(2, "0")}:${twentyFourHourMatch[2]}`;
  }

  return "";
}

export function formatPickerTimeToDisplay(pickerTime: string): string {
  const value = pickerTime.trim();
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return "";

  const hour24 = Number(match[1]);
  const minute = match[2];
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return `${hour12.toString().padStart(2, "0")}:${minute} ${meridiem}`;
}

export function parsePickerTimeToParts(pickerTime: string): TimePickerParts {
  const match = pickerTime.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return {
      hour12: 9,
      minute: 0,
      meridiem: "AM",
    };
  }

  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  return {
    hour12: hour24 % 12 || 12,
    minute,
    meridiem: hour24 >= 12 ? "PM" : "AM",
  };
}

export function formatTimePickerPartsToValue(parts: TimePickerParts): string {
  let hour24 = parts.hour12 % 12;
  if (parts.meridiem === "PM") {
    hour24 += 12;
  }

  return `${hour24.toString().padStart(2, "0")}:${parts.minute
    .toString()
    .padStart(2, "0")}`;
}
