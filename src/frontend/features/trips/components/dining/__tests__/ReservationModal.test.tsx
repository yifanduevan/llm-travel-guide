import { fireEvent, render, screen } from "@testing-library/react";
import { ReservationModal } from "../ReservationModal";

jest.mock("../../DateTimePicker", () => ({
  DateTimePicker: ({ onChange }: { onChange: (v: string) => void }) => (
    <button type="button" onClick={() => onChange("2026-10-05T18:15")}>
      pick-datetime
    </button>
  ),
}));

describe("ReservationModal", () => {
  const restaurant = {
    id: "rest-1",
    name: "Sushi Zen",
    time: null,
    cuisine: "Japanese",
    priceLevel: "MEDIUM" as const,
    status: "pending",
    address: "Tokyo",
    notes: null,
    confirmationCode: null,
    partySize: 2,
    imageUrl: null,
  };

  it("shows validation errors when required fields are missing", () => {
    render(
      <ReservationModal
        restaurant={restaurant}
        initialReservation={null}
        onSave={jest.fn()}
        onClose={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /save reservation/i }));

    expect(screen.getByText("Diner name is required.")).toBeInTheDocument();
    expect(screen.getByText("Select a reservation time.")).toBeInTheDocument();
  });

  it("saves valid reservation and closes", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ReservationModal
        restaurant={restaurant}
        initialReservation={null}
        tripStartDate="2026-10-01"
        onSave={onSave}
        onClose={onClose}
      />
    );

    const textboxes = screen.getAllByRole("textbox");
    fireEvent.change(textboxes[0], {
      target: { value: "Alex" },
    });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "pick-datetime" }));
    fireEvent.change(textboxes[1], {
      target: { value: "CNF-77" },
    });
    fireEvent.change(textboxes[2], {
      target: { value: "Birthday dinner" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save reservation/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        restaurantId: "rest-1",
        name: "Alex",
        partySize: 3,
        datetimeLocal: "2026-10-05T18:15",
        confirmationCode: "CNF-77",
        notes: "Birthday dinner",
      })
    );
    expect(onClose).toHaveBeenCalled();
  });
});
