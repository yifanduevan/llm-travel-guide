import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import ItineraryTimePicker from "../ItineraryTimePicker";

describe("ItineraryTimePicker", () => {
  it("updates time selection and closes with done", () => {
    const onChangeSpy = jest.fn();

    function Harness() {
      const [value, setValue] = useState("09:00");
      return (
        <ItineraryTimePicker
          value={value}
          onChange={(next) => {
            setValue(next);
            onChangeSpy(next);
          }}
        />
      );
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /09:00 am/i }));
    fireEvent.click(screen.getByRole("button", { name: "03" }));
    fireEvent.click(screen.getByRole("button", { name: "15" }));
    fireEvent.click(screen.getByRole("button", { name: "PM" }));

    expect(onChangeSpy).toHaveBeenCalledWith("03:00");
    expect(onChangeSpy).toHaveBeenCalledWith("03:15");
    expect(onChangeSpy).toHaveBeenCalledWith("15:15");

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByText("Hour")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /03:15 pm/i })).toBeInTheDocument();
  });

  it("closes when clicking outside", () => {
    render(<ItineraryTimePicker value="" onChange={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /select time/i }));
    expect(screen.getByText("Hour")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Hour")).not.toBeInTheDocument();
  });
});
