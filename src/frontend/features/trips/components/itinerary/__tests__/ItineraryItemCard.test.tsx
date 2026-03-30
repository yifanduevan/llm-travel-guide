import { fireEvent, render, screen } from "@testing-library/react";
import ItineraryItemCard from "../ItineraryItemCard";

describe("ItineraryItemCard", () => {
  const item = {
    icon: "flight",
    title: "Flight to Tokyo",
    time: "09:00 AM",
    note: "Direct flight",
    image: "https://example.com/flight.jpg",
    muted: true,
  };

  it("renders complete card state and action buttons", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    const { container } = render(
      <ItineraryItemCard
        item={item}
        editable
        onEdit={onEdit}
        onDelete={onDelete}
        dragEnabled
        isDragging
        className="custom-class"
      />
    );

    expect(screen.getByText("Flight to Tokyo")).toBeInTheDocument();
    expect(screen.getByText("Direct flight")).toBeInTheDocument();
    expect(screen.getByText("09:00 AM")).toBeInTheDocument();
    expect(screen.getByAltText("Flight to Tokyo")).toBeInTheDocument();

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("opacity-70");
    expect(wrapper.className).toContain("cursor-grab");
    expect(wrapper.className).toContain("opacity-90");
    expect(wrapper.className).toContain("custom-class");

    fireEvent.click(screen.getByRole("button", { name: "Edit item" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete item" }));

    expect(onEdit).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });

  it("hides action buttons when not editable", () => {
    render(
      <ItineraryItemCard
        item={{ ...item, image: undefined, muted: false }}
        editable={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: "Edit item" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete item" })).not.toBeInTheDocument();
  });
});
