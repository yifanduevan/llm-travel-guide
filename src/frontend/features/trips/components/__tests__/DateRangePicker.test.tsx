import { fireEvent, render, screen } from "@testing-library/react";
import DateRangePicker from "../DateRangePicker";

jest.mock("react-day-picker", () => ({
  DayPicker: ({
    onSelect,
    onMonthChange,
  }: {
    onSelect?: (range: { from?: Date; to?: Date } | undefined) => void;
    onMonthChange?: (date: Date) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onSelect?.({
            from: new Date(2026, 0, 2),
            to: new Date(2026, 0, 5),
          })
        }
      >
        pick-range
      </button>
      <button type="button" onClick={() => onSelect?.(undefined)}>
        clear-range
      </button>
      <button type="button" onClick={() => onMonthChange?.(new Date(2030, 3, 1))}>
        jump-month
      </button>
    </div>
  ),
}));

describe("DateRangePicker", () => {
  it("opens popover and applies selected range to parent", () => {
    const onChange = jest.fn();
    render(
      <DateRangePicker startDate={null} endDate={null} onChange={onChange} />
    );

    fireEvent.click(screen.getByTestId("date-range-trigger"));
    expect(screen.getByTestId("date-range-popover")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "pick-range" }));
    expect(onChange).toHaveBeenLastCalledWith("2026-01-02", "2026-01-05");
  });

  it("updates displayed months and clears selection", () => {
    const onChange = jest.fn();
    render(
      <DateRangePicker
        startDate="2026-01-02"
        endDate="2026-01-05"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTestId("date-range-trigger"));
    fireEvent.click(screen.getByRole("button", { name: "jump-month" }));
    expect(screen.getByText("April 2030 — May 2030")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith(null, null);
    expect(screen.queryByTestId("date-range-popover")).not.toBeInTheDocument();
  });
});
