import { fireEvent, render, screen } from "@testing-library/react";
import { DateTimePicker } from "../DateTimePicker";

describe("DateTimePicker", () => {
  const originalRaf = window.requestAnimationFrame;
  const originalCancelRaf = window.cancelAnimationFrame;

  beforeEach(() => {
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    };
    window.cancelAnimationFrame = () => undefined;
  });

  afterAll(() => {
    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCancelRaf;
  });

  it("opens picker, selects date/time, and confirms", () => {
    const onChange = jest.fn();
    const onClose = jest.fn();

    render(
      <DateTimePicker
        value=""
        onChange={onChange}
        tripStartDate="2026-01-10"
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /select date & time/i }));
    fireEvent.click(screen.getByRole("button", { name: "15" }));

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "14" } });
    fireEvent.change(selects[1], { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(onChange).toHaveBeenCalledWith("2026-01-15T14:30");
    expect(onClose).toHaveBeenCalled();
  });

  it("clears value and closes with escape", () => {
    const onChange = jest.fn();
    const onClose = jest.fn();

    render(
      <DateTimePicker
        value="2026-01-10T12:00"
        onChange={onChange}
        tripStartDate="2026-01-10"
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /2026/i }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith("");

    fireEvent.click(screen.getByRole("button", { name: /2026/i }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
