import type { DiningReservation } from "../components/TripWorkspace";

export function normalizeStatus(status?: string | null): "confirmed" | "pending" {
  return status?.toLowerCase() === "confirmed" ? "confirmed" : "pending";
}

export function formatTime(value: string | null): string {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function formatReservedTime(value: string): string {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function toDateTimeLocal(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (input: number) => input.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function slugify(value: string | null): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getRestaurantKey(restaurant: DiningReservation): string {
  if (restaurant.id) return restaurant.id;
  const fallback = slugify(
    `${restaurant.name}-${restaurant.address ?? ""}-${restaurant.time ?? ""}`
  );
  return fallback || restaurant.name;
}

export function buildGoogleMapsSrc(
  restaurant: DiningReservation,
  apiKey?: string
): string {
  if (!apiKey || !restaurant.address) return "";
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
    `${restaurant.name}, ${restaurant.address}`,
  )}`;
}

export function validateReservation(reservation: {
  name: string;
  partySize: number;
  datetimeLocal: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!reservation.name.trim()) {
    errors.name = "Diner name is required.";
  }
  if (!Number.isFinite(reservation.partySize) || reservation.partySize < 1) {
    errors.partySize = "Party size must be at least 1.";
  }
  if (!reservation.datetimeLocal) {
    errors.datetimeLocal = "Select a reservation time.";
  }
  return errors;
}

export function validateAddRestaurant(form: {
  name: string;
  partySize?: number;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) {
    errors.name = "Restaurant name is required.";
  }
  if (form.partySize && form.partySize < 1) {
    errors.partySize = "Party size must be at least 1.";
  }
  return errors;
}
