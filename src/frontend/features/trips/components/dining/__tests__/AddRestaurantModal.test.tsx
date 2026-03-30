import { fireEvent, render, screen } from "@testing-library/react";
import { AddRestaurantModal } from "../AddRestaurantModal";

jest.mock("../../DateTimePicker", () => ({
  DateTimePicker: ({ onChange }: { onChange: (v: string) => void }) => (
    <button type="button" onClick={() => onChange("2026-10-05T18:15")}>
      pick-reservation-time
    </button>
  ),
}));

describe("AddRestaurantModal", () => {
  beforeEach(() => {
    jest.spyOn(global.crypto, "randomUUID").mockReturnValue("uuid-123");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows restaurant validation error when required fields are missing", () => {
    render(
      <AddRestaurantModal
        tripId="trip-1"
        onSave={jest.fn()}
        onClose={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /save restaurant/i }));

    expect(screen.getByText("Restaurant name is required.")).toBeInTheDocument();
  });

  it("validates reservation fields when add reservation is enabled", () => {
    render(
      <AddRestaurantModal
        tripId="trip-1"
        onSave={jest.fn()}
        onClose={jest.fn()}
      />
    );

    const textInputs = screen.getAllByRole("textbox");
    fireEvent.change(textInputs[0], { target: { value: "Noma" } });

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /save restaurant/i }));

    expect(screen.getByText("Diner name is required.")).toBeInTheDocument();
    expect(screen.getByText("Select a reservation time.")).toBeInTheDocument();
  });

  it("saves restaurant and reservation payload when form is valid", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <AddRestaurantModal
        tripId="trip-99"
        tripStartDate="2026-10-01"
        onSave={onSave}
        onClose={onClose}
      />
    );

    const textInputs = screen.getAllByRole("textbox");
    fireEvent.change(textInputs[0], { target: { value: "Noma" } });
    fireEvent.change(textInputs[1], { target: { value: "Copenhagen" } });
    fireEvent.change(textInputs[2], { target: { value: "Nordic" } });
    fireEvent.change(textInputs[3], { target: { value: "https://img.test/noma.jpg" } });
    fireEvent.change(textInputs[4], { target: { value: "special request" } });

    fireEvent.click(screen.getByRole("button", { name: "high" }));
    fireEvent.click(screen.getByRole("checkbox"));

    const updatedTextInputs = screen.getAllByRole("textbox");
    fireEvent.change(updatedTextInputs[5], { target: { value: "Taylor" } });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "pick-reservation-time" }));
    fireEvent.change(updatedTextInputs[6], { target: { value: "CNF-900" } });
    fireEvent.change(updatedTextInputs[7], { target: { value: "birthday" } });

    fireEvent.click(screen.getByRole("button", { name: /save restaurant/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const [restaurant, reservation] = onSave.mock.calls[0];

    expect(restaurant).toEqual(
      expect.objectContaining({
        id: "trip-99-uuid-123",
        name: "Noma",
        address: "Copenhagen",
        cuisine: "Nordic",
        priceLevel: "HIGH",
        imageUrl: "https://img.test/noma.jpg",
        notes: "special request",
      })
    );
    expect(reservation).toEqual(
      expect.objectContaining({
        restaurantId: "trip-99-uuid-123",
        name: "Taylor",
        partySize: 4,
        datetimeLocal: "2026-10-05T18:15",
        confirmationCode: "CNF-900",
        notes: "birthday",
      })
    );
    expect(onClose).toHaveBeenCalled();
  });
});
