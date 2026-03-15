import { fireEvent, render, screen } from "@testing-library/react";
import TabNavigation from "../TabNavigation";

describe("TabNavigation", () => {
  it("renders all navigation tabs and marks the current view", () => {
    const onViewChange = jest.fn();

    render(<TabNavigation currentView="itinerary" onViewChange={onViewChange} />);

    expect(screen.getByRole("button", { name: "Itinerary" })).toHaveClass("text-slate-900");
    expect(screen.getByRole("button", { name: "Dining" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Transportation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accommodation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Activities" })).toBeInTheDocument();
  });

  it("calls onViewChange when a different tab is clicked", () => {
    const onViewChange = jest.fn();

    render(<TabNavigation currentView="itinerary" onViewChange={onViewChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Dining" }));

    expect(onViewChange).toHaveBeenCalledWith("dining");
  });
});
