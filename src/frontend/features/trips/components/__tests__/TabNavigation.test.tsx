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
  });

  it("calls onViewChange when a different tab is clicked", () => {
    const onViewChange = jest.fn();

    render(<TabNavigation currentView="itinerary" onViewChange={onViewChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Dining" }));

    expect(onViewChange).toHaveBeenCalledWith("dining");
  });

  it("updates indicator on resize and disconnects ResizeObserver on unmount", () => {
    const observe = jest.fn();
    const disconnect = jest.fn();

    // Cover the ResizeObserver branch in TabNavigation.
    (global as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe = observe;
      disconnect = disconnect;
    };

    const { unmount } = render(
      <TabNavigation currentView="itinerary" onViewChange={jest.fn()} />
    );

    const container = screen
      .getByRole("button", { name: "Itinerary" })
      .parentElement as HTMLDivElement;
    const activeTab = screen.getByRole("button", { name: "Itinerary" });

    Object.defineProperty(container, "scrollLeft", { value: 5, configurable: true });
    container.getBoundingClientRect = jest.fn(() => ({
      left: 10,
      width: 320,
      top: 0,
      right: 330,
      bottom: 0,
      height: 0,
      x: 10,
      y: 0,
      toJSON: () => ({}),
    }));
    activeTab.getBoundingClientRect = jest.fn(() => ({
      left: 40,
      width: 100,
      top: 0,
      right: 140,
      bottom: 0,
      height: 0,
      x: 40,
      y: 0,
      toJSON: () => ({}),
    }));

    fireEvent(window, new Event("resize"));

    const indicator = container.querySelector("span.absolute") as HTMLElement;
    expect(indicator.style.left).toBe("35px");
    expect(indicator.style.width).toBe("100px");
    expect(observe).toHaveBeenCalled();

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
