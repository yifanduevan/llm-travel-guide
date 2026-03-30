import { fireEvent, render, screen } from "@testing-library/react";
import ItineraryDaySection from "../ItineraryDaySection";

const mockUseDroppable = jest.fn();

jest.mock("@dnd-kit/core", () => ({
  useDroppable: (config: unknown) => mockUseDroppable(config),
}));

jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div>sortable-context{children}</div>
  ),
  verticalListSortingStrategy: "vertical",
}));

jest.mock("../SortableItineraryItemCard", () => ({
  __esModule: true,
  default: ({ id, onEdit, onDelete }: { id: string; onEdit: () => void; onDelete: () => void }) => (
    <div>
      <span>sortable-{id}</span>
      <button type="button" onClick={onEdit}>sortable-edit-{id}</button>
      <button type="button" onClick={onDelete}>sortable-delete-{id}</button>
    </div>
  ),
}));

jest.mock("../ItineraryItemCard", () => ({
  __esModule: true,
  default: ({ item, onEdit, onDelete }: { item: { clientId: string }; onEdit: () => void; onDelete: () => void }) => (
    <div>
      <span>plain-{item.clientId}</span>
      <button type="button" onClick={onEdit}>plain-edit-{item.clientId}</button>
      <button type="button" onClick={onDelete}>plain-delete-{item.clientId}</button>
    </div>
  ),
}));

describe("ItineraryDaySection", () => {
  const day = {
    clientDayId: "day-1",
    label: "Day 1: Arrival",
    date: "Friday, Apr 4",
    active: true,
    items: [
      {
        clientId: "item-1",
        icon: "flight",
        title: "Flight",
        time: "09:00 AM",
        note: "Direct",
      },
    ],
  };

  const baseHandlers = {
    onEditItem: jest.fn(),
    onDeleteItem: jest.fn(),
    onAddActivity: jest.fn(),
    onEditDayTitle: jest.fn(),
    onDeleteDay: jest.fn(),
    onDayTitleDraftChange: jest.fn(),
    onSaveDayTitle: jest.fn(),
    onCancelDayTitle: jest.fn(),
  };

  beforeEach(() => {
    mockUseDroppable.mockReset();
    Object.values(baseHandlers).forEach((fn) => fn.mockReset());
  });

  it("renders sortable branch and editable controls", () => {
    mockUseDroppable.mockReturnValue({ setNodeRef: jest.fn(), isOver: false });

    render(
      <ItineraryDaySection
        day={day}
        dayIndex={0}
        editable
        dragEnabled
        dropZoneId="day-drop-1"
        dayTitlePrefix="Day 1: "
        dayTitleDraft="Arrival"
        isEditingDayTitle={false}
        {...baseHandlers}
      />
    );

    expect(mockUseDroppable).toHaveBeenCalledWith({ id: "day-drop-1", disabled: false });
    expect(screen.getByText("sortable-item-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "sortable-edit-item-1" }));
    fireEvent.click(screen.getByRole("button", { name: "sortable-delete-item-1" }));
    fireEvent.click(screen.getByRole("button", { name: /add activity/i }));
    fireEvent.click(screen.getByRole("button", { name: "Edit day title" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete day" }));

    expect(baseHandlers.onEditItem).toHaveBeenCalledWith(0, 0, day.items[0]);
    expect(baseHandlers.onDeleteItem).toHaveBeenCalledWith(0, 0, "Flight");
    expect(baseHandlers.onAddActivity).toHaveBeenCalledWith(0);
    expect(baseHandlers.onEditDayTitle).toHaveBeenCalledWith(0);
    expect(baseHandlers.onDeleteDay).toHaveBeenCalledWith(0, "Day 1: Arrival");
  });

  it("shows drop hint for empty day when dragging over", () => {
    mockUseDroppable.mockReturnValue({ setNodeRef: jest.fn(), isOver: true });

    render(
      <ItineraryDaySection
        day={{ ...day, items: [] }}
        dayIndex={0}
        editable
        dragEnabled
        dropZoneId="day-drop-empty"
        dayTitlePrefix="Day 1: "
        dayTitleDraft="Arrival"
        isEditingDayTitle={false}
        {...baseHandlers}
      />
    );

    expect(screen.getByText("Drop activity here")).toBeInTheDocument();
  });

  it("renders plain items and inline title editor when drag is disabled", () => {
    mockUseDroppable.mockReturnValue({ setNodeRef: jest.fn(), isOver: false });

    render(
      <ItineraryDaySection
        day={day}
        dayIndex={1}
        editable
        dragEnabled={false}
        dropZoneId="day-drop-plain"
        dayTitlePrefix="Day 2: "
        dayTitleDraft="Food tour"
        isEditingDayTitle
        {...baseHandlers}
      />
    );

    expect(mockUseDroppable).toHaveBeenCalledWith({ id: "day-drop-plain", disabled: true });
    expect(screen.getByText("plain-item-1")).toBeInTheDocument();

    const titleInput = screen.getByDisplayValue("Food tour");
    fireEvent.change(titleInput, { target: { value: "Museums" } });
    fireEvent.keyDown(titleInput, { key: "Enter" });
    fireEvent.keyDown(titleInput, { key: "Escape" });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    fireEvent.click(screen.getByRole("button", { name: "plain-edit-item-1" }));
    fireEvent.click(screen.getByRole("button", { name: "plain-delete-item-1" }));

    expect(baseHandlers.onDayTitleDraftChange).toHaveBeenCalledWith("Museums");
    expect(baseHandlers.onSaveDayTitle).toHaveBeenCalled();
    expect(baseHandlers.onCancelDayTitle).toHaveBeenCalled();
    expect(baseHandlers.onEditItem).toHaveBeenCalledWith(1, 0, day.items[0]);
    expect(baseHandlers.onDeleteItem).toHaveBeenCalledWith(1, 0, "Flight");

    expect(screen.queryByRole("button", { name: "Edit day title" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete day" })).not.toBeInTheDocument();
  });
});
