import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  DiningReservationEditModal,
  type DiningReservationEditForm,
} from "../DiningReservationEditModal";

jest.mock("../../OverlayModal", () => ({
  __esModule: true,
  default: ({
    open,
    title,
    description,
    footer,
    children,
  }: {
    open: boolean;
    title: string;
    description: string;
    footer: ReactNode;
    children: ReactNode;
  }) =>
    open ? (
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
}));

jest.mock("../../DateTimePicker", () => ({
  DateTimePicker: ({ onChange }: { onChange: (value: string) => void }) => (
    <button type="button" onClick={() => onChange("2026-11-12T20:45")}>
      pick-reservation-time
    </button>
  ),
}));

describe("DiningReservationEditModal", () => {
  const baseForm: DiningReservationEditForm = {
    name: "Sushi Zen",
    address: "Tokyo",
    cuisine: "Japanese",
    priceLevel: "MEDIUM",
    notes: "ask for quiet table",
    reservationName: "Taylor",
    reservationPartySize: 2,
    reservationTime: "2026-11-12T19:00",
    reservationCode: "ABC",
    reservationNotes: "birthday",
  };

  it("renders closed state when open is false", () => {
    render(
      <DiningReservationEditModal
        open={false}
        form={baseForm}
        onFormChange={jest.fn()}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );

    expect(screen.queryByText("Edit dining reservation")).not.toBeInTheDocument();
  });

  it("handles form edits, price level change, and action buttons", () => {
    const onFormChange = jest.fn();
    const onClose = jest.fn();
    const onSave = jest.fn();

    render(
      <DiningReservationEditModal
        open
        tripStartDate="2026-11-10"
        form={baseForm}
        formError="Validation failed"
        onFormChange={onFormChange}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(screen.getByText("Edit dining reservation")).toBeInTheDocument();
    expect(screen.getByText("Validation failed")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("Sushi Zen"), {
      target: { value: "Sushi Renamed" },
    });
    fireEvent.click(screen.getByRole("button", { name: "high" }));
    fireEvent.change(screen.getByDisplayValue("2"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "pick-reservation-time" }));

    expect(onFormChange).toHaveBeenCalled();
    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Sushi Renamed",
      })
    );
    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        priceLevel: "HIGH",
      })
    );
    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        reservationPartySize: 5,
      })
    );
    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        reservationTime: "2026-11-12T20:45",
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClose).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });
});
