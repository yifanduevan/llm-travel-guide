import { render, screen } from "@testing-library/react";
import SortableItineraryItemCard from "../SortableItineraryItemCard";

const mockUseSortable = jest.fn();

jest.mock("@dnd-kit/sortable", () => ({
  useSortable: (config: unknown) => mockUseSortable(config),
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => "translate3d(10px, 20px, 0)"),
    },
  },
}));

jest.mock("../ItineraryItemCard", () => ({
  __esModule: true,
  default: ({ dragEnabled }: { dragEnabled: boolean }) => (
    <div>card-drag-enabled-{String(dragEnabled)}</div>
  ),
}));

describe("SortableItineraryItemCard", () => {
  const item = {
    clientId: "item-1",
    icon: "flight",
    title: "Flight",
    time: "09:00",
    note: "Direct",
  };

  beforeEach(() => {
    mockUseSortable.mockReset();
  });

  it("disables sortable behavior when not editable", () => {
    const setNodeRef = jest.fn();
    mockUseSortable.mockReturnValue({
      attributes: { "data-attr": "a" },
      listeners: { onPointerDown: jest.fn() },
      setNodeRef,
      transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
      transition: "transform 200ms",
      isDragging: false,
    });

    const { container } = render(
      <SortableItineraryItemCard
        id="sort-1"
        item={item}
        editable={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(mockUseSortable).toHaveBeenCalledWith({ id: "sort-1", disabled: true });
    expect(screen.getByText("card-drag-enabled-false")).toBeInTheDocument();

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toBe("");
    expect(wrapper.style.transform).toContain("translate3d");
    expect(wrapper.style.transition).toBe("transform 200ms");
  });

  it("applies dragging class and enables drag when editable", () => {
    mockUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: undefined,
      isDragging: true,
    });

    const { container } = render(
      <SortableItineraryItemCard
        id="sort-2"
        item={item}
        editable
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(mockUseSortable).toHaveBeenCalledWith({ id: "sort-2", disabled: false });
    expect(screen.getByText("card-drag-enabled-true")).toBeInTheDocument();

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toBe("opacity-0");
  });
});
