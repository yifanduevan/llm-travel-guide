import { fireEvent, render, screen } from "@testing-library/react";
import { RestaurantCard } from "../RestaurantCard";
import type { DiningReservation } from "../../TripWorkspace";

describe("RestaurantCard", () => {
  const restaurant: DiningReservation = {
    id: "rest-1",
    name: "Le Gourmet",
    time: "2026-09-10T18:00:00",
    cuisine: "French",
    priceLevel: "HIGH",
    status: "confirmed",
    address: "Paris",
    notes: "Try the tasting menu",
    confirmationCode: "R-123",
    partySize: 2,
    imageUrl: null,
  };

  it("renders fallback visual and allows add reservation flow", () => {
    const onOpenDetail = jest.fn();
    const onAddReservation = jest.fn();

    render(
      <RestaurantCard
        restaurant={restaurant}
        reservation={null}
        editable={false}
        onOpenDetail={onOpenDetail}
        onViewReservation={jest.fn()}
        onAddReservation={onAddReservation}
        onEditCard={jest.fn()}
        onDeleteReservation={jest.fn()}
      />
    );

    expect(screen.getByText("Le Gourmet")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("Try the tasting menu")).toBeInTheDocument();
    expect(screen.getByText(/confirmation: R-123/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add reservation/i }));
    expect(onAddReservation).toHaveBeenCalledWith(restaurant);
    expect(onOpenDetail).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Le Gourmet"));
    expect(onOpenDetail).toHaveBeenCalledWith("rest-1");
  });

  it("renders reservation actions and edit/delete callbacks in editable mode", () => {
    const onViewReservation = jest.fn();
    const onEditCard = jest.fn();
    const onDeleteReservation = jest.fn();
    const reservation = {
      restaurantId: "rest-1",
      name: "Taylor",
      partySize: 4,
      datetimeLocal: "2026-09-10T19:30",
      confirmationCode: "ABC999",
      notes: "Window table",
    };

    render(
      <RestaurantCard
        restaurant={{ ...restaurant, imageUrl: "https://example.com/img.jpg" }}
        reservation={reservation}
        editable
        onOpenDetail={jest.fn()}
        onViewReservation={onViewReservation}
        onAddReservation={jest.fn()}
        onEditCard={onEditCard}
        onDeleteReservation={onDeleteReservation}
      />
    );

    expect(screen.getByRole("img", { name: "Le Gourmet" })).toBeInTheDocument();
    expect(screen.getByText("Window table")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /view reservation/i }));
    expect(onViewReservation).toHaveBeenCalledWith(
      expect.objectContaining({ id: "rest-1" }),
      reservation
    );

    fireEvent.click(screen.getByRole("button", { name: /edit reservation/i }));
    expect(onEditCard).toHaveBeenCalledWith(
      expect.objectContaining({ id: "rest-1" }),
      reservation
    );

    fireEvent.click(screen.getByRole("button", { name: /delete reservation/i }));
    expect(onDeleteReservation).toHaveBeenCalledWith(
      expect.objectContaining({ id: "rest-1" })
    );
  });
});
