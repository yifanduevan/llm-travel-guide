import type { DiningReservation } from "../../components/TripWorkspace";
import {
  buildGoogleMapsSrc,
  formatDateTime,
  formatPartySize,
  getRestaurantKey,
  normalizeStatus,
  slugify,
  toDateTimeLocal,
  validateAddRestaurant,
  validateReservation,
} from "../dining";

describe("dining utils", () => {
  it("normalizes status values", () => {
    expect(normalizeStatus("CONFIRMED")).toBe("confirmed");
    expect(normalizeStatus("pending")).toBe("pending");
    expect(normalizeStatus(undefined)).toBe("pending");
  });

  it("formats and converts datetime values", () => {
    expect(formatDateTime(undefined)).toBe("TBD");
    expect(formatDateTime("not-a-date")).toBe("not-a-date");
    expect(formatDateTime("2026-04-10T19:00:00Z")).not.toBe("TBD");

    expect(toDateTimeLocal("")).toBe("");
    expect(toDateTimeLocal("invalid")).toBe("invalid");
    expect(toDateTimeLocal("2026-04-10T19:20:00")).toMatch(
      /^2026-04-10T19:20$/
    );
  });

  it("builds stable restaurant keys", () => {
    const withId: DiningReservation = {
      id: "r-1",
      name: "Le Gourmet",
      time: null,
      cuisine: "French",
      priceLevel: "HIGH",
      status: "confirmed",
      address: "Paris",
      notes: null,
      confirmationCode: null,
      partySize: 2,
      imageUrl: null,
    };

    const noId: DiningReservation = {
      ...withId,
      id: "",
      name: "Le Gourmet! Bistro",
      address: "123 Main St",
      time: "2026-04-10T19:00:00",
    };

    expect(getRestaurantKey(withId)).toBe("r-1");
    expect(slugify("Le Gourmet! Bistro")).toBe("le-gourmet-bistro");
    expect(getRestaurantKey(noId)).toBe(
      "le-gourmet-bistro-123-main-st-2026-04-10t19-00-00"
    );
  });

  it("formats party size and map embeds", () => {
    const restaurant: DiningReservation = {
      id: "r-2",
      name: "Sushi Zen",
      time: null,
      cuisine: "Japanese",
      priceLevel: "MEDIUM",
      status: "pending",
      address: "Tokyo",
      notes: null,
      confirmationCode: null,
      partySize: null,
      imageUrl: null,
    };

    expect(formatPartySize(undefined)).toBe("TBD");
    expect(formatPartySize(1)).toBe("1 guest");
    expect(formatPartySize(3)).toBe("3 guests");
    expect(buildGoogleMapsSrc(restaurant)).toBe("");
    expect(buildGoogleMapsSrc({ ...restaurant, address: null }, "api-key")).toBe("");
    expect(buildGoogleMapsSrc(restaurant, "api-key")).toContain(
      "https://www.google.com/maps/embed/v1/place?key=api-key&q="
    );
  });

  it("validates reservation and add-restaurant forms", () => {
    expect(
      validateReservation({
        name: "  ",
        partySize: 0,
        datetimeLocal: "",
      })
    ).toEqual({
      name: "Diner name is required.",
      partySize: "Party size must be at least 1.",
      datetimeLocal: "Select a reservation time.",
    });

    expect(
      validateReservation({
        name: "Taylor",
        partySize: 2,
        datetimeLocal: "2026-04-10T19:00",
      })
    ).toEqual({});

    expect(validateAddRestaurant({ name: "  ", partySize: 0 })).toEqual({
      name: "Restaurant name is required.",
    });
    expect(validateAddRestaurant({ name: "Bistro", partySize: -1 })).toEqual({
      partySize: "Party size must be at least 1.",
    });
    expect(validateAddRestaurant({ name: "Bistro", partySize: 2 })).toEqual({});
  });
});
