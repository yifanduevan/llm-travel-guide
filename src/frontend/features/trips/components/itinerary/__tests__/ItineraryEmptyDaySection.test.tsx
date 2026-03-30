import { fireEvent, render, screen } from "@testing-library/react";
import ItineraryEmptyDaySection from "../ItineraryEmptyDaySection";

const mockUseDroppable = jest.fn();

jest.mock("@dnd-kit/core", () => ({
  useDroppable: (config: unknown) => mockUseDroppable(config),
}));

describe("ItineraryEmptyDaySection", () => {
  const entry = {
    clientDayId: "empty-2",
    type: "emptyDay" as const,
    dayNumber: 2,
    date: "Tuesday, Nov 3",
  };

  beforeEach(() => {
    mockUseDroppable.mockReset();
  });

  it("shows drop hint and add button when editable", () => {
    const onAddDay = jest.fn();
    mockUseDroppable.mockReturnValue({ setNodeRef: jest.fn(), isOver: true });

    render(
      <ItineraryEmptyDaySection
        entry={entry}
        dayIndex={1}
        editable
        dropZoneId="day-drop-2"
        onAddDay={onAddDay}
      />
    );

    expect(screen.getByText("Drop activity here")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /add day 2/i }));
    expect(onAddDay).toHaveBeenCalledWith(1);
    expect(mockUseDroppable).toHaveBeenCalledWith({
      id: "day-drop-2",
      disabled: false,
    });
  });

  it("hides add controls when not editable", () => {
    mockUseDroppable.mockReturnValue({ setNodeRef: jest.fn(), isOver: false });

    render(
      <ItineraryEmptyDaySection
        entry={entry}
        dayIndex={1}
        editable={false}
        dropZoneId="day-drop-2"
        onAddDay={jest.fn()}
      />
    );

    expect(screen.queryByText("Drop activity here")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add day/i })).not.toBeInTheDocument();
    expect(mockUseDroppable).toHaveBeenCalledWith({
      id: "day-drop-2",
      disabled: true,
    });
  });
});
