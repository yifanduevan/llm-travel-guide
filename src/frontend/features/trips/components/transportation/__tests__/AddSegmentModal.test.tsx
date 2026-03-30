import { fireEvent, render, screen } from "@testing-library/react";
import AddSegmentModal from "../AddSegmentModal";

let mockedTimes = ["2026-11-01T09:00", "2026-11-01T12:00"];

jest.mock("../../DateTimePicker", () => ({
  DateTimePicker: ({ onChange }: { onChange: (v: string) => void }) => (
    <button
      type="button"
      onClick={() => onChange(mockedTimes.shift() ?? "2026-11-01T12:00")}
    >
      pick-datetime
    </button>
  ),
}));

describe("AddSegmentModal", () => {
  beforeEach(() => {
    mockedTimes = ["2026-11-01T09:00", "2026-11-01T12:00"];
    jest.spyOn(global.crypto, "randomUUID").mockReturnValue("seg-uuid");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows required validation errors", () => {
    render(<AddSegmentModal onSave={jest.fn()} onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /save segment/i }));

    expect(screen.getByText("Departure location is required.")).toBeInTheDocument();
    expect(screen.getByText("Arrival location is required.")).toBeInTheDocument();
    expect(screen.getByText("Select departure date and time.")).toBeInTheDocument();
    expect(screen.getByText("Select arrival date and time.")).toBeInTheDocument();
    expect(
      screen.getByText("Confirmation code is required for flights.")
    ).toBeInTheDocument();
  });

  it("validates that arrival must be after departure", () => {
    mockedTimes = ["2026-11-01T12:00", "2026-11-01T10:00"];

    render(<AddSegmentModal onSave={jest.fn()} onClose={jest.fn()} />);

    const textboxes = screen.getAllByRole("textbox");
    fireEvent.change(textboxes[0], { target: { value: "Toronto" } });
    fireEvent.change(textboxes[1], { target: { value: "Montreal" } });
    fireEvent.change(textboxes[2], { target: { value: "AC777" } });

    const picks = screen.getAllByRole("button", { name: "pick-datetime" });
    fireEvent.click(picks[0]);
    fireEvent.click(picks[1]);

    fireEvent.click(screen.getByRole("button", { name: /save segment/i }));

    expect(screen.getByText("Arrival must be after departure.")).toBeInTheDocument();
  });

  it("saves walking segment with null ticket fields", () => {
    const onSave = jest.fn();

    render(<AddSegmentModal onSave={onSave} onClose={jest.fn()} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "WALKING" },
    });

    const textboxes = screen.getAllByRole("textbox");
    fireEvent.change(textboxes[0], { target: { value: "Station" } });
    fireEvent.change(textboxes[1], { target: { value: "Hotel" } });
    fireEvent.change(screen.getAllByRole("textbox")[2], {
      target: { value: "Bring umbrella" },
    });

    const picks = screen.getAllByRole("button", { name: "pick-datetime" });
    fireEvent.click(picks[0]);
    fireEvent.click(picks[1]);

    fireEvent.click(screen.getByRole("button", { name: /save segment/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "seg-uuid",
        mode: "WALKING",
        title: "Walking to Hotel",
        startLocation: "Station",
        endLocation: "Hotel",
        durationText: "3h",
        confirmationCode: null,
        ticketsUrl: null,
        ticketUrl: null,
        notes: "Bring umbrella",
      })
    );
  });
});
