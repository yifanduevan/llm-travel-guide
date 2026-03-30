import { fireEvent, render, screen } from "@testing-library/react";
import { ReservationViewModal } from "../ReservationViewModal";

describe("ReservationViewModal", () => {
  it("renders reservation details and closes via buttons/overlay", () => {
    const onClose = jest.fn();
    render(
      <ReservationViewModal
        restaurant={{
          id: "r1",
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
        }}
        reservation={{
          restaurantId: "r1",
          name: "Taylor",
          partySize: 2,
          datetimeLocal: "2026-08-10T18:30",
          confirmationCode: "ABC123",
          notes: "window seat",
        }}
        onClose={onClose}
      />
    );

    expect(screen.getByText("Reservation Summary")).toBeInTheDocument();
    expect(screen.getByText("Le Gourmet")).toBeInTheDocument();
    expect(screen.getByText("Taylor")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("window seat")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    const dialog = screen.getByRole("dialog");
    fireEvent.mouseDown(dialog);

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
