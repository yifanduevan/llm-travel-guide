import { fireEvent, render, screen } from "@testing-library/react";
import { RestaurantDetailModal } from "../RestaurantDetailModal";

describe("RestaurantDetailModal", () => {
  const baseRestaurant = {
    id: "r1",
    name: "Sushi Zen",
    time: "2026-08-10T18:00",
    cuisine: "Japanese",
    priceLevel: "MEDIUM" as const,
    status: "confirmed",
    address: "Tokyo",
    notes: "Ask for omakase",
    confirmationCode: null,
    partySize: 2,
    imageUrl: null,
  };

  it("renders map iframe when key is provided", () => {
    const onClose = jest.fn();
    render(
      <RestaurantDetailModal
        restaurant={baseRestaurant}
        reservation={{
          restaurantId: "r1",
          name: "Chris",
          partySize: 4,
          datetimeLocal: "2026-08-10T19:00",
          confirmationCode: "ZXCV",
          notes: "birthday",
        }}
        googleMapsKey="demo-key"
        onClose={onClose}
      />
    );

    expect(screen.getByText("Sushi Zen")).toBeInTheDocument();
    expect(screen.getByText("Ask for omakase")).toBeInTheDocument();
    expect(screen.getByText("ZXCV")).toBeInTheDocument();
    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toContain("google.com/maps/embed");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows fallback when map key is missing and closes on overlay click", () => {
    const onClose = jest.fn();
    render(
      <RestaurantDetailModal
        restaurant={baseRestaurant}
        reservation={null}
        onClose={onClose}
      />
    );

    expect(screen.getByText("Map unavailable")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalled();
  });
});
